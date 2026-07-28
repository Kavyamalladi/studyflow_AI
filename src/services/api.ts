import { API_BASE_URL } from '@/constants';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const json = (await response.json()) as { error?: string; message?: string };
    return json.error ?? json.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.method && init.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await parseErrorBody(response);
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export interface GenerateResponse {
  success: boolean;
  data?: {
    name: string;
    category: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedMinutes: number;
    learningObjectives: string[];
    flashcards: Array<{ id: string; question: string; answer: string; tag: string }>;
    quizQuestions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
    summarySections: Array<{ title: string; content: string; keyTakeaway: string }>;
    mnemonics: Array<{
      title: string;
      acronymOrPhrase: string;
      breakdown: string[];
      explanation: string;
    }>;
  };
  error?: string;
}

const GENERATE_TIMEOUT_MS = 125_000;

export async function generateStudyContent(
  notes: string,
  signal?: AbortSignal,
): Promise<GenerateResponse> {
  const timeoutAbort = new AbortController();
  const timeout = setTimeout(() => timeoutAbort.abort(), GENERATE_TIMEOUT_MS);

  const combinedSignal = signal
    ? combineAbortSignals(signal, timeoutAbort.signal)
    : timeoutAbort.signal;

  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
      signal: combinedSignal,
    });

    if (response.status === 502 || response.status === 504) {
      const body = await response.json().catch(() => ({ error: 'AI service unavailable.' }));
      return (body as GenerateResponse);
    }

    if (!response.ok) {
      const message = await parseErrorBody(response);
      return { success: false, error: message };
    }

    return response.json() as Promise<GenerateResponse>;
  } finally {
    clearTimeout(timeout);
  }
}

function combineAbortSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => controller.abort((a.aborted ? a.reason : b.reason) ?? undefined);
  a.addEventListener('abort', onAbort, { once: true });
  b.addEventListener('abort', onAbort, { once: true });
  if (a.aborted || b.aborted) controller.abort();
  return controller.signal;
}
