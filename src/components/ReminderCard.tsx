import { useState, useRef } from 'react'
import { View, Text, Pressable, StyleSheet, Alert, Animated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { Reminder } from '../types'
import { formatDueDate, isOverdue } from '../lib/utils'
import { colors } from '../theme/colors'
import NudgeButton from './NudgeButton'

interface ReminderCardProps {
  reminder: Reminder
  myId: string
  myName: string
  partnerId: string
  partnerName: string
  onToggleDone: (id: string, isDone: boolean) => void
  onDelete: (id: string) => void
  onEdit: (reminder: Reminder) => void
}

export default function ReminderCard({
  reminder,
  myId,
  myName,
  partnerId,
  partnerName,
  onToggleDone,
  onDelete,
  onEdit,
}: ReminderCardProps) {
  const [showActions, setShowActions] = useState(false)
  const swipeableRef = useRef<Swipeable>(null)
  const overdue = !reminder.is_done && isOverdue(reminder.due_at)
  const isPartnerReminder = reminder.assigned_to === partnerId

  const creatorName = reminder.created_by === myId ? myName : partnerName
  const assigneeName = reminder.assigned_to === myId ? 'Me' : partnerName
  const label = `From ${creatorName} · For ${assigneeName}`

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onToggleDone(reminder.id, reminder.is_done)
    swipeableRef.current?.close()
  }

  const handleDelete = () => {
    Alert.alert('Delete Reminder', `Delete "${reminder.title}"?`, [
      { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder.id) },
    ])
  }

  const renderLeftActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    })
    return (
      <Pressable onPress={handleToggle} style={styles.leftAction}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name={reminder.is_done ? 'arrow-undo' : 'checkmark-circle'} size={28} color="white" />
        </Animated.View>
        <Text style={styles.actionLabel}>{reminder.is_done ? 'Undo' : 'Done'}</Text>
      </Pressable>
    )
  }

  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    })
    return (
      <Pressable onPress={handleDelete} style={styles.rightAction}>
        <Text style={styles.actionLabel}>Delete</Text>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="white" />
        </Animated.View>
      </Pressable>
    )
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          // Swipe right → instantly toggle done/undo (fires before animation completes)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          handleToggle()
          swipeableRef.current?.close()
        } else {
          // Swipe left → just reveal Delete button (requires tap)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      }}
      overshootLeft={false}
      overshootRight={false}
      friction={1.5}
    >
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
              <>
                <View style={[styles.dueBadge, overdue && styles.dueBadgeOverdue]}>
                  <Text style={[styles.dueText, overdue && styles.dueTextOverdue]}>
                    {formatDueDate(reminder.due_at)}
                  </Text>
                </View>
                {reminder.recurrence && (
                  <View style={styles.recurrenceBadge}>
                    <Text style={styles.recurrenceText}>🔁 Repeats {reminder.recurrence}</Text>
                  </View>
                )}
              </>
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
    </Swipeable>
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
  recurrenceBadge: {
    backgroundColor: colors.warm[50],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  recurrenceText: {
    fontSize: 10,
    color: colors.warm[500],
    fontWeight: '500',
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
  leftAction: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 8,
  },
  rightAction: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 8,
  },
  actionLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
})
