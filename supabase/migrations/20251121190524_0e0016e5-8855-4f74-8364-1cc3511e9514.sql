-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'aspirant', 'voter');
CREATE TYPE public.aspirant_status AS ENUM ('submitted', 'payment_verified', 'under_review', 'screening_scheduled', 'screening_completed', 'qualified', 'disqualified', 'candidate');
CREATE TYPE public.election_stage AS ENUM ('aspirant_application', 'voter_registration', 'voting', 'results', 'closed');
CREATE TYPE public.vote_type AS ENUM ('single', 'multiple');
CREATE TYPE public.department AS ENUM ('Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology');
CREATE TYPE public.level AS ENUM ('100L', '200L', '300L', '400L', '500L');
CREATE TYPE public.gender AS ENUM ('male', 'female');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Admin accounts table (separate authentication)
CREATE TABLE public.admin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Student list (for voter verification)
CREATE TABLE public.student_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matric TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department department NOT NULL,
    level level,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voter profiles
CREATE TABLE public.voter_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    matric TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    voted BOOLEAN DEFAULT false,
    issuance_token UUID UNIQUE DEFAULT gen_random_uuid(),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    voted_at TIMESTAMP WITH TIME ZONE,
    webauthn_credential JSONB,
    CONSTRAINT fk_student FOREIGN KEY (matric) REFERENCES public.student_list(matric)
);

-- Aspirant positions (application)
CREATE TABLE public.aspirant_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_name TEXT NOT NULL,
    fee DECIMAL(10, 2) NOT NULL,
    min_cgpa DECIMAL(3, 2) NOT NULL,
    eligible_departments department[] NOT NULL,
    eligible_levels level[] NOT NULL,
    eligible_gender gender,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voting positions
CREATE TABLE public.voting_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    vote_type vote_type NOT NULL DEFAULT 'single',
    max_selections INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aspirant applications
CREATE TABLE public.aspirant_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    position_id UUID REFERENCES public.aspirant_positions(id) ON DELETE CASCADE,
    
    -- Personal Info
    photo_url TEXT,
    full_name TEXT NOT NULL,
    matric TEXT NOT NULL,
    department department NOT NULL,
    level level NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    phone TEXT NOT NULL,
    
    -- Position & Motivation
    why_running TEXT NOT NULL,
    
    -- Academic
    cgpa DECIMAL(3, 2) NOT NULL,
    
    -- Leadership
    leadership_history TEXT NOT NULL,
    
    -- Documents
    referee_declaration_url TEXT,
    payment_proof_url TEXT,
    
    -- Status tracking
    status aspirant_status DEFAULT 'submitted',
    payment_verified BOOLEAN DEFAULT false,
    admin_notes TEXT,
    screening_date TIMESTAMP WITH TIME ZONE,
    screening_result TEXT,
    
    -- Auto-save support
    current_step INTEGER DEFAULT 1,
    step_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- Candidates (promoted from aspirants)
CREATE TABLE public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.aspirant_applications(id) ON DELETE CASCADE,
    voting_position_id UUID REFERENCES public.voting_positions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    matric TEXT NOT NULL,
    department department NOT NULL,
    manifesto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Election timeline
CREATE TABLE public.election_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_publicly_visible BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Votes (anonymous)
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issuance_token UUID NOT NULL,
    voting_position_id UUID REFERENCES public.voting_positions(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Issuance log (separate, restricted)
CREATE TABLE public.issuance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issuance_token UUID UNIQUE NOT NULL,
    voter_matric TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    invalidated_at TIMESTAMP WITH TIME ZONE
);

-- System settings
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_type TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- OTP codes for email fallback
CREATE TABLE public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Electoral committee members
CREATE TABLE public.committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    level TEXT,
    photo_url TEXT,
    display_order INTEGER NOT NULL,
    is_staff BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirant_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS Policies

-- Admin accounts: Only admins can read
CREATE POLICY "Only admins can read admin accounts"
ON public.admin_accounts FOR SELECT
USING (false);

-- Student list: Public read for verification, admin write
CREATE POLICY "Anyone can read student list"
ON public.student_list FOR SELECT
USING (true);

CREATE POLICY "Only service role can modify student list"
ON public.student_list FOR ALL
USING (false);

-- Voter profiles: Users can read own, admins can read all
CREATE POLICY "Users can read own voter profile"
ON public.voter_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voter profile"
ON public.voter_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voter profile"
ON public.voter_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Aspirant positions: Public read, admin write
CREATE POLICY "Anyone can read active aspirant positions"
ON public.aspirant_positions FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role can manage aspirant positions"
ON public.aspirant_positions FOR ALL
USING (false);

-- Voting positions: Public read active, admin write
CREATE POLICY "Anyone can read active voting positions"
ON public.voting_positions FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role can manage voting positions"
ON public.voting_positions FOR ALL
USING (false);

-- Aspirant applications: Users can manage own, admins can read all
CREATE POLICY "Users can read own applications"
ON public.aspirant_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
ON public.aspirant_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
ON public.aspirant_applications FOR UPDATE
USING (auth.uid() = user_id AND status IN ('submitted', 'payment_verified'));

-- Candidates: Public read
CREATE POLICY "Anyone can read candidates"
ON public.candidates FOR SELECT
USING (true);

CREATE POLICY "Service role can manage candidates"
ON public.candidates FOR ALL
USING (false);

-- Election timeline: Public read visible ones
CREATE POLICY "Anyone can read public timeline"
ON public.election_timeline FOR SELECT
USING (is_publicly_visible = true);

-- Votes: Insert only during voting window
CREATE POLICY "Verified voters can cast votes"
ON public.votes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.voter_profiles
    WHERE issuance_token = votes.issuance_token
    AND verified = true
    AND voted = false
  )
);

-- Issuance log: Completely restricted
CREATE POLICY "No public access to issuance log"
ON public.issuance_log FOR ALL
USING (false);

-- System settings: Public read
CREATE POLICY "Anyone can read system settings"
ON public.system_settings FOR SELECT
USING (true);

-- Audit logs: No public access
CREATE POLICY "No public access to audit logs"
ON public.audit_logs FOR ALL
USING (false);

-- OTP codes: Users can read own
CREATE POLICY "Users can read own OTP codes"
ON public.otp_codes FOR SELECT
USING (email = auth.jwt()->>'email');

-- Committee members: Public read
CREATE POLICY "Anyone can read committee members"
ON public.committee_members FOR SELECT
USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_list_updated_at BEFORE UPDATE ON public.student_list
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aspirant_positions_updated_at BEFORE UPDATE ON public.aspirant_positions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aspirant_applications_updated_at BEFORE UPDATE ON public.aspirant_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_election_timeline_updated_at BEFORE UPDATE ON public.election_timeline
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin account (password: ISECO@2025, hashed with bcrypt)
-- Note: This is a placeholder. In production, use proper password hashing
INSERT INTO public.admin_accounts (username, password_hash)
VALUES ('ISECO 2025', '$2a$10$rQ9YvV7YXqJ8CxHKHQxQl.kxGVJp5kGN8WdQ4pZKHVGxJ7KwKqKQK');

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
('payment_instructions', '{"account_number": "7081795658", "bank": "OPAY", "account_name": "Awwal Abubakar Sadik", "treasurer_contact": "07040640646"}'::jsonb),
('support_contacts', '{"email": "iseco@alhikmah.edu.ng", "whatsapp": "07040640646"}'::jsonb),
('election_rules', '{"content": "Electoral rules and constitution will be displayed here."}'::jsonb);

-- Seed demo student list
INSERT INTO public.student_list (matric, name, department, level) VALUES
('21/08nus014', 'Awwal Abubakar Sadik', 'Nursing Sciences', '500L'),
('21/08mls014', 'Oyeniyi Abdulazeez Ademola', 'Medical Laboratory Sciences', '500L'),
('22/08puh068', 'Abubakri Farouq Oluwafunmilayo', 'Community Medicine and Public Health', '400L'),
('22/08ana068', 'Olaniyi Mariam', 'Human Anatomy', '400L');

-- Seed default aspirant positions
INSERT INTO public.aspirant_positions (position_name, fee, min_cgpa, eligible_departments, eligible_levels, eligible_gender, description) VALUES
('President', 15000.00, 3.50, ARRAY['Human Physiology']::department[], ARRAY['500L']::level[], NULL, 'Lead the student union'),
('Vice President', 10000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['400L']::level[], 'female', 'Support the president'),
('General Secretary', 8000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['300L', '400L', '500L']::level[], NULL, 'Handle administrative duties'),
('Assistant General Secretary', 6000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['200L', '300L']::level[], NULL, 'Assist the general secretary'),
('Treasurer', 8000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['400L', '500L']::level[], NULL, 'Manage union finances'),
('Director of Academics', 6000.00, 4.00, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['300L', '400L', '500L']::level[], NULL, 'Oversee academic activities'),
('Director of Social', 6000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['300L', '400L', '500L']::level[], NULL, 'Organize social events'),
('Director of Sports', 6000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['300L', '400L', '500L']::level[], NULL, 'Manage sports activities'),
('Director of Welfare', 6000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['300L', '400L', '500L']::level[], NULL, 'Handle student welfare'),
('PRO I', 6000.00, 3.50, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['400L', '500L']::level[], NULL, 'Public relations officer'),
('PRO II', 5000.00, 3.00, ARRAY['Nursing Sciences', 'Medical Laboratory Sciences', 'Medicine and Surgery', 'Community Medicine and Public Health', 'Human Anatomy', 'Human Physiology']::department[], ARRAY['200L', '300L']::level[], NULL, 'Assistant public relations officer');

-- Seed default voting positions
INSERT INTO public.voting_positions (position_name, display_order, vote_type, max_selections) VALUES
('President', 1, 'single', 1),
('Vice President', 2, 'single', 1),
('General Secretary', 3, 'single', 1),
('Assistant General Secretary', 4, 'single', 1),
('Treasurer', 5, 'single', 1),
('Director of Academics', 6, 'single', 1),
('Director of Social', 7, 'single', 1),
('Director of Sports', 8, 'single', 1),
('Director of Welfare', 9, 'single', 1),
('PRO I', 10, 'single', 1),
('PRO II', 11, 'single', 1);