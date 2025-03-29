"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Menu, X, ChevronRight, Brain, Layers, Network, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { usePathname } from "next/navigation"

export function InteractiveHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuItems = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "K-means", path: "/kmeans", icon: <Brain className="h-5 w-5" /> },
    { name: "DBSCAN", path: "/dbscan", icon: <Network className="h-5 w-5" /> },
    { name: "PCA", path: "/pca", icon: <Layers className="h-5 w-5" /> },
    { name: "t-SNE", path: "/tsne", icon: <Minimize2 className="h-5 w-5" /> },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-md dark:bg-slate-900/80" : "bg-white dark:bg-slate-900"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center"
            >
              <span className="text-white font-bold">C</span>
            </motion.div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">ClusterViz</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button variant={pathname === item.path ? "default" : "ghost"} className="flex items-center gap-1">
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
            <ThemeSwitcher />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="ml-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen &&
            (
              <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}\
              opacity: 0, height: 0}}
              animate={{opacity: 1, height: "auto"}}
              exit={{opacity: 0, height: 0}}
              transition={{duration: 0.3}}
              className="md:hidden mt-4 py-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg"
            >
              <nav className="flex flex-col space-y-2 px-2">
                {menuItems.map((item) => (
                  <Link key={item.path} href={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={pathname === item.path ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </nav>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </header>
  )
}

