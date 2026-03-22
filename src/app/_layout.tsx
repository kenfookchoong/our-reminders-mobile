import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { ProfileProvider } from '../context/ProfileContext'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
        <StatusBar style="dark" />
        <Slot />
      </ProfileProvider>
    </GestureHandlerRootView>
  )
}
