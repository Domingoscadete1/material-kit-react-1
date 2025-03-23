import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

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
  const [anuncios, setAnuncios] = useState([]);

  const images = [
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7o1UqwTqFhZnCHiL_ImyZSCgEgtFvVZoAqRJWs14MSm9w8zINDOEGUO9jvG6HLrmZajOP4asLgwAfX2sz6uvVEa38ELhPsmHdtEUQVNro3PrMlUlqjN65CWzzSmeBtWxHmjs3gGORwcaGRSB8ktJbbJ63bGusEOf7ibX6ttketOLEetfRyzbipr_HHg/s3840/Spirited%20Away%20Studio%20Ghibli%204K%20PC%20Desktop%20Wallpaper.png',
    'https://www.chromethemer.com/download/hd-wallpapers/minimalist-spiderman-3840x2160.jpg',
    'https://wallpapercat.com/w/full/b/8/f/6645-3840x2160-desktop-4k-assassins-creed-background-photo.jpg',
  ];
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
    }, 3000); // Muda a imagem a cada 3 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [anuncios?.length]);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Explore
        </Typography>
      </Box>

      <Box sx={{ mb: 5, borderRadius: 1, overflow: 'hidden', position: 'relative', width: '100%', height: '300px' }}>
        {anuncios.map((image:any, index) => (
          <Box
            key={index}
            component="img"
            src={image?.imagem1}
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
          {images.map((_, index) => (
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