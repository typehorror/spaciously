import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { selectPlayerName, updatePlayerName } from "../player/PlayerSlice"
import { startGame } from "./gameSlice"
import { addCells } from "../cell/cellSlice"
import { cellGenerator } from "../cell/cellGenerator"
import { ResourceName } from "../cell/types"
import { useEffect, useRef, useState } from "react"
import { addBuilding } from "../building/buildingSlice"
import { getColonyLander } from "../building/buildings"
import { getCurrentPlanetId } from "../planet/planetSlice"

const FIRST_LANDING_RESOURCES: Record<ResourceName, number> = {
  [ResourceName.ORE]: 0,
  [ResourceName.GAS]: 0,
  [ResourceName.CRYSTALS]: 0,
  [ResourceName.BIOMASS]: 0,
  [ResourceName.PLASMA]: 0,
  [ResourceName.ISOTOPES]: 0,
}

export const IdleScreen = () => {
  const playerName = useAppSelector(selectPlayerName)
  const planetId = useAppSelector(getCurrentPlanetId)
  const dispatch = useAppDispatch()
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(playerName)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const startNewGame = () => {
    const cells = cellGenerator(25, 20)
    const startCell = cells.find(cell => cell.q === 0 && cell.r === 0)
    if (!startCell) return
    startCell.resources = FIRST_LANDING_RESOURCES
    startCell.state = "claimed"
    dispatch(
      addBuilding({
        building: getColonyLander(),
        planetId,
        coord: { q: 0, r: 0 },
      }),
    )
    dispatch(updatePlayerName(name.trim()))
    dispatch(addCells({ cells, planetId: 1 }))
    dispatch(startGame())
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        startNewGame()
      }}
      className="loading-screen h-full w-full flex flex-col items-center justify-center space-y-3"
    >
      <motion.p
        initial={{ opacity: 0, scale: 1.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <span className="opacity-80">Welcome</span>
        <input
          type="text"
          value={name}
          ref={inputRef}
          autoFocus
          onChange={e => {
            setName(e.target.value)
          }}
          autoCapitalize="words"
          className="focus:border-none px-1 outline-none focus:outline-none font-semibold"
        />
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <Button type="submit" disabled={name.trim().length === 0}>
          Start Game
        </Button>
      </motion.div>
    </form>
  )
}
