-- ============================================================================
-- EixoVerde — Phase 4: Community Routes, 1-5★ Ratings & Realtime Hazards
-- Migration: 20261121000003_eixoverde_phase4_community.sql
--
-- 100% idempotent: safe to re-run via Supabase SQL Editor or `supabase db push`.
-- ============================================================================

SET search_path = public, extensions;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_community_route_geom()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
DECLARE
  v_line geometry(LineString, 4326);
BEGIN
  IF NEW.coords IS NULL
     OR jsonb_typeof(NEW.coords) <> 'array'
     OR jsonb_array_length(NEW.coords) < 2 THEN
    NEW.geom := NULL;
    RETURN NEW;
  END IF;

  SELECT ST_SetSRID(
           ST_MakeLine(
             ST_MakePoint((pt->>0)::double precision, (pt->>1)::double precision)
             ORDER BY ord
           ),
           4326
         )
    INTO v_line
  FROM jsonb_array_elements(NEW.coords) WITH ORDINALITY AS t(pt, ord)
  WHERE (pt->>0) IS NOT NULL
    AND (pt->>1) IS NOT NULL;

  NEW.geom := v_line;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  NEW.geom := NULL;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1. Table: public.community_routes (Public Read + Owner Write RLS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_routes (
  id TEXT PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Ciclista DF',
  name TEXT NOT NULL,
  description TEXT,
  tag TEXT NOT NULL DEFAULT 'Comunidade DF',
  difficulty TEXT NOT NULL DEFAULT 'Fácil'
    CHECK (difficulty IN ('Fácil', 'Moderado', 'Desafiador')),
  city TEXT NOT NULL DEFAULT 'Brasília, DF',
  profile TEXT NOT NULL DEFAULT 'safe'
    CHECK (profile IN ('safe', 'balanced', 'fast')),
  coords JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(coords) = 'array'),
  waypoints JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(waypoints) = 'array'),
  geom geometry(LineString, 4326),
  distance_km DOUBLE PRECISION NOT NULL DEFAULT 0
    CHECK (distance_km >= 0),
  ascent_m INTEGER NOT NULL DEFAULT 0
    CHECK (ascent_m >= 0),
  descent_m INTEGER NOT NULL DEFAULT 0
    CHECK (descent_m >= 0),
  safety_score INTEGER NOT NULL DEFAULT 75
    CHECK (safety_score BETWEEN 0 AND 100),
  origin_name TEXT,
  dest_name TEXT,
  avg_rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  safety_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_routes_geom
  ON public.community_routes USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_community_routes_rating
  ON public.community_routes (avg_rating DESC, rating_count DESC);

DROP TRIGGER IF EXISTS trg_community_routes_updated_at ON public.community_routes;
CREATE TRIGGER trg_community_routes_updated_at
  BEFORE UPDATE ON public.community_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_community_routes_geom ON public.community_routes;
CREATE TRIGGER trg_community_routes_geom
  BEFORE INSERT OR UPDATE OF coords ON public.community_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_community_route_geom();

ALTER TABLE public.community_routes ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.community_routes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_routes TO authenticated;

DROP POLICY IF EXISTS "community_routes_select_public" ON public.community_routes;
CREATE POLICY "community_routes_select_public"
  ON public.community_routes
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "community_routes_insert_own" ON public.community_routes;
CREATE POLICY "community_routes_insert_own"
  ON public.community_routes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "community_routes_update_own" ON public.community_routes;
CREATE POLICY "community_routes_update_own"
  ON public.community_routes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "community_routes_delete_own" ON public.community_routes;
CREATE POLICY "community_routes_delete_own"
  ON public.community_routes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ----------------------------------------------------------------------------
-- 2. Table: public.route_ratings (1-5★ + Safety Tags for Curated & Community)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.route_ratings (
  route_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (route_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_route_ratings_route
  ON public.route_ratings (route_id);

DROP TRIGGER IF EXISTS trg_route_ratings_updated_at ON public.route_ratings;
CREATE TRIGGER trg_route_ratings_updated_at
  BEFORE UPDATE ON public.route_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.sync_community_route_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_route_id TEXT;
BEGIN
  v_route_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.route_id ELSE NEW.route_id END;

  UPDATE public.community_routes cr
  SET
    avg_rating = COALESCE((SELECT round(avg(r.rating)::numeric, 2)::double precision FROM public.route_ratings r WHERE r.route_id = v_route_id), 0),
    rating_count = COALESCE((SELECT count(*)::integer FROM public.route_ratings r WHERE r.route_id = v_route_id), 0),
    updated_at = now()
  WHERE cr.id = v_route_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_route_ratings_sync_community ON public.route_ratings;
CREATE TRIGGER trg_route_ratings_sync_community
  AFTER INSERT OR UPDATE OR DELETE ON public.route_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_community_route_rating();

ALTER TABLE public.route_ratings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.route_ratings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.route_ratings TO authenticated;

DROP POLICY IF EXISTS "route_ratings_select_public" ON public.route_ratings;
CREATE POLICY "route_ratings_select_public"
  ON public.route_ratings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "route_ratings_insert_own" ON public.route_ratings;
CREATE POLICY "route_ratings_insert_own"
  ON public.route_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "route_ratings_update_own" ON public.route_ratings;
CREATE POLICY "route_ratings_update_own"
  ON public.route_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "route_ratings_delete_own" ON public.route_ratings;
CREATE POLICY "route_ratings_delete_own"
  ON public.route_ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. Enable Supabase Realtime Publication on public.hazard_reports (idempotent)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hazard_reports') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.hazard_reports;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END
$$;
