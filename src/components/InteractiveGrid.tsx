'use client'

import { useEffect, useRef } from 'react'

export function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    updateCanvasSize()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      }
    }

    const handleResize = () => {
      updateCanvasSize()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    const gridSize = 50
    const maxDistortion = 30

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const isLightTheme = document.documentElement.classList.contains('light-theme')
      ctx.strokeStyle = isLightTheme ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 1

      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        for (let y = 0; y <= canvas.height; y += 2) {
          const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2)
          const influence = Math.max(0, 150 - distance) / 150
          const distortion = influence * maxDistortion * Math.sin(distance * 0.01)

          const offsetX = x + distortion
          const offsetY = y

          if (y === 0) {
            ctx.moveTo(offsetX, offsetY)
          } else {
            ctx.lineTo(offsetX, offsetY)
          }
        }
        ctx.stroke()
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        for (let x = 0; x <= canvas.width; x += 2) {
          const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2)
          const influence = Math.max(0, 150 - distance) / 150
          const distortion = influence * maxDistortion * Math.sin(distance * 0.01)

          const offsetX = x
          const offsetY = y + distortion

          if (x === 0) {
            ctx.moveTo(offsetX, offsetY)
          } else {
            ctx.lineTo(offsetX, offsetY)
          }
        }
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(drawGrid)
    }

    drawGrid()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}