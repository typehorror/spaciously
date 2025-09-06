import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { resumeGame, selectGamePauseTime } from "./gameSlice"

export const PausedScreen = () => {
  const dispatch = useAppDispatch()
  const pauseTime = useAppSelector(selectGamePauseTime)

  return (
    <div className="loading-screen h-full w-full flex flex-col items-center justify-center space-y-3">
      <motion.p
        initial={{ opacity: 0, scale: 1.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        Game Paused
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <Button
          onClick={() => {
            dispatch(resumeGame({ offset: Date.now() - pauseTime }))
          }}
        >
          Resume Game
        </Button>
      </motion.div>
    </div>
  )
}
