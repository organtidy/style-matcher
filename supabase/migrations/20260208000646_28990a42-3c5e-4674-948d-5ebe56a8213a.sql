
-- =============================================
-- FIX 1: Drop all RESTRICTIVE policies and recreate as PERMISSIVE
-- =============================================

-- CLOTHES table
DROP POLICY IF EXISTS "Users can delete their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can insert their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can update their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can view their own clothes" ON public.clothes;

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

-- LAUNDRY_LOG table
DROP POLICY IF EXISTS "Users can insert laundry logs for their clothes" ON public.laundry_log;
DROP POLICY IF EXISTS "Users can view their own laundry logs" ON public.laundry_log;

CREATE POLICY "Users can view their own laundry logs"
  ON public.laundry_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert laundry logs for their clothes"
  ON public.laundry_log FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own laundry logs"
  ON public.laundry_log FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own laundry logs"
  ON public.laundry_log FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()
  ));

-- WEATHER_CACHE table
DROP POLICY IF EXISTS "Users can insert their own weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can update their own weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can view their own weather cache" ON public.weather_cache;

CREATE POLICY "Users can view their own weather cache"
  ON public.weather_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather cache"
  ON public.weather_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather cache"
  ON public.weather_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weather cache"
  ON public.weather_cache FOR DELETE
  USING (auth.uid() = user_id);
