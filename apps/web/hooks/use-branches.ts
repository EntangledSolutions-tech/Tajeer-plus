import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  is_active: boolean;
  city_region: string | null;
  commercial_registration_number: string | null;
  website: string | null;
  branch_license_number: string | null;
  created_at: string;
  updated_at: string;
}

export function useBranches() {
  const client = useSupabase();
  const queryKey = ['branches'];

  const queryFn = async () => {
    const { data, error } = await client
      .from('branches')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data as Branch[];
  };

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
