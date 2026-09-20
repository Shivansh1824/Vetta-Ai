import { Sidebar } from './components/layout/Sidebar'
import type { NavItem } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { JobsPage } from './pages/JobsPage'
import { ScreeningPage } from './pages/ScreeningPage'
import { InterviewPage } from './pages/InterviewPage'
import { TopHeader } from './components/layout/TopHeader'
import { useState } from 'react'

import { OnboardingFlow } from './components/onboarding/OnboardingFlow'

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
  onboarding: { title: 'Onboarding Intake', subtitle: 'Step-by-step role and candidate screening flow.' },
  dashboard: { title: 'Dashboard', subtitle: 'Your hiring pipeline at a glance.' },
  jobs: { title: 'Job Posts', subtitle: 'Manage your open positions.' },
  candidates: { title: 'Candidates', subtitle: 'All candidates across active roles.' },
  screening: { title: 'AI Screening', subtitle: 'Gemini-powered resume analysis.' },
  interview: { title: 'Interview Cockpit', subtitle: 'Generate and track interview questions.' },
  reports: { title: 'Reports', subtitle: 'Evaluation summaries and audit trail.' },
  settings: { title: 'Settings', subtitle: 'Account and workspace configuration.' },
}

export function AppShell() {
  const [activePage, setActivePage] = useState<NavItem>('onboarding')

  const renderPage = () => {
    switch (activePage) {
      case 'onboarding':
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <TopHeader title="Candidate Intake & Onboarding" subtitle="Configure target position, upload resumes or test with pre-built sample candidate data." />
            <OnboardingFlow
              onNavigateToInterview={() => setActivePage('interview')}
              onNavigateToDashboard={() => setActivePage('dashboard')}
            />
          </div>
        )
      case 'dashboard': return <DashboardPage />
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
      <Sidebar active={activePage} onNavigate={setActivePage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderPage()}
      </div>
    </div>
  )
}
