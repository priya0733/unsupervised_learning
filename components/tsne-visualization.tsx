"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, ChevronRight, ZoomIn, ZoomOut, Move } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Point {
  x: number
  y: number
  cluster: number
  originalX: number
  originalY: number
}

interface TSNEVisualizationProps {
  dimensions?: number
  perplexity?: number
  numClusters?: number
  iterations?: number
  showControls?: boolean
}

export function TSNEVisualization({
  dimensions = 10,
  perplexity = 30,
  numClusters = 5,
  iterations = 100,
  showControls = true,
}: TSNEVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [iteration, setIteration] = useState(0)
  const [currentPerplexity, setCurrentPerplexity] = useState(perplexity)
  const [speed, setSpeed] = useState(1)
  const [showTrails, setShowTrails] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isPanEnabled, setIsPanEnabled] = useState(false)
  const [isZoomEnabled, setIsZoomEnabled] = useState(false)
  const [algorithmComplete, setAlgorithmComplete] = useState(false)
  const animationRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)

  const colors = [
    "#3498db", // blue
    "#e74c3c", // red
    "#2ecc71", // green
    "#f39c12", // orange
    "#9b59b6", // purple
    "#1abc9c", // teal
    "#d35400", // orange dark
    "#34495e", // navy
    "#16a085", // green dark
    "#c0392b", // red dark
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

    // Generate initial points in clusters
    generatePoints()

    // Draw initial state
    drawCanvas()

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      drawCanvas()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Animation loop
  useEffect(() => {
    if (isRunning && !algorithmComplete) {
      const animate = (timestamp: number) => {
        if (timestamp - lastUpdateTimeRef.current > 1000 / (speed * 5)) {
          lastUpdateTimeRef.current = timestamp
          updatePoints()
        }
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, algorithmComplete, speed])

  // Update when points or iteration changes
  useEffect(() => {
    drawCanvas()
  }, [points, iteration, currentPerplexity, zoomLevel, panOffset, showTrails])

  // Update when perplexity changes
  useEffect(() => {
    setCurrentPerplexity(perplexity)
  }, [perplexity])

  const generatePoints = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const newPoints: Point[] = []

    // Create clusters
    const pointsPerCluster = 20

    for (let c = 0; c < numClusters; c++) {
      // Create cluster center in high dimensions
      const center: number[] = []
      for (let d = 0; d < dimensions; d++) {
        center.push((Math.random() * 2 - 1) * 3)
      }

      // Add points around center
      for (let i = 0; i < pointsPerCluster; i++) {
        // Random position for initial visualization
        const x = (Math.random() * 0.8 + 0.1) * canvas.width
        const y = (Math.random() * 0.8 + 0.1) * canvas.height

        newPoints.push({
          x,
          y,
          cluster: c,
          originalX: x,
          originalY: y,
        })
      }
    }

    setPoints(newPoints)
    setIteration(0)
    setAlgorithmComplete(false)
  }

  const drawCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan transformations
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoomLevel, zoomLevel)

    // Draw coordinate axes
    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Draw point trails if enabled
    if (showTrails) {
      points.forEach((point, index) => {
        if (index % 5 === 0) {
          // Only draw trails for some points to avoid clutter
          const startX = point.originalX
          const startY = point.originalY
          const progress = Math.min(iteration / (iterations * 0.7), 1)

          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(point.x, point.y)
          ctx.strokeStyle = `${colors[point.cluster % colors.length]}80`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    }

    // Draw points
    points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = colors[point.cluster % colors.length]
      ctx.fill()
    })

    // Draw iteration counter
    ctx.restore() // Restore canvas state before drawing text
    ctx.fillStyle = "#333"
    ctx.font = "14px Arial"
    ctx.fillText(`Iteration: ${iteration}/${iterations}`, 10, 20)
  }

  const updatePoints = () => {
    if (iteration >= iterations) {
      setIsRunning(false)
      setAlgorithmComplete(true)
      return
    }

    if (!canvasRef.current) return
    const canvas = canvasRef.current

    // Simulate t-SNE by gradually moving points to reveal cluster structure
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.4
    const progress = Math.min(iteration / (iterations * 0.7), 1) // Complete clustering by 70% of iterations

    // Calculate cluster centers based on perplexity
    // Higher perplexity = more spread out clusters
    const clusterCenters: { x: number; y: number }[] = []

    // Adjust cluster positioning based on perplexity
    const clusterSpread = 0.5 + currentPerplexity / 100

    for (let c = 0; c < numClusters; c++) {
      const angle = (c / numClusters) * Math.PI * 2
      clusterCenters.push({
        x: centerX + Math.cos(angle) * radius * clusterSpread * 0.7,
        y: centerY + Math.sin(angle) * radius * clusterSpread * 0.7,
      })
    }

    // Move points toward their cluster centers
    const newPoints = points.map((point) => {
      const center = clusterCenters[point.cluster]

      // Add noise based on perplexity
      const noise = (1 - progress) * radius * (0.1 + currentPerplexity / 200)
      const noiseX = (Math.random() * 2 - 1) * noise
      const noiseY = (Math.random() * 2 - 1) * noise

      // Interpolate between current position and cluster center
      const x = point.x * (1 - progress * 0.1) + (center.x + noiseX) * progress * 0.1
      const y = point.y * (1 - progress * 0.1) + (center.y + noiseY) * progress * 0.1

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
    if (algorithmComplete) {
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
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const stepForward = () => {
    if (!isRunning && !algorithmComplete) {
      updatePoints()
    }
  }

  const toggleZoom = () => {
    setIsZoomEnabled(!isZoomEnabled)
    setIsPanEnabled(false)
  }

  const togglePan = () => {
    setIsPanEnabled(!isPanEnabled)
    setIsZoomEnabled(false)
  }

  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel * 1.2, 5))
  }

  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel / 1.2, 0.5))
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    // Start panning if pan mode is enabled
    if (isPanEnabled) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    // Handle panning
    if (isDragging && isPanEnabled) {
      setPanOffset({
        x: panOffset.x + (e.clientX - dragStart.x),
        y: panOffset.y + (e.clientY - dragStart.y),
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const handleCanvasMouseLeave = () => {
    setIsDragging(false)
  }

  const showFinalResult = () => {
    setIteration(iterations)
    setAlgorithmComplete(true)

    // Generate final t-SNE result
    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.4

    // Calculate cluster centers
    const clusterCenters: { x: number; y: number }[] = []
    for (let c = 0; c < numClusters; c++) {
      const angle = (c / numClusters) * Math.PI * 2
      clusterCenters.push({
        x: centerX + Math.cos(angle) * radius * 0.7,
        y: centerY + Math.sin(angle) * radius * 0.7,
      })
    }

    // Position points around their cluster centers
    const finalPoints = [...points]
    for (let i = 0; i < finalPoints.length; i++) {
      const point = finalPoints[i]
      const center = clusterCenters[point.cluster]

      // Add noise for natural cluster appearance
      const noise = radius * 0.15
      const noiseX = (Math.random() * 2 - 1) * noise
      const noiseY = (Math.random() * 2 - 1) * noise

      finalPoints[i] = {
        ...point,
        x: center.x + noiseX,
        y: center.y + noiseY,
      }
    }

    setPoints(finalPoints)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="mb-4">
        {showControls && (
          <>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Perplexity</label>
              <span className="text-sm">{currentPerplexity}</span>
            </div>
            <Slider
              value={[currentPerplexity]}
              min={5}
              max={50}
              step={5}
              onValueChange={(value) => setCurrentPerplexity(value[0])}
              disabled={isRunning}
              className="mb-4"
            />

            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Speed</label>
              <span className="text-sm">{speed}x</span>
            </div>
            <Slider
              value={[speed]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => setSpeed(value[0])}
              className="mb-4"
            />
          </>
        )}
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-[300px] bg-slate-50 dark:bg-slate-900"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
        />
      </div>

      {showControls && (
        <>
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleZoom}
                      className={isZoomEnabled ? "bg-slate-200 dark:bg-slate-700" : ""}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle zoom mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={togglePan}
                      className={isPanEnabled ? "bg-slate-200 dark:bg-slate-700" : ""}
                    >
                      <Move className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle pan mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={zoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom in</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={zoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Show Trails</label>
              <input
                type="checkbox"
                checked={showTrails}
                onChange={() => setShowTrails(!showTrails)}
                className="rounded border-gray-300"
              />
            </div>
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
                disabled={isRunning || algorithmComplete}
                className="flex items-center gap-1"
              >
                <ChevronRight className="h-4 w-4" />
                Step
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={showFinalResult}
                disabled={isRunning || algorithmComplete}
                className="flex items-center gap-1"
              >
                Show Final
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
                    {algorithmComplete ? "Restart" : "Play"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

