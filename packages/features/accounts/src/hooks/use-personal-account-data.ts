import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export function usePersonalAccountData(
  userId: string,
  partialAccount?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  },
) {
  const queryKey = ['account:data', userId];

  const queryFn = async () => {
    if (!userId) {
      return null;
    }

    // Use API endpoint to fetch profile data
    const response = await fetch('/api/account-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch account data');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch account data');
    }

    return result.data;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: partialAccount?.id
      ? {
          id: partialAccount.id,
          name: partialAccount.name,
          picture_url: partialAccount.picture_url,
        }
      : undefined,
  });
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['account:data', userId],
      }),
    [queryClient],
  );
}
