
-- ===== Extend appointments =====
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS follow_up_date date;

-- ===== Extend contacts =====
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_important boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS internal_notes text;

-- allow admins to update contacts (for archive/flag/notes)
DROP POLICY IF EXISTS "Admins update contacts" ON public.contacts;
CREATE POLICY "Admins update contacts" ON public.contacts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== Services =====
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short_description text,
  description text,
  price text,
  duration_minutes integer,
  image_url text,
  icon text,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active services" ON public.services
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update services" ON public.services
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete services" ON public.services
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Testimonials =====
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_location text,
  content text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  image_url text,
  is_approved boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (is_approved = true OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert testimonials" ON public.testimonials
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update testimonials" ON public.testimonials
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete testimonials" ON public.testimonials
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== FAQs =====
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'General',
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active faqs" ON public.faqs
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert faqs" ON public.faqs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update faqs" ON public.faqs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete faqs" ON public.faqs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Site Settings (key-value) =====
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Activity Log =====
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view activity log" ON public.activity_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated insert activity log" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===== Seed sensible defaults =====
INSERT INTO public.services (slug, name, short_description, description, price, duration_minutes, sort_order, is_active, is_featured, benefits) VALUES
  ('pregnancy-care', 'Pregnancy Care', 'Comprehensive antenatal care from conception to delivery.', 'Full antenatal care including regular check-ups, ultrasounds, and nutritional guidance throughout your pregnancy journey.', 'Consultation from ₹800', 30, 1, true, true, '["Monthly check-ups","Ultrasound scans","Nutrition guidance","Delivery planning"]'::jsonb),
  ('womens-wellness', 'Women''s Wellness', 'Preventive screenings and gynecological health checks.', 'Routine wellness exams, screenings, and preventive care for women of all ages.', 'From ₹600', 30, 2, true, true, '["Pap smear","Breast exam","Hormonal screening","Lifestyle counselling"]'::jsonb),
  ('fertility-consultation', 'Fertility Consultation', 'Expert guidance for couples planning a family.', 'In-depth fertility assessment and treatment planning with personalized care.', 'From ₹1,200', 45, 3, true, false, '["Hormonal evaluation","Ovulation tracking","Treatment options","Counselling"]'::jsonb),
  ('menopause-care', 'Menopause Care', 'Holistic support through perimenopause and menopause.', 'Symptom management, hormone therapy options, and lifestyle support.', 'From ₹800', 30, 4, true, false, '["HRT consultation","Symptom relief","Bone health","Mental wellness"]'::jsonb),
  ('pcos-pcod', 'PCOS / PCOD Management', 'Long-term care plans for hormonal balance.', 'Personalised treatment for PCOS/PCOD combining medication, diet and lifestyle.', 'From ₹800', 30, 5, true, false, '["Hormonal workup","Diet planning","Medication","Follow-up"]'::jsonb),
  ('gynae-surgery', 'Gynecological Surgery', 'Minimally invasive surgical procedures.', 'Laparoscopic and minimally invasive gynae procedures performed by experts.', 'On consultation', 60, 6, true, false, '["Laparoscopy","Hysteroscopy","Day-care surgery","Pre & post-op care"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.testimonials (patient_name, patient_location, content, rating, is_approved, is_featured, sort_order) VALUES
  ('Priya S.', 'Bangalore', 'Dr. Rishitha and her team made my pregnancy journey so reassuring. The care, attention and warmth here are unmatched.', 5, true, true, 1),
  ('Anjali R.', 'Bangalore', 'Got my PCOS under control after years of struggling. The personalized plan and follow-ups truly changed my life.', 5, true, true, 2),
  ('Kavya M.', 'Bangalore', 'Modern facilities and a doctor who actually listens. I always recommend New Beginnings to friends and family.', 5, true, true, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (category, question, answer, sort_order, is_active) VALUES
  ('Appointments', 'How do I book an appointment?', 'You can book online through our appointment form, call us directly, or message us on WhatsApp. We confirm bookings within a few hours.', 1, true),
  ('Appointments', 'Do you accept walk-ins?', 'We prefer scheduled appointments to minimize waiting time, but we do accommodate emergencies and walk-ins whenever possible.', 2, true),
  ('Services', 'What services do you offer?', 'We offer comprehensive women''s healthcare including pregnancy care, wellness screenings, fertility consultation, PCOS management, menopause care and minimally invasive surgery.', 3, true),
  ('Insurance', 'Do you accept insurance?', 'Yes, we work with most major insurance providers. Please call ahead to confirm coverage for your specific plan.', 4, true),
  ('General', 'What are your clinic hours?', 'We are open Monday to Saturday, 9:00 AM to 8:00 PM. Sunday consultations are available by prior appointment.', 5, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('hero', '{"headline":"Compassionate Women''s Healthcare","subheadline":"Modern gynecology and wellness care with a personal touch — for every stage of your journey.","cta_primary":"Book Appointment","cta_secondary":"Our Services"}'::jsonb),
  ('doctor', '{"name":"Dr. Rishitha","designation":"MBBS, MS (OBG)","specialization":"Consultant Obstetrician & Gynaecologist","experience":"10+ years","bio":"Dr. Rishitha is dedicated to providing personalized, evidence-based care for women through every stage of life."}'::jsonb),
  ('contact', '{"hours":"Mon-Sat: 9:00 AM - 8:00 PM","emergency":"Available 24/7 for emergencies"}'::jsonb),
  ('cta', '{"headline":"Ready to start your journey?","subtext":"Book a consultation with Dr. Rishitha today.","button":"Book Now"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
