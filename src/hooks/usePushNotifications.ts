import { useState, useEffect, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { supabase } from '../lib/supabase'
import { EXPO_PROJECT_ID } from '../lib/config'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function doRegister(profileId: string): Promise<boolean> {
  console.log('[Push] Starting registration for', profileId)

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    console.log('[Push] Requesting permission...')
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  console.log('[Push] Permission status:', finalStatus)
  if (finalStatus !== 'granted') return false

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  if (!EXPO_PROJECT_ID) {
    console.warn('[Push] EXPO_PROJECT_ID not set')
    return false
  }

  console.log('[Push] Getting Expo push token...')
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: EXPO_PROJECT_ID,
  })
  console.log('[Push] Token:', token)

  const { error } = await supabase.from('expo_push_tokens').upsert(
    { profile_id: profileId, token },
    { onConflict: 'token' }
  )

  if (error) {
    console.error('[Push] Supabase upsert error:', error)
    return false
  }

  console.log('[Push] Token registered successfully!')
  return true
}

export function usePushNotifications(profileId: string | null) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [permission, setPermission] = useState<'undetermined' | 'granted' | 'denied'>('undetermined')
  const registering = useRef(false)

  // Auto-register on mount if permission already granted
  useEffect(() => {
    console.log('[Push] useEffect fired, profileId:', profileId, 'isRegistered:', isRegistered)
    if (!profileId || isRegistered || registering.current) return

    ;(async () => {
      try {
        console.log('[Push] Checking permissions...')
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        console.log('[Push] Permission status:', existingStatus)

        if (existingStatus === 'granted') {
          // Already granted — register token
          registering.current = true
          const success = await doRegister(profileId)
          if (success) setIsRegistered(true)
          setPermission('granted')
          registering.current = false
        } else {
          // Not granted — always ask (works for undetermined AND denied on Android)
          console.log('[Push] Requesting permission...')
          const { status } = await Notifications.requestPermissionsAsync()
          console.log('[Push] Request result:', status)
          const mapped = status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined'
          setPermission(mapped)
          if (mapped === 'granted') {
            registering.current = true
            const success = await doRegister(profileId)
            if (success) setIsRegistered(true)
            registering.current = false
          }
        }
      } catch (err) {
        console.error('[Push] Error in auto-register:', err)
      }
    })()
  }, [profileId, isRegistered])

  const registerForPush = useCallback(async () => {
    if (!profileId || registering.current) return
    registering.current = true

    const success = await doRegister(profileId)
    setPermission(success ? 'granted' : 'denied')
    if (success) setIsRegistered(true)
    registering.current = false
  }, [profileId])

  return { permission, isRegistered, registerForPush }
}
