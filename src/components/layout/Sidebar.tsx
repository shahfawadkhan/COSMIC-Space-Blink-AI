import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  SplitSquareVertical, 
  Crosshair, 
  Compass, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Orbit,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { to: '/', label: 'Explore Sky', icon: Compass },
    { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/comparison', label: 'Observation Viewer', icon: SplitSquareVertical },
    { to: '/candidates', label: 'Candidate Queue', icon: Crosshair },
    { to: '/sky', label: 'Sky Map', icon: Orbit },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 bg-[var(--cosmic-sidebar)] border-r border-[var(--cosmic-border)] transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--cosmic-border)]">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] flex items-center justify-center text-[var(--cosmic-cyan)] shrink-0">
              <Orbit className="w-4 h-4 text-[var(--cosmic-cyan)]" />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-tight text-[var(--cosmic-text)] flex items-center gap-1 font-mono">
                  COSMIC <span className="text-[var(--cosmic-cyan)]">BLINK</span>
                </span>
                <span className="text-[9px] font-mono text-[var(--cosmic-text-muted)] tracking-wider uppercase">
                  SPHEREx Workspace
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-[var(--cosmic-surface-hover)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors hidden lg:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] font-semibold border border-[var(--cosmic-cyan)]/30'
                      : 'text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] hover:bg-[var(--cosmic-surface-hover)]'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System status footer */}
      <div className="p-3 border-t border-[var(--cosmic-border)] text-[10px] font-mono text-[var(--cosmic-text-muted)]">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cosmic-green)]" />
              <span>SPHEREx NEP-04</span>
            </span>
            <span className="text-[var(--cosmic-text-subtle)]">v0.1.0</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[var(--cosmic-green)]" title="System Online" />
          </div>
        )}
      </div>
    </aside>
  );
};
