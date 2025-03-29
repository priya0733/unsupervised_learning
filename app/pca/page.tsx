"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Home, RefreshCw, Play, Pause, SkipForward, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Point {
  x: number
  y: number
  originalData: number[]
}

export default function PCAPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [projectedPoints, setProjectedPoints] = useState<Point[]>([])
  const [dimensions, setDimensions] = useState(5)
  const [components, setComponents] = useState(2)
  const [correlation, setCorrelation] = useState(0.7)
  const [isRunning, setIsRunning] = useState(false)
  const [step, setStep] = useState(0)
  const [maxSteps, setMaxSteps] = useState(4)
  const [speed, setSpeed] = useState(1)
  const [activeTab, setActiveTab] = useState("visualization")
  const [algorithmComplete, setAlgorithmComplete] = useState(false)
  const animationRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)

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
      generateRandomData()
    }

    // Draw points
    drawCanvas()
  }, [points, projectedPoints, step, canvasRef.current])

  // Animation loop
  useEffect(() => {
    if (isRunning && !algorithmComplete) {
      const animate = (timestamp: number) => {
        if (timestamp - lastUpdateTimeRef.current > 1000 / speed) {
          lastUpdateTimeRef.current = timestamp
          runPCAStep()
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

  // Generate random data with correlation
  const generateRandomData = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const newPoints: Point[] = []
    const numPoints = 100

    // Generate correlated data in higher dimensions
    for (let i = 0; i < numPoints; i++) {
      // Generate a base value that will influence all dimensions
      const baseValue = Math.random() * 2 - 1

      // Generate data for each dimension with some correlation to the base value
      const originalData: number[] = []
      for (let d = 0; d < dimensions; d++) {
        // Mix the base value with random noise based on correlation
        const value = correlation * baseValue + (1 - Math.abs(correlation)) * (Math.random() * 2 - 1)
        originalData.push(value)
      }

      // For visualization, we'll use the first two dimensions as x and y
      const x = (originalData[0] * 0.4 + 0.5) * canvas.width
      const y = (originalData[1] * 0.4 + 0.5) * canvas.height

      newPoints.push({
        x,
        y,
        originalData,
      })
    }

    setPoints(newPoints)
    setProjectedPoints([])
    setStep(0)
    setAlgorithmComplete(false)
  }

  const drawCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw coordinate axes
    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Draw original data points
    if (step === 0) {
      points.forEach((point) => {
        // Color based on the first dimension of original data
        const colorIndex = Math.floor(((point.originalData[0] + 1) / 2) * colors.length)
        ctx.fillStyle = colors[colorIndex % colors.length]

        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw centered data
    if (step === 1) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      points.forEach((point) => {
        // Color based on the first dimension of original data
        const colorIndex = Math.floor(((point.originalData[0] + 1) / 2) * colors.length)
        ctx.fillStyle = colors[colorIndex % colors.length]

        // Draw centered point
        ctx.beginPath()
        ctx.arc(centerX + (point.x - centerX) * 0.8, centerY + (point.y - centerY) * 0.8, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw covariance visualization
    if (step === 2) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw centered points
      points.forEach((point) => {
        // Color based on the first dimension of original data
        const colorIndex = Math.floor(((point.originalData[0] + 1) / 2) * colors.length)
        ctx.fillStyle = colors[colorIndex % colors.length]

        // Draw centered point
        ctx.beginPath()
        ctx.arc(centerX + (point.x - centerX) * 0.8, centerY + (point.y - centerY) * 0.8, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw covariance ellipse
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, canvas.width * 0.2 * Math.abs(correlation), canvas.height * 0.1, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw eigenvectors
    if (step === 3) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw centered points
      points.forEach((point) => {
        // Color based on the first dimension of original data
        const colorIndex = Math.floor(((point.originalData[0] + 1) / 2) * colors.length)
        ctx.fillStyle = colors[colorIndex % colors.length]

        // Draw centered point
        ctx.beginPath()
        ctx.arc(centerX + (point.x - centerX) * 0.8, centerY + (point.y - centerY) * 0.8, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw first principal component (eigenvector)
      const angle = Math.PI / 4 // 45 degrees for visualization
      const length = Math.min(canvas.width, canvas.height) * 0.4

      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(centerX - Math.cos(angle) * length, centerY - Math.sin(angle) * length)
      ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length)
      ctx.stroke()

      // Draw second principal component (perpendicular to first)
      ctx.strokeStyle = "rgba(0, 128, 0, 0.8)"
      ctx.beginPath()
      ctx.moveTo(
        centerX - Math.cos(angle + Math.PI / 2) * length * 0.5,
        centerY - Math.sin(angle + Math.PI / 2) * length * 0.5,
      )
      ctx.lineTo(
        centerX + Math.cos(angle + Math.PI / 2) * length * 0.5,
        centerY + Math.sin(angle + Math.PI / 2) * length * 0.5,
      )
      ctx.stroke()

      // Add labels
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)"
      ctx.font = "14px Arial"
      ctx.fillText("PC1", centerX + Math.cos(angle) * length + 10, centerY + Math.sin(angle) * length)

      ctx.fillStyle = "rgba(0, 128, 0, 0.8)"
      ctx.fillText(
        "PC2",
        centerX + Math.cos(angle + Math.PI / 2) * length * 0.5 + 10,
        centerY + Math.sin(angle + Math.PI / 2) * length * 0.5,
      )
    }

    // Draw projected data
    if (step === 4) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw original points (faded)
      points.forEach((point) => {
        ctx.fillStyle = "rgba(200, 200, 200, 0.3)"
        ctx.beginPath()
        ctx.arc(centerX + (point.x - centerX) * 0.8, centerY + (point.y - centerY) * 0.8, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw first principal component (eigenvector)
      const angle = Math.PI / 4 // 45 degrees for visualization
      const length = Math.min(canvas.width, canvas.height) * 0.4

      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(centerX - Math.cos(angle) * length, centerY - Math.sin(angle) * length)
      ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length)
      ctx.stroke()

      // Draw projected points
      if (projectedPoints.length > 0) {
        projectedPoints.forEach((point) => {
          // Color based on the first dimension of original data
          const colorIndex = Math.floor(((point.originalData[0] + 1) / 2) * colors.length)
          ctx.fillStyle = colors[colorIndex % colors.length]

          ctx.beginPath()
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
          ctx.fill()
        })
      } else {
        // Project points onto the first principal component for visualization
        points.forEach((point) => {
          const colorIndex = Math.floor(((point.originalData[0] + 1) / 2) * colors.length)
          ctx.fillStyle = colors[colorIndex % colors.length]

          // Project point onto PC1
          const projectedX =
            centerX +
            Math.cos(angle) * ((point.x - centerX) * Math.cos(angle) + (point.y - centerY) * Math.sin(angle)) * 0.8
          const projectedY =
            centerY +
            Math.sin(angle) * ((point.x - centerX) * Math.cos(angle) + (point.y - centerY) * Math.sin(angle)) * 0.8

          ctx.beginPath()
          ctx.arc(projectedX, projectedY, 5, 0, Math.PI * 2)
          ctx.fill()

          // Draw line from original to projected point
          ctx.strokeStyle = "rgba(100, 100, 100, 0.3)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(centerX + (point.x - centerX) * 0.8, centerY + (point.y - centerY) * 0.8)
          ctx.lineTo(projectedX, projectedY)
          ctx.stroke()
        })
      }
    }
  }

  const runPCAStep = () => {
    if (step >= maxSteps) {
      setIsRunning(false)
      setAlgorithmComplete(true)
      return
    }

    setStep((prevStep) => prevStep + 1)
  }

  const performPCA = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // In a real implementation, we would:
    // 1. Center the data
    // 2. Compute covariance matrix
    // 3. Find eigenvectors and eigenvalues
    // 4. Project data onto principal components

    // For this visualization, we'll simulate the projection
    const angle = Math.PI / 4 // 45 degrees for visualization
    const newProjectedPoints: Point[] = []

    points.forEach((point) => {
      // Project point onto PC1
      const projectedX =
        centerX +
        Math.cos(angle) * ((point.x - centerX) * Math.cos(angle) + (point.y - centerY) * Math.sin(angle)) * 0.8
      const projectedY =
        centerY +
        Math.sin(angle) * ((point.x - centerX) * Math.cos(angle) + (point.y - centerY) * Math.sin(angle)) * 0.8

      newProjectedPoints.push({
        x: projectedX,
        y: projectedY,
        originalData: point.originalData,
      })
    })

    setProjectedPoints(newProjectedPoints)
  }

  const toggleRunning = () => {
    if (algorithmComplete) {
      // Reset if algorithm was completed
      setStep(0)
      setAlgorithmComplete(false)
      setProjectedPoints([])
      setIsRunning(true)
    } else {
      setIsRunning(!isRunning)
    }
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setStep(0)
    setAlgorithmComplete(false)
    setProjectedPoints([])
    generateRandomData()
  }

  const stepForward = () => {
    if (!isRunning && !algorithmComplete) {
      runPCAStep()
    }
  }

  const showFinalResult = () => {
    setStep(maxSteps)
    setAlgorithmComplete(true)
    performPCA()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Principal Component Analysis (PCA)</h1>
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
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="dimensions-value">Original Dimensions</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="dimensions-value"
                      type="number"
                      min="2"
                      max="50"
                      value={dimensions}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (value >= 2 && value <= 50) {
                          setDimensions(value)
                        }
                      }}
                      disabled={isRunning}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="components-value">Target Components</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="components-value"
                      type="number"
                      min="1"
                      max={dimensions - 1}
                      value={components}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (value >= 1 && value <= dimensions - 1) {
                          setComponents(value)
                        }
                      }}
                      disabled={isRunning}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="correlation-slider">Data Correlation</Label>
                  <Slider
                    id="correlation-slider"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[correlation]}
                    onValueChange={(value) => setCorrelation(value[0])}
                    disabled={isRunning}
                  />
                  <div className="text-center text-sm text-slate-500 mt-1">{correlation.toFixed(1)}</div>
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
                  <Button onClick={showFinalResult} variant="outline" disabled={isRunning}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Show Result
                  </Button>
                </div>
              </div>

              <div className="bg-slate-100 p-2 rounded-md mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {["Original Data", "Center Data", "Covariance Matrix", "Eigenvectors", "Project Data"].map(
                      (stepName, index) => (
                        <div
                          key={index}
                          className={`px-3 py-1 rounded-md text-sm ${
                            step === index
                              ? "bg-green-500 text-white"
                              : step > index
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {stepName}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="text-slate-700">
                    {algorithmComplete ? (
                      <span className="text-green-600 font-medium">Complete!</span>
                    ) : isRunning ? (
                      <span className="text-blue-600">Running...</span>
                    ) : (
                      <span className="text-slate-600">Ready</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-[500px] bg-white"></canvas>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                <p>
                  The visualization shows how PCA transforms high-dimensional data by projecting it onto principal
                  components.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Principal Component Analysis (PCA)</h2>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">What is PCA?</h3>
                  <p className="text-slate-700 mb-2">
                    Principal Component Analysis (PCA) is a linear dimensionality reduction technique that finds the
                    directions (principal components) of maximum variance in the data and projects it onto a
                    lower-dimensional subspace.
                  </p>
                  <p className="text-slate-700">
                    PCA is one of the most widely used techniques for dimensionality reduction, feature extraction, and
                    data visualization in machine learning and data analysis.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">How PCA Works</h3>
                  <ol className="list-decimal list-inside space-y-4 text-slate-700">
                    <li className="pl-2">
                      <span className="font-medium">Center the Data:</span> Subtract the mean from each feature to
                      center the data around the origin.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Compute the Covariance Matrix:</span> Calculate how each dimension
                      varies with respect to the others.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Find Eigenvectors and Eigenvalues:</span> The eigenvectors of the
                      covariance matrix represent the principal components, and the eigenvalues represent the amount of
                      variance explained by each component.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Sort and Select Components:</span> Sort the eigenvectors by their
                      eigenvalues in descending order and select the top k eigenvectors.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium">Project the Data:</span> Transform the original data by projecting
                      it onto the selected principal components.
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Mathematical Formulation</h3>
                  <p className="text-slate-700 mb-4">
                    The covariance matrix Σ for a dataset X with n features is an n×n matrix where each element Σᵢⱼ
                    represents the covariance between features i and j:
                  </p>
                  <div className="bg-slate-50 p-4 rounded-md text-center mb-4">
                    <p className="text-slate-800 font-mono">Σ = (1/m) ∑(x^(i) - μ)(x^(i) - μ)^T</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Where μ is the mean vector of the dataset and m is the number of samples.
                    </p>
                  </div>
                  <p className="text-slate-700 mb-4">
                    We find the eigenvectors and eigenvalues of the covariance matrix:
                  </p>
                  <div className="bg-slate-50 p-4 rounded-md text-center mb-4">
                    <p className="text-slate-800 font-mono">Σv = λv</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Where v is an eigenvector and λ is the corresponding eigenvalue.
                    </p>
                  </div>
                  <p className="text-slate-700 mb-4">
                    The principal components are the eigenvectors of the covariance matrix, ordered by their eigenvalues
                    (largest first). To reduce dimensionality, we project the data onto the first k principal
                    components:
                  </p>
                  <div className="bg-slate-50 p-4 rounded-md text-center mb-4">
                    <p className="text-slate-800 font-mono">Z = XW</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Where W is the matrix of the first k eigenvectors and Z is the reduced-dimension data.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Advantages and Limitations</h3>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium text-green-800 mb-2">Advantages</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Reduces dimensionality while preserving variance</li>
                        <li>Removes correlated features</li>
                        <li>Computationally efficient</li>
                        <li>Helps with visualization</li>
                        <li>Reduces noise in the data</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-md">
                      <h4 className="font-medium text-red-800 mb-2">Limitations</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Only captures linear relationships</li>
                        <li>May lose important information if variance isn't aligned with class separation</li>
                        <li>Principal components can be hard to interpret</li>
                        <li>Sensitive to feature scaling</li>
                        <li>Not suitable for all types of data</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Applications</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2">
                    <li>Dimensionality reduction for machine learning</li>
                    <li>Image compression and facial recognition</li>
                    <li>Data visualization</li>
                    <li>Noise reduction in signals</li>
                    <li>Feature extraction</li>
                    <li>Exploratory data analysis</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Study Resources</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Books</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Pattern Recognition and Machine Learning by Christopher Bishop</li>
                        <li>Elements of Statistical Learning by Hastie, Tibshirani, and Friedman</li>
                        <li>Introduction to Linear Algebra by Gilbert Strang</li>
                      </ul>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-md">
                      <h4 className="font-medium text-slate-800 mb-2">Online Resources</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        <li>Scikit-learn Documentation on PCA</li>
                        <li>Stanford CS229 Machine Learning Course</li>
                        <li>A Tutorial on Principal Component Analysis by Jonathon Shlens</li>
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
          <p className="text-center">Interactive PCA Visualization | Created for educational purposes</p>
        </div>
      </footer>
    </div>
  )
}

