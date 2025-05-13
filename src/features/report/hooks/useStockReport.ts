import { useQuery } from '@tanstack/react-query';
import { getStockQuote, StockQuote } from '../../../services/polygon';

/**
 * Hook to fetch and manage stock quote data
 * @param symbol Stock ticker symbol
 * @returns Object containing quote data, loading state and error
 */
export const useStockReport = (symbol: string) => {
  const { data, isLoading, error, isError, refetch } = useQuery<
    StockQuote,
    Error
  >({
    queryKey: ['stockQuote', symbol],
    queryFn: () => getStockQuote(symbol),
    enabled: !!symbol,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    retry: 2, // Retry failed requests twice
  });

  return {
    quote: data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};
