import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useProfile } from '../context/ProfileContext'
import { PROFILES } from '../lib/utils'
import { colors } from '../theme/colors'
import { useEffect } from 'react'

export default function WelcomeScreen() {
  const { profile, loading, pickProfile } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile) {
      router.replace('/home')
    }
  }, [loading, profile, router])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.warm[500]} />
      </View>
    )
  }

  if (profile) return null

  const handlePick = (id: string) => {
    pickProfile(id)
    router.replace('/home')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💝</Text>
      <Text style={styles.title}>Our Reminders</Text>
      <Text style={styles.subtitle}>A little app for the two of us.{'\n'}Who are you?</Text>

      <View style={styles.buttons}>
        {PROFILES.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => handlePick(p.id)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>{p.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warm[50],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.stone[800],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.stone[400],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    width: 120,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.warm[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.warm[100],
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.stone[700],
  },
})
