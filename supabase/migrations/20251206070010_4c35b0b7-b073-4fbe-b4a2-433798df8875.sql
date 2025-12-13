-- Add display_order column to aspirant_positions table
ALTER TABLE public.aspirant_positions 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Update existing positions with sequential order based on current position_name order
WITH ordered_positions AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY position_name) as new_order
  FROM public.aspirant_positions
)
UPDATE public.aspirant_positions 
SET display_order = ordered_positions.new_order
FROM ordered_positions 
WHERE aspirant_positions.id = ordered_positions.id;