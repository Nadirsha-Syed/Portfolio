import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// Helper to check authentication
async function isAuthenticated(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
  
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('admin_token')?.value
  }
  
  return verifyToken(token)
}

export async function GET() {
  try {
    const data = readDb()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to read files' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, projectData } = await request.json()
    if (!fileName) {
      return NextResponse.json({ success: false, error: 'File name is required.' }, { status: 400 })
    }

    // Sanitize input: remove all whitespace
    let sanitizedInput = fileName.replace(/\s+/g, '')
    if (sanitizedInput.endsWith('.json')) {
      sanitizedInput = sanitizedInput.slice(0, -5)
    }

    // Keep only alphanumeric, dash, and underscore
    const baseName = sanitizedInput.replace(/[^a-zA-Z0-9_-]/g, '')
    if (!baseName) {
      return NextResponse.json({ success: false, error: 'Invalid file name. Must contain alphanumeric, dash or underscore.' }, { status: 400 })
    }

    const cleanName = baseName + '.json'
    const filePath = `projects/${cleanName}`
    const fileId = baseName

    const db = readDb()
    const projectsDir = db.files.find(f => f.id === 'projects')
    
    if (!projectsDir || !projectsDir.children) {
      return NextResponse.json({ success: false, error: 'Projects directory not found in file tree' }, { status: 500 })
    }

    // Check if duplicate
    const exists = projectsDir.children.some(child => child.path === filePath)
    if (exists) {
      return NextResponse.json({ success: false, error: 'Project file already exists' }, { status: 400 })
    }

    // Add node
    projectsDir.children.push({
      id: fileId,
      name: cleanName,
      type: 'file',
      path: filePath,
      extension: 'json'
    })

    // Set initial content
    db.contents[filePath] = JSON.stringify(projectData || {}, null, 2)

    writeDb(db)

    return NextResponse.json({ success: true, data: db })
  } catch (error) {
    console.error('Error creating new project file:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
