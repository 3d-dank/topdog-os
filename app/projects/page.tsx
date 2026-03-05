'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Task, TaskStatus, TaskPriority } from '@/lib/tasks'
import { PORTFOLIO } from '@/lib/portfolio'

const APPS = PORTFOLIO.map((a) => ({ id: a.id, name: a.name, emoji: a.emoji }))

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#64748B' },
  { id: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { id: 'review', label: 'Review', color: '#6366F1' },
  { id: 'done', label: 'Done', color: '#10B981' },
]

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  backlog: 'in_progress',
  in_progress: 'review',
  review: 'done',
  done: 'backlog',
}

function priorityBadge(p: TaskPriority) {
  const colors: Record<TaskPriority, { bg: string; text: string }> = {
    high: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
    med: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
    low: { bg: 'rgba(100,116,139,0.1)', text: '#64748B' },
  }
  return colors[p] ?? colors.med
}

function appInfo(id: string) {
  return APPS.find((a) => a.id === id) ?? { id, name: id, emoji: '📦' }
}

function formatDue(due?: string): { label: string; overdue: boolean } {
  if (!due) return { label: '', overdue: false }
  const d = new Date(due)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / 86400000)
  const overdue = diffDays < 0
  if (overdue) return { label: `${Math.abs(diffDays)}d overdue`, overdue: true }
  if (diffDays === 0) return { label: 'Due today', overdue: false }
  if (diffDays === 1) return { label: 'Due tomorrow', overdue: false }
  return { label: `Mar ${d.getDate()}`, overdue: false }
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [moving, setMoving] = useState<string | null>(null)

  // Add task form
  const [formAppId, setFormAppId] = useState('lawngenius')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formStatus, setFormStatus] = useState<TaskStatus>('backlog')
  const [formPriority, setFormPriority] = useState<TaskPriority>('med')
  const [formDue, setFormDue] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formSaving, setFormSaving] = useState(false)

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function moveTask(id: string, newStatus: TaskStatus) {
    setMoving(id)
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await fetchTasks()
    setMoving(null)
  }

  async function handleAddTask() {
    if (!formTitle.trim()) return
    setFormSaving(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: formAppId,
        title: formTitle,
        description: formDesc || undefined,
        status: formStatus,
        priority: formPriority,
        tags: formTags ? formTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        due: formDue || undefined,
      }),
    })
    setFormSaving(false)
    setModal(false)
    setFormTitle('')
    setFormDesc('')
    setFormTags('')
    setFormDue('')
    await fetchTasks()
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0F',
    border: '1px solid #1E1E2E',
    borderRadius: '4px',
    color: '#E2E8F0',
    padding: '8px 10px',
    fontSize: '0.75rem',
    width: '100%',
    fontFamily: 'inherit',
  }

  const totalOpen = tasks.filter((t) => t.status !== 'done').length

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}
      >
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Projects</h1>
          <span className="label">/ roadmap</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono text-xs" style={{ color: '#334155' }}>{totalOpen} open tasks</span>
          <button
            onClick={() => setModal(true)}
            className="mono text-xs px-4 py-2 rounded transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'rgba(0,212,170,0.08)',
              color: '#00D4AA',
              border: '1px solid rgba(0,212,170,0.25)',
            }}
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="mono text-xs" style={{ color: '#334155' }}>Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id)
            return (
              <div key={col.id} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="label">{col.label.toUpperCase()}</span>
                  <span
                    className="mono text-xs ml-auto px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: '#13131F',
                      color: '#64748B',
                      border: '1px solid #1E1E2E',
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {colTasks.length === 0 && (
                    <div
                      className="rounded text-center py-6"
                      style={{
                        border: '1px dashed #1E1E2E',
                        color: '#334155',
                        fontSize: '0.7rem',
                      }}
                    >
                      empty
                    </div>
                  )}
                  {colTasks.map((task) => {
                    const app = appInfo(task.appId)
                    const pBadge = priorityBadge(task.priority)
                    const due = formatDue(task.due)
                    const nextStatus = NEXT_STATUS[task.status]
                    const nextLabel = COLUMNS.find((c) => c.id === nextStatus)?.label ?? 'Backlog'
                    return (
                      <div
                        key={task.id}
                        className="card-hover flex flex-col gap-2.5"
                        style={{
                          backgroundColor: '#0F0F1A',
                          border: '1px solid #1E1E2E',
                          borderRadius: '6px',
                          padding: '12px 14px',
                        }}
                      >
                        {/* App badge */}
                        <div className="flex items-center justify-between">
                          <span className="mono text-xs" style={{ color: '#64748B' }}>
                            {app.emoji} {app.name}
                          </span>
                          <span
                            className="mono text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: pBadge.bg,
                              color: pBadge.text,
                              fontSize: '0.6rem',
                              textTransform: 'uppercase',
                            }}
                          >
                            {task.priority === 'med' ? 'medium' : task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="text-xs font-medium leading-snug" style={{ color: '#E2E8F0' }}>
                          {task.title}
                        </div>

                        {/* Tags + due */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="mono text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: '#13131F',
                                color: '#64748B',
                                border: '1px solid #1E1E2E',
                                fontSize: '0.6rem',
                              }}
                            >
                              🏷 {tag}
                            </span>
                          ))}
                          {due.label && (
                            <span
                              className="mono text-xs ml-auto"
                              style={{ color: due.overdue ? '#EF4444' : '#334155', fontSize: '0.65rem' }}
                            >
                              📅 {due.label}
                            </span>
                          )}
                        </div>

                        {/* Move button */}
                        <button
                          onClick={() => moveTask(task.id, nextStatus)}
                          disabled={moving === task.id}
                          className="mono text-xs py-1.5 rounded w-full transition-opacity hover:opacity-80 disabled:opacity-40"
                          style={{
                            backgroundColor: '#13131F',
                            color: '#64748B',
                            border: '1px solid #1E1E2E',
                            marginTop: '2px',
                          }}
                        >
                          {moving === task.id ? '...' : `→ Move to ${nextLabel}`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setModal(false)}
        >
          <div
            className="w-full max-w-md mx-4 overflow-auto"
            style={{
              backgroundColor: '#0F0F1A',
              border: '1px solid #1E1E2E',
              borderRadius: '8px',
              padding: '20px',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="label">NEW TASK</span>
              <button onClick={() => setModal(false)} style={{ color: '#334155', fontSize: '1rem' }}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label block mb-1">APP</label>
                <select value={formAppId} onChange={(e) => setFormAppId(e.target.value)} style={inputStyle}>
                  {APPS.map((a) => (
                    <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label block mb-1">TITLE *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="label block mb-1">DESCRIPTION</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Optional details..."
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">STATUS</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as TaskStatus)} style={inputStyle}>
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label block mb-1">PRIORITY</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(e.target.value as TaskPriority)} style={inputStyle}>
                    <option value="high">High</option>
                    <option value="med">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">DUE DATE</label>
                  <input
                    type="date"
                    value={formDue}
                    onChange={(e) => setFormDue(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="label block mb-1">TAGS (comma-sep)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="build, revenue..."
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                onClick={handleAddTask}
                disabled={formSaving || !formTitle.trim()}
                className="w-full mono text-xs py-2.5 rounded transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{
                  backgroundColor: 'rgba(0,212,170,0.1)',
                  color: '#00D4AA',
                  border: '1px solid rgba(0,212,170,0.3)',
                  marginTop: '8px',
                }}
              >
                {formSaving ? '// saving...' : '[ CREATE TASK ]'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
