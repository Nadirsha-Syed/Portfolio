"use client"

import { useState, useEffect, useRef } from 'react'
import { GitBranch, Activity, Moon, Sun, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { LogEntry } from '@/types'

interface StatusBarProps {
  logs: LogEntry[]
  isAdmin?: boolean
}

export function StatusBar({ logs, isAdmin }: StatusBarProps) {
  const { theme, setTheme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  // Collapse by default on mobile viewports
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsExpanded(false)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, isExpanded])

  return (
    <div className="flex flex-col bg-status-bar select-none">
      {/* Top Status Bar strip */}
      <div className="flex items-center justify-between px-3 py-1 text-[11px] font-mono border-t border-border bg-sidebar/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted">
            <GitBranch className="w-3.5 h-3.5" />
            <span>main</span>
          </div>
          {isAdmin ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-amber-500 hover:text-amber-400 cursor-pointer font-semibold"
            >
              <Shield className="w-3.5 h-3.5 animate-pulse" />
              <span>Mode: Read/Write (Admin)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-green-500 hover:text-green-400 cursor-pointer font-semibold"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Status: Nominal</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 hover:bg-sidebar-border/50 rounded transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-500" />
            )}
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-sidebar-border/50 rounded transition-colors text-muted hover:text-foreground cursor-pointer flex items-center gap-1"
            title={isExpanded ? "Collapse Console Logs" : "Expand Console Logs"}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] uppercase font-semibold">Console</span>
          </button>
        </div>
      </div>

      {/* Slide-out Terminal logs */}
      <div
        ref={scrollRef}
        className={cn(
          "transition-all duration-200 ease-in-out bg-status-bar overflow-y-auto px-3 font-mono text-[11px] leading-relaxed",
          isExpanded ? "h-20 py-1.5 border-t border-border/60 opacity-100" : "h-0 py-0 opacity-0 pointer-events-none"
        )}
      >
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-2 py-0.5",
              log.type === 'error' && "text-red-500",
              log.type === 'success' && "text-green-500",
              log.type === 'warning' && "text-yellow-500",
              log.type === 'info' && "text-muted"
            )}
          >
            <span className="text-log-timestamp">[{log.timestamp}]</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
