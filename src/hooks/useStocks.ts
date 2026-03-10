import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api';
import {
  StockSearchResponseSchema,
  StockDetailResponseSchema,
  StockNotesResponseSchema,
  StockNoteMutationResponseSchema,
  type StockSearchResult,
  type StockDetailResponse,
  type StockNote,
} from '../types/stock';

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['stockSearch', query],
    queryFn: async (): Promise<StockSearchResult[]> => {
      const raw = await apiGet(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      const parsed = StockSearchResponseSchema.parse(raw);
      return parsed.stocks;
    },
    enabled: query.length >= 1,
    staleTime: 30_000,
  });
}

export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: async (): Promise<StockDetailResponse> => {
      const raw = await apiGet(`/api/stocks/${symbol}`);
      return StockDetailResponseSchema.parse(raw);
    },
    enabled: !!symbol,
    refetchInterval: 60_000,
  });
}

export function useStockNotes(symbol: string) {
  return useQuery({
    queryKey: ['stockNotes', symbol],
    queryFn: async (): Promise<StockNote[]> => {
      const raw = await apiGet(`/api/stocks/${symbol}/notes`);
      const parsed = StockNotesResponseSchema.parse(raw);
      return parsed.notes;
    },
    enabled: !!symbol,
  });
}

export function useStockNoteMutations(symbol: string) {
  const queryClient = useQueryClient();

  const createNote = useMutation({
    mutationFn: async (content: string): Promise<StockNote> => {
      const raw = await apiPost(`/api/stocks/${symbol}/notes`, { content });
      return StockNoteMutationResponseSchema.parse(raw).note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockNotes', symbol] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async (payload: { noteId: number; content: string }): Promise<StockNote> => {
      const raw = await apiPut(`/api/stocks/${symbol}/notes/${payload.noteId}`, {
        content: payload.content,
      });
      return StockNoteMutationResponseSchema.parse(raw).note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockNotes', symbol] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: number): Promise<void> => {
      await apiDelete(`/api/stocks/${symbol}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockNotes', symbol] });
    },
  });

  return {
    createNote: createNote.mutateAsync,
    updateNote: updateNote.mutateAsync,
    deleteNote: deleteNote.mutateAsync,
    isCreating: createNote.isPending,
    isUpdating: updateNote.isPending,
    isDeleting: deleteNote.isPending,
  };
}
