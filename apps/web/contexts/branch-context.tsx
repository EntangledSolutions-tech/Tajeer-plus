'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Branch } from '../hooks/use-branches';

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  isLoading: boolean;
  clearSelectedBranch: () => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();

  // Load selected branch from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBranch = localStorage.getItem('selectedBranch');
      if (savedBranch) {
        try {
          const parsedBranch = JSON.parse(savedBranch);
          setSelectedBranch(parsedBranch);
        } catch (error) {
          console.error('Error parsing saved branch:', error);
          localStorage.removeItem('selectedBranch');
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Helper function to clear selected branch and all localStorage data
  const clearSelectedBranch = () => {
    setSelectedBranch(null);
    if (typeof window !== 'undefined') {
      // Clear all localStorage data on logout
      localStorage.clear();
      console.log('Cleared all localStorage data');
    }
  };

  // Listen for authentication state changes and clear branch on logout/actual login
  // This ensures that when users log out or switch accounts, their previously selected branch
  // is cleared from both state and localStorage, preventing cross-user data leakage
  useEffect(() => {
    let previousUserId: string | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      const currentUserId = session?.user?.id || null;

      // Clear selected branch only on logout or when user ID changes (actual login/account switch)
      if (event === 'SIGNED_OUT') {
        console.log(`Auth event: ${event}, clearing selected branch`);
        clearSelectedBranch();
        previousUserId = null;
      } else if (event === 'SIGNED_IN' && previousUserId && previousUserId !== currentUserId) {
        // Only clear if the user ID changed (different user logged in)
        console.log(`Auth event: User changed from ${previousUserId} to ${currentUserId}, clearing selected branch`);
        clearSelectedBranch();
        previousUserId = currentUserId;
      } else if (event === 'SIGNED_IN' && !previousUserId) {
        // First sign in after page load, just track the user
        previousUserId = currentUserId;
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, clearSelectedBranch]);

  // Save selected branch to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      if (selectedBranch) {
        localStorage.setItem('selectedBranch', JSON.stringify(selectedBranch));
      } else {
        localStorage.removeItem('selectedBranch');
      }
    }
  }, [selectedBranch, isLoading]);

  const value = {
    selectedBranch,
    setSelectedBranch,
    isLoading,
    clearSelectedBranch,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
