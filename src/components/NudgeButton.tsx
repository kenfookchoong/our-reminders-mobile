import { useState, useCallback } from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { supabase } from '../lib/supabase'
import { colors } from '../theme/colors'

interface NudgeButtonProps {
  reminderId: string
  nudgedBy: string
  nudgedTo: string
  partnerName: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function NudgeButton({ reminderId, nudgedBy, nudgedTo }: NudgeButtonProps) {
  const [cooldown, setCooldown] = useState(false)
  const [sent, setSent] = useState(false)
  const rotation = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const handleNudge = useCallback(async () => {
    if (cooldown) return

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    rotation.value = withSequence(
      withTiming(-15, { duration: 80 }),
      withTiming(15, { duration: 80 }),
      withTiming(-10, { duration: 80 }),
      withTiming(10, { duration: 80 }),
      withTiming(0, { duration: 80 })
    )

    await supabase.from('nudges').insert({
      reminder_id: reminderId,
      nudged_by: nudgedBy,
      nudged_to: nudgedTo,
    })

    setSent(true)
    setCooldown(true)
    setTimeout(() => {
      setCooldown(false)
      setSent(false)
    }, 60000)
  }, [cooldown, reminderId, nudgedBy, nudgedTo, rotation])

  return (
    <AnimatedPressable
      onPress={handleNudge}
      disabled={cooldown}
      style={[styles.button, animatedStyle]}
    >
      {sent ? (
        <Text style={styles.sentText}>Sent!</Text>
      ) : (
        <Ionicons
          name="notifications"
          size={20}
          color={cooldown ? colors.stone[300] : colors.warm[500]}
        />
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 12,
  },
  sentText: {
    fontSize: 11,
    color: colors.warm[500],
    fontWeight: '600',
  },
})
