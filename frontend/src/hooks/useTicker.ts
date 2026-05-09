import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Ticker } from '@/types'

export function useTicker(symbol: string) {
  return useQuery({
    queryKey: ['tickers', symbol],
    queryFn: async (): Promise<Ticker> => {
      const res = await api.get(`/tickers/${symbol}`)
      if (!res.ok) throw new Error('Ticker not found')
      return res.json()
    },
    enabled: !!symbol,
    retry: false,
  })
}
