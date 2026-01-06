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

interface WardrobeState {
  clothes: ClothingItem[];
  lookA: ClothingItem[];
  lookB: ClothingItem[];
  weather: typeof mockWeather;
  selectedLaundryItems: string[];
  wardrobePickerOpen: boolean;
  wardrobePickerLook: 'A' | 'B' | null;
  wardrobePickerSlot: SlotType | null;
  
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
  openWardrobePicker: (lookId: 'A' | 'B', slotType: SlotType) => void;
  closeWardrobePicker: () => void;
  addToLook: (lookId: 'A' | 'B', item: ClothingItem) => void;
  getAvailableItemsForSlot: (slotType: SlotType, lookId: 'A' | 'B') => ClothingItem[];
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  clothes: mockClothingItems,
  lookA: [],
  lookB: [],
  weather: mockWeather,
  selectedLaundryItems: [],
  wardrobePickerOpen: false,
  wardrobePickerLook: null,
  wardrobePickerSlot: null,

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

  openWardrobePicker: (lookId: 'A' | 'B', slotType: SlotType) => {
    set({ wardrobePickerOpen: true, wardrobePickerLook: lookId, wardrobePickerSlot: slotType });
  },

  closeWardrobePicker: () => {
    set({ wardrobePickerOpen: false, wardrobePickerLook: null, wardrobePickerSlot: null });
  },

  addToLook: (lookId: 'A' | 'B', item: ClothingItem) => {
    set((state) => {
      const look = lookId === 'A' ? state.lookA : state.lookB;
      
      // Check if item already in the look
      if (look.some(i => i.id === item.id)) return state;
      
      // Remove existing item of same category from look
      const filteredLook = look.filter(i => i.category !== item.category);
      
      return {
        [lookId === 'A' ? 'lookA' : 'lookB']: [...filteredLook, item],
        wardrobePickerOpen: false,
        wardrobePickerLook: null,
        wardrobePickerSlot: null,
      };
    });
  },

  getAvailableItemsForSlot: (slotType: SlotType, lookId: 'A' | 'B') => {
    const state = get();
    const acceptedCategories = slotTypeToCategories[slotType];
    const currentLook = lookId === 'A' ? state.lookA : state.lookB;
    const usedIds = currentLook.map(i => i.id);
    
    return state.clothes.filter(item => 
      item.status === 'clean' && 
      acceptedCategories.includes(item.category) &&
      !usedIds.includes(item.id)
    );
  },
}));
