import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface TopBarProps {
  collapsed: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, toggleTheme } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');

  // Page title mapping
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Explore the Sky', category: 'Celestial Coordinates' };
    if (path === '/overview') return { title: 'Observation Terminal', category: 'COSMIC' };
    if (path.startsWith('/comparison')) return { title: 'Observation Viewer', category: 'Multi-Epoch' };
    if (path.startsWith('/candidates/')) return { title: 'Candidate Dossier', category: 'Astrometry' };
    if (path.startsWith('/candidates')) return { title: 'Candidate Queue', category: 'Triage' };
    if (path.startsWith('/sky')) return { title: 'Sky Map', category: 'Celestial Grid' };
    if (path.startsWith('/settings')) return { title: 'Settings', category: 'Preferences' };
    return { title: 'Explore the Sky', category: 'Celestial Coordinates' };
  };

  const { title, category } = getPageInfo();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query.toUpperCase().startsWith('CSB-')) {
      navigate(`/candidates/${query.toUpperCase()}`);
    } else {
      navigate(`/candidates?q=${encodeURIComponent(query)}`);
    }
  };

  const isLight = settings.theme === 'light-observatory';

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-[var(--cosmic-sidebar)]/95 backdrop-blur-md border-b border-[var(--cosmic-border)] transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--cosmic-text-muted)]">
          <Link to="/" className="hover:text-[var(--cosmic-text)] transition-colors">COSMIC</Link>
          <span className="opacity-50">/</span>
          <span className="text-[var(--cosmic-cyan)] font-semibold">{category}</span>
        </div>
        <h1 className="text-sm sm:text-base font-bold text-[var(--cosmic-text)] tracking-tight font-mono">
          {title}
        </h1>
      </div>

      {/* Right Controls: Search & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Candidate Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-[var(--cosmic-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search candidate ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-xs text-[var(--cosmic-text)] placeholder-[var(--cosmic-text-subtle)] focus:outline-none focus:border-[var(--cosmic-cyan)] font-mono transition-colors"
          />
        </form>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-cyan)] text-[var(--cosmic-text)] text-xs font-mono transition-colors"
          title={`Switch to ${isLight ? 'Dark Observatory' : 'Light Observatory'} theme`}
          aria-label="Toggle visual theme"
        >
          {isLight ? (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
