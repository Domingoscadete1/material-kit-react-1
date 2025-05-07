import type { IconButtonProps } from '@mui/material/IconButton';
import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import axios from 'axios';
import { fToNow } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { fetchWithToken } from '../../../authService';
import Config from '../../../Config';
// Definição do tipo de notificação
export type NotificationItemProps = {
  id: string;
  tipo: 'mensagem_nova' | 'pedido_troca_produto';
  title: string;
  lida: boolean;
  description: string;
  avatarUrl: string | null;
  postedAt: string | number | null;
  chatRoomId: string | null;
  senderName: string | null;
  onesignalPlayerId: string | null;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  deleted: boolean;
  usuario: {
    foto: string;
    nome: string;
  };
  empresa: {
    imagens: {
      imagem: string;
    };
  };
  remetente: {
    foto: string;
    nome: string;
  }
};

export type NotificationsPopoverProps = IconButtonProps & {
  data?: NotificationItemProps[];
};

export function NotificationsPopover({ data = [], sx, ...other }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState(data);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      setEmpresaId(userData.empresa.id || null);
    }
  }, []);

  useEffect(() => {
    if (!empresaId) return;
    const fetchNotifications = async () => {
      try {
        const response = await fetchWithToken(`api/notificacoes/empresa-list/${empresaId}/?page=${pagination.pageIndex + 1}`, {
          method: 'GET',
          headers: {
            "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
          },
        });
        // Pegando os dados corretamente
        const data1 = await response.json();
        console.log(data1)
        const notificacoes = data1.results || [];
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(data1.count / prev.pageSize),
        }));
        console.log('notificações', notificacoes);

        const formattedNotifications: NotificationItemProps[] = notificacoes.map((notificacao: any) => ({
          id: notificacao.id,
          tipo: notificacao.tipo,
          title: notificacao.mensagem,
          isUnRead: !notificacao.lida,
          description: notificacao.mensagem,
          avatarUrl: notificacao.remetente?.foto || null,
          postedAt: notificacao.criado_em,
          chatRoomId: notificacao.chat_room || null,
          senderName: notificacao.remetente?.nome || "Desconhecido",
          onesignalPlayerId: notificacao.onesignal_player_id || null,
          sentAt: notificacao.enviado_em || null,
          readAt: notificacao.lida_em || null,
          createdAt: notificacao.created_at,
          updatedAt: notificacao.updated_at || null,
          deleted: notificacao.deleted || false,
        }));

        console.log('Notificações formatadas:', formattedNotifications);

        setNotifications(formattedNotifications);

      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [empresaId, pagination.pageIndex]);

  const totalUnRead = notifications.filter((item) => !item.lida).length;

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, lida: true })));
  }, []);

  return (
    <>
      <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover} sx={sx} {...other}>
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { width: 360, overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ py: 2, pl: 1.5, pr: 1.5 }}>
          <Typography variant="subtitle1">Notificações</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {totalUnRead} mensagens não lidas
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
          <List disablePadding>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

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

      </Popover>
    </>
  );
}

function NotificationItem({ notification }: { notification: NotificationItemProps }) {
  const { title } = renderContent(notification);

  const avatarUrl = 'snsn'

  return (
    <ListItemButton sx={{ py: 1.5, px: 2.5, mt: '1px', bgcolor: notification.lida ? 'transparent' : 'action.selected' }}>
      <ListItemAvatar>
        <Avatar src={`${Config.getApiUrlMedia()}/static/DD3-removebg-preview.png`} sx={{ bgcolor: 'background.neutral' }} />
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(notification.postedAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

function renderContent(notification: NotificationItemProps) {
  return {
    avatarUrl: notification.avatarUrl,
    title: (
      <Typography variant="subtitle2">
        {notification.senderName} <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}> {notification.description}</Typography>
      </Typography>
    ),
  };
}
