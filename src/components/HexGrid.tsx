import type React from "react"
import { HexMesh, HEX_RADIUS } from "./HexMesh"
import { type Cell } from "@/features/cell/types"

type HexGridProps = {
  cells: Cell[]
}

export const HexGrid: React.FC<HexGridProps> = ({ cells }) => {
  const hexes: React.JSX.Element[] = []
  // Hex layout settings
  const sqrt3 = Math.sqrt(3)

  for (const cell of cells) {
    const { q, r } = cell
    // Pointy-top axial to pixel conversion
    // x = sqrt(3) * R * (q + r/2)
    // y = 3/2 * R * r
    const x = sqrt3 * HEX_RADIUS * (q + r / 2)
    const y = (3 / 2) * HEX_RADIUS * r
    // Deterministic color for now (green/gray by parity)
    const color = (q + r) % 2 === 0 ? "#4ade80" : "#0ea5e9"
    // place hex on XZ plane (y is used as Z) so board lies flat with Y as up
    hexes.push(
      <HexMesh
        key={`${q.toString()}-${r.toString()}`}
        position={[x, 0, y]}
        color={color}
        q={q}
        r={r}
      />,
    )
  }

  // for (let q = -size; q <= size; q++) {
  //   for (
  //     let r = Math.max(-size, -q - size);
  //     r <= Math.min(size, -q + size);
  //     r++
  //   ) {
  //     // Pointy-top axial to pixel conversion
  //     // x = sqrt(3) * R * (q + r/2)
  //     // y = 3/2 * R * r
  //     const x = sqrt3 * HEX_RADIUS * (q + r / 2)
  //     const y = (3 / 2) * HEX_RADIUS * r
  //     // Deterministic color for now (green/gray by parity)
  //     const color = (q + r) % 2 === 0 ? "#4ade80" : "#0ea5e9"
  //     // place hex on XZ plane (y is used as Z) so board lies flat with Y as up
  //     hexes.push(
  //       <HexMesh
  //         key={`${q.toString()}-${r.toString()}`}
  //         position={[x, 0, y]}
  //         color={color}
  //         q={q}
  //         r={r}
  //       />,
  //     )
  //   }
  // }

  return <>{hexes}</>
}
