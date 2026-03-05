import { NextRequest, NextResponse } from 'next/server'
import { readTasks, addTask } from '@/lib/tasks'
import type { TaskStatus, TaskPriority } from '@/lib/tasks'

export async function GET() {
  return NextResponse.json(readTasks())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { appId, title, description, status, priority, tags, due } = body as {
    appId: string; title: string; description?: string; status: TaskStatus; priority: TaskPriority; tags: string[]; due?: string
  }
  if (!appId || !title) return NextResponse.json({ error: 'appId and title required' }, { status: 400 })
  const task = addTask({ appId, title, description, status: status ?? 'backlog', priority: priority ?? 'med', tags: tags ?? [], due })
  return NextResponse.json(task, { status: 201 })
}
