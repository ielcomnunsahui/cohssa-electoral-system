
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matric_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    level TEXT NOT NULL,
    department TEXT NOT NULL,
    faculty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- University leaders table
CREATE TABLE public.university_leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    faculty TEXT,
    department TEXT,
    photo_url TEXT,
    bio TEXT,
    display_order INTEGER DEFAULT 0,
    category TEXT DEFAULT 'leadership',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.university_leaders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view leaders" ON public.university_leaders FOR SELECT USING (true);
CREATE POLICY "Admins can manage leaders" ON public.university_leaders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- College departments table
CREATE TABLE public.college_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    faculty TEXT,
    head_of_department TEXT,
    hod_photo_url TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.college_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view departments" ON public.college_departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON public.college_departments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COHSSA executives table
CREATE TABLE public.cohssa_executives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    level TEXT,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.cohssa_executives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view executives" ON public.cohssa_executives FOR SELECT USING (true);
CREATE POLICY "Admins can manage executives" ON public.cohssa_executives FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COHSSA senate table
CREATE TABLE public.cohssa_senate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    level TEXT,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.cohssa_senate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view senate" ON public.cohssa_senate FOR SELECT USING (true);
CREATE POLICY "Admins can manage senate" ON public.cohssa_senate FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Electoral committee table
CREATE TABLE public.electoral_committee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    level TEXT,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    is_staff_adviser BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.electoral_committee ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view committee" ON public.electoral_committee FOR SELECT USING (true);
CREATE POLICY "Admins can manage committee" ON public.electoral_committee FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COHSSA alumni table
CREATE TABLE public.cohssa_alumni (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    administration_number INTEGER,
    department TEXT,
    graduation_year INTEGER,
    current_workplace TEXT,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.cohssa_alumni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view alumni" ON public.cohssa_alumni FOR SELECT USING (true);
CREATE POLICY "Admins can manage alumni" ON public.cohssa_alumni FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Presidential appointments table
CREATE TABLE public.presidential_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    photo_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.presidential_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view appointments" ON public.presidential_appointments FOR SELECT USING (true);
CREATE POLICY "Admins can manage appointments" ON public.presidential_appointments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Standing committees table
CREATE TABLE public.standing_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_name TEXT NOT NULL,
    chairman TEXT,
    members TEXT[],
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.standing_committees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view committees" ON public.standing_committees FOR SELECT USING (true);
CREATE POLICY "Admins can manage committees" ON public.standing_committees FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Editorial content table
CREATE TABLE public.editorial_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT,
    content_type TEXT NOT NULL,
    department TEXT,
    author_name TEXT,
    author_email TEXT,
    image_url TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'pending',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published content" ON public.editorial_content FOR SELECT USING (status = 'published');
CREATE POLICY "Users can view own content" ON public.editorial_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit content" ON public.editorial_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all content" ON public.editorial_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Election timeline table
CREATE TABLE public.election_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.election_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view timeline" ON public.election_timeline FOR SELECT USING (true);
CREATE POLICY "Admins can manage timeline" ON public.election_timeline FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Voters table
CREATE TABLE public.voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    matric_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    level TEXT NOT NULL,
    department TEXT NOT NULL,
    has_voted BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voters can view own data" ON public.voters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage voters" ON public.voters FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Aspirants table
CREATE TABLE public.aspirants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    matric_number TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    level TEXT NOT NULL,
    department TEXT NOT NULL,
    position_id UUID,
    cgpa DECIMAL(3,2),
    photo_url TEXT,
    manifesto TEXT,
    status TEXT DEFAULT 'pending',
    application_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.aspirants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved aspirants" ON public.aspirants FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own application" ON public.aspirants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit application" ON public.aspirants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own application" ON public.aspirants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage aspirants" ON public.aspirants FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Positions table
CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    max_candidates INTEGER DEFAULT 10,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view positions" ON public.positions FOR SELECT USING (true);
CREATE POLICY "Admins can manage positions" ON public.positions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Votes table
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID REFERENCES public.voters(id),
    position_id UUID REFERENCES public.positions(id),
    aspirant_id UUID REFERENCES public.aspirants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(voter_id, position_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voters can cast votes" ON public.votes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.voters WHERE id = voter_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view votes" ON public.votes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'event',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    image_url TEXT,
    highlights TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Resources table (textbooks, past questions, etc.)
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL,
    department TEXT,
    level TEXT,
    file_url TEXT,
    external_link TEXT,
    price DECIMAL(10,2),
    seller_id UUID REFERENCES auth.users(id),
    seller_name TEXT,
    seller_phone TEXT,
    status TEXT DEFAULT 'pending',
    admin_commission DECIMAL(10,2),
    is_sold BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved resources" ON public.resources FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own resources" ON public.resources FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can submit resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Admins can manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leaders_updated_at BEFORE UPDATE ON public.university_leaders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aspirants_updated_at BEFORE UPDATE ON public.aspirants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_editorial_updated_at BEFORE UPDATE ON public.editorial_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
