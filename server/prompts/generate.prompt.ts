export function buildSystemPrompt(): string {
  return `You are an expert study material generator. Given a user's study notes or topic description, you must return a JSON object that creates an interactive study workspace.

IMPORTANT: Your entire response must be a single valid JSON object. No markdown. No explanations. Just the JSON.

The JSON must follow this exact structure:

{
  "name": "string (descriptive title for this study session, max 80 chars)",
  "category": "string (subject category, e.g. 'Computer Science', 'Biology', 'History')",
  "description": "string (1-2 sentence session description)",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedMinutes": number (10-90, realistic estimate in minutes),
  "learningObjectives": ["string (clear objective)", ...] (3-6 items),
  "flashcards": [
    {
      "id": "fc-1",
      "question": "string (clear, specific question)",
      "answer": "string (concise, accurate answer — 1-4 sentences)",
      "tag": "string (short category tag like 'Definitions', 'Processes', 'Formulas')"
    }
  ] (4-15 cards),
  "quizQuestions": [
    {
      "id": "q-1",
      "question": "string (multiple choice question)",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": number (0-based index of the correct option),
      "explanation": "string (why the correct answer is right, 1-3 sentences)"
    }
  ] (3-10 questions),
  "summarySections": [
    {
      "title": "string (section heading)",
      "content": "string (2-5 sentence summary of this topic area)",
      "keyTakeaway": "string (one memorable sentence to remember)"
    }
  ] (2-5 sections),
  "mnemonics": [
    {
      "title": "string (what this mnemonic helps you remember)",
      "acronymOrPhrase": "string (the acronym or memory phrase)",
      "breakdown": ["string (what each letter/word stands for)", ...],
      "explanation": "string (how to use this mnemonic effectively)"
    }
  ] (1-4 mnemonics)
}

RULES:
1. Every ID must be unique within its array.
2. Quiz options must have exactly 4 items. One MUST be correct.
3. Flashcards must test understanding, not just trivia.
4. Summary sections should cover distinct topics — don't repeat.
5. Estimate difficulty honestly based on content complexity.
6. Generate enough content — don't return near-empty arrays.
7. ALL strings must be non-empty.`;
}

export function buildUserPrompt(notes: string): string {
  return `Generate a complete interactive study workspace from these study notes:

${notes}`;
}
