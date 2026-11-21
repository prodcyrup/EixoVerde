-- ============================================================================
-- EixoVerde — Phase 5: In-App Account & Data Deletion (Apple 5.1.1(v) & Google Play)
-- Migration: 20261121000004_eixoverde_phase5_account_delete.sql
--
-- 100% idempotent: safe to re-run via Supabase SQL Editor or `supabase db push`.
-- Allows an authenticated user to permanently delete their own cloud account
-- and all associated data directly from the app (`SELECT public.delete_my_account();`).
-- ============================================================================

SET search_path = public, auth, extensions;

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Delete Phase 4 community ratings & routes if tables exist
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'route_ratings') THEN
    DELETE FROM public.route_ratings WHERE user_id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_routes') THEN
    DELETE FROM public.community_routes WHERE author_id = v_uid;
  END IF;

  -- 2. Delete Phase 3 recorded ride sessions if table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ride_sessions') THEN
    DELETE FROM public.ride_sessions WHERE user_id = v_uid;
  END IF;

  -- 3. Delete Phase 2 user data tables
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hazard_confirmations') THEN
    DELETE FROM public.hazard_confirmations WHERE user_id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hazard_reports') THEN
    DELETE FROM public.hazard_reports WHERE user_id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'custom_vehicles') THEN
    DELETE FROM public.custom_vehicles WHERE user_id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_places') THEN
    DELETE FROM public.saved_places WHERE user_id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_routes') THEN
    DELETE FROM public.saved_routes WHERE user_id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
    DELETE FROM public.user_preferences WHERE user_id = v_uid;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DELETE FROM public.profiles WHERE id = v_uid;
  END IF;

  -- 4. Delete user record from auth.users (cascades any remaining foreign keys)
  DELETE FROM auth.users WHERE id = v_uid;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
