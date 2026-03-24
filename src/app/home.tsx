import { useState, useCallback } from 'react'
import { View, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useProfile } from '../context/ProfileContext'
import { useReminders } from '../hooks/useReminders'
import { usePushNotifications } from '../hooks/usePushNotifications'
import Layout from '../components/Layout'
import TabBar, { type TabId } from '../components/TabBar'
import ReminderList from '../components/ReminderList'
import CreateReminderSheet from '../components/CreateReminderSheet'
import NotificationBanner from '../components/NotificationBanner'
import SearchBar from '../components/SearchBar'
import { colors } from '../theme/colors'
import type { Reminder } from '../types'

export default function HomeScreen() {
  const { profile, partner, coupleCode, clearProfile } = useProfile()
  const { reminders, loading, addReminder, updateReminder, toggleDone, deleteReminder, refreshReminders } =
    useReminders(profile?.id ?? null, partner?.id ?? null)
  const { permission, isRegistered, registerForPush } = usePushNotifications(profile?.id ?? null)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [activeTab, setActiveTab] = useState<TabId>('mine')
  const [searchQuery, setSearchQuery] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const handleLeave = useCallback(() => {
    clearProfile()
    router.replace('/')
  }, [clearProfile, router])

  const handleEdit = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder)
    setSheetOpen(true)
  }, [])

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false)
    setEditingReminder(null)
  }, [])

  if (!profile || !partner) return null

  const filtered = reminders.filter((r) => {
    const matchesTab =
      activeTab === 'mine' ? r.assigned_to === profile.id :
      activeTab === 'theirs' ? r.assigned_to === partner.id : true
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      r.note?.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  return (
    <Layout profileName={profile.name} partnerName={partner.name} coupleCode={coupleCode} onLeave={handleLeave}>
      <NotificationBanner
        permission={permission}
        isRegistered={isRegistered}
        onEnable={registerForPush}
      />

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <TabBar active={activeTab} onChange={setActiveTab} />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.warm[500]} />
        </View>
      ) : (
        <ReminderList
          reminders={filtered}
          myId={profile.id}
          myName={profile.name}
          partnerId={partner.id}
          partnerName={partner.name}
          onToggleDone={toggleDone}
          onDelete={deleteReminder}
          onEdit={handleEdit}
          onRefresh={refreshReminders}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => setSheetOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: 24 + insets.bottom },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <CreateReminderSheet
        open={sheetOpen}
        onClose={handleCloseSheet}
        onCreate={(data) => addReminder({ ...data, created_by: profile.id })}
        onEdit={(id, data, originalDueAt) => updateReminder(id, data, originalDueAt)}
        editingReminder={editingReminder}
        myId={profile.id}
        partnerId={partner.id}
        partnerName={partner.name}
        myName={profile.name}
      />
    </Layout>
  )
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.warm[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
    backgroundColor: colors.warm[600],
  },
  fabText: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.white,
    marginTop: -2,
  },
})
