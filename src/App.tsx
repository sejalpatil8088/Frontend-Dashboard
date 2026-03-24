import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { FilterProvider } from './hooks/useFilter';
import { Sidebar } from './components/layout/Sidebar';
import { PlanningPage } from './pages/PlanningPage';
import { ComingSoon } from './pages/ComingSoon';
import {
  PanelLeft,
  Target,
  FileText,
  Settings,
} from 'lucide-react';
import './App.css';

/**
 * AppShell lays out the persistent Sidebar next to the route-driven
 * content area. Each page component owns its own `app-main` wrapper
 * so it can control its internal layout (header, scroll, etc.) independently.
 */
function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <Routes>
        <Route path="/"          element={<Navigate to="/planning" replace />} />
        <Route path="/planning"  element={<PlanningPage />} />
        <Route path="/dashboard" element={<ComingSoon pageName="Dashboard" Icon={PanelLeft} />} />
        <Route path="/analytics" element={<ComingSoon pageName="Analytics" Icon={Target} />} />
        <Route path="/reports"   element={<ComingSoon pageName="Reports"   Icon={FileText} />} />
        <Route path="/settings"  element={<ComingSoon pageName="Settings"  Icon={Settings} />} />
        {/* Catch-all: redirect unknown paths to planning */}
        <Route path="*"          element={<Navigate to="/planning" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <FilterProvider>
          <AppShell />
        </FilterProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
