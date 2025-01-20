import { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';

import { DashboardContent } from 'src/layouts/dashboard';

// Mock data for reports
const reports = [
  {
    id: '1',
    title: 'Nome produto (Vendido)',
    description: 'Análise completa das vendas realizadas no último mês.',
    coverUrl: '/assets/images/aw220226.png',
    totalViews: 1200,
    totalShares: 300,
    totalComments: 1,
    postedAt: '2025-01-15',
    comprador: 'Domingos Cadete',
    author: {
      name: 'Equipe de Vendas',
      avatarUrl: '/assets/images/aw220226.png',
    },
  },
  {
    id: '2',
    title: 'Nome produto (Vendido)',
    description: 'Resumo das campanhas de marketing e seu impacto.',
    coverUrl: '/assets/images/i5173550731.webp',
    totalViews: 950,
    totalShares: 200,
    totalComments: 1,
    postedAt: '2025-01-10',
    comprador: 'Domingos Cadete',
    author: {
      name: 'Equipe de Marketing',
      avatarUrl: '/assets/images/avatars/marketing-team.jpg',
    },
  },
  {
    id: '1',
    title: 'Nome produto (Vendido)',
    description: 'Análise completa das vendas realizadas no último mês.',
    coverUrl: '/assets/images/https-s3.amazonaws.com-allied.alliedmktg.com-img-apple-iPhone-2013-iPhone-2013-20Pro-TCDAP872-1.jpg',
    totalViews: 1200,
    totalShares: 300,
    totalComments: 1,
    postedAt: '2025-01-15',
    comprador: 'Domingos Cadete',
    author: {
      name: 'Equipe de Vendas',
      avatarUrl: '/assets/images/avatars/sales-team.jpg',
    },
  },
  {
    id: '2',
    title: 'Nome produto (Vendido)',
    description: 'Resumo das campanhas de marketing e seu impacto.',
    coverUrl: '/assets/images/3410D69A-6EE9-4E80-9097-EEF9BC62913B-657x493.jpeg',
    totalViews: 950,
    totalShares: 200,
    totalComments: 1,
    postedAt: '2025-01-10',
    comprador: 'Domingos Cadete',
    author: {
      name: 'Equipe de Marketing',
      avatarUrl: '/assets/images/avatars/marketing-team.jpg',
    },
  }, {
    id: '1',
    title: 'Nome produto (Vendido)',
    description: 'Análise completa das vendas realizadas no último mês.',
    coverUrl: '/assets/images/fl_progressive,f_webp,q_70,w_600.webp',
    totalViews: 1200,
    totalShares: 300,
    totalComments: 1,
    postedAt: '2025-01-15',
    comprador: 'Domingos Cadete',
    author: {
      name: 'Equipe de Vendas',
      avatarUrl: '/assets/images/avatars/sales-team.jpg',
    },
  },
  {
    id: '2',
    title: 'Nome produto (Vendido)',
    description: 'Resumo das campanhas de marketing e seu impacto.',
    coverUrl: '/assets/images/br-11134207-7r98o-lq3q5hl42fqfb2.jpeg',
    totalViews: 950,
    totalShares: 200,
    totalComments: 1,
    postedAt: '2025-01-10',
    comprador: 'Domingos Cadete',
    author: {
      name: 'Equipe de Marketing',
      avatarUrl: '/assets/images/avatars/marketing-team.jpg',
    },
  },
  {
    id: '1',
    title: 'Nome produto (Vendido))',
    description: 'Análise completa das vendas realizadas no último mês.',
    coverUrl: '/assets/images/D_NQ_NP_871327-MLB52614031027_112022-O.webp',
    totalViews: 1200,
    totalShares: 300,
    totalComments: 1,
    postedAt: '2025-01-15',
    comprador: 'Domingos Cadete',
    author: {
      name: 'Equipe de Vendas',
      avatarUrl: '/assets/images/avatars/sales-team.jpg',
    },
  },
];

export function RelatorioView() {

  const [page] = useState(1);
  const reportsPerPage = 8;

  const paginatedReports = reports.slice(
    (page - 1) * reportsPerPage,
    page * reportsPerPage
  );

  return (
    <DashboardContent>
      <Typography variant="h4" flexGrow={1} mb={4}>
        Relatórios de Venda
      </Typography>

      <Grid container spacing={3}>
        {paginatedReports.map((report) => (
          <Grid key={report.id} xs={12} sm={6} md={4}>
            <Card >
              <Box
                component="img"
                src={report.coverUrl}
                alt={report.title}
                sx={{
                  width: '100%',
                  height: 300,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2,
                }}
              />

              <Card sx={{ p: 2, borderRadius: 0, marginTop: -2.6 }}>

                <Typography variant="h6" gutterBottom>
                  {report.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom >
                  Descrição: {report.description}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Comprador: {report.comprador}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Vendido em: {report.postedAt}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Quantidade:  {report.totalComments} 
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Valor pago:  {report.totalViews}Kzs 
                </Typography>

                {/* <Box mt={2} display="flex" gap={1}>
                  <Iconify icon="solar:eye-bold" width={20} />
                  <Typography variant="body2">{report.totalViews} Visualizações</Typography>
                </Box>

                <Box mt={1} display="flex" gap={1}>
                  <Iconify icon="solar:share-bold" width={20} />
                  <Typography variant="body2">{report.totalShares} Compartilhamentos</Typography>
                </Box>

                <Box mt={1} display="flex" gap={1}>
                  <Iconify icon="solar:chat-round-dots-bold" width={20} />
                  <Typography variant="body2">{report.totalComments} 1mentários</Typography>
                </Box> */}

              </Card>

            </Card>
          </Grid>
        ))}
      </Grid>


    </DashboardContent>
  );
}
