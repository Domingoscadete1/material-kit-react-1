
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
// import { IconButton } from '@mui/material';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';


import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

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
  descricao:string;
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
  const { id, tipo } = useParams<{ id: string; tipo?: string }>(); //  const location = useLocation();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://83dc-154-71-159-172.ngrok-free.app/api/${tipo}/${id}/`,{
          headers: {
            "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
          },
        });
        setDados(response.data);
        console.log('dados',response.data)
        
        const produtosResponse = await axios.get(`https://83dc-154-71-159-172.ngrok-free.app/api/produtos/${tipo === 'empresa' ? 'empresa' : 'usuario'}/${id}`,{
          headers: {
            "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
          },
        });
        setProdutos(produtosResponse.data.produtos);
        console.log('produtos',produtosResponse.data.produtos)
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchData();
  }, [id, tipo]);
  

  const denunciarEmpresa = async () => {
    try {
      const formData = new FormData();
      formData.append('empresa_denunciante_id', empresaId ?? '');
      formData.append('denunciado_empresa_id', id ?? '');
      formData.append('tipo', 'empresa');
      formData.append('motivo', motivo);
      formData.append('descricao', descricao);

      await axios.post(`https://83dc-154-71-159-172.ngrok-free.app/api/reportes/create/`, formData, {
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

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
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
          backgroundColor: 'white', p: 4, borderRadius: 2, width: 400, boxShadow: 24
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
          {tipo === 'empresa' && Array.isArray(dados.imagens) && dados.imagens.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Imagens da Empresa</Typography>
              <Grid container spacing={2}>
                {dados.imagens.map((imagem, index) => (
                  <Grid key={index} md={3}>
                    <Box component="img" src={`${imagem.imagem}`} sx={{ width: '100%' }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
        {/* Account and Bills Section */}
        <Grid xs={12} md={8}>
          <Paper elevation={4} sx={{ p: 4 }}>
            {/* Accounts Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Minhas Contas xPay
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Conta Ativa
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    xxxx-xxxx-4245
                  </Typography>
                </Box>
                {/* <Button variant="contained" color="error">
                  Bloquear Conta
                </Button> */}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Conta Bloqueada
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    xxxx-xxxx-1234
                  </Typography>
                </Box>
                {/* <Button variant="contained" color="success">
                  Desbloquear Conta
                </Button> */}
              </Box>
            </Box>

            {/* Bills Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Minhas Faturas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Conta de telefone', status: 'Pago', color: 'green' },
                { label: 'Conta de internet', status: 'Não pago', color: 'red' },
                { label: 'Aluguel da casa', status: 'Pago', color: 'green' },
                { label: 'Imposto de renda', status: 'Não pago', color: 'red' },
              ].map((bill, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{bill.label}</Typography>
                  <Typography variant="body2" sx={{ color: bill.color }}>
                    {bill.status}
                  </Typography>
                </Box>
              ))}
            </Box>
            </Paper>
            </Grid>

        
        <Grid xs={12} md={8}>
          <Paper elevation={4} sx={{ p: 4 }}>
            <Typography variant="h6">Produtos</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {produtos.length > 0 ? (
                produtos.map((produto) => (
                  <Grid key={produto.id} md={4}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                      setProdutoSelecionado(produto);
                      setModalOpen(true);
                    }}>
                      <Avatar
                        src={`https://83dc-154-71-159-172.ngrok-free.app${produto.imagens?.length ? produto.imagens[0].imagem : ''}`}
                        alt={produto.nome}
                        sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                      />
                      <Typography>{produto.nome}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {produto.preco} Kz
                      </Typography>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Typography>Nenhum produto encontrado.</Typography>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

       {/* Modal de Detalhes do Produto */}
       <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: 'fixed', right: 0, top: 64,  height: 'calc(100vh - 64px)', width: '300px', backgroundColor: 'white', p: 3, overflowY: 'auto' }}>
          {produtoSelecionado && (
            <>
              <Typography variant="h6">{produtoSelecionado.nome}</Typography>
              <Divider sx={{ my: 2 }} />
              {produtoSelecionado.imagens?.map((imagem, index) => (
                <Box key={index} component="img" src={`https://83dc-154-71-159-172.ngrok-free.app${imagem.imagem}`} sx={{ width: '100%', mb: 2 }} />
              ))}
              <Typography variant="body1">{produtoSelecionado.descricao}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Preço: {produtoSelecionado.preco} Kz
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </DashboardContent>
  );
}
