import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';

import { DashboardContent } from 'src/layouts/dashboard';

import React,{ useState, useEffect, useRef } from 'react';
import axios from 'axios';


// ----------------------------------------------------------------------

export function PerfilView() {
  const [empresaId, setEmpresaId] = React.useState<string | null>(null);
  const empresa = JSON.parse(localStorage.getItem('userData') || '{}'); // Parse para garantir que seja um objeto

  const [loadingMessages, setLoadingMessages] = useState(false); // Estado de carregamento das mensagens
  const socketRef = useRef<WebSocket | null>(null);

  // Recupera o ID da empresa do localStorage
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
  return (
    <DashboardContent>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Perfil do Usuário
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
            {/* Profile Picture */}
            <Avatar
              src={`http://localhost:8000${empresa.foto}`}
              alt="Profile"
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {empresa.usuario_username}
            </Typography>
            {/* <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Saldo empresa:{empresa.empresa.saldo}
            </Typography> */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Cargo: {empresa.role}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Email: {empresa.email}
            </Typography>
            {/* SMS Activation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2">Ativar alertas por SMS</Typography>
              <Switch defaultChecked />
            </Box>
            {/* Save Button */}
            <Button variant="contained" color="primary" fullWidth disabled>
              Salvar Alterações
            </Button>
          </Paper>
        </Grid>

        {/* Account and Bills Section */}
        <Grid xs={12} md={8}>
          <Paper elevation={4} sx={{ p: 4 }}>
            {/* Accounts Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Minhas Contas xPay
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Conta Ativa
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    xxxx-xxxx-4245
                  </Typography>
                </Box>
                <Button variant="contained" color="error">
                  Bloquear Conta
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Conta Bloqueada
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    xxxx-xxxx-1234
                  </Typography>
                </Box>
                <Button variant="contained" color="success">
                  Desbloquear Conta
                </Button>
              </Box>
            </Box>

            {/* Bills Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Minhas Faturas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Conta de telefone', status: 'Pago', color: 'green' },
                { label: 'Conta de internet', status: 'Não pago', color: 'red' },
                { label: 'Aluguel da casa', status: 'Pago', color: 'green' },
                { label: 'Imposto de renda', status: 'Não pago', color: 'red' },
              ].map((bill, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{bill.label}</Typography>
                  <Typography variant="body2" sx={{ color: bill.color }}>
                    {bill.status}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
