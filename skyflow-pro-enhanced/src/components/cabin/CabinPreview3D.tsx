/**
 * CabinPreview3D — class-aware 3D cabin preview modal.
 *
 * - Renders different layouts for Economy / Premium / Business / First
 * - Synchronizes with 2D SeatMap using seatMap data
 * - Supports rotate, zoom, and reset
 * - Fully interactive: click to select seats
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { X, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react'
import * as THREE from 'three'
import type { CabinClass } from '../../types/flight'
import type { Seat, SeatMapData } from '../../types/seat'

interface CabinPreview3DProps {
  isOpen: boolean
  onClose: () => void
  aircraft?: string
  cabinClass?: CabinClass | string
  seatMap?: SeatMapData | null
  selectedSeatId?: string | null
  onSeatSelected?: (seat: Seat) => void
}

/* ── colour palette ── */
const COLORS = {
  available_economy: 0x38bdf8,
  available_premium: 0xa855f7,
  available_business: 0xf59e0b,
  available_first: 0xec4899,
  occupied: 0x334155,
  selected: 0x22c55e, // Emerald 500
  fuselage: 0x1e293b,
  floor: 0x334155,
  aisle: 0x38bdf8,
  bins: 0x1e293b,
  scene_bg: 0x0f172a,
}

/* ── cabin layout configs ── */
interface CabinConfig {
  seatWidth: number
  seatSpacing: number
  rowSpacing: number
  fuselageRadius: number
  occupancyRate: number
  label: string
}

function getCabinConfig(cabin: string): CabinConfig {
  switch (cabin) {
    case 'business':
      return {
        seatWidth: 0.5, seatSpacing: 0.65, rowSpacing: 0.8, fuselageRadius: 2.2,
        occupancyRate: 0.2, label: 'Business',
      }
    case 'premium_economy':
      return {
        seatWidth: 0.42, seatSpacing: 0.55, rowSpacing: 0.65, fuselageRadius: 2.1,
        occupancyRate: 0.25, label: 'Premium Economy',
      }
    case 'first':
      return {
        seatWidth: 0.6, seatSpacing: 0.8, rowSpacing: 1.0, fuselageRadius: 2.3,
        occupancyRate: 0.15, label: 'First Class',
      }
    default: // economy
      return {
        seatWidth: 0.35, seatSpacing: 0.48, rowSpacing: 0.55, fuselageRadius: 2.0,
        occupancyRate: 0.35, label: 'Economy',
      }
  }
}

function getAvailableColor(cabin: string): number {
  switch (cabin) {
    case 'business': return COLORS.available_business
    case 'premium_economy': return COLORS.available_premium
    case 'first': return COLORS.available_first
    default: return COLORS.available_economy
  }
}

export function CabinPreview3D({
  isOpen,
  onClose,
  aircraft = 'Airbus A320neo',
  cabinClass = 'economy',
  seatMap,
  selectedSeatId,
  onSeatSelected,
}: CabinPreview3DProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const seatMeshesRef = useRef<THREE.Mesh[]>([])
  
  const [isLoaded, setIsLoaded] = useState(false)
  const isDragging = useRef(false)
  const hasMoved = useRef(false) // to distinguish click from drag
  const lastMouse = useRef({ x: 0, y: 0 })
  const rotation = useRef({ x: -0.5, y: 0 })
  const zoom = useRef(8)
  const animFrameRef = useRef<number>(0)

  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  const createCabin = useCallback(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(COLORS.scene_bg)
    seatMeshesRef.current = [] // clear meshes

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 10, 7)
    scene.add(dirLight)

    const accentColor = getAvailableColor(cabinClass as string)
    const pointLight = new THREE.PointLight(accentColor, 0.3, 20)
    pointLight.position.set(0, 3, 0)
    scene.add(pointLight)

    const cfg = getCabinConfig(cabinClass as string)
    const layout = seatMap?.layouts[0]
    
    // fallback dimensions if no seatMap
    const rowsCount = layout ? (layout.rowEnd - layout.rowStart + 1) : (cabinClass === 'economy' ? 22 : 6)
    const columns = layout ? layout.columns : (cabinClass === 'economy' ? ['A','B','C','D','E','F'] : ['A','B','C','D'])
    const aisleAfter = layout ? layout.aisleAfter : (cabinClass === 'economy' ? [2] : [1])
    const fuselageLength = Math.max(10, rowsCount * cfg.rowSpacing + 4)

    // ── Fuselage ──
    const fuselageGeom = new THREE.CylinderGeometry(cfg.fuselageRadius, cfg.fuselageRadius, fuselageLength, 32, 1, true)
    const fuselageMat = new THREE.MeshPhongMaterial({
      color: COLORS.fuselage,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.55,
    })
    const fuselage = new THREE.Mesh(fuselageGeom, fuselageMat)
    fuselage.rotation.z = Math.PI / 2
    scene.add(fuselage)

    // ── Floor ──
    const floorW = fuselageLength + 2
    const floorGeom = new THREE.BoxGeometry(floorW, 0.05, cfg.fuselageRadius * 1.5)
    const floorMat = new THREE.MeshPhongMaterial({ color: COLORS.floor })
    const floor = new THREE.Mesh(floorGeom, floorMat)
    floor.position.y = -1.0
    scene.add(floor)

    // ── Aisle line ──
    const aisleGeom = new THREE.BoxGeometry(fuselageLength - 1, 0.015, 0.03)
    const aisleMat = new THREE.MeshBasicMaterial({ color: COLORS.aisle })
    const aisleLine = new THREE.Mesh(aisleGeom, aisleMat)
    aisleLine.position.y = -0.95
    scene.add(aisleLine)

    // ── Seats ──
    const startX = -(rowsCount * cfg.rowSpacing) / 2 + 0.5

    let rngSeed = 42
    for (let i = 0; i < (cabinClass as string).length; i++) {
      rngSeed = (rngSeed * 31 + (cabinClass as string).charCodeAt(i)) >>> 0
    }
    const rng = () => {
      rngSeed = (rngSeed * 16807) % 2147483647
      return (rngSeed - 1) / 2147483646
    }

    for (let r = 0; r < rowsCount; r++) {
      const realRow = layout ? layout.rowStart + r : r + 1
      
      let currentZ = -((columns.length - 1) * cfg.seatSpacing) / 2
      if (aisleAfter.length > 0) {
          // adjust starting Z to account for aisles
          currentZ -= (aisleAfter.length * cfg.seatSpacing * 0.5)
      }

      for (let ci = 0; ci < columns.length; ci++) {
        const colName = columns[ci]
        const seat = seatMap?.seats.find(s => s.row === realRow && s.column === colName)
        
        const isOcc = seat ? !seat.isAvailable : (rng() < cfg.occupancyRate)
        const isSelected = seat && seat.seatId === selectedSeatId

        let color = isOcc ? COLORS.occupied : accentColor
        if (isSelected) color = COLORS.selected

        const seatMat = new THREE.MeshPhongMaterial({
          color,
          emissive: isOcc ? 0x000000 : new THREE.Color(color).multiplyScalar(0.12).getHex(),
        })

        // seat bottom
        const seatGeom = new THREE.BoxGeometry(cfg.seatWidth, cfg.seatWidth * 1.3, cfg.seatWidth)
        const seatMesh = new THREE.Mesh(seatGeom, seatMat)
        const x = startX + r * cfg.rowSpacing
        
        seatMesh.position.set(x, -0.7, currentZ)
        
        // Add userData for interaction
        seatMesh.userData = { isSeat: true, seat, isAvailable: !isOcc }
        seatMeshesRef.current.push(seatMesh)

        // seat back
        const backGeom = new THREE.BoxGeometry(0.04, cfg.seatWidth * 1.2, cfg.seatWidth)
        const back = new THREE.Mesh(backGeom, seatMat)
        back.position.set(x - cfg.seatWidth * 0.5, -0.45, currentZ)

        // Add userData to back as well so clicking it works
        back.userData = { isSeat: true, seat, isAvailable: !isOcc, parentMesh: seatMesh }
        seatMeshesRef.current.push(back)

        // armrests
        if (cabinClass === 'business' || cabinClass === 'first') {
          const armGeom = new THREE.BoxGeometry(cfg.seatWidth * 0.8, 0.03, 0.04)
          const armMat = new THREE.MeshPhongMaterial({ color: 0x475569 })
          for (const dz of [-1, 1]) {
            const arm = new THREE.Mesh(armGeom, armMat)
            arm.position.set(x, -0.55, currentZ + dz * cfg.seatWidth * 0.55)
            scene.add(arm)
          }
        }

        scene.add(seatMesh)
        scene.add(back)

        currentZ += cfg.seatSpacing
        if (aisleAfter.includes(ci)) {
            currentZ += cfg.seatSpacing * 0.8 // Aisle gap
        }
      }

      // row indicator
      if (r % Math.max(2, Math.ceil(rowsCount / 8)) === 0) {
        const indGeom = new THREE.BoxGeometry(0.02, 0.02, 0.15)
        const indMat = new THREE.MeshBasicMaterial({ color: 0x64748b })
        const ind = new THREE.Mesh(indGeom, indMat)
        ind.position.set(startX + r * cfg.rowSpacing, -0.94, 0)
        scene.add(ind)
      }
    }

    // ── Overhead bins ──
    for (const side of [-1, 1]) {
      const binGeom = new THREE.BoxGeometry(fuselageLength - 2, 0.3, 0.6)
      const binMat = new THREE.MeshPhongMaterial({ color: COLORS.bins, transparent: true, opacity: 0.65 })
      const bin = new THREE.Mesh(binGeom, binMat)
      bin.position.set(0, 0.8, side * (cfg.fuselageRadius * 0.7))
      scene.add(bin)
    }

    // ── Class zone label (floating text plane) ──
    const labelCanvas = document.createElement('canvas')
    labelCanvas.width = 512
    labelCanvas.height = 64
    const ctx = labelCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, 512, 64)
      ctx.font = 'bold 28px Inter, sans-serif'
      ctx.fillStyle = `#${accentColor.toString(16).padStart(6, '0')}`
      ctx.textAlign = 'center'
      ctx.fillText(cfg.label.toUpperCase(), 256, 42)
    }
    const labelTex = new THREE.CanvasTexture(labelCanvas)
    const labelGeom = new THREE.PlaneGeometry(3, 0.4)
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide })
    const labelMesh = new THREE.Mesh(labelGeom, labelMat)
    labelMesh.position.set(0, 1.5, 0)
    scene.add(labelMesh)

    return scene
  }, [cabinClass, seatMap, selectedSeatId])

  // Sync selected seat colors without recreating scene
  useEffect(() => {
      if (!isLoaded) return;
      const accentColor = getAvailableColor(cabinClass as string);

      seatMeshesRef.current.forEach(mesh => {
          if (!mesh.userData.isSeat || !mesh.userData.seat) return;
          const seat = mesh.userData.seat as Seat;
          const isAvailable = mesh.userData.isAvailable;
          const isSelected = seat.seatId === selectedSeatId;

          let color = !isAvailable ? COLORS.occupied : accentColor;
          if (isSelected) color = COLORS.selected;

          const mat = mesh.material as THREE.MeshPhongMaterial;
          mat.color.setHex(color);
          mat.emissive.setHex(!isAvailable ? 0x000000 : new THREE.Color(color).multiplyScalar(0.12).getHex());
      });
  }, [selectedSeatId, isLoaded, cabinClass]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const container = canvasRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(0, zoom.current, 0)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = createCabin()
    sceneRef.current = scene

    setIsLoaded(true)

    function animate() {
      animFrameRef.current = requestAnimationFrame(animate)
      if (cameraRef.current && sceneRef.current) {
        const cam = cameraRef.current
        cam.position.x = zoom.current * Math.sin(rotation.current.y) * Math.cos(rotation.current.x)
        cam.position.y = zoom.current * Math.sin(rotation.current.x)
        cam.position.z = zoom.current * Math.cos(rotation.current.y) * Math.cos(rotation.current.x)
        cam.lookAt(0, -0.5, 0)
        renderer.render(sceneRef.current, cam)
      }
    }
    animate()

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

  // ── Mouse / pointer controls ──
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    hasMoved.current = false
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasMoved.current = true
    rotation.current.y += dx * 0.005
    rotation.current.x = Math.max(-1.2, Math.min(0.1, rotation.current.x - dy * 0.005))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    if (!hasMoved.current && canvasRef.current && cameraRef.current && onSeatSelected) {
      // Handle click for selection
      const rect = canvasRef.current.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.current.setFromCamera(mouse.current, cameraRef.current)
      
      if (sceneRef.current) {
          const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true)
          for (const hit of intersects) {
              const userData = hit.object.userData
              if (userData.isSeat && userData.seat && userData.isAvailable) {
                  onSeatSelected(userData.seat)
                  break // stop after first hit
              }
          }
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    zoom.current = Math.max(4, Math.min(15, zoom.current + e.deltaY * 0.01))
  }
  const resetView = () => {
    rotation.current = { x: -0.5, y: 0 }
    zoom.current = 8
  }

  if (!isOpen) return null

  const cfg = getCabinConfig(cabinClass as string)
  const accentHex = `#${getAvailableColor(cabinClass as string).toString(16).padStart(6, '0')}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl mx-4 glass rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-purple-600">
              <Move3D className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">Interactive 3D Cabin</h3>
              <p className="text-xs text-slate-400">{aircraft} · <span style={{ color: accentHex }}>{cfg.label}</span> Layout</p>
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
          className="w-full h-[60vh] min-h-[400px] cursor-pointer active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
              isDragging.current = false;
          }}
          onWheel={handleWheel}
        />

        {/* Legend + instructions */}
        <div className="p-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4 bg-slate-900/50">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: accentHex }} />
              <span className="text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: '#334155' }} />
              <span className="text-slate-400">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-400">Selected</span>
            </div>
          </div>
          <div className="text-right">
              {selectedSeatId && (
                  <p className="text-sm font-bold text-emerald-400 mb-0.5">
                    Seat {seatMap?.seats.find(s => s.seatId === selectedSeatId)?.label} Selected
                  </p>
              )}
              <p className="text-xs text-slate-500">
                Click a seat to select · Drag to rotate · Scroll to zoom
              </p>
          </div>
        </div>
      </div>
    </div>
  )
}
