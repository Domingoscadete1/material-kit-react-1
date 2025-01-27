import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Avatar, TextField, Button, CircularProgress } from '@mui/material';


// Defina o tipo para as mensagens
// Representação de um produto
export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  condicao: string;
  preco: number;
  data_publicacao: string;
  status: string;
  quantidade?: number;
  localizacao: string;
  indisponivel?: boolean;
  vendido?: boolean;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
  empresa?: Empresa;
  usuario?: Usuario;
}
export interface Imagem{
  imagem:string;
}

// Representação de um usuário
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  numero_telefone: string;
  endereco: string;
  foto?: string;
  data_de_registro: string;
  data_nascimento?: string;
  verificacao_de_identidade: boolean;
  status: "ativo" | "desativado" | "suspenso";
  stripe_account_id?: string;
  saldo?: number;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
  imagens:Imagem[];
}

// Representação de uma empresa
export interface Empresa {
  id: number;
  nome: string;
  email: string;
  telefone1: string;
  telefone2: string;
  endereco: string;
  categoria: "moda" | "tecnologia" | "cosmeticos";
  descricao: string;
  alvara_comercial?: string;
  verificada: boolean;
  saldo?: number;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
  imagens:Imagem[];
}

// Representação de uma sala de chat (ChatRoom)
export interface ChatRoom {
  id: number;
  produto: Produto;
  empresa?: Empresa;
  comprador?: Usuario;
  vendedor?: Usuario;
  criado_em: string;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
}

// Representação de uma mensagem (Mensagem)
export interface Mensagem {
  id: number;
  chat_room: ChatRoom;
  remetente?: Usuario;
  empresa?: Empresa;
  conteudo: string;
  audio?: string;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
  remetente_id: number;

}

export function ListaView() {
  const baseUrl = 'http://127.0.0.1:8000';
  const baseWsUrl = 'ws://127.0.0.1:8000'; // Substitua pelo URL correto

  const [conversations, setConversations] = useState<ChatRoom[]>([]); // Tipo aplicado
  const [activeConversation, setActiveConversation] = useState<ChatRoom | null>(null); // Tipo aplicado

  const [messages, setMessages] = useState<Mensagem[]>([]);   const [newMessage, setNewMessage] = useState(''); // Nova mensagem
  const [empresaId, setEmpresaId] = useState(''); // ID da empresa
  const [loadingMessages, setLoadingMessages] = useState(false); // Estado de carregamento das mensagens
  const socketRef = useRef<WebSocket | null>(null);

  // Recupera o ID da empresa do localStorage
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

  // Busca as conversas relacionadas à empresa
  useEffect(() => {
    const fetchConversations = async () => {
      if (!empresaId) return;

      try {
        const response = await axios.get(`${baseUrl}/api/chatrooms/empresa-list/${empresaId}/`);
        const { chats } = response.data;
        setConversations(chats);

        // Define a primeira conversa como ativa (opcional)
        if (chats.length > 0) {
          setActiveConversation(chats[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar conversas:', error);
      }
    };

    fetchConversations();
  }, [empresaId]);

  // Configuração do WebSocket e mensagens em tempo real
  useEffect(() => {
    if (!activeConversation) return;

    const socket = new WebSocket(`${baseWsUrl}/ws/chat/${activeConversation.id}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { message, remetente_id } = data;

      // Adiciona a nova mensagem ao estado
      setMessages((prevMessages) => [
        ...prevMessages,
        {id: Math.random(), // Um ID temporário até a API retornar um real
          remetente_id,
          conteudo: message,
          created_at: new Date().toISOString(), // Ajuste o nome se necessário
          chat_room: activeConversation, // Confirme se activeConversation.id está corret 
          },
      ]);
    };

    
// eslint-disable-next-line consistent-return
    return () => {
      socket.close();
    };
  }, [activeConversation]);

  // Busca as mensagens do chat ativo
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      setLoadingMessages(true);
      try {
        const response = await axios.get(`${baseUrl}/api/chatrooms/messages/${activeConversation.id}/`);
        const { mensagens } = response.data;
        setMessages(mensagens);
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Envia uma nova mensagem
  const handleSendMessage = async () => {
    if (newMessage.trim() && activeConversation && socketRef.current) {
      const messageData = {
        mensagem: newMessage,
        chatroom_id: activeConversation.id,
        empresa_id: empresaId,
      };

      // Envia a mensagem via WebSocket
      if (socketRef.current instanceof WebSocket) {
        socketRef.current.send(JSON.stringify(messageData));
      }
      setNewMessage('');
    }
  };

  return (
    <Box display="flex" height="90vh" bgcolor="#f4f6f8">
      {/* Lista de Conversas */}
      <Box
        width="28%"
        bgcolor="#3f51b5"
        color="white"
        p={2}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box mb={2}>
          <Typography variant="h5">Mensagens</Typography>
        </Box>
        <Box flexGrow={1} overflow="auto">
          {conversations.map((conversation) => (
            <Paper
              key={conversation.id}
              sx={{
                mb: 1,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                bgcolor: activeConversation?.id === conversation.id ? '#7986cb' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => setActiveConversation(conversation)}
            >
              <Avatar
                src={`${baseUrl}${conversation.comprador?.foto}` || 'https://via.placeholder.com/50'}
                sx={{ width: 48, height: 48, mr: 2 }}
              />
              <Box>
                <Typography variant="body1">{conversation.produto?.nome || 'Produto não definido'}</Typography>
                <Typography variant="body2" color="gray">
                  {conversation.comprador?.nome || 'Comprador desconhecido'}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Área do Chat */}
      <Box flexGrow={1} display="flex" flexDirection="column" bgcolor="white">
        {activeConversation && (
          <>
            {/* Cabeçalho do Chat */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              borderBottom="1px solid #e0e0e0"
            >
              <Box display="flex" alignItems="center">
                <Avatar
                  src={`${baseUrl}${ activeConversation.comprador?.foto}` || 'https://via.placeholder.com/50'}
                  sx={{ width: 38, height: 38, mr: 2 }}
                />
                <Typography variant="h6">{activeConversation.vendedor?.nome}</Typography>
              </Box>
            </Box>

            {/* Mensagens */}
            <Box flexGrow={1} p={2} overflow="auto">
              {loadingMessages ? (
                <CircularProgress />
              ) : (
                messages.map((message, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={message.empresa?.id === Number(empresaId) ? 'flex-end' : 'flex-start'}
                    mb={2}
                  >
                     <Box
    sx={{
      p: 2,
      bgcolor: message.empresa?.id === Number(empresaId) ? "#3f51b5" : "#f0f0f0",
      color: message.empresa?.id === Number(empresaId) ? "white" : "black",
      borderRadius: "10px",
      maxWidth: "70%",
    }}
  >
                      <Typography variant="body1">{message.conteudo}</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            {/* Campo de Nova Mensagem */}
            <Box display="flex" p={2} borderTop="1px solid #e0e0e0">
              <TextField
                fullWidth
                placeholder="Escreva uma mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{ mr: 2 }}
              />
              <Button variant="contained" onClick={handleSendMessage}>
                Enviar
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
