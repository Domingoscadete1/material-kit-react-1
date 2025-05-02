import { Label } from 'src/components/label';
import { FiPieChart, FiHome, FiShoppingBag, FiMessageSquare, FiUser, FiDollarSign, FiUsers, FiMapPin } from 'react-icons/fi';

const getUserRole = () => {
  const token = localStorage.getItem('userData');
  if (token) {
    const userData = JSON.parse(token);
    return userData.role || '';
  }
  return '';
};

const role = getUserRole();

const baseNavData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <FiPieChart size={20} />,
  },
  {
    title: 'Explorar',
    path: '/blog',
    icon: <FiHome size={20} />,
  },
  {
    title: 'Postos',
    path: '/user',
    icon: <FiMapPin size={20} />,
  },
  {
    title: 'Meus Produtos',
    path: '/products',
    icon: <FiShoppingBag size={20} />,
  },
  {
    title: 'Mensagens',
    path: '/listasms',
    icon: <FiMessageSquare size={20} />,
  },
  {
    title: 'Transações',
    path: '/relatorio',
    icon: <FiDollarSign size={20} />,
  },
  {
    title: 'Perfil',
    path: '/perfil',
    icon: <FiUser size={20} />,
  },
];

export const navData = role === 'admin'
  ? [
    ...baseNavData,
    {
      title: 'Funcionários',
      path: '/funcionario',
      icon: <FiUsers size={20} />,
    },
  ]
  : baseNavData;