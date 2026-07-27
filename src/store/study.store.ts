import { create } from 'zustand';
import { SUBJECT_CHIPS, type SubjectContent } from '@/constants/subjects';

// ── Types ────────────────────────────────────────────────────────────────────

export type WorkspaceTab =
  | 'overview'
  | 'flashcards'
  | 'quiz'
  | 'summary'
  | 'mnemonics'
  | 'analytics'
  | 'settings';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface RecentSession {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  timestamp: number;
  subjectId: string | null;
  notes: string;
}

export interface FlashcardProgress {
  /** Map of card id → confidence rating */
  confidence: Record<string, 'easy' | 'hard' | 'skip'>;
  seenCount: number;
}

export interface QuizProgress {
  score: number;
  total: number;
  completed: boolean;
}

// ── State ────────────────────────────────────────────────────────────────────

interface StudyState {
  // Editor
  notes: string;
  selectedSubjectId: string | null;
  autosavedAt: number | null;

  // App view
  view: 'home' | 'generating' | 'workspace';

  // Session
  currentSession: SubjectContent | null;
  activeTab: WorkspaceTab;
  tabHistory: WorkspaceTab[];
  isSidebarOpen: boolean;

  // Session progress (live, per-session)
  flashcardProgress: FlashcardProgress;
  quizProgress: QuizProgress | null;

  // Persistence
  recentSessions: RecentSession[];

  // UI
  toasts: Toast[];
  isShortcutsOpen: boolean;

  // Actions — Editor
  setNotes: (notes: string) => void;
  selectSubject: (subjectId: string) => void;
  clearNotes: () => void;

  // Actions — Session flow
  beginGeneration: () => void;
  finishGeneration: () => void;
  returnHome: () => void;

  // Actions — Workspace nav
  setActiveTab: (tab: WorkspaceTab) => void;
  goBack: () => void;
  toggleSidebar: () => void;

  // Actions — Progress
  recordFlashcardConfidence: (cardId: string, confidence: 'easy' | 'hard' | 'skip') => void;
  recordQuizComplete: (score: number, total: number) => void;
  resetProgress: () => void;

  // Actions — Toasts
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Actions — UI
  setShortcutsOpen: (open: boolean) => void;
}

// ── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY_RECENT  = 'sf_recent_sessions';
const STORAGE_KEY_DRAFT   = 'sf_draft_notes';
const STORAGE_KEY_SUBJECT = 'sf_draft_subject';

function loadRecentSessions(): RecentSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT);
    return raw ? (JSON.parse(raw) as RecentSession[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSessions(sessions: RecentSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(sessions.slice(0, 5)));
  } catch { /* ignore storage errors */ }
}

export function loadDraft(): { notes: string; subjectId: string | null } {
  try {
    return {
      notes:     localStorage.getItem(STORAGE_KEY_DRAFT)   ?? '',
      subjectId: localStorage.getItem(STORAGE_KEY_SUBJECT) ?? null,
    };
  } catch {
    return { notes: '', subjectId: null };
  }
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleDraftSave(notes: string, subjectId: string | null) {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT, notes);
      if (subjectId) localStorage.setItem(STORAGE_KEY_SUBJECT, subjectId);
      else           localStorage.removeItem(STORAGE_KEY_SUBJECT);
    } catch { /* ignore */ }
  }, 800);
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
    localStorage.removeItem(STORAGE_KEY_SUBJECT);
  } catch { /* ignore */ }
}

// ── Default progress ─────────────────────────────────────────────────────────

const defaultFlashcardProgress = (): FlashcardProgress => ({
  confidence: {},
  seenCount: 0,
});

// ── Custom session builder ───────────────────────────────────────────────────

function buildCustomSession(notes: string): SubjectContent {
  const firstLine = notes.slice(0, 60).trim().split('\n')[0] || 'Custom Study Notes';
  const topicName = firstLine.replace(/[#*_`]/g, '').trim().slice(0, 50) || 'Custom Notes';

  return {
    id:          'custom-' + Date.now(),
    name:        topicName,
    category:    'Custom Notes',
    description: 'AI-structured study materials from your uploaded notes.',
    difficulty:  'Intermediate',
    estimatedMinutes: Math.max(10, Math.min(60, Math.ceil(notes.split(/\s+/).length / 40))),
    sampleNotes: notes,
    learningObjectives: [
      'Identify and understand core concepts from your notes',
      'Recall key facts using spaced repetition flashcards',
      'Test comprehension with targeted quiz questions',
      'Reinforce retention with mnemonic memory hooks',
    ],
    flashcards: [
      {
        id:       'cf-1',
        question: 'What is the primary subject of these notes?',
        answer:   `${topicName}\n\n${notes.slice(0, 200)}`,
        tag:      'Overview',
      },
      {
        id:       'cf-2',
        question: 'What are the key takeaways from these notes?',
        answer:   notes.slice(200, 500) || 'Review the full notes to extract key principles.',
        tag:      'Concepts',
      },
    ],
    quizQuestions: [
      {
        id:           'cq-1',
        question:     `What is the main topic explored in this study session?`,
        options:      [topicName, 'Software Architecture', 'Computer Networks', 'Algorithm Design'],
        correctIndex: 0,
        explanation:  `The uploaded notes focus on: ${topicName}.`,
      },
    ],
    summarySections: [
      {
        title:       'Key Concepts & Overview',
        content:     notes,
        keyTakeaway: 'Review foundational principles before moving to practice problems.',
      },
    ],
    mnemonics: [
      {
        title:           'Active Learning Framework',
        acronymOrPhrase: 'R E C A P',
        breakdown: [
          'R — Read the full notes carefully',
          'E — Extract key concepts',
          'C — Create flashcard summaries',
          'A — Apply with practice questions',
          'P — Practice with spaced repetition',
        ],
        explanation: 'Use this sequence every time you start a new study session.',
      },
    ],
  };
}

// ── Store ────────────────────────────────────────────────────────────────────

const draft = loadDraft();

export const useStudyStore = create<StudyState>((set, get) => ({
  // ── Editor ─────────────────────────────────
  notes:           draft.notes,
  selectedSubjectId: draft.subjectId,
  autosavedAt:     draft.notes ? Date.now() : null,

  // ── View ───────────────────────────────────
  view:            'home',

  // ── Session ────────────────────────────────
  currentSession:  null,
  activeTab:       'overview',
  tabHistory:      [],
  isSidebarOpen:   true,

  // ── Progress ───────────────────────────────
  flashcardProgress: defaultFlashcardProgress(),
  quizProgress:      null,

  // ── Persistence ────────────────────────────
  recentSessions:  loadRecentSessions(),

  // ── UI ─────────────────────────────────────
  toasts:          [],
  isShortcutsOpen: false,

  // ── Editor actions ─────────────────────────

  setNotes: (notes) => {
    const { selectedSubjectId } = get();
    set({ notes, selectedSubjectId: null, autosavedAt: Date.now() });
    scheduleDraftSave(notes, null);
  },

  selectSubject: (subjectId) => {
    const subject = SUBJECT_CHIPS.find((s) => s.id === subjectId);
    if (subject) {
      set({ notes: subject.sampleNotes, selectedSubjectId: subjectId, autosavedAt: Date.now() });
      scheduleDraftSave(subject.sampleNotes, subjectId);
    }
  },

  clearNotes: () => {
    set({ notes: '', selectedSubjectId: null, autosavedAt: null });
    clearDraft();
  },

  // ── Session flow ───────────────────────────

  beginGeneration: () => set({ view: 'generating' }),

  finishGeneration: () => {
    const { notes, selectedSubjectId, recentSessions } = get();
    const session =
      SUBJECT_CHIPS.find((s) => s.id === selectedSubjectId) ?? buildCustomSession(notes);

    const newRecent: RecentSession = {
      id:         session.id + '-' + Date.now(),
      name:       session.name,
      category:   session.category,
      difficulty: session.difficulty,
      timestamp:  Date.now(),
      subjectId:  selectedSubjectId,
      notes,
    };

    const updated = [newRecent, ...recentSessions.filter((r) => r.name !== session.name)];
    saveRecentSessions(updated);
    clearDraft();

    set({
      view:              'workspace',
      currentSession:    session,
      activeTab:         'overview',
      tabHistory:        [],
      recentSessions:    updated,
      flashcardProgress: defaultFlashcardProgress(),
      quizProgress:      null,
      autosavedAt:       null,
    });

    get().addToast(`Workspace ready — ${session.name}`, 'success');
  },

  returnHome: () =>
    set({
      view:           'home',
      currentSession: null,
      activeTab:      'overview',
      tabHistory:     [],
    }),

  // ── Workspace nav ──────────────────────────

  setActiveTab: (tab) =>
    set((s) => ({
      activeTab:   tab,
      tabHistory:  [...s.tabHistory, s.activeTab],
    })),

  goBack: () =>
    set((s) => {
      if (s.tabHistory.length === 0) return {};
      const prev    = s.tabHistory[s.tabHistory.length - 1];
      const history = s.tabHistory.slice(0, -1);
      return { activeTab: prev, tabHistory: history };
    }),

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  // ── Progress actions ───────────────────────

  recordFlashcardConfidence: (cardId, confidence) =>
    set((s) => {
      const prev = s.flashcardProgress.confidence;
      const updated = { ...prev, [cardId]: confidence };
      const seenCount = Object.keys(updated).length;
      return { flashcardProgress: { confidence: updated, seenCount } };
    }),

  recordQuizComplete: (score, total) =>
    set({ quizProgress: { score, total, completed: true } }),

  resetProgress: () =>
    set({ flashcardProgress: defaultFlashcardProgress(), quizProgress: null }),

  // ── Toasts ─────────────────────────────────

  addToast: (message, type = 'info') => {
    const id = Date.now().toString(36);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3500);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ── UI ─────────────────────────────────────

  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
}));
