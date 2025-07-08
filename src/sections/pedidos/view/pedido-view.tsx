
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  TablePagination,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import Config from '../../../../Config';

import { fetchWithToken } from '../../../../authService';

import AddPostoModal from './postomodal';

// ----------------------------------------------------------------------
type Usuario = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  // Adicione mais campos se necessário
};

type ImagemProduto = {
  imagem: string;
};

type VideoProduto = {
  video: string;
};

type Categoria = {
  id: number;
  nome: string;
};

type Empresa = {
  id: number;
  nome: string;
  descricao: string;
  endereco: string;
  imagens: string[];
  usuario: number;
  categoria: number;
  email: string;
  telefone1: string;
  telefone2: string;
  saldo: number;
  status: string;
  nif: string;
  alvara_comercial: string;
  certidao_registro_comercial: string;
  verificada: boolean;
  created_at: string;
  quantidade_produtos: number;
  quantidade_vendas: number;
  quantidade_comprados: number;
};

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  vendido: boolean;
  status: string;
  localizacao: string;
  imagens: ImagemProduto[];
  videos: VideoProduto[];
  usuario: Usuario;
  categoria: Categoria;
  data_publicacao: string;
  condicao: string;
  indisponivel: boolean;
  empresa: Empresa;
  quantidade: number;
  nota?: number;
};

type Posto = {
  id: number;
  nome: string;
  localizacao: string;
  imagem: string | null;
  horario: string;
  responsavel: string;
  telefone: string;
  email: string;
  capacidade: number;
  status: string;
};

type Lance = {
  id: number;
  usuario: Usuario;
  produto: Produto;
  posto: Posto;
  empresa: Empresa;
  empresa_compradora: Empresa;
  preco: number;
  status: string;
  descricao: string;
  desativado: boolean;
  created_at: string;
  pagamento: string;
  status_pos_pagamento: string;
  quantidade: number;
  codigo_verificado: boolean;
  codigo_verificado_devolucao: boolean;
  numero_gaveta: string | null;
};



export function PedidosView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [postos, setPostos] = useState<Lance[]>([]);
  const funcionario = JSON.parse(localStorage.getItem('userData') || '{}');

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, totalPages: 1 });
  const criarPedido = async (lanceId: number) => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const localRecolha = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
  
        try {
          const response = await fetchWithToken(`api/pedido/create/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lance_id: lanceId,
              local_recolha: localRecolha,
            }),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            alert(`✅ Corrida criada: ${data.mensagem || 'Sucesso'}\nPedido ID: ${data.pedido_id}`);
          } else {
            alert(`⚠️ Erro: ${data.erro || 'Falha ao criar pedido.'}`);
          }
        } catch (error) {
          console.error('Erro ao criar pedido:', error);
          alert('❌ Erro ao tentar criar o pedido.');
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        alert('❌ Não foi possível obter sua localização.');
      }
    );
  };
  
  

  const fetchLances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithToken(`api/lances-espera/empresa/${funcionario?.empresa?.id}/?page=${pagination.pageIndex + 1}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const data = await response.json();
      console.log('lances',data);
      if (Array.isArray(data.results)) {
        setPostos(data.results);
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(data.count / prev.pageSize),
        }));
      } else {
        console.error('Dados inválidos da API');
        setPostos([]);
      }
    } catch (error) {
      console.error('Erro ao buscar postos:', error);
      setPostos([]);
    } finally {
      setLoading(false);
    }
  }, [funcionario?.empresa?.id]);

  useEffect(() => {
    fetchLances();
  }, [fetchLances,pagination.pageIndex]);

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchLances();
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPostos = postos.filter((posto) =>
    posto?.posto?.nome.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedPostos = filteredPostos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" flexGrow={1}>
          Postos
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setModalOpen(true)}
        >
          Adicionar Posto
        </Button>
        <AddPostoModal open={modalOpen} onClose={handleCloseModal} />
      </Box>

      <Box mb={2}>
        <TextField
          label="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          sx={{
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table
              sx={{
                minWidth: 650,
              }}
              aria-label="tabela de postos"
            >
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Foto</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Capacidade</TableCell>
                  <TableCell>Horário</TableCell>
                  <TableCell>Ação</TableCell> 
                </TableRow>
              </TableHead>
              <TableBody>
  {paginatedPostos.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        Nenhum lance encontrado.
      </TableCell>
    </TableRow>
  ) : (
    paginatedPostos.map((lance) => (
      <TableRow key={lance.id}>
        <TableCell>{lance.id}</TableCell>
        <TableCell>
          {lance?.produto?.imagens?.[0]?.imagem ? (
            <img
              src={`${Config.getApiUrlMedia()}${lance.produto.imagens[0].imagem}`}
              alt={lance.produto.nome}
              style={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          ) : (
            'Sem foto'
          )}
        </TableCell>
        <TableCell>{lance.produto.nome}</TableCell>
        <TableCell>{lance.posto.nome}</TableCell>
        <TableCell>
          {new Date(lance.created_at).toLocaleString('pt-BR')}
        </TableCell>
        <TableCell>
  <Button
    variant="contained"
    size="small"
    color="primary"
    onClick={() => criarPedido(lance.id)}
  >
    Criar Pedido
  </Button>
</TableCell>

      </TableRow>
    ))
  )}
</TableBody>

            </Table>
          </TableContainer>
        </Paper>
      )}

      <TablePagination
        component="div"
        count={filteredPostos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página"
      />
    </DashboardContent>
  );
}
