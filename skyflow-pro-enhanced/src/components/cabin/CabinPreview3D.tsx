import { useRef, useEffect, useState, useCallback } from 'react'
import { X, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react'
import * as THREE from 'three'

interface CabinPreview3DProps {
  isOpen: boolean
  onClose: () => void
  aircraft?: string
  cabinClass?: string
}

const SEAT_COLORS = {
  available: 0x38bdf8,   // sky-400
  occupied: 0x475569,    // slate-600
  selected: 0x22c55e,    // green-500
  premium: 0xa855f7,     // purple-500
  business: 0xf59e0b,    // amber-500
}

export function CabinPreview3D({ isOpen, onClose, aircraft = 'Airbus A320neo', cabinClass = 'Economy' }: CabinPreview3DProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const rotation = useRef({ x: -0.5, y: 0 })
  const zoom = useRef(8)
  const animFrameRef = useRef<number>(0)

  const createCabin = useCallback(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a) // slate-900

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 10, 7)
    scene.add(dirLight)

    // Point light for cabin warmth
    const pointLight = new THREE.PointLight(0x38bdf8, 0.3, 20)
    pointLight.position.set(0, 3, 0)
    scene.add(pointLight)

    // ── Fuselage (cylinder) ──
    const fuselageGeom = new THREE.CylinderGeometry(2.0, 2.0, 12, 32, 1, true)
    const fuselageMat = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.6,
    })
    const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat)
    fuselage.rotation.z = Math.PI / 2
    scene.add(fuselage)

    // ── Floor ──
    const floorGeom = new THREE.BoxGeometry(12, 0.05, 3.2)
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x334155 })
    const floor = new THREE.Mesh(floorGeom, floorMat)
    floor.position.y = -1.0
    scene.add(floor)

    // ── Aisle line ──
    const aisleGeom = new THREE.BoxGeometry(10, 0.01, 0.02)
    const aisleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const aisle = new THREE.Mesh(aisleGeom, aisleMat)
    aisle.position.y = -0.95
    scene.add(aisle)

    // ── Generate seats ──
    const rows = 20
    const seatsPerSide = 3 // 3-3 layout
    const seatSpacing = 0.48
    const rowSpacing = 0.55
    const startX = -rows * rowSpacing / 2 + 0.5

    for (let row = 0; row < rows; row++) {
      for (let side = 0; side < 2; side++) {
        for (let s = 0; s < seatsPerSide; s++) {
          const seatGeom = new THREE.BoxGeometry(0.35, 0.5, 0.35)
          const isOccupied = Math.random() > 0.5
          const isBusinessRow = row < 3

          let color = isOccupied ? SEAT_COLORS.occupied : SEAT_COLORS.available
          if (isBusinessRow) color = isOccupied ? SEAT_COLORS.occupied : SEAT_COLORS.business

          const seatMat = new THREE.MeshPhongMaterial({
            color,
            emissive: isOccupied ? 0x000000 : new THREE.Color(color).multiplyScalar(0.1).getHex(),
          })
          const seat = new THREE.Mesh(seatGeom, seatMat)

          const x = startX + row * rowSpacing
          const z = (side === 0 ? -1 : 1) * (0.35 + s * seatSpacing)
          seat.position.set(x, -0.7, z)

          // Seat back
          const backGeom = new THREE.BoxGeometry(0.04, 0.45, 0.35)
          const back = new THREE.Mesh(backGeom, seatMat)
          back.position.set(x - 0.18, -0.45, z)
          scene.add(back)
          scene.add(seat)
        }
      }

      // Row number label (tiny plane-style indicator)
      if (row % 4 === 0) {
        const labelGeom = new THREE.BoxGeometry(0.02, 0.02, 0.15)
        const labelMat = new THREE.MeshBasicMaterial({ color: 0x64748b })
        const label = new THREE.Mesh(labelGeom, labelMat)
        label.position.set(startX + row * rowSpacing, -0.94, 0)
        scene.add(label)
      }
    }

    // ── Overhead bins (subtle) ──
    for (let side = 0; side < 2; side++) {
      const binGeom = new THREE.BoxGeometry(11, 0.3, 0.6)
      const binMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, transparent: true, opacity: 0.7 })
      const bin = new THREE.Mesh(binGeom, binMat)
      bin.position.set(0, 0.8, (side === 0 ? -1 : 1) * 1.5)
      scene.add(bin)
    }

    return scene
  }, [])

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const container = canvasRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, zoom.current, 0)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = createCabin()
    sceneRef.current = scene

    setIsLoaded(true)

    // Animation loop
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate)

      if (cameraRef.current && sceneRef.current) {
        // Orbit around the cabin based on rotation values
        const cam = cameraRef.current
        cam.position.x = zoom.current * Math.sin(rotation.current.y) * Math.cos(rotation.current.x)
        cam.position.y = zoom.current * Math.sin(rotation.current.x)
        cam.position.z = zoom.current * Math.cos(rotation.current.y) * Math.cos(rotation.current.x)
        cam.lookAt(0, -0.5, 0)
        renderer.render(sceneRef.current, cam)
      }
    }
    animate()

    // Handle resize
    function handleResize() {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      setIsLoaded(false)
    }
  }, [isOpen, createCabin])

  // Mouse controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    rotation.current.y += dx * 0.005
    rotation.current.x = Math.max(-1.2, Math.min(0.1, rotation.current.x - dy * 0.005))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }
  const handlePointerUp = () => { isDragging.current = false }
  const handleWheel = (e: React.WheelEvent) => {
    zoom.current = Math.max(4, Math.min(15, zoom.current + e.deltaY * 0.01))
  }

  const resetView = () => {
    rotation.current = { x: -0.5, y: 0 }
    zoom.current = 8
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl mx-4 glass rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-purple-600">
              <Move3D className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">3D Cabin Preview</h3>
              <p className="text-xs text-slate-400">{aircraft} · {cabinClass} Layout</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => { zoom.current = Math.max(4, zoom.current - 1) }}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => { zoom.current = Math.min(15, zoom.current + 1) }}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div
          ref={canvasRef}
          className="w-full h-[450px] cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        />

        {/* Legend + instructions */}
        <div className="p-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: '#38bdf8' }} />
              <span className="text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: '#475569' }} />
              <span className="text-slate-400">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: '#f59e0b' }} />
              <span className="text-slate-400">Business</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Drag to rotate · Scroll to zoom · {isLoaded ? '3D loaded' : 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  )
}
