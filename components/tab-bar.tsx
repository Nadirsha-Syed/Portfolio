"use client"

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tab } from '@/types'

interface TabBarProps {
  tabs: Tab[]
  onTabClose: (tabId: string) => void
  onTabSelect: (tabId: string) => void
}

export function TabBar({ tabs, onTabClose, onTabSelect }: TabBarProps) {
  return (
    <div className="flex items-center bg-sidebar border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-border min-w-[120px] max-w-[200px]",
            tab.isActive
              ? "bg-tab-active text-foreground border-b-2 border-b-accent"
              : "bg-tab-inactive text-muted hover:text-foreground"
          )}
          onClick={() => onTabSelect(tab.id)}
        >
          <span className="font-mono text-sm truncate flex-1">{tab.name}</span>
          <button
            className="opacity-0 group-hover:opacity-100 hover:bg-sidebar-border/50 rounded p-0.5 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onTabClose(tab.id)
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
