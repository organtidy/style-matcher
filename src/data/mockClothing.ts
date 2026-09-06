import { ClothingItem, WeatherData } from '@/types/clothing';

export const mockClothingItems: ClothingItem[] = [
  // --- HOMEM ---
  // Tops (Homem)
  {
    id: 'm-top-1',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'Camiseta branca básica masculina',
    warmth_level: 1,
    style_tags: ['casual', 'básico', 'minimalista'],
    last_worn: null,
    category: 'top',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-top-2',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    description: 'Camisa social azul masculina',
    warmth_level: 2,
    style_tags: ['formal', 'elegante', 'trabalho'],
    last_worn: null,
    category: 'top',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Bottoms (Homem)
  {
    id: 'm-bottom-1',
    image_url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=400&fit=crop',
    description: 'Calça jeans escura masculina',
    warmth_level: 3,
    style_tags: ['casual', 'versátil'],
    last_worn: null,
    category: 'bottom',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-bottom-2',
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
    description: 'Shorts cargo bege masculino',
    warmth_level: 1,
    style_tags: ['casual', 'verão', 'relaxado'],
    last_worn: null,
    category: 'bottom',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Shoes (Homem)
  {
    id: 'm-shoes-1',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    description: 'Tênis branco minimalista',
    warmth_level: 2,
    style_tags: ['minimalista', 'casual', 'versátil'],
    last_worn: null,
    category: 'shoes',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-shoes-2',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    description: 'Tênis esportivo vermelho',
    warmth_level: 2,
    style_tags: ['esportivo', 'streetwear'],
    last_worn: null,
    category: 'shoes',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Accessories (Homem)
  {
    id: 'm-acc-1',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    description: 'Boné preto NY',
    warmth_level: 1,
    style_tags: ['streetwear', 'casual'],
    last_worn: null,
    category: 'accessory',
    sub_category: 'bone',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-acc-2',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    description: 'Relógio prata masculino',
    warmth_level: 1,
    style_tags: ['elegante', 'formal'],
    last_worn: null,
    category: 'accessory',
    sub_category: 'relogio',
    status: 'clean',
    created_at: new Date().toISOString(),
  },

  // --- MULHER ---
  // Dresses (Mulher)
  {
    id: 'w-dress-1',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
    description: 'Vestido longo floral de verão',
    warmth_level: 1,
    style_tags: ['verão', 'elegante', 'casual'],
    last_worn: null,
    category: 'dress',
    sub_category: 'vestido_longo',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'w-dress-2',
    image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop',
    description: 'Vestido preto clássico de festa',
    warmth_level: 2,
    style_tags: ['formal', 'elegante', 'noite'],
    last_worn: null,
    category: 'dress',
    sub_category: 'vestido_curto',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Tops (Mulher)
  {
    id: 'w-top-1',
    image_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=400&fit=crop',
    description: 'Blusa de seda rosa feminina',
    warmth_level: 1,
    style_tags: ['elegante', 'trabalho', 'casual'],
    last_worn: null,
    category: 'top',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'w-top-2',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop',
    description: 'Top cropped branco casual',
    warmth_level: 1,
    style_tags: ['verão', 'casual', 'streetwear'],
    last_worn: null,
    category: 'top',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Bottoms (Mulher)
  {
    id: 'w-bottom-1',
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop',
    description: 'Saia plissada rosa chá',
    warmth_level: 1,
    style_tags: ['elegante', 'romântico', 'casual'],
    last_worn: null,
    category: 'bottom',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'w-bottom-2',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop',
    description: 'Calça jeans cintura alta feminina',
    warmth_level: 2,
    style_tags: ['casual', 'versátil'],
    last_worn: null,
    category: 'bottom',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Shoes (Mulher)
  {
    id: 'w-shoes-1',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop',
    description: 'Scarpin salto alto preto',
    warmth_level: 2,
    style_tags: ['formal', 'elegante', 'festa'],
    last_worn: null,
    category: 'shoes',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'w-shoes-2',
    image_url: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=400&h=400&fit=crop',
    description: 'Sandália salto bloco nude',
    warmth_level: 1,
    style_tags: ['casual', 'elegante', 'verão'],
    last_worn: null,
    category: 'shoes',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  // Accessories (Mulher)
  {
    id: 'w-acc-1',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    description: 'Colar delicado dourado',
    warmth_level: 1,
    style_tags: ['elegante', 'minimalista'],
    last_worn: null,
    category: 'accessory',
    sub_category: 'colar',
    status: 'clean',
    created_at: new Date().toISOString(),
  },
  {
    id: 'w-acc-2',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    description: 'Brincos de pérola clássicos',
    warmth_level: 1,
    style_tags: ['elegante', 'formal'],
    last_worn: null,
    category: 'accessory',
    sub_category: 'brinco',
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
  const cleanClothes = clothes.length > 0 ? clothes.filter(c => c.status === 'clean') : mockClothingItems;
  
  const tops = cleanClothes.filter(c => c.category === 'top');
  const bottoms = cleanClothes.filter(c => c.category === 'bottom' && !c.description?.toLowerCase().includes('vestido'));
  const shoes = cleanClothes.filter(c => c.category === 'shoes');
  const dresses = cleanClothes.filter(c => c.category === 'dress' || c.description?.toLowerCase().includes('vestido'));
  const accessories = cleanClothes.filter(c => c.category === 'accessory');

  // Look A: Multi-peças clássico (top + bottom + shoes + acessório)
  const lookA = [
    tops[0] || mockClothingItems[0],
    bottoms[0] || mockClothingItems[2],
    shoes[0] || mockClothingItems[4],
    accessories[0] || mockClothingItems[6],
  ].filter(Boolean);

  // Look B: Vestido (se houver) OU Multi-peças feminino
  const lookB = dresses.length > 0
    ? [
        dresses[0],
        shoes[1] || shoes[0] || mockClothingItems[14],
        accessories[1] || mockClothingItems[16],
      ].filter(Boolean)
    : [
        tops[1] || tops[0] || mockClothingItems[10],
        bottoms[1] || bottoms[0] || mockClothingItems[12],
        shoes[1] || shoes[0] || mockClothingItems[14],
        accessories[1] || mockClothingItems[16],
      ].filter(Boolean);

  return { lookA, lookB };
};
