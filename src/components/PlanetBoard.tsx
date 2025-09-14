import type React from "react"
import { Canvas } from "@react-three/fiber"
import { MapControls, OrthographicCamera } from "@react-three/drei"
import { HexGrid } from "./HexGrid"
import { useRef, useEffect } from "react"
import * as THREE from "three"
import { useAppDispatch } from "@/app/hooks"
import { setFocusedCell } from "@/features/planet/planetSlice"
import { type Cell } from "@/features/cell/types"

type Props = {
  cells: Cell[]
}

const PlanetBoard: React.FC<Props> = ({ cells }) => {
  const dispatch = useAppDispatch()
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.Camera | null>(null)
  const orthoRef = useRef<THREE.OrthographicCamera | null>(null)
  // reasonable zoom limits for orthographic camera
  const MIN_ZOOM = 15
  const MAX_ZOOM = 50

  // Keep orthographic camera zoom clamped to [MIN_ZOOM, MAX_ZOOM]
  useEffect(() => {
    const cam = orthoRef.current
    if (!cam) return

    const clampZoom = () => {
      // cam is captured from outer scope and guaranteed non-null here
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom))
      if (z !== cam.zoom) {
        cam.zoom = z
        cam.updateProjectionMatrix()
      }
    }

    // Monkey-patch requestAnimationFrame observer to clamp on frame updates
    let raf = 0
    const loop = () => {
      clampZoom()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [MIN_ZOOM, MAX_ZOOM])

  // Ensure the orthographic camera looks at the origin (board center)
  useEffect(() => {
    const cam = orthoRef.current
    if (!cam) return
    // Ensure camera has the correct up vector (Y-up) and faces the center
    cam.up.set(0, 1, 0)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  }, [])

  const handleClick: React.MouseEventHandler<HTMLDivElement> = event => {
    // event.currentTarget is the element the listener is attached to (the Canvas wrapper/div)
    const canvas = event.currentTarget as HTMLDivElement
    const rect = canvas.getBoundingClientRect()
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    if (sceneRef.current) {
      // prefer orthographic camera when present
      const cam = orthoRef.current ?? cameraRef.current
      if (!cam) {
        console.warn("No camera available for raycasting")
        return
      }
      raycasterRef.current.setFromCamera(mouseRef.current, cam)
      const intersects = raycasterRef.current.intersectObjects(
        sceneRef.current.children,
        true,
      )
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh
        const { q, r } = hit.userData as { q: number; r: number }
        if (q && r) {
          dispatch(setFocusedCell({ q, r })) // Dispatch to Redux
          console.log(`Selected hex: q=${q.toString()}, r=${r.toString()}`)
        }
      }
    }
  }

  return (
    <Canvas
      onClick={handleClick}
      shadows={true}
      onCreated={({ scene, camera }) => {
        sceneRef.current = scene // Store scene for raycasting
        cameraRef.current = camera
      }}
    >
      {/* Place an orthographic camera set to a 3/4 isometric-ish angle */}
      <OrthographicCamera
        makeDefault
        ref={orthoRef}
        // place camera above board and in front (negative Z) so we see board top-side
        position={[0, 18, -18]}
        rotation={[-Math.PI / 4, -Math.PI / 8, 0]} // look down at 45 degree angle
        // use zoom that fits many hexes in view (adjust as needed)
        zoom={30}
        near={-200}
        far={200}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 30, 10]} intensity={1.5} />
      <HexGrid cells={cells} />
      <MapControls
        // disable rotation to keep orthographic 3/4 view stable
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        // MapControls props to clamp zoom. These work with the camera.zoom value
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
      />
    </Canvas>
  )
}

export default PlanetBoard
