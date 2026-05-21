/*
 * BloomDebugOverlay
 *
 * Dev-only HUD panel that lists every cell currently carrying infestation
 * and its value. Fixed-positioned at the bottom-left of the viewport so it
 * stays visible while the player works the hex grid.
 *
 * The Bloom is invisible on the hex map itself until slice #10 lands the
 * proper visual layer; until then this overlay is the way to verify the
 * simulator is doing work. Hidden when no cell is infested so it doesn't
 * occlude the play area during normal play.
 */
import { useAppSelector } from "@/app/hooks"

export const BloomDebugOverlay = () => {
  const infestation = useAppSelector(state => state.bloom.infestation)
  const entries = Object.entries(infestation).filter(([, value]) => value > 0)

  if (entries.length === 0) return null

  return (
    <div className="fixed bottom-3 left-3 z-50 pointer-events-none">
      <div className="rounded-md bg-black/70 ring-1 ring-fuchsia-400/30 px-3 py-2 font-mono text-[10px] text-fuchsia-200/90 backdrop-blur">
        <div className="uppercase tracking-[0.2em] text-fuchsia-300/70 mb-1">
          Bloom · {entries.length} infested
        </div>
        <ul className="space-y-0.5 max-h-48 overflow-auto pr-1">
          {entries
            .sort(([, a], [, b]) => b - a)
            .map(([cellId, value]) => (
              <li key={cellId} className="tabular-nums">
                <span className="text-fuchsia-300/70">{cellId}</span>
                {" · "}
                <span className="text-fuchsia-100">{value.toFixed(2)}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
