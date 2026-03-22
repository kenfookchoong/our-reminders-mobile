import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Reminder } from '../types'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('reminders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReminders(data)
        setLoading(false)
      })

    const channel = supabase
      .channel('reminders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newR = payload.new as Reminder
            setReminders((prev) =>
              prev.some((r) => r.id === newR.id) ? prev : [newR, ...prev]
            )
          } else if (payload.eventType === 'UPDATE') {
            setReminders((prev) =>
              prev.map((r) => (r.id === (payload.new as Reminder).id ? (payload.new as Reminder) : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setReminders((prev) => prev.filter((r) => r.id !== (payload.old as Reminder).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const addReminder = useCallback(
    async (data: { title: string; note?: string; due_at?: string; created_by: string; assigned_to: string }) => {
      const { data: inserted, error } = await supabase.from('reminders').insert(data).select().single()
      if (!error && inserted) {
        setReminders((prev) => [inserted, ...prev])
      }
      return !error
    },
    []
  )

  const toggleDone = useCallback(async (id: string, isDone: boolean) => {
    const now = new Date().toISOString()
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, is_done: !isDone, completed_at: !isDone ? now : null, updated_at: now } : r
      )
    )
    await supabase
      .from('reminders')
      .update({
        is_done: !isDone,
        completed_at: !isDone ? now : null,
        updated_at: now,
      })
      .eq('id', id)
  }, [])

  const updateReminder = useCallback(
    async (
      id: string,
      data: { title: string; note?: string; due_at?: string; assigned_to: string },
      originalDueAt?: string | null
    ) => {
      const now = new Date().toISOString()
      const updates: Record<string, unknown> = {
        ...data,
        updated_at: now,
      }
      if (data.due_at !== (originalDueAt ?? undefined)) {
        updates.notified_at = null
      }
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } as Reminder : r))
      )
      const { error } = await supabase.from('reminders').update(updates).eq('id', id)
      return !error
    },
    []
  )

  const deleteReminder = useCallback(async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    await supabase.from('reminders').delete().eq('id', id)
  }, [])

  const refreshReminders = useCallback(async () => {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setReminders(data)
  }, [])

  return { reminders, loading, addReminder, updateReminder, toggleDone, deleteReminder, refreshReminders }
}
