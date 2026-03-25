# Category Analysis Dashboard

A **config-driven analytics dashboard** built with **React + TypeScript**, matching the provided design spec.

---

## Getting Started

```bash
npm install
npm start        # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── DashboardGrid.tsx   # Config-driven CSS grid layout
│   │   ├── Header.tsx          # Nav tabs + filter controls
│   │   ├── PageHeader.tsx      # Category title + sub-tabs
│   │   ├── SectionHeader.tsx   # Section title + view toggle
│   │   └── Sidebar.tsx         # Icon nav sidebar
│   ├── widgets/
│   │   ├── WidgetRenderer.tsx  # Factory: type → component
│   │   ├── TopCard.tsx         # Stat card with sparkline
│   │   ├── MetricsGrid.tsx     # Traffic / Conversion / Ops
│   │   └── TableWidget.tsx     # Sortable laggard table
│   └── ui/
│       ├── Skeleton.tsx        # Shimmer loading placeholder
│       ├── ErrorState.tsx      # Error + retry UI
│       └── TrendBadge.tsx      # Coloured trend pill
├── config/
│   └── dashboardConfig.json   ← single source of truth
├── hooks/
│   ├── useWidgetData.ts        # Generic fetch hook (AbortController + filter-aware)
│   ├── useFilter.tsx           # FilterContext + DATE_RANGES/PLATFORMS constants
│   └── useTheme.tsx            # ThemeContext + localStorage persistence
├── services/
│   └── dataService.ts          # Fetch wrapper with simulated latency
└── types/
    └── index.ts                # All interfaces + literal union types
public/
└── mock/                       # Static JSON files served as mock API
    ├── marketShare.json
    ├── overallSOV.json
    ├── wtAvailability.json
    ├── metricsGrid.json
    ├── topLaggardsSOV.json
    ├── topLaggardsRPI.json
    └── topLaggardsAvail.json
```

---

## How Config-Driven Rendering Works

`src/config/dashboardConfig.json` is the **single source of truth** for the entire dashboard layout:

```json
[
  {
    "id": "marketShare",
    "type": "topCard",
    "title": "Market Share",
    "dataSource": "/mock/marketShare.json",
    "colSpan": 1
  }
]
```

| Field        | Type              | Purpose                                        |
|--------------|-------------------|------------------------------------------------|
| `id`         | `string`          | Unique React key                               |
| `type`       | `WidgetType`      | Mapped to a component in `WidgetRenderer`      |
| `title`      | `string`          | Passed as prop to the widget                   |
| `dataSource` | `string`          | URL/path fetched by `useWidgetData`            |
| `colSpan`    | `1 \| 2 \| 3`    | CSS grid column span                           |

**To add a new widget:**
1. Add an entry to `dashboardConfig.json`
2. Drop a mock JSON file in `public/mock/`
3. Create a component in `components/widgets/`
4. Register it in `WidgetRenderer.tsx`

Zero changes needed to layout, grid, or App.

---

## Architecture Highlights

### State Management
- **`FilterContext`** (`useFilter`) — date range and platform filters live in a single context, consumed directly by any widget via `useFilter()`. No prop drilling.
- **`ThemeContext`** (`useTheme`) — theme state persisted to `localStorage`, toggled globally.
- **`activeTab`** — lifted into `Dashboard`, passed to `Header` as controlled props.

### Data Layer
- **`useWidgetData<T>`** — generic hook that manages `idle → loading → success | error` state per widget. Accepts `filters` to trigger re-fetches when the user changes date range or platform. Uses `AbortController` to cancel stale in-flight requests.
- **`dataService.ts`** — thin fetch wrapper with simulated latency (300–700ms). Swap for a real API client without touching widget code.

### Performance
- All widget components wrapped in `React.memo()` with explicit `displayName`
- `useMemo` on `FilterContext` value, `Dashboard` config partition, and table `sortedRows`
- `useCallback` on all context setters to prevent child re-renders

### TypeScript
- `WidgetType`, `TabId`, `MetricStatus`, `SortDirection`, `LoadingState` — all typed as string literal unions, no magic strings
- `colSpan` typed as `1 | 2 | 3` literal union for compile-time config validation
- `IApiState<T>` generic covers all widget data shapes

---

## Features

| Feature | Implementation |
|---------|---------------|
| Config-driven rendering | `dashboardConfig.json` → `DashboardGrid` → `WidgetRenderer` |
| Light / dark theme | CSS variables on `[data-theme]`, persisted to `localStorage` |
| Filter controls | `FilterContext` — date range + platform, re-fetches all widgets |
| Loading skeletons | Shimmer animation, shape-matched to each widget layout |
| Error + retry | Per-widget error state with retry that re-triggers only that fetch |
| Sortable tables | `useMemo` sort, typed `SortDirection`, accessible `aria-label` |
| Responsive grid | 3-col → 2-col → 1-col at 900px / 600px breakpoints |
| Sparkline charts | Recharts `LineChart` with success/danger stroke colour |
| Accessible | `role="tablist"`, `aria-selected`, `aria-pressed`, `aria-label` throughout |

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 4.9 | Type safety |
| Recharts | 3 | Sparkline charts |
| CSS Variables | — | Theming, zero runtime cost |
| Create React App | 5 | Build tooling |

---


