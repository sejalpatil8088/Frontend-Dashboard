import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import './ComingSoon.css';

interface ComingSoonProps {
  pageName: string;
  Icon: LucideIcon;
}

export const ComingSoon: React.FC<ComingSoonProps> = memo(({ pageName }) => {
  return (
    <div className="app-main">
      <div className="coming-soon">
        <p className="coming-soon__text">Coming soon</p>
      </div>
    </div>
  );
});

ComingSoon.displayName = 'ComingSoon';
