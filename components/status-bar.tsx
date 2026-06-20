"use client"

import { useEffect, useRef } from 'react'
import { GitBranch, Activity, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { LogEntry } from '@/types'

interface StatusBarProps {
  logs: LogEntry[]
}

export function StatusBar({ logs }: StatusBarProps) {
  const { theme, setTheme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="flex flex-col border-t border-border bg-status-bar">
      <div className="flex items-center justify-between px-3 py-1 text-xs font-mono border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted">
            <GitBranch className="w-3.5 h-3.5" />
            <span>main</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-500">
            <Activity className="w-3.5 h-3.5" />
            <span>Status: Nominal</span>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1 hover:bg-sidebar-border/50 rounded transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <div
        ref={scrollRef}
        className="h-20 overflow-y-auto px-3 py-1 space-y-0.5 font-mono text-xs"
      >
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-2",
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
