import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';

import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

import { fetchWithToken } from '../../../../authService';
import Config from '../../../../Config';
// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const [analyticsData, setAnalyticsData] = useState({
    vendas: 0,
    usuarios: 0,
    compras: 0,
    chats: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = React.useState<string | null>(null);
  const empresa = JSON.parse(localStorage.getItem('userData') || '{}');

  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mensagensSeguranca = [
    {
      imagem: 'https://www.fecomercio.com.br/upload/img/2016/05/19/573e38edbdcae-noticia_t_cnico_em_seguran_a_do_trabalho_evita_acidentes_e_melhora_qualidade_de_vida_no_local.jpg',
      descricao: 'Use sempre os EPIs adequados',
      detalhe: 'A segurança começa com a proteção individual.',
    },
    {
      imagem: 'https://www.hospedagemsegura.com.br/wp-content/uploads/2016/03/BANNERS_DICAS_022.png',
      descricao: 'Mantenha a postura correta no ambiente de trabalho',
      detalhe: 'Evite lesões por esforço repetitivo.',
    },
    {
      imagem: 'https://gruporde.com.br/wp-content/uploads/2019/12/Artigo_Extintor.jpg',
      descricao: 'Conheça a localização dos extintores',
      detalhe: 'Esteja preparado para emergências.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % mensagensSeguranca.length);
    }, 5000);

    return () => clearInterval(interval);
  },);


  useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const postoId = userData.empresa.id;
      if (postoId) {
        setEmpresaId(postoId);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchWithToken(`api/produtos-search/bussiness/${empresa.empresa.id}/`, {
          headers: {
            "ngrok-skip-browser-warning": "true", 
          },
        });
        const data = await response.json();
        setProducts(data.produtos || []);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [empresa.empresa.id]);
  useEffect(() => {
    if (!empresaId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetchWithToken(`api/empresa/analytics/${empresaId}/`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Erro ao buscar dados analíticos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [empresaId]);
  
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Bem-Vindo de volta 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Vendas"
            percent={2.6}
            total={analyticsData.vendas}
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Usuários"
            percent={2}
            total={analyticsData.usuarios}
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Compras"
            percent={2.8}
            total={analyticsData.compras}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Mensagens"
            percent={3.6}
            total={analyticsData.chats}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        <Box
          sx={{
            mt: 3,
            mb: 5,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            height: '380px',
            boxShadow: 3,
          }}
        >
          {mensagensSeguranca.map((msg, index) => (
            <Box
              key={index}
              sx={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                opacity: index === currentImageIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
              }}
            >
              <Box
                component="img"
                src={msg.imagem}
                alt={`Mensagem ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.6)',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  color: 'white',
                  padding: '16px',
                  textAlign: 'left',
                }}
              >
                <Typography variant="h6">{msg.descricao}</Typography>
                <Typography variant="body2">{msg.detalhe}</Typography>
              </Box>
            </Box>
          ))}

          {/* Botões de navegação */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
            }}
          >
            {mensagensSeguranca.map((_, index) => (
              <Button
                key={index}
                sx={{
                  minWidth: '10px',
                  height: '10px',
                  padding: 0,
                  borderRadius: '50%',
                  backgroundColor: index === currentImageIndex ? 'primary.main' : 'grey.500',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </Box>
        </Box>


      </Grid>
    </DashboardContent>
  );
}
