'use client'
 
import { motion } from 'framer-motion' 
import NotificationManager from '@/components/common/stater/NotificationManager'
import InstallPrompt from '@/components/common/stater/InstallPrompt'
import { Button } from '@/components/ui/button'
import { sendNotification } from '@/components/common/stater/actions'

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-purple-500/30 overflow-hidden relative flex flex-col items-center justify-center p-4">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-6xl text-center">Home Page</div>
        <Button onClick={()=>sendNotification("Send From Home Page")}>Send Notification</Button>
        <NotificationManager />
        <InstallPrompt />
      </motion.div>
    </div>
  )
}