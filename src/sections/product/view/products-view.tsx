import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import {
  TextField,
  Modal,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import Button from '@mui/material/Button';

import { _products } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import axios from 'axios';
import Config from '../Config';
import { ProductItem } from '../product-item';
import { ProductSort } from '../product-sort';
import { CartIcon } from '../product-cart-widget';
import { ProductFilters } from '../product-filters';
import type { FiltersProps } from '../product-filters';

// ----------------------------------------------------------------------

const GENDER_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'shose', label: 'Shose' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessories', label: 'Accessories' },
];

const RATING_OPTIONS = ['up4Star', 'up3Star', 'up2Star', 'up1Star'];

const PRICE_OPTIONS = [
  { value: 'below', label: 'Below $25' },
  { value: 'between', label: 'Between $25 - $75' },
  { value: 'above', label: 'Above $75' },
];

const COLOR_OPTIONS = [
  '#00AB55',
  '#000000',
  '#FFFFFF',
  '#FFC0CB',
  '#FF4842',
  '#1890FF',
  '#94D82D',
  '#FFC107',
];

const defaultFilters = {
  price: '',
  gender: [GENDER_OPTIONS[0].value],
  colors: [COLOR_OPTIONS[4]],
  rating: RATING_OPTIONS[0],
  category: CATEGORY_OPTIONS[0].value,
};

export function ProductsView() {
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<any[]>([]); // Armazenar produtos da API
  const [loading, setLoading] = useState(true); // Para gerenciar o estado de carregamento
  const [page, setPage] = useState(1); // Para controle de paginação
  const [openFilter, setOpenFilter] = useState(false);
  const [empresaId, setEmpresaId] = React.useState<string | null>(null);
  const baseUrl = Config.getApiUrl();
  const [openModal, setOpenModal] = useState(false);
  const token2 = localStorage.getItem('refreshToken'); // Token salvo ao logar

  const [newProduct, setNewProduct] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    condicao: 'Novo',
    preco: '',
    localizacao: '',
    quantidade: 1,
    images: [] as File[], // Para permitir múltiplas imagens

  });

  const [filters, setFilters] = useState<FiltersProps>(defaultFilters);

  const handleOpenFilter = useCallback(() => {
    setOpenFilter(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setOpenFilter(false);
  }, []);

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleSetFilters = useCallback((updateState: Partial<FiltersProps>) => {
    setFilters((prevValue) => ({ ...prevValue, ...updateState }));
  }, []);
  useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const postoId = userData.empresa;
      if (postoId) {
        setEmpresaId(postoId);
      }
    }
  }, []); // Mantenha vazio se `empresaId` não mudar

  useEffect(() => {
    if (empresaId) {
      console.log(empresaId);
    }
  }, [empresaId]); // Adicione empresaId como dependência

  const fetchProducts = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}api/produtos/empresa/${empresaId}/`);
      console.log('Produtos recebidos:', response.data.produtos);

      setProducts(response.data.produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId, baseUrl]);



  useEffect(() => {
    if (empresaId) {
      fetchProducts();
    }
  }, [empresaId, fetchProducts]);

  const handleCreateProduct = async () => {
    const formData = new FormData();

    formData.append('nome', newProduct.nome);
    formData.append('descricao', newProduct.descricao);
    formData.append('categoria', newProduct.categoria);
    formData.append('condicao', newProduct.condicao);
    formData.append('preco', newProduct.preco);
    formData.append('localizacao', newProduct.localizacao);
    formData.append('quantidade', String(newProduct.quantidade));
    formData.append('empresa_id', empresaId || '');

    // Adicionar até 5 imagens ao FormData
    newProduct.images.slice(0, 5).forEach((image, index) => {
      formData.append(`imagem${index + 1}`, image);
    });

    try {
      const response = await axios.post(`${baseUrl}api/produto/create/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',

        },
      });
      console.log('Produto criado com sucesso:', response.data);
      setOpenModal(false);
      fetchProducts(); // Atualizar a lista de produtos
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const canReset = Object.keys(filters).some(
    (key) => filters[key as keyof FiltersProps] !== defaultFilters[key as keyof FiltersProps]
  );

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Produtos
      </Typography>
      <Box display="flex" alignItems="center" mb={5}>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenModal(true)}
        >
          Criar Novo Produto
        </Button>
      </Box>
      <CartIcon totalItems={8} />
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" mb={2}>
            Criar Novo Produto
          </Typography>
          <TextField
            fullWidth
            label="Nome"
            name="nome"
            value={newProduct.nome}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descrição"
            name="descricao"
            value={newProduct.descricao}
            onChange={handleChange}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoria</InputLabel>
            <Select
              name="categoria"
              value={newProduct.categoria}
              onChange={handleSelectChange}
            >
              <MenuItem value="Tecnologia">Tecnologia</MenuItem>
              <MenuItem value="Moda">Moda</MenuItem>
              <MenuItem value="Alimentos">Alimentos</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Preço"
            name="preco"
            value={newProduct.preco}
            onChange={handleChange}
            margin="normal"
            type="number"
          />
          <TextField
            fullWidth
            label="Localização"
            name="localizacao"
            value={newProduct.localizacao}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Quantidade"
            name="quantidade"
            value={newProduct.quantidade}
            onChange={handleChange}
            margin="normal"
            type="number"
          />
          <TextField
            fullWidth
            type="file"
            inputProps={{ multiple: true }} // Permitir múltiplos arquivos
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                setNewProduct((prev) => ({ ...prev, images: files }));
              }
            }}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCreateProduct}
            sx={{ mt: 2 }}
          >
            Salvar Produto
          </Button>
        </Box>
      </Modal>

      <Box
        display="flex"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
      >
        <Box gap={1} display="flex" flexShrink={0} sx={{ my: 1 }}>
          <ProductFilters
            canReset={canReset}
            filters={filters}
            onSetFilters={handleSetFilters}
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
            onResetFilter={() => setFilters(defaultFilters)}
            options={{
              genders: GENDER_OPTIONS,
              categories: CATEGORY_OPTIONS,
              ratings: RATING_OPTIONS,
              price: PRICE_OPTIONS,
              colors: COLOR_OPTIONS,
            }}
          />

          <ProductSort
            sortBy={sortBy}
            onSort={handleSort}
            options={[
              { value: 'featured', label: 'Featured' },
              { value: 'newest', label: 'Newest' },
              { value: 'priceDesc', label: 'Price: High-Low' },
              { value: 'priceAsc', label: 'Price: Low-High' },
            ]}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
            Loading products...
          </Typography>
        ) : products?.length === 0 ? (
          <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
            No products found for the selected filters.
          </Typography>
        ) : (
          products?.map((product) => (
            <Grid key={product.id} xs={12} sm={6} md={3}>
              <ProductItem product={product} />
            </Grid>
          ))
        )}
      </Grid>

      <Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} />
    </DashboardContent>
  );
}
