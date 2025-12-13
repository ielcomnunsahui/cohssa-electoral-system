-- =============================================
-- ISECO Electoral System - Complete Database Schema
-- =============================================

-- 1. CREATE ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'aspirant', 'voter');

CREATE TYPE public.aspirant_status AS ENUM (
  'submitted',
  'payment_verified',
  'under_review',
  'screening_scheduled',
  'screening_completed',
  'qualified',
  'disqualified',
  'candidate'
);

CREATE TYPE public.department AS ENUM (
  'Nursing Sciences',
  'Medical Laboratory Sciences',
  'Medicine and Surgery',
  'Community Medicine and Public Health',
  'Human Anatomy',
  'Human Physiology'
);

CREATE TYPE public.election_stage AS ENUM (
  'aspirant_application',
  'voter_registration',
  'voting',
  'results',
  'closed'
);

CREATE TYPE public.gender AS ENUM ('male', 'female');

CREATE TYPE public.level AS ENUM ('100L', '200L', '300L', '400L', '500L');

CREATE TYPE public.vote_type AS ENUM ('single', 'multiple');

-- 2. CREATE TABLES
-- =============================================

-- User Roles (for RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Student List (student registry for validation)
CREATE TABLE public.student_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matric TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department public.department NOT NULL,
  level public.level,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aspirant Positions (positions aspirants can apply for)
CREATE TABLE public.aspirant_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_name TEXT NOT NULL,
  description TEXT,
  fee NUMERIC NOT NULL DEFAULT 0,
  min_cgpa NUMERIC NOT NULL DEFAULT 0,
  eligible_departments public.department[] NOT NULL,
  eligible_levels public.level[] NOT NULL,
  eligible_gender public.gender,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aspirant Applications
CREATE TABLE public.aspirant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  matric TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender public.gender NOT NULL,
  department public.department NOT NULL,
  level public.level NOT NULL,
  cgpa NUMERIC NOT NULL,
  position_id UUID REFERENCES public.aspirant_positions(id),
  why_running TEXT NOT NULL,
  leadership_history TEXT NOT NULL,
  photo_url TEXT,
  payment_proof_url TEXT,
  payment_verified BOOLEAN DEFAULT false,
  referee_declaration_url TEXT,
  status public.aspirant_status DEFAULT 'submitted',
  screening_date TIMESTAMPTZ,
  screening_result TEXT,
  admin_notes TEXT,
  current_step INTEGER DEFAULT 1,
  step_data JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Voting Positions (positions for actual voting)
CREATE TABLE public.voting_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  vote_type public.vote_type DEFAULT 'single',
  max_selections INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Candidates (promoted aspirants)
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.aspirant_applications(id),
  voting_position_id UUID REFERENCES public.voting_positions(id),
  name TEXT NOT NULL,
  matric TEXT NOT NULL,
  department public.department NOT NULL,
  photo_url TEXT NOT NULL,
  manifesto TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Voter Profiles
CREATE TABLE public.voter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  matric TEXT NOT NULL UNIQUE REFERENCES public.student_list(matric),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  webauthn_credential JSONB,
  issuance_token TEXT,
  voted BOOLEAN DEFAULT false,
  voted_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT now()
);

-- Votes (anonymous voting)
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_token TEXT NOT NULL,
  voting_position_id UUID REFERENCES public.voting_positions(id),
  candidate_id UUID REFERENCES public.candidates(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Election Timeline
CREATE TABLE public.election_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false,
  is_publicly_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Committee Members
CREATE TABLE public.committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  level TEXT,
  photo_url TEXT,
  is_staff BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_type TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- OTP Codes
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Issuance Log (voter token tracking)
CREATE TABLE public.issuance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_matric TEXT NOT NULL,
  issuance_token TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  invalidated_at TIMESTAMPTZ
);

-- System Settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE FUNCTIONS
-- =============================================

-- Security definer function for role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4. CREATE TRIGGERS
-- =============================================

CREATE TRIGGER update_student_list_updated_at
  BEFORE UPDATE ON public.student_list
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aspirant_positions_updated_at
  BEFORE UPDATE ON public.aspirant_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aspirant_applications_updated_at
  BEFORE UPDATE ON public.aspirant_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_election_timeline_updated_at
  BEFORE UPDATE ON public.election_timeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirant_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- =============================================

-- User Roles Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Student List Policies
CREATE POLICY "Anyone can view student list"
  ON public.student_list FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage student list"
  ON public.student_list FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Aspirant Positions Policies
CREATE POLICY "Anyone can view active positions"
  ON public.aspirant_positions FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage positions"
  ON public.aspirant_positions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Aspirant Applications Policies
CREATE POLICY "Users can view their own applications"
  ON public.aspirant_applications FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own applications"
  ON public.aspirant_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON public.aspirant_applications FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete applications"
  ON public.aspirant_applications FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Voting Positions Policies
CREATE POLICY "Anyone can view active voting positions"
  ON public.voting_positions FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage voting positions"
  ON public.voting_positions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Candidates Policies
CREATE POLICY "Anyone can view candidates"
  ON public.candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage candidates"
  ON public.candidates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Voter Profiles Policies
CREATE POLICY "Users can view their own voter profile"
  ON public.voter_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own voter profile"
  ON public.voter_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voter profile"
  ON public.voter_profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Votes Policies (anonymous - only insert allowed for authenticated voters)
CREATE POLICY "Authenticated users can cast votes"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view votes for counting"
  ON public.votes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Election Timeline Policies
CREATE POLICY "Anyone can view public timeline"
  ON public.election_timeline FOR SELECT
  USING (is_publicly_visible = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage timeline"
  ON public.election_timeline FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Committee Members Policies
CREATE POLICY "Anyone can view committee members"
  ON public.committee_members FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage committee members"
  ON public.committee_members FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit Logs Policies
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- OTP Codes Policies
CREATE POLICY "Users can view their own OTP codes"
  ON public.otp_codes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create OTP codes"
  ON public.otp_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update OTP codes"
  ON public.otp_codes FOR UPDATE
  USING (true);

-- Issuance Log Policies
CREATE POLICY "Admins can view issuance logs"
  ON public.issuance_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create issuance logs"
  ON public.issuance_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System Settings Policies
CREATE POLICY "Anyone can view system settings"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. CREATE STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('aspirant-photos', 'aspirant-photos', true),
  ('payment-proofs', 'payment-proofs', false),
  ('referee-declarations', 'referee-declarations', false),
  ('candidate-photos', 'candidate-photos', true),
  ('committee-photos', 'committee-photos', true);

-- Storage Policies for aspirant-photos (public read)
CREATE POLICY "Anyone can view aspirant photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'aspirant-photos');

CREATE POLICY "Authenticated users can upload aspirant photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'aspirant-photos');

CREATE POLICY "Users can update their own aspirant photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'aspirant-photos');

-- Storage Policies for payment-proofs (private)
CREATE POLICY "Users can view their own payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can upload payment proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

-- Storage Policies for referee-declarations (private)
CREATE POLICY "Users can view their own referee declarations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'referee-declarations');

CREATE POLICY "Authenticated users can upload referee declarations"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'referee-declarations');

-- Storage Policies for candidate-photos (public read)
CREATE POLICY "Anyone can view candidate photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'candidate-photos');

CREATE POLICY "Admins can manage candidate photos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'candidate-photos' AND public.has_role(auth.uid(), 'admin'));

-- Storage Policies for committee-photos (public read)
CREATE POLICY "Anyone can view committee photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'committee-photos');

CREATE POLICY "Admins can manage committee photos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'committee-photos' AND public.has_role(auth.uid(), 'admin'));

-- 8. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_student_list_matric ON public.student_list(matric);
CREATE INDEX idx_aspirant_applications_user_id ON public.aspirant_applications(user_id);
CREATE INDEX idx_aspirant_applications_status ON public.aspirant_applications(status);
CREATE INDEX idx_aspirant_applications_matric ON public.aspirant_applications(matric);
CREATE INDEX idx_voter_profiles_matric ON public.voter_profiles(matric);
CREATE INDEX idx_voter_profiles_user_id ON public.voter_profiles(user_id);
CREATE INDEX idx_votes_issuance_token ON public.votes(issuance_token);
CREATE INDEX idx_votes_candidate_id ON public.votes(candidate_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX idx_issuance_log_voter_matric ON public.issuance_log(voter_matric);