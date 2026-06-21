"use client"

import { useState, useEffect } from 'react'
import { FileNode, Tab, LogEntry } from '@/types'
import { FileTree } from '@/components/file-tree'
import { TabBar } from '@/components/tab-bar'
import { WorkspaceViewer } from '@/components/workspace-viewer'
import { StatusBar } from '@/components/status-bar'
import { CommandPalette } from '@/components/command-palette'
import { Files, Search, Settings, Smartphone } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

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
  const { theme, setTheme } = useTheme()
  const [activeFile, setActiveFile] = useState<FileNode | null>(initialFiles[0])
  const [showRotatePrompt, setShowRotatePrompt] = useState(false)
  const [dismissedPrompt, setDismissedPrompt] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth
      const isMobileSize = window.innerWidth < 768
      setShowRotatePrompt(isPortrait && isMobileSize)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(14)

  // Initialize sidebar state and font-size on mount based on screen width
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false)
      setFontSize(12)
    }
  }, [])

  // Close settings dropdown on click outside
  useEffect(() => {
    if (!isSettingsOpen) return
    const handleClick = () => setIsSettingsOpen(false)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [isSettingsOpen])

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
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">
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
              className={cn(
                "p-2 rounded hover:bg-code-bg transition-colors cursor-pointer flex items-center justify-center",
                isSidebarOpen ? 'text-accent' : 'text-muted'
              )}
            >
              <Files className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 rounded hover:bg-code-bg transition-colors text-muted cursor-pointer flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsSettingsOpen(!isSettingsOpen)
              }}
              className={cn(
                "p-2 rounded hover:bg-code-bg transition-colors text-muted cursor-pointer flex items-center justify-center",
                isSettingsOpen && "text-accent bg-code-bg"
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
            {isSettingsOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute left-14 bottom-0 w-56 bg-sidebar border border-border rounded-lg shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="text-[10px] font-mono font-semibold text-muted px-3 py-1 border-b border-border uppercase tracking-wider mb-1">
                  Preferences
                </div>
                <button 
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                    setIsSettingsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-code-bg transition-colors flex items-center justify-between text-foreground cursor-pointer"
                >
                  <span>Toggle Theme</span>
                  <span className="text-[10px] text-muted uppercase">{theme || 'system'}</span>
                </button>
                <div className="border-t border-border/50 my-1" />
                <div className="px-3 py-1 text-xs font-mono flex items-center justify-between text-foreground">
                  <span>Font Size</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                      className="w-5 h-5 flex items-center justify-center border border-border rounded hover:bg-code-bg cursor-pointer"
                      title="Decrease Font Size"
                    >
                      -
                    </button>
                    <span className="min-w-[16px] text-center">{fontSize}px</span>
                    <button 
                      onClick={() => setFontSize(prev => Math.min(20, prev + 1))}
                      className="w-5 h-5 flex items-center justify-center border border-border rounded hover:bg-code-bg cursor-pointer"
                      title="Increase Font Size"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="border-t border-border/50 my-1" />
                <button 
                  onClick={() => {
                    setLogs([])
                    setIsSettingsOpen(false)
                    const time = new Date().toTimeString().split(' ')[0]
                    setLogs([{ timestamp: time, message: 'Terminal console logs cleared.', type: 'info' }])
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-code-bg transition-colors text-red-500 hover:text-red-400 cursor-pointer"
                >
                  Clear Console Logs
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Click-away backdrop overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="sm:hidden fixed inset-0 z-30 bg-background/20 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar file tree */}
        <aside className={cn(
          "w-64 bg-sidebar border-r border-border flex flex-col transition-all duration-200",
          // Mobile responsive overlay positioning
          "max-sm:fixed max-sm:left-12 max-sm:top-[31px] max-sm:bottom-[108px] max-sm:z-40 max-sm:shadow-2xl",
          // Open/Close transition classes
          isSidebarOpen 
            ? "max-sm:translate-x-0 sm:w-64" 
            : "max-sm:-translate-x-full sm:w-0 sm:overflow-hidden sm:border-r-0"
        )}>
          <div className="flex-1 overflow-y-auto flex flex-col">
            <FileTree 
              nodes={initialFiles}
              activeFile={activeFile ? activeFile.path : null}
              onFileSelect={(node) => {
                handleFileSelect(node)
                // Close sidebar overlay automatically when selecting a file on mobile
                if (window.innerWidth < 640) {
                  setIsSidebarOpen(false)
                }
              }}
            />
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <TabBar 
            tabs={tabs}
            onTabClose={handleTabClose}
            onTabSelect={handleTabSelect}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <WorkspaceViewer activeFile={activeFile} fontSize={fontSize} />
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

      {showRotatePrompt && !dismissedPrompt && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-background/95 backdrop-blur-md text-center">
          <div className="max-w-xs space-y-6">
            <div className="relative inline-block p-6 bg-sidebar border border-border rounded-full shadow-inner">
              <Smartphone className="w-16 h-16 text-accent animate-phone-rotate" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-mono">Rotate Your Device</h2>
              <p className="text-xs text-muted font-sans leading-relaxed">
                This simulated developer workstation is best experienced in **landscape mode**. Please tilt your screen to align the workspace components.
              </p>
            </div>
            <button
              onClick={() => setDismissedPrompt(true)}
              className="px-4 py-2 border border-border bg-sidebar hover:bg-sidebar-border/50 text-xs font-mono text-muted hover:text-foreground rounded transition-colors cursor-pointer w-full"
            >
              Dismiss & view anyway
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
