import { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button, Modal, TextField,CircularProgress } from '@mui/material';
import { fCurrency } from 'src/utils/format-number';
import { Label } from 'src/components/label';
import Config from '../../../Config';
import { fetchWithToken } from '../../../authService';

export type ProductItemProps = {
  id: number;
  quantidade: number;
  nome: string;
  preco: number;
  status: string;
  descricao: string;
  localizacao: string;
  imagens: { id: number; imagem: string }[];
  videos: { id: number; video: string }[];
  precoVenda: number | null;
  categoria: { nome: string };
};

export function ProductItem({ product }: { product: ProductItemProps }) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [formData, setFormData] = useState({ ...product });
  const [selectedImages, setSelectedImages] = useState(product.imagens);
  const [selectedVideos, setSelectedVideos] = useState(product.videos);
  const [imagensParaRemover, setImagensParaRemover] = useState<number[]>([]);
  const [videosParaRemover, setVideosParaRemover] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false); 

  const baseUrl = Config.getApiUrl();
  const mediaUrl = Config.getApiUrlMedia();

  const handleOpenUpdateModal = () => setOpenUpdateModal(true);
  const handleCloseUpdateModal = () => setOpenUpdateModal(false);

  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProduct = async () => {
    setLoading(true); // Ativa o loading

    const formDataToSend = new FormData();
    formDataToSend.append('nome', formData.nome);
    formDataToSend.append('descricao', formData.descricao);
    formDataToSend.append('preco', formData.preco.toString());
    formDataToSend.append('status', formData.status);
    formDataToSend.append('localizacao', formData.localizacao);
    formDataToSend.append('categoria', formData.categoria.nome);
    formDataToSend.append('quantidade', formData.quantidade.toString());

    newImages.forEach((image, index) => {
      formDataToSend.append(`imagem${index + 1}`, image);
    });

    imagensParaRemover.forEach((imageId) => {
      formDataToSend.append('imagens_para_remover', imageId.toString());
    });
    newVideos.forEach((video, index) => {
      formDataToSend.append(`video${index + 1}`, video);
    });
    videosParaRemover.forEach((videoId) => {
      formDataToSend.append('videos_para_remover', videoId.toString());
    });


    try {
      const response = await fetchWithToken(
        `api/produto/${product.id}/atualizar/`,
        {
          method: 'PUT',
          headers: {
            "ngrok-skip-browser-warning": "true"
          },
          body: formDataToSend
        }
      );
      const data = await response.json();
      console.log(data);
      setOpenUpdateModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar produto', error);
    }
    finally {
      setLoading(false); 
    }
  };

  const handleDeleteProduct = async () => {
    setLoading(true); // Ativa o loading

    try {
      const response = await fetchWithToken(
        `api/produto/${product.id}/deletar/`, {
        method: 'DELETE',
        headers: {
          "ngrok-skip-browser-warning": "true"
        },

      }
      );
      const data = await response.json();

      console.log(data);
      setOpenDeleteModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao deletar produto', error);
    }
    finally {
      setLoading(false); 
    }
  };

  const handleImageDelete = (imageId: number) => {
    setImagensParaRemover((prev) => [...prev, imageId]);
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };
  const handleVideoDelete = (videoId: number) => {
    setVideosParaRemover((prev) => [...prev, videoId]);
    setSelectedVideos((prev) => prev.filter((vid) => vid.id !== videoId));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newUploadedImages = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...newUploadedImages]);
    }
  };
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newUploadedVideos = Array.from(e.target.files);
      setNewVideos((prev) => [...prev, ...newUploadedVideos]);
    }
  };

  const renderStatus = (
    <Label
      variant="inverted"
      color={product.status === 'A venda' ? 'error' : 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status}
    </Label>
  );

  const renderPrice = (
    <Typography variant="subtitle1">
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: 'text.disabled',
          textDecoration: 'line-through',
        }}
      >
        {product.precoVenda && fCurrency(product.precoVenda)}
      </Typography>
      &nbsp;
      {fCurrency(product.preco)}
    </Typography>
  );

  return (
    <>
    {/* Overlay de Loading */}
    {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" color="white" sx={{ ml: 2 }}>
            Processando...
          </Typography>
        </Box>
      )}
      <Card>
        <Box sx={{ pt: '100%', position: 'relative' }}>
          {product.status && renderStatus}
          <Box
            component="img"
            alt={product.nome}
            src={`${mediaUrl}${product.imagens[0]?.imagem}`}
            sx={{
              top: 0,
              width: 1,
              height: 1,
              objectFit: 'cover',
              position: 'absolute',
            }}
          />
        </Box>

        <Stack spacing={2} sx={{ p: 3 }}>
          <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
            {product.nome}
          </Link>

          <Typography variant="body2" color="text.secondary" noWrap>
            {product.descricao}
          </Typography>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            {renderPrice}
            
          </Box>
          <Typography variant="body2" color="text.secondary">
            quantidade: {product.quantidade}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Localização: {product.localizacao}
          </Typography>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={handleOpenUpdateModal}>
              Atualizar
            </Button>
            <Button variant="contained" color="error" onClick={handleOpenDeleteModal}>
              Apagar
            </Button>
          </Box>
        </Stack>
      </Card>

      {/* Modal de Atualização */}
      <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
        <Box sx={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: 500,
          height: '100vh',
          bgcolor: 'white',
          boxShadow: 24,
          overflowY: 'auto',
          p: 3
        }}>
          
          <Typography variant="h6">Atualizar Produto</Typography>

          <TextField
            name="nome"
            label="Nome"
            value={formData.nome}
            onChange={handleInputChange}
            fullWidth
            sx={{ mt: 2 }}
          />

          <TextField
            name="descricao"
            label="Descrição"
            value={formData.descricao}
            onChange={handleInputChange}
            fullWidth
            sx={{ mt: 2 }}
          />

          <TextField
            name="preco"
            label="Preço"
            type="number"
            value={formData.preco}
            onChange={handleInputChange}
            fullWidth
            sx={{ mt: 2 }}
          />

          <TextField
            name="quantidade"
            label="Quantidade"
            type="number"
            value={formData.quantidade}
            onChange={handleInputChange}
            fullWidth
            sx={{ mt: 2 }}
          />

          <TextField
            name="localizacao"
            label="Localização"
            value={formData.localizacao}
            onChange={handleInputChange}
            fullWidth
            sx={{ mt: 2 }}
          />

          <TextField
            name="categoria"
            label="Categoria"
            value={formData.categoria.nome}
            onChange={handleInputChange}
            fullWidth
            sx={{ mt: 2 }}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Imagens:</Typography>
            {selectedImages.map((image) => (
              <Box key={image.id} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box
                  component="img"
                  src={`${mediaUrl}${image.imagem}`}
                  alt="Produto"
                  sx={{ width: 50, height: 50, objectFit: 'cover', mr: 2 }}
                />
                <Button color="error" onClick={() => handleImageDelete(image.id)}>
                  Remover
                </Button>
              </Box>
            ))}

            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Adicionar Imagens
              <input
                type="file"
                multiple
                hidden
                onChange={handleImageUpload}
              />
            </Button>

            {newImages.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Novas Imagens Selecionadas:</Typography>
                {newImages.map((image, index) => (
                  <Typography key={index}>{image.name}</Typography>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Vídeos:</Typography>
            {selectedVideos.map((video) => (
              <Box key={video.id} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <video
                  src={`${mediaUrl}${video.video}`}
                  controls
                  style={{ width: 100, height: 100, marginRight: 10 }}
                >
                  <track kind="captions" src="" label="Legendas" />
                </video>
                <Button color="error" onClick={() => handleVideoDelete(video.id)}>
                  Remover
                </Button>
              </Box>
            ))}

            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Adicionar Vídeos
              <input
                type="file"
                multiple
                hidden
                accept="video/*"
                onChange={handleVideoUpload}
              />
            </Button>

            {newVideos.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Novos Vídeos Selecionados:</Typography>
                {newVideos.map((video, index) => (
                  <Typography key={index}>{video.name}</Typography>
                ))}
              </Box>
            )}
          </Box>

          <Button onClick={handleUpdateProduct} sx={{ mt: 2 }} variant="contained">
            Atualizar
          </Button>
          <Button onClick={handleCloseUpdateModal} sx={{ mt: 2, ml: 2 }} variant="outlined">
            Fechar
          </Button>
        </Box>
      </Modal>

      {/* Modal de Confirmação de Apagar */}
      <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <Box sx={{
          padding: 3,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}>
          <Typography variant="h6">Confirmar Exclusão</Typography>
          <Typography variant="body2" mt={2}>
            Tem certeza que deseja apagar o produto?
          </Typography>

          <Box display="flex" justifyContent="space-between" mt={2} sx={{marginTop: '1px'}}>
            <Button onClick={handleCloseDeleteModal} variant="contained" >
              Cancelar
            </Button>
            <Button onClick={handleDeleteProduct} variant="contained" color="error">
              Apagar
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
