import { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useProfile } from '../context/ProfileContext'
import { colors } from '../theme/colors'

type Step = 'choice' | 'create' | 'join' | 'rejoin' | 'waiting'

export default function WelcomeScreen() {
  const { profile, partner, loading, setupCouple, joinCouple, rejoinCouple, clearProfile } = useProfile()
  const router = useRouter()
  const [step, setStep] = useState<Step>('choice')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [coupleCode, setCoupleCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && profile && partner) {
      router.replace('/home')
    }
  }, [loading, profile, partner, router])

  // Auto-navigate when partner joins while waiting
  useEffect(() => {
    if (step === 'waiting' && partner) {
      router.replace('/home')
    }
  }, [step, partner, router])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.warm[500]} />
      </View>
    )
  }

  // Already paired — waiting for navigation
  if (profile && partner) return null

  // Profile exists but no partner — show waiting screen
  if (profile && !partner && step === 'choice') {
    // They created a couple but partner hasn't joined yet
    // Reload couple code and show waiting
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>💝</Text>
        <Text style={styles.title}>Our Reminders</Text>
        <Text style={styles.subtitle}>Waiting for your partner to join...</Text>
        <ActivityIndicator size="small" color={colors.warm[500]} style={{ marginTop: 16 }} />
        <Pressable onPress={() => { clearProfile(); setStep('choice') }} style={styles.backButton}>
          <Text style={styles.backText}>Cancel</Text>
        </Pressable>
      </View>
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const code = await setupCouple(name.trim())
      setCoupleCode(code)
      setStep('waiting')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setSubmitting(false)
  }

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await joinCouple(name.trim(), code.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code')
    }
    setSubmitting(false)
  }

  const handleRejoin = async () => {
    if (!name.trim() || !code.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await rejoinCouple(name.trim(), code.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No profile found with that name and code')
    }
    setSubmitting(false)
  }

  const copyCode = async () => {
    await Clipboard.setStringAsync(coupleCode)
    Alert.alert('Copied!', `Code ${coupleCode} copied to clipboard`)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💝</Text>
      <Text style={styles.title}>Our Reminders</Text>

      {step === 'choice' && (
        <>
          <Text style={styles.subtitle}>A little app for the two of you.{'\n'}Get started below.</Text>
          <Pressable onPress={() => setStep('create')} style={[styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>Start a new couple</Text>
          </Pressable>
          <Pressable onPress={() => setStep('join')} style={[styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>I have an invite code</Text>
          </Pressable>
          <Pressable onPress={() => setStep('rejoin')} style={styles.backButton}>
            <Text style={styles.rejoinLink}>Had an account? Rejoin here</Text>
          </Pressable>
        </>
      )}

      {step === 'create' && (
        <View style={styles.form}>
          <Text style={styles.subtitle}>What's your name?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoFocus
            style={styles.input}
            placeholderTextColor={colors.stone[300]}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={handleCreate} disabled={!name.trim() || submitting} style={[styles.primaryButton, (!name.trim() || submitting) && styles.disabled]}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Creating...' : 'Create'}</Text>
          </Pressable>
          <Pressable onPress={() => setStep('choice')} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      )}

      {step === 'join' && (
        <View style={styles.form}>
          <Text style={styles.subtitle}>Enter your details</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoFocus
            style={styles.input}
            placeholderTextColor={colors.stone[300]}
          />
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
            placeholder="Invite code"
            maxLength={6}
            autoCapitalize="characters"
            style={[styles.input, styles.codeInput]}
            placeholderTextColor={colors.stone[300]}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={handleJoin} disabled={!name.trim() || code.length < 6 || submitting} style={[styles.primaryButton, (!name.trim() || code.length < 6 || submitting) && styles.disabled]}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Joining...' : 'Join'}</Text>
          </Pressable>
          <Pressable onPress={() => setStep('choice')} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      )}

      {step === 'rejoin' && (
        <View style={styles.form}>
          <Text style={styles.subtitle}>Enter your name and invite code</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name (exact match)"
            autoFocus
            style={styles.input}
            placeholderTextColor={colors.stone[300]}
          />
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
            placeholder="Invite code"
            maxLength={6}
            autoCapitalize="characters"
            style={[styles.input, styles.codeInput]}
            placeholderTextColor={colors.stone[300]}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={handleRejoin} disabled={!name.trim() || code.length < 6 || submitting} style={[styles.primaryButton, (!name.trim() || code.length < 6 || submitting) && styles.disabled]}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Rejoining...' : 'Rejoin'}</Text>
          </Pressable>
          <Pressable onPress={() => setStep('choice')} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      )}

      {step === 'waiting' && (
        <View style={styles.form}>
          <Text style={styles.subtitle}>Share this code with your partner:</Text>
          <Pressable onPress={copyCode} style={styles.codeBox}>
            <Text style={styles.codeDisplay}>{coupleCode}</Text>
            <Text style={styles.codeTap}>Tap to copy</Text>
          </Pressable>
          <View style={styles.waitingRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.waitingText}>Waiting for your partner to join...</Text>
          </View>
          <Pressable onPress={() => { clearProfile(); setStep('choice') }} style={styles.backButton}>
            <Text style={styles.backText}>Cancel</Text>
          </Pressable>
        </View>
      )}
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
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.stone[800], marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.stone[400], textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  form: { width: '100%', maxWidth: 300, alignItems: 'center' },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.warm[200],
    fontSize: 16,
    textAlign: 'center',
    color: colors.stone[800],
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  codeInput: {
    letterSpacing: 8,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.warm[500],
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.warm[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  secondaryButtonText: { color: colors.stone[700], fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 8 },
  backButton: { marginTop: 8, padding: 8 },
  backText: { color: colors.stone[400], fontSize: 14 },
  codeBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.warm[200],
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  codeDisplay: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: colors.warm[600],
    letterSpacing: 8,
  },
  codeTap: { fontSize: 12, color: colors.stone[400], marginTop: 8 },
  waitingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warm[400] },
  waitingText: { fontSize: 13, color: colors.stone[400] },
  rejoinLink: { fontSize: 13, color: colors.stone[400], marginTop: 8 },
})
