'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { getAuth } from '@/shared/api/generated/auth/auth';
import type { UserDto } from '@/shared/api/model';
import { QK } from '@/shared/config';

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  setUser: (user: UserDto | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<UserDto | null> {
  try {
    return await getAuth().authMe();
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: UserDto | null;
}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QK.me(),
    queryFn: fetchMe,
    initialData: initialUser === undefined ? undefined : initialUser,
    staleTime: 60 * 1000,
  });

  const setUser = useCallback((user: UserDto | null) => queryClient.setQueryData(QK.me(), user), [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: query.data ?? null,
      isLoading: query.isPending,
      isAuthenticated: !!query.data,
      error: query.error,
      refetch: query.refetch,
      setUser,
    }),
    [query.data, query.isPending, query.error, query.refetch, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
