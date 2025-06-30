'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Github, Star, GitFork, Eye, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  fork: boolean
}

export function Projects() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [repoSettings, setRepoSettings] = useState<{
    hiddenRepos: string[]
    featuredRepos: string[]
  }>({ hiddenRepos: [], featuredRepos: [] })

  useEffect(() => {
    const storedRepoSettings = localStorage.getItem('dashboard_repo_settings')
    if (storedRepoSettings) {
      const parsed = JSON.parse(storedRepoSettings)
      setRepoSettings({
        hiddenRepos: parsed.hiddenRepos || [],
        featuredRepos: parsed.featuredRepos || []
      })
    }
  }, [])

  useEffect(() => {
    const fetchGitHubRepos = async () => {
      try {
        const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'
        const response = await fetch(`https://api.github.com/users/${username}/repos`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch repositories')
        }
        
        const data = await response.json()
        
        const filteredRepos = data
          .filter((repo: GitHubRepo) => !repo.fork)
          .sort((a: GitHubRepo, b: GitHubRepo) => {
            const scoreA = a.stargazers_count * 2 + (new Date(a.pushed_at).getTime() / 1000000000)
            const scoreB = b.stargazers_count * 2 + (new Date(b.pushed_at).getTime() / 1000000000)
            return scoreB - scoreA
          })
        
        setRepos(filteredRepos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        console.error('Error fetching GitHub repos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGitHubRepos()
  }, [])

  const visibleRepos = repos.filter(repo => !repoSettings.hiddenRepos.includes(repo.name))
  const featuredRepoNames = repoSettings.featuredRepos.length > 0 ? repoSettings.featuredRepos : []
  const featuredProjects = visibleRepos.filter(repo => featuredRepoNames.includes(repo.name))
  const otherProjects = visibleRepos.filter(repo => !featuredRepoNames.includes(repo.name)).slice(0, 6)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <section id="projects" className="px-6 py-16 md:px-12 lg:px-24 xl:px-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              My <span className="gradient-text">Stuff</span>
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading my GitHub projects...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="projects" className="px-6 py-16 md:px-12 lg:px-24 xl:px-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              My <span className="gradient-text">Stuff</span>
            </h2>
            <div className="glass-card p-8 max-w-md mx-auto">
              <p className="text-muted-foreground mb-4">😅 Couldn't load my GitHub projects</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <motion.button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 btn-primary rounded-lg text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="projects" className="px-6 py-16 md:px-12 lg:px-24 xl:px-32">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            My <span className="gradient-text">Stuff</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Here's some cool stuff I've built. Fresh from GitHub, 
            so you know it's the real deal. Most of it actually works!
          </p>
          
          <div className="mt-6 flex items-center justify-center">
            <motion.a
              href="/dashboard"
              className="text-sm text-primary hover:text-primary/80 transition-colors glass-card px-4 py-2 rounded-lg hover-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📋 Manage repositories in dashboard
            </motion.a>
          </div>
        </motion.div>

        <motion.div 
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🚀</span>
              <span className="text-3xl font-bold gradient-text">
                {visibleRepos.length}+
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Projects Built
            </p>
          </div>
        </motion.div>

        {featuredProjects.length > 0 && (
          <div className="mb-16">
            <motion.h3 
              className="text-2xl font-semibold mb-8 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              🌟 Featured Projects
            </motion.h3>
            <motion.div 
              className={`grid gap-8 ${
                featuredProjects.length === 1
                  ? 'grid-cols-1'
                  : featuredProjects.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredProjects.map((repo) => (
                <motion.div
                  key={repo.id}
                  variants={itemVariants}
                  className="glass-card p-6 hover-glow group transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star size={14} />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork size={14} />
                          <span>{repo.forks_count}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 group-hover:text-muted transition-colors">
                      {repo.description || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {repo.topics?.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github size={18} />
                          <span>Code</span>
                        </motion.a>
                        {repo.homepage && (
                          <motion.a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ExternalLink size={18} />
                            <span>Live Demo</span>
                          </motion.a>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        <span>Updated {formatDate(repo.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {otherProjects.length > 0 && (
          <div>
            <motion.h3 
              className="text-2xl font-semibold mb-8 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              🚀 More Cool Stuff
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {otherProjects.map((repo) => (
                <motion.div
                  key={repo.id}
                  variants={itemVariants}
                  className="glass-card p-6 hover-glow group transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Star size={12} />
                      <span>{repo.stargazers_count}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 group-hover:text-muted transition-colors line-clamp-2">
                    {repo.description || 'No description available'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {repo.topics?.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <motion.a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Github size={16} />
                      <span className="text-sm">View Project</span>
                    </motion.a>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      <span>{formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {!loading && !error && visibleRepos.length === 0 && (
          <div className="text-center py-16">
            <div className="glass-card p-8 max-w-md mx-auto">
              <Github className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-6">
                {repos.length === 0 
                  ? "Couldn't load repositories from GitHub"
                  : "All repositories are currently hidden"
                }
              </p>
              <motion.a
                href="/dashboard"
                className="btn-primary px-6 py-3 rounded-lg text-white font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Manage Repositories
              </motion.a>
            </div>
          </div>
        )}

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.a
            href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-8 py-4 glass-card hover-glow group transition-all duration-300 hover:scale-105 rounded-2xl border-2 border-transparent hover:border-primary/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              View All Projects on GitHub
            </span>
            <ExternalLink size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}