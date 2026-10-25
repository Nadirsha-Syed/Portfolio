import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { saveResumeData, getResumeData } from '@/lib/resume-storage'

async function isAuthenticated(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
  
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('admin_token')?.value
  }
  
  return verifyToken(token)
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ success: false, error: 'Only PDF files are allowed' }, { status: 400 })
    }

    const metadata = await saveResumeData(file)

    return NextResponse.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      size: metadata.size,
      updatedAt: metadata.updatedAt,
      url: metadata.url,
      source: metadata.source
    })
  } catch (error: any) {
    console.error('Error uploading resume:', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await getResumeData()
    if (!data) {
      return NextResponse.json({ exists: false })
    }
    return NextResponse.json({
      exists: true,
      size: data.metadata.size,
      updatedAt: data.metadata.updatedAt,
      url: data.metadata.url,
      source: data.metadata.source
    })
  } catch (error) {
    return NextResponse.json({ exists: false, error: 'Unable to read file info' })
  }
}
