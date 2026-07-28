import { create } from 'zustand';
import { SUBJECT_CHIPS, type SubjectContent } from '@/constants/subjects';
import { generateStudyContent } from '@/services/api';

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
  notes: string;
  selectedSubjectId: string | null;
  autosavedAt: number | null;
  view: 'home' | 'generating' | 'workspace';
  isGenerating: boolean;
  generationError: string | null;
  currentSession: SubjectContent | null;
  activeTab: WorkspaceTab;
  tabHistory: WorkspaceTab[];
  isSidebarOpen: boolean;
  flashcardProgress: FlashcardProgress;
  quizProgress: QuizProgress | null;
  recentSessions: RecentSession[];
  toasts: Toast[];
  isShortcutsOpen: boolean;

  setNotes: (notes: string) => void;
  selectSubject: (subjectId: string) => void;
  clearNotes: () => void;
  beginGeneration: () => void;
  finishGeneration: (apiData?: SubjectContent, subjectIdOverride?: string | null) => void;
  cancelGeneration: () => void;
  returnHome: () => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  recordFlashcardConfidence: (cardId: string, confidence: 'easy' | 'hard' | 'skip') => void;
  recordQuizComplete: (score: number, total: number) => void;
  resetProgress: () => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  setShortcutsOpen: (open: boolean) => void;
}

// ── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY_RECENT  = 'sf_recent_sessions';
const STORAGE_KEY_DRAFT   = 'sf_draft_notes';
const STORAGE_KEY_SUBJECT = 'sf_draft_subject';
const STORAGE_KEY_TS      = 'sf_draft_ts';

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

export function loadDraft(): { notes: string; subjectId: string | null; timestamp: number | null } {
  try {
    const notes = localStorage.getItem(STORAGE_KEY_DRAFT) ?? '';
    const subjectId = localStorage.getItem(STORAGE_KEY_SUBJECT) ?? null;
    const ts = localStorage.getItem(STORAGE_KEY_TS);
    return { notes, subjectId, timestamp: ts ? parseInt(ts, 10) : null };
  } catch {
    return { notes: '', subjectId: null, timestamp: null };
  }
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
function cancelAutosave() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
}

function scheduleDraftSave(notes: string, subjectId: string | null) {
  cancelAutosave();
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT, notes);
      if (subjectId) {
        localStorage.setItem(STORAGE_KEY_SUBJECT, subjectId);
      } else {
        localStorage.removeItem(STORAGE_KEY_SUBJECT);
      }
      localStorage.setItem(STORAGE_KEY_TS, Date.now().toString());
    } catch { /* ignore */ }
  }, 800);
}

function clearDraft() {
  cancelAutosave();
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
    localStorage.removeItem(STORAGE_KEY_SUBJECT);
    localStorage.removeItem(STORAGE_KEY_TS);
  } catch { /* ignore */ }
}

// ── Default progress ─────────────────────────────────────────────────────────

const defaultFlashcardProgress = (): FlashcardProgress => ({
  confidence: {},
  seenCount: 0,
});

// ── Generation abort controller ───────────────────────────────────────────────

let generationAbort: AbortController | null = null;
let generationRequestId = 0;

// ── Toast timer tracking ──────────────────────────────────────────────────────

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

// ── Store ────────────────────────────────────────────────────────────────────

const draft = loadDraft();

export const useStudyStore = create<StudyState>((set, get) => ({
  notes:             draft.notes,
  selectedSubjectId: draft.subjectId,
  autosavedAt:       draft.timestamp,

  view:              'home',
  isGenerating:      false,
  generationError:   null,

  currentSession:    null,
  activeTab:         'overview',
  tabHistory:        [],
  isSidebarOpen:     true,

  flashcardProgress: defaultFlashcardProgress(),
  quizProgress:      null,

  recentSessions:    loadRecentSessions(),
  toasts:            [],
  isShortcutsOpen:   false,

  // ── Editor actions ─────────────────────────

  setNotes: (notes) => {
    set({ notes, selectedSubjectId: null, autosavedAt: Date.now() });
    scheduleDraftSave(notes, null);
  },

  selectSubject: (subjectId) => {
    const subject = SUBJECT_CHIPS.find((s) => s.id === subjectId);
    if (subject) {
      set({ notes: subject.sampleNotes ?? '', selectedSubjectId: subjectId, autosavedAt: Date.now() });
      scheduleDraftSave(subject.sampleNotes ?? '', subjectId);
    }
  },

  clearNotes: () => {
    set({ notes: '', selectedSubjectId: null, autosavedAt: null });
    clearDraft();
  },

  // ── Session flow ───────────────────────────

  beginGeneration: () => {
    const { notes, selectedSubjectId } = get();

    if (generationAbort) {
      generationAbort.abort();
      generationAbort = null;
    }

    const rid = ++generationRequestId;
    const capturedSubjectId = selectedSubjectId;
    const subject = SUBJECT_CHIPS.find((s) => s.id === capturedSubjectId);

    if (subject) {
      set({ view: 'generating', generationError: null, isGenerating: true });

      setTimeout(() => {
        if (rid !== generationRequestId) return;
        const state = get();
        if (state.view === 'generating') {
          state.finishGeneration(subject, capturedSubjectId);
        }
      }, 2000);
      return;
    }

    const abort = new AbortController();
    generationAbort = abort;

    set({ view: 'generating', generationError: null, isGenerating: true });

    const handleSuccess = (response: Awaited<ReturnType<typeof generateStudyContent>>) => {
      if (abort.signal.aborted) return;
      if (rid !== generationRequestId) return;

      generationAbort = null;

      if (response.success && response.data) {
        try {
          get().finishGeneration(response.data, capturedSubjectId);
        } catch {
          set({ generationError: 'Failed to process AI response.', isGenerating: false });
        }
      } else {
        set({ generationError: response.error || 'An unknown error occurred.', isGenerating: false });
      }
    };

    const handleError = (err: unknown) => {
      if (abort.signal.aborted) return;
      if (rid !== generationRequestId) return;

      generationAbort = null;
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      set({ generationError: message, isGenerating: false });
    };

    generateStudyContent(notes, abort.signal).then(handleSuccess).catch(handleError);
  },

  cancelGeneration: () => {
    if (generationAbort) {
      generationAbort.abort();
      generationAbort = null;
    }
    set({ view: 'home', isGenerating: false, generationError: null });
  },

  finishGeneration: (apiData, subjectIdOverride) => {
    const { notes, selectedSubjectId, recentSessions } = get();
    const effectiveSubjectId = subjectIdOverride ?? selectedSubjectId;

    const session: SubjectContent = apiData ?? SUBJECT_CHIPS.find((s) => s.id === effectiveSubjectId) ?? {
      id: 'fallback-' + Date.now(),
      name: 'Custom Study Notes',
      category: 'Custom Notes',
      description: 'Study materials created from your notes.',
      difficulty: 'Intermediate',
      estimatedMinutes: 20,
      sampleNotes: notes,
      learningObjectives: ['Review core concepts from your notes'],
      flashcards: [{ id: 'fc-1', question: 'What is the main topic?', answer: notes.slice(0, 200), tag: 'Overview' }],
      quizQuestions: [{ id: 'q-1', question: 'What was covered?', options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'], correctIndex: 0, explanation: 'Review your notes.' }],
      summarySections: [{ title: 'Overview', content: notes, keyTakeaway: 'Review key concepts.' }],
      mnemonics: [{ title: 'Memory Hook', acronymOrPhrase: 'RECAP', breakdown: ['R - Read', 'E - Extract', 'C - Create', 'A - Apply', 'P - Practice'], explanation: 'Study framework.' }],
    };

    const sessionId = session.id ?? 'session-' + Date.now();
    const newRecent: RecentSession = {
      id:         sessionId + '-' + Date.now(),
      name:       session.name,
      category:   session.category,
      difficulty: session.difficulty,
      timestamp:  Date.now(),
      subjectId:  effectiveSubjectId,
      notes,
    };

    const updated = [newRecent, ...recentSessions.filter((r) => r.id !== newRecent.id && r.name !== session.name + '-' + effectiveSubjectId)];
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
      isGenerating:      false,
      generationError:   null,
    });

    get().addToast(`Workspace ready — ${session.name}`, 'success');
  },

  returnHome: () => {
    if (generationAbort) {
      generationAbort.abort();
      generationAbort = null;
    }
    set({
      view:            'home',
      currentSession:  null,
      activeTab:       'overview',
      tabHistory:      [],
      isGenerating:    false,
      generationError: null,
    });
  },

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
    const timer = setTimeout(() => get().removeToast(id), 3500);
    toastTimers.set(id, timer);
  },

  removeToast: (id) => {
    const timer = toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  // ── UI ─────────────────────────────────────

  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
}));
