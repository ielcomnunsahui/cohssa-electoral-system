
-- Add missing columns to voters table
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS webauthn_credential JSONB;

-- Add missing columns to election_timeline
ALTER TABLE public.election_timeline ADD COLUMN IF NOT EXISTS is_publicly_visible BOOLEAN DEFAULT true;
ALTER TABLE public.election_timeline ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
ALTER TABLE public.election_timeline ADD COLUMN IF NOT EXISTS stage_name TEXT;
ALTER TABLE public.election_timeline ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.election_timeline ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Copy data to new columns
UPDATE public.election_timeline SET start_time = start_date WHERE start_time IS NULL;
UPDATE public.election_timeline SET end_time = end_date WHERE end_time IS NULL;
UPDATE public.election_timeline SET stage_name = title WHERE stage_name IS NULL;

-- Add missing columns to aspirants for application workflow
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS why_running TEXT;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS leadership_history TEXT;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS matric TEXT;
ALTER TABLE public.aspirants ADD COLUMN IF NOT EXISTS step_data JSONB DEFAULT '{}';

-- Update full_name and matric from name and matric_number
UPDATE public.aspirants SET full_name = name WHERE full_name IS NULL;
UPDATE public.aspirants SET matric = matric_number WHERE matric IS NULL;

-- Add positions columns for eligibility
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS min_cgpa DECIMAL(3,2) DEFAULT 2.0;
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS eligible_departments TEXT[] DEFAULT '{}';
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS eligible_levels TEXT[] DEFAULT '{}';
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS eligible_gender TEXT;
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS position_name TEXT;

-- Copy title to position_name
UPDATE public.positions SET position_name = title WHERE position_name IS NULL;

-- Create candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.aspirants(id),
    position_id UUID REFERENCES public.positions(id),
    name TEXT NOT NULL,
    matric TEXT NOT NULL,
    department TEXT NOT NULL,
    photo_url TEXT,
    manifesto TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Admins can manage candidates" ON public.candidates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
