"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/contexts/theme-context"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create particles
    const particles: Particle[] = []
    const particleCount = Math.min(Math.floor(window.innerWidth / 10), 100)

    // Get theme-based color
    const getThemeColor = () => {
      switch (theme) {
        case "dark":
          return "rgba(255, 255, 255, 0.2)"
        case "purple":
          return "rgba(147, 51, 234, 0.2)"
        case "blue":
          return "rgba(59, 130, 246, 0.2)"
        case "green":
          return "rgba(16, 185, 129, 0.2)"
        default:
          return "rgba(59, 130, 246, 0.2)"
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: getThemeColor(),
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Update particle colors when theme changes
    const updateParticleColors = () => {
      const newColor = getThemeColor()
      particles.forEach((particle) => {
        particle.color = newColor
      })
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />
}

