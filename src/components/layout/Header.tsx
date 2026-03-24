import React, { memo, useState, useCallback } from 'react';
// import { useTheme } from '../../hooks/useTheme';
import { useFilter, PLATFORMS } from '../../hooks/useFilter';
import { TabId } from '../../types';
import { DateRangePicker, DateRangePickerValue, formatDate } from '../ui/DateRangePicker';
import './Header.css';


interface TabConfig {
  id: TabId;
  label: string;
  icon?: string;
}

const TABS: TabConfig[] = [
  { id: 'Overview', label: 'Overview' },
  { id: 'Traffic', label: 'Traffic' },
  { id: 'Conversion', label: 'Conversion' },
  { id: 'Operations', label: 'Operations' },
  { id: 'AI Insights', label: 'AI Insights', icon: '✦' },
];

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SHORT_DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];


const parseStoredDate = (str?: string): Date | null => {
  if (!str) return null;
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const d = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
  return isNaN(d.getTime()) ? null : d;
};

/** "23 Feb" or "23 Feb 2026" */
const fmtShort = (date: Date, withYear = false): string => {
  const s = `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
  return withYear ? `${s} ${date.getFullYear()}` : s;
};

/** "Mon - Tue 23 Feb - 24 Mar 2026" */
const fmtPrimaryLabel = (start: Date | null, end: Date | null): string => {
  if (!start || !end) return 'Select date range';
  return `${SHORT_DAYS[start.getDay()]} - ${SHORT_DAYS[end.getDay()]} ${fmtShort(start)} - ${fmtShort(end, true)}`;
};

/** "24 Jan - 23 Feb 2026" */
const fmtCompareLabel = (start: Date | null, end: Date | null): string => {
  if (!start || !end) return '';
  return `${fmtShort(start)} - ${fmtShort(end, true)}`;
};

export const Header: React.FC<HeaderProps> = memo(({ activeTab, onTabChange }) => {
  const { filters, setDateRange, setPlatform, setPriceType } = useFilter();
  const [activeSubTab, setActiveSubTab] = useState('By Value');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const pickerValue: DateRangePickerValue = {
    primary: {
      start: parseStoredDate(filters.dateRange.startDate),
      end:   parseStoredDate(filters.dateRange.endDate),
    },
    compare: {
      start: parseStoredDate(filters.dateRange.compareStartDate),
      end:   parseStoredDate(filters.dateRange.compareEndDate),
    },
    primaryPreset: filters.dateRange.label,
    comparePreset: filters.dateRange.compareLabel ?? 'Previous Period',
  };

  const handlePickerApply = useCallback((val: DateRangePickerValue) => {
    setDateRange({
      label:            val.primaryPreset,
      startDate:        val.primary.start ? formatDate(val.primary.start) : '',
      endDate:          val.primary.end   ? formatDate(val.primary.end)   : '',
      compareStartDate: val.compare.start ? formatDate(val.compare.start) : undefined,
      compareEndDate:   val.compare.end   ? formatDate(val.compare.end)   : undefined,
      compareLabel:     val.comparePreset,
    });
    setIsPickerOpen(false);
  }, [setDateRange]);

  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  return (
    <>
    <header className="app-header">
      <div className="header-container">

        {/* 🔹 Title + Controls */}
        <div className="header-top-row">
          <div>
          <div className="header-title-row">
 <button className="sidebar-toggle-btn" aria-label="Toggle sidebar">
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="4"
      stroke="#6b7280"
      strokeWidth="2"
    />
    <line
      x1="9"
      y1="3"
      x2="9"
      y2="21"
      stroke="#6b7280"
      strokeWidth="2"
    />
  </svg>
</button>
  <div className="header-divider" />
  <h1 className="header-title">Category Analysis</h1>
</div>
            <div className="header-meta">
              <span className="header-product-info">Health Supplements +3</span>
              <span className="header-product-count">Total Products: 120</span>
            </div>
          </div>

          {/* Controls */}
          <div className="header-controls">
            <button
              className="date-range"
              onClick={() => setIsPickerOpen(true)}
              aria-label="Open date range picker"
            >
              <div className="date-range__top">
                <span className="date-range__primary">
                  {fmtPrimaryLabel(
                    parseStoredDate(filters.dateRange.startDate),
                    parseStoredDate(filters.dateRange.endDate),
                  )}
                </span>
                <svg className="date-range__chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1l5 5 5-5" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {filters.dateRange.compareStartDate && (
                <div className="date-range__compare">
                  Compare: {fmtCompareLabel(
                    parseStoredDate(filters.dateRange.compareStartDate),
                    parseStoredDate(filters.dateRange.compareEndDate),
                  )}
                </div>
              )}
            </button>

            <select
    className="platform-select"
    value={filters.platform}
    onChange={(e) => setPlatform(e.target.value)}
  >
    {PLATFORMS.map((p) => (
      <option key={p}>{p}</option>
    ))}
  </select>

            <button className="filter-btn">
    <span className="filter-icon">≡</span>
    Filters
    <span className="filter-count">5</span>
  </button>
          </div>
        </div>

        {/* 🔹 Breadcrumb */}
     
        <nav className="breadcrumb">
          <span>Planning</span>
          <span className="sep">›</span>
          <span>Breadcrumb</span>
          <span className="sep">›</span>
          <span className="active">Breadcrumb</span>
        </nav>

        {/* 🔹 Tabs */}
        <div className="tab-row">

  {/* LEFT SIDE - Tabs */}
  <div className="tab-nav">
    {TABS.map(({ id, label, icon }) => (
      <button
        key={id}
        className={`tab-btn ${activeTab === id ? 'active' : ''} ${id === 'AI Insights' ? 'ai' : ''}`}
        onClick={() => onTabChange(id)}
      >
        {icon && <span className="icon">{icon}</span>}
        {id === 'AI Insights' ? <span className="ai-label">{label}</span> : label}
      </button>
    ))}
  </div>

  {/* RIGHT SIDE - MRP / SP / By Value */}
<div className="sub-tab-group">

  {/* ✅ MRP / SP Toggle */}
  <div className="price-toggle">
    {(['MRP', 'SP'] as const).map((t) => (
      <button
        key={t}
        className={`price-tab ${filters.priceType === t ? 'active' : ''}`}
        onClick={() => setPriceType(t)}
      >
        {t}
      </button>
    ))}
  </div>
  {/* ✅ By Value Dropdown */}
  <select
    className="value-dropdown"
    value={activeSubTab}
    onChange={(e) => setActiveSubTab(e.target.value)}
  >
    <option value="By Value">By Value</option>
    <option value="By Volume">By Volume</option>
    {/* <option value="By Sales">By Sales</option> */}
  </select>

</div>

</div>

      </div>
    </header>

    {isPickerOpen && (
      <DateRangePicker
        value={pickerValue}
        onApply={handlePickerApply}
        onClose={closePicker}
      />
    )}
  </>
  );
});

Header.displayName = 'Header';