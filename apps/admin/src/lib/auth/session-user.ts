import { cache } from "react";
import { createSupabaseServerClient } from "../supabase/server";
import { getAuthMode } from "./config";

/** Supabase user for this request (or null). Only valid in "supabase" mode. */
export const getSupabaseUser = cache(async () => {
  if (getAuthMode() !== "supabase") return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user ?? null;
});
