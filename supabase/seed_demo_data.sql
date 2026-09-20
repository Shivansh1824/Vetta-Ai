-- ==============================================================================
-- VETTA AI — COMPREHENSIVE SAMPLE / DEMO DATA SEED SCRIPT
-- Role: Senior Full-Stack & Distributed Systems Engineer
-- Total Candidates: 12 (4 Tier 1 Match, 4 Tier 2 Review, 4 Tier 3 Mismatch)
-- Idempotent: Can be run multiple times safely
-- ==============================================================================

DO $$
DECLARE
    v_recruiter_id UUID;
    v_job_id UUID;
    v_cand_id UUID;
    v_session_id UUID;
BEGIN

    -- 1. Create or retrieve Demo Recruiter
    SELECT id INTO v_recruiter_id FROM public.recruiters WHERE email = 'demo.recruiter@vetta.ai' LIMIT 1;
    IF v_recruiter_id IS NULL THEN
        INSERT INTO public.recruiters (full_name, email, role_title, company_name)
        VALUES ('Sarah Chen', 'demo.recruiter@vetta.ai', 'Lead Technical Recruiter', 'Vetta AI Labs')
        RETURNING id INTO v_recruiter_id;
    END IF;

    -- 2. Create or retrieve Demo Target Job
    SELECT id INTO v_job_id FROM public.jobs WHERE title = 'Senior Full-Stack & Distributed Systems Engineer' LIMIT 1;
    IF v_job_id IS NULL THEN
        INSERT INTO public.jobs (
            recruiter_id, title, department, experience_level,
            must_haves, nice_to_haves, description_text, status
        )
        VALUES (
            v_recruiter_id,
            'Senior Full-Stack & Distributed Systems Engineer',
            'Core Infrastructure & Platform',
            'Senior (5+ years)',
            ARRAY['React', 'TypeScript', 'Node.js', 'Distributed Systems / Microservices', 'PostgreSQL / SQL'],
            ARRAY['Kafka / Event Streaming', 'Redis Caching', 'Kubernetes / Docker', 'gRPC'],
            'We are seeking a seasoned Senior Full-Stack & Distributed Systems Engineer to spearhead our high-throughput AI intelligence platform. In this role, you will design resilient microservices, scale transactional data pipelines with PostgreSQL and Redis, and architect real-time interactive user interfaces using modern React and TypeScript. You will be responsible for system uptime, latency optimization, and mentoring junior engineers.',
            'active'
        )
        RETURNING id INTO v_job_id;
    END IF;

    -- Clean existing demo candidates for this job to allow clean re-runs
    DELETE FROM public.candidates WHERE job_id = v_job_id;

    -- ==========================================================================
    -- TIER 1: TOP MATCH CANDIDATES (Scores 85 - 95%)
    -- ==========================================================================

    -- Candidate 1: Arjun Mehta (Score: 94, Tier 1)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Arjun Mehta', 'arjun.mehta.tech@example.com', '+1 (555) 234-5678',
        'Senior Distributed Systems Engineer', 7, 94, 'tier_1_match',
        'Exceptional alignment across React, TypeScript, and distributed backend architecture. 7 years experience designing multi-region event pipelines and scalable services.',
        'ARJUN MEHTA
San Francisco, CA | arjun.mehta.tech@example.com | github.com/arjunm

SUMMARY:
7+ years experience designing distributed cloud architectures, high-concurrency microservices, and reactive full-stack web applications. Track record of scaling systems to 100k+ req/sec with 99.99% availability.

TECHNICAL SKILLS:
- Languages: TypeScript, JavaScript, Go, Python, SQL
- Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, GSAP
- Backend & Systems: Node.js, Express, Go, Distributed Consensus, Kafka, Redis, gRPC
- Databases: PostgreSQL, CockroachDB, DynamoDB
- DevOps: Docker, Kubernetes, AWS (ECS, Lambda, RDS), Terraform

EXPERIENCE:
Staff Platform Engineer | Apex Cloud Systems (2022 - Present)
- Architected distributed event stream engine handling 120,000 events/sec using Kafka and Go.
- Led the migration of monolith dashboard to React 18 + TypeScript, reducing initial load latency by 64%.
- Designed idempotent database transactions with PostgreSQL advisory locks and distributed Redis cache.

Senior Full-Stack Developer | Nexus Labs (2019 - 2022)
- Built real-time analytics cockpit with React, WebSockets, and Node.js microservices.
- Enforced zero-downtime blue/green deployment strategy on Kubernetes.'
    )
    RETURNING id INTO v_cand_id;

    -- Requirements for Arjun
    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'met', 'Led migration of monolith dashboard to React 18 + TypeScript, reducing load latency by 64%'),
    (v_cand_id, 'Distributed Systems / Microservices', 'met', 'Architected distributed event stream engine handling 120,000 events/sec using Kafka and Go'),
    (v_cand_id, 'PostgreSQL / SQL', 'met', 'Designed idempotent database transactions with PostgreSQL advisory locks'),
    (v_cand_id, 'Kafka / Event Streaming', 'met', 'Handling 120,000 events/sec using Kafka and Go');

    -- Flags for Arjun (Minor low severity)
    INSERT INTO public.validation_flags (candidate_id, flag_type, description, severity, evidence_quote) VALUES
    (v_cand_id, 'vague_claim', 'Mentions leading monolith migration without specifying team size or direct report count.', 'low', 'Led the migration of monolith dashboard');

    -- Session & Questions for Arjun
    INSERT INTO public.interview_sessions (candidate_id, interviewer_notes, coverage_score, status)
    VALUES (v_cand_id, 'Strong candidate with deep architectural instincts.', 85, 'in_progress')
    RETURNING id INTO v_session_id;

    INSERT INTO public.interview_questions (session_id, candidate_id, question_text, target_criterion, difficulty, candidate_response, is_answered) VALUES
    (v_session_id, v_cand_id, 'How did you prevent data loss and message duplication in your Kafka event stream engine?', 'Distributed Systems', 'advanced', 'We implemented consumer-side idempotency keys backed by Redis TTLs and transactional outbox pattern in Postgres.', true),
    (v_session_id, v_cand_id, 'Walk me through your React performance optimization techniques for rendering real-time telemetry.', 'React / Frontend', 'intermediate', null, false);


    -- Candidate 2: Elena Rostova (Score: 91, Tier 1)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Elena Rostova', 'elena.rostova.eng@example.com', '+1 (555) 345-6789',
        'Staff Full-Stack Architect', 8, 91, 'tier_1_match',
        'Outstanding software architect with deep expertise in TypeScript, complex React state management, and high-performance Node.js APIs.',
        'ELENA ROSTOVA
Seattle, WA | elena.rostova.eng@example.com

SUMMARY:
Staff Full-Stack Architect with 8 years of experience building mission-critical enterprise platforms. Specializes in TypeScript, reactive UI architecture, and resilient distributed backends.

EXPERIENCE:
Staff Full-Stack Engineer | HyperScale Digital (2021 - Present)
- Designed unified UI component design system and state layer in TypeScript and React used by 45+ engineers.
- Re-architected Node.js API services with PostgreSQL partitioning, improving 99th percentile response time to <45ms.
- Implemented asynchronous queue processing with BullMQ and Redis for high-priority notification jobs.

Senior Backend Engineer | DataMesh Inc (2018 - 2021)
- Spearheaded migration of REST APIs to gRPC microservices.
- Managed relational schema migrations for 10TB+ PostgreSQL databases.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'met', 'Designed unified UI component design system in TypeScript and React used by 45+ engineers'),
    (v_cand_id, 'Distributed Systems / Microservices', 'met', 'Spearheaded migration of REST APIs to gRPC microservices'),
    (v_cand_id, 'PostgreSQL / SQL', 'met', 'Re-architected Node.js API services with PostgreSQL partitioning, improving p99 to <45ms');


    -- Candidate 3: Liam O''Connor (Score: 88, Tier 1)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Liam O''Connor', 'liam.oconnor@example.com', '+1 (555) 456-7890',
        'Senior Backend & Distributed Systems Engineer', 6, 88, 'tier_1_match',
        'Heavy distributed systems background with strong Node.js, Go, and Redis experience. Competent in modern React.',
        'LIAM O''CONNOR
Austin, TX | liam.oconnor@example.com

SUMMARY:
Senior Systems Engineer with 6 years building distributed microservices, consensus protocols, and reactive web applications.
SKILLS: Go, Node.js, TypeScript, React, Kafka, Redis, Docker, Kubernetes, PostgreSQL.

EXPERIENCE:
Senior Systems Developer | CloudStream (2022 - Present)
- Engineered low-latency streaming pipeline handling 50k events/sec.
- Built internal monitoring portals using React, TypeScript, and Tailwind.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'Distributed Systems / Microservices', 'met', 'Engineered low-latency streaming pipeline handling 50k events/sec'),
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'met', 'Built internal monitoring portals using React, TypeScript, and Tailwind');


    -- Candidate 4: Priya Sharma (Score: 86, Tier 1)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Priya Sharma', 'priya.sharma.dev@example.com', '+1 (555) 567-8901',
        'Lead Full-Stack Developer', 6, 86, 'tier_1_match',
        'Strong balance of modern React ecosystem and scalable Node/PostgreSQL microservices. Solid system design fundamentals.',
        'PRIYA SHARMA
New York, NY | priya.sharma.dev@example.com

SUMMARY:
Full-Stack Lead with 6 years experience in SaaS platforms, real-time data sync, and modern UI engineering.
EXPERIENCE:
Lead Developer | FinEdge Analytics (2021 - Present)
- Built interactive financial cockpit in Next.js, React, TypeScript.
- Architected backend services with Node.js, PostgreSQL, and Redis caching.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'met', 'Built interactive financial cockpit in Next.js, React, TypeScript'),
    (v_cand_id, 'PostgreSQL / SQL', 'met', 'Architected backend services with Node.js, PostgreSQL, and Redis caching');


    -- ==========================================================================
    -- TIER 2: POTENTIAL / REVIEW CANDIDATES (Scores 60 - 78%)
    -- ==========================================================================

    -- Candidate 5: Marcus Vance (Score: 76, Tier 2)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Marcus Vance', 'marcus.vance@example.com', '+1 (555) 678-9012',
        'Senior Frontend Engineer', 6, 76, 'tier_2_potential',
        'World-class React and TypeScript frontend developer, but limited direct experience with large-scale distributed systems or message queues.',
        'MARCUS VANCE
Denver, CO | marcus.vance@example.com

SUMMARY:
Senior Frontend Specialist with 6 years crafting polished, high-performance web applications using React, TypeScript, and modern state architectures.
SKILLS: React, TypeScript, Next.js, Redux, Node.js (intermediate), Express, PostgreSQL (basic), Jest, Cypress.
EXPERIENCE:
Senior UI Engineer | Orbit UX (2021 - Present)
- Led frontend refactoring of customer dashboard with React 18, improving Core Web Vitals to 98%.
- Authored REST endpoints in Node.js for data consumption.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'met', 'Senior Frontend Specialist with 6 years crafting applications using React, TypeScript'),
    (v_cand_id, 'Distributed Systems / Microservices', 'partial', 'Authored REST endpoints in Node.js but lacks message broker or distributed consensus experience'),
    (v_cand_id, 'PostgreSQL / SQL', 'partial', 'PostgreSQL (basic) query knowledge');

    INSERT INTO public.validation_flags (candidate_id, flag_type, description, severity, evidence_quote) VALUES
    (v_cand_id, 'missing_info', 'No demonstrated experience with Kafka, Redis, or distributed consensus.', 'medium', 'Skills list only basic Node and PostgreSQL');


    -- Candidate 6: Sarah Jenkins (Score: 71, Tier 2)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Sarah Jenkins', 'sarah.jenkins@example.com', '+1 (555) 789-0123',
        'Full-Stack Developer', 3, 71, 'tier_2_potential',
        'Talented full-stack engineer with excellent React and Node.js skills, but falls short of the 5+ years seniority requirement.',
        'SARAH JENKINS
Chicago, IL | sarah.jenkins@example.com

SUMMARY:
Fast-learning Full-Stack Developer with 3 years building consumer web apps with React, TypeScript, Node.js, and Supabase/PostgreSQL.
EXPERIENCE:
Full-Stack Developer | SwiftApp Co (2023 - Present)
- Developed full-stack SaaS features using React, TypeScript, and Node.js.
- Integrated PostgreSQL database with Prisma ORM.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'partial', '3 years professional experience (Job requires 5+ years)'),
    (v_cand_id, 'PostgreSQL / SQL', 'met', 'Integrated PostgreSQL database with Prisma ORM');

    INSERT INTO public.validation_flags (candidate_id, flag_type, description, severity, evidence_quote) VALUES
    (v_cand_id, 'unverified_tenure', 'Total experience is 3 years against a senior requirement of 5+ years.', 'medium', 'Full-Stack Developer with 3 years building consumer web apps');


    -- Candidate 7: Carlos Mendez (Score: 68, Tier 2)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Carlos Mendez', 'carlos.mendez@example.com', '+1 (555) 890-1234',
        'Data & Backend Systems Engineer', 5, 68, 'tier_2_potential',
        'Strong distributed systems and Kafka streaming knowledge, but limited professional React and frontend experience.',
        'CARLOS MENDEZ
Miami, FL | carlos.mendez@example.com

SUMMARY:
Systems & Data Engineer with 5 years experience handling streaming infrastructure with Kafka, Python, Go, and PostgreSQL.
EXPERIENCE:
Data Systems Engineer | StreamFlow Tech (2021 - Present)
- Deployed Kafka clusters and consumer groups processing 20M daily events.
- Created lightweight internal admin scripts in basic React.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'Distributed Systems / Microservices', 'met', 'Deployed Kafka clusters and consumer groups processing 20M daily events'),
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'partial', 'Only basic React scripts; primary background in Python and Go');


    -- Candidate 8: Aisha Patel (Score: 63, Tier 2)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Aisha Patel', 'aisha.patel@example.com', '+1 (555) 901-2345',
        'Backend Java / Cloud Engineer', 5, 63, 'tier_2_potential',
        'Deep Java/Spring enterprise experience and relational DB expertise, but missing required modern React and TypeScript skills.',
        'AISHA PATEL
Boston, MA | aisha.patel@example.com

SUMMARY:
5 years enterprise backend developer specializing in Java, Spring Boot, Microservices, and PostgreSQL optimization.
EXPERIENCE:
Backend Engineer | CoreEnterprise (2021 - Present)
- Designed Spring Boot microservices connected to PostgreSQL databases.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'Distributed Systems / Microservices', 'met', 'Designed Spring Boot microservices'),
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'missing', 'No React or TypeScript listed in experience or skills');


    -- ==========================================================================
    -- TIER 3: MISMATCH CANDIDATES (Scores 28 - 48%)
    -- ==========================================================================

    -- Candidate 9: David Kim (Score: 42, Tier 3)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'David Kim', 'david.kim.dev@example.com', '+1 (555) 012-3456',
        'Junior Web Developer', 1.5, 42, 'tier_3_mismatch',
        'Significant experience deficit (1.5 yrs vs 5+ yrs). Only introductory exposure to React and SQLite.',
        'DAVID KIM
San Jose, CA | david.kim.dev@example.com

SUMMARY:
Junior Web Developer and recent coding academy graduate with 1.5 years hobbyist and freelance web development experience.
SKILLS: HTML, CSS, JavaScript, React (basics), SQLite.
EXPERIENCE:
Junior Web Assistant | LocalBiz Studio (2024 - Present)
- Built landing pages using React components and CSS.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'missing', '1.5 years experience, junior entry level'),
    (v_cand_id, 'Distributed Systems / Microservices', 'missing', 'No distributed systems experience');

    INSERT INTO public.validation_flags (candidate_id, flag_type, description, severity, evidence_quote) VALUES
    (v_cand_id, 'unverified_tenure', 'Candidate has 1.5 years experience, far below required 5+ years senior threshold.', 'high', 'Junior Web Developer with 1.5 years experience'),
    (v_cand_id, 'missing_info', 'Missing TypeScript, PostgreSQL, Kafka, and distributed architecture.', 'high', null);


    -- Candidate 10: Chloe Dubois (Score: 38, Tier 3)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Chloe Dubois', 'chloe.dubois@example.com', '+1 (555) 123-4567',
        'Python & Django Developer', 4, 38, 'tier_3_mismatch',
        'Python specialist with no TypeScript, React, or distributed message streaming exposure.',
        'CHLOE DUBOIS
Portland, OR | chloe.dubois@example.com

SUMMARY:
Backend Python developer with 4 years experience building Django and Flask web applications.
SKILLS: Python, Django, Flask, SQLite, PostgreSQL, HTML/CSS.
EXPERIENCE:
Django Developer | WebFlow Systems (2022 - Present)
- Maintained legacy Django REST framework services.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'missing', 'No React or TypeScript listed'),
    (v_cand_id, 'Distributed Systems / Microservices', 'missing', 'Monolithic Django background only');


    -- Candidate 11: Brandon Lee (Score: 32, Tier 3)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Brandon Lee', 'brandon.lee.qa@example.com', '+1 (555) 234-8901',
        'QA Automation Engineer', 4, 32, 'tier_3_mismatch',
        'Strong QA test automation profile, but lacks software engineering architecture and full-stack development experience.',
        'BRANDON LEE
Atlanta, GA | brandon.lee.qa@example.com

SUMMARY:
QA Automation Engineer specializing in Selenium, Cypress, and end-to-end regression suites for web applications.
SKILLS: Cypress, Selenium, JavaScript, Playwright, Jenkins.
EXPERIENCE:
QA Automation Engineer | QualityFirst (2022 - Present)
- Authored E2E regression suites for web applications.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'missing', 'QA test writer; not a full-stack developer'),
    (v_cand_id, 'Distributed Systems / Microservices', 'missing', 'No backend systems development');


    -- Candidate 12: Maya Lin (Score: 28, Tier 3)
    INSERT INTO public.candidates (
        job_id, name, email, phone, current_title, total_years_exp,
        match_score, tier, summary, resume_text
    )
    VALUES (
        v_job_id, 'Maya Lin', 'maya.lin.design@example.com', '+1 (555) 345-9012',
        'UI/UX & Web Designer', 3, 28, 'tier_3_mismatch',
        'Design portfolio profile with basic HTML/CSS. Complete mismatch for senior distributed systems role.',
        'MAYA LIN
San Diego, CA | maya.lin.design@example.com

SUMMARY:
UI/UX Designer with 3 years creating Figma design systems and basic responsive HTML/CSS web templates.
SKILLS: Figma, Adobe XD, HTML5, CSS3, Webflow, basic JavaScript.
EXPERIENCE:
Web Designer | CreativePixel (2023 - Present)
- Designed marketing landing pages and user journeys in Figma.'
    )
    RETURNING id INTO v_cand_id;

    INSERT INTO public.candidate_requirements (candidate_id, requirement_text, status, evidence_quote) VALUES
    (v_cand_id, 'React + TypeScript (5+ yrs)', 'missing', 'Web designer with basic HTML/CSS only'),
    (v_cand_id, 'Distributed Systems / Microservices', 'missing', 'No backend architecture or systems knowledge');

    INSERT INTO public.validation_flags (candidate_id, flag_type, description, severity, evidence_quote) VALUES
    (v_cand_id, 'inconsistency', 'Application is for Senior Distributed Systems Engineer but profile is entirely visual design.', 'high', 'UI/UX Designer with Figma and Webflow');

END $$;
