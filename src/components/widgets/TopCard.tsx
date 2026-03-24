import React, { memo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
// import { TrendingUp,  BarChart3, Package } from 'lucide-react';
import { IWidgetConfig, ITopCardData } from '../../types';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useFilter } from '../../hooks/useFilter';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { TrendBadge } from '../ui/TrendBadge';
import './TopCard.css';

// const getIcon = (title: string) => {
//   switch (title) {
//     case 'Market Share':
//       return <TrendingUp size={16} />;
//     case 'Overall SOV%':
//       return <BarChart3 size={16} />;
//     case 'Wt. Availability%':
//       return <Package size={16} />;
//     default:
//       return <TrendingUp size={16} />;
//   }
// };

interface TopCardProps {
  config: IWidgetConfig;
}

export const TopCard: React.FC<TopCardProps> = memo(({ config }) => {
  const { filters } = useFilter();
  const dataSource =
    filters.priceType === 'SP' && config.dataSourceSP
      ? config.dataSourceSP
      : config.dataSource;
  const { data, status, error, refetch } = useWidgetData<ITopCardData>(
    dataSource,
    filters
  );

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="top-card top-card--loading" aria-busy="true">
        <Skeleton height={10} width="50%" borderRadius={3} />
        <Skeleton height={32} width="40%" borderRadius={6} />
        <Skeleton height={50} borderRadius={4} />
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <div className="top-card">
        <ErrorState message={error ?? 'Failed to load data'} onRetry={refetch} />
      </div>
    );
  }

  const isUp = data.trendDirection === 'up';
  const strokeColor = isUp ? '#16a34a' : '#dc2626';

  return (
    <div className="top-card" role="region" aria-label={config.title}>
      {/* HEADER */}
      <div className="top-card__header">
        {/* <span className="top-card__icon">{(config.title)}</span> */}
        <span className="top-card__title">{config.title}</span>
        {data.label && <span className="top-card__label block">{data.label}</span>}
      </div>

      {/* BODY */}
      <div className="top-card__body">
        <div className="top-card__content">
          {/* VALUE */}
          <div className="top-card__left">
            <span className="top-card__value">{data.value}</span>
          </div>

          {/* GRAPH */}
          <div className="top-card__sparkline">
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={data.sparkline}>
                <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={strokeColor}
                  fill={strokeColor}
                  fillOpacity={0.08}
                  strokeWidth={1.8}
                  isAnimationActive
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TREND BADGE */}
        <div className="top-card__trend">
          <TrendBadge value={data.trend} isPositive={isUp} />
        </div>
      </div>
    </div>
  );
});

TopCard.displayName = 'TopCard';