import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { SidebarProps } from './Sidebar.types';
import { useSidebar } from './useSidebar';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const { navigationTree, isLoading, isActive } = useSidebar();

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        <MaterialIcon name="dentistry" size={32} color="#14b8a6" />
        {!isCollapsed && <span className={styles.brandTitle}>SIGO-Dental</span>}
      </div>

      <nav className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-xs text-slate-400">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Cargando opciones...
          </div>
        )}

        <ul className={styles.menuList}>
          {navigationTree.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.frontendRoute}
                className={`${styles.menuItem} ${isActive(item.frontendRoute) ? styles.menuItemActive : ''}`}
                title={item.title}
              >
                <MaterialIcon name={item.materialIcon || 'circle'} size={22} />
                {!isCollapsed && <span className={styles.menuLabel}>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        {!isCollapsed && <span>SIGO-Dental v1.0 • Seguro</span>}
      </div>
    </aside>
  );
};

