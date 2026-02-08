-- Add occasion column to clothes table
ALTER TABLE public.clothes 
ADD COLUMN occasion text DEFAULT NULL;

-- Add check constraint for valid values
ALTER TABLE public.clothes 
ADD CONSTRAINT clothes_occasion_check 
CHECK (occasion IS NULL OR occasion IN ('casual', 'especiais', 'diario', 'trabalho'));