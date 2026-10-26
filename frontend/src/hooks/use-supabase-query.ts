import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { snakeToCamel } from '@/lib/supabase-utils'
import { DEMO_AUDIT_ENTRIES, DEMO_INCIDENTS, DEMO_SERVICES, DEMO_USERS } from '@/lib/demo-data'

// True when there is no authenticated session — anonymous/demo viewers only.
// Real signed-in users keep reading live data; demo data never replaces theirs.
export async function isDemoMode(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !session
  } catch {
    return true
  }
}

// Build-time switch for review/demo builds. When "true", anonymous visitors
// cannot write to Supabase: saves are refused with a message instead.
export const READ_ONLY_DEMO = import.meta.env.VITE_READ_ONLY_DEMO === 'true'

export const DEMO_WRITE_BLOCKED_MESSAGE = 'Demo mode: nothing was saved.'

export async function isWriteBlocked(): Promise<boolean> {
  return READ_ONLY_DEMO && (await isDemoMode())
}

// Hook for querying Supabase data
export function useSupabaseQuery<T>(queryFn?: () => Promise<T>) {
  return useQuery({
    queryKey: ['supabase', queryFn?.toString() ?? 'noop'],
    queryFn: queryFn ?? (async () => null as unknown as T),
    enabled: !!queryFn,
  })
}

export function useSupabaseQueryCamel<T>(queryFn: () => Promise<any>) {
  return useQuery({
    queryKey: ['supabase', queryFn.toString()],
    queryFn: async () => {
      const data = await queryFn()
      return snakeToCamel<T>(data)
    },
  })
}

// Hook for mutating Supabase data
export function useSupabaseMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: { onSuccess?: () => void }
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase'] })
      options?.onSuccess?.()
    },
  })
}

// Common query factories
export const supabaseQueries = {
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { id: 'demo-user', name: 'Demo Admin', email: 'demo@yck.ke', role: 'executive_director', isActive: true }
    }
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    return data
  },
  
  listUsers: async () => {
    if (await isDemoMode()) return DEMO_USERS
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  listServices: async () => {
    if (await isDemoMode()) return DEMO_SERVICES
    const { data, error } = await supabase
      .from('referral_services')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data
  },

  listIncidents: async () => {
    if (await isDemoMode()) return DEMO_INCIDENTS
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  getDashboardStats: async () => {
    if (await isDemoMode()) {
      const total = DEMO_INCIDENTS.length
      const newCount = DEMO_INCIDENTS.filter(i => i.status === 'new').length
      const inProgress = DEMO_INCIDENTS.filter(i => ['assigned', 'pfa_in_progress', 'under_review'].includes(i.status)).length
      const escalated = DEMO_INCIDENTS.filter(i => i.status === 'escalated').length
      const resolved = DEMO_INCIDENTS.filter(i => ['resolved', 'closed'].includes(i.status)).length
      return { total, new: newCount, inProgress, escalated, resolved }
    }
    const { data, error } = await supabase
      .from('incidents')
      .select('status')
    if (error || !data) return { total: 0, new: 0, inProgress: 0, escalated: 0, resolved: 0 }
    const total = data.length
    const newCount = data.filter(i => i.status === 'new').length
    const inProgress = data.filter(i => ['assigned', 'pfa_in_progress', 'under_review'].includes(i.status)).length
    const escalated = data.filter(i => i.status === 'escalated').length
    const resolved = data.filter(i => ['resolved', 'closed'].includes(i.status)).length
    return { total, new: newCount, inProgress, escalated, resolved }
  },

  getEscalatedIncidents: async () => {
    if (await isDemoMode()) return DEMO_INCIDENTS.filter(i => i.status === 'escalated').slice(0, 5)
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', 'escalated')
      .order('created_at', { ascending: false })
      .limit(5)
    if (error || !data) return []
    return data
  },

  listAuditLog: async () => {
    if (await isDemoMode()) return DEMO_AUDIT_ENTRIES
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)
    if (error) throw error
    return data ?? []
  },

  getReports: async ({ from, to }: { from: string; to: string }) => {
    const incidentDate = (row: any) =>
      String(row.incidentDate ?? row.incident_date ?? '').slice(0, 10)

    let rows: any[]
    if (await isDemoMode()) {
      rows = DEMO_INCIDENTS.map((i: any) => snakeToCamel(i))
    } else {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .gte('incident_date', from)
        .lte('incident_date', to)
        .order('incident_date', { ascending: false })
      if (error) throw error
      rows = (data ?? []).map((row) => snakeToCamel(row))
    }

    const inRange = rows.filter((row) => {
      const d = incidentDate(row)
      return d !== '' && d >= from && d <= to
    })

    const tally = (pick: (row: any) => string) => {
      const out: Record<string, number> = {}
      for (const row of inRange) {
        const key = pick(row)
        if (!key) continue
        out[key] = (out[key] ?? 0) + 1
      }
      return out
    }

    const byStatus = tally((r) => r.status ?? 'new')
    const resolved = (byStatus.resolved ?? 0) + (byStatus.closed ?? 0)
    const escalated =
      byStatus.escalated ?? inRange.filter((r) => r.isEscalated).length

    return {
      total: inRange.length,
      escalated,
      resolved,
      byType: tally((r) => r.incidentType ?? 'other'),
      byStatus,
      byAgeGroup: tally((r) => r.survivorAgeGroup ?? 'unknown'),
      byGender: tally((r) => r.survivorGender ?? 'prefer_not_to_say'),
      byMonth: tally((r) => incidentDate(r).slice(0, 7)),
      exportRows: inRange.map((r) => ({
        ref: String(r.id ?? '').slice(-8).toUpperCase(),
        incidentDate: incidentDate(r),
        incidentTime: r.incidentTime ?? '',
        incidentType: r.incidentType ?? 'other',
        location: r.location ?? '',
        survivorAgeGroup: r.survivorAgeGroup ?? 'unknown',
        survivorGender: r.survivorGender ?? 'prefer_not_to_say',
        status: r.status ?? 'new',
        isEscalated: !!r.isEscalated,
        escalatedAt: r.escalatedAt ?? '',
        resolvedAt: r.resolvedAt ?? '',
      })),
    }
  },

  getNewIncidents: async () => {
    if (await isDemoMode()) return DEMO_INCIDENTS.filter(i => i.status === 'new').slice(0, 5)
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(5)
    if (error || !data) return []
    return data
  },
}

// Temp stubs for Convex migration remnants
export class ConvexError extends Error {
  constructor(message: string) { super(message); this.name = 'ConvexError'; }
}
export function usePaginatedQuery(name: any, args?: any, opts?: any) {
  return { results: [], status: 'success', loadMore: () => {} };
}

// Common mutation factories
export const supabaseMutations = {
  createService: async (service: any) => {
    if (await isWriteBlocked()) throw new Error(DEMO_WRITE_BLOCKED_MESSAGE)
    const { data, error } = await supabase
      .from('referral_services')
      .insert(service)
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  updateService: async ({ id, isActive, ...updates }: any) => {
    if (await isWriteBlocked()) throw new Error(DEMO_WRITE_BLOCKED_MESSAGE)
    const patch: Record<string, unknown> = { ...updates }
    if (isActive !== undefined) patch.is_active = isActive
    const { data, error } = await supabase
      .from('referral_services')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  deleteService: async (id: string) => {
    if (await isWriteBlocked()) throw new Error(DEMO_WRITE_BLOCKED_MESSAGE)
    const { error } = await supabase
      .from('referral_services')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
  
  updateUserRole: async ({ userId, role }: { userId: string; role: string }) => {
    if (await isWriteBlocked()) throw new Error(DEMO_WRITE_BLOCKED_MESSAGE)
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  toggleUserActive: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
    if (await isWriteBlocked()) throw new Error(DEMO_WRITE_BLOCKED_MESSAGE)
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
