import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
  useSignIn,
  useSignOut,
  useSignUp,
} from '@workspace/api-client-react';
import type { AuthErrorCode, AuthResult, AuthUser } from '@workspace/api-client-react';
import { useUI } from './ui-provider';
import { useLocale } from './locale-provider';
import { useToast } from '@/hooks/use-toast';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  checkingError: boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  pending: boolean;
  errorCode: (error: unknown) => AuthErrorCode | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const currentUserKey = getGetCurrentUserQueryKey();

function getErrorCode(error: unknown): AuthErrorCode | null {
  if (!error || typeof error !== 'object') return null;
  const data = 'data' in error ? error.data : null;
  if (data && typeof data === 'object' && 'code' in data) {
    const code = data.code;
    if (typeof code === 'string') return code as AuthErrorCode;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { setAccountOpen } = useUI();
  const { t } = useLocale();
  const { toast } = useToast();
  const currentUser = useGetCurrentUser({
    query: {
      queryKey: currentUserKey,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    },
  });
  const refetchCurrentUser = useRef(currentUser.refetch);
  refetchCurrentUser.current = currentUser.refetch;
  const callbackHandled = useRef(false);
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signOutMutation = useSignOut();

  useEffect(() => {
    if (currentUser.data) queryClient.setQueryData(currentUserKey, currentUser.data);
  }, [currentUser.data, queryClient]);

  useEffect(() => {
    if (callbackHandled.current || typeof window === 'undefined') return;
    callbackHandled.current = true;
    const url = new URL(window.location.href);
    const callback = url.searchParams.get('auth');
    if (callback !== 'confirmed' && callback !== 'confirmation_failed') return;

    url.searchParams.delete('auth');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    setAccountOpen(true);

    void (async () => {
      try {
        await queryClient.cancelQueries({ queryKey: currentUserKey });
        await refetchCurrentUser.current();
      } catch {
        // Keep the confirmation feedback visible; the account panel offers a retry if session lookup fails.
      }
      const confirmed = callback === 'confirmed';
      toast({
        title: t(confirmed ? 'account.callback.confirmedTitle' : 'account.callback.failedTitle'),
        description: t(confirmed ? 'account.callback.confirmedBody' : 'account.callback.failedBody'),
      });
    })();
  }, [queryClient, setAccountOpen, t, toast]);

  const refresh = useCallback(async () => {
    await currentUser.refetch();
  }, [currentUser.refetch]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInMutation.mutateAsync({ data: { email, password } });
    await queryClient.cancelQueries({ queryKey: currentUserKey });
    queryClient.setQueryData(currentUserKey, { user: result.authenticated ? result.user : null });
    return result;
  }, [queryClient, signInMutation.mutateAsync]);

  const signUp = useCallback(async (email: string, password: string) => {
    const result = await signUpMutation.mutateAsync({ data: { email, password } });
    await queryClient.cancelQueries({ queryKey: currentUserKey });
    queryClient.setQueryData(currentUserKey, { user: result.authenticated ? result.user : null });
    return result;
  }, [queryClient, signUpMutation.mutateAsync]);

  const signOut = useCallback(async () => {
    const result = await signOutMutation.mutateAsync();
    await queryClient.cancelQueries({ queryKey: currentUserKey });
    queryClient.setQueryData(currentUserKey, result);
  }, [queryClient, signOutMutation.mutateAsync]);

  const value: AuthContextValue = {
    user: currentUser.data?.user ?? null,
    loading: currentUser.isLoading,
    checkingError: currentUser.isError,
    refresh,
    signIn,
    signUp,
    signOut,
    pending: signInMutation.isPending || signUpMutation.isPending || signOutMutation.isPending,
    errorCode: getErrorCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
