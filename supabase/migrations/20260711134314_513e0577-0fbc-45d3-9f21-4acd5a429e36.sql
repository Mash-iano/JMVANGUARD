
CREATE TABLE public.youth_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_number TEXT,
  gender TEXT,
  date_of_birth DATE,
  constituency TEXT NOT NULL,
  ward TEXT NOT NULL,
  village TEXT,
  occupation TEXT,
  interests TEXT[],
  source TEXT DEFAULT 'public_portal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.youth_registrations TO anon, authenticated;
GRANT ALL ON public.youth_registrations TO service_role;

ALTER TABLE public.youth_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a youth registration"
  ON public.youth_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 2 AND 120
    AND length(phone) BETWEEN 7 AND 20
    AND length(constituency) BETWEEN 2 AND 80
    AND length(ward) BETWEEN 2 AND 80
  );

CREATE INDEX youth_registrations_constituency_idx ON public.youth_registrations (constituency);
CREATE INDEX youth_registrations_ward_idx ON public.youth_registrations (ward);
