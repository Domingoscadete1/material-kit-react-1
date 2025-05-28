import { useState, useCallback, useEffect } from 'react';
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
  Avatar,
  TextField,
  TablePagination,
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import Config from '../../../../Config';
import AddFuncionarioModal from './funcionariomodal';
import { fetchWithToken } from '../../../../authService';

type Funcionario = {
  id: string;
  usuario_username: string;
  email: string;
  role: string;
  foto?: string;
};

export function FuncionarioView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const funcionario = JSON.parse(localStorage.getItem('userData') || '{}');

  const fetchFuncionarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithToken(`api/empresa/funcionarios/${funcionario?.empresa?.id}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const data = await response.json();
      console.log(data);
      if (Array.isArray(data.funcionarios)) {
        setFuncionarios(data.funcionarios);
      } else {
        console.error('Dados inválidos');
      }
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    } finally {
      setLoading(false);
    }
  }, [funcionario?.empresa?.id]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchFuncionarios();
  };

  const filteredFuncionarios = funcionarios.filter((func) =>
    func.usuario_username.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedFuncionarios = filteredFuncionarios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Funcionários
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setModalOpen(true)}
        >
          Adicionar Funcionário
        </Button>
        <AddFuncionarioModal open={modalOpen} onClose={handleCloseModal} />
      </Box>

      <Box mb={2}>
        <TextField
          label="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          sx={{
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Foto</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Cargo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFuncionarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhum funcionário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFuncionarios.map((func) => (
                    <TableRow key={func.id}>
                      <TableCell>
                        {func.foto ? (
                          <Avatar src={`${Config.getApiUrlMedia()}${func.foto}`} alt={func.usuario_username} />
                        ) : (
                          <Avatar>{func.usuario_username[0].toUpperCase()}</Avatar>
                        )}
                      </TableCell>
                      <TableCell>{func.usuario_username}</TableCell>
                      <TableCell>{func.email}</TableCell>
                      <TableCell>{func.role}</TableCell>
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
        count={filteredFuncionarios.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página"
      />
    </DashboardContent>
  );
}
