import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import { TextField } from '@mui/material';

import { _posts } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { PostItem } from '../post-item';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';
import { fetchWithToken } from '../../../../authService';
import Config from '../../../../Config';


// ----------------------------------------------------------------------
const API_BASE_URL = Config.getApiUrl();

export function BlogView() {
  const [sortBy, setSortBy] = useState('latest');
  const [empresaId, setEmpresaId] = React.useState<string | null>(null);
  const empresa = JSON.parse(localStorage.getItem('userData') || '{}');
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, totalPages: 1 });
  const [searchParams, setSearchParams] = useState({
    produto_nome_search: '',
    categoria_id: '',
    preco_minimo: '',
    preco_maximo: '',
    condicao: '',
    data: ''
  });


  const navigate = useNavigate();

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

      setAnuncios(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  // Recupera o ID da empresa do localStorage
  useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const postoId = userData.empresa.id;
      console.log(postoId);
      if (postoId) {
        setEmpresaId(postoId);
      }
    }
  }, []);
  const fetchCategorias = async () => {
    try {
      const url = `api/categorias/`;
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
      console.log("categorias:", data);


      setCategorias(data);

    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };


  useEffect(() => {
    fetchCategorias();

    fetchAnuncios();
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }
    try {
      setLoading(true);
      const response = await fetchWithToken(`api/produtos-search/bussiness/${empresaId}/?page=${pagination.pageIndex + 1}`, {
        method: 'GET',
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });
      const data = await response.json();
      console.log('Produtos recebidos:', data.results);

      setProducts(data.results || []);
      setFilteredProducts(data.results || []);
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

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % anuncios.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [anuncios?.length]);

  const handleVerDetalhes = (anuncioId: string) => {
    navigate(`/detalhes/${anuncioId}`);
  };
  const filterProductsByCategory = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      const filtered = products.filter(product => product.categoria.nome === category);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };
  const fetchProductsWithFilters = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }

    try {
      setLoading(true);

      // Construir query string com os parâmetros de busca
      const queryParams = new URLSearchParams();

      if (searchParams.produto_nome_search) {
        queryParams.append('produto_nome_search', searchParams.produto_nome_search);
      }

      if (searchParams.categoria_id) {
        queryParams.append('categoria_id', searchParams.categoria_id);
      }

      if (searchParams.preco_minimo) {
        queryParams.append('preco_minimo', searchParams.preco_minimo);
      }

      if (searchParams.preco_maximo) {
        queryParams.append('preco_maximo', searchParams.preco_maximo);
      }

      if (searchParams.condicao) {
        queryParams.append('condicao', searchParams.condicao);
      }

      if (searchParams.data) {
        queryParams.append('data', searchParams.data);
      }

      queryParams.append('page', (pagination.pageIndex + 1).toString());

      const url = `api/produtos-search/bussiness/${empresaId}/?${queryParams.toString()}`;

      const response = await fetchWithToken(url, {
        method: 'GET',
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await response.json();
      console.log('Produtos filtrados recebidos:', data.results);

      setProducts(data.results || []);
      setFilteredProducts(data.results || []);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(data.count / prev.pageSize),
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos filtrados:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId, searchParams, pagination.pageIndex]);

  useEffect(() => {
    if (empresaId) {
      fetchProductsWithFilters();
    }
  }, [empresaId, fetchProductsWithFilters]);

  const inputRefs = {
    produto_nome_search: useRef<HTMLInputElement>(null),
    categoria_id: useRef<HTMLSelectElement>(null),
    preco_minimo: useRef<HTMLInputElement>(null),
    preco_maximo: useRef<HTMLInputElement>(null),
    condicao: useRef<HTMLSelectElement>(null),
    data: useRef<HTMLSelectElement>(null)
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'categoria_id' || name === 'condicao' || name === 'data') {
      setTimeout(() => {
        if (inputRefs[name].current) {
          inputRefs[name].current?.focus();
        }
      }, 0);
    }
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    fetchProductsWithFilters();
  };

  const clearFilters = () => {
    setSearchParams({
      produto_nome_search: '',
      categoria_id: '',
      preco_minimo: '',
      preco_maximo: '',
      condicao: '',
      data: ''
    });
    setSelectedCategory(null);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" flexGrow={1}>
          Explore
        </Typography>
      </Box>

      <Box sx={{ mb: 2, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filtrar Produtos</Typography>

        <Grid container spacing={2}>
          <Grid md={4}>
            <TextField
              fullWidth
              label="Nome do Produto"
              name="produto_nome_search"
              value={searchParams.produto_nome_search || ''}
              onChange={handleSearchChange}
              inputRef={inputRefs.produto_nome_search}
            />
          </Grid>

          <Grid md={2}>
            <TextField
              fullWidth
              select
              label="Categoria"
              name="categoria_id"
              value={searchParams.categoria_id || ''}
              onChange={handleSearchChange}
              inputRef={inputRefs.categoria_id}
            >
              <option value="">Todas</option>
              {categorias.map((categoria: any) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid sm={6} md={2}>
            <TextField
              fullWidth
              label="Preço Mínimo"
              name="preco_minimo"
              type="number"
              value={searchParams.preco_minimo || ''}
              onChange={handleSearchChange}
              inputRef={inputRefs.preco_minimo}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          <Grid sm={6} md={2}>
            <TextField
              fullWidth
              label="Preço Máximo"
              name="preco_maximo"
              type="number"
              value={searchParams.preco_maximo || ''}
              onChange={handleSearchChange}
              inputRef={inputRefs.preco_maximo}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          <Grid sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Condição"
              name="condicao"
              value={searchParams.condicao || ''}
              onChange={handleSearchChange}
              inputRef={inputRefs.condicao}
            >
              <option value="">Todas</option>
              <option value="novo">Novo</option>
              <option value="usado">Usado</option>
            </TextField>
          </Grid>

          <Grid sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Ordenar por Data"
              name="data"
              value={searchParams.data || ''}
              onChange={handleSearchChange}
              inputRef={inputRefs.data}
            >
              <option value="">Padrão</option>
              <option value="recente">Mais Recente</option>
              <option value="antigo">Mais Antigo</option>
            </TextField>
          </Grid>

          <Grid sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{ minWidth: 120 }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              sx={{ minWidth: 120 }}
            >
              Aplicar Filtros
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3, borderRadius: 1, overflow: 'hidden', position: 'relative', width: '100%', height: '400px' }}>
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

      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Categorias</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {categorias.map((categoria: any, index) => (
            <Button
              key={index}
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: '20px',
                borderColor: selectedCategory === categoria.nome ? 'primary.main' : 'grey.500',
                color: selectedCategory === categoria.nome ? 'white' : 'primary.main',
                backgroundColor: selectedCategory === categoria.nome ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
              onClick={() => filterProductsByCategory(categoria.nome)}
            >
              {categoria.nome}
            </Button>
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => {
              const latestPostLarge = index === 0;
              const latestPost = index === 1 || index === 2;

              return (
                <Grid key={product.id} xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
                  <PostItem post={product} latestPost={latestPost} latestPostLarge={latestPostLarge} />
                </Grid>
              );
            })
          ) : (
            <Typography variant="h6" align="center" sx={{ width: '100%', mt: 4 }}>
              Nenhum produto encontrado.
            </Typography>
          )}
        </Grid>
      )}

      <Box display='flex' padding={2} >
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
      </Box>

    </DashboardContent>
  );
}