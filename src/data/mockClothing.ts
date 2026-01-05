import { ClothingItem, WeatherData } from '@/types/clothing';

export const mockClothingItems: ClothingItem[] = [
  // Tops
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'Camiseta branca básica',
    warmth_level: 1,
    style_tags: ['casual', 'básico', 'minimalista'],
    last_worn: null,
    category: 'top',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    description: 'Camisa social azul',
    warmth_level: 2,
    style_tags: ['formal', 'elegante', 'trabalho'],
    last_worn: null,
    category: 'top',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop',
    description: 'Camiseta preta oversized',
    warmth_level: 1,
    style_tags: ['streetwear', 'casual', 'urbano'],
    last_worn: null,
    category: 'top',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Bottoms
  {
    id: '4',
    image_url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=400&fit=crop',
    description: 'Calça jeans escura',
    warmth_level: 3,
    style_tags: ['casual', 'versátil'],
    last_worn: null,
    category: 'bottom',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
    description: 'Shorts cargo bege',
    warmth_level: 1,
    style_tags: ['casual', 'verão', 'relaxado'],
    last_worn: null,
    category: 'bottom',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',
    description: 'Calça de moletom preta',
    warmth_level: 4,
    style_tags: ['streetwear', 'confortável', 'casual'],
    last_worn: null,
    category: 'bottom',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Shoes
  {
    id: '7',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    description: 'Nike Air Max vermelho',
    warmth_level: 2,
    style_tags: ['esportivo', 'streetwear', 'colorido'],
    last_worn: null,
    category: 'shoes',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '8',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    description: 'Tênis branco minimalista',
    warmth_level: 2,
    style_tags: ['minimalista', 'casual', 'versátil'],
    last_worn: null,
    category: 'shoes',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Outerwear
  {
    id: '9',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    description: 'Jaqueta jeans',
    warmth_level: 3,
    style_tags: ['casual', 'clássico', 'versátil'],
    last_worn: null,
    category: 'outerwear',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '10',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
    description: 'Moletom com capuz cinza',
    warmth_level: 4,
    style_tags: ['streetwear', 'confortável', 'casual'],
    last_worn: null,
    category: 'outerwear',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Accessories
  {
    id: '11',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    description: 'Boné preto NY',
    warmth_level: 1,
    style_tags: ['streetwear', 'casual', 'esportivo'],
    last_worn: null,
    category: 'accessory',
    sub_category: 'bone',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '12',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    description: 'Relógio prata minimalista',
    warmth_level: 1,
    style_tags: ['elegante', 'minimalista', 'formal'],
    last_worn: null,
    category: 'accessory',
    sub_category: 'relogio',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: '13',
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    description: 'Óculos de sol aviador',
    warmth_level: 1,
    style_tags: ['casual', 'verão', 'clássico'],
    last_worn: null,
    category: 'accessory',
    sub_category: 'oculos',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
];

export const mockWeather: WeatherData = {
  temperature: 24,
  condition: 'sunny',
  description: 'Ensolarado',
  icon: '☀️',
};

// Function to generate 2 different looks from available clean clothes
export const generateMockLooks = (clothes: ClothingItem[]) => {
  const cleanClothes = clothes.filter(c => c.status === 'clean');
  
  const tops = cleanClothes.filter(c => c.category === 'top');
  const bottoms = cleanClothes.filter(c => c.category === 'bottom');
  const shoes = cleanClothes.filter(c => c.category === 'shoes');
  const outerwear = cleanClothes.filter(c => c.category === 'outerwear');
  const accessories = cleanClothes.filter(c => c.category === 'accessory');

  const lookA = [
    tops[0],
    bottoms[0],
    shoes[0],
    accessories[0],
  ].filter(Boolean);

  const lookB = [
    tops[1] || tops[0],
    bottoms[1] || bottoms[0],
    shoes[1] || shoes[0],
    accessories[1] || accessories[0],
  ].filter(Boolean);

  return { lookA, lookB };
};
