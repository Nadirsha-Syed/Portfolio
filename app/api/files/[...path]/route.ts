import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

async function isAuthenticated(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined
  
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('admin_token')?.value
  }
  
  return verifyToken(token)
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { path: pathSegments } = await context.params
    const filePath = pathSegments.join('/')

    const { content } = await request.json()
    if (content === undefined) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }

    const db = readDb()

    // Helper to search recursively in file tree
    const findNode = (nodes: any[], targetPath: string): boolean => {
      for (const n of nodes) {
        if (n.path === targetPath) return true
        if (n.children && findNode(n.children, targetPath)) return true
      }
      return false
    }

    const fileExists = findNode(db.files, filePath)
    if (!fileExists) {
      return NextResponse.json({ success: false, error: `File not found in tree: ${filePath}` }, { status: 404 })
    }

    db.contents[filePath] = content
    writeDb(db)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating file content:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
