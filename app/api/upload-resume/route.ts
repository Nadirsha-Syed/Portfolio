import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

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

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ success: false, error: 'Only PDF files are allowed' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    const filePath = path.join(publicDir, 'resume.pdf')
    await fs.promises.writeFile(filePath, buffer)

    return NextResponse.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      size: buffer.length,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'resume.pdf')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ exists: false })
    }
    const stats = await fs.promises.stat(filePath)
    return NextResponse.json({
      exists: true,
      size: stats.size,
      updatedAt: stats.mtime.toISOString()
    })
  } catch (error) {
    return NextResponse.json({ exists: false, error: 'Unable to read file info' })
  }
}
