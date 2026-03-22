import { useState, useCallback } from 'react'
import { View, Text, SectionList, StyleSheet, RefreshControl } from 'react-native'
import type { Reminder } from '../types'
import { isOverdue } from '../lib/utils'
import { colors } from '../theme/colors'
import ReminderCard from './ReminderCard'

interface ReminderListProps {
  reminders: Reminder[]
  myId: string
  partnerId: string
  partnerName: string
  onToggleDone: (id: string, isDone: boolean) => void
  onDelete: (id: string) => void
  onEdit: (reminder: Reminder) => void
  onRefresh?: () => Promise<void>
}

export default function ReminderList({
  reminders,
  myId,
  partnerId,
  partnerName,
  onToggleDone,
  onDelete,
  onEdit,
  onRefresh,
}: ReminderListProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }, [onRefresh])

  if (reminders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyTitle}>All clear!</Text>
        <Text style={styles.emptySubtitle}>No reminders here. Tap + to create one.</Text>
      </View>
    )
  }

  const active = reminders.filter((r) => !r.is_done)
  const done = reminders.filter((r) => r.is_done)
  const overdueItems = active.filter((r) => isOverdue(r.due_at))
  const upcomingItems = active.filter((r) => !isOverdue(r.due_at))

  const sections: { title: string; data: Reminder[]; color: string }[] = []
  if (overdueItems.length > 0) sections.push({ title: 'Overdue', data: overdueItems, color: colors.red[400] })
  if (upcomingItems.length > 0) sections.push({ title: overdueItems.length > 0 ? 'Upcoming' : '', data: upcomingItems, color: colors.stone[400] })
  if (done.length > 0) sections.push({ title: 'Done', data: done, color: colors.stone[300] })

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.warm[500]}
          colors={[colors.warm[500]]}
        />
      }
      renderSectionHeader={({ section }) =>
        section.title ? (
          <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <ReminderCard
          reminder={item}
          myId={myId}
          partnerId={partnerId}
          partnerName={partnerName}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.stone[400],
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.stone[300],
    marginTop: 4,
    textAlign: 'center',
  },
})
