import React from 'react';
import styles from './Navbar.module.css';
import { NavbarProps } from './Navbar.types';
import { useNavbar } from './useNavbar';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, timeLeftFormatted, handleLogout } = useNavbar();

  return (
    <header className={styles.navbar}>
      <div className={styles.leftSection}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Colapsar menú"
          >
            <MaterialIcon name="menu" size={24} />
          </button>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
          <MaterialIcon name="domain" size={20} color="#0d9488" />
          <span>{user?.branchName || 'Sede Central'}</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.badgeOnline}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>En línea</span>
        </div>

        <div className={styles.sessionTimer} title="Tiempo remanente antes del bloqueo por inactividad">
          <MaterialIcon name="timer" size={16} />
          <span>{timeLeftFormatted}</span>
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-800 leading-none">
              {user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{user?.role || 'Invitado'}</div>
          </div>

          <button
            onClick={handleLogout}
            className="ml-3 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Cerrar sesión segura"
          >
            <MaterialIcon name="logout" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

