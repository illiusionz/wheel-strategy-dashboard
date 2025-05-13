// src/services/polygon.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const POLYGON_BASE_URL = 'https://api.polygon.io';
const API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

// Create a configured axios instance
const polygonClient = axios.create({
  baseURL: POLYGON_BASE_URL,
  params: { apiKey: API_KEY },
  timeout: 10000, // 10 seconds timeout
});

// Add response interceptor for error handling
polygonClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle rate limiting (status 429)
    if (error.response?.status === 429) {
      console.warn('Rate limit hit for Polygon API, retrying in 1s');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return polygonClient.request(error.config as AxiosRequestConfig);
    }

    // Log other errors and reject the promise
    console.error('Polygon API error:', error.message);
    return Promise.reject(error);
  }
);

// Types
export interface StockQuote {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;
  day: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    vwap: number;
  };
  lastTrade: {
    price: number;
    size: number;
    exchange: number;
    timestamp: number;
  };
  min: {
    c: number;
    h: number;
    l: number;
    o: number;
    v: number;
    vw: number;
  };
  prevDay: {
    c: number;
    h: number;
    l: number;
    o: number;
    v: number;
    vw: number;
  };
}

export interface HistoricalBar {
  c: number; // close price
  h: number; // high price
  l: number; // low price
  o: number; // open price
  t: number; // timestamp (ms)
  v: number; // volume
  vw: number; // volume weighted price
}

export interface OptionContract {
  contract_type: string;
  strike_price: number;
  expiration_date: string;
  underlying_ticker: string;
  ticker: string;
}

// API Methods
export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    const { data } = await polygonClient.get(
      `/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`
    );
    return data.ticker;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
};

export const getDailyPrices = async (
  symbol: string,
  from: string,
  to: string
): Promise<HistoricalBar[]> => {
  try {
    const { data } = await polygonClient.get(
      `/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`
    );
    return data.results;
  } catch (error) {
    console.error(`Error fetching daily prices for ${symbol}:`, error);
    throw error;
  }
};

export const getOptionsChain = async (
  symbol: string
): Promise<OptionContract[]> => {
  try {
    const { data } = await polygonClient.get(
      `/v3/reference/options/contracts`,
      {
        params: {
          underlying_ticker: symbol,
          expiration_date: 'gt:' + new Date().toISOString().split('T')[0],
          limit: 100,
        },
      }
    );
    return data.results;
  } catch (error) {
    console.error(`Error fetching options chain for ${symbol}:`, error);
    throw error;
  }
};

export const getStockNews = async (symbol: string, limit = 10) => {
  try {
    const { data } = await polygonClient.get(`/v2/reference/news`, {
      params: { ticker: symbol, limit },
    });
    return data.results;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
};
