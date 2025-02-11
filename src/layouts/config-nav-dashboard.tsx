import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

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
    icon: icon('ic-analytics'),
  },
  {
    title: 'Postos',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Produtos',
    path: '/products',
    icon: icon('ic-cart'),
  },
  {
    title: 'Home',
    path: '/blog',
    icon: icon('ic-blog'),
  },
  {
    title: 'Mensagens',
    path: '/listasms',
    icon: icon('ic-disabled'),
  },
  {
    title: 'Perfil',
    path: '/perfil',
    icon: icon('ic-user'),
  },
  {
    title: 'Perfil2',
    path: '/perfil2',
    icon: icon('ic-user'),
  },
  {
    title: 'Transações',
    path: '/relatorio',
    icon: icon('ic-lock'),
  },
];

export const navData = role === 'admin'
  ? [
      ...baseNavData,
      {
        title: 'Funcionários',
        path: '/funcionario',
        icon: icon('ic-user'),
      },
    ]
  : baseNavData;
