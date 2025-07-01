import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "nuxt/app";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the Supabase client.
 * It initializes the client on the first call and uses runtime
 * configuration, making it safe for both client and server use.
 */
export const useSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    const config = useRuntimeConfig();
    const supabaseUrl = config.public.supabaseUrl as string;
    const supabaseKey = config.public.supabaseKey as string;
    console.log(supabaseKey)

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseInstance;
};
