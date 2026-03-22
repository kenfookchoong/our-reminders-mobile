import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import type { ReactNode } from 'react'

interface LayoutProps {
  profileName: string
  partnerName: string
  onSwitch: () => void
  children: ReactNode
}

export default function Layout({ profileName, partnerName, onSwitch, children }: LayoutProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Our Reminders</Text>
          <Text style={styles.subtitle}>{profileName} & {partnerName}</Text>
        </View>
        <Pressable onPress={onSwitch} hitSlop={8}>
          <Text style={styles.switchText}>Switch</Text>
        </Pressable>
      </View>
      {children}
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
  switchText: {
    fontSize: 14,
    color: colors.stone[400],
  },
})
