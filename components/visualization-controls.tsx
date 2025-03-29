"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Eye,
  EyeOff,
  Palette,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface VisualizationControlsProps {
  isRunning: boolean
  toggleRunning: () => void
  stepForward: () => void
  resetSimulation: () => void
  speed: number
  setSpeed: (speed: number) => void
  showTrails: boolean
  setShowTrails: (show: boolean) => void
  colorMode: string
  setColorMode: (mode: string) => void
  isZoomEnabled: boolean
  toggleZoom: () => void
  isPanEnabled: boolean
  togglePan: () => void
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  isComplete: boolean
}

export function VisualizationControls({
  isRunning,
  toggleRunning,
  stepForward,
  resetSimulation,
  speed,
  setSpeed,
  showTrails,
  setShowTrails,
  colorMode,
  setColorMode,
  isZoomEnabled,
  toggleZoom,
  isPanEnabled,
  togglePan,
  zoomIn,
  zoomOut,
  resetView,
  isComplete,
}: VisualizationControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <Button onClick={toggleRunning} variant="default">
            {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? "Pause" : isComplete ? "Restart" : "Start"}
          </Button>
          <Button onClick={stepForward} variant="outline" disabled={isRunning || isComplete}>
            <SkipForward className="mr-2 h-4 w-4" />
            Step
          </Button>
          <Button onClick={resetSimulation} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={toggleZoom}
            variant={isZoomEnabled ? "default" : "outline"}
            size="icon"
            title="Toggle Zoom Mode"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={togglePan}
            variant={isPanEnabled ? "default" : "outline"}
            size="icon"
            title="Toggle Pan Mode"
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button onClick={zoomIn} variant="outline" size="icon" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={zoomOut} variant="outline" size="icon" title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={resetView} variant="outline" size="icon" title="Reset View">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="speed-slider" className="mb-2 block">
            Animation Speed
          </Label>
          <Slider
            id="speed-slider"
            min={1}
            max={10}
            step={1}
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="show-trails" checked={showTrails} onCheckedChange={setShowTrails} />
          <Label htmlFor="show-trails" className="cursor-pointer">
            {showTrails ? (
              <span className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Show Point Trails
              </span>
            ) : (
              <span className="flex items-center">
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Point Trails
              </span>
            )}
          </Label>
        </div>

        <div>
          <Label htmlFor="color-mode" className="mb-2 block">
            Color Mode
          </Label>
          <Select value={colorMode} onValueChange={setColorMode}>
            <SelectTrigger id="color-mode" className="w-full">
              <SelectValue>
                <div className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  {colorMode === "cluster" && "Cluster Colors"}
                  {colorMode === "gradient" && "Position Gradient"}
                  {colorMode === "distance" && "Distance Based"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cluster">Cluster Colors</SelectItem>
              <SelectItem value="gradient">Position Gradient</SelectItem>
              <SelectItem value="distance">Distance Based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

