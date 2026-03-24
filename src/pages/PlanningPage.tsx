import React, { useState, useMemo, memo } from 'react';
import { Header } from '../components/layout/Header';
import { SectionHeader } from '../components/layout/SectionHeader';
import { DashboardGrid } from '../components/layout/DashboardGrid';
import { IWidgetConfig, TabId } from '../types';
import dashboardConfig from '../config/dashboardConfig.json';
import './ComingSoon.css';

// Cast once at the module boundary — all consumers receive the typed interface
const WIDGET_CONFIGS = dashboardConfig as IWidgetConfig[];

export const PlanningPage: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<TabId>('Overview');

  // Partition configs into logical rows — avoids conditional layout logic in JSX
  const { topCards, restWidgets } = useMemo(
    () => ({
      topCards:    WIDGET_CONFIGS.filter((c) => c.type === 'topCard'),
      restWidgets: WIDGET_CONFIGS.filter((c) => c.type !== 'topCard'),
    }),
    [],
  );

  return (
    <div className="app-main">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-content" role="main">
        {activeTab === 'Overview' ? (
          <section className="performance-panel" aria-label="Performance Overview panel">
            <SectionHeader />
            <DashboardGrid configs={topCards} />
            <DashboardGrid configs={restWidgets} />
          </section>
        ) : (
          <div className="coming-soon">
            <p className="coming-soon__text">{activeTab} — Coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
});

PlanningPage.displayName = 'PlanningPage';
