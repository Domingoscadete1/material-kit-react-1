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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import Config from '../../../../Config';

import { fetchWithToken } from '../../../../authService';

import AddPostoModal from './postomodal';

// ----------------------------------------------------------------------

type Posto = {
  id: string;
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

type Empresa = {
  id: string;
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

type PostoAceite = {
  id: string;
  empresa: Empresa;
  posto: Posto;
  indisponivel: boolean;
};

export function UserView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [postos, setPostos] = useState<PostoAceite[]>([]);
  const funcionario = JSON.parse(localStorage.getItem('userData') || '{}');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [confirmEnableOpen, setConfirmEnableOpen] = useState(false);
  const [selectedPosto, setSelectedPosto] = useState<PostoAceite | null>(null);

  const fetchPostos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithToken(`api/postos/empresa/${funcionario?.empresa?.id}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const data = await response.json();
      if (Array.isArray(data.postos)) {
        setPostos(data.postos);
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
    fetchPostos();
  }, [fetchPostos]);

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchPostos();
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDisableConfirm = (posto: PostoAceite) => {
    setSelectedPosto(posto);
    setConfirmDisableOpen(true);
  };

  const handleOpenEnableConfirm = (posto: PostoAceite) => {
    setSelectedPosto(posto);
    setConfirmEnableOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDisableOpen(false);
    setConfirmEnableOpen(false);
    setSelectedPosto(null);
  };

  const updatePostoStatus = async (indisponivel: boolean) => {
    if (!selectedPosto) return;
    
    try {
      const endpoint = indisponivel 
        ? 'api/empresa-posto/indisponivel/' 
        : 'api/empresa-posto/disponivel/';
      
      const response = await fetchWithToken(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          empresa_id: selectedPosto.empresa.id,
          posto_id: selectedPosto.id
        }),
      });

      if (response.ok) {
        fetchPostos(); // Atualiza a lista
      } else {
        console.error('Erro ao atualizar status do posto');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      handleCloseConfirm();
    }
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
        <>
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
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPostos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum posto encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPostos.map((posto) => (
                      <TableRow key={posto?.id}>
                        <TableCell>{posto.id}</TableCell>
                        <TableCell>
                          {posto?.posto.imagem ? (
                            <img
                              src={`${Config.getApiUrlMedia()}${posto?.posto.imagem}`}
                              alt={posto?.posto?.nome}
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
                        <TableCell>{posto?.posto?.nome}</TableCell>
                        <TableCell>{posto?.posto?.capacidade}</TableCell>
                        <TableCell>{posto.posto?.horario}</TableCell>
                        <TableCell>
                          {posto.indisponivel ? (
                            <Box color="error.main">Indisponível</Box>
                          ) : (
                            <Box color="success.main">Disponível</Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {posto.indisponivel ? (
                            <Tooltip title="Reativar posto">
                              <IconButton 
                                color="success" 
                                onClick={() => handleOpenEnableConfirm(posto)}
                              >
                                <Iconify icon="mdi:check-circle-outline" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Desativar posto">
                              <IconButton 
                                color="error" 
                                onClick={() => handleOpenDisableConfirm(posto)}
                              >
                                <Iconify icon="mdi:close-circle-outline" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Diálogo de confirmação para desativar */}
          <Dialog
            open={confirmDisableOpen}
            onClose={handleCloseConfirm}
            aria-labelledby="disable-dialog-title"
          >
            <DialogTitle id="disable-dialog-title">
              Confirmar desativação
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja desativar o posto {selectedPosto?.posto.nome}?
                Esta ação tornará o posto indisponível para associação.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirm}>Cancelar</Button>
              <Button 
                onClick={() => updatePostoStatus(true)} 
                color="error"
                autoFocus
              >
                Confirmar Desativação
              </Button>
            </DialogActions>
          </Dialog>

          {/* Diálogo de confirmação para reativar */}
          <Dialog
            open={confirmEnableOpen}
            onClose={handleCloseConfirm}
            aria-labelledby="enable-dialog-title"
          >
            <DialogTitle id="enable-dialog-title">
              Confirmar reativação
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja reativar o posto {selectedPosto?.posto.nome}?
                Esta ação tornará o posto disponível novamente para associação.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirm}>Cancelar</Button>
              <Button 
                onClick={() => updatePostoStatus(false)} 
                color="success"
                autoFocus
              >
                Confirmar Reativação
              </Button>
            </DialogActions>
          </Dialog>

          <TablePagination
            component="div"
            count={filteredPostos.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página"
          />
        </>
      )}
    </DashboardContent>
  );
}