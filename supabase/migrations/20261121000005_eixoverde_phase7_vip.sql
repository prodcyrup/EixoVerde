-- ============================================================================
-- EixoVerde Phase 7: Lifetime VIP Entitlement (EixoVerde VIP • R$ 9,90)
-- ============================================================================
-- Idempotent migration: safe to run multiple times in Supabase SQL Editor.
-- Adds lifetime VIP columns to public.profiles and exposes a secure RPC
-- `public.activate_vip_entitlement(...)` so users keep VIP status across devices.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_sku text,
  ADD COLUMN IF NOT EXISTS premium_platform text,
  ADD COLUMN IF NOT EXISTS premium_receipt_ref text,
  ADD COLUMN IF NOT EXISTS premium_purchased_at timestamptz;

CREATE OR REPLACE FUNCTION public.activate_vip_entitlement(
  p_sku text DEFAULT 'eixoverde_vip_lifetime',
  p_platform text DEFAULT 'android',
  p_receipt_ref text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária para ativar o EixoVerde VIP.';
  END IF;

  INSERT INTO public.profiles (
    id,
    is_premium,
    premium_sku,
    premium_platform,
    premium_receipt_ref,
    premium_purchased_at,
    updated_at
  )
  VALUES (
    v_uid,
    true,
    COALESCE(NULLIF(trim(p_sku), ''), 'eixoverde_vip_lifetime'),
    COALESCE(NULLIF(trim(p_platform), ''), 'android'),
    p_receipt_ref,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    is_premium = true,
    premium_sku = EXCLUDED.premium_sku,
    premium_platform = EXCLUDED.premium_platform,
    premium_receipt_ref = COALESCE(EXCLUDED.premium_receipt_ref, public.profiles.premium_receipt_ref),
    premium_purchased_at = COALESCE(public.profiles.premium_purchased_at, now()),
    updated_at = now();

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_vip_entitlement(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_vip_entitlement(text, text, text) TO authenticated;
