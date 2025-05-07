import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { DashboardContent } from 'src/layouts/dashboard';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { resolve } from 'path';
import { fetchWithToken } from '../../../../authService';
import Config from '../../../../Config';


// ----------------------------------------------------------------------

type MensagemSuporte = {
  id?: number;
  chat_room?: number;
  usuario?: number | null;
  empresa?: number | null;
  funcionario?: number | null;
  conteudo?: string | null;
  created_at?: string;
  updated_at?: string | null;
  deleted?: boolean;
  expires_at?: string;
  remetente: string;
};
type Empresa = {
  id: number;
  nome: string;
  descricao: string;
  endereco: string;
  imagens: ImagemEmpresa[];
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
type ImagemEmpresa = {
  id: number;
  imagem: string;
};



const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export function PerfilView() {
  const [empresaId, setEmpresaId] = React.useState<Empresa | null>(null);
  const funcionario = JSON.parse(localStorage.getItem('userData') || '{}');
  const [openModal, setOpenModal] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [chatExistente, setChatExistente] = useState<boolean>(false);
  const [chatId1, setChatId] = useState<number | null>(null);
  const wssUrl = Config.getApiUrlWs();
  const mediaUrl = Config.getApiUrlMedia();
  const [mensagens, setMensagens] = useState<MensagemSuporte[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [modalImagemOpen, setModalImagemOpen] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: '',
    descricao: '',
    email: '',
    telefone1: '',
    telefone2: '',
    categoria: 0,
    endereco: '',
    nif: '',
  });
  const [imagensSelecionadas, setImagensSelecionadas] = useState<number[]>([]);
  const [novasImagens, setNovasImagens] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openEditFuncionarioModal, setOpenEditFuncionarioModal] = useState(false);
  const [editFuncionarioForm, setEditFuncionarioForm] = useState({
    nome: funcionario.usuario_username || '',
    email: funcionario.email || '',
    foto: null as File | null
  });
  const [funcionarioErrors, setFuncionarioErrors] = useState<Record<string, string>>({});
  const [isSubmittingFuncionario, setIsSubmittingFuncionario] = useState(false);
  useEffect(() => {
    if (empresaId) {
      setEditForm({
        nome: empresaId.nome,
        descricao: empresaId.descricao,
        email: empresaId.email,
        telefone1: empresaId.telefone1,
        telefone2: empresaId.telefone2 || '',
        categoria: empresaId.categoria,
        endereco: empresaId.endereco,
        nif: empresaId.nif
      });
    }
  }, [empresaId]);
  const isAdmin = funcionario?.role === 'admin';
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editForm.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!editForm.nif.trim()) newErrors.nome = 'O nif é obrigatório';
    if (!editForm.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!editForm.telefone1.trim()) newErrors.telefone1 = 'Telefone é obrigatório';
    if (!editForm.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpa o erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Função para lidar com a seleção de imagens para remoção
  const handleSelectImage = (id: number) => {
    setImagensSelecionadas(prev =>
      prev.includes(id)
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };

  // Função para lidar com o upload de novas imagens
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNovasImagens(prev => [...prev, ...files]);
    }
  };

  // Função para remover uma nova imagem antes de enviar
  const handleRemoveNewImage = (index: number) => {
    setNovasImagens(prev => prev.filter((_, i) => i !== index));
  };

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // Adiciona os campos básicos
      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Adiciona imagens para remover
      imagensSelecionadas.forEach(id => {
        formData.append('imagens_para_remover', id.toString());
      });

      // Adiciona novas imagens
      novasImagens.forEach((file, index) => {
        formData.append(`imagem${index + 1}`, file);
      });

      // Verifica o limite de imagens
      const totalImagens = (empresaId?.imagens.length || 0) - imagensSelecionadas.length + novasImagens.length;
      if (totalImagens > 5) {
        setErrors(prev => ({ ...prev, imagens: 'Máximo de 5 imagens permitidas no total' }));
        return;
      }

      // Faz a requisição
      const response = await fetchWithToken(`api/empresa/${funcionario?.empresa?.id}/atualizar/`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Mostra mensagem de sucesso
        setOpenEditModal(false);
        setImagensSelecionadas([]);
        setNovasImagens([]);
        fetchEmpresa(); // Atualiza os dados da empresa
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar empresa');
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      // Mostra mensagem de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateFuncionarioForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editFuncionarioForm.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!editFuncionarioForm.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(editFuncionarioForm.email)) {
      newErrors.email = 'Email inválido';
    }

    setFuncionarioErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para lidar com mudanças nos campos do formulário do funcionário
  const handleFuncionarioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFuncionarioForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpa o erro quando o usuário começa a digitar
    if (funcionarioErrors[name]) {
      setFuncionarioErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Função para lidar com o upload da foto
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditFuncionarioForm(prev => ({
        ...prev,
        foto: e.target.files![0]
      }));
    }
  };

  // Função para enviar o formulário do funcionário
  const handleFuncionarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFuncionarioForm()) return;

    try {
      setIsSubmittingFuncionario(true);

      const formData = new FormData();
      formData.append('nome', editFuncionarioForm.nome);
      formData.append('email', editFuncionarioForm.email);
      if (editFuncionarioForm.foto) {
        formData.append('foto', editFuncionarioForm.foto);
      }

      // Faz a requisição para atualizar o funcionário
      const response = await fetchWithToken(`api/empresa-usuario/${funcionario.id}/atualizar/`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Atualiza os dados do funcionário no localStorage
        const updatedFuncionario = {
          ...funcionario,
          usuario_username: editFuncionarioForm.nome,
          email: editFuncionarioForm.email,
          foto: data.foto || funcionario.foto
        };
        localStorage.setItem('userData', JSON.stringify(updatedFuncionario));

        // Fecha o modal e limpa o estado
        setOpenEditFuncionarioModal(false);
        setEditFuncionarioForm({
          nome: editFuncionarioForm.nome,
          email: editFuncionarioForm.email,
          foto: null
        });

        // Recarrega a página para atualizar os dados (ou implemente uma atualização de estado mais granular)
        window.location.reload();
      } else {
        const errorData = await response.json();
        if (errorData.detail === 'Já existe um ser com este nome ou email') {
          setFuncionarioErrors({
            ...funcionarioErrors,
            email: 'Este email já está em uso',
            nome: 'Este nome de usuário já está em uso'
          });
        }
        throw new Error(errorData.detail || 'Erro ao atualizar funcionário');
      }
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
    } finally {
      setIsSubmittingFuncionario(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);

    if (!chatId1) {
      const socketUrl = `wss://${wssUrl}/ws/suporte/chat/${funcionario?.empresa?.id}/`;
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => console.log("WebSocket conectado para novo chat");
      socketRef.current.onmessage = (event) => {
        const novaMensagem = JSON.parse(event.data);
        setMensagens((prev) => [...prev, novaMensagem]);
      };
      socketRef.current.onerror = (error) => console.error("Erro no WebSocket:", error);
      socketRef.current.onclose = () => console.log("WebSocket fechado");
    }
  };

  const verificarChat = useCallback(() => {
    fetchWithToken(`api/empresa/chat-suport/${funcionario?.empresa?.id}/`, {
      method: 'GET',
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data?.chats) {
          setChatId(data?.chats.id);
          carregarMensagens(data?.chats.id);
        }
      })
      .catch(error => console.error('Erro ao buscar chat:', error));
  }, [funcionario?.empresa?.id]);
  const fetchEmpresa = useCallback(() => {

    fetchWithToken(`api/empresa/${funcionario?.empresa?.id}/`, {
      method: 'GET',
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data) {
          setEmpresaId(data);
        }
      })
      .catch(error => console.error('Erro ao buscar chat:', error));
  }, [funcionario?.empresa?.id]);

  useEffect(() => {
    verificarChat();
    fetchEmpresa();
  }, [verificarChat, fetchEmpresa]);

  const carregarMensagens = (chatId: number) => {
    fetchWithToken(`api/chat-suporte/mensagens/${chatId}/`, {
      method: 'GET',
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => setMensagens(data.mensagens))
      .catch(error => console.error('Erro ao buscar mensagens:', error));
  };

  const conectarWebSocket = useCallback((chatId: number) => {
    const socketUrl = chatId
      ? `wss://${wssUrl}/ws/suporte/empresa/${funcionario?.empresa?.id}/`
      : `wss://${wssUrl}/ws/suporte/chat/${funcionario?.empresa?.id}/`;

    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => console.log("WebSocket conectado");
    socketRef.current.onmessage = (event) => {
      const novaMensagem = JSON.parse(event.data);
      console.log("Nova mensagem recebida:", novaMensagem);

      setMensagens((prevMensagens) => [
        ...prevMensagens,
        {
          conteudo: novaMensagem.message,
          remetente: novaMensagem.remetente,
        },
      ]);
    };
    socketRef.current.onerror = (error) => console.error("Erro no WebSocket:", error);
    socketRef.current.onclose = () => console.log("WebSocket fechado");

    return () => socketRef.current?.close();
  }, [funcionario?.empresa?.id, wssUrl]);

  const handleSendMessage = () => {
    if (socketRef.current && mensagem.trim()) {
      const data = {
        mensagem,
        empresa_id: funcionario?.empresa.id,
        chat_id: chatId1
      };

      socketRef.current.send(JSON.stringify(data));
      setMensagem('');
    }
  };

  useEffect(() => {
    if (chatId1) {
      conectarWebSocket(chatId1);
    }
  }, [chatId1, conectarWebSocket]);

  const handleOpenImagem = (imagemUrl: string) => {
    setImagemSelecionada(imagemUrl);
    setModalImagemOpen(true);
  };

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        {/* Card Principal */}
        <Grid xs={12}>
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
            <Avatar
              src={`${mediaUrl}${funcionario.foto}`}
              alt="Profile"
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, cursor: 'pointer' }}
              onClick={() => handleOpenImagem(`${mediaUrl}${funcionario.foto}`)}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {funcionario.usuario_username}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Cargo: {funcionario.role}
            </Typography>

            <Grid container spacing={3}>
              <Grid xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {empresaId?.quantidade_produtos}
                  </Typography>
                  <Typography variant="body2">
                    Produtos ativos
                  </Typography>
                </Paper>
              </Grid>

              <Grid xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {empresaId?.quantidade_vendas}
                  </Typography>
                  <Typography variant="body2">
                    Produtos Vendidos
                  </Typography>
                </Paper>
              </Grid>

              <Grid xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {empresaId?.quantidade_comprados}
                  </Typography>
                  <Typography variant="body2">
                    Compras
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {chatId1 ? (
              <Button variant="contained" color="primary" fullWidth onClick={() => setOpenChat(true)}>
                Abrir Chat
              </Button>
            ) : (
              <Button variant="contained" color="secondary" fullWidth onClick={() => handleOpenModal()}>
                Solicitar Suporte
              </Button>
            )}

            <Button
              variant="outlined"
              sx={{
                mt: 2,
                borderRadius: '12px'
              }}
              fullWidth
              onClick={() => setOpenEditFuncionarioModal(true)}
            >
              Editar Meus Dados
            </Button>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper elevation={3} sx={{
            p: 3,
            borderRadius: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Fotos da Empresa
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              flexGrow: 1
            }}>

              {empresaId?.imagens.map((img, index) => (
                <Box
                  key={img.id || index}
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    mr: 2,
                    mb: 2
                  }}
                  onClick={() => handleOpenImagem(img.imagem)}
                >
                  <img
                    src={`${img.imagem}`}
                    alt={`Foto ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}

            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper elevation={3} sx={{
            p: 3,
            borderRadius: '16px',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Dados do Cadastro
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              '& > *': {
                p: 1.5,
                backgroundColor: 'background.default',
                borderRadius: '8px'
              }
            }}>
              <Typography variant="body1">
                <strong>Empresa:{empresaId?.nome}</strong>
              </Typography>
              <Typography variant="body1">
                <strong>Email:{empresaId?.email}</strong>
              </Typography>
              <Typography variant="body1">
                <strong>Telefone:{empresaId?.telefone1}</strong>
              </Typography>
              <Typography variant="body1">
                <strong>Endereço:{empresaId?.endereco}</strong>
              </Typography>
              <Typography variant="body1">
                <strong>Estado:{empresaId?.verificada}</strong>
              </Typography>
              <Typography variant="body1">
                <strong>Nif:{empresaId?.nif}</strong>
              </Typography>
            </Box>
            {isAdmin && (
              <Button
                variant="outlined"
                sx={{
                  mt: 2,
                  borderRadius: '12px'
                }}
                onClick={() => setOpenEditModal(true)}
              >
                Editar Dados
              </Button>
            )}
          </Paper>
        </Grid>

      </Grid>

      <Modal open={modalImagemOpen} onClose={() => setModalImagemOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '70%' },
          maxWidth: 800,
          maxHeight: '90vh',
          p: 1,
          outline: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {imagemSelecionada && (
            <Box
              component="img"
              src={imagemSelecionada}
              sx={{
                maxWidth: '100%',
                maxHeight: '85vh',
              }}
            />
          )}
        </Box>
      </Modal>

      <Modal open={openEditFuncionarioModal} onClose={() => setOpenEditFuncionarioModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Editar Meus Dados
          </Typography>

          <form onSubmit={handleFuncionarioSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12}>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    src={
                      editFuncionarioForm.foto
                        ? URL.createObjectURL(editFuncionarioForm.foto)
                        : `${mediaUrl}${funcionario.foto}`
                    }
                    sx={{ width: 80, height: 80 }}
                  />
                </Box>

                <Button
                  variant="outlined"
                  component="label"
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}
                >
                  Alterar Foto
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFotoUpload}
                  />
                </Button>

                <TextField
                  fullWidth
                  label="Nome de Usuário"
                  name="nome"
                  value={editFuncionarioForm.nome}
                  onChange={handleFuncionarioInputChange}
                  error={!!funcionarioErrors.nome}
                  helperText={funcionarioErrors.nome}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editFuncionarioForm.email}
                  onChange={handleFuncionarioInputChange}
                  error={!!funcionarioErrors.email}
                  helperText={funcionarioErrors.email}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenEditFuncionarioModal(false)}
                  disabled={isSubmittingFuncionario}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmittingFuncionario}
                >
                  {isSubmittingFuncionario ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Editar Dados da Empresa
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="nome"
                  value={editForm.nome}
                  onChange={handleInputChange}
                  error={!!errors.nome}
                  helperText={errors.nome}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Telefone Principal"
                  name="telefone1"
                  value={editForm.telefone1}
                  onChange={handleInputChange}
                  error={!!errors.telefone1}
                  helperText={errors.telefone1}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Telefone Secundário"
                  name="telefone2"
                  value={editForm.telefone2}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nif"
                  name="nif"
                  value={editForm.nif}
                  onChange={handleInputChange}
                  error={!!errors.nif}
                  helperText={errors.nif}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Endereço"
                  name="endereco"
                  value={editForm.endereco}
                  onChange={handleInputChange}
                  error={!!errors.endereco}
                  helperText={errors.endereco}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Categoria"
                  name="categoria"
                  type="number"
                  value={editForm.categoria}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descrição"
                  name="descricao"
                  value={editForm.descricao}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Imagens da Empresa (Selecione para remover)
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  {empresaId?.imagens.map((img) => (
                    <Box
                      key={img.id}
                      onClick={() => handleSelectImage(img.id)}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        border: imagensSelecionadas.includes(img.id)
                          ? '3px solid red'
                          : '3px solid transparent',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        width: 100,
                        height: 100,
                      }}
                    >
                      <img
                        src={`${img.imagem}`}
                        alt="Imagem da empresa"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {imagensSelecionadas.includes(img.id) && (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(255, 0, 0, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            Remover
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Adicionar Novas Imagens (Máximo 5 no total)
                </Typography>

                {errors.imagens && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {errors.imagens}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  {novasImagens.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Nova imagem ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        size="small"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          minWidth: 'auto',
                          padding: '4px',
                        }}
                        onClick={() => handleRemoveNewImage(index)}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}

                  {novasImagens.length + (empresaId?.imagens.length || 0) - imagensSelecionadas.length < 5 && (
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        width: 100,
                        height: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body2">Adicionar</Typography>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setOpenEditModal(false);
                    setImagensSelecionadas([]);
                    setNovasImagens([]);
                    setErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 1,
          margin: '0 auto'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Solicitar Suporte
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Descreva seu problema..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleSendMessage}>
            Enviar Mensagem
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openChat}
        onClose={() => setOpenChat(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 1,
          margin: '0 auto',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Chat de Suporte
          </Typography>
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            mb: 2,
            border: '1px solid #eee',
            borderRadius: 1,
            p: 1
          }}>
            {mensagens.map((msg, index) => (
              <Box key={index} sx={{ p: 1, borderBottom: '1px solid #ccc' }}>
                <Typography variant="body2">
                  <strong>{msg.remetente}</strong>: {msg.conteudo}
                </Typography>
              </Box>
            ))}
          </Box>
          <TextField
            fullWidth
            placeholder="Digite sua mensagem..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleSendMessage}>
            Enviar
          </Button>
        </Box>
      </Modal>
    </DashboardContent>
  );
}