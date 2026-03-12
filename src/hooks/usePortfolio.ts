import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, apiPut } from '../services/api';
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

  const updateNotesTagsMutation = useMutation({
    mutationFn: (data: { symbol: string; note?: string; tags?: string[] }) =>
      apiPut(`/api/portfolio/stocks/${data.symbol}/notes-tags`, {
        note: data.note,
        tags: data.tags,
      }),
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
    updateNotesTags: updateNotesTagsMutation.mutateAsync,
    isAdding: addStockMutation.isPending,
    isRemoving: removeStockMutation.isPending,
    isUpdatingNotesTags: updateNotesTagsMutation.isPending,
  };
}
