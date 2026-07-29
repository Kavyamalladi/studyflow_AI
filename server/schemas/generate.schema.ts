import { z } from 'zod';

const flashcardSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  tag: z.string().min(1),
});

const quizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

const summarySectionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  keyTakeaway: z.string().min(1),
});

const mnemonicSchema = z.object({
  title: z.string().min(1),
  acronymOrPhrase: z.string().min(1),
  breakdown: z.array(z.string().min(1)).min(1),
  explanation: z.string().min(1),
});

export const subjectContentSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  estimatedMinutes: z.number().int().positive().max(120),
  learningObjectives: z.array(z.string().min(1)).min(1).max(8),
  flashcards: z.array(flashcardSchema).min(3).max(8),
  quizQuestions: z.array(quizQuestionSchema).min(3).max(10),
  summarySections: z.array(summarySectionSchema).min(2).max(5),
  mnemonics: z.array(mnemonicSchema).min(1).max(3),
});

export type SubjectContent = z.infer<typeof subjectContentSchema>;

export const generateRequestBodySchema = z.object({
  notes: z.string().min(5).max(20000),
});
