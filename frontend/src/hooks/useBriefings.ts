import { useQuery } from '@tanstack/react-query'
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
