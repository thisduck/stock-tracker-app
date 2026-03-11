import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../services/api';
import { NotesResponseSchema, type NotesResponse } from '../types/stock';

export function useNotes(symbol: string) {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['notes', symbol],
    queryFn: async (): Promise<NotesResponse> => {
      const raw = await apiGet(`/api/portfolio/stocks/${symbol}/notes`);
      return NotesResponseSchema.parse(raw);
    },
    enabled: !!symbol,
    // If stock is not in portfolio, this will 404 — suppress error gracefully
    retry: false,
  });

  const saveNotesMutation = useMutation({
    mutationFn: (notes: string) =>
      apiPut<NotesResponse>(`/api/portfolio/stocks/${symbol}/notes`, { notes }),
    onSuccess: (data) => {
      queryClient.setQueryData(['notes', symbol], data);
      // Also invalidate portfolio so the notes field stays fresh
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  return {
    notes: notesQuery.data?.notes ?? '',
    isLoading: notesQuery.isLoading,
    isNotInPortfolio: notesQuery.error != null,
    saveNotes: saveNotesMutation.mutateAsync,
    isSaving: saveNotesMutation.isPending,
    saveError: saveNotesMutation.error?.message ?? null,
    saveSuccess: saveNotesMutation.isSuccess,
  };
}
