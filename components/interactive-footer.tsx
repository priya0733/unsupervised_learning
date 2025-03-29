"use client"

import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InteractiveFooter() {
  const socialLinks = [
    { name: "GitHub", icon: <Github className="h-5 w-5" />, href: "https://github.com" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com" },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com" },
    { name: "Email", icon: <Mail className="h-5 w-5" />, href: "mailto:example@example.com" },
  ]

  return (
    <footer className="bg-slate-900 text-slate-200 py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">C</span>
                </span>
                ClusterViz
              </h3>
              <p className="text-slate-400 mb-4">
                Interactive visualizations of clustering and dimensionality reduction algorithms for educational
                purposes.
              </p>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4">Algorithms</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/kmeans" className="text-slate-400 hover:text-white transition-colors">
                    K-means Clustering
                  </a>
                </li>
                <li>
                  <a href="/dbscan" className="text-slate-400 hover:text-white transition-colors">
                    DBSCAN Clustering
                  </a>
                </li>
                <li>
                  <a href="/pca" className="text-slate-400 hover:text-white transition-colors">
                    Principal Component Analysis
                  </a>
                </li>
                <li>
                  <a href="/tsne" className="text-slate-400 hover:text-white transition-colors">
                    t-SNE
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <div className="flex space-x-2">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                    <Button variant="outline" size="icon" className="rounded-full">
                      {link.icon}
                    </Button>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-slate-800 text-center"
        >
          <p className="text-slate-400 flex items-center justify-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1 animate-pulse" /> for educational purposes
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

