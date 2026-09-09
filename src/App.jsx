import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { SoundProvider } from './context/SoundContext'
import { ContentProvider } from './context/ContentContext'
import { Hero } from './components/Hero'
import { TracksSection } from './components/TracksSection'
import { ScheduleSection } from './components/ScheduleSection'
import { OrganizersSection } from './components/OrganizersSection'
import { FooterSection } from './components/FooterSection'

function PublicSite() {
  return (
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <SoundProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-electric-wheat focus:px-5 focus:py-3 focus:font-subhead focus:text-sm focus:font-bold focus:uppercase focus:tracking-widest focus:text-deep-space"
          >
            Skip to content
          </a>
          <main id="main">
            <Hero />
            <TracksSection />
            <ScheduleSection />
            <OrganizersSection />
            <FooterSection />
          </main>
        </SoundProvider>
      </ContentProvider>
    </MotionConfig>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
