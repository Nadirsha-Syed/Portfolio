import fs from 'fs'
import path from 'path'
import os from 'os'
import { put, list } from '@vercel/blob'

// Global in-memory storage fallback for serverless instances
declare global {
  var __uploadedResumeBuffer: Buffer | undefined
  var __uploadedResumeMeta: { size: number; updatedAt: string; name?: string; url?: string } | undefined
}

export interface ResumeMetadata {
  exists: boolean
  size: number
  updatedAt: string
  url?: string
  source: 'vercel-blob' | 'filesystem' | 'tmp' | 'memory'
}

export async function getResumeData(): Promise<{ buffer: Buffer; metadata: ResumeMetadata } | null> {
  // 1. Check if Vercel Blob token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: 'resume' })
      if (blobs.length > 0) {
        const latest = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]
        const res = await fetch(latest.url)
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer()
          return {
            buffer: Buffer.from(arrayBuf),
            metadata: {
              exists: true,
              size: latest.size,
              updatedAt: latest.uploadedAt.toISOString(),
              url: latest.url,
              source: 'vercel-blob'
            }
          }
        }
      }
    } catch (err) {
      console.warn('Vercel Blob read error, falling back to local/tmp storage:', err)
    }
  }

  // 2. Check in-memory global cache
  if (globalThis.__uploadedResumeBuffer && globalThis.__uploadedResumeMeta) {
    return {
      buffer: globalThis.__uploadedResumeBuffer,
      metadata: {
        exists: true,
        size: globalThis.__uploadedResumeMeta.size,
        updatedAt: globalThis.__uploadedResumeMeta.updatedAt,
        url: globalThis.__uploadedResumeMeta.url,
        source: 'memory'
      }
    }
  }

  // 3. Check /tmp directory (writable on Vercel serverless)
  const tmpPath = path.join(os.tmpdir(), 'resume.pdf')
  if (fs.existsSync(tmpPath)) {
    try {
      const stats = await fs.promises.stat(tmpPath)
      const buffer = await fs.promises.readFile(tmpPath)
      return {
        buffer,
        metadata: {
          exists: true,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
          source: 'tmp'
        }
      }
    } catch (e) {
      // Continue to next fallback
    }
  }

  // 4. Check public/resume.pdf (bundled repository asset)
  const publicPath = path.join(process.cwd(), 'public', 'resume.pdf')
  if (fs.existsSync(publicPath)) {
    try {
      const stats = await fs.promises.stat(publicPath)
      const buffer = await fs.promises.readFile(publicPath)
      return {
        buffer,
        metadata: {
          exists: true,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
          source: 'filesystem'
        }
      }
    } catch (e) {
      console.error('Failed reading public/resume.pdf:', e)
    }
  }

  return null
}

export async function saveResumeData(file: File): Promise<ResumeMetadata> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const now = new Date().toISOString()

  // Always update in-memory cache
  globalThis.__uploadedResumeBuffer = buffer
  globalThis.__uploadedResumeMeta = {
    size: buffer.length,
    updatedAt: now,
    name: file.name
  }

  // 1. Try Vercel Blob if token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put('resume.pdf', buffer, {
        access: 'public',
        addRandomSuffix: false,
      })
      globalThis.__uploadedResumeMeta.url = blob.url
      return {
        exists: true,
        size: buffer.length,
        updatedAt: now,
        url: blob.url,
        source: 'vercel-blob'
      }
    } catch (blobErr) {
      console.warn('Vercel Blob put failed, falling back to local/tmp storage:', blobErr)
    }
  }

  // 2. Try writing to public/resume.pdf (works locally or in writable Node environments)
  let wroteToPublic = false
  try {
    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    const publicPath = path.join(publicDir, 'resume.pdf')
    await fs.promises.writeFile(publicPath, buffer)
    wroteToPublic = true
  } catch (err: any) {
    // EROFS is expected on Vercel serverless where process.cwd() is read-only
    console.info('public/ directory is read-only (Vercel serverless). Using /tmp storage fallback.')
  }

  // 3. Always write to /tmp as safe writable fallback
  try {
    const tmpPath = path.join(os.tmpdir(), 'resume.pdf')
    await fs.promises.writeFile(tmpPath, buffer)
  } catch (tmpErr) {
    console.warn('Could not write to /tmp:', tmpErr)
  }

  return {
    exists: true,
    size: buffer.length,
    updatedAt: now,
    source: wroteToPublic ? 'filesystem' : 'tmp'
  }
}
