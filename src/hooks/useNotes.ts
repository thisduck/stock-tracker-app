import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiDelete } from '../services/api';
import { StockNoteResponse, StockNoteResponseSchema } from '../types/stock';

export function useStockNote(symbol: string) {
  const queryClient = useQueryClient();

  const noteQuery = useQuery({
    queryKey: ['note', symbol],
    queryFn: async (): Promise<StockNoteResponse> => {
      const raw = await apiGet(`/api/notes/${symbol}`);
      return StockNoteResponseSchema.parse(raw);
    },
    enabled: !!symbol,
  });

  const saveNoteMutation = useMutation({
    mutationFn: (content: string) =>
      apiPut(`/api/notes/${symbol}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', symbol] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/notes/${symbol}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', symbol] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  return {
    note: noteQuery.data?.note || null,
    isLoading: noteQuery.isLoading,
    error: noteQuery.error?.message || null,
    saveNote: saveNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    isSaving: saveNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
}
