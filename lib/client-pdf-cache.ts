"use client"

const DB_NAME = 'portfolio_pdf_store'
const STORE_NAME = 'resumes'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'))
    }
    const req = window.indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export interface CachedPdfMeta {
  name: string
  size: number
  updatedAt: string
}

export async function saveLocalPdf(file: File | Blob, metadata: CachedPdfMeta): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const arrayBuffer = await file.arrayBuffer()
    store.put(arrayBuffer, 'current_pdf_blob')
    store.put(metadata, 'current_pdf_meta')
  } catch (err) {
    console.warn('Failed to cache PDF in IndexedDB:', err)
  }
}

export async function getLocalPdf(): Promise<{ blobUrl: string; blob: Blob; metadata: CachedPdfMeta } | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const reqBlob = store.get('current_pdf_blob')
      const reqMeta = store.get('current_pdf_meta')

      tx.oncomplete = () => {
        if (reqBlob.result && reqMeta.result) {
          const blob = new Blob([reqBlob.result], { type: 'application/pdf' })
          const blobUrl = URL.createObjectURL(blob)
          resolve({ blobUrl, blob, metadata: reqMeta.result })
        } else {
          resolve(null)
        }
      }
      tx.onerror = () => resolve(null)
    })
  } catch (err) {
    return null
  }
}

export async function clearLocalPdf(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete('current_pdf_blob')
    store.delete('current_pdf_meta')
  } catch (err) {
    console.warn('Failed to clear local PDF:', err)
  }
}
