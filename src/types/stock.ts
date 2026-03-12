import { z } from 'zod';

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

export const StockSearchResultSchema = z.object({
  id: z.number(),
  symbol: z.string(),
  name: z.string(),
  sector: z.string(),
  current_price: z.string(),
  daily_change: z.string(),
  daily_change_percent: z.string(),
  market_cap: z.number(),
  volume: z.number(),
});

export const StockSearchResponseSchema = z.object({
  stocks: z.array(StockSearchResultSchema),
});

export const PortfolioStockSchema = z.object({
  id: z.number(),
  symbol: z.string(),
  name: z.string(),
  sector: z.string(),
  current_price: z.string(),
  daily_change: z.string(),
  daily_change_percent: z.string(),
  market_cap: z.number(),
  volume: z.number(),
  added_at: z.string().nullable(),
  notes: z.string().nullable(),
  tags: z.array(TagSchema),
});

export const PortfolioSummarySchema = z.object({
  total_stocks: z.number(),
  total_value: z.number(),
  total_daily_change: z.number(),
});

export const PortfolioResponseSchema = z.object({
  stocks: z.array(PortfolioStockSchema),
  summary: PortfolioSummarySchema,
  all_tags: z.array(TagSchema),
});

export const PriceHistoryPointSchema = z.object({
  date: z.string(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string(),
  volume: z.number(),
});

export const StockDetailResponseSchema = z.object({
  stock: z.object({
    id: z.number(),
    symbol: z.string(),
    name: z.string(),
    sector: z.string(),
    current_price: z.string(),
    daily_change: z.string(),
    daily_change_percent: z.string(),
    market_cap: z.number(),
    volume: z.number(),
    updated_at: z.string().nullable(),
    high_52w: z.number(),
    low_52w: z.number(),
    avg_volume: z.number(),
  }),
  price_history: z.array(PriceHistoryPointSchema),
});

export const TagsResponseSchema = z.object({
  tags: z.array(TagSchema),
});

export const TagResponseSchema = z.object({
  tag: TagSchema,
});

export const NotesUpdateResponseSchema = z.object({
  message: z.string(),
  notes: z.string().nullable(),
});

export type Tag = z.infer<typeof TagSchema>;
export type StockSearchResult = z.infer<typeof StockSearchResultSchema>;
export type PortfolioStock = z.infer<typeof PortfolioStockSchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type PortfolioResponse = z.infer<typeof PortfolioResponseSchema>;
export type PriceHistoryPoint = z.infer<typeof PriceHistoryPointSchema>;
export type StockDetailResponse = z.infer<typeof StockDetailResponseSchema>;
export type TagsResponse = z.infer<typeof TagsResponseSchema>;
export type TagResponse = z.infer<typeof TagResponseSchema>;
export type NotesUpdateResponse = z.infer<typeof NotesUpdateResponseSchema>;
