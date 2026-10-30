import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { authApi } from '../../../../services/api';

export function useNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos en segundos

  // Temporizador de inactividad de sesión (15 min)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout();
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [logout, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Error en logout:', err);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return {
    user,
    timeLeftFormatted: formatTime(timeLeft),
    handleLogout,
  };
}

