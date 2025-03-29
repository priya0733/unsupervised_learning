"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Code2, Brain, Database, GitBranch, Network, ExternalLink, Layers, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [activeSection, setActiveSection] = useState("overview")

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "algorithms", "visualizations", "resources"]

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <section id="overview" className="mb-16 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8 border border-slate-200 p-1 rounded-lg">
                  <TabsTrigger value="overview" className="focus-ring">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="focus-ring">
                    Comparison
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="focus-ring">
                    Applications
                  </TabsTrigger>
                  <TabsTrigger value="code" className="focus-ring">
                    Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                    <motion.div variants={itemVariants}>
                      <h2 className="text-3xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-4">
                        Understanding Data Analysis Algorithms
                      </h2>
                      <p className="text-slate-600 text-lg leading-relaxed mb-6">
                        Our platform provides interactive visualizations for both clustering algorithms and
                        dimensionality reduction techniques. These algorithms are fundamental in pattern recognition,
                        data analysis, and machine learning.
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                      <Card className="card-hover border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Brain className="h-6 w-6 mr-2 text-blue-600 animate-pulse-slow" />
                            Clustering Algorithms
                          </CardTitle>
                          <CardDescription>Group similar data points together</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600">
                            Clustering algorithms identify natural groupings in data, revealing patterns and structures
                            without prior labeling.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Link href="#algorithms" className="w-full">
                            <Button className="w-full" onClick={() => scrollToSection("algorithms")}>
                              Explore Clustering
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>

                      <Card className="card-hover border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Minimize2 className="h-6 w-6 mr-2 text-purple-600 animate-pulse-slow" />
                            Dimensionality Reduction
                          </CardTitle>
                          <CardDescription>Reduce data complexity while preserving information</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600">
                            Dimensionality reduction techniques transform high-dimensional data into lower dimensions
                            for visualization and analysis.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Link href="/pca" className="w-full">
                            <Button className="w-full" variant="secondary">
                              Explore Dimensionality Reduction
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-8">
                      <h3 className="text-2xl font-semibold text-slate-800 mb-4 border-l-4 border-green-500 pl-4">
                        Key Features
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            icon: <Code2 className="h-6 w-6 text-green-600" />,
                            title: "Interactive Visualizations",
                            description: "See algorithms in action with real-time visualizations",
                          },
                          {
                            icon: <Database className="h-6 w-6 text-blue-600" />,
                            title: "Sample Datasets",
                            description: "Practice with pre-loaded example datasets",
                          },
                          {
                            icon: <GitBranch className="h-6 w-6 text-purple-600" />,
                            title: "Step-by-Step Execution",
                            description: "Follow the algorithm's progress step by step",
                          },
                        ].map((feature, index) => (
                          <Card key={index} className="card-hover border border-slate-200">
                            <CardHeader>
                              <CardTitle className="flex items-center text-lg">
                                {feature.icon}
                                <span className="ml-2">{feature.title}</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600">{feature.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="comparison">
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
                    <h3 className="text-2xl font-semibold text-slate-800 mb-6 border-l-4 border-blue-500 pl-4">
                      Algorithm Comparison
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                              Algorithm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                              Key Feature
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                              Best For
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border-r border-slate-100">
                              K-means
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Clustering
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Partitioning data into K clusters
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              Spherical clusters of similar size
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600 border-r border-slate-100">
                              DBSCAN
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Clustering
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Density-based clustering
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              Arbitrary shaped clusters, noise detection
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 border-r border-slate-100">
                              PCA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Dimensionality Reduction
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Linear projection preserving variance
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              Feature extraction, noise reduction
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600 border-r border-slate-100">
                              t-SNE
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Dimensionality Reduction
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border-r border-slate-100">
                              Non-linear projection preserving local structure
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              Visualization, cluster detection
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="applications">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="card-hover border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
                      <CardHeader>
                        <CardTitle className="border-b pb-2 border-green-100">Real-world Applications</CardTitle>
                        <CardDescription>Common use cases for data analysis algorithms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 border border-green-200">
                              1
                            </div>
                            <div className="ml-3">
                              <h4 className="text-lg font-medium text-slate-900">Customer Segmentation</h4>
                              <p className="text-slate-600">Group customers based on behavior and preferences</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                              2
                            </div>
                            <div className="ml-3">
                              <h4 className="text-lg font-medium text-slate-900">Image Processing</h4>
                              <p className="text-slate-600">Segment images and detect objects</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
                              3
                            </div>
                            <div className="ml-3">
                              <h4 className="text-lg font-medium text-slate-900">Anomaly Detection</h4>
                              <p className="text-slate-600">Identify unusual patterns in data</p>
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="card-hover border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardHeader>
                        <CardTitle className="border-b pb-2 border-purple-100">Industry Examples</CardTitle>
                        <CardDescription>How different industries use these algorithms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
                              1
                            </div>
                            <div className="ml-3">
                              <h4 className="text-lg font-medium text-slate-900">Healthcare</h4>
                              <p className="text-slate-600">Patient segmentation and disease pattern analysis</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 border border-pink-200">
                              2
                            </div>
                            <div className="ml-3">
                              <h4 className="text-lg font-medium text-slate-900">Retail</h4>
                              <p className="text-slate-600">Product recommendations and inventory management</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                              3
                            </div>
                            <div className="ml-3">
                              <h4 className="text-lg font-medium text-slate-900">Finance</h4>
                              <p className="text-slate-600">Risk assessment and fraud detection</p>
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="code">
                  <div className="bg-slate-900 rounded-lg p-6 text-white border border-slate-700">
                    <h3 className="text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-4">
                      Sample Implementation
                    </h3>
                    <pre className="bg-slate-800 p-4 rounded-md overflow-x-auto border border-slate-600">
                      <code className="text-sm font-mono">
                        {`// K-means clustering example
function kMeans(data, k, maxIterations = 100) {
  // Initialize centroids
  let centroids = initializeCentroids(data, k);
  
  for (let i = 0; i < maxIterations; i++) {
    // Assign points to clusters
    const clusters = assignToClusters(data, centroids);
    
    // Update centroids
    const newCentroids = updateCentroids(clusters);
    
    // Check for convergence
    if (hasConverged(centroids, newCentroids)) {
      break;
    }
    
    centroids = newCentroids;
  }
  
  return centroids;
}`}
                      </code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-2 border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle>Learning Resources</CardTitle>
                  <CardDescription>Enhance your understanding</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2 border-b border-blue-100 pb-1">
                        Clustering Tutorials
                      </h4>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/kmeans"
                            className="text-blue-600 hover:text-blue-800 flex items-center interactive-element"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            K-means Tutorial
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dbscan"
                            className="text-blue-600 hover:text-blue-800 flex items-center interactive-element"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            DBSCAN Tutorial
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-900 mb-2 border-b border-purple-100 pb-1">
                        Dimensionality Reduction
                      </h4>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/pca"
                            className="text-purple-600 hover:text-purple-800 flex items-center interactive-element"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            PCA Tutorial
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tsne"
                            className="text-purple-600 hover:text-purple-800 flex items-center interactive-element"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            t-SNE Tutorial
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2 border-b border-green-100 pb-1">
                        External Resources
                      </h4>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="https://scikit-learn.org/stable/modules/clustering.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 flex items-center interactive-element"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Scikit-learn Clustering
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://scikit-learn.org/stable/modules/decomposition.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 flex items-center interactive-element"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Scikit-learn Dimensionality Reduction
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="algorithms" className="mb-16 pt-8 border-t-2 border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-purple-500 pl-4">Algorithms</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="card-hover border-2 border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center">
                  <Brain className="h-6 w-6 mr-2 text-blue-600" />
                  K-means Clustering
                </CardTitle>
                <CardDescription>Partition-based algorithm</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  K-means clustering aims to partition n observations into k clusters where each observation belongs to
                  the cluster with the nearest mean (cluster center).
                </p>
                <h4 className="font-medium text-slate-800 mb-2">Key Characteristics:</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Requires specifying the number of clusters (K) beforehand</li>
                  <li>Works best with spherical clusters of similar size</li>
                  <li>Minimizes within-cluster variance</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/kmeans" className="w-full">
                  <Button className="w-full">
                    Interactive K-means Demo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="card-hover border-2 border-purple-200">
              <CardHeader className="bg-purple-50 border-b border-purple-100">
                <CardTitle className="flex items-center">
                  <Network className="h-6 w-6 mr-2 text-purple-600" />
                  DBSCAN
                </CardTitle>
                <CardDescription>Density-based algorithm</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  Density-Based Spatial Clustering of Applications with Noise (DBSCAN) groups together points that are
                  closely packed in areas of high density, separating them from areas of low density.
                </p>
                <h4 className="font-medium text-slate-800 mb-2">Key Characteristics:</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Does not require specifying the number of clusters</li>
                  <li>Can find arbitrarily shaped clusters</li>
                  <li>Robust to outliers (identifies them as noise)</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/dbscan" className="w-full">
                  <Button className="w-full" variant="secondary">
                    Interactive DBSCAN Demo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-hover border-2 border-green-200">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center">
                  <Layers className="h-6 w-6 mr-2 text-green-600" />
                  Principal Component Analysis (PCA)
                </CardTitle>
                <CardDescription>Linear dimensionality reduction</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  PCA is a linear dimensionality reduction technique that finds the directions (principal components) of
                  maximum variance in the data and projects it onto a lower-dimensional subspace.
                </p>
                <h4 className="font-medium text-slate-800 mb-2">Key Characteristics:</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Preserves global structure and variance</li>
                  <li>Useful for feature extraction and noise reduction</li>
                  <li>Computationally efficient</li>
                  <li>Works best with linearly correlated data</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/pca" className="w-full">
                  <Button className="w-full" variant="outline">
                    Interactive PCA Demo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="card-hover border-2 border-pink-200">
              <CardHeader className="bg-pink-50 border-b border-pink-100">
                <CardTitle className="flex items-center">
                  <Minimize2 className="h-6 w-6 mr-2 text-pink-600" />
                  t-SNE
                </CardTitle>
                <CardDescription>Non-linear dimensionality reduction</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  t-Distributed Stochastic Neighbor Embedding (t-SNE) is a non-linear dimensionality reduction technique
                  that preserves local relationships in the data, making it excellent for visualization.
                </p>
                <h4 className="font-medium text-slate-800 mb-2">Key Characteristics:</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Preserves local structure of the data</li>
                  <li>Excellent for visualizing high-dimensional data</li>
                  <li>Can reveal clusters and patterns</li>
                  <li>Sensitive to hyperparameters (especially perplexity)</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/tsne" className="w-full">
                  <Button className="w-full" variant="outline">
                    Interactive t-SNE Demo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section id="visualizations" className="mb-16 pt-8 border-t-2 border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-green-500 pl-4">
            Interactive Visualizations
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="overflow-hidden border-2 border-slate-200">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold">K-means Visualization</h3>
                  <p className="text-sm opacity-80">Interactive clustering demo</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  Watch K-means clustering in action with our interactive visualization. Control the algorithm
                  parameters and see how it affects the clustering results.
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Adjust the number of clusters (K)</li>
                  <li>Control animation speed</li>
                  <li>Add points manually</li>
                  <li>Step through the algorithm</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/kmeans" className="w-full">
                  <Button className="w-full">
                    Open K-means Visualization
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-2 border-slate-200">
              <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold">DBSCAN Visualization</h3>
                  <p className="text-sm opacity-80">Interactive clustering demo</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  Explore DBSCAN clustering with our interactive visualization. Adjust parameters and see how the
                  algorithm identifies clusters of different shapes.
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Adjust epsilon (radius) and minPoints</li>
                  <li>See core, border, and noise points</li>
                  <li>Control animation speed</li>
                  <li>Step through the algorithm</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/dbscan" className="w-full">
                  <Button className="w-full" variant="secondary">
                    Open DBSCAN Visualization
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-2 border-slate-200">
              <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold">PCA Visualization</h3>
                  <p className="text-sm opacity-80">Interactive dimensionality reduction</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  Understand Principal Component Analysis through interactive visualization. See how high-dimensional
                  data is projected onto principal components.
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Visualize data variance along principal components</li>
                  <li>Step through the PCA algorithm</li>
                  <li>Adjust data correlation and observe effects</li>
                  <li>See how much variance is explained by each component</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/pca" className="w-full">
                  <Button className="w-full" variant="outline">
                    Open PCA Visualization
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-2 border-slate-200">
              <div className="h-48 bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold">t-SNE Visualization</h3>
                  <p className="text-sm opacity-80">Interactive dimensionality reduction</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">
                  Explore t-SNE with our interactive visualization. See how this powerful algorithm preserves local
                  structure when reducing dimensionality.
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-4">
                  <li>Adjust perplexity and observe its effects</li>
                  <li>Generate different types of clustered data</li>
                  <li>Watch the iterative optimization process</li>
                  <li>Compare with other dimensionality reduction techniques</li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/tsne" className="w-full">
                  <Button className="w-full" variant="outline">
                    Open t-SNE Visualization
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section id="resources" className="pt-8 border-t-2 border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-blue-500 pl-4">Learning Resources</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="card-hover border-2 border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle>K-means Resources</CardTitle>
                <CardDescription>Learn about partition-based clustering</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Algorithm Guide</h4>
                      <p className="text-sm text-slate-600">Detailed explanation of how K-means works</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Implementation Details</h4>
                      <p className="text-sm text-slate-600">Step-by-step implementation guide</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Applications</h4>
                      <p className="text-sm text-slate-600">Real-world use cases and examples</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/kmeans#explanation" className="w-full">
                  <Button variant="outline" className="w-full">
                    View K-means Resources
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="card-hover border-2 border-purple-200">
              <CardHeader className="bg-purple-50 border-b border-purple-100">
                <CardTitle>DBSCAN Resources</CardTitle>
                <CardDescription>Learn about density-based clustering</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Algorithm Guide</h4>
                      <p className="text-sm text-slate-600">Detailed explanation of how DBSCAN works</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Parameter Tuning</h4>
                      <p className="text-sm text-slate-600">How to select epsilon and minPoints</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Applications</h4>
                      <p className="text-sm text-slate-600">Real-world use cases and examples</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/dbscan#explanation" className="w-full">
                  <Button variant="outline" className="w-full">
                    View DBSCAN Resources
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="card-hover border-2 border-green-200">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle>PCA Resources</CardTitle>
                <CardDescription>Learn about linear dimensionality reduction</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Mathematical Foundation</h4>
                      <p className="text-sm text-slate-600">Covariance matrices and eigendecomposition</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Implementation Guide</h4>
                      <p className="text-sm text-slate-600">Step-by-step implementation in code</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Applications</h4>
                      <p className="text-sm text-slate-600">Feature extraction and data compression</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/pca" className="w-full">
                  <Button variant="outline" className="w-full">
                    View PCA Resources
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="card-hover border-2 border-pink-200">
              <CardHeader className="bg-pink-50 border-b border-pink-100">
                <CardTitle>t-SNE Resources</CardTitle>
                <CardDescription>Learn about non-linear dimensionality reduction</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Algorithm Explained</h4>
                      <p className="text-sm text-slate-600">How t-SNE preserves local structure</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Perplexity Guide</h4>
                      <p className="text-sm text-slate-600">Understanding and tuning perplexity</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Visualization Best Practices</h4>
                      <p className="text-sm text-slate-600">Tips for effective t-SNE visualizations</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-4">
                <Link href="/tsne" className="w-full">
                  <Button variant="outline" className="w-full">
                    View t-SNE Resources
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

