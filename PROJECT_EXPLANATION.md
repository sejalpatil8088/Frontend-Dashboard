# Dashboard UI — Full Explanation 

---

## Explaination

This is a **Config-Driven Analytics Dashboard** built with **React 19 + TypeScript**, bootstrapped with Create React App.

It shows e-commerce analytics data (Market Share, SOV%, Availability, etc.) for a product category like "Health Supplements" across platforms like Amazon, Flipkart, and Myntra.

The key word is **"config-driven"** — the entire dashboard is controlled by one JSON file (`dashboardConfig.json`). You do not hardcode widgets. You describe them in JSON and the app renders them automatically.

---

## Tech Stack

| Layer       | Technology          | Why                                         |
|-------------|---------------------|---------------------------------------------|
| UI          | React 19            | Component-based, fast re-renders            |
| Language    | TypeScript          | Type safety, catches bugs at compile time   |
| Routing     | React Router v6     | Multi-page navigation (Planning, Reports…)  |
| Charts      | Recharts            | Area charts and sparklines                  |
| Icons       | Lucide React        | Lightweight SVG icons                       |
| Styling     | Plain CSS + CSS Variables | No runtime cost, free theme switching  |
| State       | React Context + Hooks | No Redux needed at this scale             |

---

## Project Folder Structure

```
src/
├── config/
│   └── dashboardConfig.json    <- THE SINGLE SOURCE OF TRUTH
├── types/
│   └── index.ts                <- All TypeScript interfaces
├── services/
│   └── dataService.ts          <- Fetch wrapper (swap for real API here)
├── hooks/
│   ├── useWidgetData.ts        <- Generic data fetching hook
│   ├── useFilter.tsx           <- Global filter state (date, platform)
│   └── useTheme.tsx            <- Light/dark theme, saved to localStorage
├── components/
│   ├── layout/
│   │   ├── Header.tsx          <- Tabs, filters, date picker
│   │   ├── DashboardGrid.tsx   <- CSS Grid layout engine
│   │   ├── Sidebar.tsx         <- Left navigation
│   │   └── SectionHeader.tsx   <- Row title above widgets
│   ├── widgets/
│   │   ├── WidgetRenderer.tsx  <- switch(type) picks the right component
│   │   ├── TopCard.tsx         <- KPI card with sparkline chart
│   │   ├── MetricsGrid.tsx     <- Table of metric rows with status
│   │   └── TableWidget.tsx     <- Generic data table
│   └── ui/
│       ├── Skeleton.tsx        <- Animated loading placeholder
│       ├── ErrorState.tsx      <- Error message with retry button
│       ├── TrendBadge.tsx      <- Green up / Red down badge
│       └── DateRangePicker.tsx <- Calendar popup with compare range
└── pages/
    ├── PlanningPage.tsx        <- Main page, assembles everything
    └── ComingSoon.tsx          <- Placeholder for other tab pages
```

---

## Data Flow — Step by Step

```
dashboardConfig.json
        |
        v
PlanningPage.tsx
  - Reads the JSON
  - Splits configs: topCards vs restWidgets
        |
        v
DashboardGrid.tsx
  - Places each widget in a CSS Grid cell
  - Uses config.colSpan (1, 2, or 3) to control width
        |
        v
WidgetRenderer.tsx
  - switch(config.type) picks the right component
  - 'topCard'     -> TopCard
  - 'metricsGrid' -> MetricsGrid
  - 'table'       -> TableWidget
        |
        v
TopCard / MetricsGrid / TableWidget
  - Each calls useWidgetData(dataSource, filters)
        |
        v
dataService.ts
  - fetch() from public/mock/*.json
  - Simulates 300–700ms network delay
```

**Key point for the interviewer:**
When a user changes the date filter or platform, `FilterContext` updates globally. Every widget calls `useWidgetData`, which has `filters.dateRange.label` and `filters.platform` in its `useEffect` dependency array. So all widgets automatically re-fetch simultaneously — no manual wiring needed.

---

## Key Files Explained

### 1. `dashboardConfig.json` — The brain of the app

```json
[
  {
    "id": "marketShare",
    "type": "topCard",
    "title": "Market Share",
    "dataSource": "/mock/marketShare.json",
    "dataSourceSP": "/mock/marketShare.sp.json",
    "colSpan": 1
  },
  {
    "id": "metricsGrid",
    "type": "metricsGrid",
    "title": "Performance Metrics",
    "dataSource": "/mock/metricsGrid.json",
    "colSpan": 3
  }
]
```

To add a new widget you only add an entry here. No component tree changes. This follows the **Open/Closed Principle** — open for extension, closed for modification.

---

### 2. `useWidgetData.ts` — The generic data hook

```ts
export function useWidgetData<T>(
  dataSource: string,
  filters?: IFilterState
): IApiState<T> & { refetch: () => void }
```

- One hook handles ALL widget types via the `<T>` generic
- Manages state: `idle -> loading -> success | error`
- Uses `AbortController` to cancel stale in-flight requests (prevents race conditions)
- Re-fetches automatically when filters change via `useEffect` dependency array

**Every widget uses this exact same hook.** Zero duplication.

---

### 3. `useFilter.tsx` — Global filter state

```ts
// Any component can read or update filters
const { filters, setDateRange, setPlatform } = useFilter();
```

- Built with `createContext` + `useContext`
- Stores: date range, platform, price type (MRP/SP)
- All setters are wrapped in `useCallback` to prevent re-renders
- The context value is wrapped in `useMemo` so consumers only re-render when data actually changes

---

### 4. `useTheme.tsx` — Light/Dark theme

```ts
// Reads from localStorage on first load
const [theme, setTheme] = useState<Theme>(() => {
  return localStorage.getItem('dashboard-theme') === 'dark' ? 'dark' : 'light';
});

// Applies as a data attribute on <html>
document.documentElement.setAttribute('data-theme', theme);
```

No CSS-in-JS. The browser does everything with CSS variable swapping — zero runtime cost.

---

### 5. `WidgetRenderer.tsx` — The widget factory

```tsx
switch (config.type) {
  case 'topCard':     return <TopCard config={config} />;
  case 'metricsGrid': return <MetricsGrid config={config} />;
  case 'table':       return <TableWidget config={config} />;
  default:            return <div>Unknown widget type</div>;
}
```

This is a classic **Factory Pattern**. The grid only knows about configs. The renderer maps type strings to components. Each widget is completely isolated.

---

### 6. `dataService.ts` — The fetch layer

```ts
export async function fetchMockData<T>(dataSource: string): Promise<T> {
  await new Promise(res => setTimeout(res, 300 + Math.random() * 400)); // fake latency
  const response = await fetch(dataSource);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}
```

This is intentionally a thin wrapper. In a real app, you replace this one function with an `axios` client that has auth headers, base URL, and filter query params. Nothing else changes.

---

## Code Reuse 

| Reusable Piece      | Used By                          | How it is reused                        |
|---------------------|----------------------------------|-----------------------------------------|
| `useWidgetData<T>`  | TopCard, MetricsGrid, TableWidget | Generic hook — one implementation, three consumers |
| `<Skeleton>`        | All widgets during loading       | Props: height, width, borderRadius      |
| `<ErrorState>`      | All widgets on error             | Props: message, onRetry callback        |
| `<TrendBadge>`      | TopCard, MetricsGrid rows        | Props: value, isPositive                |
| `WidgetRenderer`    | DashboardGrid                    | switch(type) maps config to component   |
| `IApiState<T>`      | All hooks and widgets            | Generic type for loading/error/data     |
| `IWidgetConfig`     | JSON, Grid, Renderer, all widgets | Single interface describes every widget |

---

## Performance Optimizations

| Optimization       | Where                        | What it does                              |
|--------------------|------------------------------|-------------------------------------------|
| `React.memo()`     | All layout and widget components | Skips re-render if props did not change |
| `useCallback()`    | All event handlers in Header, FilterContext | Stable function references |
| `useMemo()`        | Context value, config partitioning in PlanningPage | Avoids recomputing on every render |
| `AbortController`  | `useWidgetData`              | Cancels stale network requests            |
| CSS Variables      | `index.css` + `useTheme`     | Theme switching with zero JS cost         |
| Lazy state init    | `useTheme`                   | `useState(() => localStorage.getItem())` runs once |

---



## How Theming Works

```css
/* index.css */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #111827;
  --color-border: #e5e7eb;
}

[data-theme="dark"] {
  --color-bg: #1f2937;
  --color-text: #f9fafb;
  --color-border: #374151;
}
```

All components use `var(--color-bg)` instead of hardcoded colors. When `useTheme` sets `data-theme="dark"` on `<html>`, the browser swaps all variables instantly — no JavaScript involved in the actual color change.

---

## How to Add a New Widget (the full recipe)

1. Add an entry to `src/config/dashboardConfig.json`
2. Add mock data file to `public/mock/yourWidget.json`
3. Add the new type to `src/types/index.ts` (`WidgetType` union and data interface)
4. Create `src/components/widgets/YourWidget.tsx` (use `useWidgetData` inside)
5. Add a `case 'yourType':` to `src/components/widgets/WidgetRenderer.tsx`

**That is it. Five steps. No changes to routing, grid, or any other widget.**

---

## One-liner summary 

> "It is a config-driven React dashboard where a single JSON file defines what widgets exist, a generic TypeScript hook handles all data fetching with proper loading, error, and abort states, and React Context propagates filter changes to every widget automatically — so adding a new widget is just adding a JSON entry and a component."

---


