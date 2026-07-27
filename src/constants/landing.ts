export const MAX_NOTES_LENGTH = 2000;

export const LANDING_COPY = {
  title: 'StudyFlow AI',
  subtitle:
    'Transform your notes into interactive flashcards, quizzes, summaries and study sessions powered by AI.',
  eyebrow: 'AI-powered study tools',
  textareaPlaceholder: 'Paste your notes, lecture content, or study topic here…',
  textareaLabel: 'Study notes input',
  generateCta: 'Generate study materials',
  examplePromptsLabel: 'Try an example',
  featuresEyebrow: 'Features',
  featuresTitle: 'Everything you need to study smarter',
  featuresDescription:
    'Structured outputs — not a chatbot. Each study artifact is interactive and purpose-built.',
} as const;

export const EXAMPLE_PROMPTS = [
  'Summarize chapter 5 on cellular respiration into flashcards and a short quiz.',
  'Turn my React hooks notes into a study session with key concepts and practice questions.',
  'Create flashcards for Spanish vocabulary: travel, food, and directions.',
  'Build a quiz from my machine learning notes covering supervised vs unsupervised learning.',
] as const;

export const FEATURES = [
  {
    title: 'Interactive flashcards',
    description:
      'AI structures your notes into flip cards with spaced repetition-friendly chunks.',
    icon: 'layers' as const,
  },
  {
    title: 'Smart quizzes',
    description:
      'Auto-generated multiple-choice questions with explanations to test understanding.',
    icon: 'brain' as const,
  },
  {
    title: 'Clear summaries',
    description:
      'Concise summaries that highlight what matters before you dive into practice.',
    icon: 'file-text' as const,
  },
  {
    title: 'Study sessions',
    description:
      'Organized study flows that combine reading, recall, and review in one place.',
    icon: 'calendar' as const,
  },
] as const;

export type FeatureIcon = (typeof FEATURES)[number]['icon'];
