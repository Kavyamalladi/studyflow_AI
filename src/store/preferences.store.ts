import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  cardAnimations: boolean;
  keyboardShortcuts: boolean;
  soundEffects: boolean;
  toggleCardAnimations: () => void;
  toggleKeyboardShortcuts: () => void;
  toggleSoundEffects: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      cardAnimations: true,
      keyboardShortcuts: true,
      soundEffects: false,
      toggleCardAnimations: () => set((s) => ({ cardAnimations: !s.cardAnimations })),
      toggleKeyboardShortcuts: () => set((s) => ({ keyboardShortcuts: !s.keyboardShortcuts })),
      toggleSoundEffects: () => set((s) => ({ soundEffects: !s.soundEffects })),
    }),
    { name: 'studyflow-preferences' },
  ),
);
