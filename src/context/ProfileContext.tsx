import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { SUPABASE_URL } from '../lib/config'
import type { Profile } from '../types'

interface ProfileContextValue {
  profile: Profile | null
  partner: Profile | null
  coupleCode: string | null
  loading: boolean
  setupCouple: (name: string) => Promise<string>
  joinCouple: (name: string, code: string) => Promise<boolean>
  rejoinCouple: (name: string, code: string) => Promise<boolean>
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  partner: null,
  coupleCode: null,
  loading: true,
  setupCouple: async () => '',
  joinCouple: async () => false,
  rejoinCouple: async () => false,
  clearProfile: () => {},
})

const STORAGE_KEY = 'our-reminders-profile'
const FUNCTIONS_URL = SUPABASE_URL + '/functions/v1'

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [partner, setPartner] = useState<Profile | null>(null)
  const [coupleCode, setCoupleCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(async (savedId) => {
      if (!savedId) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, couple_id')
        .eq('id', savedId)
        .single()

      if (!profileData) {
        await AsyncStorage.removeItem(STORAGE_KEY)
        setLoading(false)
        return
      }
      setProfile(profileData)

      // Fetch couple code
      const { data: coupleData } = await supabase
        .from('couples')
        .select('code')
        .eq('id', profileData.couple_id)
        .single()
      if (coupleData) setCoupleCode(coupleData.code)

      // Fetch partner
      const { data: partnerData } = await supabase
        .from('profiles')
        .select('id, name, couple_id')
        .eq('couple_id', profileData.couple_id)
        .neq('id', savedId)
        .single()
      if (partnerData) setPartner(partnerData)

      setLoading(false)
    })
  }, [])

  const setupCouple = useCallback(async (name: string): Promise<string> => {
    const res = await fetch(`${FUNCTIONS_URL}/join-couple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    await AsyncStorage.setItem(STORAGE_KEY, data.profileId)
    setProfile({ id: data.profileId, name, couple_id: data.coupleId })
    setCoupleCode(data.coupleCode)
    return data.coupleCode
  }, [])

  const joinCouple = useCallback(async (name: string, code: string): Promise<boolean> => {
    const res = await fetch(`${FUNCTIONS_URL}/join-couple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', name, code }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    await AsyncStorage.setItem(STORAGE_KEY, data.profileId)

    const { data: fullProfile } = await supabase
      .from('profiles')
      .select('id, name, couple_id')
      .eq('id', data.profileId)
      .single()

    if (fullProfile) {
      setProfile(fullProfile)
      if (data.partnerId) {
        setPartner({ id: data.partnerId, name: data.partnerName, couple_id: fullProfile.couple_id })
      }
    }
    return true
  }, [])

  const rejoinCouple = useCallback(async (name: string, code: string): Promise<boolean> => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/join-couple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rejoin', name, code }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    await AsyncStorage.setItem(STORAGE_KEY, data.profileId)

    const { data: fullProfile } = await supabase
      .from('profiles')
      .select('id, name, couple_id')
      .eq('id', data.profileId)
      .single()

    if (fullProfile) {
      setProfile(fullProfile)
      setCoupleCode(code.toUpperCase())

      // Fetch partner regardless of their left_at status
      if (data.partnerId) {
        setPartner({ id: data.partnerId, name: data.partnerName, couple_id: fullProfile.couple_id })
      } else {
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('id, name, couple_id')
          .eq('couple_id', fullProfile.couple_id)
          .neq('id', fullProfile.id)
          .single()
        if (partnerData) setPartner(partnerData)
      }
    }
    return true
  }, [])

  const clearProfile = useCallback(() => {
    // Tell backend this user left
    if (profile?.id) {
      fetch(`${SUPABASE_URL}/functions/v1/join-couple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave', profileId: profile.id }),
      }).catch(() => {})
    }
    AsyncStorage.removeItem(STORAGE_KEY)
    setProfile(null)
    setPartner(null)
    setCoupleCode(null)
  }, [profile])

  // Listen for partner joining
  useEffect(() => {
    if (!profile || partner) return

    const channel = supabase
      .channel('partner-join')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          const newProfile = payload.new as Profile
          if (newProfile.couple_id === profile.couple_id && newProfile.id !== profile.id) {
            setPartner(newProfile)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile, partner])

  return (
    <ProfileContext.Provider value={{ profile, partner, coupleCode, loading, setupCouple, joinCouple, rejoinCouple, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
