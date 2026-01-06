import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Prepare the image for Google Vision API
    let imageContent: any = {};
    if (image_base64) {
      imageContent = { content: image_base64 };
    } else if (image_url) {
      imageContent = { source: { imageUri: image_url } };
    }

    // Call Google Cloud Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: imageContent,
              features: [
                { type: 'LABEL_DETECTION', maxResults: 15 },
                { type: 'IMAGE_PROPERTIES', maxResults: 5 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
              ],
            },
          ],
        }),
      }
    );

    const visionData = await visionResponse.json();
    console.log("Vision API response:", JSON.stringify(visionData));

    if (visionData.error) {
      throw new Error(visionData.error.message);
    }

    const response = visionData.responses?.[0];
    if (!response) {
      throw new Error('Sem resposta da Vision API');
    }

    // Extract labels
    const labels = response.labelAnnotations?.map((l: any) => l.description.toLowerCase()) || [];
    
    // Extract dominant colors
    const colors = response.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const detectedColors = colors.slice(0, 5).map((c: any) => {
      const { red, green, blue } = c.color;
      return `rgb(${Math.round(red || 0)}, ${Math.round(green || 0)}, ${Math.round(blue || 0)})`;
    });

    // Extract objects
    const objects = response.localizedObjectAnnotations?.map((o: any) => o.name.toLowerCase()) || [];

    // Determine category based on detected labels and objects
    const categoryMapping: Record<string, { category: string; subCategory?: string }> = {
      // Top
      'shirt': { category: 'top', subCategory: 'shirt' },
      't-shirt': { category: 'top', subCategory: 't-shirt' },
      'blouse': { category: 'top', subCategory: 'blouse' },
      'polo shirt': { category: 'top', subCategory: 'polo' },
      'top': { category: 'top' },
      
      // Outerwear
      'jacket': { category: 'outerwear', subCategory: 'jacket' },
      'coat': { category: 'outerwear', subCategory: 'coat' },
      'hoodie': { category: 'outerwear', subCategory: 'hoodie' },
      'sweater': { category: 'outerwear', subCategory: 'sweater' },
      'cardigan': { category: 'outerwear', subCategory: 'cardigan' },
      
      // Bottom
      'pants': { category: 'bottom', subCategory: 'pants' },
      'jeans': { category: 'bottom', subCategory: 'jeans' },
      'shorts': { category: 'bottom', subCategory: 'shorts' },
      'skirt': { category: 'bottom', subCategory: 'skirt' },
      'trousers': { category: 'bottom', subCategory: 'trousers' },
      
      // Shoes
      'shoe': { category: 'shoes' },
      'sneakers': { category: 'shoes', subCategory: 'sneakers' },
      'boots': { category: 'shoes', subCategory: 'boots' },
      'sandals': { category: 'shoes', subCategory: 'sandals' },
      'footwear': { category: 'shoes' },
      
      // Accessories
      'hat': { category: 'accessory', subCategory: 'hat' },
      'cap': { category: 'accessory', subCategory: 'cap' },
      'sunglasses': { category: 'accessory', subCategory: 'sunglasses' },
      'watch': { category: 'accessory', subCategory: 'watch' },
      'bracelet': { category: 'accessory', subCategory: 'bracelet' },
      'necklace': { category: 'accessory', subCategory: 'necklace' },
      'earring': { category: 'accessory', subCategory: 'earring' },
      'belt': { category: 'accessory', subCategory: 'belt' },
      'bag': { category: 'accessory', subCategory: 'bag' },
      'glasses': { category: 'accessory', subCategory: 'glasses' },
    };

    // Find best matching category
    let detectedCategory = 'top'; // default
    let detectedSubCategory: string | null = null;
    let confidence = 0;

    const allDetected = [...labels, ...objects];
    
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

    // Estimate warmth level based on category and materials
    let warmthLevel = 3; // default medium
    const warmKeywords = ['wool', 'fleece', 'thick', 'warm', 'winter', 'sweater', 'coat', 'jacket', 'hoodie'];
    const coolKeywords = ['thin', 'light', 'summer', 'shorts', 'sandals', 'sleeveless', 'tank'];
    
    if (allDetected.some(l => warmKeywords.some(w => l.includes(w)))) {
      warmthLevel = 4;
    } else if (allDetected.some(l => coolKeywords.some(w => l.includes(w)))) {
      warmthLevel = 2;
    }

    // Extract style tags
    const styleTags = labels.filter((l: string) => 
      ['casual', 'formal', 'sporty', 'elegant', 'vintage', 'modern', 'classic', 'street', 'bohemian'].includes(l)
    );

    // Build description
    const description = objects.length > 0 
      ? objects.join(', ') 
      : labels.slice(0, 3).join(', ');

    const result = {
      category: detectedCategory,
      sub_category: detectedSubCategory,
      description: description,
      style_tags: styleTags.length > 0 ? styleTags : ['casual'],
      warmth_level: warmthLevel,
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
