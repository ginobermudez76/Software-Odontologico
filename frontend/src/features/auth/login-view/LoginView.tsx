import React from 'react';
import styles from './LoginView.module.css';
import { LoginViewProps, DEMO_ACCOUNTS } from './LoginView.types';
import { useLoginView } from './useLoginView';
import { MaterialIcon } from '../../../components/icons/MaterialIcon';

export const LoginView: React.FC<LoginViewProps> = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    handleSubmit,
    selectDemoAccount,
  } = useLoginView();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-600 mb-2">
            <MaterialIcon name="dentistry" size={40} color="#0d9488" />
          </div>
          <h1 className={styles.title}>SIGO-Dental</h1>
          <p className={styles.subtitle}>Gestión Odontológica y Expediente Clínico</p>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner}>
            <MaterialIcon name="error" size={18} color="#ef4444" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Correo Electrónico</label>
            <div className={styles.inputWrapper}>
              <MaterialIcon name="person" size={20} className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@sigodental.com"
                className={styles.input}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <MaterialIcon name="lock" size={20} className={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={styles.input}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.buttonSubmit}
          >
            {isLoading ? (
              <>
                <MaterialIcon name="progress_activity" size={20} className="animate-spin" />
                <span>Validando credenciales...</span>
              </>
            ) : (
              <>
                <MaterialIcon name="login" size={20} />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.demoBox}>
          <div className={styles.demoTitle}>Cuentas de prueba:</div>
          <div className={styles.demoList}>
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.email} className={styles.demoItem}>
                <div className={styles.demoAccountInfo}>
                  <MaterialIcon name={account.icon} size={18} color={account.iconColor} />
                  <span>
                    <span className={styles.demoRoleLabel}>{account.label}:</span>{' '}
                    <span className={styles.demoCredentials}>{account.email} / {account.password}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => selectDemoAccount(account.email, account.password)}
                  className={styles.demoUseButton}
                >
                  Usar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MaterialIcon name="lock" size={14} color="#0d9488" /> TLS 1.3 Cifrado
          </span>
          <span>Cumplimiento LOPDP</span>
        </div>
      </div>
    </div>
  );
};

