"use client"

import { useState } from 'react'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, FileText, Code, Mail, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileNode } from '@/types'

interface FileTreeProps {
  nodes: FileNode[]
  activeFile: string | null
  onFileSelect: (node: FileNode) => void
  isAdmin?: boolean
  onAddProject?: () => void
}

export function FileTree({ nodes, activeFile, onFileSelect, isAdmin, onAddProject }: FileTreeProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 text-xs font-mono font-semibold text-muted uppercase tracking-wider border-b border-border">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {nodes.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            level={0}
            isAdmin={isAdmin}
            onAddProject={onAddProject}
          />
        ))}
      </div>
    </div>
  )
}

interface FileTreeNodeProps {
  node: FileNode
  activeFile: string | null
  onFileSelect: (node: FileNode) => void
  level: number
  isAdmin?: boolean
  onAddProject?: () => void
}

function FileTreeNode({ node, activeFile, onFileSelect, level, isAdmin, onAddProject }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(node.type === 'directory')
  const isActive = activeFile === node.path

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded)
    } else {
      onFileSelect(node)
    }
  }

  const getIcon = () => {
    if (node.type === 'directory') {
      return isExpanded ? (
        <FolderOpen className="w-4 h-4 text-accent/80" />
      ) : (
        <Folder className="w-4 h-4 text-accent/80" />
      )
    }
    if (node.extension === 'md') return <FileText className="w-4 h-4 text-blue-500" />
    if (node.extension === 'json') return <Code className="w-4 h-4 text-amber-500" />
    if (node.extension === 'env') return <Mail className="w-4 h-4 text-emerald-500" />
    if (node.extension === 'tsx') return <User className="w-4 h-4 text-purple-500" />
    return <File className="w-4 h-4 text-muted" />
  }

  const getChevron = () => {
    if (node.type === 'file') return null
    return isExpanded ? (
      <ChevronDown className="w-3 h-3" />
    ) : (
      <ChevronRight className="w-3 h-3" />
    )
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between group px-3 py-1 cursor-pointer hover:bg-sidebar-border/50 transition-colors",
          isActive && "bg-accent/10 text-accent",
          "font-mono text-sm"
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 min-w-0">
          {getChevron()}
          {getIcon()}
          <span className="truncate">{node.name}</span>
        </div>
        {node.id === 'projects' && isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddProject?.()
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-code-bg rounded text-muted hover:text-foreground transition-all cursor-pointer flex items-center justify-center"
            title="Add New Project"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              level={level + 1}
              isAdmin={isAdmin}
              onAddProject={onAddProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
