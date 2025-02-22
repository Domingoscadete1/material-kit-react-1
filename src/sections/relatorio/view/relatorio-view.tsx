import { useState,useEffect,useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Icon from '@mui/material/Icon';
import { Iconify } from 'src/components/iconify';
import axios from 'axios';

import { DashboardContent } from 'src/layouts/dashboard';

// Mock data for reports


export function RelatorioView() {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [transacoes, setTransacoes] = useState<any[]>([]); // Armazenar produtos da API
  const [loading, setLoading] = useState(true); // Para gerenciar o estado de carregamento
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

  const [empresaData, setEmpresaData] = useState<{ saldo: number ,nome:string} | null>(null);


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
  const fetchEmpresaData = useCallback(async () => {
    if (!empresaId) return;
    try {
      const response = await axios.get(`https://408e-154-71-159-172.ngrok-free.app/api/empresa/${empresaId}/`,{
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });
      console.log('Dados da empresa:', response.data);
      setEmpresaData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
    }
  }, [empresaId]);
  useEffect(() => {
    if (empresaId) {
      fetchEmpresaData();
    }
  }, [empresaId, fetchEmpresaData]);
  
  

  const fetchProducts = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`https://408e-154-71-159-172.ngrok-free.app/api/empresa/transacoes/${empresaId}/?page=${page}`,{
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });
      
      console.log('Dados recebidos da API:', response.data);
  
      // Certifique-se de acessar `results.transacoes`
      const transacoesRecebidas = response.data.results?.transacoes || [];
      setTransacoes(transacoesRecebidas);
      const total = response.data?.count ?? 0; // Garante que count nunca seja undefined
    setTotalPages(total > 0 ? Math.ceil(total / 10) : 1);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId, page]);
  



  useEffect(() => {
    if (empresaId) {
      fetchProducts();
    }
  }, [empresaId, fetchProducts]);
  const downloadInvoice = async (transacaoId: number) => {
    try {
      const apiUrl = `https://408e-154-71-159-172.ngrok-free.app/api/fatura/${transacaoId}/`;
      window.open(apiUrl, '_blank'); // Abre a fatura em uma nova aba
    } catch (error) {
      console.error('Erro ao baixar fatura:', error);
      alert('Não foi possível baixar a fatura.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement | SVGSVGElement>, id: number) => {
    setMenuAnchor((prev) => ({ ...prev, [id]: event.currentTarget as HTMLElement }));
  };
  

  const handleMenuClose = (id: number) => {
    setMenuAnchor((prev) => ({ ...prev, [id]: null }));
  };

  

  return (
    <DashboardContent>
      <Typography variant="h4" flexGrow={1} mb={4}>
        Transações
      </Typography>

      <Box mb={4} p={2} bgcolor="white" borderRadius={2} boxShadow={1}>
  <Typography variant="h5">{empresaData?.nome}</Typography>
  {empresaData ? (
    <>
      <Typography variant="body1">Saldo: {empresaData.saldo} Kzs</Typography>
      
    </>
  ) : (
    <Typography variant="body2" color="text.secondary">
      Carregando informações da empresa...
    </Typography>
  )}
</Box>


      <Grid container spacing={3}>
        {transacoes.map((report) => {
          const isVenda = report.empresa?.id === empresaId; // Verifica se a empresa proprietária é a mesma que está logada
          const nomePessoa = isVenda
            ? report.comprador?.nome || report.empresa_compradora?.nome
            : report.vendedor?.nome || report.empresa?.nome;
          const icone = isVenda ? 'arrow_circle_up' : 'arrow_circle_down'; // Ícone de seta para cima (verde) para venda, para baixo (vermelho) para compra
          const iconeCor = isVenda ? 'green' : 'red';

          return (
            <Grid key={report.id} xs={12} sm={6} md={4}>
              <Card>
                <Box
                  component="img"
                  src={`https://408e-154-71-159-172.ngrok-free.app${report.produto.imagens[0]?.imagem}`}
                  alt={report.produto.nome}
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
                    {report.produto.nome}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Descrição: {report.produto.descricao}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {isVenda ? 'Comprador' : 'Vendedor'}: {nomePessoa}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Transação realizada em: {report.created_at}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Quantidade: {report.transacao?.lance?.quantidade}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Valor pago: {report.transacao.lance?.preco} Kzs
                  </Typography>

                  <Box mt={2} display="flex" alignItems="center" gap={1}>
                  <Iconify
                    icon={isVenda ? 'mdi:arrow-up-circle' : 'mdi:arrow-down-circle'}
                    width={24}
                    height={24}
                    color={iconeCor}
                    
                  />
                  </Box>

                  {/* Botão de opções */}

                  <IconButton
                    onClick={(event) => handleMenuOpen(event, report.id)}
                    sx={{ position: 'absolute', top: 10, right: 10 }}
                  >
                  <Iconify icon="mdi:dots-vertical" width={24} height={24} color='black' />
                  </IconButton>
                  

                  {/* Menu de opções */}
                  <Menu
                    anchorEl={menuAnchor[report.id] || null} // Garante que nunca será undefined
                    open={Boolean(menuAnchor[report.id])}
                    onClose={() => handleMenuClose(report.id)}
                  >
                    <MenuItem onClick={() => { downloadInvoice(report.id); handleMenuClose(report.id); }}>
                      Baixar Fatura
                    </MenuItem>
                  </Menu>
                </Card>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Box display="flex" justifyContent="center" mt={3}>
      <Button variant="contained" disabled={loading || page === 1} onClick={() => setPage(page - 1)}>
        Anterior
      </Button>
      <Typography mx={2}>Página {page} de {totalPages}</Typography>
      <Button variant="contained" disabled={loading || page === totalPages} onClick={() => setPage(page + 1)}>
        Próxima
      </Button>


</Box>
    </DashboardContent>
  );
}
