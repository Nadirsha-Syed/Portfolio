import { NextResponse } from 'next/server'
import { getResumeData } from '@/lib/resume-storage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isInline = searchParams.get('inline') === '1'
    const isInfoOnly = searchParams.get('info') === '1'

    const data = await getResumeData()

    if (!data) {
      return NextResponse.json({ success: false, error: 'Resume PDF not found' }, { status: 404 })
    }

    if (isInfoOnly) {
      return NextResponse.json({
        success: true,
        exists: true,
        size: data.metadata.size,
        updatedAt: data.metadata.updatedAt,
        url: data.metadata.url,
        source: data.metadata.source,
        filename: 'Syed_Nadirsha_Resume.pdf'
      })
    }

    // If a direct external URL exists (e.g. Vercel Blob CDN) and inline view is requested, we can redirect or stream
    const disposition = isInline 
      ? 'inline; filename="Syed_Nadirsha_Resume.pdf"' 
      : 'attachment; filename="Syed_Nadirsha_Resume.pdf"'

    return new Response(new Uint8Array(data.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': data.metadata.size.toString(),
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
