import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { Briefing } from '@/types'

export function useBriefings() {
  const { data: user } = useAuth()
  return useQuery({
    queryKey: ['briefings', user?.user_id],
    queryFn: async (): Promise<Briefing[]> => {
      const res = await api.get(`/briefings/user/${user!.user_id}`)
      if (!res.ok) throw new Error('Failed to fetch briefings')
      return res.json()
    },
    enabled: !!user,
  })
}

export function useBriefing(id: string) {
  return useQuery({
    queryKey: ['briefings', id],
    queryFn: async (): Promise<Briefing> => {
      const res = await api.get(`/briefings/${id}`)
      if(!res.ok) throw new Error('Failed to fetch briefing')
      return res.json()
    }
  })
}


export function useSetBriefingPublic() {
  const queryClient = useQueryClient()
  const { data: user } = useAuth()
  return useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const res = await api.patch(`/briefings/${id}/public`, { is_public: isPublic })
      if (!res.ok) throw new Error('Failed to update briefing')
      return res.json() as Promise<Briefing>
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['briefings', updated.briefing_id], updated)
      queryClient.setQueryData(['briefings', user?.user_id, 'latest'], updated)
    },
  })
}

export function useDeleteBriefing() {
  const queryClient = useQueryClient()
  const { data: user } = useAuth()
  return useMutation({
    mutationFn: async (briefingId: string) => {
      const res = await api.delete(`/briefings/${briefingId}`)
      if (!res.ok) throw new Error('Failed to delete briefing')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings', user?.user_id] })
      queryClient.invalidateQueries({ queryKey: ['briefings', user?.user_id, 'latest'] })
    },
  })
}

export function useLatestBriefing() {
  const { data: user } = useAuth()
  return useQuery({
    queryKey: ['briefings', user?.user_id, 'latest'],
    queryFn: async (): Promise<Briefing> => {
      const res = await api.get(`/briefings/user/${user!.user_id}/latest`)
      if (!res.ok) throw new Error('Failed to fetch latest briefing')
      return res.json()
    },
    enabled: !!user,
  })
}
