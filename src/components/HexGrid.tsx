import type React from "react"
import { HexMesh, HEX_RADIUS } from "./HexMesh"
import { type Cell } from "@/features/cell/types"

type HexGridProps = {
  cells: Cell[]
}

export const HexGrid: React.FC<HexGridProps> = ({ cells }) => {
  const hexes: React.JSX.Element[] = []

  const sqrt3 = Math.sqrt(3)
  for (const cell of cells) {
    const { q, r } = cell
    const x = sqrt3 * HEX_RADIUS * (q + r / 2)
    const y = (3 / 2) * HEX_RADIUS * r

    // place hex on XZ plane (y is used as Z) so board lies flat with Y as up
    hexes.push(
      <HexMesh
        key={`${q.toString()}-${r.toString()}`}
        position={[x, 0, y]}
        q={q}
        r={r}
      />,
    )
  }

  return <>{hexes}</>
}
