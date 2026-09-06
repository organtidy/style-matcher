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
  userPreferences?: {
    likedStyles?: string[];
    favoriteDescriptions?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      clothes = [],
      weather = { temperature: 22, condition: 'Clear', description: 'agradável' },
      laundryItems = [],
      occasion = 'casual',
      numberOfLooks = 2,
      userPreferences = {}
    }: RequestBody = body;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_AI_API_KEY');

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY não configurada no Supabase (Environment Secrets).' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received fashion consultation request:', { 
      clothesCount: clothes?.length, 
      laundryCount: laundryItems?.length,
      occasion,
      numberOfLooks,
      likedStylesCount: userPreferences?.likedStyles?.length || 0,
    });

    // Filter only clean clothes
    const cleanClothes = clothes.filter(c => c.status === 'clean');
    
    if (cleanClothes.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma roupa limpa disponível para montar looks. Lave suas roupas ou adicione novas peças!' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group by category
    const clothesByCategory = cleanClothes.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ClothingItem[]>);

    const userStylesText = userPreferences?.likedStyles?.length 
      ? `O usuário já expressou que adora os seguintes estilos e estéticas: ${userPreferences.likedStyles.join(', ')}.` 
      : '';
    const userPiecesText = userPreferences?.favoriteDescriptions?.length 
      ? `Peças que o usuário mais gosta ou confirmou recentemente: ${userPreferences.favoriteDescriptions.join('; ')}.`
      : '';

    const prompt = `Você é um consultor de moda e estilo pessoal personalizado. Analise as roupas limpas disponíveis no guarda-roupa e monte ${numberOfLooks} looks completos, harmônicos e elegantes para a ocasião desejada.

## ROUPAS DISPONÍVEIS (LIMPAS)
${Object.entries(clothesByCategory).map(([category, items]) => `
### ${category.toUpperCase()}
${items.map(item => `- ID: "${item.id}" | ${item.description} | Tags: ${(item.style_tags || []).join(', ')}`).join('\n')}`).join('\n')}

## ROUPAS NA LAVANDERIA (NÃO DISPONÍVEIS)
${laundryItems.length > 0 ? laundryItems.map(item => `- ${item.description}`).join('\n') : 'Nenhuma'}

## OCASIÃO DESEJADA
${occasion}
${userStylesText || userPiecesText ? `
## PREFERÊNCIAS E APRENDIZADO DE ESTILO DO USUÁRIO
${userStylesText}
${userPiecesText}
* DIRETRIZ DE APRENDIZADO: Aja como o Personal Stylist fiel do usuário. Priorize combinações e peças que conversem com as preferências e estilos que ele mais gosta!
` : ''}

## REGRAS DE COMBINAÇÃO
1. Cada look DEVE respeitar rigorosamente a anatomia correta das peças:
   - Opção Multi-peças: 1 top (camisa/blusa/camiseta) + 1 bottom (calça/short/saia - NUNCA vestido!) + 1 shoes (calçado).
   - Opção Vestido: 1 dress (vestido) + 1 shoes (calçado).
2. NUNCA misture um vestido (dress) como parte de baixo (bottom) nem em combinação com top! Vestido é peça única de corpo inteiro.
3. Outerwear (casacos, jaquetas, blazers) e Accessories são complementos opcionais para valorizar o visual.
4. Foque na harmonia visual, cores, corte e adequação ao estilo do usuário e à ocasião (${occasion}).
5. NÃO invente novos IDs! Use EXATAMENTE os IDs existentes listados nas roupas disponíveis.
6. Explique de forma envolvente e profissional por que cada combinação foi escolhida (pode mencionar o estilo preferido dele se aplicável).
${occasion === 'especiais' ? `7. COMO É UMA OCASIÃO ESPECIAL, recomende uma harmonização de vinho com a ocasião (com Nome do vinho, Safra e Motivo da escolha).` : ''}

## FORMATO DE RESPOSTA OBRIGATÓRIO (APENAS JSON PURO, SEM TEXTO EXTRA)
{
  "looks": [
    {
      "name": "Nome criativo do look",
      "items": ["id1", "id2", "id3"],
      "explanation": "Breve justificativa estilística"
    }
  ],
  "tips": "Dica prática de estilo para a ocasião"${occasion === 'especiais' ? `,
  "wine": {
    "name": "Nome do vinho",
    "vintage": "Safra recomendada",
    "reason": "Por que harmoniza com a ocasião"
  }` : ''}
}`;

    const geminiPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    };

    const models = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let geminiResponseText = '';
    let lastError = '';

    for (const model of models) {
      try {
        console.log(`Calling Gemini model ${model}...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          geminiResponseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (geminiResponseText) break;
        } else {
          lastError = await response.text();
          console.warn(`Model ${model} failed:`, response.status, lastError);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`Fetch error with model ${model}:`, lastError);
      }
    }

    if (!geminiResponseText) {
      throw new Error(`Erro ao consultar Gemini AI: ${lastError}`);
    }

    // Clean JSON from response
    const jsonStr = geminiResponseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedLooks = JSON.parse(jsonStr);

    // Map item IDs back to full clothing objects
    const looksWithItems = (parsedLooks.looks || []).map((look: any) => ({
      ...look,
      items: (look.items || [])
        .map((id: string) => cleanClothes.find(c => String(c.id) === String(id)))
        .filter(Boolean)
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        looks: looksWithItems,
        tips: parsedLooks.tips || 'Aposte no conforto e no equilíbrio de cores.',
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
