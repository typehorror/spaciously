/**
 * Game
 *
 * Top-level game shell: renders the in-game HUD ("ship console" style header)
 * and the resizable board/inspector split below.
 *
 * The header treats the play area as a ship's command console: a thin cyan
 * accent line up top, a subtle radial glow in the panel surface, and three
 * left-to-right zones — identity (logo + console label + planet name),
 * status (game clock), live state (resource ribbon), and controls
 * (active tasks, pause/resume, research, settings).
 *
 * The handful of header atoms below (ConsoleIdentity, GameClock, PauseToggle,
 * ActiveTasksBadge, SettingsMenu) live inline because they all draw from the
 * same selectors and are only assembled here — extracting them would add
 * import noise without making them reusable elsewhere.
 */
import { Button } from "@/components/ui/button"
import ResourceBar from "@/components/ResourceBar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import {
  pauseGame,
  resumeGame,
  selectGameStatus,
  selectGameStartTime,
  selectGamePauseTime,
} from "./features/game/gameSlice"
import { CellInformation } from "./components/CellInformation"
import { selectCellsByPlanetId } from "./features/cell/cellSlice"
import {
  selectCurrentPlanetId,
  selectPlanetById,
} from "./features/planet/planetSlice"
import PlanetBoard from "./components/PlanetBoard"
import { ResearchButton } from "./components/ResearchButton"
import { TaskManager } from "./features/task/TaskManager"
import { ProductionTicker } from "./features/production/ProductionTicker"
import { BloomTicker } from "./features/bloom/BloomTicker"
import { BloomDebugOverlay } from "./features/bloom/BloomDebugOverlay"
import { selectAllActiveTasks } from "./features/task/taskSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip"
import {
  AtomIcon,
  ClockIcon,
  ListChecksIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "./components/theme-provider"

// ─── Shared header atoms ────────────────────────────────────────────────────

// 1 game day = 5 real minutes; arbitrary but small enough that the day
// counter actually ticks during a play session.
const GAME_SECONDS_PER_DAY = 300

const useGameClock = () => {
  const status = useAppSelector(selectGameStatus)
  const startTime = useAppSelector(selectGameStartTime)
  const pauseTime = useAppSelector(selectGamePauseTime)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
    }, 200)
    return () => {
      clearInterval(id)
    }
  }, [])

  // When paused we freeze elapsed at the moment of pausing so the clock
  // doesn't visibly drift while the rest of the world is held.
  const reference = status === "paused" ? pauseTime : now
  const elapsedSeconds = Math.max(0, Math.floor((reference - startTime) / 1000))
  const day = Math.floor(elapsedSeconds / GAME_SECONDS_PER_DAY) + 1
  const intoDay = elapsedSeconds % GAME_SECONDS_PER_DAY
  const hh = String(Math.floor(intoDay / 60)).padStart(2, "0")
  const mm = String(intoDay % 60).padStart(2, "0")
  return { day, time: `${hh}:${mm}`, isPaused: status === "paused" }
}

const ConsoleIdentity = () => {
  const planetId = useAppSelector(selectCurrentPlanetId)
  const planet = useAppSelector(state => selectPlanetById(state, planetId))
  return (
    <div className="flex items-center gap-3">
      <div className="grid place-items-center w-8 h-8 rounded-sm bg-cyan-400/10 ring-1 ring-cyan-400/30 shrink-0">
        <AtomIcon className="w-4 h-4 text-cyan-300" />
      </div>
      <div className="leading-tight hidden lg:block">
        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70 hidden xl:block">
          ◢ Console
        </div>
        <div className="text-sm font-semibold text-white/95 tracking-wide whitespace-nowrap">
          {planet?.name ?? "—"}
        </div>
      </div>
    </div>
  )
}

const GameClock = () => {
  const { day, time, isPaused } = useGameClock()
  return (
    <div className="hidden lg:flex items-center gap-2 tabular-nums text-white/80 text-sm whitespace-nowrap">
      <ClockIcon className="w-4 h-4 shrink-0" />
      <span>
        <span className="hidden xl:inline">Day {day} · </span>
        {time}
      </span>
      {isPaused && (
        <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-sm bg-amber-400/15 text-amber-300 text-[10px] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
          Paused
        </span>
      )}
    </div>
  )
}

const PauseToggle = () => {
  const status = useAppSelector(selectGameStatus)
  const startTime = useAppSelector(selectGameStartTime)
  const pauseTime = useAppSelector(selectGamePauseTime)
  const dispatch = useAppDispatch()
  const isPaused = status === "paused"
  const label = isPaused ? "Resume" : "Pause"
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      onClick={() => {
        if (isPaused) {
          dispatch(resumeGame({ offset: Date.now() - pauseTime }))
        } else {
          dispatch(pauseGame(Date.now()))
        }
      }}
      disabled={status === "idle" && startTime === 0}
    >
      {isPaused ? (
        <PlayIcon className="w-4 h-4" />
      ) : (
        <PauseIcon className="w-4 h-4" />
      )}
      <span className="hidden md:inline">{label}</span>
    </Button>
  )
}

const ActiveTasksBadge = () => {
  const tasks = useAppSelector(selectAllActiveTasks)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 ring-1 ring-white/10 text-xs text-white/80 tabular-nums">
          <ListChecksIcon className="w-3.5 h-3.5 text-emerald-300" />
          <span>{tasks.length}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-mono text-xs">
        {tasks.length === 0
          ? "No active tasks"
          : `${tasks.length.toString()} active task${tasks.length === 1 ? "" : "s"}`}
      </TooltipContent>
    </Tooltip>
  )
}

const SettingsMenu = () => {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Save (soon)</DropdownMenuItem>
        <DropdownMenuItem disabled>Audio (soon)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Game shell ────────────────────────────────────────────────────────────

export function Game() {
  const currentPlanetId = useAppSelector(selectCurrentPlanetId)
  const cells = useAppSelector(state =>
    selectCellsByPlanetId(state, currentPlanetId),
  )

  return (
    <>
      <TaskManager />
      <ProductionTicker />
      <BloomTicker />
      <BloomDebugOverlay />
      <div className="flex h-full flex-col">
        <header className="shrink-0 relative">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
            aria-hidden
          />
          <div className="flex items-center justify-between gap-2 md:gap-4 px-3 md:px-5 py-2.5 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_60%)] bg-black/40 border-b border-cyan-400/15">
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <ConsoleIdentity />
              <div
                className="hidden lg:block h-7 w-px bg-cyan-400/20 shrink-0"
                aria-hidden
              />
              <GameClock />
            </div>
            <ResourceBar planetId={currentPlanetId} />
            <div className="flex items-center gap-1 md:gap-2">
              <ActiveTasksBadge />
              <PauseToggle />
              <ResearchButton />
              <SettingsMenu />
            </div>
          </div>
        </header>

        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 border md:min-w-[450px]"
        >
          <ResizablePanel defaultSize={70}>
            <PlanetBoard cells={cells} />
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
