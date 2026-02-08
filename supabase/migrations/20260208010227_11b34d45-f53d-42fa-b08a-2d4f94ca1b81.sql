
-- Fix RLS: Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- clothes table
DROP POLICY IF EXISTS "Users can view their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can insert their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can update their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can delete their own clothes" ON public.clothes;

CREATE POLICY "Users can view their own clothes" ON public.clothes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clothes" ON public.clothes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clothes" ON public.clothes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clothes" ON public.clothes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- laundry_log table
DROP POLICY IF EXISTS "Users can view their own laundry logs" ON public.laundry_log;
DROP POLICY IF EXISTS "Users can insert laundry logs for their clothes" ON public.laundry_log;
DROP POLICY IF EXISTS "Users can update their own laundry logs" ON public.laundry_log;
DROP POLICY IF EXISTS "Users can delete their own laundry logs" ON public.laundry_log;

CREATE POLICY "Users can view their own laundry logs" ON public.laundry_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()));
CREATE POLICY "Users can insert laundry logs for their clothes" ON public.laundry_log FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()));
CREATE POLICY "Users can update their own laundry logs" ON public.laundry_log FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()));
CREATE POLICY "Users can delete their own laundry logs" ON public.laundry_log FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM clothes WHERE clothes.id = laundry_log.clothing_id AND clothes.user_id = auth.uid()));

-- weather_cache table
DROP POLICY IF EXISTS "Users can view their own weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert their own weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can update their own weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can delete their own weather cache" ON public.weather_cache;

CREATE POLICY "Users can view their own weather cache" ON public.weather_cache FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weather cache" ON public.weather_cache FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weather cache" ON public.weather_cache FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weather cache" ON public.weather_cache FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
