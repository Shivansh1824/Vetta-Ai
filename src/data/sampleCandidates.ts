export interface SampleCandidate {
  id: string
  name: string
  role: string
  expectedScore: number
  tier: 'tier_1_match' | 'tier_2_potential' | 'tier_3_mismatch'
  tagline: string
  resumeText: string
}

export const SAMPLE_CANDIDATES: SampleCandidate[] = [
  {
    id: 'sample-1',
    name: 'Arjun Mehta',
    role: 'Senior Distributed Systems & Full-Stack Engineer',
    expectedScore: 94,
    tier: 'tier_1_match',
    tagline: 'Tier 1 Top Match — 7 yrs exp, Kafka, Go, React, PostgreSQL',
    resumeText: ''
  },
  {
    id: 'sample-2',
    name: 'Marcus Vance',
    role: 'Senior Frontend Engineer',
    expectedScore: 76,
    tier: 'tier_2_potential',
    tagline: 'Tier 2 Potential — Exceptional React/TS, light on distributed streaming',
    resumeText: ''
  },
  {
    id: 'sample-3',
    name: 'David Kim',
    role: 'Junior Web Developer',
    expectedScore: 42,
    tier: 'tier_3_mismatch',
    tagline: 'Tier 3 Mismatch — 1.5 yrs exp, coding bootcamp, lacks system design scale',
    resumeText: ''
  }
]
