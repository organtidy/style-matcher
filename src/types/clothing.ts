export type ClothingCategory = 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory';

export type AccessorySubCategory = 'bone' | 'brinco' | 'pulseira' | 'relogio' | 'oculos' | 'colar' | 'outro';

export type ClothingStatus = 'clean' | 'dirty';

export type ClothingOccasion = 'casual' | 'especiais' | 'diario' | 'trabalho';

export interface ClothingItem {
  id: string;
  image_url: string;
  description: string;
  warmth_level: number; // 1-5, 1 = very light, 5 = very warm
  style_tags: string[];
  last_worn: string | null;
  category: ClothingCategory;
  sub_category?: AccessorySubCategory;
  occasion?: ClothingOccasion;
  status: ClothingStatus;
  created_at: string;
}

export interface Look {
  id: string;
  items: ClothingItem[];
}

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'cold' | 'hot';
  description: string;
  icon: string;
}

export interface LaundryLog {
  id: string;
  clothing_id: string;
  washed_at: string;
}
