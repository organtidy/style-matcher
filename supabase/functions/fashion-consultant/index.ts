import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClothingItem {
  id: string;
  description: string;
  warmth_level: number;
  style_tags: string[];
  category: string;
  sub_category?: string;
  status: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
}

interface RequestBody {
  clothes: ClothingItem[];
  weather: WeatherData;
  laundryItems?: ClothingItem[];
  occasion?: string;
  numberOfLooks?: number;
}

const occasionLabels: Record<string, string> = {
  casual: 'Casual',
  especiais: 'Especiais',
  diario: 'Dia a dia',
  trabalho: 'Trabalho',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { clothes, weather, laundryItems = [], occasion = 'casual', numberOfLooks = 2 }: RequestBody = await req.json();

    console.log('Received request:', { 
      clothesCount: clothes?.length, 
      weather, 
      laundryCount: laundryItems?.length,
      occasion,
      numberOfLooks 
    });

    // Filter only clean clothes
    const cleanClothes = clothes.filter(c => c.status === 'clean');
    
    // Group by category
    const clothesByCategory = cleanClothes.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ClothingItem[]>);

    const prompt = `Você é um consultor de moda especializado. Analise o guarda-roupa e condições abaixo para sugerir ${numberOfLooks} looks completos.

## CLIMA ATUAL
- Temperatura: ${weather.temperature}°C
- Condição: ${weather.condition}
- Descrição: ${weather.description}

## ROUPAS DISPONÍVEIS (LIMPAS)
${Object.entries(clothesByCategory).map(([category, items]) => `
### ${category.toUpperCase()}
${items.map(item => `- ID: ${item.id} | ${item.description} | Aquecimento: ${item.warmth_level}/5 | Tags: ${item.style_tags.join(', ')}`).join('\n')}`).join('\n')}

## ROUPAS NA LAVANDERIA (INDISPONÍVEIS)
${laundryItems.length > 0 ? laundryItems.map(item => `- ${item.description}`).join('\n') : 'Nenhuma'}

## OCASIÃO
${occasion}

## REGRAS
1. Cada look DEVE ter: top, bottom, shoes (obrigatórios)
2. Outerwear é opcional, recomende baseado na temperatura
3. Accessories são opcionais para complementar
4. Considere o nível de aquecimento vs temperatura:
   - Temp < 15°C: prefira warmth_level 4-5
   - Temp 15-22°C: prefira warmth_level 2-3
   - Temp > 22°C: prefira warmth_level 1-2
5. Combine estilos compatíveis (use as style_tags)
6. NÃO repita peças entre os looks diferentes
7. Explique brevemente por que cada combinação funciona
${occasion === 'especiais' ? `8. IMPORTANTE: Como esta é uma ocasião especial, sugira um vinho ideal para acompanhar o momento. Considere a temperatura atual (${weather.temperature}°C) para recomendar:
   - Se temp < 18°C: vinho tinto encorpado
   - Se temp 18-25°C: vinho tinto médio ou branco encorpado
   - Se temp > 25°C: vinho branco, rosé ou espumante
   Inclua o NOME EXATO do vinho e a SAFRA recomendada.` : ''}

## FORMATO DE RESPOSTA (JSON)
{
  "looks": [
    {
      "name": "Nome criativo do look",
      "items": ["id1", "id2", "id3"],
      "explanation": "Por que este look funciona para o clima e ocasião"
    }
  ],
  "tips": "Dica geral de estilo para o dia"${occasion === 'especiais' ? `,
  "wine": {
    "name": "Nome do vinho",
    "vintage": "Safra (ano)",
    "reason": "Por que combina com a ocasião e temperatura"
  }` : ''}
}

Responda APENAS com o JSON, sem texto adicional.`;

    console.log('Calling Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Gemini API error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiResponse = await response.json();
    console.log('Gemini response received');

    const textContent = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      console.error('No text content in Gemini response:', geminiResponse);
      return new Response(
        JSON.stringify({ error: 'No content in Gemini response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (remove markdown code blocks if present)
    let parsedLooks;
    try {
      const jsonStr = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedLooks = JSON.parse(jsonStr);
      console.log('Parsed looks:', parsedLooks);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', textContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw: textContent }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map item IDs to full clothing objects
    const looksWithItems = parsedLooks.looks.map((look: any) => ({
      ...look,
      items: look.items.map((id: string) => cleanClothes.find(c => c.id === id)).filter(Boolean)
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        looks: looksWithItems,
        tips: parsedLooks.tips,
        wine: parsedLooks.wine || null,
        weather,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fashion consultant error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
