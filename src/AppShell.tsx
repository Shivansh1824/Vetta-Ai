import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import type { NavItem } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { JobsPage } from './pages/JobsPage'
import { ResumesPage } from './pages/ResumesPage'
import { CandidatesPage } from './pages/CandidatesPage'
import { ScreeningPage } from './pages/ScreeningPage'
import { InterviewPage } from './pages/InterviewPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { RecruiterOnboardingModal } from './components/onboarding/RecruiterOnboardingModal'
import type { GeminiScreeningResult } from './types'


export function AppShell() {
  const [activePage, setActivePage] = useState<NavItem>('dashboard')
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(true)

  const [dashboardData, setDashboardData] = useState<{
    recruiterName?: string
    companyName?: string
    roleTitle?: string
    jobTitle?: string
    newCandidate?: {
      name: string
      role: string
      score: number
      tier: 'tier_1_match' | 'tier_2_potential' | 'tier_3_mismatch'
    }
  }>({
    recruiterName: 'Sarah Chen',
    companyName: 'Vetta AI Labs',
    roleTitle: 'Lead Technical Recruiter',
    jobTitle: 'Senior Full-Stack & Distributed Systems Engineer',
  })

  const handleOnboardingComplete = (data: {
    recruiter: { fullName: string; companyName: string; roleTitle: string }
    job: { title: string }
    candidate: { candidateName: string }
    screeningResult: GeminiScreeningResult | null
  }) => {
    setDashboardData({
      recruiterName: data.recruiter.fullName,
      companyName: data.recruiter.companyName,
      roleTitle: data.recruiter.roleTitle,
      jobTitle: data.job.title,
      newCandidate: {
        name: data.candidate.candidateName || 'Arjun Mehta',
        role: data.job.title,
        score: data.screeningResult?.match_score ?? 94,
        tier: data.screeningResult?.tier ?? 'tier_1_match',
      },
    })
    setActivePage('dashboard')
  }

  const handleNavigate = (page: NavItem) => {
    if (page === 'onboarding') {
      setIsOnboardingModalOpen(true)
      return
    }
    setActivePage(page)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
            onNavigate={handleNavigate}
            customData={dashboardData}
          />
        )
      case 'jobs':
        return (
          <JobsPage
            onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
            onNavigate={handleNavigate}
          />
        )
      case 'resumes':
        return <ResumesPage onNavigate={handleNavigate} />
      case 'candidates':
        return <CandidatesPage onNavigate={handleNavigate} />
      case 'screening':
        return <ScreeningPage onNavigate={handleNavigate} />
      case 'interview':
        return <InterviewPage onNavigate={handleNavigate} />
      case 'reports':
        return <ReportsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return (
          <DashboardPage
            onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
            onNavigate={handleNavigate}
            customData={dashboardData}
          />
        )
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <Sidebar active={activePage} onNavigate={handleNavigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderPage()}
      </div>

      {/* Recruiter Onboarding Modal Flow */}
      <RecruiterOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  )
}
