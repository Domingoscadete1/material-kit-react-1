// authService.js
import  jwtDecode  from 'jwt-decode';
import Config from './Config';

const baseUrl = Config.getApiUrl().endsWith('/') ? Config.getApiUrl() : `${Config.getApiUrl()}/`;

/**
 * Verifica se o token JWT está expirado (igual à versão mobile)
 */
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decodedPayload = jwtDecode(token);
    return decodedPayload.exp < Math.floor(Date.now() / 1000);
  } catch (error) {
    console.error('Erro ao decodificar o token JWT:', error.message);
    return true;
  }
};

/**
 * Armazenamento equivalente ao AsyncStorage para web
 */
const webStorage = {
  getItem: async (key) => {
    return localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    localStorage.removeItem(key);
  }
};

/**
 * Renova o token de acesso usando o refresh token (mesma lógica do mobile)
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = await webStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('Nenhum refresh token disponível');

    const response = await fetch(`${baseUrl}api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Refresh token inválido ou expirado. Usuário deve fazer login novamente.');
        localStorage.removeItem('custom-auth-token');
        localStorage.removeItem('userData');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('registeredDeviceToken');
        // Redireciona para login na web
        window.location.reload();
      }
      throw new Error(`Falha ao renovar token (Status: ${response.status})`);
    }

    const data = await response.json();
    await webStorage.setItem('accessToken', data.access);
    return data.access;
  } catch (error) {
    console.error('Erro ao renovar o token JWT:', error.message);
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('registeredDeviceToken');
    window.location.reload();
    return null;
  }
};

/**
 * Faz requisições com token JWT (mesma abordagem do mobile)
 */
export const fetchWithToken = async (url, options = {}) => {
  let accessToken = await webStorage.getItem('accessToken');
  console.log(accessToken);
  
  // Verifica se o token expirou
  if (isTokenExpired(accessToken)) {
    console.log('Token expirado, tentando renovar...');
    accessToken = await refreshAccessToken();
  }

  // Se não conseguir renovar, força o logout
  if (!accessToken) {
    console.warn('Token inválido ou usuário deslogado. Redirecionando para login...');
    throw new Error('Usuário precisa fazer login novamente');
  }

  // Adiciona o token no cabeçalho da requisição
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await fetch(`${baseUrl}${url}`, authOptions);

    // Trata casos onde o token pode ser inválido
    if (response.status === 401) {
      console.warn('Token inválido durante a requisição. Forçando logout...');
      await webStorage.removeItem('accessToken');
      await webStorage.removeItem('refreshToken');
      // Redireciona para login na web
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    return response;
  } catch (error) {
    console.error('Erro durante a requisição:', error.message);
    throw error;
  }
};

/**
 * Funções adicionais para gerenciamento de sessão na web
 */
export const authService = {
  async login(accessToken, refreshToken) {
    await webStorage.setItem('accessToken', accessToken);
    await webStorage.setItem('refreshToken', refreshToken);
  },
  
  async logout() {
    await webStorage.removeItem('accessToken');
    await webStorage.removeItem('refreshToken');
    window.location.href = '/login';
  },
  
  async isAuthenticated() {
    const token = await webStorage.getItem('accessToken');
    return token && !isTokenExpired(token);
  },
  
  async getCurrentUser() {
    const token = await webStorage.getItem('accessToken');
    if (token && !isTokenExpired(token)) {
      return jwtDecode(token);
    }
    return null;
  }
};