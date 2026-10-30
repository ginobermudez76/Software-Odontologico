import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/api';
import { useAuthStore } from '../../../stores/authStore';

export function useLoginView() {
  const navigate = useNavigate();
  const { setAuth, setNavigationTree } = useAuthStore();

  const [email, setEmail] = useState('admin@sigodental.com');
  const [password, setPassword] = useState('Admin123456!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor ingrese su correo y contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);

      // Cargar el árbol dinámico de navegación
      const navigation = await authApi.getMyNavigation();
      setNavigationTree(navigation);

      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al iniciar sesión. Verifique sus credenciales.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    handleSubmit,
  };
}

