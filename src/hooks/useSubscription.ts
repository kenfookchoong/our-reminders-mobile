import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases'

const REVENUECAT_API_KEY = 'test_xPJDIoTTPQyTpWzTrSzymsSKiyD'
const ENTITLEMENT_ID = 'Our Reminders Pro'
const DEBUG_PREMIUM = __DEV__ // Auto-true in dev, false in production

let initialized = false

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(DEBUG_PREMIUM)
  const [debugOverride, setDebugOverride] = useState(DEBUG_PREMIUM)
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        if (!initialized) {
          Purchases.configure({
            apiKey: REVENUECAT_API_KEY,
          })
          initialized = true
        }

        const customerInfo = await Purchases.getCustomerInfo()
        checkPremium(customerInfo)

        const offeringsData = await Purchases.getOfferings()
        if (offeringsData.current?.availablePackages) {
          setOfferings(offeringsData.current.availablePackages)
        }
      } catch (e) {
        console.log('[Subscription] Init error:', e)
      } finally {
        setLoading(false)
      }
    }

    init()

    // Listen for subscription changes
    const listener = (info: CustomerInfo) => checkPremium(info)
    Purchases.addCustomerInfoUpdateListener(listener)

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener)
    }
  }, [])

  const checkPremium = (info: CustomerInfo) => {
    if (debugOverride) return // Skip RevenueCat check in debug mode
    const entitlement = info.entitlements.active[ENTITLEMENT_ID]
    setIsPremium(!!entitlement)
  }

  // Debug toggle — only works in dev builds
  const toggleDebugPremium = useCallback(() => {
    if (!__DEV__) return
    setDebugOverride((prev) => !prev)
    setIsPremium((prev) => !prev)
    console.log('[Subscription] Debug premium toggled to:', !isPremium)
  }, [isPremium])

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      checkPremium(customerInfo)
      return true
    } catch (e: any) {
      if (e.userCancelled) return false
      console.log('[Subscription] Purchase error:', e)
      return false
    }
  }, [])

  const restorePurchases = useCallback(async () => {
    try {
      const customerInfo = await Purchases.restorePurchases()
      checkPremium(customerInfo)
      return !!customerInfo.entitlements.active[ENTITLEMENT_ID]
    } catch (e) {
      console.log('[Subscription] Restore error:', e)
      return false
    }
  }, [])

  return { isPremium, offerings, purchasePackage, restorePurchases, toggleDebugPremium, loading }
}
