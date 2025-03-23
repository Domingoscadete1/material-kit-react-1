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
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

import Config from '../Config';
import { ProductItem } from '../product-item';
import { ProductSort } from '../product-sort';
import { CartIcon } from '../product-cart-widget';
import { ProductFilters } from '../product-filters';
import type { FiltersProps } from '../product-filters';

import 'leaflet/dist/leaflet.css';

// ----------------------------------------------------------------------

const API_BASE_URL = "https://dce9-154-71-159-172.ngrok-free.app";

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
  const baseUrl = "https://dce9-154-71-159-172.ngrok-free.app";
  const [openModal, setOpenModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]); // Armazenar categorias da API
  const token2 = localStorage.getItem('refreshToken'); // Token salvo ao logar
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [openMapModal, setOpenMapModal] = useState(false);
  const [anuncios, setAnuncios] = useState([]);

  const [newProduct, setNewProduct] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    condicao: 'Novo',
    preco: '',
    localizacao: '',
    quantidade: 1,
    images: [] as File[], // Para permitir múltiplas imagens
    videos: [] as File[],

  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 4,
    totalPages: 1,
  });
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });

    return location ? (
      <Marker position={[location.lat, location.lng]} icon={L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })} />
    ) : null;
  }
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }, []);



  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setNewProduct((prev) => ({ ...prev, localizacao: `${latitude}, ${longitude}` }));
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
    }
  };


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
      const postoId = userData.empresa.id;
      if (postoId) {
        setEmpresaId(postoId);
      }
    }
  }, []); // Mantenha vazio se `empresaId` não mudar
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('https://dce9-154-71-159-172.ngrok-free.app/api/categorias/', {
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      }); // Substitua pela URL da API
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);
  const fetchAnuncios = async () => {
    try {
      const url = `${API_BASE_URL}/api/anuncios-app/`;
      const response = await fetch(url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      console.log("Anuncios carregados:", data);

      
      setAnuncios(data);

    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };


  useEffect(() => {
    fetchCategories();
    fetchAnuncios();
    if (empresaId) {
      console.log(empresaId);
    }
  }, [empresaId, fetchCategories]); // Adicione empresaId como dependência

  const fetchProducts = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`https://dce9-154-71-159-172.ngrok-free.app/api/produtos/empresa/${empresaId}/?page=${pagination.pageIndex + 1}`, {
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });
      console.log('Produtos recebidos:', response.data);

      setProducts(response.data.results);
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(response.data.count / prev.pageSize),
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId, pagination.pageIndex]);



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
    // Adicionar até 5 vídeos ao FormData
    newProduct.videos.slice(0, 5).forEach((video, index) => {
      formData.append(`video${index + 1}`, video);
    });

    try {
      const response = await axios.post(`https://dce9-154-71-159-172.ngrok-free.app/api/produto/create/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok


        },
      });
      console.log('Produto criado com sucesso:', response.data);
      setOpenModal(false);
      window.location.reload();
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
  const handleOpenMapModal = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setOpenMapModal(true);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setOpenMapModal(true);
        }
      );
    } else {
      setOpenMapModal(true);
    }
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7o1UqwTqFhZnCHiL_ImyZSCgEgtFvVZoAqRJWs14MSm9w8zINDOEGUO9jvG6HLrmZajOP4asLgwAfX2sz6uvVEa38ELhPsmHdtEUQVNro3PrMlUlqjN65CWzzSmeBtWxHmjs3gGORwcaGRSB8ktJbbJ63bGusEOf7ibX6ttketOLEetfRyzbipr_HHg/s3840/Spirited%20Away%20Studio%20Ghibli%204K%20PC%20Desktop%20Wallpaper.png',
    'https://www.chromethemer.com/download/hd-wallpapers/minimalist-spiderman-3840x2160.jpg',
    'https://wallpapercat.com/w/full/b/8/f/6645-3840x2160-desktop-4k-assassins-creed-background-photo.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % anuncios.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [anuncios.length]);

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Produtos
      </Typography>

      <Box sx={{ mb: 5, borderRadius: 1, overflow: 'hidden', position: 'relative', width: '100%', height: '300px' }}>
        {anuncios.map((image:any, index) => (
          <Box
            key={index}
            component="img"
            src={image.imagem1}
            alt={`Imagem ${index + 1}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
            }}
          />
        ))}

        {/* Botões de navegação */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
          }}
        >
          {anuncios.map((imagem:any, index) => (
            <Button
              key={index}
              sx={{
                minWidth: '10px',
                height: '10px',
                padding: 0,
                borderRadius: '50%',
                backgroundColor: index === currentImageIndex ? 'primary.main' : 'grey.500',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
              onClick={() => setCurrentImageIndex(imagem.imagem1)}
            />
          ))}
        </Box>
      </Box>

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
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.nome}>
                  {category.nome}
                </MenuItem>
              ))}
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
          <Button variant="outlined" onClick={handleGetCurrentLocation} sx={{ mt: 1, mr: 1 }}>
            Usar Minha Localização
          </Button>

          <Button variant="outlined" onClick={handleOpenMapModal} sx={{ mt: 1 }}>
            Escolher no Mapa
          </Button>
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
          <TextField
            fullWidth
            type="file"
            inputProps={{ multiple: true, accept: 'video/*' }} // Permitir múltiplos vídeos
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                setNewProduct((prev) => ({ ...prev, videos: files }));
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


      <Modal open={openMapModal} onClose={() => setOpenMapModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6">Escolha a Localização</Typography>
          <MapContainer center={location} zoom={13} style={{ height: '300px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
          <Button variant="contained" onClick={() => {
            setNewProduct((prev) => ({
              ...prev,
              localizacao: `${location.lat}, ${location.lng}`,
            }));
            setOpenMapModal(false);
          }} sx={{ mt: 2 }}>
            Confirmar Localização
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

      <Pagination count={pagination.totalPages} color="primary" sx={{ mt: 8, mx: 'auto' }} />

      <Button
        className="px-4 py-2 text-sm font-medium text-white bg-brand-900 rounded-[20px] hover:bg-brand-800 flex items-center justify-center"
        onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
        disabled={pagination.pageIndex === 0}
      >
        Anterior
      </Button>
      <Button
        className="px-4 py-2 text-sm font-medium text-white bg-brand-900 rounded-[20px] hover:bg-brand-800 flex items-center justify-center"
        onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
        disabled={pagination.pageIndex + 1 >= pagination.totalPages}
      >
        Próxima
      </Button>

      <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
        Página {pagination.pageIndex + 1} de {pagination.totalPages}
      </Typography>
    </DashboardContent>
  );
}
