"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, Play, Clock, Database, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project, Endpoint } from '@/types'

interface ProjectRendererProps {
  fileName: string
  projectContent: string
  onUpdateProjectContent: (newContent: string) => void
  isAdmin: boolean
  fontSize?: number
}

interface TestResult {
  response: unknown
  latency: number
  timestamp: string
}

export function ProjectRenderer({ 
  fileName, 
  projectContent, 
  onUpdateProjectContent, 
  isAdmin, 
  fontSize = 14 
}: ProjectRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'architecture', 'features', 'responsibilities', 'results', 'teamwork', 'highlights'])
  )
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})

  // Parse project JSON
  let project: Project
  try {
    project = JSON.parse(projectContent)
  } catch (e) {
    return (
      <div className="text-red-500 font-mono p-4 border border-red-500/20 bg-red-500/5 rounded-lg space-y-2">
        <h4 className="font-bold">JSON Syntax Error</h4>
        <p className="text-xs">Failed to parse project configuration payload. Ensure proper trailing commas and escaping.</p>
        <pre className="text-[10px] bg-black/30 p-2 rounded overflow-x-auto">{String(e)}</pre>
      </div>
    )
  }

  const updateProject = (key: keyof Project, value: any) => {
    const updated = { ...project, [key]: value }
    onUpdateProjectContent(JSON.stringify(updated, null, 2))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const testEndpoint = async (endpoint: Endpoint) => {
    setTestingEndpoint(endpoint.name)
    await new Promise(resolve => setTimeout(resolve, endpoint.mockLatency))
    setTestResults(prev => ({
      ...prev,
      [endpoint.name]: {
        response: endpoint.mockResponse,
        latency: endpoint.mockLatency,
        timestamp: new Date().toISOString()
      }
    }))
    setTestingEndpoint(null)
  }

  const handleAddEndpoint = () => {
    const eps = [...(project.endpoints || [])]
    eps.push({
      name: 'New API Action',
      method: 'GET',
      path: '/api/resource',
      description: 'Fetch new data resources from server.',
      mockResponse: { success: true },
      mockLatency: 100
    })
    updateProject('endpoints', eps)
  }

  if (isAdmin) {
    return (
      <div className="space-y-6 select-text pb-12" style={{ fontSize: `${fontSize}px` }}>
        {/* Core Metadata Panel */}
        <div className="border border-border bg-sidebar/10 rounded-lg p-4 space-y-4">
          <div className="text-[10px] font-mono font-semibold text-muted uppercase tracking-wider border-b border-border pb-1.5">
            Project Workspace Metadata
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-muted uppercase">Project Title</label>
              <input
                type="text"
                value={project.name || ''}
                onChange={(e) => updateProject('name', e.target.value)}
                className="w-full bg-sidebar border border-border rounded px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
                placeholder="Vehicle Rental Aggregator Platform"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted uppercase">Timeline Period</label>
              <input
                type="text"
                value={project.period || ''}
                onChange={(e) => updateProject('period', e.target.value)}
                className="w-full bg-sidebar border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
                placeholder="Jan 2026 – Feb 2026"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted uppercase">Live Deployment URL</label>
            <input
              type="text"
              value={project.liveUrl || ''}
              onChange={(e) => updateProject('liveUrl', e.target.value)}
              className="w-full bg-sidebar border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
              placeholder="https://integrity-dash.vercel.app/"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted uppercase">Brief Description</label>
            <textarea
              value={project.description || ''}
              onChange={(e) => updateProject('description', e.target.value)}
              className="w-full h-16 bg-sidebar border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-accent resize-none"
              placeholder="A full-stack rental management platform..."
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted uppercase">Tech Stack (comma separated)</label>
            <input
              type="text"
              value={project.techStack ? project.techStack.join(', ') : ''}
              onChange={(e) => updateProject('techStack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full bg-sidebar border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-accent font-mono"
              placeholder="React.js, Node.js, Express.js, MongoDB"
            />
          </div>
        </div>

        {/* Dynamic List Components */}
        <EditableList
          title="Key Highlights"
          items={project.highlights || []}
          accentColorClass="text-accent"
          placeholder="e.g. JWT Authentication with secure middleware"
          onChange={(newVal) => updateProject('highlights', newVal)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableList
            title="Backend Features"
            items={project.backendFeatures || []}
            accentColorClass="text-emerald-500"
            placeholder="e.g. Booking conflict validation module"
            onChange={(newVal) => updateProject('backendFeatures', newVal)}
          />
          <EditableList
            title="Frontend Features"
            items={project.frontendFeatures || []}
            accentColorClass="text-blue-400"
            placeholder="e.g. Dynamic state dashboard metrics"
            onChange={(newVal) => updateProject('frontendFeatures', newVal)}
          />
        </div>

        <EditableList
          title="Upcoming Roadmap"
          items={project.upcomingFeatures || []}
          accentColorClass="text-yellow-500"
          placeholder="e.g. Razorpay payment integration gateway"
          onChange={(newVal) => updateProject('upcomingFeatures', newVal)}
        />

        <EditableList
          title="Responsibilities & Contributions"
          items={project.responsibilities || []}
          accentColorClass="text-purple-400"
          placeholder="Role Prefix: Detailed description of task"
          onChange={(newVal) => updateProject('responsibilities', newVal)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableList
            title="Results & Impact"
            items={project.results || []}
            accentColorClass="text-green-500"
            placeholder="Metric Prefix: Achievement"
            onChange={(newVal) => updateProject('results', newVal)}
          />
          <EditableList
            title="Communication & Teamwork"
            items={project.teamwork || []}
            accentColorClass="text-purple-500"
            placeholder="Collaborative Prefix: Execution details"
            onChange={(newVal) => updateProject('teamwork', newVal)}
          />
        </div>

        {/* Architecture String */}
        <div className="border border-border bg-sidebar/5 rounded-lg p-4 space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-1.5 mb-2">
            System Architecture
          </h4>
          <textarea
            value={project.architecture || ''}
            onChange={(e) => updateProject('architecture', e.target.value)}
            className="w-full h-16 bg-sidebar border border-border rounded p-3 text-xs font-mono focus:outline-none focus:border-accent resize-none"
            placeholder="React Frontend → Express Backend API → MongoDB Cluster"
          />
        </div>

        {/* Endpoints Editor */}
        <div className="border border-border bg-sidebar/5 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-border/60 pb-1.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
              API Sandbox Endpoints
            </h4>
            <button
              onClick={handleAddEndpoint}
              className="px-2.5 py-1 text-xs font-mono font-semibold border border-accent bg-accent/5 text-accent hover:bg-accent/15 rounded cursor-pointer"
            >
              + Add API Endpoint
            </button>
          </div>
          <div className="space-y-4">
            {(project.endpoints || []).map((endpoint, idx) => (
              <EditableEndpointCard
                key={idx}
                endpoint={endpoint}
                onUpdate={(newEp) => {
                  const eps = [...(project.endpoints || [])]
                  eps[idx] = newEp
                  updateProject('endpoints', eps)
                }}
                onDelete={() => {
                  const eps = (project.endpoints || []).filter((_, i) => i !== idx)
                  updateProject('endpoints', eps)
                }}
              />
            ))}
            {(project.endpoints || []).length === 0 && (
              <div className="text-xs text-muted font-sans text-center py-4">No endpoints configured. Click "+ Add API Endpoint" to start.</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // STANDARD VISITOR MODE VIEW
  return (
    <div className="space-y-6" style={{ fontSize: `${fontSize}px` }}>
      <div className="border-b border-border pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <h1 className="text-xl sm:text-2xl font-bold font-mono mb-2">{project.name}</h1>
            <p className="text-muted font-sans leading-relaxed text-xs sm:text-sm">{project.description}</p>
          </div>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all shadow-sm hover:shadow-emerald-500/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Demo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        
        {project.period && (
          <div className="mt-3 text-xs font-mono text-muted">
            <span className="text-accent">Timeline:</span> {project.period}
          </div>
        )}
      </div>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.techStack.map(tech => (
            <span
              key={tech}
              className="px-2 py-1 text-xs font-mono bg-code-bg border border-border rounded text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.highlights && project.highlights.length > 0 && (
        <Section
          title="Key Highlights"
          isExpanded={expandedSections.has('highlights')}
          onToggle={() => toggleSection('highlights')}
        >
          <ul className="list-disc pl-5 space-y-1 text-sm font-sans text-muted">
            {project.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </Section>
      )}

      {(project.backendFeatures || project.frontendFeatures) && (
        <Section
          title="Completed Features"
          isExpanded={expandedSections.has('features')}
          onToggle={() => toggleSection('features')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans">
            {project.backendFeatures && project.backendFeatures.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-accent">Backend Features Completed</h4>
                <ul className="space-y-1 text-muted">
                  {project.backendFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs">✅</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.frontendFeatures && project.frontendFeatures.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-accent">Frontend Features Completed</h4>
                <ul className="space-y-1 text-muted">
                  {project.frontendFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs">✅</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {project.upcomingFeatures && project.upcomingFeatures.length > 0 && (
            <div className="mt-4 border-t border-border pt-4 text-sm font-sans">
              <h4 className="font-semibold mb-2 text-yellow-500">Upcoming Features</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted">
                {project.upcomingFeatures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {project.responsibilities && project.responsibilities.length > 0 && (
        <Section
          title="Key Responsibilities & Contributions"
          isExpanded={expandedSections.has('responsibilities')}
          onToggle={() => toggleSection('responsibilities')}
        >
          <ul className="list-disc pl-5 space-y-2 text-sm font-sans leading-relaxed text-muted">
            {project.responsibilities.map((r, i) => {
              const parts = r.split(': ');
              return (
                <li key={i}>
                  <strong className="text-accent">{parts[0]}</strong>
                  {parts[1] ? `: ${parts[1]}` : ''}
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {project.results && project.results.length > 0 && (
        <Section
          title="Results & Impact"
          isExpanded={expandedSections.has('results')}
          onToggle={() => toggleSection('results')}
        >
          <ul className="list-disc pl-5 space-y-2 text-sm font-sans leading-relaxed text-muted">
            {project.results.map((r, i) => {
              const parts = r.split(': ');
              return (
                <li key={i}>
                  <strong className="text-green-500">{parts[0]}</strong>
                  {parts[1] ? `: ${parts[1]}` : ''}
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {project.teamwork && project.teamwork.length > 0 && (
        <Section
          title="Communication & Teamwork"
          isExpanded={expandedSections.has('teamwork')}
          onToggle={() => toggleSection('teamwork')}
        >
          <ul className="list-disc pl-5 space-y-2 text-sm font-sans leading-relaxed text-muted">
            {project.teamwork.map((t, i) => {
              const parts = t.split(': ');
              return (
                <li key={i}>
                  <strong className="text-purple-500">{parts[0]}</strong>
                  {parts[1] ? `: ${parts[1]}` : ''}
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {project.architecture && (
        <Section
          title="Architecture"
          isExpanded={expandedSections.has('architecture')}
          onToggle={() => toggleSection('architecture')}
        >
          <pre className="bg-code-bg p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border text-foreground leading-relaxed select-text">
            {project.architecture}
          </pre>
        </Section>
      )}

      {project.endpoints && project.endpoints.length > 0 && (
        <Section
          title="API Endpoints & Sandbox Simulator"
          isExpanded={expandedSections.has('endpoints')}
          onToggle={() => toggleSection('endpoints')}
        >
          <div className="space-y-4">
            {project.endpoints.map((endpoint, idx) => (
              <EndpointCard
                key={idx}
                endpoint={endpoint}
                isTesting={testingEndpoint === endpoint.name}
                testResult={testResults[endpoint.name]}
                onTest={() => testEndpoint(endpoint)}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

interface SectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ title, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-sidebar hover:bg-sidebar-border/50 transition-colors font-mono text-sm"
      >
        <span className="font-semibold text-foreground">{title}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted" />
        )}
      </button>
      {isExpanded && <div className="p-4 bg-background border-t border-border">{children}</div>}
    </div>
  )
}

interface EndpointCardProps {
  endpoint: Endpoint
  isTesting: boolean
  testResult: TestResult | undefined
  onTest: () => void
}

function EndpointCard({ endpoint, isTesting, testResult, onTest }: EndpointCardProps) {
  const methodColors = {
    GET: 'bg-green-500/10 text-green-500 border-green-500/30',
    POST: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    PUT: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    DELETE: 'bg-red-500/10 text-red-500 border-red-500/30'
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-code-bg/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "px-2 py-0.5 text-xs font-mono font-semibold border rounded",
              methodColors[endpoint.method]
            )}>
              {endpoint.method}
            </span>
            <code className="text-sm font-mono text-accent">{endpoint.path}</code>
          </div>
          <p className="text-sm text-muted font-sans">{endpoint.description}</p>
        </div>
        <button
          onClick={onTest}
          disabled={isTesting}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border transition-colors font-mono",
            isTesting
              ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
              : "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 cursor-pointer"
          )}
        >
          {isTesting ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Test
            </>
          )}
        </button>
      </div>

      {testResult && (
        <div className="mt-4 space-y-2 border-t border-border/40 pt-3">
          <div className="flex items-center gap-4 text-xs font-mono text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Latency: {testResult.latency}ms
            </span>
            <span>
              Timestamp: {new Date(testResult.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="bg-code-bg rounded border border-border/60 p-3">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted">
              <Database className="w-3.5 h-3.5 text-accent" />
              Gateway Response Payload:
            </div>
            <pre className="text-xs font-mono overflow-x-auto text-emerald-500 dark:text-emerald-400 select-all">
              {JSON.stringify(testResult.response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

interface EditableListProps {
  title: string
  items: string[]
  accentColorClass?: string
  placeholder?: string
  onChange: (newItems: string[]) => void
}

function EditableList({ title, items, accentColorClass = 'text-accent', placeholder = 'Enter item text...', onChange }: EditableListProps) {
  const handleItemChange = (idx: number, val: string) => {
    const copy = [...items]
    copy[idx] = val
    onChange(copy)
  }

  const handleDelete = (idx: number) => {
    const copy = items.filter((_, i) => i !== idx)
    onChange(copy)
  }

  const handleAdd = () => {
    onChange([...items, ''])
  }

  return (
    <div className="space-y-2 border border-border bg-sidebar/5 rounded-lg p-4">
      <div className="flex justify-between items-center border-b border-border/60 pb-1.5 mb-3">
        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${accentColorClass}`}>{title}</h4>
        <button
          onClick={handleAdd}
          className="px-2 py-0.5 text-[10px] font-mono border border-border hover:bg-code-bg rounded text-muted hover:text-foreground cursor-pointer"
        >
          + Add Item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <span className="text-xs text-muted font-mono">{idx + 1}.</span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-code-bg border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            />
            <button
              onClick={() => handleDelete(idx)}
              className="p-1.5 text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded cursor-pointer text-xs"
            >
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-xs text-muted font-sans text-center py-2">No items listed. Click Add Item to begin.</div>
        )}
      </div>
    </div>
  )
}

function EditableEndpointCard({ 
  endpoint, 
  onUpdate, 
  onDelete 
}: { 
  endpoint: Endpoint; 
  onUpdate: (ep: Endpoint) => void; 
  onDelete: () => void 
}) {
  const [responseString, setResponseString] = useState(JSON.stringify(endpoint.mockResponse, null, 2))
  const [jsonError, setJsonError] = useState(false)

  const handleResponseChange = (val: string) => {
    setResponseString(val)
    try {
      const parsed = JSON.parse(val)
      setJsonError(false)
      onUpdate({ ...endpoint, mockResponse: parsed })
    } catch {
      setJsonError(true)
    }
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-code-bg/30 relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-xs font-mono text-red-500 hover:text-red-400 cursor-pointer border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-2 py-0.5 rounded"
      >
        Delete Endpoint
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-mono text-muted uppercase">Method</label>
          <select
            value={endpoint.method}
            onChange={(e) => onUpdate({ ...endpoint, method: e.target.value as any })}
            className="w-full bg-sidebar border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
          >
            {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-mono text-muted uppercase">Endpoint Path</label>
          <input
            type="text"
            value={endpoint.path}
            onChange={(e) => onUpdate({ ...endpoint, path: e.target.value })}
            className="w-full bg-sidebar border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono text-muted uppercase">Name</label>
          <input
            type="text"
            value={endpoint.name}
            onChange={(e) => onUpdate({ ...endpoint, name: e.target.value })}
            className="w-full bg-sidebar border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted uppercase">Latency (ms)</label>
          <input
            type="number"
            value={endpoint.mockLatency}
            onChange={(e) => onUpdate({ ...endpoint, mockLatency: parseInt(e.target.value) || 0 })}
            className="w-full bg-sidebar border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono text-muted uppercase">Description</label>
        <input
          type="text"
          value={endpoint.description}
          onChange={(e) => onUpdate({ ...endpoint, description: e.target.value })}
          className="w-full bg-sidebar border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-muted uppercase flex justify-between">
          <span>Mock Response Payload (JSON)</span>
          {jsonError && <span className="text-red-500 lowercase">Invalid JSON</span>}
        </label>
        <textarea
          value={responseString}
          onChange={(e) => handleResponseChange(e.target.value)}
          className="w-full h-24 bg-sidebar border border-border rounded p-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent resize-none"
        />
      </div>
    </div>
  )
}
