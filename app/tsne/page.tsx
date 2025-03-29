"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Info, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetSelector, type Dataset } from "@/components/dataset-selector"
import { VisualizationControls } from "@/components/visualization-controls"
import { InteractiveHeader } from "@/components/interactive-header.tsx"
import { InteractiveFooter } from "@/components/interactive-footer.tsx"
import { ParticleBackground } from "@/components/particle-background"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TSNEVisualization } from "@/components/tsne-visualization"

interface Point {
  x: number
  y: number
  originalData: number[]
  cluster: number
  history?: Array<{ x: number; y: number }>
  selected?: boolean
}

export default function TSNEPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [projectedPoints, setProjectedPoints] = useState<Point[]>([])
  const [dimensions, setDimensions] = useState(10)
  const [perplexity, setPerplexity] = useState(30)
  const [numClusters, setNumClusters] = useState(3)
  const [isRunning, setIsRunning] = useState(false)
  const [iteration, setIteration] = useState(0)
  const [maxIterations, setMaxIterations] = useState(100)
  const [speed, setSpeed] = useState(1)
  const [activeTab, setActiveTab] = useState("visualization")
  const [algorithmComplete, setAlgorithmComplete] = useState(false)
  const animationRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)

  // New interactive features
  const [showTrails, setShowTrails] = useState(false)
  const [colorMode, setColorMode] = useState("cluster")
  const [isZoomEnabled, setIsZoomEnabled] = useState(false)
  const [isPanEnabled, setIsPanEnabled] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [isPointDragging, setIsPointDragging] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const colors = [
    "#3498db",
    "#e74c3c",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#d35400",
    "#34495e",
    "#16a085",
    "#c0392b",
  ]

  // Sample datasets
  const predefinedDatasets: Dataset[] = [
    {
      id: "random",
      name: "Random Clusters",
      description: "Randomly generated clusters in high-dimensional space",
      points: [],
    },
    {
      id: "mnist",
      name: "MNIST-like",
      description: "Simulated MNIST-like data with digit clusters",
      points: [],
    },
    {
      id: "gaussian",
      name: "Gaussian Mixtures",
      description: "Gaussian mixture model with overlapping distributions",
      points: [],
    },
    {
      id: "hierarchical",
      name: "Hierarchical Clusters",
      description: "Hierarchical structure with nested clusters",
      points: [],
    },
  ]

  // Initialize canvas and points
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Generate random points if none exist
    if (points.length === 0) {
      generateClusteredData()
    }

    // Draw points
    drawCanvas()
  }, [points, projectedPoints, iteration, showTrails, colorMode, zoomLevel, panOffset, hoveredPoint, selectedPoint])

  // Animation loop
  useEffect(() => {
    if (isRunning && !algorithmComplete) {
      const animate = (timestamp: number) => {
        if (timestamp - lastUpdateTimeRef.current > 1000 / speed) {
          lastUpdateTimeRef.current = timestamp
          runTSNEIteration()
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

  // Show confetti when algorithm completes
  useEffect(() => {
    if (algorithmComplete) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [algorithmComplete])

  const generateDataset = (datasetId: string) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const newPoints: Point[] = []
    const pointsPerCluster = 30

    switch (datasetId) {
      case "random":
        // Generate random clusters
        for (let c = 0; c < numClusters; c++) {
          // Generate cluster center in high dimensions
          const center: number[] = []
          for (let d = 0; d < dimensions; d++) {
            center.push((Math.random() * 2 - 1) * 3)
          }

          // Generate points around center
          for (let p = 0; p < pointsPerCluster; p++) {
            const originalData: number[] = []
            for (let d = 0; d < dimensions; d++) {
              originalData.push(center[d] + (Math.random() * 0.5 - 0.25))
            }

            // For initial visualization, project to 2D randomly
            const x = (Math.random() * 0.8 + 0.1) * canvas.width
            const y = (Math.random() * 0.8 + 0.1) * canvas.height

            newPoints.push({
              x,
              y,
              originalData,
              cluster: c,
              history: [],
            })
          }
        }
        break

      case "mnist":
        // Simulate MNIST-like data with digit clusters
        const digitCenters = [
          [0.1, 0.1],
          [0.5, 0.1],
          [0.9, 0.1],
          [0.1, 0.5],
          [0.5, 0.5],
          [0.9, 0.5],
          [0.1, 0.9],
          [0.5, 0.9],
          [0.9, 0.9],
        ]

        // Generate up to 9 clusters (digits)
        const digitCount = Math.min(9, numClusters)

        for (let c = 0; c < digitCount; c++) {
          // Create a high-dimensional representation for each digit
          const digitTemplate: number[] = Array(dimensions)
            .fill(0)
            .map(() => Math.random() * 2 - 1)

          // Generate variations of this digit
          for (let p = 0; p < pointsPerCluster; p++) {
            const originalData: number[] = []
            for (let d = 0; d < dimensions; d++) {
              originalData.push(digitTemplate[d] + (Math.random() * 0.3 - 0.15))
            }

            // Initial position based on digit centers
            const x = (digitCenters[c][0] + (Math.random() * 0.1 - 0.05)) * canvas.width
            const y = (digitCenters[c][1] + (Math.random() * 0.1 - 0.05)) * canvas.height

            newPoints.push({
              x,
              y,
              originalData,
              cluster: c,
              history: [],
            })
          }
        }
        break

      case "gaussian":
        // Generate Gaussian mixtures
        const mixtureCenters = []
        for (let c = 0; c < numClusters; c++) {
          const center: number[] = []
          for (let d = 0; d < dimensions; d++) {
            center.push(Math.random() * 2 - 1)
          }
          mixtureCenters.push(center)
        }

        // Generate points from each mixture
        for (let c = 0; c < numClusters; c++) {
          for (let p = 0; p < pointsPerCluster; p++) {
            const originalData: number[] = []
            for (let d = 0; d < dimensions; d++) {
              // Add Gaussian noise
              const variance = 0.2 + Math.random() * 0.3 // Different variance per dimension
              originalData.push(mixtureCenters[c][d] + randn() * variance)
            }

            // Initial random position
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height

            newPoints.push({
              x,
              y,
              originalData,
              cluster: c,
              history: [],
            })
          }
        }
        break

      case "hierarchical":
        // Generate hierarchical clusters
        const mainClusters = Math.min(3, numClusters)
        const subClustersPerMain = Math.ceil(numClusters / mainClusters)

        let clusterIndex = 0

        // Create main clusters
        for (let m = 0; m < mainClusters; m++) {
          // Main cluster center
          const mainCenter: number[] = Array(dimensions)
            .fill(0)
            .map(() => (Math.random() * 2 - 1) * 5)

          // Create sub-clusters around this main center
          for (let s = 0; s < subClustersPerMain && clusterIndex < numClusters; s++) {
            // Sub-cluster center
            const subCenter: number[] = mainCenter.map((v) => v + (Math.random() * 2 - 1) * 1.5)

            // Generate points around sub-cluster
            for (let p = 0; p < pointsPerCluster / subClustersPerMain; p++) {
              const originalData: number[] = []
              for (let d = 0; d < dimensions; d++) {
                originalData.push(subCenter[d] + (Math.random() * 0.5 - 0.25))
              }

              // Initial position - group by main cluster
              const angle = (m / mainClusters) * Math.PI * 2
              const radius = canvas.width * 0.3
              const baseX = canvas.width / 2 + Math.cos(angle) * radius
              const baseY = canvas.height / 2 + Math.sin(angle) * radius

              const x = baseX + (Math.random() * canvas.width * 0.15 - canvas.width * 0.075)
              const y = baseY + (Math.random() * canvas.height * 0.15 - canvas.height * 0.075)

              newPoints.push({
                x,
                y,
                originalData,
                cluster: clusterIndex,
                history: [],
              })
            }

            clusterIndex++
          }
        }
        break

      default:
        // Default to random clusters
        generateClusteredData()
        return
    }

    setPoints(newPoints)
    setProjectedPoints([])
    setIteration(0)
    setAlgorithmComplete(false)
  }

  // Generate random normal distribution value (Box-Muller transform)
  const randn = () => {
    let u = 0,
      v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }

  const handleSelectDataset = (dataset: Dataset) => {
    setIsRunning(false)
    setIteration(0)
    setAlgorithmComplete(false)
    generateDataset(dataset.id)
  }

  // Generate clustered data in high dimensions
  const generateClusteredData = () => {
    generateDataset("random")
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
      const pointsToDraw = projectedPoints.length > 0 ? projectedPoints : points

      pointsToDraw.forEach((point) => {
        if (point.history && point.history.length > 1) {
          ctx.beginPath()
          ctx.moveTo(point.history[0].x, point.history[0].y)

          for (let i = 1; i < point.history.length; i++) {
            ctx.lineTo(point.history[i].x, point.history[i].y)
          }

          ctx.strokeStyle = `${colors[point.cluster % colors.length]}80`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    }

    // Draw points
    const pointsToDraw = projectedPoints.length > 0 ? projectedPoints : points

    pointsToDraw.forEach((point, pointIndex) => {
      // Determine point color based on color mode
      let fillColor = "#ccc"

      if (colorMode === "cluster") {
        fillColor = colors[point.cluster % colors.length]
      } else if (colorMode === "gradient") {
        // Color based on position
        const hue = (point.x / canvas.width) * 360
        const saturation = 70 + (point.y / canvas.height) * 30
        fillColor = `hsl(${hue}, ${saturation}%, 50%)`
      } else if (colorMode === "distance") {
        // Color based on distance from center
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const dist = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2))
        const maxDist = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 2
        const intensity = Math.min(1, dist / maxDist)
        const r = Math.round(255 - intensity * 255)
        const g = Math.round(intensity * 255)
        const b = Math.round(100)
        fillColor = `rgb(${r}, ${g}, ${b})`
      }

      // Draw the point
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.selected ? 8 : 5, 0, Math.PI * 2)
      ctx.fillStyle = fillColor
      ctx.fill()

      // Add highlight for hovered or selected point
      if (pointIndex === hoveredPoint || pointIndex === selectedPoint) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.selected ? 10 : 7, 0, Math.PI * 2)
        ctx.strokeStyle = pointIndex === selectedPoint ? "#000" : "#555"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Draw iteration counter
    ctx.restore() // Restore canvas state before drawing text
    ctx.fillStyle = "#333"
    ctx.font = "14px Arial"
    ctx.fillText(`Iteration: ${iteration}/${maxIterations}`, 10, 20)
  }

  const runTSNEIteration = () => {
    if (iteration >= maxIterations) {
      setIsRunning(false)
      setAlgorithmComplete(true)
      return
    }

    // In a real implementation, we would:
    // 1. Compute pairwise affinities in high-dimensional space
    // 2. Compute pairwise affinities in low-dimensional space
    // 3. Compute gradient of KL divergence
    // 4. Update low-dimensional embeddings

    // For this visualization, we'll simulate t-SNE by gradually moving points
    // to reveal cluster structure
    if (iteration === 0) {
      // Initialize projected points at random positions
      const canvas = canvasRef.current
      if (!canvas) return

      const newProjectedPoints = points.map((point) => ({
        ...point,
        x: (Math.random() * 0.8 + 0.1) * canvas.width,
        y: (Math.random() * 0.8 + 0.1) * canvas.height,
        history: [],
      }))

      setProjectedPoints(newProjectedPoints)
    } else {
      // Update projected points to gradually reveal clusters
      const canvas = canvasRef.current
      if (!canvas) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.4
      const progress = Math.min(iteration / (maxIterations * 0.7), 1) // Complete clustering by 70% of iterations

      // Calculate cluster centers
      const clusterCenters: { x: number; y: number }[] = []
      for (let c = 0; c < numClusters; c++) {
        const angle = (c / numClusters) * Math.PI * 2
        clusterCenters.push({
          x: centerX + Math.cos(angle) * radius * 0.7,
          y: centerY + Math.sin(angle) * radius * 0.7,
        })
      }

      // Move points toward their cluster centers
      const newProjectedPoints = projectedPoints.map((point) => {
        const center = clusterCenters[point.cluster]
        const oldX = point.x
        const oldY = point.y

        // Add some noise to make it look more natural
        const noise = (1 - progress) * radius * 0.3
        const noiseX = (Math.random() * 2 - 1) * noise
        const noiseY = (Math.random() * 2 - 1) * noise

        // Interpolate between current position and cluster center
        const x = point.x * (1 - progress * 0.1) + (center.x + noiseX) * progress * 0.1
        const y = point.y * (1 - progress * 0.1) + (center.y + noiseY) * progress * 0.1

        // Keep track of point history for trails
        const history = [...(point.history || [])]
        if (showTrails && iteration % 5 === 0) {
          // Only store every 5th position to avoid too many points
          history.push({ x: oldX, y: oldY })
          // Limit history length
          if (history.length > 20) {
            history.shift()
          }
        }

        return {
          ...point,
          x,
          y,
          history,
        }
      })

      setProjectedPoints(newProjectedPoints)
    }

    setIteration((prev) => prev + 1)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    const pointsToDraw = projectedPoints.length > 0 ? projectedPoints : points

    // Check if we're clicking on an existing point
    const clickedPointIndex = pointsToDraw.findIndex(
      (point) => Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)) < (point.selected ? 10 : 7) / zoomLevel,
    )

    if (clickedPointIndex >= 0) {
      // If we're in point selection mode
      if (!isRunning) {
        if (selectedPoint === clickedPointIndex) {
          // Deselect if already selected
          setSelectedPoint(null)

          if (projectedPoints.length > 0) {
            setProjectedPoints(projectedPoints.map((p, i) => (i === clickedPointIndex ? { ...p, selected: false } : p)))
          } else {
            setPoints(points.map((p, i) => (i === clickedPointIndex ? { ...p, selected: false } : p)))
          }
        } else {
          // Select the clicked point
          setSelectedPoint(clickedPointIndex)

          if (projectedPoints.length > 0) {
            setProjectedPoints(projectedPoints.map((p, i) => ({ ...p, selected: i === clickedPointIndex })))
          } else {
            setPoints(points.map((p, i) => ({ ...p, selected: i === clickedPointIndex })))
          }
        }
      }
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    const pointsToDraw = projectedPoints.length > 0 ? projectedPoints : points

    // Check if we're clicking on an existing point for dragging
    const clickedPointIndex = pointsToDraw.findIndex(
      (point) => Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)) < (point.selected ? 10 : 7) / zoomLevel,
    )

    if (clickedPointIndex >= 0 && selectedPoint === clickedPointIndex) {
      setIsPointDragging(true)
      return
    }

    // Start panning if pan mode is enabled
    if (isPanEnabled) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    const pointsToDraw = projectedPoints.length > 0 ? projectedPoints : points

    // Update hovered point
    const hoverPointIndex = pointsToDraw.findIndex(
      (point) => Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)) < (point.selected ? 10 : 7) / zoomLevel,
    )

    setHoveredPoint(hoverPointIndex >= 0 ? hoverPointIndex : null)

    // Handle point dragging
    if (isPointDragging && selectedPoint !== null) {
      if (projectedPoints.length > 0) {
        const newProjectedPoints = [...projectedPoints]
        newProjectedPoints[selectedPoint] = {
          ...newProjectedPoints[selectedPoint],
          x,
          y,
          history: [...(newProjectedPoints[selectedPoint].history || []), { x, y }],
        }
        setProjectedPoints(newProjectedPoints)
      } else {
        const newPoints = [...points]
        newPoints[selectedPoint] = {
          ...newPoints[selectedPoint],
          x,
          y,
          history: [...(newPoints[selectedPoint].history || []), { x, y }],
        }
        setPoints(newPoints)
      }
      return
    }

    // Handle panning
    if (isDragging && isPanEnabled) {
      setPanOffset({
        x: panOffset.x + (e.clientX - dragStart.x),
        y: panOffset.y + (e.clientY - dragStart.y),
      })
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setIsPointDragging(false)
  }

  const handleCanvasMouseLeave = () => {
    setIsDragging(false)
    setIsPointDragging(false)
    setHoveredPoint(null)
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

  const resetView = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const toggleRunning = () => {
    if (algorithmComplete) {
      // Reset if algorithm was completed
      setIteration(0)
      setAlgorithmComplete(false)
      setProjectedPoints([])
      setIsRunning(true)
    } else {
      setIsRunning(!isRunning)
    }
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setIteration(0)
    setAlgorithmComplete(false)
    setProjectedPoints([])
    generateClusteredData()
    resetView()
    setSelectedPoint(null)
  }

  const stepForward = () => {
    if (!isRunning && !algorithmComplete) {
      runTSNEIteration()
    }
  }

  const showFinalResult = () => {
    setIteration(maxIterations)
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
    const finalProjectedPoints = points.map((point) => {
      const center = clusterCenters[point.cluster]

      // Add some noise for natural cluster appearance
      const noise = radius * 0.15
      const noiseX = (Math.random() * 2 - 1) * noise
      const noiseY = (Math.random() * 2 - 1) * noise

      return {
        ...point,
        x: center.x + noiseX,
        y: center.y + noiseY,
        history: [],
      }
    })

    setProjectedPoints(finalProjectedPoints)
    setShowConfetti(true)
  }

  // Render confetti particles
  const renderConfetti = () => {
    if (!showConfetti) return null

    const confettiCount = 100
    const confetti = []

    for (let i = 0; i < confettiCount; i++) {
      const left = `${Math.random() * 100}%`
      const animationDuration = `${Math.random() * 3 + 2}s`
      const size = `${Math.random() * 10 + 5}px`
      const background = colors[Math.floor(Math.random() * colors.length)]
      const delay = `${Math.random() * 2}s`

      confetti.push(
        <div
          key={i}
          className="confetti"
          style={{
            left,
            width: size,
            height: size,
            backgroundColor: background,
            animationDuration,
            animationDelay: delay,
          }}
        />,
      )
    }

    return confetti
  }

  return (
    <div className="min-h-screen animated-bg">
      <ParticleBackground />
      {showConfetti && renderConfetti()}

      <InteractiveHeader />

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text">t-SNE Visualization</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Interactive visualization of t-Distributed Stochastic Neighbor Embedding
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  About t-SNE
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>About t-SNE</DialogTitle>
                  <DialogDescription>
                    t-Distributed Stochastic Neighbor Embedding (t-SNE) is a powerful dimensionality reduction
                    technique.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    t-SNE is particularly well-suited for visualizing high-dimensional data in 2D or 3D space. Unlike
                    linear techniques like PCA, t-SNE is able to preserve local structure in the data, making it
                    excellent for revealing clusters and patterns.
                  </p>
                  <p>
                    This interactive visualization demonstrates how t-SNE works by simulating the algorithm's process of
                    gradually organizing high-dimensional data into meaningful clusters in 2D space.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="visualization" className="text-lg py-3">
              <Sparkles className="mr-2 h-4 w-4" />
              Interactive Visualization
            </TabsTrigger>
            <TabsTrigger value="explanation" className="text-lg py-3">
              <Info className="mr-2 h-4 w-4" />
              Algorithm Explanation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 card-border-glow">
                <div className="flex flex-wrap gap-4 mb-6 justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="dimensions-value" className="mb-2 block">
                      Original Dimensions
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="dimensions-value"
                        type="number"
                        min="3"
                        max="50"
                        value={dimensions}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          if (value >= 3 && value <= 50) {
                            setDimensions(value)
                          }
                        }}
                        disabled={isRunning}
                        className="focus-ring"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="interactive-icon">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of dimensions in the original data</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="perplexity-value" className="mb-2 block">
                      Perplexity
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="perplexity-value"
                        type="number"
                        min="5"
                        max="50"
                        step="5"
                        value={perplexity}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          if (value >= 5 && value <= 50) {
                            setPerplexity(value)
                          }
                        }}
                        disabled={isRunning}
                        className="focus-ring"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="interactive-icon">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Controls the balance between local and global structure</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="clusters-value" className="mb-2 block">
                      Number of Clusters
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="clusters-value"
                        type="number"
                        min="2"
                        max="10"
                        value={numClusters}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          if (value >= 2 && value <= 10) {
                            setNumClusters(value)
                          }
                        }}
                        disabled={isRunning}
                        className="focus-ring"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="interactive-icon">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of clusters in the dataset</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <Label className="mb-2 block">Dataset</Label>
                    <DatasetSelector
                      datasets={predefinedDatasets}
                      onSelectDataset={handleSelectDataset}
                      onGenerateRandom={generateClusteredData}
                    />
                  </div>
                </div>

                <VisualizationControls
                  isRunning={isRunning}
                  toggleRunning={toggleRunning}
                  stepForward={stepForward}
                  resetSimulation={resetSimulation}
                  speed={speed}
                  setSpeed={setSpeed}
                  showTrails={showTrails}
                  setShowTrails={setShowTrails}
                  colorMode={colorMode}
                  setColorMode={setColorMode}
                  isZoomEnabled={isZoomEnabled}
                  toggleZoom={toggleZoom}
                  isPanEnabled={isPanEnabled}
                  togglePan={togglePan}
                  zoomIn={zoomIn}
                  zoomOut={zoomOut}
                  resetView={resetView}
                  isComplete={algorithmComplete}
                />

                <div className="flex justify-center my-4">
                  <Button
                    onClick={showFinalResult}
                    variant="outline"
                    disabled={isRunning}
                    className="interactive-button"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Show Final Result
                  </Button>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md mb-4 shimmer">
                  <div className="flex justify-between items-center">
                    <div className="text-slate-700 dark:text-slate-300">
                      Iteration: {iteration}/{maxIterations}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      {algorithmComplete ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">Complete!</span>
                      ) : isRunning ? (
                        <span className="text-blue-600 dark:text-blue-400">Running...</span>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400">Ready</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-[500px] bg-white dark:bg-slate-900 cursor-crosshair"
                    onClick={handleCanvasClick}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseLeave}
                  ></canvas>
                </div>

                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    The visualization shows how t-SNE preserves local structure in high-dimensional data by projecting
                    it to 2D space.
                  </p>
                  <p>Select points to see their details and drag them to explore different arrangements.</p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 animated-underline">
                  t-Distributed Stochastic Neighbor Embedding (t-SNE)
                </h2>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">What is t-SNE?</h3>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      t-Distributed Stochastic Neighbor Embedding (t-SNE) is a non-linear dimensionality reduction
                      technique that is particularly well-suited for visualizing high-dimensional data in a
                      low-dimensional space (typically 2D or 3D).
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Unlike linear techniques like PCA, t-SNE is able to preserve local structure in the data, making
                      it excellent for revealing clusters and patterns that might not be apparent in the original
                      high-dimensional space.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Interactive Demo</h3>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      Explore how t-SNE works with this interactive visualization. Adjust the perplexity to see how it
                      affects the clustering.
                    </p>
                    <TSNEVisualization dimensions={10} perplexity={30} numClusters={5} iterations={100} />
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">How t-SNE Works</h3>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                      <li className="pl-2">
                        <span className="font-medium">Compute Pairwise Similarities in High Dimensions:</span> For each
                        pair of points, compute a conditional probability that represents their similarity.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Initialize Low-Dimensional Embeddings:</span> Randomly initialize
                        points in the low-dimensional space.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Compute Pairwise Similarities in Low Dimensions:</span> Use a
                        t-distribution to compute similarities between points in the low-dimensional space.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium">Minimize KL Divergence:</span> Iteratively update the
                        low-dimensional embeddings to minimize the Kullback-Leibler divergence between the
                        high-dimensional and low-dimensional probability distributions.
                      </li>
                    </ol>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      Mathematical Formulation
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      In the high-dimensional space, the similarity between points x_i and x_j is represented as a
                      conditional probability:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md text-center mb-4">
                      <p className="text-slate-800 dark:text-slate-200 font-mono">
                        p_j|i = exp(-||x_i - x_j||² / 2σ_i²) / ∑_{k != i} exp(-||x_i - x_k||² / 2σ_i²)
                      </p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      In the low-dimensional space, t-SNE uses a Student's t-distribution to compute similarities:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md text-center mb-4">
                      <p className="text-slate-800 dark:text-slate-200 font-mono">
                        q_ij = (1 + ||y_i - y_j||²)^{-1} / ∑_{k != l} (1 + ||y_k - y_l||²)^{-1}
                      </p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      The Kullback-Leibler divergence between P and Q is minimized:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md text-center mb-4">
                      <p className="text-slate-800 dark:text-slate-200 font-mono">
                        KL(P||Q) = ∑_i ∑_j p_ij log(p_ij / q_ij)
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      Understanding Perplexity
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                      Perplexity is one of the most important parameters in t-SNE. It can be interpreted as a smooth
                      measure of the effective number of neighbors each point has.
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      The perplexity value influences how t-SNE balances attention between local and global aspects of
                      the data:
                    </p>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                      <li>
                        <span className="font-medium">Low perplexity (5-10):</span> Focuses on very local structure, may
                        miss global patterns
                      </li>
                      <li>
                        <span className="font-medium">Medium perplexity (30-50):</span> Balances local and global
                        structure
                      </li>
                      <li>
                        <span className="font-medium">High perplexity (&gt;50):</span> Focuses more on global structure,
                        may compress clusters
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      Advantages and Limitations
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                        <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Advantages</h4>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                          <li>Preserves local structure of the data</li>
                          <li>Can reveal clusters and patterns</li>
                          <li>Works well for non-linear relationships</li>
                          <li>Effective for visualization</li>
                          <li>Robust to different data distributions</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                        <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Limitations</h4>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                          <li>Computationally intensive (O(n²))</li>
                          <li>Non-deterministic (results may vary between runs)</li>
                          <li>Cannot project new data without retraining</li>
                          <li>May not preserve global structure</li>
                          <li>Sensitive to hyperparameters</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Applications</h3>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                      <li>Visualizing high-dimensional data</li>
                      <li>Exploring clusters in data</li>
                      <li>Single-cell RNA sequencing analysis</li>
                      <li>Image and document visualization</li>
                      <li>Feature extraction for machine learning</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Study Resources</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-md">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Papers</h4>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                          <li>Visualizing Data using t-SNE by Laurens van der Maaten & Geoffrey Hinton (2008)</li>
                          <li>How to Use t-SNE Effectively by Martin Wattenberg, et al. (2016)</li>
                          <li>Accelerating t-SNE using Tree-Based Algorithms by Laurens van der Maaten (2014)</li>
                        </ul>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-md">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Online Resources</h4>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                          <li>Scikit-learn Documentation on t-SNE</li>
                          <li>Distill.pub: How to Use t-SNE Effectively</li>
                          <li>Google's Embedding Projector with t-SNE</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <InteractiveFooter />
    </div>
  )
}

