'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { StatusWidget } from './StatusWidget'
import { AnimatedBackground } from './AnimatedBackground'

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)
  const [projectCount, setProjectCount] = useState('15+')
  const nameRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fetchProjectCount = async () => {
      try {
        const response = await fetch(`/api/repos`)
        if (response.ok) {
          const data = await response.json()
          if (data.repos && Array.isArray(data.repos)) {
            setProjectCount(`${data.repos.length}+`)
          }
        }
      } catch (error) {
        console.log('Failed to fetch project count, using default')
      }
    }

    fetchProjectCount()
  }, [])

  useEffect(() => {
    if (isHovering) return

    const interval = setInterval(() => {
      const time = Date.now() * 0.001
      const x = 50 + Math.sin(time * 0.7) * 25
      const y = 50 + Math.cos(time * 0.5) * 20
      setMousePosition({ x, y })
    }, 50)

    return () => clearInterval(interval)
  }, [isHovering])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (nameRef.current) {
      const rect = nameRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    const time = Date.now() * 0.001
    const x = 50 + Math.sin(time * 0.7) * 25
    const y = 50 + Math.cos(time * 0.5) * 20
    setMousePosition({ x, y })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-6 py-24 md:px-12 lg:px-24 xl:px-32 relative">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="h-full w-full bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="text-center max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.span 
              className="block text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Hey, I'm
            </motion.span>
            <motion.span 
              ref={nameRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="block font-black cursor-pointer relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              style={{
                backgroundImage: `conic-gradient(from ${mousePosition.x * 3.6}deg at ${mousePosition.x}% ${mousePosition.y}%, 
                  #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, 
                  #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'brightness(1.2) contrast(1.1)',
                transition: isHovering ? 'filter 0.15s ease-out' : 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              whileHover={{ 
                scale: 1.05,
                textShadow: "0 0 20px rgba(255,255,255,0.3)"
              }}
            >
              {process.env.NEXT_PUBLIC_DISPLAY_NAME || process.env.NEXT_PUBLIC_DISCORD_DISPLAY_NAME || 'Domantas'}
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            I build cool stuff on the web and honestly just love coding.{' '}
            <span className="text-primary font-medium">Currently obsessed</span>{' '}
            with making things that don't suck and actually work properly.
          </motion.p>

          <motion.div 
            className="flex items-center justify-center pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <StatusWidget />
          </motion.div>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <motion.button
              onClick={() => scrollToSection('projects')}
              className="px-8 py-4 btn-primary text-primary-foreground rounded-xl font-semibold flex items-center space-x-3 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Code2 size={20} />
              <span>See My Stuff</span>
            </motion.button>
            <motion.button
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 btn-glass text-foreground hover:text-primary rounded-xl font-semibold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Talk
            </motion.button>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            {[
              { number: '9+', label: 'Years Coding', emoji: '💻' },
              { number: projectCount, label: 'Projects Built', emoji: '🚀' },
              { number: '∞', label: 'Energy Drinks', emoji: '⚡' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass-card p-6 text-center hover-glow group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.7 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-2xl font-bold gradient-text">{stat.number}</div>
                <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="flex justify-center pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.1 }}
          >
            <motion.button
              onClick={() => scrollToSection('about')}
              className="glass-card p-3 hover-glow group rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.1 }}
            >
              <ChevronDown size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}