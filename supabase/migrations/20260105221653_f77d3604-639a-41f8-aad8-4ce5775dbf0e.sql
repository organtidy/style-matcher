-- Create clothes table
CREATE TABLE public.clothes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  warmth_level INTEGER NOT NULL DEFAULT 3 CHECK (warmth_level >= 1 AND warmth_level <= 5),
  style_tags TEXT[] DEFAULT '{}',
  last_worn TIMESTAMP WITH TIME ZONE,
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'shoes', 'outerwear', 'accessory')),
  sub_category TEXT CHECK (sub_category IN ('bone', 'brinco', 'pulseira', 'relogio', 'oculos', 'colar', 'outro')),
  status TEXT NOT NULL DEFAULT 'clean' CHECK (status IN ('clean', 'dirty')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Colunas para preencher via AI Vision API:
  -- description: descrição gerada pela IA
  -- style_tags: tags de estilo identificadas pela IA
  -- warmth_level: nível de calor estimado pela IA
  -- category: categoria identificada pela IA
  -- sub_category: subcategoria para acessórios
  
  -- Coluna para API de Clima:
  -- warmth_level: usado para filtrar roupas adequadas à temperatura
  ai_detected_colors TEXT[],
  ai_confidence DECIMAL(3,2)
);

-- Create laundry_log table
CREATE TABLE public.laundry_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clothing_id UUID NOT NULL REFERENCES public.clothes(id) ON DELETE CASCADE,
  washed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_cache table for weather API data
CREATE TABLE public.weather_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  temperature DECIMAL(4,1) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('sunny', 'cloudy', 'rainy', 'cold', 'hot')),
  description TEXT,
  icon TEXT,
  location TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Colunas para preencher via Weather API:
  -- temperature: temperatura atual em Celsius
  -- condition: condição climática
  -- description: descrição do clima
  -- icon: código do ícone (ex: "01d" do OpenWeatherMap)
  -- location: localização do usuário
  api_response JSONB
);

-- Enable RLS
ALTER TABLE public.clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clothes
CREATE POLICY "Users can view their own clothes" 
ON public.clothes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clothes" 
ON public.clothes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothes" 
ON public.clothes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothes" 
ON public.clothes FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for laundry_log
CREATE POLICY "Users can view their own laundry logs" 
ON public.laundry_log FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.clothes 
  WHERE clothes.id = laundry_log.clothing_id 
  AND clothes.user_id = auth.uid()
));

CREATE POLICY "Users can insert laundry logs for their clothes" 
ON public.laundry_log FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.clothes 
  WHERE clothes.id = laundry_log.clothing_id 
  AND clothes.user_id = auth.uid()
));

-- RLS Policies for weather_cache
CREATE POLICY "Users can view their own weather cache" 
ON public.weather_cache FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather cache" 
ON public.weather_cache FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather cache" 
ON public.weather_cache FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_clothes_user_status ON public.clothes(user_id, status);
CREATE INDEX idx_clothes_category ON public.clothes(category);
CREATE INDEX idx_laundry_log_clothing ON public.laundry_log(clothing_id);
CREATE INDEX idx_weather_cache_user ON public.weather_cache(user_id, fetched_at DESC);