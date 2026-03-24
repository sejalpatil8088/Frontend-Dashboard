import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import './DateRangePicker.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectionField = 'primary-start' | 'primary-end' | 'compare-start' | 'compare-end';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerValue {
  primary: DateRange;
  compare: DateRange;
  primaryPreset: string;
  comparePreset: string;
}

interface DateRangePickerProps {
  value: DateRangePickerValue;
  onApply: (value: DateRangePickerValue) => void;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const PRIMARY_PRESETS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Month', 'Custom Range'];
const COMPARE_PRESETS = ['Previous Period', 'Previous Year', 'Custom Range'];

// ─── Utilities ────────────────────────────────────────────────────────────────

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) return false;
  const d = startOfDay(date).getTime();
  const lo = Math.min(startOfDay(start).getTime(), startOfDay(end).getTime());
  const hi = Math.max(startOfDay(start).getTime(), startOfDay(end).getTime());
  return d >= lo && d <= hi;
};

export const formatDate = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d}/${date.getFullYear()}`;
};

const parseInputDate = (str: string): Date | null => {
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
  return isNaN(date.getTime()) ? null : date;
};

const computePrimaryRange = (preset: string, today: Date): DateRange => {
  switch (preset) {
    case 'Last 7 Days':  return { start: addDays(today, -6),  end: today };
    case 'Last 30 Days': return { start: addDays(today, -29), end: today };
    case 'Last 90 Days': return { start: addDays(today, -89), end: today };
    case 'This Month':   return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
    default:             return { start: null, end: null };
  }
};

const computeCompareRange = (preset: string, primary: DateRange): DateRange => {
  if (!primary.start || !primary.end) return { start: null, end: null };
  const days = Math.round(
    Math.abs(startOfDay(primary.end).getTime() - startOfDay(primary.start).getTime()) / 86400000,
  );
  switch (preset) {
    case 'Previous Period': return {
      start: addDays(primary.start, -(days + 1)),
      end:   addDays(primary.start, -1),
    };
    case 'Previous Year': return {
      start: new Date(primary.start.getFullYear() - 1, primary.start.getMonth(), primary.start.getDate()),
      end:   new Date(primary.end.getFullYear()   - 1, primary.end.getMonth(),   primary.end.getDate()),
    };
    default: return { start: null, end: null };
  }
};

const shiftMonth = (year: number, month: number, delta: number): { year: number; month: number } => {
  let m = month + delta;
  let y = year;
  while (m < 0)  { m += 12; y--; }
  while (m > 11) { m -= 12; y++; }
  return { year: y, month: m };
};

// ─── CalendarMonth ────────────────────────────────────────────────────────────

interface CalendarMonthProps {
  year: number;
  month: number;
  primaryRange: DateRange;
  compareRange: DateRange;
  hoverDate: Date | null;
  activeField: SelectionField;
  isSelecting: boolean;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
}

const CalendarMonth = memo<CalendarMonthProps>(({
  year, month, primaryRange, compareRange, hoverDate, activeField, isSelecting, onDayClick, onDayHover,
}) => {
  const firstDay    = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow    = firstDay.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null); // complete last row

  // Effective primary range during hover (preview — only while actively selecting)
  const effectivePrimary: DateRange = (() => {
    if (!hoverDate || !isSelecting) return primaryRange;
    if (activeField === 'primary-end' && primaryRange.start)
      return { start: primaryRange.start, end: hoverDate };
    if (activeField === 'primary-start' && primaryRange.end)
      return { start: hoverDate, end: primaryRange.end };
    return primaryRange;
  })();

  const getCellClass = (date: Date | null): string => {
    if (!date) return 'drp-cell drp-cell--empty';

    const inP  = isInRange(date, effectivePrimary.start, effectivePrimary.end);
    const inC  = !inP && isInRange(date, compareRange.start, compareRange.end);
    const isPS = inP && effectivePrimary.start != null && isSameDay(date, effectivePrimary.start);
    const isPE = inP && effectivePrimary.end   != null && isSameDay(date, effectivePrimary.end);
    const isCS = inC && compareRange.start     != null && isSameDay(date, compareRange.start);
    const isCE = inC && compareRange.end       != null && isSameDay(date, compareRange.end);

    const cls = ['drp-cell'];
    if (inP) {
      cls.push('drp-cell--primary');
      if (isPS) cls.push('drp-cell--ps');
      if (isPE) cls.push('drp-cell--pe');
    } else if (inC) {
      cls.push('drp-cell--compare');
      if (isCS) cls.push('drp-cell--cs');
      if (isCE) cls.push('drp-cell--ce');
    }
    return cls.join(' ');
  };

  return (
    <div className="drp-month">
      <div className="drp-month__grid">
        {DAY_HEADERS.map(d => (
          <div key={d} className="drp-cell drp-cell--header">{d}</div>
        ))}
        {cells.map((date, i) => (
          <div
            key={i}
            className={getCellClass(date)}
            onClick={date ? () => onDayClick(date) : undefined}
            onMouseEnter={date ? () => onDayHover(date) : undefined}
            onMouseLeave={date ? () => onDayHover(null) : undefined}
          >
            {date && <span className="drp-cell__num">{date.getDate()}</span>}
          </div>
        ))}
      </div>
    </div>
  );
});

CalendarMonth.displayName = 'CalendarMonth';

// ─── DateRangePicker ──────────────────────────────────────────────────────────

export const DateRangePicker = memo<DateRangePickerProps>(({ value, onApply, onClose }) => {
  const today = startOfDay(new Date());

  const [primaryPreset, setPrimaryPreset] = useState(value.primaryPreset);
  const [comparePreset, setComparePreset] = useState(value.comparePreset);
  const [primary, setPrimary]   = useState<DateRange>(value.primary);
  const [compare, setCompare]   = useState<DateRange>(value.compare);
  const [hoverDate, setHoverDate]     = useState<Date | null>(null);
  const [activeField, setActiveField] = useState<SelectionField>('primary-start');
  const [isSelecting, setIsSelecting] = useState(false);
  const [viewMonth, setViewMonth]   = useState(() => {
    const ref = value.primary.start ?? today;
    return { year: ref.getFullYear(), month: ref.getMonth() };
  });
  const [inputs, setInputs] = useState({
    primaryStart: value.primary.start ? formatDate(value.primary.start) : '',
    primaryEnd:   value.primary.end   ? formatDate(value.primary.end)   : '',
    compareStart: value.compare.start ? formatDate(value.compare.start) : '',
    compareEnd:   value.compare.end   ? formatDate(value.compare.end)   : '',
  });

  const rightMonth = shiftMonth(viewMonth.year, viewMonth.month, 1);

  // ── Preset handlers ──────────────────────────────────────────────────────────

  const applyPrimaryPreset = useCallback((preset: string) => {
    setPrimaryPreset(preset);
    if (preset === 'Custom Range') return;
    const range = computePrimaryRange(preset, today);
    const cmp   = computeCompareRange(comparePreset, range);
    setPrimary(range);
    setCompare(cmp);
    setInputs({
      primaryStart: range.start ? formatDate(range.start) : '',
      primaryEnd:   range.end   ? formatDate(range.end)   : '',
      compareStart: cmp.start   ? formatDate(cmp.start)   : '',
      compareEnd:   cmp.end     ? formatDate(cmp.end)     : '',
    });
    if (range.start) setViewMonth({ year: range.start.getFullYear(), month: range.start.getMonth() });
    setIsSelecting(false);
  }, [today, comparePreset]);

  const applyComparePreset = useCallback((preset: string) => {
    setComparePreset(preset);
    if (preset === 'Custom Range') return;
    const cmp = computeCompareRange(preset, primary);
    setCompare(cmp);
    setInputs(prev => ({
      ...prev,
      compareStart: cmp.start ? formatDate(cmp.start) : '',
      compareEnd:   cmp.end   ? formatDate(cmp.end)   : '',
    }));
  }, [primary]);

  // ── Calendar click ───────────────────────────────────────────────────────────

  const handleDayClick = useCallback((date: Date) => {
    if (activeField === 'primary-start') {
      const next: DateRange = { start: date, end: primary.end };
      setPrimary(next);
      setInputs(prev => ({ ...prev, primaryStart: formatDate(date) }));
      setActiveField('primary-end');
      setIsSelecting(true);          // started selecting — hover preview ON
      setPrimaryPreset('Custom Range');

    } else if (activeField === 'primary-end') {
      const s = primary.start ? startOfDay(primary.start).getTime() : 0;
      const next: DateRange = startOfDay(date).getTime() >= s
        ? { start: primary.start, end: date }
        : { start: date, end: primary.start };
      const cmp = comparePreset !== 'Custom Range' ? computeCompareRange(comparePreset, next) : compare;
      setPrimary(next);
      setCompare(cmp);
      setInputs(prev => ({
        ...prev,
        primaryStart: next.start ? formatDate(next.start) : prev.primaryStart,
        primaryEnd:   next.end   ? formatDate(next.end)   : '',
        compareStart: cmp.start  ? formatDate(cmp.start)  : prev.compareStart,
        compareEnd:   cmp.end    ? formatDate(cmp.end)    : prev.compareEnd,
      }));
      setActiveField('primary-start');
      setIsSelecting(false);         // selection complete — hover preview OFF
      setPrimaryPreset('Custom Range');

    } else if (activeField === 'compare-start') {
      setCompare(prev => ({ ...prev, start: date }));
      setInputs(prev => ({ ...prev, compareStart: formatDate(date) }));
      setActiveField('compare-end');
      setIsSelecting(true);
      setComparePreset('Custom Range');

    } else { // compare-end
      const s = compare.start ? startOfDay(compare.start).getTime() : 0;
      const next: DateRange = startOfDay(date).getTime() >= s
        ? { start: compare.start, end: date }
        : { start: date, end: compare.start };
      setCompare(next);
      setInputs(prev => ({
        ...prev,
        compareStart: next.start ? formatDate(next.start) : prev.compareStart,
        compareEnd:   next.end   ? formatDate(next.end)   : '',
      }));
      setActiveField('compare-start');
      setIsSelecting(false);
      setComparePreset('Custom Range');
    }
  }, [activeField, primary, compare, comparePreset]);

  // ── Text input handler ───────────────────────────────────────────────────────

  const handleInput = useCallback(
    (field: 'primaryStart' | 'primaryEnd' | 'compareStart' | 'compareEnd', val: string) => {
      setInputs(prev => ({ ...prev, [field]: val }));
      const date = parseInputDate(val);
      if (!date) return;
      if (field === 'primaryStart') {
        setPrimary(prev => ({ ...prev, start: date }));
        setPrimaryPreset('Custom Range');
      } else if (field === 'primaryEnd') {
        setPrimary(prev => ({ ...prev, end: date }));
        setPrimaryPreset('Custom Range');
      } else if (field === 'compareStart') {
        setCompare(prev => ({ ...prev, start: date }));
        setComparePreset('Custom Range');
      } else {
        setCompare(prev => ({ ...prev, end: date }));
        setComparePreset('Custom Range');
      }
    },
    [],
  );

  // ── Month navigation ─────────────────────────────────────────────────────────

  const prevMonth = useCallback(() => setViewMonth(p => shiftMonth(p.year, p.month, -1)), []);
  const nextMonth = useCallback(() => setViewMonth(p => shiftMonth(p.year, p.month,  1)), []);

  // ── Apply ────────────────────────────────────────────────────────────────────

  const handleApply = useCallback(() => {
    onApply({ primary, compare, primaryPreset, comparePreset });
  }, [onApply, primary, compare, primaryPreset, comparePreset]);

  // ── Click outside & Escape ───────────────────────────────────────────────────

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose();
    };
    const frame = requestAnimationFrame(() => document.addEventListener('mousedown', onMouse));
    return () => { cancelAnimationFrame(frame); document.removeEventListener('mousedown', onMouse); };
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="drp-overlay" role="dialog" aria-modal="true" aria-label="Date range picker">
      <div className="drp" ref={dialogRef}>

        {/* ── Left: Calendar ──────────────────────────────────────────────── */}
        <div className="drp__cal-panel">

          {/* Month navigation header */}
          <div className="drp__nav">
            <button className="drp__nav-btn" onClick={prevMonth} aria-label="Previous months">←</button>
            <div className="drp__nav-labels">
              <span>{MONTH_NAMES[viewMonth.month]} {viewMonth.year}</span>
              <span>{MONTH_NAMES[rightMonth.month]} {rightMonth.year}</span>
            </div>
            <button className="drp__nav-btn" onClick={nextMonth} aria-label="Next months">→</button>
          </div>

          {/* Two calendars */}
          <div className="drp__months">
            <CalendarMonth
              year={viewMonth.year}
              month={viewMonth.month}
              primaryRange={primary}
              compareRange={compare}
              hoverDate={hoverDate}
              activeField={activeField}
              isSelecting={isSelecting}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
            />
            <div className="drp__month-sep" />
            <CalendarMonth
              year={rightMonth.year}
              month={rightMonth.month}
              primaryRange={primary}
              compareRange={compare}
              hoverDate={hoverDate}
              activeField={activeField}
              isSelecting={isSelecting}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
            />
          </div>

          {/* Legend + action buttons */}
          <div className="drp__footer">
            <div className="drp__legend">
              <span className="drp__legend-item">
                <span className="drp__legend-swatch drp__legend-swatch--primary" />
                Primary Range
              </span>
              <span className="drp__legend-item">
                <span className="drp__legend-swatch drp__legend-swatch--compare" />
                Compare Range
              </span>
            </div>
            <div className="drp__actions">
              <button className="drp__btn drp__btn--cancel" onClick={onClose}>Cancel</button>
              <button className="drp__btn drp__btn--apply"  onClick={handleApply}>Apply</button>
            </div>
          </div>
        </div>

        {/* ── Vertical divider ────────────────────────────────────────────── */}
        <div className="drp__panel-sep" />

        {/* ── Right: Controls ─────────────────────────────────────────────── */}
        <div className="drp__ctrl-panel">

          {/* Date Range section */}
          <div className="drp__ctrl-section">
            <h3 className="drp__ctrl-title">Date Range</h3>
            <select
              className="drp__preset-select"
              value={primaryPreset}
              onChange={e => applyPrimaryPreset(e.target.value)}
            >
              {PRIMARY_PRESETS.map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="drp__range-row">
              <div className="drp__input-group">
                <input
                  className={`drp__date-input${activeField === 'primary-start' ? ' drp__date-input--active' : ''}`}
                  value={inputs.primaryStart}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  onFocus={() => setActiveField('primary-start')}
                  onChange={e => handleInput('primaryStart', e.target.value)}
                />
                <span className="drp__input-hint">MM/DD/YYYY</span>
              </div>
              <span className="drp__range-arrow">→</span>
              <div className="drp__input-group">
                <input
                  className={`drp__date-input${activeField === 'primary-end' ? ' drp__date-input--active' : ''}`}
                  value={inputs.primaryEnd}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  onFocus={() => setActiveField('primary-end')}
                  onChange={e => handleInput('primaryEnd', e.target.value)}
                />
                <span className="drp__input-hint">MM/DD/YYYY</span>
              </div>
            </div>
          </div>

          {/* Compare to section */}
          <div className="drp__ctrl-section">
            <h3 className="drp__ctrl-title">Compare to</h3>
            <select
              className="drp__preset-select"
              value={comparePreset}
              onChange={e => applyComparePreset(e.target.value)}
            >
              {COMPARE_PRESETS.map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="drp__range-row">
              <div className="drp__input-group">
                <input
                  className={`drp__date-input${activeField === 'compare-start' ? ' drp__date-input--active' : ''}`}
                  value={inputs.compareStart}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  onFocus={() => setActiveField('compare-start')}
                  onChange={e => handleInput('compareStart', e.target.value)}
                />
                <span className="drp__input-hint">MM/DD/YYYY</span>
              </div>
              <span className="drp__range-arrow">→</span>
              <div className="drp__input-group">
                <input
                  className={`drp__date-input${activeField === 'compare-end' ? ' drp__date-input--active' : ''}`}
                  value={inputs.compareEnd}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  onFocus={() => setActiveField('compare-end')}
                  onChange={e => handleInput('compareEnd', e.target.value)}
                />
                <span className="drp__input-hint">MM/DD/YYYY</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

DateRangePicker.displayName = 'DateRangePicker';
