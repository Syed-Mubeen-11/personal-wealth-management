import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const res = await api.get('/v1/recommendations')
      return res.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await api.patch(`/v1/recommendations/${id}/read`)
    },
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['recommendations'] })
      const previous = queryClient.getQueryData(['recommendations'])

      queryClient.setQueryData(['recommendations'], (old) => {
        if (!old) return old
        const items = Array.isArray(old) ? old : old.items ?? old.recommendations ?? []
        const updated = items.map((r) =>
          r.id === id ? { ...r, is_read: true } : r
        )
        return Array.isArray(old) ? updated : { ...old, items: updated }
      })

      return { previous }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['recommendations'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}