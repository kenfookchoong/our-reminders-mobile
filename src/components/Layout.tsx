import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal, Alert } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import type { ReactNode } from 'react'

interface LayoutProps {
  profileName: string
  partnerName: string
  coupleCode: string | null
  onLeave: () => void
  children: ReactNode
}

export default function Layout({ profileName, partnerName, coupleCode, onLeave, children }: LayoutProps) {
  const insets = useSafeAreaInsets()
  const [showMenu, setShowMenu] = useState(false)

  const copyCode = async () => {
    if (coupleCode) {
      await Clipboard.setStringAsync(coupleCode)
      Alert.alert('Copied!', `Couple code ${coupleCode} copied to clipboard`)
    }
    setShowMenu(false)
  }

  const handleLeave = () => {
    setShowMenu(false)
    Alert.alert(
      'Leave couple?',
      'You can rejoin later with the invite code.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: onLeave },
      ]
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Our Reminders</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.myName}>{profileName}</Text> & {partnerName}
          </Text>
        </View>
        <Pressable onPress={() => setShowMenu(true)} hitSlop={8} style={styles.gearButton}>
          <Ionicons name="settings-outline" size={22} color={colors.stone[400]} />
        </Pressable>
      </View>
      {children}

      {/* Settings menu */}
      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowMenu(false)}>
          <View style={[styles.menu, { marginTop: insets.top + 50 }]}>
            {coupleCode && (
              <Pressable onPress={copyCode} style={styles.menuItem}>
                <Text style={styles.menuIcon}>🔗</Text>
                <View>
                  <Text style={styles.menuLabel}>Invite code</Text>
                  <Text style={styles.menuCode}>{coupleCode}</Text>
                </View>
              </Pressable>
            )}
            <View style={styles.divider} />
            <Pressable onPress={handleLeave} style={styles.menuItem}>
              <Text style={styles.menuIcon}>👋</Text>
              <Text style={styles.menuDanger}>Leave couple</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warm[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.stone[800],
  },
  subtitle: {
    fontSize: 13,
    color: colors.stone[400],
    marginTop: 1,
  },
  myName: {
    color: colors.warm[500],
    fontWeight: '600',
  },
  gearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menu: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.stone[700],
  },
  menuCode: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.warm[500],
    letterSpacing: 2,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.stone[100],
    marginHorizontal: 16,
  },
  menuDanger: {
    fontSize: 14,
    color: '#EF4444',
  },
})
