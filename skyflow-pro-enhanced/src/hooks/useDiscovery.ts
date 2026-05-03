import { useQuery } from '@tanstack/react-query'
import { DiscoveryService } from '../services/discoveryService'

export function useDiscoveryTimeline(from: string, to: string) {
  return useQuery({
    queryKey: ['discovery', 'timeline', from, to],
    queryFn: () => DiscoveryService.getTimeline(from, to),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDiscoveryQuickPicks(from: string) {
  return useQuery({
    queryKey: ['discovery', 'quickPicks', from],
    queryFn: () => DiscoveryService.getQuickPicks(from),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDiscoveryDeals(from: string) {
  return useQuery({
    queryKey: ['discovery', 'deals', from],
    queryFn: () => DiscoveryService.getLiveDeals(from),
    staleTime: 1 * 60 * 1000,
  })
}
