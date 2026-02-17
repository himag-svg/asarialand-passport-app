import { createClient } from "@supabase/supabase-js";

/** Service-role client for server-side operations that need elevated privileges.
 *  Only use in Server Actions and API routes — never on the client. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
