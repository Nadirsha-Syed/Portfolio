"use client"

import { useState, useEffect } from 'react'
import { FileNode, Tab, LogEntry } from '@/types'
import { FileTree } from '@/components/file-tree'
import { TabBar } from '@/components/tab-bar'
import { WorkspaceViewer } from '@/components/workspace-viewer'
import { StatusBar } from '@/components/status-bar'
import { CommandPalette } from '@/components/command-palette'
import { Files, Search, Settings, Smartphone, Shield, X, AlertTriangle } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export default function Home() {
  const { theme, setTheme } = useTheme()
  
  // Workspace Dynamic States
  const [files, setFiles] = useState<FileNode[]>([])
  const [contentMap, setContentMap] = useState<Record<string, string>>({})
  const [originalContentMap, setOriginalContentMap] = useState<Record<string, string>>({})
  const [activeFile, setActiveFile] = useState<FileNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false)
  const [newProjectFileName, setNewProjectFileName] = useState('')
  const [newProjectError, setNewProjectError] = useState('')

  const [showRotatePrompt, setShowRotatePrompt] = useState(false)
  const [dismissedPrompt, setDismissedPrompt] = useState(false)

  const [tabs, setTabs] = useState<Tab[]>([])
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

  // Fetch Workspace Assets on Mount
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await fetch('/api/files')
        const json = await res.json()
        if (json.success) {
          setFiles(json.data.files)
          setContentMap(json.data.contents)
          setOriginalContentMap(json.data.contents)
          
          if (json.data.files.length > 0) {
            const firstFile = json.data.files[0]
            setActiveFile(firstFile)
            setTabs([{ id: firstFile.id, name: firstFile.name, path: firstFile.path, isActive: true }])
          }
        }
      } catch (err) {
        console.error('Failed to load portfolio workspace', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchWorkspace()

    // Restore Admin Authentication
    const savedIsAdmin = sessionStorage.getItem('isAdmin') === 'true'
    const savedToken = sessionStorage.getItem('admin_token')
    if (savedIsAdmin && savedToken) {
      setIsAdmin(true)
      setToken(savedToken)
    }
  }, [])

  // Handle Mobile Orientation Checks
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

  // Initialize Responsive Font/Sidebar
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false)
      setFontSize(12)
    }
  }, [])

  // Close Settings Dropdown
  useEffect(() => {
    if (!isSettingsOpen) return
    const handleClick = () => setIsSettingsOpen(false)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [isSettingsOpen])

  // Listen for Ctrl+K (Command Palette)
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

  // Save changes via Ctrl+S
  const triggerSave = async () => {
    if (!isAdmin || !activeFile) return
    setIsSaving(true)
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [...prev, { timestamp: time, message: `Saving changes to ${activeFile.path}...`, type: 'info' }])
    
    try {
      const res = await fetch(`/api/files/${activeFile.path}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: contentMap[activeFile.path] })
      })
      const json = await res.json()
      if (json.success) {
        setOriginalContentMap(prev => ({ ...prev, [activeFile.path]: contentMap[activeFile.path] }))
        setLogs(prev => [...prev, { timestamp: time, message: `Saved ${activeFile.path} successfully.`, type: 'success' }])
      } else {
        setLogs(prev => [...prev, { timestamp: time, message: `Error saving file: ${json.error}`, type: 'error' }])
      }
    } catch (err) {
      setLogs(prev => [...prev, { timestamp: time, message: `Network error saving file ${activeFile.path}`, type: 'error' }])
    } finally {
      setIsSaving(false)
    }
  }

  // Ctrl+S key listener hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        triggerSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFile, contentMap, token, isAdmin])

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

  const handleFileSelect = (node: FileNode) => {
    setActiveFile(node)
    
    setTabs(prev => {
      const exists = prev.some(t => t.id === node.id)
      const updated = prev.map(t => ({ ...t, isActive: t.id === node.id }))
      if (!exists) {
        return [...updated, { id: node.id, name: node.name, path: node.path, isActive: true }]
      }
      return updated
    })

    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [...prev, { timestamp: time, message: `Opened file ${node.path}`, type: 'info' }])
  }

  const handleTabClose = (tabId: string) => {
    setTabs(prev => {
      const index = prev.findIndex(t => t.id === tabId)
      if (index === -1) return prev
      
      const newTabs = prev.filter(t => t.id !== tabId)
      
      if (prev[index].isActive && newTabs.length > 0) {
        const nextActiveIdx = Math.max(0, index - 1)
        newTabs[nextActiveIdx].isActive = true
        
        const activeNode = findNode(files, newTabs[nextActiveIdx].id)
        setActiveFile(activeNode)
      } else if (newTabs.length === 0) {
        setActiveFile(null)
      }
      
      return newTabs
    })
  }

  const handleTabSelect = (tabId: string) => {
    const node = findNode(files, tabId)
    if (node) {
      setActiveFile(node)
      setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === tabId })))
    }
  }

  // Admin Authentication Actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const time = new Date().toTimeString().split(' ')[0]

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })
      const json = await res.json()
      if (json.success) {
        setIsAdmin(true)
        setToken(json.token)
        sessionStorage.setItem('isAdmin', 'true')
        sessionStorage.setItem('admin_token', json.token)
        
        setLogs(prev => [...prev, { timestamp: time, message: '[auth] Admin session initialized successfully.', type: 'success' }])
        setIsLoginModalOpen(false)
        setAdminPassword('')
      } else {
        setLoginError(json.error || 'Authentication failed')
        setLogs(prev => [...prev, { timestamp: time, message: `[auth] Failed admin authentication attempt: ${json.error}`, type: 'error' }])
      }
    } catch (err) {
      setLoginError('Network connection error')
      setLogs(prev => [...prev, { timestamp: time, message: '[auth] Network error during authentication.', type: 'error' }])
    }
  }

  const handleLogout = () => {
    const time = new Date().toTimeString().split(' ')[0]
    setIsAdmin(false)
    setToken(null)
    sessionStorage.removeItem('isAdmin')
    sessionStorage.removeItem('admin_token')
    
    // Clear cookies client-side
    document.cookie = "admin_token=; path=/; max-age=0;"

    setLogs(prev => [...prev, { timestamp: time, message: '[auth] Admin session terminated.', type: 'info' }])
    setIsSettingsOpen(false)
  }

  // Add Project CRUD Action
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewProjectError('')
    
    // Sanitize input: remove all whitespace
    let sanitizedInput = newProjectFileName.replace(/\s+/g, '')
    if (!sanitizedInput) {
      setNewProjectError('File name cannot be empty')
      return
    }

    // Strip .json suffix if present to check base name
    if (sanitizedInput.endsWith('.json')) {
      sanitizedInput = sanitizedInput.slice(0, -5)
    }

    // Clean up base name: keep only alphanumeric, dash, and underscore
    const baseName = sanitizedInput.replace(/[^a-zA-Z0-9_-]/g, '')
    if (!baseName) {
      setNewProjectError('Invalid characters. Must contain alphanumeric, dash or underscore.')
      return
    }

    const cleanName = baseName + '.json'

    const defaultProj = {
      name: baseName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Platform',
      description: "A newly created full stack system project.",
      techStack: ["React.js", "Node.js", "Express.js", "MongoDB"],
      architecture: "React Frontend Client → API Gateway → Backend Engine → Database Cluster",
      endpoints: [
        {
          name: "Fetch Health State",
          method: "GET",
          path: "/api/health",
          description: "Check status of the project server modules.",
          mockResponse: { status: "nominal", code: 200 },
          mockLatency: 120
        }
      ],
      highlights: ["Initialized new workspace configuration node"],
      backendFeatures: ["Nominal state controller"],
      frontendFeatures: ["Vite dynamic route view template"]
    }

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: cleanName,
          projectData: defaultProj
        })
      })
      const json = await res.json()
      if (json.success) {
        setFiles(json.data.files)
        setContentMap(json.data.contents)
        setOriginalContentMap(json.data.contents)
        
        // Auto-select the newly added project file node
        const projectsFolder = json.data.files.find((f: any) => f.id === 'projects')
        if (projectsFolder && projectsFolder.children) {
          const newNode = projectsFolder.children.find((c: any) => c.name === cleanName)
          if (newNode) {
            handleFileSelect(newNode)
          }
        }

        const time = new Date().toTimeString().split(' ')[0]
        setLogs(prev => [...prev, { timestamp: time, message: `Created project projects/${cleanName} successfully.`, type: 'success' }])
        
        setIsAddProjectModalOpen(false)
        setNewProjectFileName('')
      } else {
        setNewProjectError(json.error || 'Failed to create project')
      }
    } catch (err) {
      setNewProjectError('Network error during project creation')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background text-foreground justify-center items-center font-mono">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-muted">Loading workspace assets...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-1.5 bg-sidebar border-b border-border text-xs font-mono select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-accent">Nadirsha-workspace</span>
          <span className="text-muted border-l border-border pl-3 hidden sm:inline">
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
        <aside className="w-12 bg-sidebar border-r border-border flex flex-col justify-between items-center py-4 select-none">
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
                
                {/* Admin Mode Toggle */}
                {isAdmin ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-code-bg transition-colors text-amber-500 hover:text-amber-400 cursor-pointer flex items-center justify-between"
                  >
                    <span>Admin Logout</span>
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsLoginModalOpen(true)
                      setIsSettingsOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono rounded hover:bg-code-bg transition-colors text-accent hover:text-accent/90 cursor-pointer flex items-center justify-between"
                  >
                    <span>Admin Login</span>
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                )}

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
          "w-64 bg-sidebar border-r border-border flex flex-col transition-all duration-200 select-none",
          "max-sm:fixed max-sm:left-12 max-sm:top-[31px] max-sm:bottom-[108px] max-sm:z-40 max-sm:shadow-2xl",
          isSidebarOpen 
            ? "max-sm:translate-x-0 sm:w-64" 
            : "max-sm:-translate-x-full sm:w-0 sm:overflow-hidden sm:border-r-0"
        )}>
          <div className="flex-1 overflow-y-auto flex flex-col">
            <FileTree 
              nodes={files}
              activeFile={activeFile ? activeFile.path : null}
              onFileSelect={(node) => {
                handleFileSelect(node)
                if (window.innerWidth < 640) {
                  setIsSidebarOpen(false)
                }
              }}
              isAdmin={isAdmin}
              onAddProject={() => setIsAddProjectModalOpen(true)}
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
            <WorkspaceViewer 
              activeFile={activeFile} 
              fontSize={fontSize}
              isAdmin={isAdmin}
              token={token}
              contentMap={contentMap}
              onContentChange={(path, newContent) => {
                setContentMap(prev => ({ ...prev, [path]: newContent }))
              }}
              isDirty={activeFile ? contentMap[activeFile.path] !== originalContentMap[activeFile.path] : false}
              isSaving={isSaving}
              onSave={triggerSave}
              logs={logs}
              setLogs={setLogs}
            />
          </div>
          <StatusBar logs={logs} isAdmin={isAdmin} />
        </main>
      </div>

      <CommandPalette 
        key={isCommandPaletteOpen ? 'open' : 'closed'}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        onSelectFile={handleFileSelect}
      />

      {/* Secret Password Gate Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm select-none">
          <div className="bg-sidebar border border-border w-full max-w-sm rounded-lg shadow-2xl p-5 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => {
                setIsLoginModalOpen(false)
                setAdminPassword('')
                setLoginError('')
              }}
              className="absolute top-3 right-3 text-muted hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-accent border-b border-border pb-2">
              <Shield className="w-5 h-5" />
              <h3 className="font-mono text-sm font-semibold">Admin Authentication Gate</h3>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase">Access Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  className="w-full bg-code-bg border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:border-accent text-sm"
                />
              </div>

              {loginError && (
                <div className="text-red-500 flex items-center gap-1.5 pt-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false)
                    setAdminPassword('')
                    setLoginError('')
                  }}
                  className="px-3 py-1.5 border border-border hover:bg-code-bg text-muted hover:text-foreground rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded transition-colors font-semibold cursor-pointer"
                >
                  Access Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm select-none">
          <div className="bg-sidebar border border-border w-full max-w-sm rounded-lg shadow-2xl p-5 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => {
                setIsAddProjectModalOpen(false)
                setNewProjectFileName('')
                setNewProjectError('')
              }}
              className="absolute top-3 right-3 text-muted hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-accent border-b border-border pb-2">
              <Shield className="w-5 h-5" />
              <h3 className="font-mono text-sm font-semibold">Add New Project Configuration</h3>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase">JSON File Name</label>
                <input
                  type="text"
                  value={newProjectFileName}
                  onChange={(e) => setNewProjectFileName(e.target.value)}
                  placeholder="e.g. spendshield_v2.1.json"
                  autoFocus
                  className="w-full bg-code-bg border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:border-accent text-sm"
                />
              </div>

              {newProjectError && (
                <div className="text-red-500 flex items-center gap-1.5 pt-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{newProjectError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProjectModalOpen(false)
                    setNewProjectFileName('')
                    setNewProjectError('')
                  }}
                  className="px-3 py-1.5 border border-border hover:bg-code-bg text-muted hover:text-foreground rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded transition-colors font-semibold cursor-pointer"
                >
                  Create File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Landscape Orientation Prompt */}
      {showRotatePrompt && !dismissedPrompt && (
        <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-6 bg-background/95 backdrop-blur-md text-center">
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
