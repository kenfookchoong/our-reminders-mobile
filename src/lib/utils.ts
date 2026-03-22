import type { Profile } from '../types'

export const PROFILES: Profile[] = [
  { id: 'person-a', name: 'Ken' },
  { id: 'person-b', name: 'Mei' },
]

export function getPartner(myId: string): Profile {
  return PROFILES.find((p) => p.id !== myId)!
}

export function getProfile(id: string): Profile {
  return PROFILES.find((p) => p.id === id)!
}

export function isOverdue(dueAt: string | null): boolean {
  if (!dueAt) return false
  return new Date(dueAt) < new Date()
}

export function formatDueDate(dueAt: string): string {
  const date = new Date(dueAt)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`
  if (diffDays === -1) return 'Yesterday'
  if (diffDays === 0) return `Today at ${time}`
  if (diffDays === 1) return `Tomorrow at ${time}`
  if (diffDays <= 7) return `In ${diffDays} days at ${time}`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${time}`
}
