import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    const expectedPassword = process.env.ADMIN_PASSWORD || 'nadir-admin-pass'

    if (password === expectedPassword) {
      const token = signToken()
      
      const response = NextResponse.json({ 
        success: true, 
        token 
      })

      // Set secure HTTP-only cookie
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
      })

      return response
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid password' 
    }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
