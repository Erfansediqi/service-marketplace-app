import { supabase } from "./supabase";

export type SupabaseInitializationResult = {
  initialized: true;
  hasStoredSession: boolean;
};

export async function checkSupabaseClientInitialization(): Promise<SupabaseInitializationResult> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(
      `Supabase client initialization failed: ${error.message}`,
    );
  }

  return {
    initialized: true,
    hasStoredSession: Boolean(data.session),
  };
}
