-- Table for university leaders (Founder, VC, Provost, Deans)
CREATE TABLE public.university_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo_url TEXT,
  faculty TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.university_leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage university leaders"
ON public.university_leaders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view university leaders"
ON public.university_leaders FOR SELECT USING (true);

-- Table for COHSSA executives
CREATE TABLE public.cohssa_executives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  level TEXT,
  photo_url TEXT,
  contact TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cohssa_executives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage executives"
ON public.cohssa_executives FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view executives"
ON public.cohssa_executives FOR SELECT USING (true);

-- Table for COHSSA senate members
CREATE TABLE public.cohssa_senate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  level TEXT,
  photo_url TEXT,
  contact TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cohssa_senate ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage senate"
ON public.cohssa_senate FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view senate"
ON public.cohssa_senate FOR SELECT USING (true);

-- Table for COHSSA alumni presidents
CREATE TABLE public.cohssa_alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  graduation_year TEXT,
  phone TEXT,
  email TEXT,
  current_workplace TEXT,
  photo_url TEXT,
  administration_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cohssa_alumni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage alumni"
ON public.cohssa_alumni FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view alumni"
ON public.cohssa_alumni FOR SELECT USING (true);

-- Table for editorial content (newsletters, articles, poems, etc.)
CREATE TABLE public.editorial_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL, -- newsletter, article, research, journal, poem, writing
  author_name TEXT NOT NULL,
  author_matric TEXT,
  author_department TEXT,
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID REFERENCES auth.users(id),
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all content"
ON public.editorial_content FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can submit content"
ON public.editorial_content FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own submissions"
ON public.editorial_content FOR SELECT USING (auth.uid() = submitted_by OR is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own unpublished content"
ON public.editorial_content FOR UPDATE USING (auth.uid() = submitted_by AND is_published = false);

-- Table for academic resources (links to external resources)
CREATE TABLE public.academic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL, -- course_outline, past_question, e_material
  external_url TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  course_code TEXT,
  year TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.academic_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage resources"
ON public.academic_resources FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active resources"
ON public.academic_resources FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Table for events and gallery
CREATE TABLE public.events_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  image_url TEXT,
  event_type TEXT NOT NULL, -- event, gallery
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.events_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage events"
ON public.events_gallery FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published events"
ON public.events_gallery FOR SELECT USING (is_published = true);

-- Trigger for updated_at on editorial_content
CREATE TRIGGER update_editorial_content_updated_at
BEFORE UPDATE ON public.editorial_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on academic_resources
CREATE TRIGGER update_academic_resources_updated_at
BEFORE UPDATE ON public.academic_resources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();