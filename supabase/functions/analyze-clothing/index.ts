import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Strict whitelist: only these labels/objects count as clothing
const CLOTHING_KEYWORDS = new Set([
  'shirt', 't-shirt', 'blouse', 'polo shirt', 'top', 'tank top', 'camisole',
  'jacket', 'coat', 'hoodie', 'sweater', 'cardigan', 'blazer', 'vest', 'parka',
  'pants', 'jeans', 'shorts', 'skirt', 'trousers', 'leggings', 'chinos',
  'dress', 'gown', 'jumpsuit', 'romper', 'overalls', 'suit',
  'shoe', 'sneakers', 'boots', 'sandals', 'footwear', 'loafers', 'heels', 'flats', 'slippers',
  'hat', 'cap', 'beanie', 'sunglasses', 'watch', 'bracelet', 'necklace', 'earring',
  'belt', 'bag', 'handbag', 'backpack', 'glasses', 'scarf', 'gloves', 'tie', 'bow tie',
  'bikini', 'swimwear', 'underwear', 'bra', 'socks',
]);

// Broad terms that alone are NOT enough — need a specific match too
const WEAK_KEYWORDS = new Set([
  'clothing', 'clothes', 'fashion', 'apparel', 'garment', 'wear', 'outfit',
  'fabric', 'textile', 'cotton', 'silk', 'wool', 'denim', 'leather', 'lace',
  'sleeve', 'collar', 'pocket', 'zipper', 'button',
]);

// Blacklist: body parts and non-clothing objects that Vision might return
const BLACKLIST = new Set([
  'finger', 'hand', 'arm', 'leg', 'foot', 'face', 'head', 'skin', 'nail',
  'thumb', 'wrist', 'elbow', 'knee', 'toe', 'body', 'person', 'human',
  'gesture', 'sign language', 'fist', 'palm', 'middle finger',
  'food', 'animal', 'plant', 'car', 'vehicle', 'furniture', 'electronics',
]);

const categoryMapping: Record<string, { category: string; subCategory?: string }> = {
  'shirt': { category: 'top', subCategory: 'shirt' },
  't-shirt': { category: 'top', subCategory: 't-shirt' },
  'blouse': { category: 'top', subCategory: 'blouse' },
  'polo shirt': { category: 'top', subCategory: 'polo' },
  'top': { category: 'top' },
  'tank top': { category: 'top', subCategory: 'tank top' },
  'jacket': { category: 'outerwear', subCategory: 'jacket' },
  'coat': { category: 'outerwear', subCategory: 'coat' },
  'hoodie': { category: 'outerwear', subCategory: 'hoodie' },
  'sweater': { category: 'outerwear', subCategory: 'sweater' },
  'cardigan': { category: 'outerwear', subCategory: 'cardigan' },
  'blazer': { category: 'outerwear', subCategory: 'blazer' },
  'vest': { category: 'outerwear', subCategory: 'vest' },
  'pants': { category: 'bottom', subCategory: 'pants' },
  'jeans': { category: 'bottom', subCategory: 'jeans' },
  'shorts': { category: 'bottom', subCategory: 'shorts' },
  'skirt': { category: 'bottom', subCategory: 'skirt' },
  'trousers': { category: 'bottom', subCategory: 'trousers' },
  'dress': { category: 'bottom', subCategory: 'dress' },
  'shoe': { category: 'shoes' },
  'sneakers': { category: 'shoes', subCategory: 'sneakers' },
  'boots': { category: 'shoes', subCategory: 'boots' },
  'sandals': { category: 'shoes', subCategory: 'sandals' },
  'footwear': { category: 'shoes' },
  'loafers': { category: 'shoes', subCategory: 'loafers' },
  'heels': { category: 'shoes', subCategory: 'heels' },
  'hat': { category: 'accessory', subCategory: 'bone' },
  'cap': { category: 'accessory', subCategory: 'bone' },
  'beanie': { category: 'accessory', subCategory: 'bone' },
  'sunglasses': { category: 'accessory', subCategory: 'oculos' },
  'glasses': { category: 'accessory', subCategory: 'oculos' },
  'watch': { category: 'accessory', subCategory: 'relogio' },
  'bracelet': { category: 'accessory', subCategory: 'pulseira' },
  'necklace': { category: 'accessory', subCategory: 'colar' },
  'earring': { category: 'accessory', subCategory: 'brinco' },
  'belt': { category: 'accessory', subCategory: 'outro' },
  'bag': { category: 'accessory', subCategory: 'outro' },
  'handbag': { category: 'accessory', subCategory: 'outro' },
  'backpack': { category: 'accessory', subCategory: 'outro' },
  'scarf': { category: 'accessory', subCategory: 'outro' },
};

function detectOccasion(labels: string[], category: string, subCategory?: string | null): string {
  const all = labels.join(' ');
  
  // Formal / work
  if (['blazer', 'suit', 'tie', 'bow tie'].some(k => all.includes(k)) || 
      (subCategory && ['blazer', 'vest'].includes(subCategory))) {
    return 'trabalho';
  }
  // Special occasions
  if (['dress', 'gown', 'formal', 'elegant', 'luxury', 'silk'].some(k => all.includes(k))) {
    return 'especiais';
  }
  // Sporty / daily
  if (['sporty', 'athletic', 'sport', 'sneakers', 'hoodie', 'leggings'].some(k => all.includes(k))) {
    return 'diario';
  }
  // Default casual
  return 'casual';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!GOOGLE_VISION_API_KEY) {
      throw new Error('GOOGLE_VISION_API_KEY não configurada');
    }

    const { image_url, image_base64 } = await req.json();
    if (!image_url && !image_base64) {
      throw new Error('Forneça image_url ou image_base64');
    }

    console.log("Analyzing clothing image...");

    const imageContent = image_base64
      ? { content: image_base64 }
      : { source: { imageUri: image_url } };

    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: imageContent,
            features: [
              { type: 'LABEL_DETECTION', maxResults: 15 },
              { type: 'IMAGE_PROPERTIES', maxResults: 5 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
            ],
          }],
        }),
      }
    );

    const visionData = await visionResponse.json();
    console.log("Vision API response:", JSON.stringify(visionData));

    if (visionData.error) throw new Error(visionData.error.message);

    const response = visionData.responses?.[0];
    if (!response) throw new Error('Sem resposta da Vision API');

    const labels = response.labelAnnotations?.map((l: any) => l.description.toLowerCase()) || [];
    const objects = response.localizedObjectAnnotations?.map((o: any) => o.name.toLowerCase()) || [];
    const allDetected = [...labels, ...objects];

    // --- STRICT VALIDATION ---
    // Check blacklist first
    const hasBlacklisted = allDetected.some(item =>
      [...BLACKLIST].some(bl => item.includes(bl) || bl.includes(item))
    );

    // Check for specific clothing keyword (not just weak/generic ones)
    const hasSpecificClothing = allDetected.some(item =>
      [...CLOTHING_KEYWORDS].some(kw => item.includes(kw) || kw.includes(item))
    );

    // Only weak/generic matches don't count
    const hasOnlyWeak = !hasSpecificClothing && allDetected.some(item =>
      [...WEAK_KEYWORDS].some(kw => item.includes(kw) || kw.includes(item))
    );

    if (!hasSpecificClothing || (hasBlacklisted && !hasSpecificClothing)) {
      console.log("NOT clothing. Labels:", labels, "Objects:", objects);
      return new Response(JSON.stringify({
        error: 'not_clothing',
        message: 'Essa imagem não parece ser uma peça de roupa ou acessório. Por favor, envie uma foto de uma roupa, calçado ou acessório.',
        raw_labels: labels,
        raw_objects: objects,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract dominant colors
    const colors = response.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const detectedColors = colors.slice(0, 5).map((c: any) => {
      const { red, green, blue } = c.color;
      return `rgb(${Math.round(red || 0)}, ${Math.round(green || 0)}, ${Math.round(blue || 0)})`;
    });

    // Find best matching category
    let detectedCategory = 'top';
    let detectedSubCategory: string | null = null;
    let confidence = 0;

    for (const item of allDetected) {
      for (const [key, value] of Object.entries(categoryMapping)) {
        if (item.includes(key) || key.includes(item)) {
          const labelAnnotation = response.labelAnnotations?.find(
            (l: any) => l.description.toLowerCase().includes(key)
          );
          const score = labelAnnotation?.score || 0.5;
          if (score > confidence) {
            confidence = score;
            detectedCategory = value.category;
            detectedSubCategory = value.subCategory || null;
          }
        }
      }
    }

    // Warmth level
    let warmthLevel = 3;
    const warmKw = ['wool', 'fleece', 'thick', 'warm', 'winter', 'sweater', 'coat', 'jacket', 'hoodie', 'parka'];
    const coolKw = ['thin', 'light', 'summer', 'shorts', 'sandals', 'sleeveless', 'tank'];
    if (allDetected.some(l => warmKw.some(w => l.includes(w)))) warmthLevel = 4;
    else if (allDetected.some(l => coolKw.some(w => l.includes(w)))) warmthLevel = 2;

    // Style tags
    const styleTags = labels.filter((l: string) =>
      ['casual', 'formal', 'sporty', 'elegant', 'vintage', 'modern', 'classic', 'street', 'bohemian'].includes(l)
    );

    // Occasion detection
    const occasion = detectOccasion(allDetected, detectedCategory, detectedSubCategory);

    const description = objects.length > 0
      ? objects.join(', ')
      : labels.slice(0, 3).join(', ');

    const result = {
      category: detectedCategory,
      sub_category: detectedSubCategory,
      description,
      style_tags: styleTags.length > 0 ? styleTags : ['casual'],
      warmth_level: warmthLevel,
      occasion,
      ai_detected_colors: detectedColors,
      ai_confidence: confidence,
      raw_labels: labels,
      raw_objects: objects,
    };

    console.log("Analysis result:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in analyze-clothing function:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
