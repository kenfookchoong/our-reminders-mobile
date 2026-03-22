import { useState, useEffect, useCallback } from 'react'
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

export function usePushNotifications(profileId: string | null) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [permission, setPermission] = useState<'undetermined' | 'granted' | 'denied'>('undetermined')

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPermission(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined')
    })
  }, [])

  const registerForPush = useCallback(async () => {
    if (!profileId) return

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    setPermission(finalStatus === 'granted' ? 'granted' : 'denied')

    if (finalStatus !== 'granted') return

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    const projectId = EXPO_PROJECT_ID
    if (!projectId) {
      console.warn('EXPO_PROJECT_ID not set — push tokens will not work')
      return
    }

    const { data: tokenData } = await Notifications.getExpoPushTokenAsync({ projectId })
    const token = tokenData

    await supabase.from('expo_push_tokens').upsert(
      {
        profile_id: profileId,
        token,
        platform: Platform.OS,
      },
      { onConflict: 'token' }
    )

    setIsRegistered(true)
  }, [profileId])

  return { permission, isRegistered, registerForPush }
}
