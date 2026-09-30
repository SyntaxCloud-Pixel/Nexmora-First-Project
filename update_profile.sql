CREATE OR REPLACE FUNCTION public.update_own_profile(
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_phone VARCHAR
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET first_name = p_first_name,
      last_name = p_last_name,
      phone = p_phone,
      updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
