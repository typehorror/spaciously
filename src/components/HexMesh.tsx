import { useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  selectFocusedCellCoord,
  setFocusedCell,
} from "@/features/planet/planetSlice"
import * as THREE from "three"

export const HEX_RADIUS = 1

type HexMeshProps = {
  position: [number, number, number]
  color: string
  q: number
  r: number
}

export const HexMesh: React.FC<HexMeshProps> = ({ position, color, q, r }) => {
  const dispatch = useAppDispatch()
  const selectedHex = useAppSelector(selectFocusedCellCoord)
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
      depth: 0.2,
      bevelEnabled: false,
    }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  const material = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: isSelected ? "yellow" : color,
      transparent: !isSelected,
      opacity: 0.4,
    })
  }, [color, isSelected])

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      material={material}
      onClick={() => {
        dispatch(setFocusedCell({ q, r }))
        console.log(`Selected: q=${q.toString()}, r=${r.toString()}`)
      }}
    />
  )
}
