import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../services/api';
import {
  PortfolioResponse,
  PortfolioResponseSchema,
  StockNote,
  StockNotesResponseSchema,
} from '../types/stock';

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

  return {
    portfolio: portfolioQuery.data || null,
    isLoading: portfolioQuery.isLoading,
    error: portfolioQuery.error?.message || null,
    addStock: addStockMutation.mutateAsync,
    removeStock: removeStockMutation.mutateAsync,
    isAdding: addStockMutation.isPending,
    isRemoving: removeStockMutation.isPending,
  };
}

export function useStockNotes(symbol: string) {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['stockNotes', symbol],
    queryFn: async (): Promise<StockNote[]> => {
      const raw = await apiGet(`/api/portfolio/stocks/${symbol}/notes`);
      const parsed = StockNotesResponseSchema.parse(raw);
      return parsed.notes;
    },
    enabled: !!symbol,
  });

  const addNoteMutation = useMutation({
    mutationFn: (note: string) =>
      apiPost(`/api/portfolio/stocks/${symbol}/notes`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockNotes', symbol] });
    },
  });

  return {
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error?.message || null,
    addNote: addNoteMutation.mutateAsync,
    isAdding: addNoteMutation.isPending,
  };
}
