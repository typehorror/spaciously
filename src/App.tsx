import { ThemeProvider } from "./components/theme-provider"
import { useAppSelector } from "./app/hooks"
import { selectGameStatus } from "./features/game/gameSlice"
import { IdleScreen } from "./features/game/IdleScreen"
import { PausedScreen } from "./features/game/pausedScreen"
import { Game } from "./Game"

export function App() {
  const gameStatus = useAppSelector(selectGameStatus)

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
    default:
      return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Game />
        </ThemeProvider>
      )
  }
}
