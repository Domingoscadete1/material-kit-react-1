import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DashboardContent } from 'src/layouts/dashboard';

interface Imagem {
  imagem: string;
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagens?: Imagem[];
  descricao: string;
}

interface Dados {
  nome: string;
  email: string;
  telefone1?: string;
  numero_telefone?: string;
  foto?: string;
  imagens?: Imagem[];
}

const MOTIVOS = [
  { value: 'fraude', label: 'Fraude' },
  { value: 'conteudo_inapropriado', label: 'Conteúdo inapropriado' },
  { value: 'ofensa', label: 'Ofensa' },
  { value: 'spam', label: 'Spam' },
  { value: 'outro', label: 'Outro' },
];

export function Perfil2View() {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [dados, setDados] = useState<Dados | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDenunciaOpen, setModalDenunciaOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
    totalPages: 1,
  });

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

  const { id, tipo } = useParams<{ id: string; tipo?: string }>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://dce9-154-71-159-172.ngrok-free.app/api/${tipo}/${id}/`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        setDados(response.data);

        const produtosResponse = await axios.get(
          `https://dce9-154-71-159-172.ngrok-free.app/api/produtos/${tipo === 'empresa' ? 'empresa' : 'usuario'}/${id}?page=${pagination.pageIndex + 1}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        setProdutos(produtosResponse.data.results);
        const data = produtosResponse.data;
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(data.count / prev.pageSize),
        }));
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchData();
  }, [id, tipo, pagination.pageIndex]);

  const denunciarEmpresa = async () => {
    try {
      const formData = new FormData();
      formData.append('empresa_denunciante_id', empresaId ?? '');
      formData.append('denunciado_empresa_id', id ?? '');
      formData.append('tipo', 'empresa');
      formData.append('motivo', motivo);
      formData.append('descricao', descricao);

      await axios.post(`https://dce9-154-71-159-172.ngrok-free.app/api/reportes/create/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Denúncia enviada com sucesso!');
      setModalDenunciaOpen(false);
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
    }
  };

  if (!dados) return <Typography>Carregando...</Typography>;

  return (
    <DashboardContent>
      <Typography variant="h4" gutterBottom>
        Perfil de {tipo === 'empresa' ? 'Empresa' : 'Usuário'}
      </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
            <Avatar
              src={`${dados.foto || (dados.imagens?.length ? dados.imagens[0].imagem : '')}`}
              alt="Profile"
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {dados.nome}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Email: {dados.email}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Telefone: {dados.telefone1 || dados.numero_telefone || 'Não informado'}
            </Typography>
            <Button variant="contained" color="error" fullWidth onClick={() => setModalDenunciaOpen(true)}>
              Denunciar empresa
            </Button>

            {/* Modal de Denúncia */}
            <Modal open={modalDenunciaOpen} onClose={() => setModalDenunciaOpen(false)}>
              <Box sx={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                backgroundColor: 'white', p: 4, borderRadius: 2, width: { xs: '90%', sm: 400 }, boxShadow: 24
              }}>
                <Typography variant="h6" gutterBottom>
                  Motivo do bloqueio
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Motivo</InputLabel>
                  <Select
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    label="Motivo"
                  >
                    {MOTIVOS.map((motivo1) => (
                      <MenuItem key={motivo1.value} value={motivo1.value}>
                        {motivo1.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  margin="normal"
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button onClick={() => setModalDenunciaOpen(false)} variant="outlined">
                    Cancelar
                  </Button>
                  <Button onClick={denunciarEmpresa} variant="contained" color="error">
                    Enviar
                  </Button>
                </Box>
              </Box>
            </Modal>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h4">Imagens da Empresa</Typography>
            <Box>
              {tipo === 'empresa' && Array.isArray(dados.imagens) && dados.imagens.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Grid container spacing={2}>
                    {dados.imagens.map((imagem, index) => (
                      <Grid key={index} md={4}>
                        <Box component="img" src={`${imagem.imagem}`} sx={{ width: '100%', borderRadius: 1 }} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" sx={{ p: 3 }}>Produtos Divulgados</Typography>

      <Grid xs={12} md={8}>
        <Paper elevation={4} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {produtos.length > 0 ? (
              produtos.map((produto) => (
                <Paper
                  key={produto.id}
                  elevation={2}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                  onClick={() => {
                    setProdutoSelecionado(produto);
                    setModalOpen(true);
                  }}
                >
                  <Box
                    component="img"
                    src={`https://dce9-154-71-159-172.ngrok-free.app${produto.imagens?.length ? produto.imagens[0].imagem : ''}`}
                    alt={produto.nome}
                    sx={{
                      width: 80, 
                      height: 80, 
                      borderRadius: 2, 
                      objectFit: 'cover', 
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {produto.nome}
                    </Typography>
                    <Typography variant="body2">
                      {produto.descricao}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {produto.preco} Kz
                    </Typography>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography>Nenhum produto encontrado.</Typography>
            )}
          </Box>

          <Typography variant="h6" sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
            Página {pagination.pageIndex + 1} de {pagination.totalPages}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
              disabled={pagination.pageIndex === 0}
            >
              Anterior
            </Button>
            <Button
              variant="contained"
              onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
              disabled={pagination.pageIndex + 1 >= pagination.totalPages}
            >
              Próxima
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Modal de Detalhes do Produto */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {produtoSelecionado && (
            <>
              <Typography variant="h6">{produtoSelecionado.nome}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">{produtoSelecionado.descricao}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Preço: {produtoSelecionado.preco} Kz
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {produtoSelecionado.imagens?.map((imagem, index) => (
                  <Grid key={index} xs={6} md={4}>
                    <Box component="img" src={`https://dce9-154-71-159-172.ngrok-free.app${imagem.imagem}`} sx={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Modal>
    </DashboardContent>
  );
}