
CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  specialization text,
  qualifications text,
  bio text,
  image_url text,
  experience_years int DEFAULT 0,
  languages text[] DEFAULT ARRAY[]::text[],
  consultation_fee text,
  email text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active doctors viewable" ON public.doctors FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage doctors" ON public.doctors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.appointments ADD COLUMN doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL;

CREATE TABLE public.patient_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'report',
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_documents TO authenticated;
GRANT ALL ON public.patient_documents TO service_role;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own docs" ON public.patient_documents FOR SELECT TO authenticated USING (patient_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage docs" ON public.patient_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER patient_documents_updated_at BEFORE UPDATE ON public.patient_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.doctors (name, slug, specialization, qualifications, bio, experience_years, languages, is_featured, sort_order)
VALUES (
  'Dr. Lead Gynecologist','lead-gynecologist','Obstetrics & Gynecology',
  'MBBS, MS (OBG), Fellowship in Laparoscopic Surgery',
  'Leading New Beginnings Women''s Clinic with 25+ years of trusted experience in women''s healthcare, high-risk pregnancies, and minimally invasive gynecologic surgery.',
  25, ARRAY['English','Hindi','Marathi'], true, 0
);

CREATE POLICY "Patients read own files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'patient-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Admins write files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patient-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'patient-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'patient-documents' AND public.has_role(auth.uid(), 'admin'));
