import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const WATCHLIST_LIMIT = 15
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { WatchlistEntry } from '@/types'

export function useWatchlist() {
  const { data: user } = useAuth()
  return useQuery({
    queryKey: ['watchlist', user?.user_id],
    queryFn: async (): Promise<WatchlistEntry[]> => {
      const res = await api.get(`/watchlist/user/${user!.user_id}`)
      if (!res.ok) throw new Error('Failed to fetch watchlist')
      return res.json()
    },
    enabled: !!user,
  })
}

export function useAddTicker() {
  const { data: user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ticker: string) => {
      const res = await api.post(`/watchlist/user/${user!.user_id}`, { ticker })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to add ticker')
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist', user?.user_id] }),
  })
}

export function useRemoveTicker() {
  const { data: user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (watchlistId: string) => {
      const res = await api.delete(`/watchlist/${watchlistId}`)
      if (!res.ok) throw new Error('Failed to remove ticker')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist', user?.user_id] }),
  })
}
