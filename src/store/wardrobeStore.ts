import { create } from 'zustand';
import { ClothingItem, Look } from '@/types/clothing';
import { mockClothingItems, generateMockLooks, mockWeather } from '@/data/mockClothing';

interface WardrobeState {
  clothes: ClothingItem[];
  lookA: ClothingItem[];
  lookB: ClothingItem[];
  weather: typeof mockWeather;
  selectedLaundryItems: string[];
  
  // Actions
  initializeLooks: () => void;
  moveToDirty: (ids: string[]) => void;
  moveToClean: (ids: string[]) => void;
  removeFromLook: (lookId: 'A' | 'B', itemId: string) => void;
  swapItem: (fromLook: 'A' | 'B', toLook: 'A' | 'B', itemId: string) => void;
  toggleLaundrySelection: (id: string) => void;
  clearLaundrySelection: () => void;
  confirmLook: (lookId: 'A' | 'B') => void;
  addClothing: (item: ClothingItem) => void;
  getDirtyClothes: () => ClothingItem[];
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  clothes: mockClothingItems,
  lookA: [],
  lookB: [],
  weather: mockWeather,
  selectedLaundryItems: [],

  initializeLooks: () => {
    const { clothes } = get();
    const { lookA, lookB } = generateMockLooks(clothes);
    set({ lookA, lookB });
  },

  moveToDirty: (ids: string[]) => {
    set((state) => ({
      clothes: state.clothes.map(item =>
        ids.includes(item.id)
          ? { ...item, status: 'dirty' as const, last_worn: new Date().toISOString() }
          : item
      ),
    }));
  },

  moveToClean: (ids: string[]) => {
    set((state) => ({
      clothes: state.clothes.map(item =>
        ids.includes(item.id)
          ? { ...item, status: 'clean' as const }
          : item
      ),
      selectedLaundryItems: [],
    }));
  },

  removeFromLook: (lookId: 'A' | 'B', itemId: string) => {
    set((state) => ({
      [lookId === 'A' ? 'lookA' : 'lookB']: 
        (lookId === 'A' ? state.lookA : state.lookB).filter(item => item.id !== itemId),
    }));
  },

  swapItem: (fromLook: 'A' | 'B', toLook: 'A' | 'B', itemId: string) => {
    if (fromLook === toLook) return;
    
    set((state) => {
      const sourceLook = fromLook === 'A' ? state.lookA : state.lookB;
      const targetLook = toLook === 'A' ? state.lookA : state.lookB;
      
      const item = sourceLook.find(i => i.id === itemId);
      if (!item) return state;

      // Find if there's an item of same category in target
      const sameCategory = targetLook.find(i => i.category === item.category);
      
      const newSourceLook = sourceLook.filter(i => i.id !== itemId);
      let newTargetLook = [...targetLook, item];
      
      // If same category exists in target, swap them
      if (sameCategory) {
        newTargetLook = targetLook.map(i => i.id === sameCategory.id ? item : i);
        newSourceLook.push(sameCategory);
      }

      return {
        lookA: fromLook === 'A' ? newSourceLook : (toLook === 'A' ? newTargetLook : state.lookA),
        lookB: fromLook === 'B' ? newSourceLook : (toLook === 'B' ? newTargetLook : state.lookB),
      };
    });
  },

  toggleLaundrySelection: (id: string) => {
    set((state) => ({
      selectedLaundryItems: state.selectedLaundryItems.includes(id)
        ? state.selectedLaundryItems.filter(i => i !== id)
        : [...state.selectedLaundryItems, id],
    }));
  },

  clearLaundrySelection: () => {
    set({ selectedLaundryItems: [] });
  },

  confirmLook: (lookId: 'A' | 'B') => {
    const state = get();
    const look = lookId === 'A' ? state.lookA : state.lookB;
    const ids = look.map(item => item.id);
    
    state.moveToDirty(ids);
    state.initializeLooks();
  },

  addClothing: (item: ClothingItem) => {
    set((state) => ({
      clothes: [...state.clothes, item],
    }));
  },

  getDirtyClothes: () => {
    return get().clothes.filter(c => c.status === 'dirty');
  },
}));
