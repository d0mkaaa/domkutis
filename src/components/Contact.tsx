'use client'

import { useState } from 'react'
import { Mail, Github, MessageCircle, Send, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CustomDropdown from './CustomDropdown'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
    projectType: '',
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
        setStatusMessage('message sent! i\'ll get back to you soon')
        setFormData({ name: '', email: '', subject: '', message: '', company: '', projectType: '' })

        setTimeout(() => setStatus('idle'), 5000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage('oops something went wrong. try again or just email me directly')

      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleDropdownChange = (value: string) => {
    setFormData({
      ...formData,
      projectType: value,
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
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Hit Me <span className="gradient-text">Up</span>
          </motion.h2>
          <motion.div
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto space-y-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p>got some cool project? wanna work together? or just saying hi?</p>
            <p className="text-foreground font-medium">shoot me a message!</p>
            <p>i actually read these and respond pretty fast</p>
          </motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-card-strong p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />

            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-foreground">drop me a message</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="what should i call you?"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block form-label">
                    Company/Organization <span className="text-muted-foreground text-sm">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full form-input"
                    placeholder="company name or just 'personal'"
                  />
                </div>
                <div>
                  <label htmlFor="projectType" className="block form-label">
                    Project Type <span className="text-muted-foreground text-sm">(optional)</span>
                  </label>
                  <CustomDropdown
                    options={[
                      { value: "website", label: "website/web app" },
                      { value: "mobile", label: "mobile app" },
                      { value: "api", label: "backend/api stuff" },
                      { value: "consulting", label: "need advice/consulting" },
                      { value: "collaboration", label: "wanna collaborate" },
                      { value: "other", label: "something else" }
                    ]}
                    value={formData.projectType}
                    onChange={handleDropdownChange}
                    placeholder="what kind of project?"
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
                  placeholder="what's this about?"
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
                  placeholder="what's on your mind? got ideas? wanna say hi? just type whatever"
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 btn-primary rounded-xl font-semibold transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50"
                whileHover={{ scale: status === 'sending' ? 1 : 1.02 }}
                whileTap={{ scale: status === 'sending' ? 1 : 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>sending...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle size={18} />
                    <span>sent!</span>
                  </>
                ) : status === 'error' ? (
                  <>
                    <AlertCircle size={18} />
                    <span>try again</span>
                  </>
                ) : (
                  <span>send message</span>
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

          <motion.div
            className="text-center mt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="mb-2">or just email me directly at</p>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'rutkauskasdomantas@gmail.com'}`}
              className="text-foreground hover:text-primary transition-colors"
            >
              {process.env.NEXT_PUBLIC_EMAIL || 'rutkauskasdomantas@gmail.com'}
            </a>
            <p className="mt-2">usually respond within 24 hours • based in lithuania</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}