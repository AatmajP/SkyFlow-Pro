import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if the target is interactive
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.classList.contains('interactive') ||
        target.getAttribute('role') === 'button'
        
      setIsHovering(!!isInteractive)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', updateCursorPosition)
    window.addEventListener('mouseover', updateHoverState)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition)
      window.removeEventListener('mouseover', updateHoverState)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      {/* Small dot that closely follows the cursor */}
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-sky-400 rounded-full pointer-events-none z-[9999] mix-blend-screen transition-transform duration-75 ease-out"
        style={{ 
          transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0)`,
          opacity: 0.8
        }}
      />
      {/* Larger glowing circle that expands on hover object */}
      <div 
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border border-sky-400 pointer-events-none z-[9998] transition-all duration-300 ease-out flex items-center justify-center`}
        style={{ 
          transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) scale(${isHovering ? 2.5 : 1})`,
          backgroundColor: isHovering ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
          boxShadow: isHovering ? '0 0 20px rgba(56, 189, 248, 0.4)' : '0 0 10px rgba(56, 189, 248, 0.2)',
          opacity: 0.6
        }}
      />
    </>
  )
}
