import { create } from 'zustand';
import { ClothingItem, Look, ClothingCategory } from '@/types/clothing';
import { mockClothingItems, generateMockLooks, mockWeather } from '@/data/mockClothing';
import { SlotType, slotTypeToCategories } from '@/constants/slotCategories';

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
  regenerateLook: (lookId: LookId) => void;
  moveToDirty: (ids: string[]) => void;
  moveToClean: (ids: string[]) => void;
  removeFromLook: (lookId: LookId, itemId: string) => void;
  swapItem: (fromLook: LookId, toLook: LookId, itemId: string) => void;
  toggleLaundrySelection: (id: string) => void;
  clearLaundrySelection: () => void;
  confirmLook: (lookId: LookId) => void;
  addClothing: (item: ClothingItem) => void;
  removeClothing: (itemId: string) => void;
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

  regenerateLook: (lookId: LookId) => {
    const state = get();
    const cleanClothes = state.clothes.filter(c => c.status === 'clean');
    
    // Get IDs already used in OTHER visible looks
    const otherLooks = (['A', 'B', 'C', 'D'] as LookId[])
      .filter(id => id !== lookId)
      .flatMap(id => state.getLook(id).map(i => i.id));
    
    const available = cleanClothes.filter(c => !otherLooks.includes(c.id));
    
    const tops = available.filter(c => c.category === 'top');
    const bottoms = available.filter(c => c.category === 'bottom');
    const shoes = available.filter(c => c.category === 'shoes');
    const accessories = available.filter(c => c.category === 'accessory');
    
    // Pick random items
    const pick = <T,>(arr: T[]) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
    const newLook = [pick(tops), pick(bottoms), pick(shoes), pick(accessories)].filter(Boolean) as ClothingItem[];
    
    const lookKey = `look${lookId}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
    set({ [lookKey]: newLook });
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
    
    // Move items to dirty and clear the look, but keep it visible
    state.moveToDirty(ids);
    const lookKey = `look${lookId}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
    set({ [lookKey]: [] });
  },

  addClothing: (item: ClothingItem) => {
    set((state) => ({
      clothes: [...state.clothes, item],
    }));
  },

  removeClothing: (itemId: string) => {
    set((state) => ({
      clothes: state.clothes.filter(c => c.id !== itemId),
      lookA: state.lookA.filter(c => c.id !== itemId),
      lookB: state.lookB.filter(c => c.id !== itemId),
      lookC: state.lookC.filter(c => c.id !== itemId),
      lookD: state.lookD.filter(c => c.id !== itemId),
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
