"use client"

import { useState } from 'react'
import { FileText, Code, Mail, User, Phone, Copy, Check, ExternalLink } from 'lucide-react'
import { FileNode } from '@/types'
import ReactMarkdown from 'react-markdown'
import { ProjectRenderer } from './project-renderer'

interface EnvVarRowProps {
  envKey: string
  envVal: string
  isLink: boolean
  href: string
  icon: React.ReactNode
}

function EnvVarRow({ envKey, envVal, isLink, href, icon }: EnvVarRowProps) {
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
          <div className="font-mono text-xs px-3 py-2 bg-sidebar border border-border rounded-md text-accent font-semibold truncate select-all">
            {envKey}
          </div>
        </div>
        
        {/* Value Box */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono font-semibold text-muted uppercase tracking-wider">Value</span>
          <div className="font-mono text-xs px-3 py-2 bg-code-bg border border-border rounded-md text-foreground truncate select-all flex items-center justify-between gap-2">
            <span className="truncate">{envVal}</span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center sm:pt-4">
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
        {isLink && (
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
      </div>
    </div>
  )
}

interface WorkspaceViewerProps {
  activeFile: FileNode | null
}

export function WorkspaceViewer({ activeFile }: WorkspaceViewerProps) {
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
    if (activeFile.extension === 'md') return <FileText className="w-4 h-4" />
    if (activeFile.extension === 'json') return <Code className="w-4 h-4" />
    if (activeFile.extension === 'env') return <Mail className="w-4 h-4" />
    if (activeFile.extension === 'tsx') return <User className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const renderContent = () => {
    if (activeFile.extension === 'json' && activeFile.path.includes('projects')) {
      return <ProjectRenderer fileName={activeFile.name} />
    }

    if (activeFile.extension === 'md') {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none font-sans markdown-body">
          <ReactMarkdown>{getFileContent(activeFile.path)}</ReactMarkdown>
        </div>
      )
    }

    if (activeFile.extension === 'env') {
      return (
        <div className="space-y-6 max-w-3xl">
          <div className="border-b border-border pb-4">
            <h1 className="text-xl font-bold font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Environment Variables
            </h1>
            <p className="text-xs text-muted font-sans mt-1">
              Configure and check values loaded into your development sandbox. Click the copy icon to copy values, or the link icon to redirect.
            </p>
          </div>
          <div className="space-y-3">
            {getFileContent(activeFile.path).split('\n').map((line, i) => {
              const trimmed = line.trim()
              if (!trimmed || trimmed.startsWith('#')) {
                return null
              }
              const parts = line.split('=')
              const key = parts[0]?.trim()
              const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '')

              let isLink = false
              let href = ''
              let icon = null

              if (key === 'GITHUB') {
                isLink = true
                href = val
                icon = (
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-400 hover:text-foreground transition-colors">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                )
              } else if (key === 'LINKEDIN') {
                isLink = true
                href = val.startsWith('http') ? val : `https://${val}`
                icon = (
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-400 hover:text-accent transition-colors">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                )
              } else if (key === 'SENDER_CONTACT_EMAIL') {
                isLink = true
                href = `mailto:${val}`
                icon = <Mail className="w-4 h-4 text-emerald-400 hover:text-emerald-300 transition-colors" />
              } else if (key === 'SENDER_PHONE') {
                isLink = true
                href = `tel:${val}`
                icon = <Phone className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
              }

              return (
                <EnvVarRow
                  key={i}
                  envKey={key}
                  envVal={val}
                  isLink={isLink}
                  href={href}
                  icon={icon}
                />
              )
            })}
          </div>
        </div>
      )
    }

    if (activeFile.path === 'education_&_leadership.tsx') {
      return (
        <div className="relative border-l border-border pl-6 ml-4 space-y-8 my-4">
          {/* Education Node */}
          <div className="relative">
            <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border border-accent bg-background flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted">
                <span className="text-accent font-semibold">EDUCATION</span>
                <span>•</span>
                <span>2024 - 2028 (Expected)</span>
              </div>
              <h3 className="text-lg font-bold font-mono">B.Tech – Computer Science Engineering (Data Science)</h3>
              <h4 className="text-sm font-semibold font-mono text-muted-foreground">SR University, Warangal</h4>
              
              <p className="text-sm text-muted font-sans mt-2">
                Acquiring core engineering skills in data-centric systems and artificial intelligence. Practicing algorithm design in Java.
              </p>

              <div className="pt-2">
                <span className="text-xs font-mono text-muted-foreground block mb-2 font-semibold font-bold">RELEVANT COURSEWORK:</span>
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
            <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border border-purple-500 bg-background flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted">
                <span className="text-purple-500 font-semibold">LEADERSHIP &amp; RESPONSIBILITY</span>
                <span>•</span>
                <span>Active</span>
              </div>
              <h3 className="text-lg font-bold font-mono">Vice Chair – Data Science Club</h3>
              <h4 className="text-sm font-semibold font-mono text-muted-foreground">Strategic Coordination</h4>
              
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

    return (
      <div className="font-mono text-sm">
        <pre className="bg-code-bg p-4 rounded-lg overflow-x-auto">
          <code>{getFileContent(activeFile.path)}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-sidebar">
        {getIcon()}
        <span className="font-mono text-sm text-muted">{activeFile.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  )
}

function getFileContent(path: string): string {
  const contentMap: Record<string, string> = {
    'home.md': `# Syed Nadirsha

## About Me

I am a B.Tech Computer Science Engineering (Data Science) student at SR University, Warangal, passionate about Full Stack Development, Problem Solving, and building real-world software products. I enjoy developing scalable web applications using the MERN stack and continuously improving my Data Structures & Algorithms skills in Java.

My goal is to secure opportunities at top technology companies by combining strong software development skills with practical project experience.

---

## Technical Skills

- **Languages**: Java, JavaScript, Python, SQL
- **Frontend**: HTML5, CSS3, React.js
- **Backend**: Node.js, Express.js, REST APIs, MVC Architecture
- **Databases**: MongoDB, Firebase / Cloud Firestore
- **Cloud & Tools**: AWS Basics, Git, GitHub, Postman, VS Code, Vercel

---

# Upcoming Projects

- **Integrity & Execution Dashboard v2.0**: Enhanced accountability triggers.
- **SmartBachat App Integration**: Adding AI recommendation services.
- \`---will add soon---\`

---

# Ideas & Future Products

- **Smart Bachat App**: AI-powered household budget advisor for Indian families.
- **Jan Seva AI**: Voice-powered civic complaint redressal platform using AI and NLP.
- **Aushadhi Sahayak**: Medicine availability finder with real-time pharmacy stock information.
- **Kisaan AI Advisor**: Regional-language AI assistant for farmers.
- **Nari Suraksha App**: AI-powered women safety platform.
- **EduBridge**: Tutor-student matching platform for Tier-2 and Tier-3 cities.
- **SmartMandir**: Temple booking and livestream platform.`,

    'education_&_leadership.tsx': `interface LeadershipNode {
  role: string;
  organization: string;
  contributions: string[];
}

const education = {
  institution: "SR University, Warangal",
  degree: "B.Tech – Computer Science Engineering (Data Science)",
  period: "2024 - 2028 (Expected)",
  relevantCoursework: [
    "Data Structures & Algorithms",
    "Database Management Systems (DBMS)",
    "Operating Systems",
    "Cloud Computing",
    "Machine Learning",
    "Natural Language Processing"
  ]
};

const leadershipAndResponsibility: LeadershipNode[] = [
  {
    role: "Vice Chair",
    organization: "Data Science Club",
    contributions: [
      "Strategic Coordination: Supported planning and coordination of data science activities.",
      "Peer Mentorship: Assisted peers in understanding analytics and visualization concepts.",
      "Practical Ingestion: Encouraged practical learning through datasets and mini projects.",
      "Ethical Governance: Promoted ethical and responsible use of AI tools within the club."
    ]
  }
];

export default { education, leadershipAndResponsibility };`,

    'contact.env': `SENDER_IDENTITY_NAME="Syed Nadirsha"
SENDER_CONTACT_EMAIL="nadirshasyed835@gmail.com"
SENDER_PHONE="7780605704"
GITHUB="https://github.com/Nadirsha-Syed"
LINKEDIN="www.linkedin.com/in/nadirsha-syed"`
  }

  return contentMap[path] || '// File content not available'
}
