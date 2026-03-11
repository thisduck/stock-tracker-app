import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiDelete } from '../services/api';
import {
  StockNoteResponseSchema,
  StockNoteUpsertResponseSchema,
  type StockNote,
} from '../types/stock';

export function useNotes(symbol: string) {
  const queryClient = useQueryClient();

  const noteQuery = useQuery({
    queryKey: ['note', symbol],
    queryFn: async (): Promise<StockNote | null> => {
      const raw = await apiGet(`/api/notes/${symbol}`);
      const parsed = StockNoteResponseSchema.parse(raw);
      return parsed.note;
    },
    enabled: !!symbol,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (content: string): Promise<StockNote> => {
      const raw = await apiPut(`/api/notes/${symbol}`, { content });
      const parsed = StockNoteUpsertResponseSchema.parse(raw);
      return parsed.note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', symbol] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/notes/${symbol}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', symbol] });
    },
  });

  return {
    note: noteQuery.data ?? null,
    isLoading: noteQuery.isLoading,
    error: noteQuery.error?.message || null,
    saveNote: saveNoteMutation.mutateAsync,
    isSaving: saveNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutateAsync,
    isDeleting: deleteNoteMutation.isPending,
  };
}
