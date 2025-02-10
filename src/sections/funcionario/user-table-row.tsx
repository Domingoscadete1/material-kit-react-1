import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  imagem: string;
}

type PostoProps = {
  id: number;
  empresa: {
    id: number;
    nome: string;
  };
  posto: Posto;
  indisponivel: boolean;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
};

type FuncionarioProps = {
  id: number;
  username: string;
  email: string;
  role: string;
  deleted: boolean;
  usuario_username: string;
  foto: string;
};

export function UserTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const baseUrl = "http://127.0.0.1:8000/";
  const [loading, setLoading] = useState(true);
  const [postos, setPostos] = useState<PostoProps[]>([]);
  const [postoAtual, setPostoAtual] = useState<PostoProps | null>(null);
  const [funcionarios, setFuncionarios] = useState<FuncionarioProps[]>([]);
  const [funcionarioAtual, setFuncionarioAtual] = useState<FuncionarioProps | null>(null);
  const [isFetched, setIsFetched] = useState(false);
  const hasFetched = useRef(false); // Rastreia se a função já foi chamada

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, posto: PostoProps) => {
      setOpenPopover(event.currentTarget);
      setPostoAtual(posto);
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
      const postoId = userData.empresa.id;
      if (postoId) {
        setEmpresaId(postoId);
      }
    }
  }, []);

  const fetchFuncionarios = useCallback(async () => {
    if (!empresaId) return;

    try {
      setLoading(true);
      console.log("Chamando fetchFuncionarios()");

      const response = await axios.get(`${baseUrl}api/empresa/funcionarios/${empresaId}/`);
      console.log("Funcionários recebidos:", response.data.funcionarios);

      // Substitui a lista de funcionários pelos novos dados
      setFuncionarios(response.data.funcionarios);

      setIsFetched(true);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    if (empresaId && !hasFetched.current) {
      hasFetched.current = true;
      fetchFuncionarios();
    }
  }, [empresaId, fetchFuncionarios]);

  return (
    <>
      {funcionarios.map((funcionario) => (
        <TableRow hover tabIndex={-1} role="checkbox" key={funcionario.id}>
          <TableCell padding="checkbox">
            <Checkbox disableRipple />
          </TableCell>

          <TableCell component="th" scope="row">
            <Box gap={2} display="flex" alignItems="center">
              <Avatar src={`http://127.0.0.1:8000${funcionario.foto}`} />
              {funcionario.usuario_username}
            </Box>
          </TableCell>

          <TableCell>{funcionario.email}</TableCell>
          <TableCell>{funcionario.role}</TableCell>

          <TableCell align="center">
            {funcionario.deleted ? (
              <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
            ) : (
              '-'
            )}
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
          <MenuItem>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          <MenuItem sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Remover
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}