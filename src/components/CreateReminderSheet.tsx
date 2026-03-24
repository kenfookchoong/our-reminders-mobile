import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, Platform, Keyboard } from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import type { Reminder } from '../types'
import { colors } from '../theme/colors'

interface CreateReminderSheetProps {
  open: boolean
  onClose: () => void
  onCreate: (data: { title: string; note?: string; due_at?: string; assigned_to: string }) => void
  onEdit?: (
    id: string,
    data: { title: string; note?: string; due_at?: string; assigned_to: string },
    originalDueAt?: string | null
  ) => void
  editingReminder?: Reminder | null
  myId: string
  partnerId: string
  partnerName: string
  myName: string
}

export default function CreateReminderSheet({
  open,
  onClose,
  onCreate,
  onEdit,
  editingReminder,
  myId,
  partnerId,
  partnerName,
  myName,
}: CreateReminderSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const titleInputRef = useRef<TextInput>(null)

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [assignTo, setAssignTo] = useState<'me' | 'them'>('me')

  const isEditing = !!editingReminder

  useEffect(() => {
    if (open) {
      if (editingReminder) {
        setTitle(editingReminder.title)
        setNote(editingReminder.note || '')
        setDueDate(editingReminder.due_at ? new Date(editingReminder.due_at) : null)
        setAssignTo(editingReminder.assigned_to === myId ? 'me' : 'them')
      } else {
        setTitle('')
        setNote('')
        setDueDate(null)
        setAssignTo('me')
      }
      bottomSheetRef.current?.expand()
      setTimeout(() => titleInputRef.current?.focus(), 400)
    } else {
      bottomSheetRef.current?.close()
    }
  }, [open, editingReminder, myId])

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return
    Keyboard.dismiss()

    const data = {
      title: title.trim(),
      note: note.trim() || undefined,
      due_at: dueDate ? dueDate.toISOString() : null,
      assigned_to: assignTo === 'me' ? myId : partnerId,
    }

    if (isEditing && onEdit && editingReminder) {
      onEdit(editingReminder.id, data, editingReminder.due_at)
    } else {
      onCreate(data)
    }

    onClose()
  }, [title, note, dueDate, assignTo, isEditing, editingReminder, myId, partnerId, onCreate, onEdit, onClose])

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (selectedDate) {
      if (dueDate) {
        // Preserve existing time when changing date
        selectedDate.setHours(dueDate.getHours(), dueDate.getMinutes())
      } else {
        selectedDate.setHours(9, 0, 0, 0)
      }
      setDueDate(selectedDate)
    }
  }

  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false)
    if (selectedDate && dueDate) {
      const updated = new Date(dueDate)
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes())
      setDueDate(updated)
    }
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.heading}>{isEditing ? 'Edit Reminder' : 'New Reminder'}</Text>

        {/* Title */}
        <TextInput
          ref={titleInputRef}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be remembered?"
          placeholderTextColor={colors.stone[300]}
          style={styles.input}
        />

        {/* Note */}
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a note (optional)"
          placeholderTextColor={colors.stone[300]}
          style={styles.input}
        />

        {/* Due date */}
        <Text style={styles.fieldLabel}>Due date (optional)</Text>
        <View style={styles.dateRow}>
          <Pressable
            onPress={() => { setShowDatePicker(true); setShowTimePicker(false) }}
            style={styles.dateButton}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.stone[500]} />
            <Text style={styles.dateText}>
              {dueDate ? formatDate(dueDate) : 'Pick a date'}
            </Text>
          </Pressable>

          {dueDate && (
            <Pressable
              onPress={() => { setShowTimePicker(true); setShowDatePicker(false) }}
              style={styles.dateButton}
            >
              <Ionicons name="time-outline" size={18} color={colors.stone[500]} />
              <Text style={styles.dateText}>{formatTime(dueDate)}</Text>
            </Pressable>
          )}

          {dueDate && (
            <Pressable onPress={() => setDueDate(null)} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={colors.stone[300]} />
            </Pressable>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && dueDate && (
          <DateTimePicker
            value={dueDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        {/* Assign to */}
        <Text style={styles.fieldLabel}>For who?</Text>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setAssignTo('me')}
            style={[styles.toggleButton, assignTo === 'me' && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, assignTo === 'me' && styles.toggleTextActive]}>
              Me ({myName})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAssignTo('them')}
            style={[styles.toggleButton, assignTo === 'them' && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, assignTo === 'them' && styles.toggleTextActive]}>
              {partnerName}
            </Text>
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!title.trim()}
          style={[styles.submitButton, !title.trim() && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>
            {isEditing ? 'Save Changes' : 'Add Reminder'}
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: colors.stone[200],
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.stone[800],
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.warm[50],
    borderWidth: 1,
    borderColor: colors.warm[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.stone[800],
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.stone[400],
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warm[50],
    borderWidth: 1,
    borderColor: colors.warm[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: colors.stone[600],
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.warm[100],
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.warm[500],
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.stone[500],
  },
  toggleTextActive: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.warm[500],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
})
