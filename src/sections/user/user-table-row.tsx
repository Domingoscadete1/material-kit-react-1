import React, { useState, useCallback, useEffect,useRef } from 'react';

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
interface Posto {
  id: number;
  nome: string;
  capacidade: number;
  horario: string;
  status: string;
  imagem:string;
}
type PostoProps = {
  id: number;
  empresa: {
    id: number;
    nome: string;
  };
  posto: Posto;
  indisponivel:Boolean;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
};

export function UserTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const baseUrl = "https://dce9-154-71-159-172.ngrok-free.app/";
  const [loading, setLoading] = useState(true);
  const [postos, setPostos] = useState<PostoProps[]>([]); // Armazenar produtos da API
  const [postoAtual, setPostoAtual] = useState<PostoProps | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const hasFetchedRef = useRef(false);



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

  const fetchPostos = useCallback(async () => {
    if (!empresaId || hasFetchedRef.current) return;

    try {
      const response = await axios.get(`${baseUrl}api/postos/empresa/${empresaId}/`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      setPostos(response.data.postos);
      hasFetchedRef.current = true; // Marca como buscado
        console.log('Postos buscados com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar postos:', error);
    }
  }, [empresaId, baseUrl]);

  useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const empresaId2 = userData?.empresa?.id;
      if (empresaId2) setEmpresaId(empresaId2.toString());
    }
  }, []);

  useEffect(() => {
    if (empresaId && !hasFetchedRef.current) {
      fetchPostos();
    }
  }, [empresaId, fetchPostos]);
   // Removi `hasFetched` daqui
  
  const handleAtivarPosto = async () => {
    if (!postoAtual) return;
    try {
      const response = await fetch(`${baseUrl}api/empresa-posto/disponivel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok

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
      window.location.reload()
      fetchPostos();
      handleClosePopover();
    } catch (error) {
      console.error('Erro ao ativar o posto:', error);
      alert('Erro ao ativar o posto.');
      window.location.reload()
    }
  };

  const handleDesativarPosto = async () => {
    if (!postoAtual) return;
    try {
      const response = await fetch(`${baseUrl}api/empresa-posto/indisponivel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok

        },
        body: JSON.stringify({
          empresa_id: empresaId,
          posto_id: postoAtual.posto.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      alert('Posto desativado com sucesso!');
      fetchPostos();
      window.location.reload()
      handleClosePopover();
    } catch (error) {
      console.error('Erro ao desativar o posto:', error);
      alert('Erro ao desativar o posto.');
    }
  };

  return (
    <>
      {postos.map((postoAceite) => (
  <TableRow hover tabIndex={-1} role="checkbox" selected={selected} key={postoAceite.id}>
    <TableCell padding="checkbox">
      <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
    </TableCell>

    <TableCell component="th" scope="row">
      <Box gap={2} display="flex" alignItems="center">
        <Avatar
          alt={postoAceite.posto?.nome}
          src={`https://dce9-154-71-159-172.ngrok-free.app${postoAceite.posto?.imagem}`}
        />
        {postoAceite.posto?.nome}
      </Box>
    </TableCell>

    <TableCell>{postoAceite.posto?.capacidade}</TableCell>

    <TableCell>{postoAceite.posto?.horario}</TableCell>

    <TableCell align="center">
      {postoAceite.indisponivel === false ? (
        <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
      ) : (
        '-'
      )}
    </TableCell>

    <TableCell>
      <Label color={postoAceite.indisponivel === true ? 'error' : 'success'}>
        {postoAceite.posto?.status}
      </Label>
    </TableCell>

    <TableCell align="right">
      <IconButton onClick={(e) => handleOpenPopover(e,  postoAceite)}>
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
