import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, apiPatch } from '../services/api';
import {
  PortfolioResponse,
  PortfolioResponseSchema,
  Tag,
  TagResponse,
  TagsResponse,
  TagsResponseSchema,
  TagResponseSchema,
  NotesUpdateResponseSchema,
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

  const updateNotesMutation = useMutation({
    mutationFn: ({ symbol, notes }: { symbol: string; notes: string | null }) =>
      apiPatch(`/api/portfolio/stocks/${symbol}/notes`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      apiPost<TagResponse>('/api/portfolio/tags', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ tagId, data }: { tagId: number; data: { name?: string; color?: string } }) =>
      apiPatch<TagResponse>(`/api/portfolio/tags/${tagId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number) =>
      apiDelete(`/api/portfolio/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const attachTagMutation = useMutation({
    mutationFn: ({ symbol, tagId }: { symbol: string; tagId: number }) =>
      apiPost(`/api/portfolio/stocks/${symbol}/tags`, { tagId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const detachTagMutation = useMutation({
    mutationFn: ({ symbol, tagId }: { symbol: string; tagId: number }) =>
      apiDelete(`/api/portfolio/stocks/${symbol}/tags/${tagId}`),
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
    updateNotes: updateNotesMutation.mutateAsync,
    isUpdatingNotes: updateNotesMutation.isPending,
    createTag: createTagMutation.mutateAsync,
    updateTag: updateTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    attachTag: attachTagMutation.mutateAsync,
    detachTag: detachTagMutation.mutateAsync,
    isCreatingTag: createTagMutation.isPending,
    isUpdatingTag: updateTagMutation.isPending,
    isDeletingTag: deleteTagMutation.isPending,
    isAttachingTag: attachTagMutation.isPending,
    isDetachingTag: detachTagMutation.isPending,
  };
}

export function useTags() {
  const queryClient = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<Tag[]> => {
      const raw = await apiGet('/api/portfolio/tags');
      const parsed = TagsResponseSchema.parse(raw);
      return parsed.tags;
    },
    retry: 1,
  });

  return {
    tags: tagsQuery.data || [],
    isLoading: tagsQuery.isLoading,
    error: tagsQuery.error?.message || null,
  };
}
