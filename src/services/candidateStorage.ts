import { supabase } from '../lib/supabase'
import type { Candidate, Tier } from '../types'

export interface SaveCandidateInput {
  id?: string | null
  jobId?: string | null
  name: string
  email?: string | null
  phone?: string | null
  currentTitle?: string | null
  totalYearsExp?: number | null
  resumeText: string
  summary?: string | null
  matchScore?: number
  tier?: Tier
  rawJson?: Record<string, any> | null
}

/**
 * Persists an extracted candidate into the Supabase database.
 * If candidate ID exists, updates the record; otherwise, creates a new entry.
 */
export async function saveCandidateToDatabase(
  input: SaveCandidateInput
): Promise<{ success: boolean; candidate?: Candidate; error?: string }> {
  try {
    const payload = {
      name: input.name.trim() || 'Candidate',
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      current_title: input.currentTitle?.trim() || null,
      total_years_exp: typeof input.totalYearsExp === 'number' ? input.totalYearsExp : 0,
      resume_text: input.resumeText || '',
      summary: input.summary || null,
      match_score: input.matchScore ?? 0,
      tier: input.tier ?? 'tier_2_potential',
      job_id: input.jobId || null,
    }

    if (input.id) {
      const { data, error } = await supabase
        .from('candidates')
        .update(payload)
        .eq('id', input.id)
        .select('*')
        .single()

      if (error) {
        console.warn('Supabase update warning:', error.message)
        return { success: false, error: error.message }
      }
      return { success: true, candidate: data as Candidate }
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.warn('Supabase insert warning:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, candidate: data as Candidate }
  } catch (err: any) {
    console.warn('Database error persisting candidate:', err?.message || err)
    return { success: false, error: err?.message || 'Database error' }
  }
}

/**
 * Fetches all candidates from the database, ordered by latest.
 */
export async function getCandidatesFromDatabase(jobId?: string): Promise<Candidate[]> {
  try {
    let query = supabase.from('candidates').select('*').order('created_at', { ascending: false })
    if (jobId) {
      query = query.eq('job_id', jobId)
    }
    const { data, error } = await query
    if (error || !data) {
      return []
    }
    return data as Candidate[]
  } catch {
    return []
  }
}
