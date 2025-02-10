import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Box, Button, Typography, MenuItem, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';

type AddFuncionarioModalProps = {
  open: boolean;
  onClose: () => void;
};
const AddFuncionarioModal: React.FC<AddFuncionarioModalProps> = ({ open, onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('funcionario');
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFoto(event.target.files[0]);
    }
  };
  const handleAddFuncionario = async () => {
    const token = localStorage.getItem('userData');
    if (!token) {
      alert('Usuário não autenticado.');
      return;
    }

    const userData = JSON.parse(token);
    const empresaId = userData.empresa.id;

    if (!username || !email || !senha) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('empresa_id', empresaId);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('senha', senha);
      formData.append('role', role);
      if (foto) {
        formData.append('foto', foto);
      }

      await axios.post('http://localhost:8000/api/empresa-user-add/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Funcionário adicionado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      alert(error.response?.data?.detail || 'Ocorreu um erro ao adicionar o funcionário.');
    } finally {
      setLoading(false);
    }
  };

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
          Adicionar Funcionário
        </Typography>

        <TextField
          fullWidth
          label="Nome de Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          type="password"
          label="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          select
          label="Cargo"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          sx={{ mt: 2 }}
        >
          <MenuItem value="funcionario">Funcionário</MenuItem>
          <MenuItem value="gerente">Gerente</MenuItem>
          <MenuItem value="admin">Administrador</MenuItem>
        </TextField>
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginTop: 16 }} />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleAddFuncionario} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Adicionar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddFuncionarioModal;
