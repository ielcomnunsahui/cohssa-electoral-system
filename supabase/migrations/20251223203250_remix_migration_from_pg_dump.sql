CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: aspirants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aspirants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    matric_number text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    level text NOT NULL,
    department text NOT NULL,
    position_id uuid,
    cgpa numeric(3,2),
    photo_url text,
    manifesto text,
    status text DEFAULT 'pending'::text,
    application_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    date_of_birth date,
    gender text,
    why_running text,
    leadership_history text,
    payment_proof_url text,
    submitted_at timestamp with time zone,
    full_name text,
    matric text,
    step_data jsonb DEFAULT '{}'::jsonb
);


--
-- Name: approved_aspirants_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.approved_aspirants_public WITH (security_invoker='true') AS
 SELECT id,
    full_name,
    name,
    department,
    level,
    position_id,
    manifesto,
    photo_url,
    why_running,
    status
   FROM public.aspirants
  WHERE (status = 'approved'::text);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    resource_type text NOT NULL,
    department text,
    level text,
    file_url text,
    external_link text,
    price numeric(10,2),
    seller_id uuid,
    seller_name text,
    seller_phone text,
    status text DEFAULT 'pending'::text,
    admin_commission numeric(10,2),
    is_sold boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: approved_resources_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.approved_resources_public WITH (security_invoker='true') AS
 SELECT id,
    title,
    description,
    resource_type,
    department,
    level,
    price,
    file_url,
    external_link,
    created_at,
    is_sold,
    seller_name
   FROM public.resources
  WHERE (status = 'approved'::text);


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid,
    position_id uuid,
    name text NOT NULL,
    matric text NOT NULL,
    department text NOT NULL,
    photo_url text,
    manifesto text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: cohssa_alumni; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohssa_alumni (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    administration_number integer,
    department text,
    graduation_year integer,
    current_workplace text,
    photo_url text,
    phone text,
    email text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: cohssa_executives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohssa_executives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    department text,
    level text,
    photo_url text,
    phone text,
    email text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: cohssa_senate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohssa_senate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    department text,
    level text,
    photo_url text,
    phone text,
    email text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: college_departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.college_departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    faculty text,
    head_of_department text,
    hod_photo_url text,
    description text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: editorial_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.editorial_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    content text,
    content_type text NOT NULL,
    department text,
    author_name text,
    author_email text,
    image_url text,
    pdf_url text,
    status text DEFAULT 'pending'::text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: election_timeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.election_timeline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    status text DEFAULT 'upcoming'::text,
    created_at timestamp with time zone DEFAULT now(),
    is_publicly_visible boolean DEFAULT true,
    is_active boolean DEFAULT false,
    stage_name text,
    start_time timestamp with time zone,
    end_time timestamp with time zone
);

ALTER TABLE ONLY public.election_timeline REPLICA IDENTITY FULL;


--
-- Name: electoral_committee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.electoral_committee (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    department text,
    level text,
    photo_url text,
    phone text,
    email text,
    is_staff_adviser boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    event_type text DEFAULT 'event'::text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    location text,
    image_url text,
    highlights text,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    type text DEFAULT 'verification'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:05:00'::interval) NOT NULL,
    used boolean DEFAULT false
);


--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    max_candidates integer DEFAULT 10,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    fee numeric(10,2) DEFAULT 0,
    min_cgpa numeric(3,2) DEFAULT 2.0,
    eligible_departments text[] DEFAULT '{}'::text[],
    eligible_levels text[] DEFAULT '{}'::text[],
    eligible_gender text,
    position_name text
);


--
-- Name: presidential_appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.presidential_appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    department text,
    photo_url text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: published_content_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.published_content_public WITH (security_invoker='true') AS
 SELECT id,
    title,
    content,
    content_type,
    department,
    author_name,
    image_url,
    pdf_url,
    published_at,
    created_at
   FROM public.editorial_content
  WHERE (status = 'published'::text);


--
-- Name: standing_committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standing_committees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    committee_name text NOT NULL,
    chairman text,
    members text[],
    description text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    matric_number text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    level text NOT NULL,
    department text NOT NULL,
    faculty text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: university_leaders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.university_leaders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    faculty text,
    department text,
    photo_url text,
    bio text,
    display_order integer DEFAULT 0,
    category text DEFAULT 'leadership'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: voters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    matric_number text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    level text NOT NULL,
    department text NOT NULL,
    has_voted boolean DEFAULT false,
    verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    webauthn_credential jsonb
);

ALTER TABLE ONLY public.voters REPLICA IDENTITY FULL;


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    voter_id uuid,
    position_id uuid,
    aspirant_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.votes REPLICA IDENTITY FULL;


--
-- Name: aspirants aspirants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirants
    ADD CONSTRAINT aspirants_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: cohssa_alumni cohssa_alumni_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohssa_alumni
    ADD CONSTRAINT cohssa_alumni_pkey PRIMARY KEY (id);


--
-- Name: cohssa_executives cohssa_executives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohssa_executives
    ADD CONSTRAINT cohssa_executives_pkey PRIMARY KEY (id);


--
-- Name: cohssa_senate cohssa_senate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohssa_senate
    ADD CONSTRAINT cohssa_senate_pkey PRIMARY KEY (id);


--
-- Name: college_departments college_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.college_departments
    ADD CONSTRAINT college_departments_pkey PRIMARY KEY (id);


--
-- Name: editorial_content editorial_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorial_content
    ADD CONSTRAINT editorial_content_pkey PRIMARY KEY (id);


--
-- Name: election_timeline election_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.election_timeline
    ADD CONSTRAINT election_timeline_pkey PRIMARY KEY (id);


--
-- Name: electoral_committee electoral_committee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.electoral_committee
    ADD CONSTRAINT electoral_committee_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: presidential_appointments presidential_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.presidential_appointments
    ADD CONSTRAINT presidential_appointments_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: standing_committees standing_committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standing_committees
    ADD CONSTRAINT standing_committees_pkey PRIMARY KEY (id);


--
-- Name: students students_matric_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_matric_number_key UNIQUE (matric_number);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: university_leaders university_leaders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_leaders
    ADD CONSTRAINT university_leaders_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: voters voters_matric_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voters
    ADD CONSTRAINT voters_matric_number_key UNIQUE (matric_number);


--
-- Name: voters voters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voters
    ADD CONSTRAINT voters_pkey PRIMARY KEY (id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: votes votes_voter_id_position_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_voter_id_position_id_key UNIQUE (voter_id, position_id);


--
-- Name: idx_otp_codes_email_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_codes_email_code ON public.otp_codes USING btree (email, code);


--
-- Name: idx_otp_codes_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_codes_expires ON public.otp_codes USING btree (expires_at);


--
-- Name: aspirants update_aspirants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_aspirants_updated_at BEFORE UPDATE ON public.aspirants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: editorial_content update_editorial_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_editorial_updated_at BEFORE UPDATE ON public.editorial_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: university_leaders update_leaders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leaders_updated_at BEFORE UPDATE ON public.university_leaders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: students update_students_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: aspirants aspirants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirants
    ADD CONSTRAINT aspirants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: candidates candidates_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.aspirants(id);


--
-- Name: candidates candidates_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: editorial_content editorial_content_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorial_content
    ADD CONSTRAINT editorial_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: resources resources_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: voters voters_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voters
    ADD CONSTRAINT voters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: votes votes_aspirant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_aspirant_id_fkey FOREIGN KEY (aspirant_id) REFERENCES public.aspirants(id);


--
-- Name: votes votes_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: votes votes_voter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_voter_id_fkey FOREIGN KEY (voter_id) REFERENCES public.voters(id);


--
-- Name: editorial_content Admins can manage all content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all content" ON public.editorial_content USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cohssa_alumni Admins can manage alumni; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage alumni" ON public.cohssa_alumni USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: presidential_appointments Admins can manage appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage appointments" ON public.presidential_appointments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: aspirants Admins can manage aspirants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage aspirants" ON public.aspirants USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: candidates Admins can manage candidates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage candidates" ON public.candidates USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: electoral_committee Admins can manage committee; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage committee" ON public.electoral_committee USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: standing_committees Admins can manage committees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage committees" ON public.standing_committees USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: college_departments Admins can manage departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage departments" ON public.college_departments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: events Admins can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage events" ON public.events USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cohssa_executives Admins can manage executives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage executives" ON public.cohssa_executives USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: university_leaders Admins can manage leaders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage leaders" ON public.university_leaders USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: positions Admins can manage positions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage positions" ON public.positions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: resources Admins can manage resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage resources" ON public.resources USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cohssa_senate Admins can manage senate; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage senate" ON public.cohssa_senate USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: system_settings Admins can manage settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage settings" ON public.system_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: students Admins can manage students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage students" ON public.students USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: election_timeline Admins can manage timeline; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage timeline" ON public.election_timeline USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: voters Admins can manage voters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage voters" ON public.voters USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: votes Admins can view votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view votes" ON public.votes FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: students Authenticated users can view basic student info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view basic student info" ON public.students FOR SELECT TO authenticated USING (true);


--
-- Name: otp_codes Only service role can manage OTPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only service role can manage OTPs" ON public.otp_codes TO service_role USING (true) WITH CHECK (true);


--
-- Name: otp_codes Prevent public access to OTPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Prevent public access to OTPs" ON public.otp_codes TO anon USING (false);


--
-- Name: cohssa_alumni Public can view alumni; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view alumni" ON public.cohssa_alumni FOR SELECT USING (true);


--
-- Name: presidential_appointments Public can view appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view appointments" ON public.presidential_appointments FOR SELECT USING (true);


--
-- Name: aspirants Public can view approved aspirants basic info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view approved aspirants basic info" ON public.aspirants FOR SELECT USING (((status = 'approved'::text) AND true));


--
-- Name: resources Public can view approved resources basic info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view approved resources basic info" ON public.resources FOR SELECT USING ((status = 'approved'::text));


--
-- Name: candidates Public can view candidates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view candidates" ON public.candidates FOR SELECT USING (true);


--
-- Name: electoral_committee Public can view committee; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view committee" ON public.electoral_committee FOR SELECT USING (true);


--
-- Name: standing_committees Public can view committees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view committees" ON public.standing_committees FOR SELECT USING (true);


--
-- Name: college_departments Public can view departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view departments" ON public.college_departments FOR SELECT USING (true);


--
-- Name: cohssa_executives Public can view executives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view executives" ON public.cohssa_executives FOR SELECT USING (true);


--
-- Name: university_leaders Public can view leaders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view leaders" ON public.university_leaders FOR SELECT USING (true);


--
-- Name: positions Public can view positions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view positions" ON public.positions FOR SELECT USING (true);


--
-- Name: editorial_content Public can view published content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view published content" ON public.editorial_content FOR SELECT USING ((status = 'published'::text));


--
-- Name: events Public can view published events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING ((is_published = true));


--
-- Name: cohssa_senate Public can view senate; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view senate" ON public.cohssa_senate FOR SELECT USING (true);


--
-- Name: system_settings Public can view settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view settings" ON public.system_settings FOR SELECT USING (true);


--
-- Name: election_timeline Public can view timeline; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view timeline" ON public.election_timeline FOR SELECT USING (true);


--
-- Name: aspirants Users can submit application; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit application" ON public.aspirants FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: editorial_content Users can submit content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit content" ON public.editorial_content FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: resources Users can submit resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit resources" ON public.resources FOR INSERT WITH CHECK ((auth.uid() = seller_id));


--
-- Name: aspirants Users can update own application; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own application" ON public.aspirants FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: aspirants Users can view own application; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own application" ON public.aspirants FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: editorial_content Users can view own content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own content" ON public.editorial_content FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: resources Users can view own resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own resources" ON public.resources FOR SELECT USING ((auth.uid() = seller_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: votes Voters can cast votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Voters can cast votes" ON public.votes FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.voters
  WHERE ((voters.id = votes.voter_id) AND (voters.user_id = auth.uid())))));


--
-- Name: voters Voters can view own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Voters can view own data" ON public.voters FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: aspirants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.aspirants ENABLE ROW LEVEL SECURITY;

--
-- Name: candidates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

--
-- Name: cohssa_alumni; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cohssa_alumni ENABLE ROW LEVEL SECURITY;

--
-- Name: cohssa_executives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cohssa_executives ENABLE ROW LEVEL SECURITY;

--
-- Name: cohssa_senate; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cohssa_senate ENABLE ROW LEVEL SECURITY;

--
-- Name: college_departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.college_departments ENABLE ROW LEVEL SECURITY;

--
-- Name: editorial_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;

--
-- Name: election_timeline; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.election_timeline ENABLE ROW LEVEL SECURITY;

--
-- Name: electoral_committee; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.electoral_committee ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: otp_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: positions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

--
-- Name: presidential_appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.presidential_appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

--
-- Name: standing_committees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.standing_committees ENABLE ROW LEVEL SECURITY;

--
-- Name: students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

--
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: university_leaders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.university_leaders ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: voters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;

--
-- Name: votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;