import React, { useState, useMemo, memo } from 'react';
import { IWidgetConfig, ITableData, ITableRow } from '../../types';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useFilter } from '../../hooks/useFilter';
// import { Skeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { TrendBadge } from '../ui/TrendBadge';
import './TableWidget.css';
// import { TrendingUp, TrendingDown } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type SortDirection = 'asc' | 'desc';

// ─── Component ─────────────────────────────────────────────────────────────

interface TableWidgetProps {
  config: IWidgetConfig;
}

export const TableWidget: React.FC<TableWidgetProps> = memo(({ config }) => {
  const { filters } = useFilter();
  const { data, status, error, refetch } = useWidgetData<ITableData>(
    config.dataSource,
    filters
  );
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const sortedRows = useMemo<ITableRow[]>(() => {
    if (!data) return [];
    return [...data.rows].sort((a, b) => {
      const aVal = parseFloat(a.overallSOV);
      const bVal = parseFloat(b.overallSOV);
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [data, sortDir]);

  // const toggleSort = () =>
  //   setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));

  // if (status === 'idle' || status === 'loading') {
  //   return (
  //     <div className="table-widget table-widget--loading" aria-busy="true">
  //       <Skeleton height={13} width="55%" borderRadius={3} />
  //       <div className="table-widget__skeleton-rows">
  //         <Skeleton height={13} borderRadius={3} />
  //         <Skeleton height={13} borderRadius={3} />
  //         <Skeleton height={13} borderRadius={3} />
  //       </div>
  //     </div>
  //   );
  // }

  if (status === 'error' || !data) {
    return (
      <div className="table-widget">
        <ErrorState message={error ?? 'Failed to load'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="table-widget" role="region" aria-label={`${config.title} table`}>
     <div className="table-widget__header">
  <span className="table-widget__title">{config.title}</span>

 <div className="table-widget__dropdown">
  <select
    className="table-widget__select"
    value={sortDir}
    onChange={(e) => setSortDir(e.target.value as SortDirection)}
  >
    <option value="desc">{data.metric || 'Overall SOV'}</option>
    <option value="asc">Low → High</option>
  </select>
  <svg
    className="table-widget__chevron"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2.5 4.5L6 8L9.5 4.5"
      stroke="#6B7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>
</div>

      <table className="laggards-table">
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.name} className="laggards-table__row">
              <td className="laggards-table__name">{row.name}</td>
              <td className="laggards-table__value">{row.overallSOV}</td>
              <td className="laggards-table__trend">
                <TrendBadge value={row.trend} isPositive={row.isPositive} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

TableWidget.displayName = 'TableWidget';
