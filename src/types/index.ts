export interface Profile {
  id: string
  name: string
  couple_id: string
}

export interface Reminder {
  id: string
  title: string
  note: string | null
  due_at: string | null
  created_by: string
  assigned_to: string
  is_done: boolean
  completed_at: string | null
  recurrence: 'daily' | 'weekly' | 'monthly' | null
  created_at: string
  updated_at: string
}

export interface PushSubscriptionRecord {
  id: string
  profile_id: string
  endpoint: string
  p256dh: string
  auth: string
}

export interface ExpoPushToken {
  id: string
  profile_id: string
  token: string
  platform: string
  created_at: string
}

export interface Nudge {
  id: string
  reminder_id: string
  nudged_by: string
  nudged_to: string
  created_at: string
}
