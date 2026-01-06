import { create } from 'zustand';
import { ClothingItem, Look, ClothingCategory } from '@/types/clothing';
import { mockClothingItems, generateMockLooks, mockWeather } from '@/data/mockClothing';

// SlotType matching the ManequimLookCard
type SlotType = 'head' | 'top' | 'bottom' | 'shoes' | 'accessory-left' | 'accessory-right';

// Map slot type to accepted categories
const slotTypeToCategories: Record<SlotType, ClothingCategory[]> = {
  'head': ['accessory'],
  'top': ['top', 'outerwear'],
  'bottom': ['bottom'],
  'shoes': ['shoes'],
  'accessory-left': ['accessory'],
  'accessory-right': ['accessory'],
};

export type LookId = 'A' | 'B' | 'C' | 'D';

interface WardrobeState {
  clothes: ClothingItem[];
  lookA: ClothingItem[];
  lookB: ClothingItem[];
  lookC: ClothingItem[];
  lookD: ClothingItem[];
  visibleLooks: LookId[];
  weather: typeof mockWeather;
  selectedLaundryItems: string[];
  wardrobePickerOpen: boolean;
  wardrobePickerLook: LookId | null;
  wardrobePickerSlot: SlotType | null;
  
  // Actions
  initializeLooks: () => void;
  moveToDirty: (ids: string[]) => void;
  moveToClean: (ids: string[]) => void;
  removeFromLook: (lookId: LookId, itemId: string) => void;
  swapItem: (fromLook: LookId, toLook: LookId, itemId: string) => void;
  toggleLaundrySelection: (id: string) => void;
  clearLaundrySelection: () => void;
  confirmLook: (lookId: LookId) => void;
  addClothing: (item: ClothingItem) => void;
  getDirtyClothes: () => ClothingItem[];
  openWardrobePicker: (lookId: LookId, slotType: SlotType) => void;
  closeWardrobePicker: () => void;
  addToLook: (lookId: LookId, item: ClothingItem) => void;
  getAvailableItemsForSlot: (slotType: SlotType, lookId: LookId) => ClothingItem[];
  addLook: (lookId: LookId) => void;
  removeLook: (lookId: LookId) => void;
  getLook: (lookId: LookId) => ClothingItem[];
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  clothes: mockClothingItems,
  lookA: [],
  lookB: [],
  lookC: [],
  lookD: [],
  visibleLooks: ['A', 'B'] as LookId[],
  weather: mockWeather,
  selectedLaundryItems: [],
  wardrobePickerOpen: false,
  wardrobePickerLook: null,
  wardrobePickerSlot: null,

  initializeLooks: () => {
    const { clothes } = get();
    const { lookA, lookB } = generateMockLooks(clothes);
    set({ lookA, lookB, lookC: [], lookD: [] });
  },
  
  getLook: (lookId: LookId) => {
    const state = get();
    const lookMap = { A: state.lookA, B: state.lookB, C: state.lookC, D: state.lookD };
    return lookMap[lookId];
  },

  addLook: (lookId: LookId) => {
    set((state) => ({
      visibleLooks: state.visibleLooks.includes(lookId) 
        ? state.visibleLooks 
        : [...state.visibleLooks, lookId],
    }));
  },

  removeLook: (lookId: LookId) => {
    set((state) => ({
      visibleLooks: state.visibleLooks.filter(l => l !== lookId),
      [lookId === 'A' ? 'lookA' : lookId === 'B' ? 'lookB' : lookId === 'C' ? 'lookC' : 'lookD']: [],
    }));
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

  removeFromLook: (lookId: LookId, itemId: string) => {
    set((state) => {
      const lookKey = `look${lookId}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
      const currentLook = state[lookKey];
      return {
        [lookKey]: currentLook.filter(item => item.id !== itemId),
      };
    });
  },

  swapItem: (fromLook: LookId, toLook: LookId, itemId: string) => {
    if (fromLook === toLook) return;
    
    set((state) => {
      const fromKey = `look${fromLook}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
      const toKey = `look${toLook}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
      const sourceLook = state[fromKey];
      const targetLook = state[toKey];
      
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
        [fromKey]: newSourceLook,
        [toKey]: newTargetLook,
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

  confirmLook: (lookId: LookId) => {
    const state = get();
    const look = state.getLook(lookId);
    const ids = look.map(item => item.id);
    
    state.moveToDirty(ids);
    state.removeLook(lookId);
  },

  addClothing: (item: ClothingItem) => {
    set((state) => ({
      clothes: [...state.clothes, item],
    }));
  },

  getDirtyClothes: () => {
    return get().clothes.filter(c => c.status === 'dirty');
  },

  openWardrobePicker: (lookId: LookId, slotType: SlotType) => {
    set({ wardrobePickerOpen: true, wardrobePickerLook: lookId, wardrobePickerSlot: slotType });
  },

  closeWardrobePicker: () => {
    set({ wardrobePickerOpen: false, wardrobePickerLook: null, wardrobePickerSlot: null });
  },

  addToLook: (lookId: LookId, item: ClothingItem) => {
    set((state) => {
      const lookKey = `look${lookId}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
      const look = state[lookKey];
      
      // Check if item already in the look
      if (look.some(i => i.id === item.id)) return state;
      
      // Remove existing item of same category from look
      const filteredLook = look.filter(i => i.category !== item.category);
      
      return {
        [lookKey]: [...filteredLook, item],
        wardrobePickerOpen: false,
        wardrobePickerLook: null,
        wardrobePickerSlot: null,
      };
    });
  },

  getAvailableItemsForSlot: (slotType: SlotType, lookId: LookId) => {
    const state = get();
    const acceptedCategories = slotTypeToCategories[slotType];
    const currentLook = state.getLook(lookId);
    const usedIds = currentLook.map(i => i.id);
    
    return state.clothes.filter(item => 
      item.status === 'clean' && 
      acceptedCategories.includes(item.category) &&
      !usedIds.includes(item.id)
    );
  },
}));
