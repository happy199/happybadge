import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  const redirect = requestUrl.searchParams.get('redirect')

  // URL to redirect to after sign in process completes
  // If a redirect param is present, use it. Otherwise, default to the origin.
  const redirectUrl = redirect ? new URL(redirect, requestUrl.origin) : new URL('/', requestUrl.origin)

  return NextResponse.redirect(redirectUrl)
}
