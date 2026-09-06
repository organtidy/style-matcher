import { create } from 'zustand';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { mockClothingItems, generateMockLooks, mockWeather } from '@/data/mockClothing';
import { SlotType, slotTypeToCategories } from '@/constants/slotCategories';
import { supabase } from '@/integrations/supabase/client';

export type LookId = 'A' | 'B' | 'C' | 'D';

export interface WineSuggestion {
  name: string;
  vintage: string;
  reason: string;
}

export interface UserStylePreferences {
  likedStyles: string[];
  favoriteDescriptions: string[];
  likedLookCount: number;
}

const getStoredStylePreferences = (): UserStylePreferences => {
  try {
    const saved = localStorage.getItem('ps_user_style_prefs');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse stored style preferences:', e);
  }
  return {
    likedStyles: [],
    favoriteDescriptions: [],
    likedLookCount: 0,
  };
};

interface WardrobeState {
  clothes: ClothingItem[];
  lookA: ClothingItem[];
  lookB: ClothingItem[];
  lookC: ClothingItem[];
  lookD: ClothingItem[];
  visibleLooks: LookId[];
  likedLooks: Record<LookId, boolean>;
  userStylePreferences: UserStylePreferences;
  weather: typeof mockWeather;
  selectedLaundryItems: string[];
  wardrobePickerOpen: boolean;
  wardrobePickerLook: LookId | null;
  wardrobePickerSlot: SlotType | null;
  loadingClothes: boolean;
  aiConsultantLoading: boolean;
  aiTip: string | null;
  wineSuggestion: WineSuggestion | null;
  
  // Actions
  loadUserClothes: (userId: string) => Promise<void>;
  initializeLooks: () => void;
  regenerateLook: (lookId: LookId) => void;
  generateAILooks: (weather: any, occasion: string) => Promise<void>;
  toggleLikeLook: (lookId: LookId) => void;
  getUserStylePreferences: () => UserStylePreferences;
  moveToDirty: (ids: string[]) => Promise<void>;
  moveToClean: (ids: string[]) => Promise<void>;
  removeFromLook: (lookId: LookId, itemId: string) => void;
  swapItem: (fromLook: LookId, toLook: LookId, itemId: string) => void;
  toggleLaundrySelection: (id: string) => void;
  clearLaundrySelection: () => void;
  confirmLook: (lookId: LookId) => void;
  addClothing: (item: Omit<ClothingItem, 'id' | 'created_at'>, userId?: string) => Promise<void>;
  removeClothing: (itemId: string, userId?: string) => Promise<void>;
  clearAllClothes: (userId?: string) => Promise<void>;
  getDirtyClothes: () => ClothingItem[];
  openWardrobePicker: (lookId: LookId, slotType: SlotType) => void;
  closeWardrobePicker: () => void;
  addToLook: (lookId: LookId, item: ClothingItem) => void;
  getAvailableItemsForSlot: (slotType: SlotType, lookId: LookId) => ClothingItem[];
  addLook: (lookId: LookId) => void;
  removeLook: (lookId: LookId) => void;
  getLook: (lookId: LookId) => ClothingItem[];
  clearUserData: () => void;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  clothes: mockClothingItems,
  lookA: mockClothingItems.slice(0, 4),
  lookB: [mockClothingItems[8], mockClothingItems[14]], // Vestido + Sapato
  lookC: [],
  lookD: [],
  visibleLooks: ['A', 'B'] as LookId[],
  likedLooks: { A: false, B: false, C: false, D: false },
  userStylePreferences: getStoredStylePreferences(),
  weather: mockWeather,
  selectedLaundryItems: [],
  wardrobePickerOpen: false,
  wardrobePickerLook: null,
  wardrobePickerSlot: null,
  loadingClothes: false,
  aiConsultantLoading: false,
  aiTip: null,
  wineSuggestion: null,

  loadUserClothes: async (userId: string) => {
    set({ loadingClothes: true });
    try {
      console.log('Loading wardrobe for user:', userId);
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clothes from Supabase:', error);
        return;
      }

      const userClothes: ClothingItem[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        image_url: row.image_url,
        description: row.description || 'Peça sem descrição',
        warmth_level: row.warmth_level || 3,
        style_tags: row.style_tags || ['casual'],
        last_worn: row.last_worn,
        category: row.category as ClothingCategory,
        sub_category: row.sub_category,
        occasion: row.occasion,
        status: row.status,
        created_at: row.created_at,
      }));

      // If user has clothes in database, use them. Otherwise fallback to sample mock items.
      const finalClothes = userClothes.length > 0 ? userClothes : mockClothingItems;
      set({ clothes: finalClothes });
      get().initializeLooks();
    } catch (err) {
      console.error('Unexpected error loading clothes:', err);
    } finally {
      set({ loadingClothes: false });
    }
  },

  clearUserData: () => {
    set({
      clothes: mockClothingItems,
      lookA: mockClothingItems.slice(0, 4),
      lookB: [mockClothingItems[8], mockClothingItems[14]],
      lookC: [],
      lookD: [],
      selectedLaundryItems: [],
      aiTip: null,
      wineSuggestion: null,
    });
  },

  initializeLooks: () => {
    const { clothes } = get();
    const effectiveClothes = clothes.length > 0 ? clothes : mockClothingItems;
    const { lookA, lookB } = generateMockLooks(effectiveClothes);
    set({ lookA, lookB, lookC: [], lookD: [] });
  },

  getUserStylePreferences: () => {
    return get().userStylePreferences;
  },

  toggleLikeLook: (lookId: LookId) => {
    const state = get();
    const currentStatus = !!state.likedLooks[lookId];
    const newStatus = !currentStatus;
    const lookItems = state.getLook(lookId);

    const currentPrefs = { ...state.userStylePreferences };

    if (newStatus && lookItems.length > 0) {
      const newTags = lookItems.flatMap(i => i.style_tags || []);
      const descriptions = lookItems.map(i => i.description).filter(Boolean);

      const allStyles = Array.from(new Set([...currentPrefs.likedStyles, ...newTags]));
      const allDescriptions = Array.from(new Set([...currentPrefs.favoriteDescriptions, ...descriptions])).slice(-20);

      const updatedPrefs: UserStylePreferences = {
        likedStyles: allStyles,
        favoriteDescriptions: allDescriptions,
        likedLookCount: currentPrefs.likedLookCount + 1,
      };

      try {
        localStorage.setItem('ps_user_style_prefs', JSON.stringify(updatedPrefs));
      } catch (e) {
        console.warn('Failed to save style preferences to localStorage:', e);
      }

      set({
        likedLooks: { ...state.likedLooks, [lookId]: true },
        userStylePreferences: updatedPrefs,
      });
    } else {
      set({
        likedLooks: { ...state.likedLooks, [lookId]: false },
      });
    }
  },

  regenerateLook: (lookId: LookId) => {
    const state = get();
    const cleanClothes = state.clothes.filter(c => c.status === 'clean');
    if (cleanClothes.length === 0) return;
    
    // Get IDs already used in OTHER visible looks
    const otherLooks = (['A', 'B', 'C', 'D'] as LookId[])
      .filter(id => id !== lookId)
      .flatMap(id => state.getLook(id).map(i => i.id));
    
    const available = cleanClothes.filter(c => !otherLooks.includes(c.id));
    const pool = available.length > 0 ? available : cleanClothes;
    
    const dresses = pool.filter(c => c.category === 'dress' || c.description?.toLowerCase().includes('vestido'));
    const tops = pool.filter(c => (c.category === 'top' || c.category === 'outerwear') && !c.description?.toLowerCase().includes('vestido'));
    const bottoms = pool.filter(c => c.category === 'bottom' && !c.description?.toLowerCase().includes('vestido'));
    const shoes = pool.filter(c => c.category === 'shoes');
    const accessories = pool.filter(c => c.category === 'accessory');
    
    const pick = <T,>(arr: T[]) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
    
    // Check if current look had a dress or if it's Look B with dresses available
    const currentLook = state.getLook(lookId);
    const currentlyHasDress = currentLook.some(i => i.category === 'dress' || i.description?.toLowerCase().includes('vestido'));

    let newLook: ClothingItem[];
    if ((currentlyHasDress || lookId === 'B') && dresses.length > 0) {
      newLook = [pick(dresses), pick(shoes), pick(accessories)].filter(Boolean) as ClothingItem[];
    } else {
      newLook = [pick(tops), pick(bottoms), pick(shoes), pick(accessories)].filter(Boolean) as ClothingItem[];
    }
    
    const lookKey = `look${lookId}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
    set({
      [lookKey]: newLook,
      likedLooks: { ...state.likedLooks, [lookId]: false },
    });
  },

  generateAILooks: async (weather: any, occasion: string = 'casual') => {
    const state = get();
    const cleanClothes = state.clothes.filter(c => c.status === 'clean');

    if (cleanClothes.length === 0) {
      throw new Error('Você precisa ter roupas limpas cadastradas para a IA montar os looks.');
    }

    set({ aiConsultantLoading: true });
    try {
      const userPrefs = get().getUserStylePreferences();
      const { data, error } = await supabase.functions.invoke('fashion-consultant', {
        body: {
          clothes: cleanClothes,
          weather: weather || { temperature: 22, condition: 'Clear', description: 'agradável' },
          laundryItems: state.getDirtyClothes(),
          occasion,
          numberOfLooks: 2,
          userPreferences: {
            likedStyles: userPrefs.likedStyles,
            favoriteDescriptions: userPrefs.favoriteDescriptions,
          },
        },
      });

      if (error) throw error;

      if (data?.success && data.looks && data.looks.length > 0) {
        const looks = data.looks;
        set({
          lookA: looks[0]?.items || [],
          lookB: looks[1]?.items || [],
          aiTip: data.tips || null,
          wineSuggestion: data.wine || null,
          likedLooks: { A: false, B: false, C: false, D: false },
        });
        return;
      }

      // Fallback
      state.initializeLooks();
    } catch (err) {
      console.warn('AI consultant request error, falling back to local generator:', err);
      state.initializeLooks();
      throw err;
    } finally {
      set({ aiConsultantLoading: false });
    }
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

  moveToDirty: async (ids: string[]) => {
    const now = new Date().toISOString();
    try {
      await supabase
        .from('clothes')
        .update({ status: 'dirty', last_worn: now })
        .in('id', ids);
    } catch (err) {
      console.error('Error moving to dirty in Supabase:', err);
    }

    set((state) => ({
      clothes: state.clothes.map(item =>
        ids.includes(item.id)
          ? { ...item, status: 'dirty' as const, last_worn: now }
          : item
      ),
    }));
  },

  moveToClean: async (ids: string[]) => {
    try {
      await supabase
        .from('clothes')
        .update({ status: 'clean' })
        .in('id', ids);
    } catch (err) {
      console.error('Error moving to clean in Supabase:', err);
    }

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

      const sameCategory = targetLook.find(i => i.category === item.category);
      
      const newSourceLook = sourceLook.filter(i => i.id !== itemId);
      let newTargetLook = [...targetLook, item];
      
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
    
    // Train AI on confirmed look
    if (look.length > 0) {
      const currentPrefs = state.userStylePreferences;
      const newTags = look.flatMap(i => i.style_tags || []);
      const descriptions = look.map(i => i.description).filter(Boolean);
      const allStyles = Array.from(new Set([...currentPrefs.likedStyles, ...newTags]));
      const allDescriptions = Array.from(new Set([...currentPrefs.favoriteDescriptions, ...descriptions])).slice(-20);
      const updatedPrefs: UserStylePreferences = {
        likedStyles: allStyles,
        favoriteDescriptions: allDescriptions,
        likedLookCount: currentPrefs.likedLookCount + 1,
      };
      try {
        localStorage.setItem('ps_user_style_prefs', JSON.stringify(updatedPrefs));
      } catch (e) {
        console.warn('Failed to save updated style preferences to localStorage:', e);
      }
      set({ userStylePreferences: updatedPrefs });
    }

    state.moveToDirty(ids);
    const lookKey = `look${lookId}` as 'lookA' | 'lookB' | 'lookC' | 'lookD';
    set({ [lookKey]: [] });
  },

  addClothing: async (item: Omit<ClothingItem, 'id' | 'created_at'>, userId?: string) => {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('clothes')
          .insert({
            user_id: userId,
            image_url: item.image_url,
            description: item.description,
            warmth_level: item.warmth_level,
            style_tags: item.style_tags,
            category: item.category,
            sub_category: item.sub_category,
            status: item.status || 'clean',
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newItem: ClothingItem = {
            id: data.id,
            user_id: data.user_id,
            image_url: data.image_url,
            description: data.description || item.description,
            warmth_level: data.warmth_level,
            style_tags: data.style_tags || [],
            category: data.category as ClothingCategory,
            sub_category: data.sub_category,
            last_worn: data.last_worn,
            status: data.status,
            created_at: data.created_at,
          };
          set((state) => ({ clothes: [newItem, ...state.clothes] }));
          return;
        }
      }
    } catch (err) {
      console.error('Failed to insert into Supabase clothes, saving locally:', err);
    }

    const fallbackItem: ClothingItem = {
      ...item,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    set((state) => ({ clothes: [fallbackItem, ...state.clothes] }));
  },

  removeClothing: async (itemId: string, userId?: string) => {
    try {
      let query = supabase.from('clothes').delete().eq('id', itemId);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { error } = await query;
      if (error) {
        console.error('Error deleting clothing from Supabase:', error);
      }
    } catch (err) {
      console.error('Error deleting clothing from Supabase:', err);
    }

    set((state) => ({
      clothes: state.clothes.filter(c => c.id !== itemId),
      lookA: state.lookA.filter(c => c.id !== itemId),
      lookB: state.lookB.filter(c => c.id !== itemId),
      lookC: state.lookC.filter(c => c.id !== itemId),
      lookD: state.lookD.filter(c => c.id !== itemId),
    }));
  },

  clearAllClothes: async (userId?: string) => {
    try {
      if (userId) {
        const { error } = await supabase.from('clothes').delete().eq('user_id', userId);
        if (error) {
          console.error('Error deleting all clothes from Supabase:', error);
        }
      }
    } catch (err) {
      console.error('Error clearing clothes from Supabase:', err);
    }

    set({
      clothes: [],
      lookA: [],
      lookB: [],
      lookC: [],
      lookD: [],
      selectedLaundryItems: [],
    });
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
      
      if (look.some(i => i.id === item.id)) return state;
      
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
