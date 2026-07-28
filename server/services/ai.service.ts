import { subjectContentSchema, type SubjectContent } from '../schemas/generate.schema.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompts/generate.prompt.js';
import { getEnv } from '../utils/env.js';

const GO_API_BASE = 'https://opencode.ai/zen/go/v1';
const TIMEOUT_MS = 120_000;

export type GenerateResult =
  | { success: true; data: SubjectContent }
  | { success: false; error: string; errorCode: string };

function parseAiJson(raw: string): unknown {
  const cleaned = raw.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    if (inner.startsWith('{')) {
      try { return JSON.parse(inner); } catch { /* fall through to boundary extraction */ }
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No JSON object found in response');
  }
  try {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('end of file') || msg.includes('Unexpected end of JSON')) {
      throw new Error('AI response was truncated — try shorter notes or regenerate.');
    }
    throw e;
  }
}

export async function generateStudyContent(notes: string): Promise<GenerateResult> {
  const env = getEnv();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${GO_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENCODE_GO_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.GO_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(notes) },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error(`[ai] upstream error ${response.status}:`, errorBody.slice(0, 300));
      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate limit reached. Please wait a moment and try again.',
          errorCode: 'rate_limit',
        };
      }
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'AI service authentication failed. Check your API key.',
          errorCode: 'auth',
        };
      }
      if (response.status >= 500) {
        return {
          success: false,
          error: 'AI service is temporarily unavailable. Please try again.',
          errorCode: 'network',
        };
      }
      return {
        success: false,
        error: `AI service returned unexpected status ${response.status}.`,
        errorCode: 'network',
      };
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      console.error('[ai] empty response — choices:', JSON.stringify(json.choices?.length));
      return {
        success: false,
        error: 'AI returned an empty response. Try rephrasing your notes.',
        errorCode: 'empty',
      };
    }

    let parsed: unknown;
    try {
      parsed = parseAiJson(content);
    } catch (parseErr) {
      console.error('[ai] raw response (first 600 chars):', content.slice(0, 600));
      console.error('[ai] parse error:', parseErr instanceof Error ? parseErr.message : String(parseErr));
      const isTruncated = parseErr instanceof Error && parseErr.message.includes('truncated');
      return {
        success: false,
        error: isTruncated
          ? 'AI response was cut off due to length. Try shorter notes or regenerate.'
          : 'AI returned invalid JSON. The model may have been confused by the input. Please try again.',
        errorCode: isTruncated ? 'empty' : 'json',
      };
    }

    const validated = subjectContentSchema.safeParse(parsed);
    if (!validated.success) {
      const shape = parsed && typeof parsed === 'object' ? Object.keys(parsed as object) : typeof parsed;
      console.error('[ai] schema validation failed:', validated.error.issues);
      console.error('[ai] parsed object keys:', shape);
      return {
        success: false,
        error:
          'AI response was missing required fields or had the wrong shape. Try again with more detailed notes.',
        errorCode: 'validation',
      };
    }

    return { success: true, data: validated.data };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        success: false,
        error: 'Generation timed out. Try with shorter notes.',
        errorCode: 'timeout',
      };
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ai] fetch error:', message, '| model:', env.GO_MODEL);
    return {
      success: false,
      error: 'Could not reach the AI service. Check your connection.',
      errorCode: 'network',
    };
  } finally {
    clearTimeout(timeout);
  }
}
