'use server'

import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:toufiquer.0@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushSubscriptionJSON {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

let subscription: PushSubscriptionJSON | null = null

export async function subscribeUser(sub: PushSubscriptionJSON) {
  subscription = sub
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'New Alert',
        body: message,
        icon: '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to send notification' }
  }
}