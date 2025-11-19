import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Error getting session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to get session', session: null },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { session: null, user: null },
        { status: 401 }
      )
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error getting user:', userError)
      return NextResponse.json(
        { error: 'Failed to get user', session: null, user: null },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        session,
        user,
        expiresAt: session.expires_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error getting session:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', session: null },
      { status: 500 }
    )
  }
}
