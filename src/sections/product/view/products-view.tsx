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
  SelectChangeEvent,
  IconButton,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

import { _products } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

import CircularProgress from '@mui/material/CircularProgress';

import { ProductItem } from '../product-item';
import { ProductSort } from '../product-sort';
import { CartIcon } from '../product-cart-widget';
import { ProductFilters } from '../product-filters';
import type { FiltersProps } from '../product-filters';
import { fetchWithToken } from '../../../../authService';
import Config from '../../../../Config';

import 'leaflet/dist/leaflet.css';

// ----------------------------------------------------------------------

const API_BASE_URL = Config.getApiUrl();

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
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(false);
  const [empresaId, setEmpresaId] = React.useState<string | null>(null);
  const baseUrl = Config.getApiUrl();
  const [openModal, setOpenModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const token2 = localStorage.getItem('refreshToken');
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
    images: [] as File[],
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
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetchWithToken('api/categorias/', {
        method: 'GET',
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);

  const fetchAnuncios = async () => {
    try {
      const url = `api/anuncios-app/`;
      const response = await fetchWithToken(url, {
        method: 'GET',
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
  }, [empresaId, fetchCategories]);

  const fetchProducts = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }
    try {
      setLoading(true);
      const response = await fetchWithToken(`api/produtos/empresa/${empresaId}/?page=${pagination.pageIndex + 1}`, {
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });
      const data = await response.json();

      console.log('Produtos recebidos:', data);

      setProducts(data.results);
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(data.count / prev.pageSize),
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

    newProduct.images.slice(0, 5).forEach((image, index) => {
      formData.append(`imagem${index + 1}`, image);
    });

    newProduct.videos.slice(0, 5).forEach((video, index) => {
      formData.append(`video${index + 1}`, video);
    });

    try {
      setLoading(true);

      const response = await fetchWithToken(`api/produto/create/`, {
        method: 'POST',
        headers: {
          "ngrok-skip-browser-warning": "true",

        },
        body: formData,
      });
      const data = await response.json();

      console.log('Produto criado com sucesso:', data);
      setOpenModal(false);
      setLoading(false);
      window.location.reload();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      setLoading(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % anuncios.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [anuncios.length]);

  const handleVerDetalhes = (anuncioId: string) => {
    navigate(`/detalhes/${anuncioId}`);
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Produtos
      </Typography>

      <Box sx={{ mb: 5, borderRadius: 1, overflow: 'hidden', position: 'relative', width: '100%', height: '300px' }}>
        {anuncios.map((anuncio: any, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
            }}
          >
            <Box
              component="img"
              src={anuncio?.imagem1}
              alt={`Imagem ${index + 1}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                color: 'white',
                padding: '16px',
                textAlign: 'left',
              }}
            >
              <Typography variant="h6" sx={{ mt: 1 }}>{anuncio?.descricao}</Typography>
              <Typography variant="body2">{anuncio?.desconto}</Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => handleVerDetalhes(anuncio.id)}
              >
                Ver Detalhes
              </Button>
            </Box>
          </Box>
        ))}

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
          {anuncios.map((_, index) => (
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
              onClick={() => setCurrentImageIndex(index)}
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

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90vw', sm: '80vw', md: '70vw', lg: '1000px' },
            maxWidth: '1000px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: 1,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" mb={2}>
            Criar Novo Produto
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            '@media (min-width: 900px)': {
              flexDirection: 'row',
              flexWrap: 'wrap',
              '& > *': {
                width: 'calc(50% - 16px)'
              }
            }
          }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Nome"
                name="nome"
                value={newProduct.nome}
                onChange={handleChange}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Preço"
                name="preco"
                value={newProduct.preco}
                onChange={handleChange}
                margin="normal"
                type="number"
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={newProduct.descricao}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
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
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Quantidade"
                name="quantidade"
                value={newProduct.quantidade}
                onChange={handleChange}
                margin="normal"
                type="number"
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Button variant="outlined" onClick={handleGetCurrentLocation} sx={{ mt: 1 }}>
                  Usar Minha Localização
                </Button>
                <Button variant="outlined" onClick={handleOpenMapModal} sx={{ mt: 1 }}>
                  Escolher no Mapa
                </Button>
              </Box>
              <TextField
                fullWidth
                label="Localização"
                name="localizacao"
                value={newProduct.localizacao}
                onChange={handleChange}
                margin="normal"
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Imagens do Produto (Máximo 5)
            </Typography>

            {newProduct.images?.length >= 5 && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                Você atingiu o limite máximo de 5 imagens
              </Typography>
            )}

            <Button
              variant="contained"
              component="label"
              disabled={newProduct.images?.length >= 5}
              sx={{ mb: 2 }}
            >
              Selecionar Imagens
              <input
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = Array.from(e.target.files || []);
                  const currentImages = newProduct.images || [];
                  const availableSlots = 5 - currentImages.length;

                  if (files.length > 0) {
                    const newImages = files.slice(0, availableSlots);
                    setNewProduct(prev => ({
                      ...prev,
                      images: [...currentImages, ...newImages]
                    }));
                  }
                }}
              />
            </Button>

            {newProduct.images && newProduct.images.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {newProduct.images.map((file, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const updatedImages = [...newProduct.images];
                        updatedImages.splice(index, 1);
                        setNewProduct(prev => ({ ...prev, images: updatedImages }));
                      }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      x
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Vídeos do Produto (Máximo 5)
            </Typography>

            {newProduct.videos?.length >= 5 && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                Você atingiu o limite máximo de 5 vídeos
              </Typography>
            )}

            <Button
              variant="contained"
              component="label"
              disabled={newProduct.videos?.length >= 5}
              sx={{ mb: 2 }}
            >
              Selecionar Vídeos
              <input
                type="file"
                multiple
                hidden
                accept="video/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = Array.from(e.target.files || []);
                  const currentVideos = newProduct.videos || [];
                  const availableSlots = 5 - currentVideos.length;

                  if (files.length > 0) {
                    const newVideos = files.slice(0, availableSlots);
                    setNewProduct(prev => ({
                      ...prev,
                      videos: [...currentVideos, ...newVideos]
                    }));
                  }
                }}
              />
            </Button>

            {newProduct.videos && newProduct.videos.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {newProduct.videos.map((file, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <video
                      src={URL.createObjectURL(file)}
                      style={{
                        width: 150,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                      controls
                    >
                      <track
                        kind="captions"
                        src=""
                        srcLang="pt"
                        label="Legendas"
                        default
                      />
                    </video>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const updatedVideos = [...newProduct.videos];
                        updatedVideos.splice(index, 1);
                        setNewProduct(prev => ({ ...prev, videos: updatedVideos }));
                      }}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      x
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCreateProduct}
            sx={{ mt: 4 }}
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
                        width: {
                          xs: '90vw', // Para telas muito pequenas (mobile)
                          sm: '80vw', // Para telas pequenas (tablet)
                          md: '70vw', // Para telas médias
                          lg: '60vw', // Para telas grandes
                          xl: '50vw'  // Para telas extra grandes
                        },
                        height: {
                          xs: '80vh', // Para telas muito pequenas
                          sm: '70vh', // Para telas pequenas
                          md: '60vh', // Para telas médias
                          lg: '50vh', // Para telas grandes
                          xl: '40vh'  // Para telas extra grandes
                        },
                        maxWidth: 800, // Largura máxima
                        maxHeight: 600, // Altura máxima
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 2,
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column'
          }}
        >
          <Typography variant="h6">Escolha a Localização</Typography>
          <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%',position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0  }}>
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

      <Grid container spacing={3}>
        {loading ? (
          <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
            Aguarde um momento...
          </Typography>
        ) : products?.length === 0 ? (
          <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
            Sem produtos.
          </Typography>
        ) : (
          products?.map((product) => (
            <Grid key={product.id} xs={12} sm={6} md={3}>
              <ProductItem product={product} />
            </Grid>
          ))
        )}
      </Grid>

      <Button
        className="px-4 py-2 text-sm font-medium text-white bg-brand-900 rounded-[20px] hover:bg-brand-800 flex items-center justify-center"
        onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
        disabled={pagination.pageIndex === 0}
      >
        Anterior
      </Button>

      <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
        Página {pagination.pageIndex + 1} de {pagination.totalPages}
      </Typography>

      <Button
        className="px-4 py-2 text-sm font-medium text-white bg-brand-900 rounded-[20px] hover:bg-brand-800 flex items-center justify-center"
        onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
        disabled={pagination.pageIndex + 1 >= pagination.totalPages}
      >
        Próxima
      </Button>
    </DashboardContent>
  );
}
