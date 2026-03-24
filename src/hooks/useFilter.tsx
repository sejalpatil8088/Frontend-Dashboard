import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { IFilterState, IDateRange, PriceType } from '../types';

// ─── Constants ─────────────────────────────────────────────────────────────

const fmtDate = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d}/${date.getFullYear()}`;
};

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

export const DATE_RANGES: IDateRange[] = [
  {
    label: 'Last 30 Days',
    startDate: fmtDate(addDays(today, -29)),
    endDate:   fmtDate(today),
    compareStartDate: fmtDate(addDays(today, -59)),
    compareEndDate:   fmtDate(addDays(today, -30)),
    compareLabel: 'Previous Period',
  },
];

export const PLATFORMS = ['Amazon', 'Flipkart', 'Myntra'] as const;

const DEFAULT_FILTERS: IFilterState = {
  dateRange: DATE_RANGES[0],
  platform: 'Amazon',
  priceType: 'MRP',
};

// ─── Context ───────────────────────────────────────────────────────────────

interface FilterContextValue {
  filters: IFilterState;
  setDateRange: (range: IDateRange) => void;
  setPlatform: (platform: string) => void;
  setPriceType: (priceType: PriceType) => void;
}

const FilterContext = createContext<FilterContextValue>({
  filters: DEFAULT_FILTERS,
  setDateRange: () => {},
  setPlatform: () => {},
  setPriceType: () => {},
});

// ─── Provider ──────────────────────────────────────────────────────────────

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<IFilterState>(DEFAULT_FILTERS);

  const setDateRange = useCallback((range: IDateRange) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  }, []);

  const setPlatform = useCallback((platform: string) => {
    setFilters((prev) => ({ ...prev, platform }));
  }, []);

  const setPriceType = useCallback((priceType: PriceType) => {
    setFilters((prev) => ({ ...prev, priceType }));
  }, []);

  const value = useMemo(
    () => ({ filters, setDateRange, setPlatform, setPriceType }),
    [filters, setDateRange, setPlatform, setPriceType]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useFilter(): FilterContextValue {
  return useContext(FilterContext);
}
