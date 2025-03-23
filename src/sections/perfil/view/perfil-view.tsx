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

import React,{ useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';


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
  remetente:string;
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
  const [empresaId, setEmpresaId] = React.useState<string | null>(null);
  const empresa = JSON.parse(localStorage.getItem('userData') || '{}'); // Parse para garantir que seja um objeto
  const [openModal, setOpenModal] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [chatExistente, setChatExistente] = useState<boolean>(false);
  const [chatId1, setChatId] = useState<number | null>(null);

  const [mensagens, setMensagens] = useState<MensagemSuporte[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false); // Estado de carregamento das mensagens
  const [mensagem, setMensagem] = useState('');

  const socketRef = useRef<WebSocket | null>(null);

  
  // Recupera o ID da empresa do localStorage
  useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const postoId = userData.empresa;
      if (postoId) {
        setEmpresaId(postoId);


        
      }
    }
  }, []);
  const handleOpenModal = () => {
    setOpenModal(true);
  
    if (!chatId1) {
      const socketUrl = `wss://fad7-154-71-159-172.ngrok-free.app/ws/suporte/chat/${empresa?.empresa?.id}/`;
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
    axios.get(`https://dce9-154-71-159-172.ngrok-free.app/api/empresa/chat-suport/${empresa?.empresa?.id}/`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      console.log(response.data);
      if (response.data.chats) {
        setChatId(response.data.chats.id);
        carregarMensagens(response.data.chats.id);
      }
    })
    .catch(error => console.error('Erro ao buscar chat:', error));
  }, [empresa?.empresa?.id]);
  
  useEffect(() => {
    verificarChat();
  }, [verificarChat]);
  
  

  const carregarMensagens = (chatId:number) => {
    axios.get(`https://dce9-154-71-159-172.ngrok-free.app/api/chat-suporte/mensagens/${chatId}/`,{
      headers: {
        "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        "Content-Type": "application/json" // Define o tipo de conteúdo esperado
      }
    })
      .then(response => setMensagens(response.data.mensagens))
      .catch(error => console.error('Erro ao buscar mensagens:', error));
  };
  const conectarWebSocket = useCallback((chatId: number) => {
    const socketUrl = chatId
      ? `wss://fad7-154-71-159-172.ngrok-free.app/ws/suporte/empresa/${empresa?.empresa?.id}/`
      : `wss://fad7-154-71-159-172.ngrok-free.app/ws/suporte/chat/${empresa?.empresa?.id}/`;
  
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
  }, [empresa?.empresa?.id]);
  

  const handleSendMessage = () => {
    if (socketRef.current && mensagem.trim()) {
      const data = {
        mensagem,
        empresa_id: empresa?.empresa.id,
        chat_id:chatId1
         // Garantir que o backend tenha o remetente correto
      };
  
      socketRef.current.send(JSON.stringify(data));
      setMensagem('');
    }
  };
  

  useEffect(() => {
    if (chatId1) {
      conectarWebSocket(chatId1);
    }
  }, [chatId1,conectarWebSocket]);

  
  return (
    <DashboardContent>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
            {/* Profile Picture */}
            <Avatar
              src={`https://dce9-154-71-159-172.ngrok-free.app${empresa.foto}`}
              alt="Profile"
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {empresa.usuario_username}
            </Typography>
            {/* <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Saldo empresa:{empresa.empresa.saldo}
            </Typography> */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Cargo: {empresa.role}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Email: {empresa.email}
            </Typography>
            {/* SMS Activation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2">Ativar alertas por SMS</Typography>
              <Switch defaultChecked />
            </Box>
            {chatId1 ? (
          <Button variant="contained" color="primary" fullWidth onClick={() => setOpenChat(true)}>
            Abrir Chat
          </Button>
        ) : (
          <Button variant="contained" color="secondary" fullWidth onClick={() => handleOpenModal()}>
            Solicitar Suporte
          </Button>
        )}
            {/* Save Button */}
            <Button variant="contained" color="primary" fullWidth disabled>
              Salvar Alterações
            </Button>
          </Paper>
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
                <Button variant="contained" color="error">
                  Bloquear Conta
                </Button>
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
                <Button variant="contained" color="success">
                  Desbloquear Conta
                </Button>
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
      </Grid>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
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


      <Modal open={openChat} onClose={() => setOpenChat(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Chat de Suporte
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
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
