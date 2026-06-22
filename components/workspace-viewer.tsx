"use client"

import { useState, useEffect } from 'react'
import { FileText, Code, Mail, User, Phone, Copy, Check, ExternalLink, Save, Upload, Download, AlertCircle } from 'lucide-react'
import { FileNode, LogEntry } from '@/types'
import ReactMarkdown from 'react-markdown'
import { ProjectRenderer } from './project-renderer'

interface EnvVarRowProps {
  envKey: string
  envVal: string
  isLink: boolean
  href: string
  icon: React.ReactNode
  isAdmin: boolean
  onKeyChange?: (newKey: string) => void
  onValChange?: (newVal: string) => void
  onDelete?: () => void
}

function EnvVarRow({ 
  envKey, 
  envVal, 
  isLink, 
  href, 
  icon, 
  isAdmin,
  onKeyChange,
  onValChange,
  onDelete
}: EnvVarRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(envVal)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="border border-border bg-sidebar/20 hover:bg-sidebar/40 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Key Box */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-semibold text-muted uppercase tracking-wider">Key</span>
          {isAdmin ? (
            <input
              type="text"
              value={envKey}
              onChange={(e) => onKeyChange?.(e.target.value)}
              className="font-mono text-xs px-3 py-2 bg-sidebar border border-border rounded-md text-accent font-semibold focus:outline-none focus:border-accent w-full"
            />
          ) : (
            <div className="font-mono text-xs px-3 py-2 bg-sidebar border border-border rounded-md text-accent font-semibold truncate select-all">
              {envKey}
            </div>
          )}
        </div>
        
        {/* Value Box */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-semibold text-muted uppercase tracking-wider">Value</span>
          {isAdmin ? (
            <input
              type="text"
              value={envVal}
              onChange={(e) => onValChange?.(e.target.value)}
              className="font-mono text-xs px-3 py-2 bg-code-bg border border-border rounded-md text-foreground focus:outline-none focus:border-accent w-full"
            />
          ) : (
            <div className="font-mono text-xs px-3 py-2 bg-code-bg border border-border rounded-md text-foreground truncate select-all flex items-center justify-between gap-2">
              <span className="truncate">{envVal}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center sm:pt-4">
        {!isAdmin && (
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-code-bg border border-border rounded-md text-muted hover:text-foreground transition-all cursor-pointer flex items-center justify-center"
            title="Copy Value"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
        {isLink && !isAdmin && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-code-bg border border-border rounded-md text-muted hover:text-foreground transition-all flex items-center justify-center cursor-pointer"
            title="Open Link"
          >
            {icon}
          </a>
        )}
        {isAdmin && (
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-md transition-all cursor-pointer flex items-center justify-center"
            title="Delete Variable"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

interface WorkspaceViewerProps {
  activeFile: FileNode | null
  fontSize?: number
  isAdmin: boolean
  token: string | null
  contentMap: Record<string, string>
  onContentChange: (path: string, newContent: string) => void
  isDirty: boolean
  isSaving: boolean
  onSave: () => void
  logs: LogEntry[]
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
}

interface EnvLine {
  type: 'comment' | 'empty' | 'var'
  key: string
  val: string
  raw: string
}

export function WorkspaceViewer({ 
  activeFile, 
  fontSize = 14,
  isAdmin,
  token,
  contentMap,
  onContentChange,
  isDirty,
  isSaving,
  onSave,
  logs,
  setLogs
}: WorkspaceViewerProps) {
  const [mdViewMode, setMdViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadError, setUploadError] = useState('')

  // Adjust markdown view mode automatically for responsive screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMdViewMode('edit')
      } else {
        setMdViewMode('split')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-mono text-sm">Select a file to view</p>
        </div>
      </div>
    )
  }

  const getIcon = () => {
    if (activeFile.extension === 'md') return <FileText className="w-4 h-4 text-blue-500" />
    if (activeFile.extension === 'json') return <Code className="w-4 h-4 text-amber-500" />
    if (activeFile.extension === 'env') return <Mail className="w-4 h-4 text-emerald-500" />
    if (activeFile.extension === 'tsx') return <User className="w-4 h-4 text-purple-500" />
    return <FileText className="w-4 h-4" />
  }

  const fileContent = contentMap[activeFile.path] || ''

  // Parse .env file string into helper array
  const parseEnvContent = (content: string): EnvLine[] => {
    return content.split('\n').map(line => {
      const trimmed = line.trim()
      if (!trimmed) {
        return { type: 'empty', key: '', val: '', raw: line }
      }
      if (trimmed.startsWith('#')) {
        return { type: 'comment', key: '', val: '', raw: line }
      }
      const parts = line.split('=')
      const key = parts[0]?.trim() || ''
      const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '')
      return { type: 'var', key, val, raw: line }
    })
  }

  const serializeEnvLines = (lines: EnvLine[]): string => {
    return lines.map(line => {
      if (line.type === 'var') {
        return `${line.key}="${line.val}"`
      }
      return line.raw
    }).join('\n')
  }

  const handleEnvKeyChange = (index: number, newKey: string) => {
    const lines = parseEnvContent(fileContent)
    if (lines[index]) {
      lines[index] = { ...lines[index], key: newKey.replace(/\s+/g, '') }
      onContentChange(activeFile.path, serializeEnvLines(lines))
    }
  }

  const handleEnvValChange = (index: number, newVal: string) => {
    const lines = parseEnvContent(fileContent)
    if (lines[index]) {
      lines[index] = { ...lines[index], val: newVal }
      onContentChange(activeFile.path, serializeEnvLines(lines))
    }
  }

  const handleEnvDelete = (index: number) => {
    const lines = parseEnvContent(fileContent)
    lines.splice(index, 1)
    onContentChange(activeFile.path, serializeEnvLines(lines))
  }

  const handleEnvAdd = () => {
    const lines = parseEnvContent(fileContent)
    lines.push({
      type: 'var',
      key: 'NEW_VARIABLE',
      val: 'value',
      raw: ''
    })
    onContentChange(activeFile.path, serializeEnvLines(lines))
  }

  // File Upload Handlers (Resume.pdf)
  const handlePdfUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF documents are allowed.')
      setUploadStatus('error')
      return
    }

    setUploadStatus('uploading')
    setUploadError('')
    
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [...prev, { timestamp: time, message: `Uploading resume.pdf...`, type: 'info' }])

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      const json = await res.json()
      if (json.success) {
        setUploadStatus('success')
        setLogs(prev => [...prev, { timestamp: time, message: `[uploader] resume.pdf uploaded successfully (overwritten).`, type: 'success' }])
        setTimeout(() => setUploadStatus('idle'), 4000)
      } else {
        setUploadError(json.error || 'Upload failed')
        setUploadStatus('error')
        setLogs(prev => [...prev, { timestamp: time, message: `[uploader] resume upload failed: ${json.error}`, type: 'error' }])
      }
    } catch (err) {
      setUploadError('Network error uploading file')
      setUploadStatus('error')
      setLogs(prev => [...prev, { timestamp: time, message: `[uploader] resume upload network error`, type: 'error' }])
    }
  }

  const renderContent = () => {
    // 1. Projects JSON Editor
    if (activeFile.extension === 'json' && activeFile.path.includes('projects')) {
      return (
        <ProjectRenderer 
          fileName={activeFile.name} 
          projectContent={fileContent}
          onUpdateProjectContent={(newContent) => onContentChange(activeFile.path, newContent)}
          isAdmin={isAdmin}
          fontSize={fontSize}
        />
      )
    }

    // 2. Markdown Raw/Split Editor
    if (activeFile.extension === 'md') {
      if (!isAdmin) {
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none font-sans markdown-body">
            <ReactMarkdown>{fileContent}</ReactMarkdown>
          </div>
        )
      }

      return (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Editor Mode Toggles (Visible on Mobile to save space) */}
          <div className="flex md:hidden items-center gap-1 border-b border-border bg-sidebar/50 p-1.5 mb-3 rounded">
            <button
              onClick={() => setMdViewMode('edit')}
              className={`px-3 py-1 text-xs font-mono rounded ${mdViewMode === 'edit' ? 'bg-code-bg text-accent font-semibold border border-border' : 'text-muted'}`}
            >
              Editor
            </button>
            <button
              onClick={() => setMdViewMode('preview')}
              className={`px-3 py-1 text-xs font-mono rounded ${mdViewMode === 'preview' ? 'bg-code-bg text-accent font-semibold border border-border' : 'text-muted'}`}
            >
              Preview
            </button>
          </div>

          <div className="flex-1 flex gap-4 min-h-0">
            {/* RAW TEXTAREA */}
            {(mdViewMode === 'split' || mdViewMode === 'edit') && (
              <div className="flex-1 flex flex-col min-w-0 h-full border border-border rounded-lg bg-code-bg overflow-hidden">
                <div className="px-3 py-1 text-[10px] font-mono font-semibold border-b border-border bg-sidebar text-muted tracking-wider uppercase">
                  Raw Markdown Source
                </div>
                <textarea
                  value={fileContent}
                  onChange={(e) => onContentChange(activeFile.path, e.target.value)}
                  className="flex-1 p-4 font-mono text-xs text-foreground bg-transparent focus:outline-none resize-none overflow-y-auto leading-relaxed"
                  placeholder="Enter markdown..."
                />
              </div>
            )}

            {/* PREVIEW */}
            {(mdViewMode === 'split' || mdViewMode === 'preview') && (
              <div className="flex-1 flex flex-col min-w-0 h-full border border-border rounded-lg bg-sidebar/20 overflow-hidden">
                <div className="px-3 py-1 text-[10px] font-mono font-semibold border-b border-border bg-sidebar text-muted tracking-wider uppercase">
                  Real-time Rendered Layout
                </div>
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto prose prose-sm dark:prose-invert max-w-none font-sans markdown-body">
                  <ReactMarkdown>{fileContent}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    // 3. Env Variables Editor
    if (activeFile.extension === 'env') {
      const parsed = parseEnvContent(fileContent)
      return (
        <div className="space-y-6 max-w-3xl">
          <div className="border-b border-border pb-4 flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Environment Variables
              </h1>
              <p className="text-xs text-muted font-sans mt-1">
                Configure and check values loaded into your development sandbox. Click the copy icon to copy values, or the link icon to redirect.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={handleEnvAdd}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded border border-accent bg-accent/10 text-accent hover:bg-accent/25 transition-all cursor-pointer"
              >
                + Add Variable
              </button>
            )}
          </div>
          <div className="space-y-3">
            {parsed.map((line, i) => {
              if (line.type !== 'var') return null

              let isLink = false
              let href = ''
              let icon = null

              if (line.key === 'GITHUB') {
                isLink = true
                href = line.val
                icon = (
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-400 hover:text-foreground transition-colors">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                )
              } else if (line.key === 'LINKEDIN') {
                isLink = true
                href = line.val.startsWith('http') ? line.val : `https://${line.val}`
                icon = (
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-400 hover:text-accent transition-colors">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                )
              } else if (line.key === 'SENDER_CONTACT_EMAIL') {
                isLink = true
                href = `mailto:${line.val}`
                icon = <Mail className="w-4 h-4 text-emerald-400 hover:text-emerald-300 transition-colors" />
              } else if (line.key === 'SENDER_PHONE') {
                isLink = true
                href = `tel:${line.val}`
                icon = <Phone className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
              }

              return (
                <EnvVarRow
                  key={i}
                  envKey={line.key}
                  envVal={line.val}
                  isLink={isLink}
                  href={href}
                  icon={icon}
                  isAdmin={isAdmin}
                  onKeyChange={(newKey) => handleEnvKeyChange(i, newKey)}
                  onValChange={(newVal) => handleEnvValChange(i, newVal)}
                  onDelete={() => handleEnvDelete(i)}
                />
              )
            })}
          </div>
        </div>
      )
    }

    // 4. TSX Education & Leadership Panel
    if (activeFile.path === 'education_&_leadership.tsx') {
      return (
        <div className="relative border-l border-border pl-4 sm:pl-6 ml-2 sm:ml-4 space-y-8 my-4">
          {/* Education Node */}
          <div className="relative">
            <div className="absolute -left-[25px] sm:-left-[33px] top-1.5 w-4 h-4 rounded-full border border-accent bg-background flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted">
                <span className="text-accent font-semibold">EDUCATION</span>
                <span>•</span>
                <span>2024 - 2028 (Expected)</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-mono">B.Tech – Computer Science Engineering (Data Science)</h3>
              <h4 className="text-xs sm:text-sm font-semibold font-mono text-muted-foreground">SR University, Warangal</h4>
              
              <p className="text-sm text-muted font-sans mt-2">
                Acquiring core engineering skills in data-centric systems and artificial intelligence. Practicing algorithm design in Java.
              </p>

              <div className="pt-2">
                <span className="text-xs font-mono text-muted-foreground block mb-2 font-bold uppercase tracking-wider">Relevant Coursework:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Data Structures & Algorithms",
                    "Database Management Systems (DBMS)",
                    "Operating Systems",
                    "Cloud Computing",
                    "Machine Learning",
                    "Natural Language Processing"
                  ].map(course => (
                    <span key={course} className="px-2 py-0.5 text-xs font-mono bg-code-bg border border-border rounded">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leadership Node */}
          <div className="relative">
            <div className="absolute -left-[25px] sm:-left-[33px] top-1.5 w-4 h-4 rounded-full border border-purple-500 bg-background flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted">
                <span className="text-purple-500 font-semibold">LEADERSHIP &amp; RESPONSIBILITY</span>
                <span>•</span>
                <span>Active</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-mono">Vice Chair – Data Science Club</h3>
              <h4 className="text-xs sm:text-sm font-semibold font-mono text-muted-foreground">Strategic Coordination</h4>
              
              <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm font-sans text-muted">
                <li><strong>Strategic Coordination:</strong> Supported planning and coordination of data science activities.</li>
                <li><strong>Peer Mentorship:</strong> Assisted peers in understanding analytics and visualization concepts.</li>
                <li><strong>Practical Ingestion:</strong> Encouraged practical learning through datasets and mini projects.</li>
                <li><strong>Ethical Governance:</strong> Promoted ethical and responsible use of AI tools within the club.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    // 5. Stylized PDF Resume Viewer & Cloud Overwrite Zone
    if (activeFile.extension === 'pdf') {
      return (
        <div className="space-y-6 max-w-4xl">
          <div className="border-b border-border pb-4 flex justify-between items-center gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Downloadable Resume File
              </h1>
              <p className="text-xs text-muted font-sans mt-1">
                Access a print-friendly document version of Syed Nadirsha's CV.
              </p>
            </div>
            <a
              href="/resume.pdf"
              download="Syed_Nadirsha_Resume.pdf"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all shadow-sm hover:shadow-blue-500/10 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          </div>

          {/* Drag & Drop Upload Zone for admin */}
          {isAdmin && (
            <div 
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handlePdfUpload(e.dataTransfer.files[0])
                }
              }}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragOver 
                  ? 'border-accent bg-accent/5' 
                  : uploadStatus === 'success' 
                  ? 'border-green-500 bg-green-500/5' 
                  : uploadStatus === 'error' 
                  ? 'border-red-500 bg-red-500/5' 
                  : 'border-border bg-sidebar/20'
              }`}
            >
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePdfUpload(e.target.files[0])
                  }
                }}
              />
              <label 
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className={`w-8 h-8 ${isDragOver ? 'text-accent animate-bounce' : 'text-muted'}`} />
                <span className="text-xs font-mono font-semibold">
                  {uploadStatus === 'uploading' ? (
                    <span className="text-accent animate-pulse">Uploading new resume...</span>
                  ) : uploadStatus === 'success' ? (
                    <span className="text-green-500">✓ Upload complete (resume.pdf updated)</span>
                  ) : uploadStatus === 'error' ? (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {uploadError || 'Error uploading file'}
                    </span>
                  ) : (
                    <span>Drag and drop a new PDF here, or <span className="text-accent hover:underline">browse files</span></span>
                  )}
                </span>
                <span className="text-[10px] text-muted font-sans">
                  This will instantly overwrite the public download target (/public/resume.pdf)
                </span>
              </label>
            </div>
          )}

          {/* Stylized CV Layout for presentation */}
          <div className="border border-border rounded-lg bg-sidebar/5 p-6 sm:p-8 font-sans text-foreground shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-border/80 pb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Syed Nadirsha</h2>
                <p className="text-sm text-accent font-semibold font-mono mt-1">Systems-focused Full Stack Developer</p>
                <p className="text-xs text-muted mt-2">Warangal, Telangana, India</p>
              </div>
              <div className="text-xs space-y-1 sm:text-right text-muted font-mono">
                <div>nadirshasyed835@gmail.com</div>
                <div>+91 7780605704</div>
                <div className="text-accent hover:underline cursor-pointer">github.com/Nadirsha-Syed</div>
                <div className="text-accent hover:underline cursor-pointer">linkedin.com/in/nadirsha-syed</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-sm">
              <div className="md:col-span-1 space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-1.5 mb-2">Education</h3>
                  <div className="space-y-1">
                    <div className="font-bold">B.Tech in CSE (Data Science)</div>
                    <div className="text-xs text-muted-foreground">SR University, Warangal</div>
                    <div className="text-xs font-mono text-muted">2024 - 2028 (Expected)</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-1.5 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["React.js", "Node.js", "Express.js", "MongoDB", "Java", "DSA", "System Design", "Firebase", "Git", "Next.js"].map(s => (
                      <span key={s} className="px-1.5 py-0.5 text-[10px] font-mono bg-code-bg border border-border rounded text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-1.5 mb-3">Projects</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="font-bold">Vehicle Rental Aggregator Platform</span>
                        <span className="text-xs font-mono text-muted">Full-Stack</span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        A full-stack booking conflict prevention platform utilizing React, Node.js, and MongoDB. Structured around RBAC.
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="font-bold">Integrity & Execution Dashboard</span>
                        <span className="text-xs font-mono text-muted">MERN & Firebase</span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        Developed a personal accountability scoring engine with Cloud Firestore realtime sync, lowering goal tracking friction.
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="font-bold">CrudDash – RESTful CRUD Application</span>
                        <span className="text-xs font-mono text-muted">Node.js & Express</span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        Built a RESTful blog CRUD platform using EJS server-side rendering, UUID, and Method Override. Deployed on Render.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-1.5 mb-3">Leadership</h3>
                  <div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-bold">Vice Chair – Data Science Club</span>
                      <span className="text-xs font-mono text-muted">SR University</span>
                    </div>
                    <ul className="list-disc pl-4 mt-1.5 text-xs text-muted space-y-1">
                      <li>Led strategic planning and peer mentoring sessions on datasets.</li>
                      <li>Promoted ethical guidelines and practical ingestion setups within the student community.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Default Fallback
    return (
      <div className="font-mono text-xs">
        <pre className="bg-code-bg p-4 rounded-lg overflow-x-auto border border-border/60 leading-relaxed text-foreground select-text">
          <code>{fileContent}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-sidebar">
        <div className="flex items-center gap-2 min-w-0">
          {getIcon()}
          <span className="font-mono text-sm text-muted truncate">{activeFile.name}</span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" title="Unsaved changes" />
          )}
        </div>
        {isAdmin && activeFile.extension !== 'pdf' && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <span className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save File'}</span>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ fontSize: `${fontSize}px` }}>
        {renderContent()}
      </div>
    </div>
  )
}
