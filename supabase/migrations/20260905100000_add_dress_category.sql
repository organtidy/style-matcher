-- Drop the existing constraint
ALTER TABLE public.clothes DROP CONSTRAINT IF EXISTS clothes_category_check;

-- Add the new constraint with 'dress' included
ALTER TABLE public.clothes ADD CONSTRAINT clothes_category_check 
  CHECK (category IN ('top', 'bottom', 'shoes', 'outerwear', 'accessory', 'dress'));
