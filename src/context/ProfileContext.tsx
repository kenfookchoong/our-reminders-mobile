import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Profile } from '../types'
import { PROFILES, getPartner } from '../lib/utils'

interface ProfileContextValue {
  profile: Profile | null
  partner: Profile | null
  loading: boolean
  pickProfile: (id: string) => void
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  partner: null,
  loading: true,
  pickProfile: () => {},
  clearProfile: () => {},
})

const STORAGE_KEY = 'our-reminders-profile'

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((id) => {
      if (id) {
        const found = PROFILES.find((p) => p.id === id)
        if (found) setProfile(found)
      }
      setLoading(false)
    })
  }, [])

  const pickProfile = useCallback((id: string) => {
    const p = PROFILES.find((pr) => pr.id === id)
    if (p) {
      AsyncStorage.setItem(STORAGE_KEY, id)
      setProfile(p)
    }
  }, [])

  const clearProfile = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY)
    setProfile(null)
  }, [])

  const partner = profile ? getPartner(profile.id) : null

  return (
    <ProfileContext.Provider value={{ profile, partner, loading, pickProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
