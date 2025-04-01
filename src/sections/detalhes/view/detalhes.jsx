import React,{ useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
import { CircularProgress,IconButton,Modal } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { fetchWithToken } from '../../../../authService';
import Config from '../../../../Config';


// ----------------------------------------------------------------------


export function DetalhesView() {
  const [mainImage, setMainImage] = useState();
  const [quantity, setQuantity] = useState(1); // Estado para controlar a quantidade
  const [mainMedia, setMainMedia] = useState(null); // Estado para controlar a mídia principal (imagem ou vídeo)
  const [mediaType, setMediaType] = useState('image');
  const product = {
    name: "Produto Exemplo2",
    description: "Descrição detalhada do produto.",
    category: "Tecnologia",
    quantity: 2,
    status: "À venda",
    price: "250.99 AOA",
    images: [
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7o1UqwTqFhZnCHiL_ImyZSCgEgtFvVZoAqRJWs14MSm9w8zINDOEGUO9jvG6HLrmZajOP4asLgwAfX2sz6uvVEa38ELhPsmHdtEUQVNro3PrMlUlqjN65CWzzSmeBtWxHmjs3gGORwcaGRSB8ktJbbJ63bGusEOf7ibX6ttketOLEetfRyzbipr_HHg/s3840/Spirited%20Away%20Studio%20Ghibli%204K%20PC%20Desktop%20Wallpaper.png',
      'https://www.chromethemer.com/download/hd-wallpapers/minimalist-spiderman-3840x2160.jpg',
      'https://wallpapercat.com/w/full/b/8/f/6645-3840x2160-desktop-4k-assassins-creed-background-photo.jpg',
      'https://wallpapersko.com/wp-content/uploads/2018/06/hd-wallpaper-4k.jpg',
      'https://img.freepik.com/fotos-premium/borboletas-coloridas-imagem-gerada-pela-ia_268835-6554.jpg',
    ]
  }; 
  const [dados, setDados] = useState();
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [postos, setPostos] = useState();
  const [selectedPosto, setSelectedPosto] = useState();
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [postoDisponivel, setPostoDisponivel] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData') || '{}'));


  const handleOpenPaymentModal = () => setOpenPaymentModal(true);
  const handleClosePaymentModal = () => setOpenPaymentModal(false);

  useEffect(() => {
    const fetchPostos = async () => {
      setLoading(true);
      try {
        const response = await fetchWithToken(`api/postos/empresa/${dados?.empresa.id}/`,{
          method:'GET',
          headers: {
            "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
          },
          
        });
        const data =await response.json();
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
        method:'GET',
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
        validateStatus: (status) => status === 200 || status === 303,
      });
      setPostoDisponivel(response.status === 200);
      if (response.status === 303){
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
    if(quantidade>dados.quantidade){
      alert('A quantidade selecionada não pode ser superior à quantidade disponivel do produto.');
      return;
    }
      
    setLoading(true);
    try {
      const response = await fetchWithToken('api/stripe/create-payment/bussiness-bussiness/', {
        method:'POST',
        headers: {
          'Content-Type': 'application/json',

          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
        body:JSON.stringify(
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
      const data=await response.json();
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
          method:'GET',
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        const data=await response.json();

        setDados(data);
        console.log(data);
        // Define a primeira imagem ou vídeo como mídia principal
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
  const handleThumbnailClick = (media, type) => {
    setMainMedia(media);
    setMediaType(type);
  };



  const handleIncrement = () => {
    setQuantidade(prevQuantity => prevQuantity + 1);
  };

  const handleDecrement = () => {
    if (quantidade > 1) {
      setQuantidade(prevQuantity => prevQuantity - 1);
    }
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Detalhes do Produto
      </Typography>

      <Card sx={{ maxWidth: "100%", padding: 2 }}>
      <Grid container spacing={2}>
          {/* Coluna da mídia principal e miniaturas */}
          <Grid xs={12} md={6}>
            {mediaType === 'image' ? (
              <CardMedia
                component="img"
                height="400"
                image={mainMedia}
                alt={dados?.nome}
                sx={{ width: '100%', borderRadius: 1, marginBottom: 2 }}
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
              {/* Miniaturas de imagens */}
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

              {/* Miniaturas de vídeos */}
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
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
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
                  <Button variant="contained" color="primary" onClick={ handleOpenPaymentModal}>
                    Comprar
                  </Button>
                </Box>
              </Card>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
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
    </DashboardContent>
  );
}