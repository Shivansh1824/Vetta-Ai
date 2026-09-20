import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import type { NavItem } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { JobsPage } from './pages/JobsPage'
import { ScreeningPage } from './pages/ScreeningPage'
import { InterviewPage } from './pages/InterviewPage'
import { TopHeader } from './components/layout/TopHeader'
import { RecruiterOnboardingModal } from './components/onboarding/RecruiterOnboardingModal'
import type { GeminiScreeningResult } from './types'

// Lightweight placeholder for pages not yet built
function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader title={title} subtitle={subtitle} />
      <main style={{ flex: 1, padding: '60px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, marginBottom: 18,
            background: 'var(--color-accent-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontSize: 24 }}>🚧</span>
          </div>
          <h2 style={{ margin: '0 0 8px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{title}</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            This section is coming in the next build phase.
          </p>
        </div>
      </main>
    </div>
  )
}

const PAGE_SUBTITLES: Record<NavItem, { title: string; subtitle: string }> = {
  onboarding: { title: 'Recruiter Onboarding', subtitle: 'Interactive 4-step recruiter setup and candidate intake.' },
  dashboard: { title: 'Dashboard', subtitle: 'Your hiring pipeline at a glance.' },
  jobs: { title: 'Job Posts', subtitle: 'Manage your open positions.' },
  candidates: { title: 'Candidates', subtitle: 'All candidates across active roles.' },
  screening: { title: 'AI Screening', subtitle: 'Gemini-powered resume analysis.' },
  interview: { title: 'Interview Cockpit', subtitle: 'Generate and track interview questions.' },
  reports: { title: 'Reports', subtitle: 'Evaluation summaries and audit trail.' },
  settings: { title: 'Settings', subtitle: 'Account and workspace configuration.' },
}

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
            customData={dashboardData}
          />
        )
      case 'jobs': return <JobsPage />
      case 'screening': return <ScreeningPage />
      case 'interview': return <InterviewPage />
      default: {
        const info = PAGE_SUBTITLES[activePage]
        return <PlaceholderPage title={info.title} subtitle={info.subtitle} />
      }
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
