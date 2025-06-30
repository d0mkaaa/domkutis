'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, Sparkles, Sun, Moon, Code, Github, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [activeSection, setActiveSection] = useState('home')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('light-theme', savedTheme === 'light')
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -66% 0px', 
      threshold: [0.1, 0.3, 0.5]
    }

    const observer = new IntersectionObserver((entries) => {
      let maxVisibleSection = null;
      let maxVisibleArea = 0;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const visibleArea = entry.intersectionRatio * entry.boundingClientRect.height;
          if (visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            maxVisibleSection = entry.target.id;
          }
        }
      });

      if (maxVisibleSection) {
        setActiveSection(maxVisibleSection);
      }
    }, observerOptions)

    const sections = ['home', 'about', 'projects', 'contact']
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateIndicatorPosition = () => {
      const activeIndex = navItems.findIndex(item => item.id === activeSection)
      const activeButton = buttonRefs.current[activeIndex]
      const navContainer = navRef.current

      if (activeButton && navContainer) {
        const navContainerRect = navContainer.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        
        const relativeLeft = buttonRect.left - navContainerRect.left
        const buttonWidth = buttonRect.width
        
        setIndicatorStyle({
          left: relativeLeft,
          width: buttonWidth
        })
      }
    }

    const timeouts = [
      setTimeout(() => { updateIndicatorPosition() }, 0),
      setTimeout(() => { updateIndicatorPosition() }, 50),
      setTimeout(() => { updateIndicatorPosition() }, 100),
      setTimeout(() => { updateIndicatorPosition() }, 200),
      setTimeout(() => { updateIndicatorPosition() }, 500)
    ]

    window.addEventListener('resize', updateIndicatorPosition)
    
    return () => {
      timeouts.forEach(clearTimeout)
      window.removeEventListener('resize', updateIndicatorPosition)
    }
  }, [activeSection])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('light-theme', newTheme === 'light')
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { label: 'Home', id: 'home', icon: <Sparkles size={16} /> },
    { label: 'About', id: 'about', icon: <Code size={16} /> },
    { label: 'Projects', id: 'projects', icon: <Github size={16} /> },
    { label: 'Contact', id: 'contact', icon: <Mail size={16} /> },
  ]

  return (
    <motion.nav 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 glass-nav-enhanced rounded-2xl w-auto"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="px-4">
        <div className="flex items-center justify-between h-16 gap-8">
          {}
          <div className="flex justify-center">
            <div ref={navRef} className="flex items-center glass-card px-4 py-2 rounded-xl relative">
              {isMounted && indicatorStyle.width > 0 && (
                <motion.div
                  className="absolute bg-primary/20 rounded-lg shadow-lg backdrop-blur-sm border border-primary/20 -z-10"
                  initial={{ left: 0, width: 0, opacity: 0 }}
                  animate={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    opacity: 1
                  }}
                  style={{
                    height: 'calc(100% - 16px)',
                    top: '8px'
                  }}
                  transition={{ 
                    type: "spring", 
                    bounce: 0.2,
                    duration: 0.6,
                    damping: 25,
                    stiffness: 300
                  }}
                />
              )}
              
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  ref={(el) => { buttonRefs.current[index] = el }}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium z-10 ${
                    activeSection === item.id
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/30'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`transition-transform ${
                    activeSection === item.id ? 'scale-110' : 'scale-100'
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {}
          <div className="flex items-center space-x-4">
            {}
            <motion.a
              href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-2 glass-card px-4 py-2 rounded-xl hover-glow group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-xs">
                <div className="text-muted-foreground group-hover:text-primary transition-colors">@{process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'}</div>
                <div className="text-[10px] text-muted-foreground -mt-1">Check it out!</div>
              </div>
            </motion.a>

            {}
            <motion.button
              onClick={toggleTheme}
              className="glass-card p-3 hover-glow group rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun size={18} className="text-yellow-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon size={18} className="text-blue-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden glass-card p-3 hover-glow rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} className="text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={20} className="text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-border mt-4"
            >
              <motion.div 
                className="py-4 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      scrollToSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full text-left px-6 py-3 rounded-lg transition-all font-medium ${
                      activeSection === item.id
                        ? 'text-primary bg-primary/20'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <span className={`transition-transform ${
                      activeSection === item.id ? 'scale-110' : 'scale-100'
                    }`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {activeSection === item.id && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-primary rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}