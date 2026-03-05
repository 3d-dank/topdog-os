'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PORTFOLIO } from '@/lib/portfolio'
import type { TaskPriority } from '@/lib/tasks'

const APPS = PORTFOLIO.map((a) => ({ id: a.id, name: a.name, emoji: a.emoji }))

export default function OverviewActions() {
  const router = useRouter()
  const [taskModal, setTaskModal] = useState(false)
  const [actModal, setActModal] = useState(false)

  // Task form state
  const [taskAppId, setTaskAppId] = useState('lawngenius')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('med')
  const [taskDue, setTaskDue] = useState('')
  const [taskSaving, setTaskSaving] = useState(false)

  // Activity form state
  const [actText, setActText] = useState('')
  const [actAppId, setActAppId] = useState('lawngenius')
  const [actType, setActType] = useState('feature')
  const [actSaving, setActSaving] = useState(false)

  async function handleAddTask() {
    if (!taskTitle.trim()) return
    setTaskSaving(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: taskAppId,
        title: taskTitle,
        status: 'backlog',
        priority: taskPriority,
        tags: [],
        due: taskDue || undefined,
      }),
    })
    setTaskSaving(false)
    setTaskModal(false)
    setTaskTitle('')
    setTaskDue('')
    router.refresh()
  }

  async function handleLogActivity() {
    if (!actText.trim()) return
    setActSaving(true)
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: actText,
        type: actType,
        appId: actAppId,
      }),
    })
    setActSaving(false)
    setActModal(false)
    setActText('')
    router.refresh()
  }

  const inputStyle = {
    backgroundColor: '#0A0A0F',
    border: '1px solid #1E1E2E',
    borderRadius: '4px',
    color: '#E2E8F0',
    padding: '8px 10px',
    fontSize: '0.75rem',
    width: '100%',
    fontFamily: 'inherit',
  }

  const selectStyle = { ...inputStyle }

  return (
    <>
      {/* Quick actions row */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTaskModal(true)}
          className="mono text-xs px-4 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'rgba(0,212,170,0.08)',
            color: '#00D4AA',
            border: '1px solid rgba(0,212,170,0.25)',
          }}
        >
          + Add Task
        </button>
        <button
          onClick={() => setActModal(true)}
          className="mono text-xs px-4 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: '#0F0F1A',
            color: '#64748B',
            border: '1px solid #1E1E2E',
          }}
        >
          Log Activity
        </button>
        <a
          href="/financials"
          className="mono text-xs px-4 py-2 rounded transition-opacity hover:opacity-80 inline-block"
          style={{
            backgroundColor: '#0F0F1A',
            color: '#64748B',
            border: '1px solid #1E1E2E',
          }}
        >
          View Financials →
        </a>
      </div>

      {/* Add Task Modal */}
      {taskModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setTaskModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4"
            style={{
              backgroundColor: '#0F0F1A',
              border: '1px solid #1E1E2E',
              borderRadius: '8px',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="label">ADD TASK</span>
              <button onClick={() => setTaskModal(false)} style={{ color: '#334155' }}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label block mb-1">APP</label>
                <select value={taskAppId} onChange={(e) => setTaskAppId(e.target.value)} style={selectStyle}>
                  {APPS.map((a) => (
                    <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label block mb-1">TITLE</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">PRIORITY</label>
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)} style={selectStyle}>
                    <option value="high">High</option>
                    <option value="med">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="label block mb-1">DUE DATE</label>
                  <input
                    type="date"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                onClick={handleAddTask}
                disabled={taskSaving || !taskTitle.trim()}
                className="w-full mono text-xs py-2 rounded transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{
                  backgroundColor: 'rgba(0,212,170,0.1)',
                  color: '#00D4AA',
                  border: '1px solid rgba(0,212,170,0.3)',
                  marginTop: '4px',
                }}
              >
                {taskSaving ? 'Saving...' : '[ ADD TO BACKLOG ]'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {actModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setActModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4"
            style={{
              backgroundColor: '#0F0F1A',
              border: '1px solid #1E1E2E',
              borderRadius: '8px',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="label">LOG ACTIVITY</span>
              <button onClick={() => setActModal(false)} style={{ color: '#334155' }}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label block mb-1">APP</label>
                <select value={actAppId} onChange={(e) => setActAppId(e.target.value)} style={selectStyle}>
                  <option value="all">All Apps</option>
                  {APPS.map((a) => (
                    <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                  ))}
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="label block mb-1">TYPE</label>
                <select value={actType} onChange={(e) => setActType(e.target.value)} style={selectStyle}>
                  <option value="feature">Feature</option>
                  <option value="build">Build</option>
                  <option value="launch">Launch</option>
                  <option value="milestone">Milestone</option>
                  <option value="infra">Infra</option>
                </select>
              </div>
              <div>
                <label className="label block mb-1">DESCRIPTION</label>
                <input
                  type="text"
                  value={actText}
                  onChange={(e) => setActText(e.target.value)}
                  placeholder="What happened..."
                  style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogActivity()}
                />
              </div>
              <button
                onClick={handleLogActivity}
                disabled={actSaving || !actText.trim()}
                className="w-full mono text-xs py-2 rounded transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{
                  backgroundColor: 'rgba(0,212,170,0.1)',
                  color: '#00D4AA',
                  border: '1px solid rgba(0,212,170,0.3)',
                  marginTop: '4px',
                }}
              >
                {actSaving ? 'Saving...' : '[ LOG IT ]'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
