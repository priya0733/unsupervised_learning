import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TSNEExamples() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Visual Examples</h3>

      <Tabs defaultValue="mnist" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="mnist">MNIST Digits</TabsTrigger>
          <TabsTrigger value="single-cell">Single-cell RNA</TabsTrigger>
          <TabsTrigger value="text">Text Embeddings</TabsTrigger>
        </TabsList>

        <TabsContent value="mnist" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-lg mb-2">Original Space</h4>
                  <div className="aspect-square relative border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src="/placeholder.svg?height=400&width=400"
                      alt="MNIST digits in original space"
                      width={400}
                      height={400}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm text-center p-4 bg-white/80 dark:bg-black/80 rounded">
                        High-dimensional representation of MNIST digits (784 dimensions)
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2">t-SNE Projection</h4>
                  <div className="aspect-square relative border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                        <div
                          key={digit}
                          className="rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `hsl(${digit * 36}, 70%, 60%)`,
                            transform: `translate(${Math.sin(digit) * 20}px, ${Math.cos(digit) * 20}px)`,
                          }}
                        >
                          <span className="text-white font-bold text-lg">{digit}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
                      <p className="text-sm text-center p-2 bg-white/80 dark:bg-black/80 rounded m-2">
                        t-SNE projection showing digit clusters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                t-SNE effectively separates the MNIST handwritten digits into distinct clusters in 2D space, making it
                easy to visualize the relationships between different digit classes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single-cell" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-lg mb-2">Gene Expression Data</h4>
                  <div className="aspect-square relative border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-px">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-slate-300 dark:bg-slate-600"
                          style={{
                            opacity: Math.random() * 0.8 + 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm text-center p-4 bg-white/80 dark:bg-black/80 rounded">
                        High-dimensional gene expression data (thousands of genes)
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2">t-SNE Cell Clusters</h4>
                  <div className="aspect-square relative border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            backgroundColor: `hsl(${i * 72}, 70%, 60%)`,
                            width: `${80 + Math.random() * 40}px`,
                            height: `${80 + Math.random() * 40}px`,
                            top: `${50 + Math.sin(i) * 120}px`,
                            left: `${50 + Math.cos(i) * 120}px`,
                            opacity: 0.7,
                          }}
                        />
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 relative">
                          {Array.from({ length: 200 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute rounded-full w-2 h-2"
                              style={{
                                backgroundColor: `hsl(${Math.floor(i / 40) * 72}, 70%, 60%)`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
                      <p className="text-sm text-center p-2 bg-white/80 dark:bg-black/80 rounded m-2">
                        t-SNE reveals cell type clusters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                In single-cell RNA sequencing analysis, t-SNE helps identify cell types by clustering cells with similar
                gene expression patterns, revealing biological structure that would be difficult to see in the original
                high-dimensional space.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-lg mb-2">Word Embeddings</h4>
                  <div className="aspect-square relative border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-mono text-xs overflow-hidden">
                          king: [0.123, -0.456, 0.789, ...]
                          <br />
                          queen: [0.134, -0.442, 0.775, ...]
                          <br />
                          man: [0.111, -0.422, 0.655, ...]
                          <br />
                          woman: [0.121, -0.412, 0.645, ...]
                          <br />
                          dog: [-0.321, 0.242, 0.455, ...]
                          <br />
                          cat: [-0.311, 0.252, 0.445, ...]
                          <br />
                          ...
                        </div>
                        <p className="mt-4 text-sm p-2 bg-white/80 dark:bg-black/80 rounded">
                          300-dimensional word vectors
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2">t-SNE Word Map</h4>
                  <div className="aspect-square relative border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0">
                      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                          <div className="font-medium">king</div>
                          <div className="text-xs">queen</div>
                          <div className="text-xs">prince</div>
                          <div className="text-xs">royal</div>
                        </div>
                      </div>
                      <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                        <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg">
                          <div className="font-medium">dog</div>
                          <div className="text-xs">cat</div>
                          <div className="text-xs">pet</div>
                          <div className="text-xs">animal</div>
                        </div>
                      </div>
                      <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2">
                        <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                          <div className="font-medium">car</div>
                          <div className="text-xs">truck</div>
                          <div className="text-xs">vehicle</div>
                          <div className="text-xs">drive</div>
                        </div>
                      </div>
                      <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
                        <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                          <div className="font-medium">happy</div>
                          <div className="text-xs">sad</div>
                          <div className="text-xs">emotion</div>
                          <div className="text-xs">feeling</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
                      <p className="text-sm text-center p-2 bg-white/80 dark:bg-black/80 rounded m-2">
                        t-SNE projection of word embeddings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                t-SNE can visualize word embeddings by projecting high-dimensional word vectors to 2D space, revealing
                semantic relationships between words. Similar words cluster together, showing how the embedding has
                captured meaning.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium mb-2">Perplexity Effect</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="relative w-3/4 h-3/4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-blue-500"
                      style={{
                        top: `${30 + Math.random() * 40}%`,
                        left: `${30 + Math.random() * 40}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs">Low (5)</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="relative w-full h-full">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-blue-500"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs">Medium (30)</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="relative w-full h-full">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-blue-500"
                      style={{
                        top: `${10 + Math.random() * 80}%`,
                        left: `${10 + Math.random() * 80}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs">High (50)</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium mb-2">Iteration Progress</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="relative w-full h-full">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: `hsl(${Math.floor(i / 5) * 90}, 70%, 60%)`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs">Start</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="relative w-full h-full">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: `hsl(${Math.floor(i / 5) * 90}, 70%, 60%)`,
                        top: `${30 + (Math.floor(i / 5) * 15) + Math.random() * 10}%`,
                        left: `${30 + (Math.floor(i / 5) * 15) + Math.random() * 10}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs">Middle</span>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="relative w-full h-full">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: `hsl(${Math.floor(i / 5) * 90}, 70%, 60%)`,
                        top: `${20 + Math.floor(i / 5) * 20}%`,
                        left: `${20 + Math.floor(i / 5) * 20}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs">Final</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium mb-2">Dimensionality Comparison</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="text-xs text-center p-1">
                  PCA
                  <br />
                  (Linear)
                </div>
              </div>
              <div className="relative w-full h-12">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `hsl(${Math.floor(i / 5) * 90}, 70%, 60%)`,
                      top: `${Math.random() * 100}%`,
                      left: `${i * 5}%`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-1">
                <div className="text-xs text-center p-1">
                  t-SNE
                  <br />
                  (Non-linear)
                </div>
              </div>
              <div className="relative w-full h-12">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `hsl(${Math.floor(i / 5) * 90}, 70%, 60%)`,
                      top: `${Math.random() * 100}%`,
                      left: `${10 + Math.floor(i / 5) * 20}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

