import jwtDecode from 'jwt-decode';

const baseUrl = process.env.REACT_APP_API_URL.endsWith('/')
  ? process.env.REACT_APP_API_URL
  : `${process.env.REACT_APP_API_URL}/`; // Garantir a barra no final

/**
 * Verifica se o token JWT está expirado.
 */
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decodedPayload = jwtDecode(token);
    return decodedPayload.exp < Math.floor(Date.now() / 1000);
  } catch (error) {
    console.error('Erro ao decodificar o token JWT:', error.message);
    return true; // Assume que está expirado em caso de erro
  }
};

/**
 * Renova o token de acesso usando o refresh token.
 */

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      throw new Error(`Falha ao renovar token (Status: ${response.status})`);
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access); // Salva o novo access token
    return data.access;
  } catch (error) {
    console.error('Erro ao renovar o token JWT:', error.message);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null; // Retorna null se a renovação falhar
  }
};

/**
 * Faz requisições com token JWT, tentando renovar automaticamente se necessário.
 */

export const fetchWithToken = async (url, options = {}) => {
  let accessToken = localStorage.getItem('accessToken');

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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    return response;
  } catch (error) {
    console.error('Erro durante a requisição:', error.message);
    throw error;
  }
};
