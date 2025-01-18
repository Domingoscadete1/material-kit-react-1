import { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button, Modal, TextField } from '@mui/material';
import { fCurrency } from 'src/utils/format-number';
import { Label } from 'src/components/label';
import Config from '../Config';

export type ProductItemProps = {
  id: number;
  nome: string;
  preco: number;
  status: string;
  descricao: string;
  localizacao: string;
  imagens: { id: number; imagem: string }[];
  precoVenda: number | null;
  categoria: { nome: string }; // Adicionando categoria
};

export function ProductItem({ product }: { product: ProductItemProps }) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [formData, setFormData] = useState({ ...product });
  const [selectedImages, setSelectedImages] = useState(product.imagens);
  const [imagensParaRemover, setImagensParaRemover] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);  // Novo estado para as imagens
  const baseUrl = Config.getApiUrl();
  const mediaUrl=Config.getApiUrlMedia();

  const handleOpenUpdateModal = () => setOpenUpdateModal(true);
  const handleCloseUpdateModal = () => setOpenUpdateModal(false);

  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProduct = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('nome', formData.nome);
    formDataToSend.append('descricao', formData.descricao);
    formDataToSend.append('preco', formData.preco.toString());
    formDataToSend.append('status', formData.status);
    formDataToSend.append('localizacao', formData.localizacao);
    formDataToSend.append('categoria', formData.categoria.nome);

    // Adiciona as imagens novas
    newImages.forEach((image, index) => {
      formDataToSend.append(`imagem${index + 1}`, image);
    });

    // Adiciona as imagens a remover
    imagensParaRemover.forEach((imageId) => {
      formDataToSend.append('imagens_para_remover[]', imageId.toString());
    });

    try {
      const response = await axios.put(
        `${baseUrl}api/produto/${product.id}/atualizar/`, // Ajuste a URL para o endpoint da API
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log(response.data);
      setOpenUpdateModal(false);
    } catch (error) {
      console.error('Erro ao atualizar produto', error);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await axios.delete(
        `${baseUrl}api/produto/${product.id}/deletar/`
      );
      console.log(response.data);
      setOpenDeleteModal(false);
    } catch (error) {
      console.error('Erro ao deletar produto', error);
    }
  };

  const handleImageDelete = (imageId: number) => {
    setImagensParaRemover((prev) => [...prev, imageId]);
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newUploadedImages = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...newUploadedImages]);
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
      <Card>
        <Box sx={{ pt: '100%', position: 'relative' }}>
          {product.status && renderStatus}
          <Box
            component="img"
            alt={product.nome}
            src={`http://localhost:8000${product.imagens[0]?.imagem}`}
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
        <Box sx={{ width: 400, bgcolor: 'white', padding: 3 }}>
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
                  src={`http://localhost:8000${image.imagem}`}
                  alt="Produto"
                  sx={{ width: 50, height: 50, objectFit: 'cover', mr: 2 }}
                />
                <Button color="error" onClick={() => handleImageDelete(image.id)}>
                  Remover
                </Button>
              </Box>
            ))}

              {/* Adicionar novas imagens */}
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

          <Button onClick={handleUpdateProduct} sx={{ mt: 2 }} variant="contained">
            Atualizar
          </Button>
          <Button onClick={handleCloseUpdateModal} sx={{ mt: 2 }} variant="contained" >
            Fechar
          </Button>
        </Box>
      </Modal>

      {/* Modal de Confirmação de Apagar */}
      <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <Box sx={{ width: 400, bgcolor: 'white', padding: 3 }}>
          <Typography variant="h6">Confirmar Exclusão</Typography>
          <Typography variant="body2" mt={2}>
            Tem certeza que deseja apagar o produto?
          </Typography>

          <Box display="flex" justifyContent="space-between" mt={2}>
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
