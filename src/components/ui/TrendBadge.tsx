import React, { memo } from 'react';
import './TrendBadge.css';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendBadgeProps {
  value: number;
  isPositive: boolean;
}

/**
 * Displays a coloured pill showing a percentage change.
 * Colour is driven by isPositive, not just the sign of value,
 * so a "lower is better" metric can show red for positive movement.
 */
export const TrendBadge: React.FC<TrendBadgeProps> = memo(({ value, isPositive }) => (
  <span
    className={`trend-badge ${isPositive ? 'trend-badge--up' : 'trend-badge--down'}`}
    aria-label={`${isPositive ? 'Up' : 'Down'} ${Math.abs(value).toFixed(1)} percent`}
  >
   <span className="trend-badge__arrow" aria-hidden="true">
     {isPositive ? (
  <TrendingUp size={12} style={{ transform: 'translateY(1px)' }} />
) : (
  <TrendingDown size={12} />
)}
    </span>
    {Math.abs(value).toFixed(1)}%
  </span>
));

TrendBadge.displayName = 'TrendBadge';
