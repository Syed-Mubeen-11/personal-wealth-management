import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function useRebalanceSuggestions() {
  return useQuery({
    queryKey: ['rebalance'],
    queryFn: async () => {
      const res = await api.get('/v1/recommendations/rebalance')
      return res.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes per spec
  })
}