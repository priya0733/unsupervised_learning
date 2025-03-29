"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react"

interface Point {
  x: number
  y: number
  cluster: number
  originalX: number
  originalY: number
}

export function InteractiveTSNEDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [iteration, setIteration] = useState(0)
  const [perplexity, setPerplexity] = useState(30)
  const [progress, setProgress] = useState(0)
  const animationRef = useRef<number | null>(null)

  const colors = [
    "#3498db", // blue
    "#e74c3c", // red
    "#2ecc71", // green
    "#f39c12", // orange
    "#9b59b6", // purple
  ]

  // Initialize points
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Generate initial points in 5 clusters
    generatePoints()

    // Draw initial state
    drawCanvas()
  }, [])

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        updatePoints()
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning])

  // Update when points or iteration changes
  useEffect(() => {
    drawCanvas()
  }, [points, iteration, perplexity])

  const generatePoints = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const newPoints: Point[] = []

    // Create 5 clusters
    const clusterCount = 5
    const pointsPerCluster = 10

    for (let c = 0; c < clusterCount; c++) {
      // Create cluster center
      const centerX = Math.random() * 0.8 + 0.1
      const centerY = Math.random() * 0.8 + 0.1

      // Add points around center
      for (let i = 0; i < pointsPerCluster; i++) {
        const x = centerX + (Math.random() - 0.5) * 0.1
        const y = centerY + (Math.random() - 0.5) * 0.1

        newPoints.push({
          x: x * canvas.width,
          y: y * canvas.height,
          cluster: c,
          originalX: x * canvas.width,
          originalY: y * canvas.height,
        })
      }
    }

    setPoints(newPoints)
    setIteration(0)
    setProgress(0)
  }

  const drawCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw points
    points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = colors[point.cluster % colors.length]
      ctx.fill()
    })

    // Draw iteration counter
    ctx.fillStyle = "#333"
    ctx.font = "12px Arial"
    ctx.fillText(`Iteration: ${iteration}`, 10, 20)
  }

  const updatePoints = () => {
    if (iteration >= 100) {
      setIsRunning(false)
      return
    }

    if (!canvasRef.current) return
    const canvas = canvasRef.current

    // Simulate t-SNE by gradually moving points to reveal cluster structure
    const newProgress = Math.min(progress + 0.01, 1)
    setProgress(newProgress)

    // Calculate cluster centers based on perplexity
    // Higher perplexity = more spread out clusters
    const clusterCenters: { x: number; y: number }[] = []
    const clusterCount = 5
    const radius = Math.min(canvas.width, canvas.height) * 0.3
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Adjust cluster positioning based on perplexity
    const clusterSpread = 0.5 + perplexity / 100

    for (let c = 0; c < clusterCount; c++) {
      const angle = (c / clusterCount) * Math.PI * 2
      clusterCenters.push({
        x: centerX + Math.cos(angle) * radius * clusterSpread,
        y: centerY + Math.sin(angle) * radius * clusterSpread,
      })
    }

    // Move points toward their cluster centers
    const newPoints = points.map((point) => {
      const center = clusterCenters[point.cluster]

      // Add noise based on perplexity
      const noise = (1 - newProgress) * radius * (0.1 + perplexity / 200)
      const noiseX = (Math.random() * 2 - 1) * noise
      const noiseY = (Math.random() * 2 - 1) * noise

      // Interpolate between original position and cluster center
      const x = point.originalX * (1 - newProgress) + (center.x + noiseX) * newProgress
      const y = point.originalY * (1 - newProgress) + (center.y + noiseY) * newProgress

      return {
        ...point,
        x,
        y,
      }
    })

    setPoints(newPoints)
    setIteration((prev) => prev + 1)
  }

  const toggleRunning = () => {
    if (iteration >= 100) {
      // Reset if complete
      generatePoints()
      setIsRunning(true)
    } else {
      setIsRunning(!isRunning)
    }
  }

  const resetDemo = () => {
    setIsRunning(false)
    generatePoints()
  }

  const stepForward = () => {
    if (!isRunning) {
      updatePoints()
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-lg font-medium mb-4">Interactive t-SNE Demo</h3>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Perplexity</label>
          <span className="text-sm">{perplexity}</span>
        </div>
        <Slider
          value={[perplexity]}
          min={5}
          max={50}
          step={5}
          onValueChange={(value) => setPerplexity(value[0])}
          disabled={isRunning}
          className="mb-4"
        />
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-4">
        <canvas ref={canvasRef} className="w-full h-[200px] bg-slate-50 dark:bg-slate-900" />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={resetDemo} className="flex items-center gap-1">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={stepForward}
            disabled={isRunning}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            Step
          </Button>

          <Button
            variant={isRunning ? "secondary" : "default"}
            size="sm"
            onClick={toggleRunning}
            className="flex items-center gap-1 min-w-[80px]"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        <p>
          This simplified demo shows how t-SNE gradually organizes points from their original positions into clusters.
        </p>
        <p>Try adjusting the perplexity to see how it affects the final arrangement of clusters.</p>
      </div>
    </div>
  )
}

