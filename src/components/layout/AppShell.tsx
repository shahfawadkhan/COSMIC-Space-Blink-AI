import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[var(--cosmic-bg)] text-[var(--cosmic-text)] cosmic-grid-bg transition-colors duration-150">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Top Application Header */}
      <TopBar collapsed={collapsed} />

      {/* Main Content Workspace */}
      <main
        className={`transition-all duration-300 pt-20 pb-12 px-4 sm:px-8 min-h-screen ${
          collapsed ? 'pl-24' : 'pl-4 sm:pl-72'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
