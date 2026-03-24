import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PanelLeft,
  FileText,
  Target,
  Monitor,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './Sidebar.css';

// ─── Types ──────────────────────────────────────────────────────────────────

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { icon: PanelLeft,  label: 'Dashboard', path: '/dashboard' },
  { icon: FileText,   label: 'Planning',  path: '/planning'  },
  { icon: Target,     label: 'Analytics', path: '/analytics' },
  { icon: Monitor,    label: 'Reports',   path: '/reports'   },
];

// ─── Subcomponents ──────────────────────────────────────────────────────────

/** Brand logo mark — represents "1digitalstack.ai" in the narrow sidebar */
const LogoMark: React.FC = () => (
  <div className="sidebar__logo" title="1digitalstack.ai — Intelligent Commerce">
    <div className="sidebar__logo-mark" aria-hidden="true">
      <span className="sidebar__logo-1">1</span>
      <span className="sidebar__logo-ds">D</span>
    </div>
  </div>
);

/** Sun icon (inline SVG) used for the light-theme button */
const SunIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1"  x2="12" y2="3"  />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1"  y1="12" x2="3"  y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
  </svg>
);

/** Moon icon (inline SVG) used for the dark-theme button */
const MoonIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export const Sidebar: React.FC = memo(() => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <LogoMark />

      {/* ── Main nav ── */}
      <nav className="sidebar__nav" aria-label="Primary pages">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            className={`sidebar__nav-item${isActive(path) ? ' active' : ''}`}
            onClick={() => navigate(path)}
            title={label}
            aria-label={label}
            aria-current={isActive(path) ? 'page' : undefined}
          >
            <Icon size={18} strokeWidth={1.75} />
          </button>
        ))}
      </nav>

      {/* ── Bottom utilities ── */}
      <div className="sidebar__bottom">
        {/* Theme toggle */}
        <button
          className="sidebar__nav-item"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Settings */}
        <button
          className={`sidebar__nav-item${isActive('/settings') ? ' active' : ''}`}
          onClick={() => navigate('/settings')}
          title="Settings"
          aria-label="Settings"
          aria-current={isActive('/settings') ? 'page' : undefined}
        >
          <Settings size={18} strokeWidth={1.75} />
        </button>

        {/* Profile avatar */}
        <button className="sidebar__profile" title="Profile" aria-label="User profile">
          <img src="https://i.pravatar.cc/40" alt="User avatar" />
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
