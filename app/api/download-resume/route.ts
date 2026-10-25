import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isInline = searchParams.get('inline') === '1'
    const isInfoOnly = searchParams.get('info') === '1'

    const filePath = path.join(process.cwd(), 'public', 'resume.pdf')

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Resume PDF not found' }, { status: 404 })
    }

    const stats = await fs.promises.stat(filePath)

    if (isInfoOnly) {
      return NextResponse.json({
        success: true,
        exists: true,
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
        filename: 'Syed_Nadirsha_Resume.pdf'
      })
    }

    const fileBuffer = await fs.promises.readFile(filePath)
    const disposition = isInline 
      ? 'inline; filename="Syed_Nadirsha_Resume.pdf"' 
      : 'attachment; filename="Syed_Nadirsha_Resume.pdf"'

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
