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
    resumeText: `ARJUN MEHTA
San Francisco, CA | arjun.mehta.tech@example.com | github.com/arjunm

SUMMARY:
7+ years experience designing distributed cloud architectures, high-concurrency microservices, and reactive full-stack web applications. Track record of scaling systems to 120k+ req/sec with 99.99% availability.

TECHNICAL SKILLS:
- Languages: TypeScript, JavaScript, Go, Python, SQL
- Frontend: React 18, Next.js, Redux Toolkit, Tailwind CSS, GSAP
- Backend & Systems: Node.js, Express, Go, Distributed Systems, Kafka, Redis, gRPC
- Databases: PostgreSQL, CockroachDB, DynamoDB
- DevOps: Docker, Kubernetes, AWS (ECS, Lambda, RDS), Terraform

EXPERIENCE:
Staff Platform Engineer | Apex Cloud Systems (2022 - Present)
- Architected distributed event stream engine handling 120,000 events/sec using Kafka and Go.
- Led the migration of monolith dashboard to React 18 + TypeScript, reducing initial load latency by 64%.
- Designed idempotent database transactions with PostgreSQL advisory locks and distributed Redis cache.
- Mentored 6 software engineers on distributed consensus, code quality, and testing standards.

Senior Full-Stack Developer | Nexus Labs (2019 - 2022)
- Built real-time analytics cockpit with React, WebSockets, and Node.js microservices.
- Enforced zero-downtime blue/green deployment strategy on Kubernetes.
- Optimized SQL query performance on a 15TB PostgreSQL instance, eliminating slow query spikes.

EDUCATION:
B.S. in Computer Science — UC Berkeley (2019)`
  },
  {
    id: 'sample-2',
    name: 'Marcus Vance',
    role: 'Senior Frontend Engineer',
    expectedScore: 76,
    tier: 'tier_2_potential',
    tagline: 'Tier 2 Potential — Exceptional React/TS, light on distributed streaming',
    resumeText: `MARCUS VANCE
Denver, CO | marcus.vance@example.com | github.com/marcusv

SUMMARY:
Senior Frontend Specialist with 6 years crafting polished, high-performance web applications using React, TypeScript, and modern state architectures.

SKILLS:
- Frontend: React, TypeScript, Next.js, Redux, Tailwind CSS, Webpack, Vite
- Backend: Node.js (intermediate), Express, REST APIs
- Databases: PostgreSQL (basic queries)
- Testing: Jest, React Testing Library, Cypress

EXPERIENCE:
Senior UI Engineer | Orbit UX (2021 - Present)
- Led frontend refactoring of customer dashboard with React 18 and TypeScript, improving Core Web Vitals to 98%.
- Designed reusable UI component system in TypeScript adopted by 3 frontend squads.
- Authored Node.js BFF (Backend-for-Frontend) services to aggregate REST APIs.

Frontend Developer | PixelCraft (2018 - 2021)
- Built responsive client dashboards with React and Redux.
- Collaborated with product designers on Figma design-to-code implementations.`
  },
  {
    id: 'sample-3',
    name: 'David Kim',
    role: 'Junior Web Developer',
    expectedScore: 42,
    tier: 'tier_3_mismatch',
    tagline: 'Tier 3 Mismatch — 1.5 yrs exp, coding bootcamp, lacks system design scale',
    resumeText: `DAVID KIM
San Jose, CA | david.kim.dev@example.com | github.com/davidkimdev

SUMMARY:
Junior Web Developer and coding academy graduate with 1.5 years experience creating modern web pages with React and JavaScript.

SKILLS:
HTML5, CSS3, JavaScript (ES6), React (fundamentals), SQLite, Git, Tailwind CSS.

EXPERIENCE:
Junior Web Assistant | LocalBiz Studio (2024 - Present)
- Built mobile-responsive landing pages using React components and Tailwind CSS.
- Assisted in integrating third-party payment gateways and form submission APIs.
- Maintained local SQLite test databases for prototyping.

Freelance Web Developer (2023 - 2024)
- Developed personal portfolio sites and small business landing pages.
- Configured static website deployments on Netlify and Vercel.

EDUCATION:
Full-Stack Web Bootcamp Certificate (2023)`
  }
]
