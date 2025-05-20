import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { Iconify } from 'src/components/iconify';
import ReportIcon from '@mui/icons-material/Report';
import { Avatar, CardActions, CircularProgress, IconButton, Modal, MenuItem } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { fetchWithToken } from '../../../../authService';
import Config from '../../../../Config';


// ----------------------------------------------------------------------

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

export function DetalhesView() {
  const [mainImage, setMainImage] = useState();
  const [quantity, setQuantity] = useState(1);
  const [mainMedia, setMainMedia] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [dados, setDados] = useState(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [postos, setPostos] = useState();
  const [selectedPosto, setSelectedPosto] = useState();
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [postoDisponivel, setPostoDisponivel] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData') || '{}'));
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [modalImagemOpen, setModalImagemOpen] = useState(false);
  const [produtosemelhantes, setProdutoSemelhantes] = useState([]);
  const navigate = useNavigate();
  const handleOpenPaymentModal = () => setOpenPaymentModal(true);
  const handleClosePaymentModal = () => setOpenPaymentModal(false);
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    const fetchPostos = async () => {
      setLoading(true);
      try {
        const response = await fetchWithToken(`api/postos/empresa/${dados?.empresa.id}/`, {
          method: 'GET',
          headers: {
            "ngrok-skip-browser-warning": "true",
          },

        });
        const data = await response.json();
        setPostos(data.postos || []);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (openPaymentModal) {
      fetchPostos();
    }
  }, [openPaymentModal, dados?.empresa?.id]);

  const checkPostoAvailability = async (postoId) => {
    try {
      const response = await fetchWithToken(`api/posto/available/${postoId}/`, {
        method: 'GET',
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        validateStatus: (status) => status === 200 || status === 303,
      });
      setPostoDisponivel(response.status === 200);
      if (response.status === 303) {
        alert('Não há espaço neste posto.');
        setPostoDisponivel(false);

      }
    } catch {
      alert('Erro ao verificar disponibilidade do posto');
    }
  };

  const initiatePayment = async () => {
    if (!selectedPosto) {
      alert('Por favor, selecione um posto antes de prosseguir.');
      return;
    }
    if (quantidade > dados.quantidade) {
      alert('A quantidade selecionada não pode ser superior à quantidade disponivel do produto.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithToken('api/stripe/create-payment/bussiness-bussiness/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(
          {
            produto_id: dados.id,
            empresa_id: userData?.empresa?.id,
            posto_id: selectedPosto,
            descricao: dados.descricao,
            currency: 'AOA',
            quantidade,
          }
        ),
      });
      const data = await response.json();
      setCheckoutUrl(data.checkout_url);
    } catch (error) {
      alert('Erro ao iniciar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithToken(`api/produto/${id}/`, {
          method: 'GET',
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        const data = await response.json();

        setDados(data);
        console.log(data);
        if (data.imagens.length > 0) {
          setMainMedia(data.imagens[0].imagem);
          setMediaType('image');
        } else if (data.videos.length > 0) {
          setMainMedia(data.videos[0].video);
          setMediaType('video');
        }

      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchProdutoSemelhantes = async () => {
      if (!dados || !dados.categoria) return;
      try {
        const response = await fetchWithToken(`api/produtos/categoria/${dados.categoria.id}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        const data = await response.json();
        setProdutoSemelhantes(data.results || []);
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      }
    };

    fetchProdutoSemelhantes();
  }, [id, dados]);


  const handleThumbnailClick = (media, type, produto) => {
    if (produto) {
      setDados(produto);
      setMainMedia(`${Config.getApiUrlMedia()}${produto?.imagens[0].imagem}`);
      setMediaType('image');
    } else {
      setMainMedia(media);
      setMediaType(type);
    }
  };

  const handleIncrement = () => {
    setQuantidade(prevQuantity => prevQuantity + 1);
  };

  const handleDecrement = () => {
    if (quantidade > 1) {
      setQuantidade(prevQuantity => prevQuantity - 1);
    }
  };

  const handleOpenImagem = (imagemUrl) => {
    setImagemSelecionada(imagemUrl);
    setModalImagemOpen(true);
  };

  const handleImageClick = () => {
    navigate(`/perfil2/${dados?.empresa?.id}/empresa`);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      alert('Denúncia enviada com sucesso!');
      setMotivo('');
      setDescricao('');
      handleClose();
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
      alert('Erro ao enviar denúncia');
    }
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Detalhes do Produto
      </Typography>

      <Card sx={{ maxWidth: "100%", padding: 2 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            {mediaType === 'image' ? (
              <CardMedia
                component="img"
                height="400"
                image={mainMedia}
                alt={dados?.nome}
                sx={{ width: '100%', borderRadius: 1, marginBottom: 2, cursor: 'pointer' }}
                onClick={() => handleOpenImagem(mainMedia)}
              />
            ) : (
              <Box
                component="video"
                controls
                src={mainMedia}
                sx={{ width: '100%', borderRadius: 1, marginBottom: 2, height: '400px' }}
              />
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {dados?.imagens.map((image, index) => (
                <CardMedia
                  key={`image-${index}`}
                  component="img"
                  height="60"
                  image={image.imagem}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => handleThumbnailClick(image.imagem, 'image')}
                  sx={{
                    width: 60,
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: mainMedia === image.imagem && mediaType === 'image' ? '2px solid blue' : 'none',
                  }}
                />
              ))}

              {dados?.videos.map((video, index) => (
                <Box
                  key={`video-${index}`}
                  onClick={() => handleThumbnailClick(video.video, 'video')}
                  sx={{
                    width: 60,
                    height: 60,
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: mainMedia === video.video && mediaType === 'video' ? '2px solid blue' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Vídeo {index + 1}
                  </Typography>
                </Box>
              ))}

            </Box>
          </Grid>

          <Grid xs={12} md={6}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderBottomColor: 'gray' }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  marginBottom: 2,
                  cursor: 'pointer'
                }}
                onClick={handleImageClick}
              >
                <img
                  src={dados?.empresa?.imagens[0]?.imagem}
                  alt="..."
                  style={{
                    width: 60,
                    height: 50,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Box>
                <Typography gutterBottom variant="h5" component="Box"> {dados?.empresa.nome} </Typography>
                <Typography variant="body2" color="text.secondary"> Vendedor </Typography>
              </Box>

              <IconButton
                color="error"
                title="Denunciar produto"
                onClick={handleOpen}
              >
                <ReportIcon />
              </IconButton>
            </Box>

            <CardContent>
              <Typography gutterBottom variant="h5" component="Box">
                {dados?.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dados?.descricao}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categoria: {dados?.categoria.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quantidade: {dados?.quantidade}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {dados?.status}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Preço: {dados?.preco} AOA
              </Typography>

              <Card variant="outlined" sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {dados?.preco} AOA
                </Typography>

                <Typography variant="h7">
                  Quantidade:
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, mb: 2 }}>
                  <Button variant="outlined" onClick={handleDecrement}>-</Button>
                  <TextField
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ width: '80px', }}
                  />
                  <Button variant="outlined" onClick={handleIncrement}>+</Button>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleOpenPaymentModal}>
                    Comprar
                  </Button>
                </Box>
              </Card>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

      <Typography variant="h4" sx={{ mb: 3, mt: 3 }}>
        Produtos Relacionados
      </Typography>

      <Card sx={{ maxWidth: "100%", padding: 2 }}>
        <Grid container spacing={2}>
          {produtosemelhantes.map((produto) => (
            <Grid item xs={12} sm={6} md={3} key={produto.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={`${Config.getApiUrlMedia()}${produto?.imagens[0].imagem}`}
                  alt={produto.nome}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    handleThumbnailClick(
                      `${Config.getApiUrlMedia()}${produto?.imagens[0].imagem}`,
                      'image',
                      produto
                    )
                  }
                />

                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                  <Avatar
                    src={`${Config.getApiUrlMedia()}${produto?.empresa?.imagens[0].imagem}`}
                    sx={{ width: 50, height: 50, mr: 1.5, cursor: 'pointer' }}
                  />
                  <Typography variant="body2">{produto?.empresa.nome}</Typography>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6">
                    {produto.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {produto.descricao}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                    Quantidade: {produto.quantidade} disponíveis
                  </Typography>
                  <Typography variant="h6" color="primary">
                    KZ {produto.preco.toFixed(2).replace('.', ',')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>

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
                {postos?.map((posto) => (
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
                  {/* <TextField
                    label="Quantidade"
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  /> */}
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

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-denuncia"
        aria-describedby="modal-denuncia-produto"
      >
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            Denunciar Produto
          </Typography>

          <TextField
            select
            fullWidth
            label="Motivo da denúncia"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="conteudo_impropio">Conteúdo impróprio</MenuItem>
            <MenuItem value="informacao_falsa">Informação falsa</MenuItem>
            <MenuItem value="produto_ilegal">Produto ilegal</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Descrição detalhada"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleSubmit}
              disabled={!motivo || !descricao}
            >
              Enviar Denúncia
            </Button>
          </Box>
        </Box>
      </Modal>

    </DashboardContent>
  );
}