import { ClothingCategory } from '@/types/clothing';

export type SlotType = 'head' | 'top' | 'bottom' | 'shoes' | 'accessory-left' | 'accessory-right';

/** Maps each mannequin slot to the clothing categories it accepts */
export const slotTypeToCategories: Record<SlotType, ClothingCategory[]> = {
  'head': ['accessory'],
  'top': ['top', 'outerwear'],
  'bottom': ['bottom'],
  'shoes': ['shoes'],
  'accessory-left': ['accessory'],
  'accessory-right': ['accessory'],
};
