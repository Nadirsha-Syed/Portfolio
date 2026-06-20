"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, Play, Clock, Database, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project, Endpoint } from '@/types'

const projects: Record<string, Project> = {
  'vehicle_rental.json': {
    name: 'Vehicle Rental Aggregator Platform',
    description: 'A full-stack rental management platform that enables users to list, browse, and book rental vehicles efficiently.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT Authentication'],
    architecture: `React Frontend (Glassmorphism) → JWT Auth Middleware → Express.js Engine (Conflict Prevention) → MongoDB Cluster`,
    endpoints: [
      {
        name: 'List Vehicle',
        method: 'POST',
        path: '/api/rentals',
        description: 'Submit a new vehicle profile to list on the aggregation feed (requires owner auth).',
        mockResponse: {
          success: true,
          vehicle_id: 'vh_scorpio_992',
          status: 'listed',
          owner_verified: true
        },
        mockLatency: 120
      },
      {
        name: 'Request Booking',
        method: 'POST',
        path: '/api/bookings',
        description: 'Request a rental vehicle reservation. Triggers concurrent booking conflict checks.',
        mockResponse: {
          booking_id: 'bk_9981a3',
          vehicle_id: 'vh_scorpio_992',
          conflict_checked: 'PASSED',
          status: 'confirmed'
        },
        mockLatency: 250
      }
    ],
    highlights: [
      'JWT Authentication',
      'Role-Based Access Control (RBAC)',
      'Booking Conflict Prevention Logic',
      'Scalable MVC Backend Architecture',
      'Responsive Modern UI featuring Glassmorphism templates'
    ],
    backendFeatures: [
      'Authentication System',
      'Rental Module',
      'Owner-Based Authorization',
      'Booking System',
      'Conflict Prevention Logic',
      'Booking Cancellation System',
      'Role-Based Access Control',
      'Dashboard APIs',
      'Stable API Responses'
    ],
    frontendFeatures: [
      'React + Vite Setup',
      'Dashboard Layout',
      'Multi-Theme System',
      'Glassmorphism UI',
      'Backend Integration',
      'Rental Creation Interface',
      'Booking Flow UI',
      'My Rentals Dashboard',
      'API Error Handling'
    ],
    upcomingFeatures: [
      'Edit/Delete Rental Management',
      'Razorpay Payment Integration',
      'Production Deployment',
      'Performance Optimization',
      'UI/UX Enhancements'
    ]
  },
  'integrity_execution.json': {
    name: 'Integrity & Execution Dashboard',
    description: 'Developed a high-performance personal accountability dashboard designed to eliminate "broken promises" by transforming static goals into an interactive execution framework.',
    techStack: ['MERN Stack', 'Firebase', 'Vercel'],
    liveUrl: 'https://integrity-dash.vercel.app/',
    period: 'Jan 2026 – Feb 2026',
    architecture: `React Frontend (Custom styled-components) → Firestore onSnapshot Live Listeners → Cloud Firestore Rules (Isolated environments)`,
    endpoints: [
      {
        name: 'Submit Goal Progress',
        method: 'POST',
        path: '/api/integrity/score',
        description: 'Submit goal checklist execution states to compute integrity ratio metrics.',
        mockResponse: {
          score_updated: true,
          integrity_ratio: 0.90,
          badge: 'HIGH_EXECUTION_STREAK',
          db_synced: 'firestore_onSnapshot_active'
        },
        mockLatency: 180
      }
    ],
    responsibilities: [
      'Real-Time Data Architecture: Engineered serverless backend using Cloud Firestore, custom security rules for isolated user environments.',
      'Frontend Precision: Built adaptive React UI featuring Glassmorphism design principles.',
      'State Management: Developed complex logic to handle real-time UI updates (checklists, dynamic progress tracking) via Firebase onSnapshot listeners.',
      'Deployment Pipeline: Managed Vercel CI/CD and secure environment variable integration.'
    ],
    results: [
      'Increased Engagement: Achieved 100% reduction in data loss transitioning from local storage to persistent cloud sync.',
      'Optimized Performance: Improved mobile accessibility and alignment precision through custom Flexbox.',
      'Accountability Metric: Introduced "Integrity" scoring system for visual feedback on goal completion rates.'
    ],
    teamwork: [
      'Collaborative Iteration: Actively engaged in design reviews, refining text inputs into advanced interactive checklists.',
      'Technical Documentation: Maintained clean Git version control history with descriptive commits.'
    ]
  }
}

interface TestResult {
  response: unknown
  latency: number
  timestamp: string
}

interface ProjectRendererProps {
  fileName: string
}

export function ProjectRenderer({ fileName }: ProjectRendererProps) {
  const project = projects[fileName]
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'architecture', 'features', 'responsibilities', 'results', 'teamwork', 'highlights'])
  )
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})

  if (!project) {
    return <div className="text-muted font-mono p-4">Project configuration not found</div>
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

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <h1 className="text-2xl font-bold font-mono mb-2">{project.name}</h1>
            <p className="text-muted font-sans leading-relaxed text-sm">{project.description}</p>
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

      <div className="flex flex-wrap gap-2">
        {project.techStack.map(tech => (
          <span
            key={tech}
            className="px-2 py-1 text-xs font-mono bg-code-bg border border-border rounded"
          >
            {tech}
          </span>
        ))}
      </div>

      {project.highlights && (
        <Section
          title="Key Highlights"
          isExpanded={expandedSections.has('highlights')}
          onToggle={() => toggleSection('highlights')}
        >
          <ul className="list-disc pl-5 space-y-1 text-sm font-sans">
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
            {project.backendFeatures && (
              <div>
                <h4 className="font-semibold mb-2 text-accent">Backend Features Completed</h4>
                <ul className="space-y-1">
                  {project.backendFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs">✅</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.frontendFeatures && (
              <div>
                <h4 className="font-semibold mb-2 text-accent">Frontend Features Completed</h4>
                <ul className="space-y-1">
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
          {project.upcomingFeatures && (
            <div className="mt-4 border-t border-border pt-4 text-sm font-sans">
              <h4 className="font-semibold mb-2 text-yellow-500">Upcoming Features</h4>
              <ul className="list-disc pl-5 space-y-1">
                {project.upcomingFeatures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {project.responsibilities && (
        <Section
          title="Key Responsibilities & Contributions"
          isExpanded={expandedSections.has('responsibilities')}
          onToggle={() => toggleSection('responsibilities')}
        >
          <ul className="list-disc pl-5 space-y-2 text-sm font-sans leading-relaxed">
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

      {project.results && (
        <Section
          title="Results & Impact"
          isExpanded={expandedSections.has('results')}
          onToggle={() => toggleSection('results')}
        >
          <ul className="list-disc pl-5 space-y-2 text-sm font-sans leading-relaxed">
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

      {project.teamwork && (
        <Section
          title="Communication & Teamwork"
          isExpanded={expandedSections.has('teamwork')}
          onToggle={() => toggleSection('teamwork')}
        >
          <ul className="list-disc pl-5 space-y-2 text-sm font-sans leading-relaxed">
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

      <Section
        title="Architecture"
        isExpanded={expandedSections.has('architecture')}
        onToggle={() => toggleSection('architecture')}
      >
        <pre className="bg-code-bg p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border">
          {project.architecture}
        </pre>
      </Section>

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
            <pre className="text-xs font-mono overflow-x-auto text-emerald-500 dark:text-emerald-400">
              {JSON.stringify(testResult.response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
