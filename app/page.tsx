"use client"

import { useState, useEffect } from 'react'
import { FileNode, Tab, LogEntry } from '@/types'
import { FileTree } from '@/components/file-tree'
import { TabBar } from '@/components/tab-bar'
import { WorkspaceViewer } from '@/components/workspace-viewer'
import { StatusBar } from '@/components/status-bar'
import { CommandPalette } from '@/components/command-palette'
import { Files, Search, Settings } from 'lucide-react'

const initialFiles: FileNode[] = [
  {
    id: 'readme',
    name: 'readme.md',
    type: 'file',
    path: 'readme.md',
    extension: 'md'
  },
  {
    id: 'ideas',
    name: 'ideas.md',
    type: 'file',
    path: 'ideas.md',
    extension: 'md'
  },
  {
    id: 'projects',
    name: 'projects',
    type: 'directory',
    path: 'projects',
    children: [
      {
        id: 'vehicle_rental',
        name: 'vehicle_rental.json',
        type: 'file',
        path: 'projects/vehicle_rental.json',
        extension: 'json'
      },
      {
        id: 'integrity_execution',
        name: 'integrity_execution.json',
        type: 'file',
        path: 'projects/integrity_execution.json',
        extension: 'json'
      }
    ]
  },
  {
    id: 'education_&_leadership',
    name: 'education_&_leadership.tsx',
    type: 'file',
    path: 'education_&_leadership.tsx',
    extension: 'tsx'
  },
  {
    id: 'contact',
    name: 'contact.env',
    type: 'file',
    path: 'contact.env',
    extension: 'env'
  }
]

export default function Home() {
  const [activeFile, setActiveFile] = useState<FileNode | null>(initialFiles[0])
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'readme', name: 'readme.md', path: 'readme.md', isActive: true }
  ])
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '23:47:57', message: 'VITE v5.2.11 ready in 184 ms', type: 'info' },
    { timestamp: '23:47:58', message: '[mongodb] connected successfully to cluster0', type: 'success' },
    { timestamp: '23:47:58', message: '[redis] cache client connected on port 6379', type: 'info' },
    { timestamp: '23:47:59', message: '[estimator-ml] model cost_regression_v1.0.bin loaded (nominal)', type: 'warning' },
    { timestamp: '23:47:59', message: '[system] workstation operational state initialized.', type: 'success' }
  ])
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleFileSelect = (node: FileNode) => {
    setActiveFile(node)
    
    // Add to tabs if not already present
    setTabs(prev => {
      const exists = prev.some(t => t.id === node.id)
      const updated = prev.map(t => ({ ...t, isActive: t.id === node.id }))
      if (!exists) {
        return [...updated, { id: node.id, name: node.name, path: node.path, isActive: true }]
      }
      return updated
    })

    // Log the file open action
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [...prev, { timestamp: time, message: `Opened file ${node.path}`, type: 'info' }])
  }

  const handleTabClose = (tabId: string) => {
    setTabs(prev => {
      const index = prev.findIndex(t => t.id === tabId)
      if (index === -1) return prev
      
      const newTabs = prev.filter(t => t.id !== tabId)
      
      // If closing active tab, activate another
      if (prev[index].isActive && newTabs.length > 0) {
        const nextActiveIdx = Math.max(0, index - 1)
        newTabs[nextActiveIdx].isActive = true
        
        // Find corresponding file node to set active
        const findNode = (nodes: FileNode[], id: string): FileNode | null => {
          for (const n of nodes) {
            if (n.id === id) return n
            if (n.children) {
              const res = findNode(n.children, id)
              if (res) return res
            }
          }
          return null
        }
        const activeNode = findNode(initialFiles, newTabs[nextActiveIdx].id)
        setActiveFile(activeNode)
      } else if (newTabs.length === 0) {
        setActiveFile(null)
      }
      
      return newTabs
    })
  }

  const handleTabSelect = (tabId: string) => {
    const findNode = (nodes: FileNode[], id: string): FileNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n
        if (n.children) {
          const res = findNode(n.children, id)
          if (res) return res
        }
      }
      return null
    }
    const node = findNode(initialFiles, tabId)
    if (node) {
      setActiveFile(node)
      setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === tabId })))
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-1.5 bg-sidebar border-b border-border text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-accent">Nadirsha-workspace</span>
          <span className="text-muted border-l border-border pl-3">
            ~/ {activeFile ? activeFile.path : ''}
          </span>
        </div>
        <div 
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1 bg-code-bg border border-border rounded cursor-pointer text-muted hover:text-foreground transition-colors w-80 max-w-sm justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Search files...</span>
          </span>
          <kbd className="bg-background px-1 border border-border rounded text-[10px]">Ctrl+K</kbd>
        </div>
        <div>
          <span className="text-muted">v1.0.0</span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (Far Left Strip) */}
        <aside className="w-12 bg-sidebar border-r border-border flex flex-col justify-between items-center py-4">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded hover:bg-code-bg transition-colors \${isSidebarOpen ? 'text-accent' : 'text-muted'}`}
            >
              <Files className="w-5 h-5" />
            </button>
            <button className="p-2 rounded hover:bg-code-bg transition-colors text-muted">
              <Search className="w-5 h-5" onClick={() => setIsCommandPaletteOpen(true)} />
            </button>
          </div>
          <button className="p-2 rounded hover:bg-code-bg transition-colors text-muted">
            <Settings className="w-5 h-5" />
          </button>
        </aside>

        {/* Sidebar file tree */}
        {isSidebarOpen && (
          <aside className="w-64 bg-sidebar border-r border-border flex flex-col">
            <div className="flex-1 overflow-y-auto flex flex-col">
              <FileTree 
                nodes={initialFiles}
                activeFile={activeFile ? activeFile.path : null}
                onFileSelect={handleFileSelect}
              />
            </div>
          </aside>
        )}

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <TabBar 
            tabs={tabs}
            onTabClose={handleTabClose}
            onTabSelect={handleTabSelect}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <WorkspaceViewer activeFile={activeFile} />
          </div>
          <StatusBar logs={logs} />
        </main>
      </div>

      <CommandPalette 
        key={isCommandPaletteOpen ? 'open' : 'closed'}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={initialFiles}
        onSelectFile={handleFileSelect}
      />
    </div>
  )
}
