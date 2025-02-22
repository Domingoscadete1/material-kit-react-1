import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Box, Button, Typography, MenuItem, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';


type Posto = {
    id: string;
    nome: string;
};

type AddPostoModalProps = {
    open: boolean; // A propriedade 'open' é um boolean
    onClose: () => void; // A propriedade 'onClose' é uma função que não retorna nada
  };
const  AddPostoModal: React.FC<AddPostoModalProps> = ({ open, onClose }) => {
  const [postos, setPostos] = useState<Posto[]>([]);
  const [selectedPosto, setSelectedPosto] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPostos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://408e-154-71-159-172.ngrok-free.app/api/postos/',{
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });
      setPostos(response.data);
    } catch (error) {
      console.error('Erro ao buscar postos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddPosto = async () => {
    const token = localStorage.getItem('userData');
    if (!token) {
      alert('Usuário não autenticado.');
      return;
    }

    const userData = JSON.parse(token);
    const empresaId = userData.empresa.id;

    if (!selectedPosto) {
      alert('Selecione um posto.');
      return;
    }

    try {
      const response = await axios.post('https://408e-154-71-159-172.ngrok-free.app/api/empresa-posto/create/', {
        empresa_id: empresaId,
        posto_id: selectedPosto,
      },{
        headers: {
          "ngrok-skip-browser-warning": "true", // Evita bloqueios do ngrok
        },
      });

      alert('Posto adicionado com sucesso!');
      onClose(); // Fecha o modal após sucesso
    } catch (error) {
      console.error('Erro ao adicionar posto:', error);
      alert('Ocorreu um erro ao adicionar o posto.');
    }
  };

  useEffect(() => {
    if (open) {
      fetchPostos();
    }
  }, [open, fetchPostos]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Adicionar Posto
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <TextField
            fullWidth
            select
            label="Selecione um posto"
            value={selectedPosto}
            onChange={(e) => setSelectedPosto(e.target.value)}
            sx={{ mt: 2 }}
          >
            {postos.map((posto) => (
              <MenuItem key={posto.id} value={posto.id}>
                {posto.nome}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleAddPosto} variant="contained" color="primary">
            Adicionar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddPostoModal;
