import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ThemeProvider } from "./components/theme-provider"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { pauseGame, selectGameStatus } from "./features/game/gameSlice"
import { IdleScreen } from "./features/game/IdleScreen"
import { PausedScreen } from "./features/game/pausedScreen"
import { HexGridCanvas } from "./components/HexGridCanvas"
import { CellInformation } from "./components/CellInformation"
import { GameLoop } from "./features/game/GameLoop"
import { getCellsByPlanetId } from "./features/cell/cellSlice"
import { getCurrentPlanetId } from "./features/planet/planetSlice"

export function App() {
  const gameStatus = useAppSelector(selectGameStatus)
  const currentPlanetId = useAppSelector(getCurrentPlanetId)
  const cells = useAppSelector(state =>
    getCellsByPlanetId(state, currentPlanetId),
  )
  const dispatch = useAppDispatch()

  switch (gameStatus) {
    case "idle":
      return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <IdleScreen />
        </ThemeProvider>
      )
    case "paused":
      return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <PausedScreen />
        </ThemeProvider>
      )
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <GameLoop />
      <div className="flex h-full flex-col">
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
        <div className="shrink-0 py-2 px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(pauseGame(Date.now()))}
          >
            Pause Game
          </Button>
        </div>
      </div>
    </ThemeProvider>
  )
}
