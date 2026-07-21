import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { SoundProvider } from './context/SoundContext'
import { AdminProvider } from './context/AdminContext'
import { ContentProvider } from './context/ContentContext'
import { Hero } from './components/Hero'
import { AboutSection } from './components/AboutSection'
import { TracksSection } from './components/TracksSection'
import { ScheduleSection } from './components/ScheduleSection'
import { FaqSection } from './components/FaqSection'
import { OrganizersSection } from './components/OrganizersSection'
import { FooterSection } from './components/FooterSection'
import { SpineNav } from './components/SpineNav'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'

function PublicSite() {
  return (
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <SoundProvider>
          <SpineNav />
          <main>
            <Hero />
            <AboutSection />
            <TracksSection />
            <ScheduleSection />
            <FaqSection />
            <OrganizersSection />
            <FooterSection />
          </main>
        </SoundProvider>
      </ContentProvider>
    </MotionConfig>
  )
}

function AdminRoute() {
  return (
    <AdminProvider>
      <AdminLogin />
    </AdminProvider>
  )
}

function AdminDashboardRoute() {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/admin/dashboard" element={<AdminDashboardRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
