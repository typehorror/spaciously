import { motion } from "motion/react"

export const LoadingScreen = () => {
  return (
    <div className="loading-screen h-full w-full flex items-center justify-center">
      <motion.p
        initial={{ opacity: 0, scale: 1.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 4, delay: 1 }}
      >
        Loading...
      </motion.p>
    </div>
  )
}
