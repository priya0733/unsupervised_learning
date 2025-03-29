"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Home, RefreshCw, Play, Pause, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Point {
  x: number
  y: number
  cluster: number
  type: "core" | "border" | "noise" | "unclassified"
}

export default function DBSCANPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [epsilon, setEpsilon] = useState(30)
  const [minPoints, setMinPoints] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [step, setStep] = useState(0)
  const [currentCluster, setCurrentCluster] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [activeTab, setActiveTab] = useState("visualization")
  const [algorithmComplete, setAlgorithmComplete] = useState(false)
  const animationRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const processingPointIndexRef = useRef<number>(-1)
  const neighborPointsRef = useRef<number[]>([])

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

    // Draw points
    drawCanvas()
  }, [points, canvasRef.current])

  // Animation loop
  useEffect(() => {
    if (isRunning && !algorithmComplete) {
      const animate = (timestamp: number) => {
        if (timestamp - lastUpdateTimeRef.current > 1000 / speed) {
          lastUpdateTimeRef.current = timestamp
          runDBSCANStep()
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

  const generateRandomPoints = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const newPoints: Point[] = []

    // Generate clusters of points
    // Cluster 1
    for (let i = 0; i < 40; i++) {
      newPoints.push({
        x: 100 + Math.random() * 150,
        y: 100 + Math.random() * 150,
        cluster: -1,
        type: "unclassified",
      })
    }

    // Cluster 2
    for (let i = 0; i < 40; i++) {
      newPoints.push({
        x: 400 + Math.random() * 150,
        y: 300 + Math.random() * 150,
        cluster: -1,
        type: "unclassified",
      })
    }

    // Random noise points
    for (let i = 0; i < 20; i++) {
      newPoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        cluster: -1,
        type: "unclassified",
      })
    }

    setPoints(newPoints)
    setStep(0)
    setCurrentCluster(0)
    setAlgorithmComplete(false)
    processingPointIndexRef.current = -1
    neighborPointsRef.current = []
  }

  const drawCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw epsilon radius for processing point
    if (processingPointIndexRef.current >= 0) {
      const point = points[processingPointIndexRef.current]
      ctx.beginPath()
      ctx.arc(point.x, point.y, epsilon, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(200, 200, 200, 0.2)"
      ctx.fill()
      ctx.strokeStyle = "rgba(150, 150, 150, 0.8)"
      ctx.stroke()
    }

    // Draw points
    points.forEach((point, index) => {
      // Point size based on type
      let size = 5
      if (point.type === "core") size = 7
      else if (point.type === "border") size = 5
      else if (point.type === "noise") size = 3

      // Point color based on cluster
      let color = "#ccc" // Unclassified
      if (point.cluster >= 0) {
        color = colors[point.cluster % colors.length]
      } else if (point.type === "noise") {
        color = "#999" // Noise points
      }

      // Highlight current processing point
      if (index === processingPointIndexRef.current) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, size + 5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 0, 0.3)"
        ctx.fill()
      }

      // Highlight neighbor points
      if (neighborPointsRef.current.includes(index)) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, size + 3, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 255, 255, 0.3)"
        ctx.fill()
      }

      // Draw the point
      ctx.beginPath()
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Add border for core and border points
      if (point.type === "core" || point.type === "border") {
        ctx.strokeStyle = point.type === "core" ? "#000" : "#555"
        ctx.lineWidth = point.type === "core" ? 2 : 1
        ctx.stroke()
      }
    })
  }

  const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  }

  const getNeighbors = (pointIndex: number) => {
    const neighbors: number[] = []
    const point = points[pointIndex]

    points.forEach((p, i) => {
      if (i !== pointIndex && distance(point, p) <= epsilon) {
        neighbors.push(i)
      }
    })

    return neighbors
  }

  const runDBSCANStep = () => {
    // If all points are processed, algorithm is complete
    if (step >= points.length) {
      setIsRunning(false)
      setAlgorithmComplete(true)
      return
    }

    const newPoints = [...points]

    // Current point being processed
    const pointIndex = step
    const point = newPoints[pointIndex]

    // Skip already processed points
    if (point.cluster !== -1 || point.type === "noise") {
      setStep(step + 1)
      return
    }

    // Set current processing point for visualization
    processingPointIndexRef.current = pointIndex

    // Find neighbors
    const neighbors = getNeighbors(pointIndex)
    neighborPointsRef.current = neighbors

    // Check if point has enough neighbors to be a core point
    if (neighbors.length < minPoints) {
      // Mark as noise for now (might become border later)
      newPoints[pointIndex] = { ...point, type: "noise" }
      setPoints(newPoints)
      setStep(step + 1)
      return
    }

    // This is a core point, start a new cluster
    newPoints[pointIndex] = {
      ...point,
      cluster: currentCluster,
      type: "core",
    }

    // Process neighbors
    const seedSet = [...neighbors]
    let seedIndex = 0

    while (seedIndex < seedSet.length) {
      const currentSeed = seedSet[seedIndex]
      const currentPoint = newPoints[currentSeed]

      // If this point was previously marked as noise, make it a border point
      if (currentPoint.type === "noise") {
        newPoints[currentSeed] = {
          ...currentPoint,
          cluster: currentCluster,
          type: "border",
        }
      }

      // If this point is unclassified
      if (currentPoint.cluster === -1) {
        // Add to current cluster
        newPoints[currentSeed] = {
          ...currentPoint,
          cluster: currentCluster,
          type: "border", // Assume border first
        }

        // Find its neighbors
        const currentNeighbors = getNeighbors(currentSeed)

        // If it has enough neighbors, it's a core point
        if (currentNeighbors.length >= minPoints) {
          newPoints[currentSeed].type = "core"

          // Add new neighbors to seed set
          currentNeighbors.forEach((n) => {
            if (!seedSet.includes(n) && newPoints[n].cluster === -1) {
              seedSet.push(n)
            }
          })
        }
      }

      seedIndex++
    }

    setPoints(newPoints)
    setCurrentCluster(currentCluster + 1)
    setStep(step + 1)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isRunning) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPoints([
      ...points,
      {
        x,
        y,
        cluster: -1,
        type: "unclassified",
      },
    ])
  }

  const toggleRunning = () => {
    if (algorithmComplete) {
      // Reset if algorithm was completed
      resetSimulation()
      setIsRunning(true)
    } else {
      setIsRunning(!isRunning)
    }
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setStep(0)
    setCurrentCluster(0)
    setAlgorithmComplete(false)
    processingPointIndexRef.current = -1
    neighborPointsRef.current = []

    // Reset all points to unclassified
    setPoints(
      points.map((p) => ({
        ...p,
        cluster: -1,
        type: "unclassified",
      })),
    )
  }

  const stepForward = () => {
    if (!isRunning && !algorithmComplete) {
      runDBSCANStep()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">DBSCAN Clustering</h1>
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
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="epsilon-value">Epsilon (ε) - Radius</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="epsilon-value"
                      type="number"
                      min="10"
                      max="100"
                      value={epsilon}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (value >= 10 && value <= 100) {
                          setEpsilon(value)
                        }
                      }}
                      disabled={isRunning}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="min-points-value">MinPoints</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="min-points-value"
                      type="number"
                      min="2"
                      max="20"
                      value={minPoints}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (value >= 2 && value <= 20) {
                          setMinPoints(value)
                        }
                      }}
                      disabled={isRunning}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="speed-slider">Animation Speed</Label>
                  <Slider
                    id="speed-slider"
                    min={1}
                    max={10}
                    step={1}
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                  />
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <div className="flex gap-2">
                  <Button onClick={toggleRunning} variant="default">
                    {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isRunning ? "Pause" : algorithmComplete ? "Restart" : "Start"}
                  </Button>
                  <Button onClick={stepForward} variant="outline" disabled={isRunning || algorithmComplete}>
                    <SkipForward className="mr-2 h-4 w-4" />
                    Step
                  </Button>
                  <Button onClick={resetSimulation} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="bg-slate-100 p-2 rounded-md mb-4 text-center">
                <p className="text-slate-700">
                  Points Processed: {step} of {points.length} | Clusters Found: {currentCluster} |
                  {algorithmComplete ? (
                    <span className="text-green-600 font-medium"> Complete!</span>
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
                ></canvas>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 rounded-full bg-slate-300 mr-2"></span>
                  <span className="text-slate-600">Unclassified Points</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 rounded-full bg-slate-500 mr-2"></span>
                  <span className="text-slate-600">Noise Points</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-black mr-2"></span>
                  <span className="text-slate-600">Core Points</span>
                </div>
              </div>

              <div className="mt-2 text-sm text-slate-600">
                <p>Click on the canvas to add points manually (when not running)</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">DBSCAN Clustering Algorithm</h2>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">What is DBSCAN?</h3>
                  <p className="text-slate-700 mb-2">
                    Density-Based Spatial Clustering of Applications with Noise (DBSCAN) is a density-based clustering
                    algorithm that groups together points that are closely packed in areas of high density, separating
                    them from areas of low density.
                  </p>
                  <p className="text-slate-700">
                    Unlike K-means, DBSCAN doesn't require specifying the number of clusters beforehand and can find
                    arbitrarily shaped clusters. It can also identify noise points that don't belong to any cluster.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Key Concepts in DBSCAN</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Parameters</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-2">
                        <li>
                          <span className="font-medium">Epsilon (ε):</span> The radius that defines the neighborhood
                          around a point. Points within this distance are considered neighbors.
                        </li>
                        <li>
                          <span className="font-medium">MinPoints:</span> The minimum number of points required to form
                          a dense region (including the point itself).
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Point Types</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-2">
                        <li>
                          <span className="font-medium">Core Points:</span> Points that have at least MinPoints points
                          within distance ε.
                        </li>
                        <li>
                          <span className="font-medium">Border Points:</span> Points that are within distance ε of a
                          core point but don't have enough neighbors to be core points themselves.
                        </li>
                        <li>
                          <span className="font-medium">Noise Points:</span> Points that are neither core points nor
                          border points.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">How DBSCAN Works</h3>
                  <ol className="list-decimal list-inside space-y-4 text-slate-700">
                    <li className="pl-2">
                      <span className="font-medium">Initialization:</span> Label all points as unvisited.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Point Selection:</span> Select an unvisited point and mark it as
                      visited.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Neighborhood Check:</span> Find all points within distance ε of the
                      selected point.
                      <ul className="list-disc list-inside ml-6 mt-2">
                        <li>
                          If there are fewer than MinPoints neighbors, mark the point as noise (it may later become a
                          border point).
                        </li>
                        <li>
                          If there are at least MinPoints neighbors, mark the point as a core point and start a new
                          cluster.
                        </li>
                      </ul>
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Cluster Expansion:</span> For each neighbor that is not yet assigned
                      to a cluster:
                      <ul className="list-disc list-inside ml-6 mt-2">
                        <li>Add it to the current cluster.</li>
                        <li>If it has at least MinPoints neighbors, add all its neighbors to the processing queue.</li>
                      </ul>
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Repeat:</span> Continue until all points have been visited.
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Advantages and Limitations</h3>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium text-green-800 mb-2">Advantages</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Doesn't require specifying the number of clusters</li>
                        <li>Can find arbitrarily shaped clusters</li>
                        <li>Robust to outliers (identifies them as noise)</li>
                        <li>Only requires two parameters</li>
                        <li>Can handle clusters of different sizes and shapes</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-md">
                      <h4 className="font-medium text-red-800 mb-2">Limitations</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Struggles with varying density clusters</li>
                        <li>Sensitive to parameter selection (ε and MinPoints)</li>
                        <li>Not as efficient for high-dimensional data</li>
                        <li>Memory intensive for large datasets</li>
                        <li>Struggles with clusters that are very close to each other</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Applications</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2">
                    <li>Spatial data analysis in geographic information systems</li>
                    <li>Anomaly detection in various domains</li>
                    <li>Image segmentation</li>
                    <li>Network traffic analysis</li>
                    <li>Bioinformatics for gene expression data</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Study Resources</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Books</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Introduction to Data Mining by Tan, Steinbach, and Kumar</li>
                        <li>Data Clustering: Algorithms and Applications by Aggarwal and Reddy</li>
                        <li>Mining of Massive Datasets by Leskovec, Rajaraman, and Ullman</li>
                      </ul>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Online Resources</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Scikit-learn Documentation on DBSCAN</li>
                        <li>Stanford CS246: Mining Massive Datasets</li>
                        <li>Coursera Data Mining Specialization</li>
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
          <p className="text-center">Interactive DBSCAN Clustering Visualization | Created for educational purposes</p>
        </div>
      </footer>
    </div>
  )
}

