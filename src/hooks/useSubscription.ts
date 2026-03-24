import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases'

const REVENUECAT_API_KEY = 'test_xPJDIoTTPQyTpWzTrSzymsSKiyD'
const ENTITLEMENT_ID = 'Our Reminders Pro'

let initialized = false

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false)
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
    const entitlement = info.entitlements.active[ENTITLEMENT_ID]
    setIsPremium(!!entitlement)
  }

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

  return { isPremium, offerings, purchasePackage, restorePurchases, loading }
}
