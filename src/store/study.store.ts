import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  clearSession: () => void;
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

// ── Draft persistence helpers ─────────────────────────────────────────────────

const STORAGE_KEY_DRAFT   = 'sf_draft_notes';
const STORAGE_KEY_SUBJECT = 'sf_draft_subject';
const STORAGE_KEY_TS      = 'sf_draft_ts';

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
  if (autosaveTimer) { clearTimeout(autosaveTimer); autosaveTimer = null; }
}

function scheduleDraftSave(notes: string, subjectId: string | null) {
  cancelAutosave();
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT, notes);
      if (subjectId) localStorage.setItem(STORAGE_KEY_SUBJECT, subjectId);
      else localStorage.removeItem(STORAGE_KEY_SUBJECT);
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

const defaultFlashcardProgress = (): FlashcardProgress => ({ confidence: {}, seenCount: 0 });

// ── Generation state (not persisted) ──────────────────────────────────────────

let generationAbort: AbortController | null = null;
let generationRequestId = 0;
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

// ── Hydrated initial values ──────────────────────────────────────────────────

const draft = loadDraft();

function getHydratedSession() {
  try {
    const raw = localStorage.getItem('studyflow-session');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.state?.currentSession) {
      return {
        currentSession: data.state.currentSession as SubjectContent,
        activeTab: (data.state.activeTab as WorkspaceTab) ?? 'overview',
        flashcardProgress: (data.state.flashcardProgress as FlashcardProgress) ?? defaultFlashcardProgress(),
        quizProgress: (data.state.quizProgress as QuizProgress) ?? null,
        tabHistory: (data.state.tabHistory as WorkspaceTab[]) ?? [],
        isSidebarOpen: (data.state.isSidebarOpen as boolean) ?? true,
        recentSessions: (data.state.recentSessions as RecentSession[]) ?? [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

const hydrated = getHydratedSession();

// ── Store ────────────────────────────────────────────────────────────────────

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      notes:             draft.notes,
      selectedSubjectId: draft.subjectId,
      autosavedAt:       draft.timestamp,
      view:              hydrated ? 'workspace' : 'home',
      isGenerating:      false,
      generationError:   null,
      currentSession:    hydrated?.currentSession ?? null,
      activeTab:         hydrated?.activeTab ?? 'overview',
      tabHistory:        hydrated?.tabHistory ?? [],
      isSidebarOpen:     hydrated?.isSidebarOpen ?? true,
      flashcardProgress: hydrated?.flashcardProgress ?? defaultFlashcardProgress(),
      quizProgress:      hydrated?.quizProgress ?? null,
      recentSessions:    hydrated?.recentSessions ?? [],
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
          set({ notes: '', selectedSubjectId: subjectId, autosavedAt: Date.now() });
          clearDraft();
        }
      },

      clearNotes: () => {
        set({ notes: '', selectedSubjectId: null, autosavedAt: null });
        clearDraft();
      },

      // ── Session flow ───────────────────────────

      beginGeneration: () => {
        const { notes, selectedSubjectId } = get();

        if (generationAbort) { generationAbort.abort(); generationAbort = null; }

        const rid = ++generationRequestId;
        const capturedSubjectId = selectedSubjectId;
        const subject = SUBJECT_CHIPS.find((s) => s.id === capturedSubjectId);

        if (subject) {
          set({ view: 'generating', generationError: null, isGenerating: true });
          setTimeout(() => {
            if (rid !== generationRequestId) return;
            if (get().view === 'generating') get().finishGeneration(subject, capturedSubjectId);
          }, 2000);
          return;
        }

        const abort = new AbortController();
        generationAbort = abort;
        set({ view: 'generating', generationError: null, isGenerating: true });

        generateStudyContent(notes, abort.signal)
          .then((response) => {
            if (abort.signal.aborted || rid !== generationRequestId) return;
            generationAbort = null;
            if (response.success && response.data) {
              try { get().finishGeneration(response.data, capturedSubjectId); }
              catch { set({ generationError: 'Failed to process AI response.', isGenerating: false }); }
            } else {
              set({ generationError: response.error || 'An unknown error occurred.', isGenerating: false });
            }
          })
          .catch((err: unknown) => {
            if (abort.signal.aborted || rid !== generationRequestId) return;
            generationAbort = null;
            set({ generationError: err instanceof Error ? err.message : 'An unknown error occurred.', isGenerating: false });
          });
      },

      cancelGeneration: () => {
        if (generationAbort) { generationAbort.abort(); generationAbort = null; }
        set({ view: 'home', isGenerating: false, generationError: null });
      },

      finishGeneration: (apiData, subjectIdOverride) => {
        const { notes, selectedSubjectId, recentSessions } = get();
        const effectiveSubjectId = subjectIdOverride ?? selectedSubjectId;

        const session: SubjectContent = apiData ?? SUBJECT_CHIPS.find((s) => s.id === effectiveSubjectId) ?? {
          id: 'fallback-' + Date.now(), name: 'Custom Study Notes', category: 'Custom Notes',
          description: 'Study materials created from your notes.', difficulty: 'Intermediate',
          estimatedMinutes: 20, sampleNotes: notes,
          learningObjectives: ['Review core concepts from your notes'],
          flashcards: [{ id: 'fc-1', question: 'What is the main topic?', answer: notes.slice(0, 200), tag: 'Overview' }],
          quizQuestions: [{ id: 'q-1', question: 'What was covered?', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'Review your notes.' }],
          summarySections: [{ title: 'Overview', content: notes, keyTakeaway: 'Review key concepts.' }],
          mnemonics: [{ title: 'Memory Hook', acronymOrPhrase: 'RECAP', breakdown: ['R - Read', 'E - Extract', 'C - Create', 'A - Apply', 'P - Practice'], explanation: 'Study framework.' }],
        };

        const newRecent: RecentSession = {
          id: (session.id ?? 'session-' + Date.now()) + '-' + Date.now(),
          name: session.name, category: session.category, difficulty: session.difficulty,
          timestamp: Date.now(), subjectId: effectiveSubjectId, notes,
        };

        const updated = [newRecent, ...recentSessions.filter(
          (r) => r.id !== newRecent.id && r.name !== session.name + '-' + effectiveSubjectId,
        )].slice(0, 5);

        clearDraft();

        set({
          view: 'workspace', currentSession: session, activeTab: 'overview', tabHistory: [],
          recentSessions: updated, flashcardProgress: defaultFlashcardProgress(), quizProgress: null,
          autosavedAt: null, isGenerating: false, generationError: null,
        });

        get().addToast(`Workspace ready — ${session.name}`, 'success');
      },

      clearSession: () => {
        if (generationAbort) { generationAbort.abort(); generationAbort = null; }
        set({
          view: 'home', currentSession: null, activeTab: 'overview', tabHistory: [],
          flashcardProgress: defaultFlashcardProgress(), quizProgress: null,
          isGenerating: false, generationError: null,
        });
      },

      returnHome: () => {
        if (generationAbort) { generationAbort.abort(); generationAbort = null; }
        set({ view: 'home', isGenerating: false, generationError: null });
      },

      // ── Workspace nav ──────────────────────────

      setActiveTab: (tab) =>
        set((s) => ({ activeTab: tab, tabHistory: [...s.tabHistory, s.activeTab] })),

      goBack: () =>
        set((s) => {
          if (s.tabHistory.length === 0) return {};
          return { activeTab: s.tabHistory[s.tabHistory.length - 1], tabHistory: s.tabHistory.slice(0, -1) };
        }),

      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

      // ── Progress actions ───────────────────────

      recordFlashcardConfidence: (cardId, confidence) =>
        set((s) => {
          const updated = { ...s.flashcardProgress.confidence, [cardId]: confidence };
          return { flashcardProgress: { confidence: updated, seenCount: Object.keys(updated).length } };
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
        if (timer) { clearTimeout(timer); toastTimers.delete(id); }
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      },

      // ── UI ─────────────────────────────────────

      setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
    }),
    {
      name: 'studyflow-session',
      partialize: (s) => ({
        view: s.view,
        currentSession: s.currentSession,
        activeTab: s.activeTab,
        tabHistory: s.tabHistory,
        isSidebarOpen: s.isSidebarOpen,
        flashcardProgress: s.flashcardProgress,
        quizProgress: s.quizProgress,
        recentSessions: s.recentSessions,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<StudyState>),
        isGenerating: false,
        generationError: null,
        toasts: [],
        isShortcutsOpen: false,
      }),
    },
  ),
);
