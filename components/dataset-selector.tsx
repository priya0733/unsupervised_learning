"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Database, RefreshCw } from "lucide-react"

export interface Dataset {
  id: string
  name: string
  description: string
  points: any[]
}

interface DatasetSelectorProps {
  datasets: Dataset[]
  onSelectDataset: (dataset: Dataset) => void
  onGenerateRandom: () => void
}

export function DatasetSelector({ datasets, onSelectDataset, onGenerateRandom }: DatasetSelectorProps) {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex-1 flex items-center justify-between">
            <span className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Select Dataset
            </span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {datasets.map((dataset) => (
            <DropdownMenuItem key={dataset.id} onClick={() => onSelectDataset(dataset)} className="cursor-pointer">
              <div>
                <div className="font-medium">{dataset.name}</div>
                <div className="text-xs text-muted-foreground">{dataset.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="icon" onClick={onGenerateRandom} title="Generate Random Data">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  )
}

