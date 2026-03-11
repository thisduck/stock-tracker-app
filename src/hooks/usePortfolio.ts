import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, apiPatch } from '../services/api';
import { PortfolioResponse, PortfolioResponseSchema } from '../types/stock';

export function usePortfolio() {
  const queryClient = useQueryClient();

  const portfolioQuery = useQuery({
    queryKey: ['portfolio'],
    queryFn: async (): Promise<PortfolioResponse> => {
      const raw = await apiGet('/api/portfolio');
      return PortfolioResponseSchema.parse(raw);
    },
    retry: 1,
  });

  const addStockMutation = useMutation({
    mutationFn: (data: { symbol: string }) =>
      apiPost('/api/portfolio/stocks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const removeStockMutation = useMutation({
    mutationFn: (symbol: string) =>
      apiDelete(`/api/portfolio/stocks/${symbol}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ symbol, note }: { symbol: string; note: string | null }) =>
      apiPatch(`/api/portfolio/stocks/${symbol}/note`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  return {
    portfolio: portfolioQuery.data || null,
    isLoading: portfolioQuery.isLoading,
    error: portfolioQuery.error?.message || null,
    addStock: addStockMutation.mutateAsync,
    removeStock: removeStockMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    isAdding: addStockMutation.isPending,
    isRemoving: removeStockMutation.isPending,
    isUpdatingNote: updateNoteMutation.isPending,
  };
}
