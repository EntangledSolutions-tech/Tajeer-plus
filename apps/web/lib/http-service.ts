'use client';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';

// Types for our HTTP service responses
export interface HttpResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Global sign out function - we'll initialize this when the service is used
let globalSignOut: (() => Promise<void>) | null = null;

// Initialize the sign out function - call this in your app component
export const initializeHttpService = (signOutFn: () => Promise<void>) => {
  globalSignOut = signOutFn;
};

// Helper function to handle logout
const handleLogout = async () => {
  if (globalSignOut) {
    await globalSignOut();
  }
};

// Helper function to check if error indicates unauthorized access
const isUnauthorizedError = (error: any): boolean => {
  if (typeof error === 'string') {
    return error.toLowerCase().includes('unauthorized') ||
           error.toLowerCase().includes('deactivated') ||
           error.toLowerCase().includes('user is unauthorized');
  }

  if (error?.response?.status === 401) {
    return true;
  }

  if (error?.status === 401) {
    return true;
  }

  return false;
};

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.statusText) {
    return error.response.statusText;
  }

  return 'An unexpected error occurred';
};

// GET request
export const getRequest = async <T = any>(url: string, options?: RequestInit): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 401 || isUnauthorizedError(errorMessage)) {
        await handleLogout();
        return {
          data: null,
          error: 'Session expired. Please log in again.',
          success: false,
        };
      }

      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }

    const data = await response.json();
    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    if (isUnauthorizedError(errorMessage)) {
      await handleLogout();
      return {
        data: null,
        error: 'Session expired. Please log in again.',
        success: false,
      };
    }

    return {
      data: null,
      error: errorMessage,
      success: false,
    };
  }
};

// POST request
export const postRequest = async <T = any>(url: string, data?: any, options?: RequestInit): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 401 || isUnauthorizedError(errorMessage)) {
        await handleLogout();
        return {
          data: null,
          error: 'Session expired. Please log in again.',
          success: false,
        };
      }

      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }

    const responseData = await response.json();
    return {
      data: responseData,
      error: null,
      success: true,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    if (isUnauthorizedError(errorMessage)) {
      await handleLogout();
      return {
        data: null,
        error: 'Session expired. Please log in again.',
        success: false,
      };
    }

    return {
      data: null,
      error: errorMessage,
      success: false,
    };
  }
};

// PUT request
export const putRequest = async <T = any>(url: string, data?: any, options?: RequestInit): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 401 || isUnauthorizedError(errorMessage)) {
        await handleLogout();
        return {
          data: null,
          error: 'Session expired. Please log in again.',
          success: false,
        };
      }

      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }

    const responseData = await response.json();
    return {
      data: responseData,
      error: null,
      success: true,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    if (isUnauthorizedError(errorMessage)) {
      await handleLogout();
      return {
        data: null,
        error: 'Session expired. Please log in again.',
        success: false,
      };
    }

    return {
      data: null,
      error: errorMessage,
      success: false,
    };
  }
};

// DELETE request
export const deleteRequest = async <T = any>(url: string, options?: RequestInit): Promise<HttpResponse<T>> => {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 401 || isUnauthorizedError(errorMessage)) {
        await handleLogout();
        return {
          data: null,
          error: 'Session expired. Please log in again.',
          success: false,
        };
      }

      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }

    const responseData = await response.json().catch(() => null);
    return {
      data: responseData,
      error: null,
      success: true,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    if (isUnauthorizedError(errorMessage)) {
      await handleLogout();
      return {
        data: null,
        error: 'Session expired. Please log in again.',
        success: false,
      };
    }

    return {
      data: null,
      error: errorMessage,
      success: false,
    };
  }
};

// Hook to initialize the HTTP service with sign out functionality
export const useHttpService = () => {
  const signOut = useSignOut();

  // Initialize the service when the hook is used
  if (!globalSignOut) {
    initializeHttpService(() => signOut.mutateAsync());
  }

  return {
    getRequest,
    postRequest,
    putRequest,
    deleteRequest,
  };
};
