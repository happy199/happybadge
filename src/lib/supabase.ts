import { type CookieOptions, createServerClient, createBrowserClient } from '@supabase/ssr'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import type { Database } from './database.types'

// For Client Components
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// For Server Components, Server Actions, and Route Handlers
export const createServerSupabaseClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // The `set` method was throwing an error in read-only mode.
          // The docs now recommend casting to `any` for route handlers and server actions.
          // However, a better approach for route handlers is to handle the response cookies separately.
          // For now, I will just log this action, as the middleware should handle the cookie setting.
          // A more robust solution would be needed for Server Actions that modify auth state.
          try {
            (cookieStore as any).set({ name, value, ...options })
          } catch (error) {
            console.log("Note: cookieStore.set called in a read-only context. The middleware is responsible for setting cookies.")
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            (cookieStore as any).set({ name, value: '', ...options })
          } catch (error) {
            console.log("Note: cookieStore.remove called in a read-only context. The middleware is responsible for setting cookies.")
          }
        },
      },
    }
  )
}
