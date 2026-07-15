-- Roles enum
CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'admin',
  'campaign_manager',
  'strategy_lead',
  'field_coordinator',
  'volunteer_lead',
  'media_lead',
  'finance_lead',
  'analyst',
  'volunteer',
  'viewer'
);

-- user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role check to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Users can read their own role rows; super admins can read all
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Bootstrap audit log — records one-time SUPER_ADMIN bootstrap event
CREATE TABLE public.bootstrap_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  actor_email text,
  actor_user_id uuid,
  ip text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bootstrap_audit TO authenticated;
GRANT ALL ON public.bootstrap_audit TO service_role;

ALTER TABLE public.bootstrap_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view bootstrap audit"
  ON public.bootstrap_audit FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
