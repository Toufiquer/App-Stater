'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Share, 
  PlusSquare, 
  Download 
} from 'lucide-react'

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = () => {
    if (!installPrompt) return
    installPrompt.prompt()
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null)
      }
    })
  }

  if (isStandalone) return null

  return (
    <div className="bg-neutral-950/50 border-t border-white/5 p-6">
      <AnimatePresence mode='wait'>
        {(installPrompt || isIOS) ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-neutral-800 rounded-lg">
                <Smartphone className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Install App</h3>
                <p className="text-xs text-neutral-400">Add to home screen for better experience</p>
              </div>
              
              {installPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="text-xs bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
              )}
            </div>

            {isIOS && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-neutral-800/50 rounded-xl p-4 text-sm text-neutral-300 border border-white/5"
              >
                <p className="flex items-center flex-wrap gap-1.5 leading-relaxed">
                  Tap the <Share className="w-4 h-4 mx-1 text-blue-400" /> share button
                  and select <span className="inline-flex items-center gap-1 bg-neutral-700 px-1.5 py-0.5 rounded text-white text-xs font-medium"><PlusSquare className="w-3 h-3" /> Add to Home Screen</span>
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-neutral-600 font-mono">Running in Browser Mode</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}