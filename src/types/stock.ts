import { z } from 'zod';

// Matches GET /api/stocks/search response item
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

// Matches GET /api/portfolio response
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
});

export const PortfolioSummarySchema = z.object({
  total_stocks: z.number(),
  total_value: z.number(),
  total_daily_change: z.number(),
});

export const PortfolioResponseSchema = z.object({
  stocks: z.array(PortfolioStockSchema),
  summary: PortfolioSummarySchema,
});

// Matches GET /api/stocks/:symbol response
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

export const StockNoteSchema = z.object({
  id: z.number(),
  content: z.string(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const StockNotesResponseSchema = z.object({
  notes: z.array(StockNoteSchema),
});

export const StockNoteMutationResponseSchema = z.object({
  note: StockNoteSchema,
});

export type StockSearchResult = z.infer<typeof StockSearchResultSchema>;
export type PortfolioStock = z.infer<typeof PortfolioStockSchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type PortfolioResponse = z.infer<typeof PortfolioResponseSchema>;
export type PriceHistoryPoint = z.infer<typeof PriceHistoryPointSchema>;
export type StockDetailResponse = z.infer<typeof StockDetailResponseSchema>;
export type StockNote = z.infer<typeof StockNoteSchema>;
