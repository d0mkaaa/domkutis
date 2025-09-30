'use client'

import { Code, Database, Globe, Smartphone, Server, Palette, Brain, Zap, Music } from 'lucide-react'
import { motion } from 'framer-motion'

export function About() {
  const skills = [
    {
      icon: <Globe className="w-10 h-10" />,
      title: 'Frontend Development',
      description: 'React, Next.js, TypeScript, Tailwind CSS - building responsive and interactive user interfaces',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: <Server className="w-10 h-10" />,
      title: 'Backend Development',
      description: 'Node.js, Golang, REST APIs, i am creating fabolous server-side applications and services',
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: <Database className="w-10 h-10" />,
      title: 'Database Management',
      description: 'PostgreSQL, MongoDB or Supabase - using efficient data structures and optimizing queries cause privacy and speed matters',
      color: 'from-purple-500 to-violet-400'
    },
    {
      icon: <Smartphone className="w-10 h-10" />,
      title: 'Mobile Development',
      description: 'Flutter - sluggish but good for UI',
      color: 'from-pink-500 to-rose-400'
    },
    {
      icon: <Code className="w-10 h-10" />,
      title: 'DevOps & Tools',
      description: 'Docker, Git, CI/CD using tools to follow whatever devs use these days and ease my life up',
      color: 'from-orange-500 to-amber-400'
    },
    {
      icon: <Palette className="w-10 h-10" />,
      title: 'UI/UX Design',
      description: 'Figma - for designing clean and user-friendly interfaces and making some icons',
      color: 'from-indigo-500 to-blue-400'
    },
  ]

  const personalStuff = [
    { icon: <Music size={20} />, text: 'code better with good music' },
    { icon: <Brain size={20} />, text: 'always learning something new' },
    { icon: <Zap size={20} />, text: 'probably overthinking this code' },
    { icon: <Globe size={20} />, text: 'love exploring new places' },
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
      <div className="max-w-5xl mx-auto">
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
            <h2 className="text-2xl md:text-6xl font-bold">
              What I <span className="gradient-text">Do</span>
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            basically, I love building stuff that works and looks good. 
            Started coding because I wanted to{' '}
            <span className="text-highlight">make cool things</span>{' '}
            and honestly just got addicted to solving problems.
          </motion.p>
        </motion.div>

        {}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
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
              className="glass-card-strong p-10 hover-glow group relative overflow-hidden"
              whileHover={{
                scale: 1.02,
                y: -5
              }}
            >
              {}
              <div className={`absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {}
              <motion.div
                className="text-foreground mb-6"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {skill.icon}
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                {skill.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed text-base">
                {skill.description}
              </p>

              {}
              <div className={`absolute bottom-0 left-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
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
                <span className="text-highlight">enjoys coding</span>{' '}. 
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

      </div>
    </section>
  )
}