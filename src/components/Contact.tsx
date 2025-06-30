'use client'

import { useState } from 'react'
import { Mail, Github, MessageCircle, Send, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setStatus('success')
        setStatusMessage('Message sent successfully! I\'ll get back to you soon.')
        setFormData({ name: '', email: '', subject: '', message: '' })

        setTimeout(() => setStatus('idle'), 5000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage('Oops! Something went wrong. Please try again or email me directly.')

      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      value: process.env.NEXT_PUBLIC_EMAIL || 'rutkauskasdomantas@gmail.com',
      href: `mailto:${process.env.NEXT_PUBLIC_EMAIL || 'rutkauskasdomantas@gmail.com'}`,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Location',
      value: 'Lithuania',
      href: null,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Response Time',
      value: 'Within 24 hours',
      href: null,
    },
  ]

  const socialLinks = [
    {
      icon: <Github className="w-6 h-6" />,
      label: 'GitHub',
      href: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'}`,
      username: `@${process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'}`,
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'Discord',
      href: `https://discord.com/users/${process.env.NEXT_PUBLIC_DISCORD_USERNAME || 'd0mkaaa'}`,
      username: `@${process.env.NEXT_PUBLIC_DISCORD_USERNAME || 'd0mkaaa'}`,
    },
  ]

  return (
    <section id="contact" className="px-6 py-16 md:px-12 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center space-x-2 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Send className="w-8 h-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold">
              Hit Me <span className="gradient-text">Up</span>
            </h2>
            <Send className="w-8 h-8 text-secondary scale-x-[-1]" />
          </motion.div>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Got a cool project idea? Need help with something? Or just want to chat about code and life? 
            <span className="text-primary font-medium"> I'm all ears!</span> Drop me a message using the form below, 
            and I'll get back to you faster than you can say "Hello World".
          </motion.p>
          <motion.div 
            className="flex items-center justify-center space-x-2 mt-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Real human responses, no bots here!</span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div 
            className="glass-card-strong p-8 relative overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="flex items-center space-x-2 mb-6">
              <Mail className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-semibold text-foreground">Drop me a line</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full form-input"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full form-input"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block form-label">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full form-input"
                  placeholder="What's this about?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full form-input resize-none"
                  placeholder="What's on your mind? Projects, ideas, or just wanna say hi?"
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all hover:scale-105 hover-glow shadow-lg disabled:cursor-not-allowed disabled:scale-100"
                whileHover={{ scale: status === 'sending' ? 1 : 1.02 }}
                whileTap={{ scale: status === 'sending' ? 1 : 0.98 }}
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle size={18} />
                    <span>Sent!</span>
                  </>
                ) : status === 'error' ? (
                  <>
                    <AlertCircle size={18} />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
              
              {}
              <AnimatePresence>
                {status !== 'idle' && statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg border ${
                      status === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {status === 'success' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <p className="text-sm font-medium">{statusMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          <div className="space-y-8">
            <motion.div 
              className="glass-card p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-center space-x-3">
                    <div className="text-primary">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-foreground">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="glass-card p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Connect With Me</h3>
              <div className="space-y-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-all hover:scale-105 group"
                  >
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      {social.icon}
                    </div>
                    <div>
                      <p className="text-foreground group-hover:text-primary transition-colors font-medium">
                        {social.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{social.username}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="glass-card p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Current Status</h3>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-foreground">Available for new projects</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Down for freelance gigs, full-time roles, or just cool collaborations.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}