import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { Reminder } from '../types'
import { formatDueDate, isOverdue, getProfile } from '../lib/utils'
import { colors } from '../theme/colors'
import NudgeButton from './NudgeButton'

interface ReminderCardProps {
  reminder: Reminder
  myId: string
  partnerId: string
  partnerName: string
  onToggleDone: (id: string, isDone: boolean) => void
  onDelete: (id: string) => void
  onEdit: (reminder: Reminder) => void
}

export default function ReminderCard({
  reminder,
  myId,
  partnerId,
  partnerName,
  onToggleDone,
  onDelete,
  onEdit,
}: ReminderCardProps) {
  const [showActions, setShowActions] = useState(false)
  const overdue = !reminder.is_done && isOverdue(reminder.due_at)
  const isPartnerReminder = reminder.assigned_to === partnerId

  const creatorName = getProfile(reminder.created_by)?.name ?? 'Unknown'
  const label = reminder.created_by === myId ? `From ${creatorName}` : `From ${creatorName}`

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onToggleDone(reminder.id, reminder.is_done)
  }

  const handleDelete = () => {
    Alert.alert('Delete Reminder', `Delete "${reminder.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder.id) },
    ])
  }

  return (
    <Pressable
      onPress={() => setShowActions(!showActions)}
      style={[styles.card, overdue && styles.cardOverdue, reminder.is_done && styles.cardDone]}
    >
      <View style={styles.row}>
        {/* Checkbox */}
        <Pressable onPress={handleToggle} hitSlop={8} style={styles.checkbox}>
          {reminder.is_done ? (
            <Ionicons name="checkmark-circle" size={26} color={colors.green[500]} />
          ) : (
            <View style={styles.emptyCircle} />
          )}
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, reminder.is_done && styles.titleDone]}>
            {reminder.title}
          </Text>
          {reminder.note ? (
            <Text style={styles.note} numberOfLines={1}>{reminder.note}</Text>
          ) : null}
          <Text style={styles.label}>{label}</Text>
        </View>

        {/* Right side: due badge + nudge */}
        <View style={styles.rightSide}>
          {reminder.due_at && !reminder.is_done ? (
            <View style={[styles.dueBadge, overdue && styles.dueBadgeOverdue]}>
              <Text style={[styles.dueText, overdue && styles.dueTextOverdue]}>
                {formatDueDate(reminder.due_at)}
              </Text>
            </View>
          ) : null}
          {isPartnerReminder && !reminder.is_done ? (
            <NudgeButton
              reminderId={reminder.id}
              nudgedBy={myId}
              nudgedTo={partnerId}
              partnerName={partnerName}
            />
          ) : null}
        </View>
      </View>

      {/* Actions */}
      {showActions && !reminder.is_done ? (
        <View style={styles.actions}>
          <Pressable onPress={() => onEdit(reminder)} style={styles.actionButton}>
            <Ionicons name="pencil" size={16} color={colors.stone[500]} />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash" size={16} color={colors.red[400]} />
            <Text style={[styles.actionText, { color: colors.red[400] }]}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.warm[100],
  },
  cardOverdue: {
    borderColor: colors.red[400],
    borderWidth: 1.5,
  },
  cardDone: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.stone[300],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.stone[800],
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.stone[400],
  },
  note: {
    fontSize: 13,
    color: colors.stone[400],
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    color: colors.stone[300],
    marginTop: 4,
  },
  rightSide: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  dueBadge: {
    backgroundColor: colors.warm[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dueBadgeOverdue: {
    backgroundColor: '#FEE2E2',
  },
  dueText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.warm[600],
  },
  dueTextOverdue: {
    color: colors.red[500],
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.warm[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    color: colors.stone[500],
  },
})
