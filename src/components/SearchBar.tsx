import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={16} color={colors.stone[400]} style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search reminders..."
          placeholderTextColor={colors.stone[400]}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
        />
        {value ? (
          <Pressable onPress={() => onChange('')} style={styles.clearButton} hitSlop={8}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm[100],
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.stone[700],
    paddingVertical: 10,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.stone[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
})
