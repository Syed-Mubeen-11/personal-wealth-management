import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function useRebalanceSuggestions() {
  return useQuery({
    queryKey: ['rebalance'],
    queryFn: async () => {
      const res = await api.get('/v1/recommendations/rebalance')
      const data = res.data

      const suggestions = (data.suggestions ?? []).map(s => ({
        action: s.action,
        symbol: s.asset_class.replace('_', ' '),
        quantity: s.qty_change,
        estimatedTradeValue: s.estimated_value,
        driftImpact: s.drift_impact ?? 0
      }))

      return {
        ...data,
        suggestions
      }
    },
    staleTime: 2 * 60 * 1000
  })
}