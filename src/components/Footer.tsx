'use client'

import { motion } from 'framer-motion'
import { Github, MessageCircle, Heart } from 'lucide-react'

export function Footer() {
  const socialLinks = [
    {
      icon: <Github className="w-5 h-5" />,
      label: 'GitHub',
      href: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'}`,
      username: `@${process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'}`,
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'Discord',
      href: `https://discord.com/users/${process.env.NEXT_PUBLIC_DISCORD_USERNAME || 'd0mkaaa'}`,
      username: `@${process.env.NEXT_PUBLIC_DISCORD_USERNAME || 'd0mkaaa'}`,
    },
  ]

  return (
    <footer className="border-t border-border/10 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 md:px-12 lg:px-24 xl:px-32">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm">
              built with <Heart className="inline w-4 h-4 text-red-400 mx-1" /> using next.js, typescript
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              © 2025 {process.env.NEXT_PUBLIC_DISPLAY_NAME || 'd0mkaaa'} • actually hand coded, no ai slop
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="group-hover:text-primary transition-colors">
                  {link.icon}
                </div>
                <span className="text-sm hidden sm:inline">{link.username}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}