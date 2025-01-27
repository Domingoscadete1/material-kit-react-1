import React, { useState } from 'react';
import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export type PostItemProps = {
  id: number;
  quantidade:number;
  nome: string;
  preco: number;
  status: string;
  descricao: string;
  created_at:Date;
  localizacao: string;
  imagens: { id: number; imagem: string }[];
  precoVenda: number | null;
  categoria: { nome: string }; // Adicionando categoria
  usuario:{
    nome:string;
    foto:string;
  }
};

export function PostItem({
  sx,
  post,
  latestPost,
  latestPostLarge,
  ...other
}: CardProps & {
  post: PostItemProps;
  latestPost: boolean;
  latestPostLarge: boolean;
}) {

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const renderAvatar = (
    <Avatar
      alt={post.usuario.nome}
      src={`http://localhost:8000${post.usuario.foto}`}
      sx={{
        left: 24,
        zIndex: 9,
        bottom: -24,
        position: 'absolute',
        ...((latestPostLarge || latestPost) && {
          top: 24,
        }),
      }}
    />
  );

  const renderTitle = (
    <Link
      color="inherit"
      variant="subtitle2"
      underline="hover"
      onClick={handleOpen}
      sx={{
        height: 44,
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        ...(latestPostLarge && { typography: 'h5', height: 60 }),
        ...((latestPostLarge || latestPost) && {
          color: 'common.white',
        }),
      }}
    >
      {post.nome}
    </Link>
  );

  const renderInfo = (
    <Box
      gap={1.5}
      display="flex"
      flexWrap="wrap"
      justifyContent="flex-end"
      sx={{
        mt: 3,
        color: 'text.disabled',
      }}
    >
      {[
        { number: post.quantidade, icon: 'solar:chat-round-dots-bold' },
        { number: post.quantidade, icon: 'solar:eye-bold' },
        { number: post.quantidade, icon: 'solar:share-bold' },
      ].map((info, _index) => (
        <Box
          key={_index}
          display="flex"
          sx={{
            ...((latestPostLarge || latestPost) && {
              opacity: 0.64,
              color: 'common.white',
            }),
          }}
        >
          <Iconify width={16} icon={info.icon} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{fShortenNumber(info.number)}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderCover = (
    <Box
      component="img"
      alt={post.nome}
      src={`http://localhost:8000${post.imagens[0].imagem}`}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...((latestPostLarge || latestPost) && {
          opacity: 0.48,
          color: 'common.white',
        }),
      }}
    >
      {fDate(post.created_at)}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      width={88}
      height={36}
      src="/assets/icons/shape-avatar.svg"
      sx={{
        left: 0,
        zIndex: 9,
        bottom: -16,
        position: 'absolute',
        color: 'background.paper',
        ...((latestPostLarge || latestPost) && { display: 'none' }),
      }}
    />
  );

  return (
    <>
    <Card sx={sx} {...other}>
      <Box
        sx={(theme) => ({
          position: 'relative',
          pt: 'calc(100% * 3 / 4)',
          ...((latestPostLarge || latestPost) && {
            pt: 'calc(100% * 4 / 3)',
            '&:after': {
              top: 0,
              content: "''",
              width: '100%',
              height: '100%',
              position: 'absolute',
              bgcolor: varAlpha(theme.palette.grey['900Channel'], 0.72),
            },
          }),
          ...(latestPostLarge && {
            pt: {
              xs: 'calc(100% * 4 / 3)',
              sm: 'calc(100% * 3 / 4.66)',
            },
          }),
        })}
      >
        {renderShape}
        {renderAvatar}
        {renderCover}
      </Box>

      <Box
        sx={(theme) => ({
          p: theme.spacing(6, 3, 3, 3),
          ...((latestPostLarge || latestPost) && {
            width: 1,
            bottom: 0,
            position: 'absolute',
          }),
        })}
      >
        {renderDate}
        {renderTitle}
        {renderInfo}
      </Box>
    </Card>
    <Modal open={open} onClose={handleClose}>
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
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <Iconify icon="mdi:close" width={24} />
      </IconButton>

      <Typography variant="h5" sx={{ mb: 2 }}>
        {post.nome}
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {post.descricao}
      </Typography>

      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2 }}>
        Preço: {post.preco.toFixed(2)} KZ
      </Typography>

      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
        Categoria: {post.categoria.nome}
      </Typography>

      {/* GALERIA DE IMAGENS */}
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
        }}
      >
        {post.imagens.map((img) => (
          <Box
            key={img.id}
            component="img"
            src={`http://localhost:8000${img.imagem}`}
            alt={post.nome}
            sx={{ width: 120, height: 120, borderRadius: 1, objectFit: 'cover' }}
          />
        ))}
      </Box>
    </Box>
  </Modal>
  </>
  );
}
