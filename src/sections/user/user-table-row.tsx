import React, { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import axios from 'axios';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  role: string;
  status: string;
  company: string;
  avatarUrl: string;
  isVerified: boolean;
};
type PostoProps = {
  id: string;
  nome: string;
  avatarUrl: string;
  capacidade: string;
  horario: string;
  status: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
};

export function UserTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const baseUrl = "https://747e-105-168-86-161.ngrok-free.app/";
  const [loading, setLoading] = useState(true);
  const [postos, setPostos] = useState<PostoProps[]>([]); // Armazenar produtos da API
  const [postoAtual, setPostoAtual] = useState<PostoProps | null>(null);

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, posto: PostoProps) => {
      setOpenPopover(event.currentTarget);
      setPostoAtual(posto); // Armazena o posto selecionado
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
    setPostoAtual(null);
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
  }, []);

  const fetchPostos = useCallback(async () => {
    if (!empresaId) {
      console.error('ID da empresa não definido.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/postos/empresa/${empresaId}/`);
      console.log('Postos recebidos:', response.data.postos);

      // Filtra duplicados com base no ID do posto
      const uniquePostos = response.data.postos.filter(
        (posto: PostoProps) => !postos.some((existingPosto) => existingPosto.id === posto.id)
      );

      setPostos((prevPostos) => [...prevPostos, ...uniquePostos]);
    } catch (error) {
      console.error('Erro ao buscar postos:', error);
    } finally {
      setLoading(false);
    }
  }, [empresaId, postos]);

  useEffect(() => {
    if (empresaId) {
      fetchPostos();
    }
  }, [empresaId, fetchPostos]);

  const handleAtivarPosto = async () => {
    if (!postoAtual) return;
    try {
      const response = await fetch(`${baseUrl}api/empresa-posto/disponivel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa_id: empresaId,
          posto_id: postoAtual.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      alert('Posto ativado com sucesso!');
      fetchPostos();
      handleClosePopover();
    } catch (error) {
      console.error('Erro ao ativar o posto:', error);
      alert('Erro ao ativar o posto.');
    }
  };

  const handleDesativarPosto = async () => {
    if (!postoAtual) return;
    try {
      const response = await fetch(`${baseUrl}api/empresa-posto/indisponivel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa_id: empresaId,
          posto_id: postoAtual.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      alert('Posto desativado com sucesso!');
      fetchPostos();
      handleClosePopover();
    } catch (error) {
      console.error('Erro ao desativar o posto:', error);
      alert('Erro ao desativar o posto.');
    }
  };

  return (
    <>
      {postos.map((posto) => (
        <TableRow hover tabIndex={-1} role="checkbox" selected={selected} key={posto.id}>
          <TableCell padding="checkbox">
            <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
          </TableCell>

          <TableCell component="th" scope="row">
            <Box gap={2} display="flex" alignItems="center">
              <Avatar alt={posto.nome} src={`http://localhost:8000${posto.avatarUrl}`} />
              {posto.nome}
            </Box>
          </TableCell>

          <TableCell>{posto.capacidade}</TableCell>

          <TableCell>{posto.horario}</TableCell>

          <TableCell align="center">
            {posto.status === 'ativo' ? (
              <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
            ) : (
              '-'
            )}
          </TableCell>

          <TableCell>
            <Label color={(posto.status === 'inativo' && 'error') || 'success'}>{posto.status}</Label>
          </TableCell>

          <TableCell align="right">
            <IconButton onClick={(e) => handleOpenPopover(e, posto)}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleAtivarPosto}>
            <Iconify icon="solar:pen-bold" />
            Ativar
          </MenuItem>

          <MenuItem onClick={handleDesativarPosto} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Desativar
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
