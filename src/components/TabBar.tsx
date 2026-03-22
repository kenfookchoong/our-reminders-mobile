import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export type TabId = 'mine' | 'theirs' | 'all'

interface TabBarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'mine', label: 'Mine' },
  { id: 'theirs', label: 'For Them' },
  { id: 'all', label: 'All' },
]

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onChange(tab.id)}
          style={[styles.tab, active === tab.id && styles.activeTab]}
        >
          <Text style={[styles.tabText, active === tab.id && styles.activeTabText]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.warm[100],
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.warm[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.stone[500],
  },
  activeTabText: {
    color: colors.white,
  },
})
