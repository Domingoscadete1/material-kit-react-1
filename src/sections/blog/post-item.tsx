import React, { useState, useEffect } from 'react';
import type { CardProps } from '@mui/material/Card';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Link,
  Card,
  Avatar,
  Typography,
  Modal,
  IconButton,
  CircularProgress,
  Button,
  TextField
} from '@mui/material';
import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';



import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export type PostItemProps = {
  id: number;
  quantidade: number;
  nome: string;
  preco: number;
  status: string;
  descricao: string;
  created_at: Date;
  localizacao: string;
  imagens: { id: number; imagem: string }[];
  precoVenda: number | null;
  categoria: { nome: string }; // Adicionando categoria
  usuario: {
    nome: string;
    foto: string;
  };
  empresa: {
    nome: string;
    foto: string;
    imagens: { id: number; imagem: string }[];
    id: number;
  };
};

type Message = {
  id: number;
  conteudo: string;
  remetente: string;
  created_at: string;
};
type Posto={
  nome:string;
  localizacao:string;
  id:number;
  posto:{
  nome:string;
  localizacao:string;
  id:number;
  }
}

export function PostItem({
  sx,
  post,
  latestPost,
  latestPostLarge,
  ...other
}: CardProps & {
  post: PostItemProps;
  latestPost: boolean;
  latestPostLarge: boolean;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openMessageModal, setOpenMessageModal] = useState(false);
  const handleOpenMessageModal = () => setOpenMessageModal(true);
  const handleCloseMessageModal = () => setOpenMessageModal(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData') || '{}'));
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    navigate(`/perfil2/${post.empresa.id}/empresa`);
  };

  const sendMessage = () => {
    if (!message.trim()) {
      alert('Digite uma mensagem');
      return;
    }

    const data = {
      produto_id: post.id,
      mensagem: message,
      empresa_id: userData?.empresa.id,
    };

    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(data));
      setMessage('');
    } else {
      alert('O WebSocket não está conectado.');
    }
  };

  // Abre a conexão WebSocket quando o modal de mensagens é aberto
  // Abre a conexão WebSocket quando o modal de mensagens é aberto
  useEffect(() => {
    if (!openMessageModal) {
      return undefined; // Retorno explícito para evitar erro do ESLint
    }
  
    const wsUrl = `wss://ef49-154-71-159-172.ngrok-free.app/ws/new_chat/${userData?.id}/`;
    const ws = new WebSocket(wsUrl);
    setWebSocket(ws);
  
    ws.onopen = () => {
      console.log("Conectado ao WebSocket");
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data.messages)) {
        setMessages((prevMessages) => [
          ...prevMessages,
          ...data.messages.map((msg: Message) => ({
            id: msg.id,
            conteudo: msg.conteudo,
            remetente: msg.remetente,
            created_at: msg.created_at,
          })),
        ]);
      }
      if (data.message) {
        const timestamp = new Date().toLocaleString();
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            id: prevMessages.length + 1, 
            conteudo: data.message, 
            remetente: data.remetente, 
            created_at: timestamp 
          },
        ]);
      }
    };
  
    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
      alert("Erro no WebSocket.");
    };
  
    ws.onclose = (e) => {
      console.log("Desconectado do WebSocket", e.code, e.reason);
    };
  
    // Retorna a função de cleanup para fechar o WebSocket
    return () => {
      ws.close();
    };
  }, [openMessageModal, userData?.id]);

const [openPaymentModal, setOpenPaymentModal] = useState(false);
const [postos, setPostos] = useState<Posto[]>([]);
const [selectedPosto, setSelectedPosto] = useState<number | null>(null);
const [checkoutUrl, setCheckoutUrl] = useState(null);
const [postoDisponivel, setPostoDisponivel] = useState(false);
const [quantidade, setQuantidade] = useState('1');
const [loading, setLoading] = useState(false);

const handleOpenPaymentModal = () => setOpenPaymentModal(true);
const handleClosePaymentModal = () => setOpenPaymentModal(false);

useEffect(() => {
  const fetchPostos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/postos/empresa/${post.empresa.id}/`);
      setPostos(response.data.postos || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (openPaymentModal) {
    fetchPostos();
  }
}, [openPaymentModal, post.empresa.id]);

const checkPostoAvailability = async (postoId:number) => {
  try {
    const response = await axios.get(`https://408e-154-71-159-172.ngrok-free.app/api/posto/available/${postoId}/`,{
      headers: {
        "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
      },
    });
    setPostoDisponivel(response.status === 200);
    if (response.status === 303) alert('Não há espaço neste posto.');
  } catch {
    alert('Erro ao verificar disponibilidade do posto');
  }
};

const initiatePayment = async () => {
  if (!selectedPosto) {
    alert( 'Por favor, selecione um posto antes de prosseguir.');
    return;
  }
  setLoading(true);
  try {
    const response = await axios.post('https://408e-154-71-159-172.ngrok-free.app/api/stripe/create-payment/bussiness-bussiness/', {
      produto_id: post.id,
      empresa_id: userData?.empresa?.id,
      posto_id: selectedPosto,
      descricao: post.descricao,
      currency: 'AOA',
      quantidade,
    });
    setCheckoutUrl(response.data.checkout_url);
  } catch (error) {
    alert('Erro ao iniciar pagamento');
  } finally {
    setLoading(false);
  }
};
  
  


  const renderAvatar = (
    <Avatar
      alt={post.empresa.nome}
      src={`https://408e-154-71-159-172.ngrok-free.app${post.empresa?.imagens[0]?.imagem}`}
      sx={{
        left: 24,
        zIndex: 9,
        bottom: -24,
        position: 'absolute',
        ...((latestPostLarge || latestPost) && {
          top: 24,
        }),
      }}
      onClick={handleAvatarClick} // Adicionando o redirecionamento com ID e Tipo
    />
  );

  const renderTitle = (
    <Link
      color="inherit"
      variant="subtitle2"
      underline="hover"
      sx={{
        height: 44,
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        ...(latestPostLarge && { typography: 'h5', height: 60 }),
        ...((latestPostLarge || latestPost) && {
          color: 'common.white',
        }),
      }}
    >
      {post.nome}
    </Link>
  );

  const renderInfo = (
    <Box
      gap={1.5}
      display="flex"
      flexWrap="wrap"
      justifyContent="flex-end"
      sx={{
        mt: 3,
        color: 'text.disabled',
      }}
    >
      {[
        { icon: 'solar:chat-round-dots-bold', onClick: handleOpenMessageModal },
        { number: post.quantidade, icon: 'mdi:package-variant' },
        // { number: post.quantidade, icon: 'solar:share-bold' },
        { icon: 'mdi:credit-card-outline', onClick: handleOpenPaymentModal }, // 
      ].map((info, _index) => (
        <Box
          key={_index}
          display="flex"
          sx={{
            ...((latestPostLarge || latestPost) && {
              opacity: 0.64,
              color: 'common.white',
            }),
          }}
          onClick={info.onClick}
        >
          <Iconify width={16} icon={info.icon} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{fShortenNumber(info.number)}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderCover = (
    <Box
      component="img"
      onClick={handleOpen}
      alt={post.nome}
      src={`https://408e-154-71-159-172.ngrok-free.app${post.imagens[0]?.imagem}`}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...((latestPostLarge || latestPost) && {
          opacity: 0.48,
          color: 'common.white',
        }),
      }}
    >
      {fDate(post.created_at)}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      width={88}
      height={36}
      src="/assets/icons/shape-avatar.svg"
      sx={{
        left: 0,
        zIndex: 9,
        bottom: -16,
        position: 'absolute',
        color: 'background.paper',
        ...((latestPostLarge || latestPost) && { display: 'none' }),
      }}
    />
  );

  const renderProductInfo = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 8, border: '1px solid #000' }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {post.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Preço: {post.preco.toFixed(2)} KZ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quantidade disponível: {post.quantidade}
        </Typography>
      </Box>
      <Box
        component="img"
        src={`https://408e-154-71-159-172.ngrok-free.app${post.imagens[0]?.imagem}`}
        alt={post.nome}
        sx={{
          width: 80,
          height: 80,
          objectFit: 'cover',
          borderRadius: 1,
        }}
      />
    </Box>
  );

  return (
    <>
      <Card sx={sx} {...other}>
        <Box
          sx={(theme) => ({
            position: 'relative',
            pt: 'calc(100% * 3 / 4)',
            ...((latestPostLarge || latestPost) && {
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: 0,
                content: "''",
                width: '100%',
                height: '100%',
                position: 'absolute',
                bgcolor: varAlpha(theme.palette.grey['900Channel'], 0.72),
              },
            }),
            ...(latestPostLarge && {
              pt: {
                xs: 'calc(100% * 4 / 3)',
                sm: 'calc(100% * 3 / 4.66)',
              },
            }),
          })}
        >
          {renderShape}
          {renderAvatar}
          {renderCover}
        </Box>

        <Box
          sx={(theme) => ({
            p: theme.spacing(6, 3, 3, 3),
            ...((latestPostLarge || latestPost) && {
              width: 1,
              bottom: 0,
              position: 'absolute',
            }),
          })}
        >
          {renderDate}
          {renderTitle}
          {renderInfo}
        </Box>
      </Card>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Iconify icon="mdi:close" width={24} />
          </IconButton>

          <Typography variant="h5" sx={{ mb: 2 }}>
            {post.nome}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {post.descricao}
          </Typography>

          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2 }}>
            Preço: {post.preco.toFixed(2)} KZ
          </Typography>

          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
            Categoria: {post.categoria.nome}
          </Typography>

          {/* GALERIA DE IMAGENS */}
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
            }}
          >
            {post.imagens && Array.isArray(post.imagens) && post.imagens.map((img) => (
              <Box
                key={img.id}
                component="img"
                src={`https://408e-154-71-159-172.ngrok-free.app${img.imagem}`}
                alt={post.nome}
                sx={{ width: 120, height: 120, borderRadius: 1, objectFit: 'cover' }}
              />
            ))}
          </Box>
        </Box>
      </Modal>

      {/* Modal de Enviar Mensagem */}
      <Modal open={openMessageModal} onClose={handleCloseMessageModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <IconButton onClick={handleCloseMessageModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Iconify icon="mdi:close" width={24} />
          </IconButton>

          {renderAvatar}
          {renderProductInfo}

          <Box component="form" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}  onSubmit={(event) => {
    event.preventDefault(); // Evita o reload da página
    sendMessage();
  }}>
            <textarea
              rows={2}
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginBottom: '16px',
                resize: 'none',
              }}
            />
            <IconButton
              type="submit"
              // onClick={sendMessage}
              sx={{
                backgroundColor: '#1976d2',
                color: '#fff',
                borderRadius: '50%',
                width: 48,
                height: 48,
                alignSelf: 'flex-end',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              <Iconify icon="mdi:telegram" width={24} />
            </IconButton>
          </Box>
        </Box>
      </Modal>
      {/* modal de pagamento */}


      <Modal open={openPaymentModal} onClose={handleClosePaymentModal}>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 600,
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <IconButton onClick={handleClosePaymentModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
      <Iconify icon="mdi:close" width={24} />
    </IconButton>

    <Typography variant="h5" sx={{ mb: 2 }}>
      Selecionar Posto para Pagamento
    </Typography>

    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
        <CircularProgress />
      </Box>
    ) : (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {postos.map((posto) => (
            <Box
            key={posto.posto.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: selectedPosto === posto.posto.id ? '#f0f0f0' : 'transparent',
            }}
            onClick={() => {
              setSelectedPosto(posto.posto.id);
              checkPostoAvailability(posto.posto.id);
            }}
          >
            <Typography>{posto.posto.nome}</Typography>
            <Typography>{posto.posto.localizacao}</Typography>
            {selectedPosto === posto.posto.id && (
              <Iconify
                icon={postoDisponivel ? "mdi:check-circle" : "mdi:alert-circle"}
                width={24}
                color={postoDisponivel ? "green" : "red"}
              />
            )}
          </Box>
          ))}
        </Box>

        {postoDisponivel && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Quantidade"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={initiatePayment}
              disabled={loading}
              fullWidth
            >
              Gerar Link de Pagamento
            </Button>
          </Box>
        )}

        {checkoutUrl && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => window.open(checkoutUrl, '_blank')}
              fullWidth
            >
              Ir para Pagamento
            </Button>
          </Box>
        )}
      </>
    )}
  </Box>
</Modal>
    </>
  );
}