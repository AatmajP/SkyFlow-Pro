import { useEffect, useState } from 'react'

export function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to center of screen, normalized from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950 pointer-events-none">
      {/* Ambient static bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent" />

      {/* 3D Mesh Layer 1: Deep Blue background blob (Moves slightly opposite to mouse) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0) scale(1.2)`
        }}
      />

      {/* 3D Mesh Layer 2: Cyber Purple blob (Moves slightly with the mouse) */}
      <div 
        className="absolute top-[20%] right-[-10%] w-[50vw] h-[70vh] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out animate-breathe"
        style={{
          transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 0)`
        }}
      />

      {/* 3D Mesh Layer 3: Cyan highlight blob (Moves fastest, giving depth parallax) */}
      <div 
        className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vh] rounded-full bg-cyan-500/15 blur-[100px] mix-blend-screen transition-transform duration-700 ease-out animate-pulse-glow"
        style={{
          transform: `translate3d(${mousePos.x * 50}px, ${mousePos.y * 50}px, 0)`
        }}
      />

      {/* Grain/Noise overlay to increase premium 3D feel and prevent banding */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }} />
    </div>
  )
}
