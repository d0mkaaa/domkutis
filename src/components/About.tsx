'use client'

import { Code, Database, Globe, Smartphone, Server, Palette, Brain, Zap, Coffee, Music } from 'lucide-react'
import { motion } from 'framer-motion'

export function About() {
  const skills = [
    {
      icon: <Globe className="w-7 h-7" />,
      title: 'frontend magic',
      description: 'React, Next.js, TypeScript, Tailwind (obviously)',
      color: 'from-blue-500 to-cyan-400',
      vibe: 'making things look sick'
    },
    {
      icon: <Server className="w-7 h-7" />,
      title: 'backend stuff',
      description: 'Node.js, Golang, APIs that actually work',
      color: 'from-green-500 to-emerald-400',
      vibe: 'server-side wizardry'
    },
    {
      icon: <Database className="w-7 h-7" />,
      title: 'database things',
      description: 'PostgreSQL, MongoDB, making data make sense',
      color: 'from-purple-500 to-violet-400',
      vibe: 'data wrangling master'
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: 'mobile apps',
      description: 'Flutter, making apps that dont crash',
      color: 'from-pink-500 to-rose-400',
      vibe: 'pocket-sized experiences'
    },
    {
      icon: <Code className="w-7 h-7" />,
      title: 'devops & tools',
      description: 'Docker, Git, CI/CD, the boring but important stuff',
      color: 'from-orange-500 to-amber-400',
      vibe: 'automation addict'
    },
    {
      icon: <Palette className="w-7 h-7" />,
      title: 'design vibes',
      description: 'Figma, making things that dont hurt your eyes',
      color: 'from-indigo-500 to-blue-400',
      vibe: 'aesthetic perfectionist'
    },
  ]

  const personalStuff = [
    { icon: <Coffee size={20} />, text: 'powered by way too many energy drinks' },
    { icon: <Music size={20} />, text: 'code better with good music' },
    { icon: <Brain size={20} />, text: 'always learning something new' },
    { icon: <Zap size={20} />, text: 'probably overthinking this code' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 }
  }

  return (
    <section id="about" className="px-6 py-20 md:px-12 lg:px-24 xl:px-32">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="flex items-center justify-center space-x-3 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Brain className="text-primary" size={32} />
            <h2 className="text-5xl md:text-6xl font-bold">
              What I <span className="gradient-text">Do</span>
            </h2>
            <Zap className="text-secondary" size={32} />
          </motion.div>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Basically, I love building stuff that works and looks good. 
            Started coding because I wanted to{' '}
            <span className="text-primary font-semibold">make cool things</span>{' '}
            and honestly just got addicted to solving problems.
          </motion.p>
        </motion.div>

        {}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              variants={itemVariants}
              className="glass-card-strong p-8 hover-glow group relative overflow-hidden"
              whileHover={{ 
                scale: 1.02,
                y: -5
              }}
            >
              {}
              <div className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {}
              <motion.div 
                className="text-primary mb-6"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {skill.icon}
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                {skill.title}
              </h3>
              
              <p className="text-muted-foreground mb-3 leading-relaxed">
                {skill.description}
              </p>

              <div className="text-sm text-muted-foreground italic">
                {skill.vibe}
              </div>

              {}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${skill.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </motion.div>
          ))}
        </motion.div>

        {}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="glass-card-strong p-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6 gradient-text">real talk</h3>
              <p className="text-foreground text-lg md:text-xl leading-relaxed mb-8">
                I'm that person who actually{' '}
                <span className="text-primary font-semibold">enjoys coding</span>{' '}. 
                Started coding when I was like 7 because I wanted 
                to make a game, ended up falling in love with web development instead at a later age.
              </p>
              <p className="text-muted-foreground text-lg">
                Now I spend most of my time building random projects, learning new frameworks, 
                and trying to make the web a less annoying place. Also really into{' '}
                <span className="text-secondary font-semibold">clean code</span>{' '}
                - life's too short for messy functions.
              </p>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {personalStuff.map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="flex items-center space-x-3 p-4 glass-card rounded-lg"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-primary">{item.icon}</div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
        >
          {[
            { number: '1000+', label: 'Lines of Code This Week', icon: '🔥' },
            { number: '3am', label: 'Average Bedtime', icon: '🌙' },
            { number: '∞', label: 'Stack Overflow Visits', icon: '🤔' },
            { number: '100%', label: 'Commitment to Not Breaking Prod', icon: '🙏' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-card p-6 text-center hover-glow group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold gradient-text">{stat.number}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}