import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
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
    title: 'Funcionários',
    path: '/funcionario',
    icon: icon('ic-user'),
  },
  {
    title: 'Produtos',
    path: '/products',
    icon: icon('ic-cart'),
    // info: (
    //   <Label color="error" variant="inverted">
    //     +3
    //   </Label>
    // ),
  },
  {
    title: 'Home',
    path: '/blog',
    icon: icon('ic-blog'),
  },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
  {
    title: 'Mensagens',
    path: '/listasms',
    icon: icon('ic-disabled'),
  },
  // {
  //   title: 'Chat',
  //   path: '/chat',
  //   icon: icon('ic-disabled'),
  // },
  {
    title: 'Perfil',
    path: '/perfil',
    icon: icon('ic-user'),
  },
  {
    title: 'Transações',
    path: '/relatorio',
    icon: icon('ic-lock'),
  },
  // {
  //   title: 'Sign in',
  //   path: '/sign-in',
  //   icon: icon('ic-lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
];
