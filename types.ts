interface Topic {
  topic: string;
  relevance_score: string;
}

interface TickerSentiment {
  ticker: string;
  relevance_score: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: string;
}

interface FeedItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Topic[];
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: TickerSentiment[];
}

export interface News {
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
  feed: FeedItem[];
}

export interface Quote {
  adjclose?: number | null;
  date: Date;
  high: number | null;
  low: number | null;
  open: number | null;
  close: number | null;
  volume: number | null;
}

export interface TradingOpportunity {
  stock: string;
  shortName: string;
  founded: string;
  sector: string;
  summary: string;
  recommendationBasedOnNews: string;
  technicalIndicators?: {
    shortMovingAverage: number;
    mediumMovingAverage: number;
    longMovingAverage: number;
    macd?: number;
    rsi?: number;
  };
}
