import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Avatar, TextField, Button, CircularProgress } from '@mui/material';
import { fetchWithToken } from '../../../../authService';
import Config from '../../../../Config';

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
export interface Imagem {
  imagem: string;
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
  imagens: Imagem[];
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
  imagens: Imagem[];
}

// Representação de uma sala de chat (ChatRoom)
export interface ChatRoom {
  id: number;
  produto: Produto;
  empresa?: Empresa;
  empresa_compradora?: Empresa;
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
  imagens?: Imagem[];

}

export function ListaView() {
  const generateWaveformHeights = () => {
    return Array.from({ length: 10 }, () => Math.random() * 50 + 10);
  };
  const baseUrl = Config.getApiUrl();
  const mediaUrl = Config.getApiUrlMedia();

  const baseWsUrl = Config.getApiUrlWs(); // Substitua pelo URL correto

  const [conversations, setConversations] = useState<ChatRoom[]>([]); // Tipo aplicado
  const [activeConversation, setActiveConversation] = useState<ChatRoom | null>(null); // Tipo aplicado

  const [messages, setMessages] = useState<Mensagem[]>([]); const [newMessage, setNewMessage] = useState(''); // Nova mensagem
  const [empresaId, setEmpresaId] = useState(''); // ID da empresa
  const [loadingMessages, setLoadingMessages] = useState(false); // Estado de carregamento das mensagens
  const socketRef = useRef<WebSocket | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null); // Adicionado estado para o MediaRecorder

  
  // Estados para envio de imagens
  const [images, setImages] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
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
        const response = await fetchWithToken(`api/chatrooms/empresa-list/${empresaId}/`, {
          method: 'GET',
          headers: {

            'Content-Type': 'multipart/form-data',
            "ngrok-skip-browser-warning": "true"
          },
        });
        const data = await response.json();
        const { chats } = data;
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

  useEffect(() => {
    if (!activeConversation) return;

    const socket = new WebSocket(`wss://${baseWsUrl}/ws/chat/${activeConversation.id}/`);
    socketRef.current = socket;
    


    socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (Array.isArray(data.messages)) {
        setMessages((prevMessages) => [
          ...prevMessages,
          ...data.messages.map((msg: Mensagem) => ({
            id: msg.id,
            conteudo: msg.conteudo,
            remetente_id: msg.remetente_id,
            created_at: msg.created_at,
            chat_room: msg.chat_room,
          })),
        ]);
      }

      // Se for uma nova mensagem recebida
      if (data.conteudo) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: data.mensagem_id || prevMessages.length + 1,
            conteudo: data.conteudo,
            remetente_id: data.remetente_id || data.remetente,
            created_at: data.created_at || new Date().toISOString(),
            chat_room: activeConversation, // Garante a referência ao chat
            remetente: activeConversation?.comprador || activeConversation?.vendedor, // Evita erros
            
          },
        ]);
      }

    };

    // eslint-disable-next-line consistent-return
    return () => {
      socket.close();
    };
  }, [activeConversation, baseWsUrl]);

  // Busca as mensagens do chat ativo
  useEffect(() => {
    let intervalId:any;

    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        const response = await fetchWithToken(`api/chatrooms/messages/${activeConversation.id}/`, {
          method: 'GET',
          headers: {

            'Content-Type': 'multipart/form-data',
            "ngrok-skip-browser-warning": "true"
          },
        });
        const data = await response.json();
        const { mensagens } = data;
        setMessages(mensagens);
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      }
    };

    if (activeConversation) {
      fetchMessages(); // chamada inicial
      intervalId = setInterval(fetchMessages, 7000); // chamada a cada 7 segundos
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId);
    };

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
      socketRef.current.onmessage = (event) => {
        const novaMensagem = JSON.parse(event.data);
        console.log("Nova mensagem recebida:", novaMensagem);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: novaMensagem.mensagem_id || prevMessages.length + 1,
            conteudo: novaMensagem.conteudo,
            remetente_id: novaMensagem.remetente_id,
            empresa_id: novaMensagem.empresa_id,
            created_at: novaMensagem.created_at || new Date().toISOString(),
            chat_room: activeConversation, // Garante a referência ao chat
            remetente: activeConversation?.comprador || activeConversation?.vendedor, // Evita erros
          },
        ]);
      }
      setNewMessage('');
    }
  };
  const sendAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('chatroom_id', String(activeConversation?.id));
    formData.append('remetente_id', empresaId);
    formData.append('audio', new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' }));
  
    try {
      const response = await fetchWithToken('api/audio-mensagem/create/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Erro ao enviar áudio:', error);
      }
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
    }
  };
  
const startRecording = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(mediaStream);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
      sendAudio(audioBlob);
      // Encerra todas as tracks do stream
      mediaStream.getTracks().forEach(track => track.stop());
    };

    recorder.start();
    setIsRecording(true);
    setMediaRecorder(recorder);

  } catch (error) {
    console.error('Erro ao iniciar gravação:', error);
  }
};
const stopRecording = () => {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    setIsRecording(false);
    setMediaRecorder(null);
  }
};

  const sendImages = async () => {
    if (!images.length || !activeConversation) return;
  
    const formData = new FormData();
    formData.append('chat_id', String(activeConversation.id));
    formData.append('empresa_id', empresaId);
  
    images.forEach((image, index) => {
      formData.append(`imagem${index + 1}`, image);
    });
  
    try {
      const response = await fetchWithToken('api/imagem-mensagem/create/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('Erro ao enviar imagens:', error);
      }
    } catch (error) {
      console.error('Erro ao enviar imagens:', error);
    }
  };
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setImages(selected);
    }
  };
  const renderAudioButton = () => {
    return (
      <Button
        variant="outlined"
        onClick={isRecording ? stopRecording : startRecording}
        color={isRecording ? "error" : "primary"}
      >
        {isRecording ? "Parar Gravação" : "Áudio"}
      </Button>
    );
  };
  
  
  const renderWaveform = () => {
    const heights = generateWaveformHeights();

    return (
      <Box display="flex" alignItems="flex-end" height={50} gap={1}>
        {heights.map((height, index) => (
          <Box
            key={index}
            bgcolor="#f1731f"
            width={3}
            height={`${height}px`}
            borderRadius={2}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box display="flex" height="90vh" bgcolor="#f4f6f8">
      <Box
        width="28%"
        bgcolor="#f1731f"
        color="black"
        p={2}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box mb={2}>
          <Typography variant="h4">Mensagens</Typography>
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
                bgcolor: activeConversation?.id === conversation.id ? '#b34c1c' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => setActiveConversation(conversation)}
            >
              <Avatar
                src={
                  conversation.comprador?.foto
                    ? `${mediaUrl}${conversation.comprador.foto}`
                    : conversation.empresa_compradora?.id === Number(empresaId)
                      ? empresaId
                        ? `${mediaUrl}${conversation?.empresa?.imagens[0].imagem}`
                        : `${mediaUrl}/static/DD3-removebg-preview.png`
                      : conversation.empresa_compradora?.imagens?.[0]?.imagem
                        ? `${mediaUrl}${conversation.empresa_compradora.imagens[0].imagem}`
                        : `${mediaUrl}/static/DD3-removebg-preview.png`
                } sx={{ width: 48, height: 48, mr: 2 }}
              />
              <Box>
                <Typography variant="h6" color="black">
                  {conversation.comprador?.nome || conversation?.empresa_compradora?.nome}
                </Typography>
                <Typography variant="body1" color="black">{conversation.produto?.nome || 'Produto não definido'}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Área do Chat */}
      <Box flexGrow={1} display="flex" flexDirection="column" bgcolor="white">
        {activeConversation && (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              borderBottom="1px solid #e0e0e0"
            >
              <Box display="flex" alignItems="center">
                <Avatar
                  src={
                    activeConversation.comprador?.foto
                      ? `${mediaUrl}${activeConversation.comprador.foto}`
                      : activeConversation.empresa?.imagens?.[0]?.imagem
                        ? `${mediaUrl}${activeConversation.empresa.imagens[0].imagem}`
                        : "https://via.placeholder.com/50"
                  }
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
            bgcolor: message.empresa?.id === Number(empresaId) ? "#f1731f" : "#f0f0f0",
            color: message.empresa?.id === Number(empresaId) ? "white" : "black",
            borderRadius: "10px",
            maxWidth: "70%",
          }}
        >
          <Typography variant="body1" mb={1}>
            {message.conteudo}
          </Typography>

          {/* Imagens */}
          {message.imagens && Array.isArray(message.imagens) && message.imagens.length > 0 && (
                        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                          {message?.imagens?.map((img, index) => (
                            <img
                              key={index}
                              src={`${mediaUrl}${img.imagem}`}
                              alt={`imagem-${index}`}
                              style={{ 
                                width: 100, 
                                height: 100, 
                                objectFit: "cover", 
                                borderRadius: 8, 
                                cursor: "pointer" 
                              }}
                            />
                          ))}
                        </Box>
                      )}

          {/* Áudio */}
          {message.audio && (
                        <Box display="flex" alignItems="center" gap={1}>
                          {renderWaveform()}
                          <audio controls>
                            <source src={`${mediaUrl}${message.audio}`} type="audio/mpeg" />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))
              )}
</Box>


            {/* Campo de Nova Mensagem */}
            <Box display="flex" alignItems="center" gap={1} p={2} borderTop="1px solid #e0e0e0">
            <input
    accept="image/*"
    type="file"
    multiple
    style={{ display: 'none' }}
    id="image-upload"
    onChange={handleImageSelect}
  />
  <label htmlFor="image-upload">
    <Button variant="outlined" component="span">Imagens</Button>
  </label>

  <Button variant="outlined" onClick={sendImages}>Enviar Imagens</Button>

  {renderAudioButton()}


              <TextField
                fullWidth
                placeholder="Escreva uma mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                style={{ backgroundColor: "#f1731f" }}
              >
                Enviar
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
