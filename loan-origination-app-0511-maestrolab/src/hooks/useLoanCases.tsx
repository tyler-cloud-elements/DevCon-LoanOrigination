import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { fetchLoanCases } from '../services/loanService';
import { MOCK_LOAN_CASES } from '../data/mockLoanData';
import type { LoanCase } from '../types/loan';

export interface UseLoanCasesResult {
  cases: LoanCase[];
  isLoading: boolean;
  error: string | null;
  usedFallback: boolean;
  refresh: () => Promise<void>;
}

const LoanCasesContext = createContext<UseLoanCasesResult | undefined>(undefined);

export function LoanCasesProvider({ children }: { children: ReactNode }) {
  const { sdk } = useAuth();
  const [cases, setCases] = useState<LoanCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Dedupe concurrent in-flight fetches (covers StrictMode double-invoke + races)
  const inFlightRef = useRef<Promise<void> | null>(null);
  const didInitialLoadRef = useRef(false);

  const load = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;
    setError(null);
    setIsLoading((prev) => (cases.length === 0 ? true : prev));

    const promise = (async () => {
      try {
        const { cases: fetched, usedFallback: fallback } = await fetchLoanCases(sdk);
        // Always merge: real cases (from API) first, then mock demo cases.
        // That way the user can verify live integration while still having
        // the rich demo detail pages to click through.
        const merged = [...fetched, ...MOCK_LOAN_CASES];
        setCases(merged);
        setUsedFallback(fallback || fetched.length === 0);
      } catch (err) {
        setCases(MOCK_LOAN_CASES);
        setUsedFallback(true);
        setError(err instanceof Error ? err.message : 'Failed to load loan cases');
      } finally {
        setIsLoading(false);
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = promise;
    return promise;
  }, [sdk, cases.length]);

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    load();
  }, [load]);

  const value = useMemo(
    () => ({ cases, isLoading, error, usedFallback, refresh: load }),
    [cases, isLoading, error, usedFallback, load],
  );

  return <LoanCasesContext.Provider value={value}>{children}</LoanCasesContext.Provider>;
}

export function useLoanCases(): UseLoanCasesResult {
  const ctx = useContext(LoanCasesContext);
  if (!ctx) throw new Error('useLoanCases must be used inside LoanCasesProvider');
  return ctx;
}
