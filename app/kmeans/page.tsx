"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Home, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetSelector, type Dataset } from "@/components/dataset-selector"
import { VisualizationControls } from "@/components/visualization-controls"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Point {
  x: number
  y: number
  cluster: number
  history?: Array<{ x: number; y: number }>
  selected?: boolean
}

interface Centroid {
  x: number
  y: number
  history?: Array<{ x: number; y: number }>
}

export default function KMeansPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [centroids, setCentroids] = useState<Centroid[]>([])
  const [k, setK] = useState(3)
  const [isRunning, setIsRunning] = useState(false)
  const [iteration, setIteration] = useState(0)
  const [maxIterations, setMaxIterations] = useState(20)
  const [speed, setSpeed] = useState(1)
  const [convergenceReached, setConvergenceReached] = useState(false)
  const [activeTab, setActiveTab] = useState("visualization")
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
      name: "Random Points",
      description: "Randomly distributed points across the canvas",
      points: [],
    },
    {
      id: "clusters",
      name: "Predefined Clusters",
      description: "Points arranged in visible clusters",
      points: [],
    },
    {
      id: "circle",
      name: "Circular Pattern",
      description: "Points arranged in concentric circles",
      points: [],
    },
    {
      id: "spiral",
      name: "Spiral Pattern",
      description: "Points arranged in a spiral pattern",
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
      generateRandomPoints()
    }

    // Draw points and centroids
    drawCanvas()
  }, [points, centroids, canvasRef.current, showTrails, colorMode, zoomLevel, panOffset, hoveredPoint, selectedPoint])

  // Animation loop
  useEffect(() => {
    if (isRunning && !convergenceReached) {
      const animate = (timestamp: number) => {
        if (timestamp - lastUpdateTimeRef.current > 1000 / speed) {
          lastUpdateTimeRef.current = timestamp
          runKMeansIteration()
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
  }, [isRunning, convergenceReached, speed])

  const generateDataset = (datasetId: string) => {
    if (!canvasRef.current) return []

    const canvas = canvasRef.current
    const width = canvas.width
    const height = canvas.height
    const newPoints: Point[] = []

    switch (datasetId) {
      case "random":
        // Generate 100 random points
        for (let i = 0; i < 100; i++) {
          newPoints.push({
            x: Math.random() * width,
            y: Math.random() * height,
            cluster: -1,
            history: [],
          })
        }
        break
      case "clusters":
        // Generate 3 distinct clusters
        const clusterCenters = [
          { x: width * 0.25, y: height * 0.25 },
          { x: width * 0.75, y: height * 0.25 },
          { x: width * 0.5, y: height * 0.75 },
        ]

        clusterCenters.forEach((center, idx) => {
          for (let i = 0; i < 30; i++) {
            newPoints.push({
              x: center.x + (Math.random() - 0.5) * width * 0.2,
              y: center.y + (Math.random() - 0.5) * height * 0.2,
              cluster: -1,
              history: [],
            })
          }
        })
        break
      case "circle":
        // Generate points in concentric circles
        const centerX = width / 2
        const centerY = height / 2
        const radiusStep = (Math.min(width, height) * 0.3) / 3

        for (let r = 1; r <= 3; r++) {
          const radius = r * radiusStep
          const pointCount = r * 15

          for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2
            const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * radiusStep * 0.5
            const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * radiusStep * 0.5

            newPoints.push({
              x,
              y,
              cluster: -1,
              history: [],
            })
          }
        }
        break
      case "spiral":
        // Generate points in a spiral pattern
        const spiralCenterX = width / 2
        const spiralCenterY = height / 2
        const spiralCount = 2
        const pointsPerSpiral = 50

        for (let i = 0; i < pointsPerSpiral; i++) {
          const t = (i / pointsPerSpiral) * spiralCount * Math.PI * 2
          const radius = (i / pointsPerSpiral) * Math.min(width, height) * 0.4
          const x = spiralCenterX + Math.cos(t) * radius + (Math.random() - 0.5) * 10
          const y = spiralCenterY + Math.sin(t) * radius + (Math.random() - 0.5) * 10

          newPoints.push({
            x,
            y,
            cluster: -1,
            history: [],
          })
        }
        break
      default:
        // Default to random
        for (let i = 0; i < 100; i++) {
          newPoints.push({
            x: Math.random() * width,
            y: Math.random() * height,
            cluster: -1,
            history: [],
          })
        }
    }

    return newPoints
  }

  const handleSelectDataset = (dataset: Dataset) => {
    setIsRunning(false)
    setIteration(0)
    setConvergenceReached(false)

    const newPoints = generateDataset(dataset.id)
    setPoints(newPoints)

    // Initialize centroids for the new dataset
    initializeCentroids(newPoints)
  }

  const generateRandomPoints = () => {
    if (!canvasRef.current) return

    const newPoints = generateDataset("random")
    setPoints(newPoints)
    initializeCentroids(newPoints)
    setIteration(0)
    setConvergenceReached(false)
  }

  const initializeCentroids = (pointsArray = points) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const newCentroids: Centroid[] = []

    // Initialize k random centroids
    for (let i = 0; i < k; i++) {
      newCentroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        history: [],
      })
    }

    setCentroids(newCentroids)
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

    // Draw point trails if enabled
    if (showTrails) {
      points.forEach((point, pointIndex) => {
        if (point.history && point.history.length > 1) {
          ctx.beginPath()
          ctx.moveTo(point.history[0].x, point.history[0].y)

          for (let i = 1; i < point.history.length; i++) {
            ctx.lineTo(point.history[i].x, point.history[i].y)
          }

          ctx.strokeStyle = point.cluster >= 0 ? `${colors[point.cluster % colors.length]}80` : "#ccc"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      // Draw centroid trails
      centroids.forEach((centroid, i) => {
        if (centroid.history && centroid.history.length > 1) {
          ctx.beginPath()
          ctx.moveTo(centroid.history[0].x, centroid.history[0].y)

          for (let i = 1; i < centroid.history.length; i++) {
            ctx.lineTo(centroid.history[i].x, centroid.history[i].y)
          }

          ctx.strokeStyle = `${colors[i % colors.length]}80`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    }

    // Draw points
    points.forEach((point, pointIndex) => {
      // Determine point color based on color mode
      let fillColor = "#ccc"

      if (colorMode === "cluster") {
        fillColor = point.cluster >= 0 ? colors[point.cluster % colors.length] : "#ccc"
      } else if (colorMode === "gradient") {
        // Color based on position
        const hue = (point.x / canvas.width) * 360
        const saturation = 70 + (point.y / canvas.height) * 30
        fillColor = `hsl(${hue}, ${saturation}%, 50%)`
      } else if (colorMode === "distance") {
        // Color based on distance to nearest centroid
        if (centroids.length > 0 && point.cluster >= 0) {
          const centroid = centroids[point.cluster]
          const dist = distance(point, centroid)
          const maxDist = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
          const intensity = Math.min(1, dist / (maxDist * 0.3))
          const r = Math.round(255 - intensity * 255)
          const g = Math.round(intensity * 255)
          const b = Math.round(100)
          fillColor = `rgb(${r}, ${g}, ${b})`
        }
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

    // Draw centroids
    centroids.forEach((centroid, i) => {
      ctx.beginPath()
      ctx.arc(centroid.x, centroid.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Restore canvas state
    ctx.restore()
  }

  const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  }

  const assignPointsToClusters = () => {
    const newPoints = [...points]
    let changed = false

    newPoints.forEach((point, i) => {
      let minDist = Number.POSITIVE_INFINITY
      let closestCluster = -1

      centroids.forEach((centroid, j) => {
        const dist = distance(point, centroid)
        if (dist < minDist) {
          minDist = dist
          closestCluster = j
        }
      })

      if (point.cluster !== closestCluster) {
        changed = true
        newPoints[i] = {
          ...point,
          cluster: closestCluster,
          history: [...(point.history || []), { x: point.x, y: point.y }],
        }
      }
    })

    setPoints(newPoints)
    return changed
  }

  const updateCentroids = () => {
    const newCentroids = [...centroids]

    for (let i = 0; i < k; i++) {
      const clusterPoints = points.filter((p) => p.cluster === i)

      if (clusterPoints.length > 0) {
        const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0)
        const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0)

        const oldX = newCentroids[i].x
        const oldY = newCentroids[i].y

        newCentroids[i] = {
          x: sumX / clusterPoints.length,
          y: sumY / clusterPoints.length,
          history: [...(newCentroids[i].history || []), { x: oldX, y: oldY }],
        }
      }
    }

    setCentroids(newCentroids)
  }

  const runKMeansIteration = () => {
    if (iteration >= maxIterations) {
      setIsRunning(false)
      setConvergenceReached(true)
      return
    }

    const changed = assignPointsToClusters()
    updateCentroids()

    setIteration((prev) => prev + 1)

    if (!changed) {
      setIsRunning(false)
      setConvergenceReached(true)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    // Check if we're clicking on an existing point
    const clickedPointIndex = points.findIndex(
      (point) => distance(point, { x, y }) < (point.selected ? 10 : 7) / zoomLevel,
    )

    if (clickedPointIndex >= 0) {
      // If we're in point selection mode
      if (!isRunning) {
        if (selectedPoint === clickedPointIndex) {
          // Deselect if already selected
          setSelectedPoint(null)
          setPoints(points.map((p, i) => (i === clickedPointIndex ? { ...p, selected: false } : p)))
        } else {
          // Select the clicked point
          setSelectedPoint(clickedPointIndex)
          setPoints(points.map((p, i) => ({ ...p, selected: i === clickedPointIndex })))
        }
      }
      return
    }

    // If not dragging or zooming, add a new point
    if (!isRunning && !isPanEnabled && !isZoomEnabled) {
      setPoints([...points, { x, y, cluster: -1, history: [] }])
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    // Check if we're clicking on an existing point for dragging
    const clickedPointIndex = points.findIndex(
      (point) => distance(point, { x, y }) < (point.selected ? 10 : 7) / zoomLevel,
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

    // Start zooming if zoom mode is enabled
    if (isZoomEnabled) {
      setDragStart({ x, y })
      return
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel

    // Update hovered point
    const hoverPointIndex = points.findIndex(
      (point) => distance(point, { x, y }) < (point.selected ? 10 : 7) / zoomLevel,
    )

    setHoveredPoint(hoverPointIndex >= 0 ? hoverPointIndex : null)

    // Handle point dragging
    if (isPointDragging && selectedPoint !== null) {
      const newPoints = [...points]
      newPoints[selectedPoint] = {
        ...newPoints[selectedPoint],
        x,
        y,
        history: [...(newPoints[selectedPoint].history || []), { x, y }],
      }
      setPoints(newPoints)
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
    if (convergenceReached) {
      // Reset if convergence was reached
      setIteration(0)
      setConvergenceReached(false)

      // Reset cluster assignments
      setPoints(points.map((p) => ({ ...p, cluster: -1, history: [] })))

      // Initialize new centroids
      initializeCentroids()
    }

    setIsRunning(!isRunning)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setIteration(0)
    setConvergenceReached(false)
    generateRandomPoints()
    resetView()
    setSelectedPoint(null)
  }

  const stepForward = () => {
    if (!isRunning && !convergenceReached) {
      runKMeansIteration()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">K-means Clustering</h1>
            <p className="mt-1 text-slate-600">Interactive visualization and explanation</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="visualization">Interactive Visualization</TabsTrigger>
            <TabsTrigger value="explanation">Algorithm Explanation</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap gap-4 mb-6 justify-between">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="k-value" className="mb-2 block">
                    Number of Clusters (K)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="k-value"
                      type="number"
                      min="1"
                      max="10"
                      value={k}
                      onChange={(e) => {
                        const newK = Number.parseInt(e.target.value)
                        if (newK >= 1 && newK <= 10) {
                          setK(newK)
                          if (!isRunning) {
                            initializeCentroids()
                          }
                        }
                      }}
                      disabled={isRunning}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of clusters to create</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="max-iterations" className="mb-2 block">
                    Max Iterations
                  </Label>
                  <Input
                    id="max-iterations"
                    type="number"
                    min="1"
                    max="100"
                    value={maxIterations}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (value >= 1 && value <= 100) {
                        setMaxIterations(value)
                      }
                    }}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label className="mb-2 block">Dataset</Label>
                  <DatasetSelector
                    datasets={predefinedDatasets}
                    onSelectDataset={handleSelectDataset}
                    onGenerateRandom={generateRandomPoints}
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
                isComplete={convergenceReached}
              />

              <div className="bg-slate-100 p-2 rounded-md my-4 text-center">
                <p className="text-slate-700">
                  Iteration: {iteration} |
                  {convergenceReached ? (
                    <span className="text-green-600 font-medium"> Convergence reached!</span>
                  ) : isRunning ? (
                    <span className="text-blue-600"> Running...</span>
                  ) : (
                    <span className="text-slate-600"> Ready</span>
                  )}
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[500px] bg-white cursor-crosshair"
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                ></canvas>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                <p>Click on the canvas to add points manually (when not running)</p>
                <p>Select a point to drag it to a new position</p>
                <p>Use the zoom and pan controls to navigate the visualization</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">K-means Clustering Algorithm</h2>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">What is K-means?</h3>
                  <p className="text-slate-700 mb-2">
                    K-means is one of the simplest and most popular unsupervised machine learning algorithms for
                    clustering analysis. The goal of K-means is to partition n observations into k clusters where each
                    observation belongs to the cluster with the nearest mean (cluster center or centroid).
                  </p>
                  <p className="text-slate-700">
                    The algorithm aims to minimize the within-cluster sum of squares (WCSS), which is the sum of the
                    squared Euclidean distances between points and their assigned cluster centroids.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">How K-means Works</h3>
                  <ol className="list-decimal list-inside space-y-4 text-slate-700">
                    <li className="pl-2">
                      <span className="font-medium">Initialization:</span> Randomly select K points as initial
                      centroids.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Assignment Step:</span> Assign each data point to the nearest
                      centroid, forming K clusters.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Update Step:</span> Recalculate the centroids by taking the mean of
                      all points assigned to that centroid's cluster.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Repeat:</span> Repeat steps 2 and 3 until centroids no longer move
                      significantly or a maximum number of iterations is reached.
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Mathematical Formulation</h3>
                  <p className="text-slate-700 mb-4">
                    K-means aims to minimize the objective function, which is the sum of squared distances from each
                    point to its assigned centroid:
                  </p>
                  <div className="bg-slate-50 p-4 rounded-md text-center mb-4">
                    <p className="text-slate-800 font-mono">
                      J = Σ Σ ||x<sub>i</sub>
                      <sup>(j)</sup> - c<sub>j</sub>||<sup>2</sup>
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      Where x<sub>i</sub>
                      <sup>(j)</sup> is the i-th data point in cluster j, and c<sub>j</sub> is the centroid of cluster j
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Advantages and Limitations</h3>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium text-green-800 mb-2">Advantages</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Simple to understand and implement</li>
                        <li>Scales well to large datasets</li>
                        <li>Guarantees convergence</li>
                        <li>Works well when clusters are spherical and similar in size</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-md">
                      <h4 className="font-medium text-red-800 mb-2">Limitations</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Requires specifying K in advance</li>
                        <li>Sensitive to initial centroid positions</li>
                        <li>Not suitable for non-spherical clusters</li>
                        <li>Sensitive to outliers</li>
                        <li>May converge to local optima</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Applications</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2">
                    <li>Customer segmentation for marketing strategies</li>
                    <li>Document classification and topic modeling</li>
                    <li>Image compression and segmentation</li>
                    <li>Anomaly detection</li>
                    <li>Recommendation systems</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Study Resources</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Books</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Introduction to Data Mining by Tan, Steinbach, and Kumar</li>
                        <li>Pattern Recognition and Machine Learning by Christopher Bishop</li>
                        <li>Data Mining: Concepts and Techniques by Han and Kamber</li>
                      </ul>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Online Resources</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Stanford CS229 Machine Learning Course</li>
                        <li>Scikit-learn Documentation on K-means</li>
                        <li>Coursera Machine Learning Specialization</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-8 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center">Interactive K-means Clustering Visualization | Created for educational purposes</p>
        </div>
      </footer>
    </div>
  )
}

