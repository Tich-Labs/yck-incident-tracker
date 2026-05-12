import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { snakeToCamel } from '@/lib/supabase-utils'

// Hook for querying Supabase data
export function useSupabaseQuery<T>(queryFn?: () => Promise<T>) {
  if (!queryFn) {
    return { data: null, isLoading: false, error: null, status: 'success' } as any;
  }
  return useQuery({
    queryKey: ['supabase', queryFn.toString()],
    queryFn,
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
    if (!user) return null
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    return data
  },
  
  listUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  listServices: async () => {
    const { data, error } = await supabase
      .from('referral_services')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data
  },
  
  listIncidents: async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
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
    const { data, error } = await supabase
      .from('referralServices')
      .insert(service)
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  updateService: async ({ id, ...updates }: any) => {
    const { data, error } = await supabase
      .from('referralServices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  deleteService: async (id: string) => {
    const { error } = await supabase
      .from('referralServices')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
  
  updateUserRole: async ({ userId, role }: { userId: string; role: string }) => {
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
    const { data, error } = await supabase
      .from('users')
      .update({ isActive })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
