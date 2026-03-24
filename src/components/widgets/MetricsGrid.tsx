import React, { memo } from 'react';
import { IWidgetConfig, IMetricsData, IMetricSection, MetricStatus } from '../../types';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useFilter } from '../../hooks/useFilter';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { TrendBadge } from '../ui/TrendBadge';
import { Eye, ShoppingCart, Truck } from 'lucide-react';
import './MetricsGrid.css';


// ─── Constants ─────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Traffic: <Eye size={16} />,
  Conversion: <ShoppingCart size={16} />,
  Operations: <Truck size={16} />,
};

const STATUS_CLASS: Record<MetricStatus, string> = {
  Good: 'status--good',
  Medium: 'status--medium',
  Poor: 'status--poor',
};

// ─── Sub-components ────────────────────────────────────────────────────────

interface SectionPanelProps {
  section: IMetricSection;
}

const SectionPanel: React.FC<SectionPanelProps> = memo(({ section }) => (
  <div className="metrics-section" role="region" aria-label={section.title}>
    <div className="metrics-section__header">
      <span className="metrics-section__icon" aria-hidden="true">
        {SECTION_ICONS[section.title] ?? '•'}
      </span>
      <span className="metrics-section__title">{section.title}</span>
      <span
        className={`metrics-section__status ${STATUS_CLASS[section.status]}`}
        title={`Status: ${section.status}`}
      >
        {section.status}
      </span>
      <button
        className="metrics-section__expand"
        aria-label={`Expand ${section.title}`}
        title="Expand"
      >
        ↗
      </button>
    </div>

    <table className="metrics-table" aria-label={`${section.title} metrics`}>
      <tbody>
        {section.rows.map((row) => (
          <tr key={row.label} className="metrics-table__row">
            <td className="metrics-table__label">{row.label}</td>
            <td className="metrics-table__value">{row.value}</td>
            <td className="metrics-table__trend">
              <TrendBadge value={row.trend} isPositive={row.isPositive} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* ── Top Laggards (renders inside same card if data exists) ── */}
    {section.laggards && section.laggards.length > 0 && (
      <div className="metrics-section__bottom">
        <div className="metrics-laggards__header">
          <span className="metrics-laggards__title">Top Laggards</span>
          <span className="metrics-laggards__metric">{section.laggardsMetric}</span>
        </div>
        <table className="metrics-table">
          <tbody>
            {section.laggards.map((row) => (
              <tr key={row.label} className="metrics-table__row">
                <td className="metrics-table__label metrics-table__label--link">{row.label}</td>
                <td className="metrics-table__value">{row.value}</td>
                <td className="metrics-table__trend">
                  <TrendBadge value={row.trend} isPositive={row.isPositive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
));

SectionPanel.displayName = 'SectionPanel';

// ─── Main Component ────────────────────────────────────────────────────────

interface MetricsGridProps {
  config: IWidgetConfig;
}

export const MetricsGrid: React.FC<MetricsGridProps> = memo(({ config }) => {
  const { filters } = useFilter();
  const { data, status, error, refetch } = useWidgetData<IMetricsData>(
    config.dataSource,
    filters
  );

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="metrics-grid metrics-grid--loading" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="metrics-section">
            <div className="metrics-section__header">
              <Skeleton height={14} width="60%" borderRadius={3} />
            </div>
            <div className="metrics-skeleton-rows">
              <Skeleton height={13} borderRadius={3} />
              <Skeleton height={13} borderRadius={3} />
              <Skeleton height={13} borderRadius={3} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <div className="metrics-grid metrics-grid--error">
        <ErrorState message={error ?? 'Failed to load metrics'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="metrics-grid">
      {data.sections.map((section) => (
        <SectionPanel key={section.title} section={section} />
      ))}
    </div>
  );
});

MetricsGrid.displayName = 'MetricsGrid';