import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'

interface NotificationBannerProps {
  permission: 'undetermined' | 'granted' | 'denied'
  isRegistered: boolean
  onEnable: () => void
}

export default function NotificationBanner({ permission, isRegistered, onEnable }: NotificationBannerProps) {
  if (isRegistered || permission === 'denied') return null
  if (permission === 'granted') return null

  return (
    <View style={styles.banner}>
      <Ionicons name="notifications-outline" size={20} color={colors.warm[600]} />
      <Text style={styles.text}>Enable notifications so you never miss a reminder</Text>
      <Pressable onPress={onEnable} style={styles.button}>
        <Text style={styles.buttonText}>Enable</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.warm[100],
    borderRadius: 12,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.stone[600],
  },
  button: {
    backgroundColor: colors.warm[500],
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
})
