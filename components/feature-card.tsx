"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  href: string
  color?: string
  delay?: number
}

export function FeatureCard({ title, description, icon, href, color = "blue", delay = 0 }: FeatureCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
  }

  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-800 h-full">
        <div className={`h-2 bg-gradient-to-r ${selectedColor}`}></div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedColor} text-white`}>{icon}</div>
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-300">
            Explore interactive visualizations and learn how the algorithm works through step-by-step animations.
          </p>
        </CardContent>
        <CardFooter>
          <Link href={href} className="w-full">
            <Button className="w-full group">
              Explore
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

