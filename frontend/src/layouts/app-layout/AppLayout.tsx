import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';
import { AppLayoutProps } from './AppLayout.types';
import { useAppLayout } from './useAppLayout';
import { Sidebar } from './components/sidebar';
import { Navbar } from './components/navbar';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isSidebarCollapsed, toggleSidebar } = useAppLayout();

  return (
    <div className={styles.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className={styles.mainWrapper}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className={styles.content}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

