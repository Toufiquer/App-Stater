'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  BellRing, 
  Send, 
  Loader2, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  async function subscribeToPush() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
      setFeedback({ type: 'success', msg: 'Subscribed successfully!' })
    } catch (error) {
      console.error(error)
      setFeedback({ type: 'error', msg: 'Failed to subscribe.' })
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    setLoading(true)
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
      setFeedback({ type: 'success', msg: 'Unsubscribed successfully.' })
    } catch (error) {
      console.error(error)
      setFeedback({ type: 'error', msg: 'Failed to unsubscribe.' })
    } finally {
      setLoading(false)
    }
  }

  async function sendTestNotification() {
    if (!subscription || !message) return
    setLoading(true)
    try {
      await sendNotification(message)
      setMessage('')
      setFeedback({ type: 'success', msg: 'Notification sent!' })
    } catch (error) {
      console.error(error)
      setFeedback({ type: 'error', msg: 'Failed to send.' })
    } finally {
      setLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  if (!isSupported) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <p>Push notifications are not supported in this browser.</p>
      </div>
    )
  }

  return (
    <div className="p-8 pb-6">
      <div className="flex items-center gap-4 mb-8">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner transition-all duration-500",
          subscription ? "bg-gradient-to-br from-green-400 to-emerald-600" : "bg-neutral-800"
        )}>
          {subscription ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6 text-neutral-400" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notification Hub</h1>
          <p className="text-neutral-400 text-sm">Real-time updates & alerts</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Card */}
        <div className="bg-neutral-800/40 rounded-2xl p-6 border border-white/5 transition-all duration-300 hover:bg-neutral-800/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-neutral-300">
              Status
            </span>
            <span className={cn(
              "text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider",
              subscription ? "bg-green-500/20 text-green-400" : "bg-neutral-700 text-neutral-400"
            )}>
              {subscription ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <button
            onClick={subscription ? unsubscribeFromPush : subscribeToPush}
            disabled={loading}
            className={cn(
              "w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
              loading ? "cursor-wait opacity-70" : "",
              subscription 
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" 
                : "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : subscription ? (
              "Unsubscribe Device"
            ) : (
              "Enable Notifications"
            )}
          </button>
        </div>

        {/* Test Message Area */}
        <AnimatePresence mode="wait">
          {subscription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider pl-1">
                  Test Connection
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a test message..."
                    className="flex-1 bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-neutral-600 text-white"
                  />
                  <button
                    onClick={sendTestNotification}
                    disabled={loading || !message}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Feedback Message */}
                <div className="h-6 flex items-center">
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "text-xs flex items-center gap-1.5",
                          feedback.type === 'success' ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {feedback.msg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}