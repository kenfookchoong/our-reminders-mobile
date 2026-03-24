import { useState, useEffect, useCallback } from 'react'
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases'
import { supabase } from '../lib/supabase'

const REVENUECAT_API_KEY = 'test_xPJDIoTTPQyTpWzTrSzymsSKiyD'
const ENTITLEMENT_ID = 'Our Reminders Pro'
const DEBUG_PREMIUM = __DEV__

let initialized = false

export function useSubscription(coupleId: string | null = null) {
  const [isPremium, setIsPremium] = useState(DEBUG_PREMIUM)
  const [debugOverride, setDebugOverride] = useState(DEBUG_PREMIUM)
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        if (!initialized) {
          Purchases.configure({ apiKey: REVENUECAT_API_KEY })
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

    const listener = (info: CustomerInfo) => checkPremium(info)
    Purchases.addCustomerInfoUpdateListener(listener)
    return () => { Purchases.removeCustomerInfoUpdateListener(listener) }
  }, [])

  // Also check couple's is_premium flag from DB
  useEffect(() => {
    if (!coupleId || debugOverride) return
    supabase
      .from('couples')
      .select('is_premium')
      .eq('id', coupleId)
      .single()
      .then(({ data }) => {
        if (data?.is_premium) setIsPremium(true)
      })
  }, [coupleId, debugOverride])

  const checkPremium = (info: CustomerInfo) => {
    if (debugOverride) return
    const entitlement = info.entitlements.active[ENTITLEMENT_ID]
    setIsPremium(!!entitlement)
  }

  const toggleDebugPremium = useCallback(() => {
    if (!__DEV__) return
    setDebugOverride((prev) => !prev)
    setIsPremium((prev) => !prev)
  }, [])

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

  const redeemPromoCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!coupleId) return { success: false, error: 'Not in a couple' }

    // Check if code exists and has uses left
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('id, max_uses, used_count')
      .eq('code', code.trim().toUpperCase())
      .single()

    if (!promo) return { success: false, error: 'Invalid promo code' }
    if (promo.used_count >= promo.max_uses) return { success: false, error: 'This code has been fully redeemed' }

    // Set couple as premium
    await supabase.from('couples').update({ is_premium: true }).eq('id', coupleId)

    // Increment used_count
    await supabase.from('promo_codes').update({ used_count: promo.used_count + 1 }).eq('id', promo.id)

    setIsPremium(true)
    return { success: true }
  }, [coupleId])

  return { isPremium, offerings, purchasePackage, restorePurchases, toggleDebugPremium, redeemPromoCode, loading }
}
