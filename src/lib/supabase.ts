import {
  createServerComponentClient,
  createClientComponentClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import type { Database } from './database.types'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export const createServerClient = (cookieStore: ReadonlyRequestCookies) =>
  createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

export const createRouteHandlerSupabaseClient = (
  cookieStore: ReadonlyRequestCookies
) =>
  createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  })

export const supabase = createClientComponentClient<Database>()
