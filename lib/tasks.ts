import fs from 'fs'
import path from 'path'

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'high' | 'med' | 'low'

export interface Task {
  id: string
  appId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  due?: string
  createdAt?: string
}

const DATA_PATH = path.join(process.cwd(), 'data', 'tasks.json')

export function readTasks(): Task[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeTasks(items: Task[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2))
}

export function addTask(item: Omit<Task, 'id' | 'createdAt'>): Task {
  const items = readTasks()
  const newItem: Task = {
    ...item,
    id: `task_${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  items.push(newItem)
  writeTasks(items)
  return newItem
}

export function updateTask(id: string, patch: Partial<Task>): Task | null {
  const items = readTasks()
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...patch }
  writeTasks(items)
  return items[idx]
}
