import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Projects } from '@/components/Projects'
import { Contact } from '@/components/Contact'
import { InteractiveGrid } from '@/components/InteractiveGrid'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-animated">
      <InteractiveGrid />
      <Navigation />
      <Hero />

      <About />

      <Projects />

      <Contact />

      <Footer />
    </main>
  )
}