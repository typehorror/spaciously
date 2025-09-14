import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectCellByCoords } from "@/features/cell/cellSlice"
import { getCellId } from "@/features/cell/utils"
import {
  selectCurrentPlanetId,
  selectFocusedCellCoord,
  setFocusedCell,
} from "@/features/planet/planetSlice"
import { useRef, useEffect, useState } from "react"
import { Stage, Layer, Line } from "react-konva"

export type HexCell = {
  q: number // axial coordinate
  r: number // axial coordinate
  state: "claimed" | "unclaimed"
}

type HexGridCanvasProps = {
  cells: HexCell[]
}

// Hexagon math helpers
const HEX_SIZE = 40 // px, radius of hex
function hexToPixel(
  q: number,
  r: number,
  centerX: number,
  centerY: number,
  zoom = 1,
) {
  const x = HEX_SIZE * zoom * Math.sqrt(3) * (q + r / 2) + centerX
  const y = HEX_SIZE * zoom * 1.5 * r + centerY
  return { x, y }
}

function polygonCorners(x: number, y: number, size: number) {
  const corners = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    corners.push({
      x: x + size * Math.cos(angle),
      y: y + size * Math.sin(angle),
    })
  }
  return corners
}

const borderColors: Record<string, string> = {
  claimed: "oklch(50% 0.134 242.749)",
  unclaimed: "#bbbbbb88",
  focused: "oklch(82.8% 0.111 230.318)",
}

// Responsive full-size canvas using Konva
export const HexGridCanvas: React.FC<HexGridCanvasProps> = ({ cells }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({
    width: 600,
    height: 400,
  })
  const [cursor, setCursor] = useState("default")
  const currentPlanetId = useAppSelector(selectCurrentPlanetId)
  const focusedCellCoord = useAppSelector(selectFocusedCellCoord)
  const focusedCell = useAppSelector(state =>
    selectCellByCoords(state, focusedCellCoord, currentPlanetId),
  )
  const dispatch = useAppDispatch()

  // Resize observer for flex container
  useEffect(() => {
    if (!containerRef.current) return
    const handleResize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    handleResize()
    const observer = new window.ResizeObserver(handleResize)
    observer.observe(containerRef.current)
    return () => {
      observer.disconnect()
    }
  }, [])

  // Center grid
  const centerX = size.width / 2
  const centerY = size.height / 2

  // Pan/scroll state
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointer, setLastPointer] = useState<{
    x: number
    y: number
  } | null>(null)

  // Calculate map bounds to constrain panning
  const getMapBounds = () => {
    if (cells.length === 0)
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity

    cells.forEach(cell => {
      const { x, y } = hexToPixel(cell.q, cell.r, 0, 0, zoom)
      const hexRadius = HEX_SIZE * zoom
      minX = Math.min(minX, x - hexRadius)
      maxX = Math.max(maxX, x + hexRadius)
      minY = Math.min(minY, y - hexRadius)
      maxY = Math.max(maxY, y + hexRadius)
    })

    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  const constrainPan = (newPan: { x: number; y: number }) => {
    const bounds = getMapBounds()

    const maxX = (bounds.width * zoom) / 2
    const maxY = (bounds.height * zoom) / 2

    return {
      x: Math.max(-maxX, Math.min(maxX, newPan.x)),
      y: Math.max(-maxY, Math.min(maxY, newPan.y)),
    }
  }

  // Hover state for each cell (by index)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  // Animated fill alpha for hover effect
  const [hoverAlpha, setHoverAlpha] = useState(0)

  return (
    <div ref={containerRef} className="h-full w-full flex flex-1">
      <Stage
        width={size.width}
        height={size.height}
        style={{
          width: "100%",
          height: "100%",
          cursor,
        }}
        onMouseDown={e => {
          const stage = e.target.getStage()
          const pointer = stage?.getPointerPosition()
          if (pointer) {
            setIsDragging(true)
            setLastPointer({ x: pointer.x, y: pointer.y })
          }
        }}
        onMouseMove={e => {
          if (!isDragging || !lastPointer) return
          setCursor("grabbing")
          const stage = e.target.getStage()
          const pointer = stage?.getPointerPosition()
          if (pointer) {
            const deltaX = pointer.x - lastPointer.x
            const deltaY = pointer.y - lastPointer.y
            const newPan = {
              x: pan.x + deltaX,
              y: pan.y + deltaY,
            }
            setPan(constrainPan(newPan))
            setLastPointer({ x: pointer.x, y: pointer.y })
          }
        }}
        onMouseUp={() => {
          setIsDragging(false)
          setLastPointer(null)
          setCursor("default")
        }}
        onMouseLeave={() => {
          setIsDragging(false)
          setLastPointer(null)
        }}
        onMouseOver={() => {
          if (hoveredIdx !== null) {
            setHoverAlpha(0.6)
          }
        }}
        onWheel={e => {
          e.evt.preventDefault()
          const stage = e.target.getStage()
          const pointer = stage?.getPointerPosition()
          if (pointer) {
            const scaleBy = 1.05
            const mousePointTo = {
              x: (pointer.x - centerX - pan.x) / zoom,
              y: (pointer.y - centerY - pan.y) / zoom,
            }

            const newZoom = e.evt.deltaY > 0 ? zoom / scaleBy : zoom * scaleBy
            const clampedZoom = Math.max(0.4, Math.min(1, newZoom))

            const newPan = {
              x: pan.x - mousePointTo.x * (clampedZoom - zoom),
              y: pan.y - mousePointTo.y * (clampedZoom - zoom),
            }

            setZoom(clampedZoom)
            setPan(constrainPan(newPan))
          }
        }}
      >
        <Layer>
          {cells.map((cell, idx) => {
            const isFocused =
              focusedCell &&
              cell.q === focusedCell.q &&
              cell.r === focusedCell.r

            const { x, y } = hexToPixel(
              cell.q,
              cell.r,
              centerX + pan.x,
              centerY + pan.y,
              zoom,
            )

            const margin = 4 / zoom
            const corners = polygonCorners(x, y, (HEX_SIZE - margin) * zoom)
            // Ensure the polygon is fully closed for dashed border
            const closedCorners = [...corners, corners[0]]
            const points = closedCorners.flatMap(corner => [corner.x, corner.y])

            let fill =
              cell.state === "claimed"
                ? "oklch(74.6% 0.16 232.661)"
                : "transparent"
            if (hoveredIdx === idx && hoverAlpha > 0) {
              fill =
                cell.state === "claimed"
                  ? `oklch(85% 1 232.661)`
                  : `oklch(85% 0.50 232.661)`
            }

            return (
              <Line
                key={getCellId(cell, currentPlanetId)}
                points={points}
                closed
                stroke={
                  isFocused ? borderColors.focused : borderColors[cell.state]
                }
                strokeWidth={isFocused ? 4 : 2}
                dash={cell.state === "unclaimed" ? [5, 5] : undefined}
                fill={fill}
                onMouseEnter={() => {
                  setHoveredIdx(idx)
                }}
                onMouseLeave={() => {
                  if (hoveredIdx === idx) {
                    setHoveredIdx(null)
                    setHoverAlpha(0)
                  }
                }}
                onClick={() => {
                  if (cursor === "default") {
                    dispatch(setFocusedCell(cell))
                  }
                }}
                perfectDrawEnabled={false}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}

// Example usage (remove or replace with your own logic):
// const exampleCells: HexCell[] = [
//   { q: 0, r: 0, state: 'claimed' },
//   { q: 1, r: 0, state: 'claimed' },
//   { q: 0, r: 1, state: 'unclaimed' },
//   { q: -1, r: 0, state: 'unclaimed' },
//   { q: 0, r: -1, state: 'unclaimed' },
//   { q: 1, r: -1, state: 'unclaimed' },
//   { q: -1, r: 1, state: 'unclaimed' },
// ];
// <HexGridCanvas cells={exampleCells} focusedCell={{q:0,r:0}} />
