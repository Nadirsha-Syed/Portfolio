"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileNode } from '@/types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  files: FileNode[]
  onSelectFile: (file: FileNode) => void
}

export function CommandPalette({ isOpen, onClose, files, onSelectFile }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const flattenFiles = useCallback((nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = []
    const traverse = (node: FileNode) => {
      if (node.type === 'file') {
        result.push(node)
      }
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    nodes.forEach(traverse)
    return result
  }, [])

  const allFiles = useMemo(() => flattenFiles(files), [files, flattenFiles])

  const filteredFiles = useMemo(() => {
    if (!isOpen) return []
    return allFiles.filter(file =>
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.path.toLowerCase().includes(query.toLowerCase())
    )
  }, [isOpen, query, allFiles])


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredFiles.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredFiles.length) % filteredFiles.length)
      } else if (e.key === 'Enter' && filteredFiles.length > 0) {
        onSelectFile(filteredFiles[selectedIndex])
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, filteredFiles, selectedIndex, onSelectFile])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent outline-none text-sm font-mono"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-sidebar-border/50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted text-sm">
              No files found
            </div>
          ) : (
            filteredFiles.map((file, idx) => (
              <button
                key={file.id}
                onClick={() => {
                  onSelectFile(file)
                  onClose()
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-sidebar-border/50 transition-colors",
                  idx === selectedIndex && "bg-sidebar-border/50"
                )}
              >
                <span className="font-mono text-sm text-muted">{file.path}</span>
                <span className="font-mono text-sm">{file.name}</span>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border text-xs font-mono text-muted">
          <span className="flex items-center gap-4">
            <span>↑↓ to navigate</span>
            <span>Enter to select</span>
            <span>Esc to close</span>
          </span>
        </div>
      </div>
    </div>
  )
}
