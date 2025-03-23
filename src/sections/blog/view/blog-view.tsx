import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';

import { _posts } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { PostItem } from '../post-item';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';

// ----------------------------------------------------------------------
const API_BASE_URL = "https://dce9-154-71-159-172.ngrok-free.app";

export function BlogView() {
  const [sortBy, setSortBy] = useState('latest');
  const [empresaId, setEmpresaId] = React.useState<string | null>(null);
  const empresa = JSON.parse(localStorage.getItem('userData') || '{}'); // Parse para garantir que seja um objeto
  const [products, setProducts] = useState<any[]>([]); // Armazenar produtos da API
  const [loading, setLoading] = useState(true); // Para gerenciar o estado de carregamento
  const [loadingMessages, setLoadingMessages] = useState(false); // Estado de carregamento das mensagens
  const socketRef = useRef<WebSocket | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>(['Tecnologia', 'Moda', 'Casa', 'Esportes', 'Beleza']); // Exemplo
  const navigate = useNavigate(); // Hook para navegação

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

  useEffect(() => {
    fetchAnuncios();
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`https://dce9-154-71-159-172.ngrok-free.app/api/produtos-search/bussiness/${empresaId}/`, {
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });
      console.log('Produtos recebidos:', response.data.produtos);

      setProducts(response.data.produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

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
    }, 4000); // Muda a imagem a cada 4 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [anuncios?.length]);

  // Função para redirecionar para a página de detalhes
  const handleVerDetalhes = (anuncioId: string) => {
    navigate(`/detalhes/${anuncioId}`); // Redireciona para a rota de detalhes com o ID do anúncio
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Explore
        </Typography>
      </Box>

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
          {categorias.map((categoria, index) => (
            <Button
              key={index}
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: '20px',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              {categoria}
            </Button>
          ))}
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <PostSearch posts={products} />
        <PostSort
          sortBy={sortBy}
          onSort={handleSort}
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            // { value: 'oldest', label: 'Oldest' },
          ]}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.length > 0 ? (
            products.map((product, index) => {
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

      {/* <Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} /> */}
    </DashboardContent>
  );
}