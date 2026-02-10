import { createClient } from '@supabase/supabase-js'

// Admin client with service_role key — bypasses RLS
// ONLY use in server-side code (API routes, edge functions)
// NEVER expose to the browser
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)
