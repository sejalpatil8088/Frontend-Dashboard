// ─── Widget Config ─────────────────────────────────────────────────────────

export type WidgetType = 'topCard' | 'chart' | 'table' | 'metricsGrid';

export interface IWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  dataSourceSP?: string;
  laggardsDataSource?: string;
  colSpan?: 1 | 2 | 3;
}

// ─── Top Card ──────────────────────────────────────────────────────────────

export interface ISparkPoint {
  value: number;
}

export interface ITopCardData {
  value: string | number;
  trend: number;
  trendDirection: 'up' | 'down';
  sparkline: ISparkPoint[];
  label?: string;
}

// ─── Chart ─────────────────────────────────────────────────────────────────

export interface IChartDataPoint {
  month: string;
  value: number;
  prevValue?: number;
}

export interface IChartData {
  series: IChartDataPoint[];
  unit?: string;
}

// ─── Table / Laggards ──────────────────────────────────────────────────────

export interface ITableRow {
  name: string;
  overallSOV: string;
  trend: number;
  isPositive: boolean;
}

export interface ITableData {
  metric?: string;
  columns: string[];
  rows: ITableRow[];
}

// ─── Metrics Grid ──────────────────────────────────────────────────────────

export interface IMetricRow {
  label: string;
  value: string | number;
  trend: number;
  isPositive: boolean;
}

export type MetricStatus = 'Good' | 'Medium' | 'Poor';

export interface IMetricSection {
  title: string;
  status: MetricStatus;
  rows: IMetricRow[];
   laggards?: IMetricRow[];
  laggardsMetric?: string;
}

export interface IMetricsData {
  sections: IMetricSection[];
}

// ─── API State ─────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface IApiState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// ─── Theme ─────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

// ─── Filters ───────────────────────────────────────────────────────────────

export type PriceType = 'MRP' | 'SP';

export interface IDateRange {
  label: string;
  startDate: string;
  endDate: string;
  compareStartDate?: string;
  compareEndDate?: string;
  compareLabel?: string;
}

export interface IFilterState {
  dateRange: IDateRange;
  platform: string;
  priceType: PriceType;
}

// ─── Navigation ────────────────────────────────────────────────────────────

export type TabId = 'Overview' | 'Traffic' | 'Conversion' | 'Operations' | 'AI Insights';
