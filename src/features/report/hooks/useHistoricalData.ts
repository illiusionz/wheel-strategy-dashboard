import { useQuery } from '@tanstack/react-query';
import { getDailyPrices, HistoricalBar } from '../../../services/polygon';

/**
 * Get the date from N days ago formatted as YYYY-MM-DD
 */
const getDateNDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Get the current date formatted as YYYY-MM-DD
 */
const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Hook to fetch historical price data for a stock
 * @param symbol Stock ticker symbol
 * @param days Number of days of history to fetch
 */
export const useHistoricalData = (symbol: string, days: number = 180) => {
  const fromDate = getDateNDaysAgo(days);
  const toDate = getCurrentDate();

  const { data, isLoading, error } = useQuery<HistoricalBar[]>({
    queryKey: ['historicalPrices', symbol, fromDate, toDate],
    queryFn: () => getDailyPrices(symbol, fromDate, toDate),
    enabled: !!symbol,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    historicalData: data || [],
    isLoading,
    error,
  };
};
