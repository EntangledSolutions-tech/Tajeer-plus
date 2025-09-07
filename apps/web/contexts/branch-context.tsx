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

  // Helper function to clear selected branch
  const clearSelectedBranch = () => {
    setSelectedBranch(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedBranch');
    }
  };

  // Listen for authentication state changes and clear branch on logout/login/signup
  // This ensures that when users log out, log in, or sign up, their previously selected branch
  // is cleared from both state and localStorage, preventing cross-user data leakage
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      // Clear selected branch on logout, login, or signup
      // SIGNED_OUT: User logged out
      // SIGNED_IN: User logged in (including signup)
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        console.log(`Auth event: ${event}, clearing selected branch`);
        clearSelectedBranch();
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
