import { useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  selectCurrentPlanetId,
  selectFocusedCellCoord,
  setFocusedCell,
} from "@/features/planet/planetSlice"
import * as THREE from "three"
import {
  selectCellById,
  selectHasClaimedNeighbor,
} from "@/features/cell/cellSlice"
import { getCellId } from "@/features/cell/utils"

export const HEX_RADIUS = 1

type HexMeshProps = {
  position: [number, number, number]
  q: number
  r: number
}

export const HexMesh: React.FC<HexMeshProps> = ({ position, q, r }) => {
  const dispatch = useAppDispatch()
  const selectedHex = useAppSelector(selectFocusedCellCoord)
  const planetId = useAppSelector(selectCurrentPlanetId)
  const cellId = getCellId({ q, r }, planetId)

  const cell = useAppSelector(state => selectCellById(state, cellId))
  const isClaimed = cell.state === "claimed"
  const hasClaimedNeighbor = useAppSelector(state =>
    selectHasClaimedNeighbor(state, cellId),
  )

  const isRevealed = isClaimed || hasClaimedNeighbor

  const isSelected = selectedHex.q === q && selectedHex.r === r

  // Memoize geometry since it's identical for all hexes with same radius
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    // Visual gap between tiles: shrink the visible hex slightly while layout uses HEX_RADIUS
    const GAP = 0.08 // 8% gap
    const displayRadius = HEX_RADIUS * (1 - GAP)
    // Use a +π/6 offset so the hex is pointy-top and matches axial layout math
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 6 + (i * Math.PI) / 3
      const x = Math.cos(angle) * displayRadius
      const y = Math.sin(angle) * displayRadius
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    // Small deterministic extrusion for slight 3D feel
    const extrudeSettings = {
      depth: isClaimed ? 0.2 : 0,
      bevelEnabled: false,
    }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [isClaimed])

  const material = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: isSelected ? "yellow" : isClaimed ? "#0ea5e9" : "#0c4a6e",
      // keep mesh slightly translucent when not selected so edges remain visible
      transparent: !isRevealed,
      opacity: isSelected ? 1 : 0,
      // remove wireframe; we'll render explicit edges when unrevealed
      wireframe: false,
      side: THREE.DoubleSide,
    })
  }, [isSelected, isRevealed, isClaimed])

  // Precompute edges geometry for unrevealed tiles to render a clean border
  const edgesGeometry = useMemo(() => {
    if (isRevealed) return null
    return new THREE.EdgesGeometry(geometry)
  }, [geometry, isRevealed])

  return (
    <>
      <mesh
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geometry}
        material={material}
        onClick={() => {
          dispatch(setFocusedCell({ q, r }))
        }}
      />
      {!isRevealed && edgesGeometry && (
        <lineSegments
          position={position}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={edgesGeometry}
          // Slightly render above the surface to reduce z-fighting
          renderOrder={1}
        >
          <lineBasicMaterial
            attach="material"
            color={isSelected ? "yellow" : "#0c4a6e"}
            linewidth={2}
          />
        </lineSegments>
      )}
    </>
  )
}
