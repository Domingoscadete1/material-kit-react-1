import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';
import type { ContainerProps } from '@mui/material/Container';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import { useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import jwtDecode from 'jwt-decode';
import { layoutClasses } from 'src/layouts/classes';

// ----------------------------------------------------------------------

export function Main({ children, sx, ...other }: BoxProps) {
  const router = useRouter();

  // Verificar se o usuário está logado
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/sign-in'); // Redireciona para a página de login se não houver token
    } else {
      try {
        const decodedToken = jwtDecode(accessToken);
        if (!decodedToken) {
          router.push('/sign-in'); // Redireciona se o token for inválido
        }
      } catch (error) {
        router.push('/sign-in'); // Redireciona em caso de erro ao decodificar o token
      }
    }
  }, [router]);
  return (
    <Box
      component="main"
      className={layoutClasses.main}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

// ----------------------------------------------------------------------

type DashboardContentProps = ContainerProps & {
  disablePadding?: boolean;
};

export function DashboardContent({
  sx,
  children,
  disablePadding,
  maxWidth = 'xl',
  ...other
}: DashboardContentProps) {
  const theme = useTheme();

  const layoutQuery: Breakpoint = 'lg';

  return (
    <Container
      className={layoutClasses.content}
      maxWidth={maxWidth || false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        pt: 'var(--layout-dashboard-content-pt)',
        pb: 'var(--layout-dashboard-content-pb)',
        [theme.breakpoints.up(layoutQuery)]: {
          px: 'var(--layout-dashboard-content-px)',
        },
        ...(disablePadding && {
          p: {
            xs: 0,
            sm: 0,
            md: 0,
            lg: 0,
            xl: 0,
          },
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Container>
  );
}
