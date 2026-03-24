import { View, Text, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import type { PurchasesPackage } from 'react-native-purchases'

interface PaywallModalProps {
  visible: boolean
  onClose: () => void
  offerings: PurchasesPackage[]
  onPurchase: (pkg: PurchasesPackage) => Promise<boolean>
  onRestore: () => Promise<boolean>
  timedCount: number
}

const FEATURES = [
  { icon: 'infinite-outline' as const, text: 'Unlimited reminders' },
  { icon: 'notifications-outline' as const, text: 'Auto-notifications at due time' },
  { icon: 'hand-left-outline' as const, text: 'Unlimited nudges' },
  { icon: 'heart-outline' as const, text: 'Support a small developer' },
]

export default function PaywallModal({
  visible,
  onClose,
  offerings,
  onPurchase,
  onRestore,
  timedCount,
}: PaywallModalProps) {
  const [purchasing, setPurchasing] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true)
    const success = await onPurchase(pkg)
    setPurchasing(false)
    if (success) onClose()
  }

  const handleRestore = async () => {
    setRestoring(true)
    const success = await onRestore()
    setRestoring(false)
    if (success) onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.stone[400]} />
          </Pressable>

          {/* Header */}
          <Text style={styles.emoji}>💝</Text>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            You've used {timedCount}/5 free timed reminders.{'\n'}
            Go premium for unlimited access!
          </Text>

          {/* Features */}
          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <Ionicons name={f.icon} size={20} color={colors.warm[500]} />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Product buttons */}
          <View style={styles.products}>
            {offerings.map((pkg) => (
              <Pressable
                key={pkg.identifier}
                onPress={() => handlePurchase(pkg)}
                disabled={purchasing}
                style={({ pressed }) => [
                  styles.productButton,
                  pkg.packageType === 'ANNUAL' && styles.productHighlight,
                  pressed && { opacity: 0.8 },
                ]}
              >
                {purchasing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={[
                      styles.productTitle,
                      pkg.packageType === 'ANNUAL' && styles.productTitleHighlight,
                    ]}>
                      {pkg.product.title || pkg.identifier}
                    </Text>
                    <Text style={[
                      styles.productPrice,
                      pkg.packageType === 'ANNUAL' && styles.productPriceHighlight,
                    ]}>
                      {pkg.product.priceString}
                    </Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>

          {/* No offerings fallback */}
          {offerings.length === 0 && (
            <View style={styles.fallback}>
              <Text style={styles.fallbackText}>
                Premium subscriptions are being set up.{'\n'}Check back soon!
              </Text>
            </View>
          )}

          {/* Restore */}
          <Pressable onPress={handleRestore} disabled={restoring} style={styles.restoreButton}>
            {restoring ? (
              <ActivityIndicator size="small" color={colors.stone[400]} />
            ) : (
              <Text style={styles.restoreText}>Restore purchases</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.warm[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.stone[800],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.stone[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  features: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 15,
    color: colors.stone[700],
  },
  products: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  productButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.warm[200],
  },
  productHighlight: {
    backgroundColor: colors.warm[500],
    borderColor: colors.warm[500],
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.stone[700],
  },
  productTitleHighlight: {
    color: colors.white,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warm[500],
  },
  productPriceHighlight: {
    color: colors.white,
  },
  fallback: {
    paddingVertical: 20,
  },
  fallbackText: {
    fontSize: 14,
    color: colors.stone[400],
    textAlign: 'center',
    lineHeight: 20,
  },
  restoreButton: {
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 13,
    color: colors.stone[400],
    textDecorationLine: 'underline',
  },
})
