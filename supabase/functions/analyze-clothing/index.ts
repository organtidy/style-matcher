import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_url, image_base64 } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_AI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada. Configure no Supabase Edge Functions Secrets.');
    }

    if (!image_url && !image_base64) {
      throw new Error('Forneça image_url ou image_base64');
    }

    let mimeType = 'image/jpeg';
    let base64Data = '';

    if (image_base64) {
      if (image_base64.includes(';base64,')) {
        const parts = image_base64.split(';base64,');
        mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        base64Data = parts[1];
      } else {
        base64Data = image_base64;
      }
    } else if (image_url) {
      // Fetch image from URL
      const imgRes = await fetch(image_url);
      if (!imgRes.ok) throw new Error('Não foi possível carregar a imagem da URL');
      const contentType = imgRes.headers.get('content-type');
      if (contentType) mimeType = contentType.split(';')[0];
      const buffer = await imgRes.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64Data = btoa(binary);
    }

    console.log("Analyzing clothing image with Gemini Flash Vision...");

    const prompt = `Você é um estilista e especialista em catalogação de moda.
Analise a imagem enviada com extrema precisão e responda APENAS com um objeto JSON válido (sem texto adicional, sem formatação markdown).

Regras rigorosas de validação:
1. Se a imagem NÃO for uma peça de vestuário, calçado ou acessório de moda vestível por seres humanos (por exemplo: brinquedos, bonecos, estátuas, colecionáveis como Baby Groot ou outros bonecos, animais, comida, veículo, objeto decorativo, paisagem), defina ESTRITAMENTE "is_clothing": false e adicione "message": "Isso não é uma peça de roupa!".
2. Se for uma peça de moda humana válida, defina "is_clothing": true e preencha:
   - "category": UMA entre ["top", "bottom", "shoes", "outerwear", "accessory", "dress"]
     * dress: vestidos (curtos, longos, midi, de festa, casuais), macacões ou peças inteiriças/únicas
     * top: camisetas, camisas, blusas, regatas, croppeds, tops
     * bottom: calças, shorts, bermudas, saias (NUNCA vestidos ou peças inteiriças!)
     * shoes: tênis, sapatos, saltos, botas, sandálias, chinelos
     * outerwear: jaquetas, casacos, blazers, sobretudos, moletons, cardigãs
     * accessory: bonés, chapéus, relógios, pulseiras, colares, brincos, óculos, cintos, bolsas
   - "sub_category": se category for "accessory", escolha UMA entre ["bone", "brinco", "pulseira", "relogio", "oculos", "colar", "outro"]. Se for dress, use "vestido_curto" ou "vestido_longo". Se não for acessório ou dress, use null.
   - "description": descrição curta e elegante em português (ex: "Camisa social branca de algodão", "Vestido floral midi", "Calça jeans slim azul", "Tênis casual branco")
   - "style_tags": array de 2 a 4 tags de estilo em português (ex: ["casual", "minimalista", "trabalho", "esportivo", "elegante", "streetwear", "romântico"])
   - "warmth_level": número de 1 a 5 baseado no isolamento térmico:
     * 1: muito leve / verão (regatas, shorts, vestidos leves, sandálias)
     * 2: leve (camisetas, camisas leves, tênis)
     * 3: médio (calça jeans, camisas manga longa, calçados fechados)
     * 4: quente (jaquetas, moletons, cardigãs)
     * 5: muito quente / inverno pesado (sobretudos, casacos de lã, botas pesadas)
   - "occasion": UMA entre ["casual", "trabalho", "especiais", "diario"]
   - "ai_detected_colors": array com até 3 cores predominantes em formato hexadecimal (ex: ["#FFFFFF", "#000000"])

Formato exato de resposta (JSON puro):
{
  "is_clothing": true,
  "category": "top",
  "sub_category": null,
  "description": "...",
  "style_tags": ["..."],
  "warmth_level": 2,
  "occasion": "casual",
  "ai_detected_colors": ["#1A1A1A"]
}`;

    const geminiPayload = {
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      }
    };

    // Try gemini-3.6-flash first, fallback to other modern flash models
    const models = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let geminiResponseText = '';
    let lastError = '';

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
          }
        );

        if (res.ok) {
          const resData = await res.json();
          geminiResponseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (geminiResponseText) break;
        } else {
          lastError = await res.text();
          console.warn(`Model ${model} failed:`, res.status, lastError);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`Fetch error with model ${model}:`, lastError);
      }
    }

    if (!geminiResponseText) {
      throw new Error(`Falha ao comunicar com Gemini AI: ${lastError}`);
    }

    // Clean JSON response
    const cleanedJson = geminiResponseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedJson);

    if (!parsed.is_clothing) {
      return new Response(JSON.stringify({
        error: 'not_clothing',
        message: 'Essa imagem não parece ser uma peça de roupa ou acessório. Por favor, envie uma foto de uma roupa, calçado ou acessório.',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = {
      category: parsed.category || 'top',
      sub_category: parsed.sub_category || null,
      description: parsed.description || 'Peça de vestuário',
      style_tags: Array.isArray(parsed.style_tags) && parsed.style_tags.length > 0 ? parsed.style_tags : ['casual'],
      warmth_level: typeof parsed.warmth_level === 'number' ? parsed.warmth_level : 2,
      occasion: parsed.occasion || 'casual',
      ai_detected_colors: parsed.ai_detected_colors || ['#000000'],
      ai_confidence: 0.95,
    };

    console.log("Analysis success:", JSON.stringify(result));

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
