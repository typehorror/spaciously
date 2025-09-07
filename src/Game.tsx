import { Button } from "@/components/ui/button"
import ResourceBar from "@/components/ResourceBar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { pauseGame } from "./features/game/gameSlice"
import { HexGridCanvas } from "./components/HexGridCanvas"
import { CellInformation } from "./components/CellInformation"
import { GameLoop } from "./features/game/GameLoop"
import { getCellsByPlanetId } from "./features/cell/cellSlice"
import { getCurrentPlanetId } from "./features/planet/planetSlice"

export function Game() {
  const currentPlanetId = useAppSelector(getCurrentPlanetId)
  const cells = useAppSelector(state =>
    getCellsByPlanetId(state, currentPlanetId),
  )
  const dispatch = useAppDispatch()

  return (
    <>
      <GameLoop />
      <div className="flex h-full flex-col">
        <div className="shrink-0 py-2 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(pauseGame(Date.now()))}
            >
              Pause Game
            </Button>
          </div>
          <ResourceBar planetId={currentPlanetId} />
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 border md:min-w-[450px]"
        >
          <ResizablePanel defaultSize={70}>
            <HexGridCanvas cells={cells} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30}>
            <CellInformation />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}
