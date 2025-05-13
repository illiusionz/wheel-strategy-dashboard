import { useQuery } from '@tanstack/react-query';
import { getOptionsChain } from '../../../services/polygon';

/**
 * Hook to fetch and manage options chain data
 * @param symbol Stock ticker symbol
 * @returns Object containing options chain data, loading state and error
 */
export const useOptionsChain = (symbol: string) => {
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['optionsChain', symbol],
    queryFn: () => getOptionsChain(symbol),
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 1,
  });

  // Structure data for wheel strategy
  const putOptions =
    data?.filter(
      (option) =>
        option.contract_type === 'put' &&
        new Date(option.expiration_date) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
    ) || [];

  const callOptions =
    data?.filter(
      (option) =>
        option.contract_type === 'call' &&
        new Date(option.expiration_date) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
    ) || [];

  return {
    optionsChain: data,
    putOptions,
    callOptions,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};
