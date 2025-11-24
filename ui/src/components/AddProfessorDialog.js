import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '../services/api';

function AddProfessorDialog({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, insira um email válido');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Registrar novo professor (roleId = 1)
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        roleId: 1, // Professor
      });

      onSuccess(`Professor ${formData.name} cadastrado com sucesso!`);
      handleClose();
      
    } catch (err) {
      console.error('Erro ao cadastrar professor:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Email já está em uso ou dados inválidos.');
      } else if (err.response?.status === 409) {
        setError('Email já está cadastrado.');
      } else {
        setError('Erro ao cadastrar professor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
    });
    setShowPassword(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <PersonAdd sx={{ fontSize: 48, color: '#697E50', mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          Adicionar Professor
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cadastre um novo professor no sistema
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Nome Completo *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              autoFocus
              disabled={loading}
              placeholder="Ex: João Silva"
            />
            
            <TextField
              label="Email *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              placeholder="professor@email.com"
            />
            
            <TextField
              label="Senha *"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              placeholder="Mínimo 6 caracteres"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Tipo de usuário:</strong> Professor
              </Typography>
              <Typography variant="caption">
                Este usuário terá permissões de professor no sistema
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            sx={{ 
              px: 4,
              bgcolor: '#697E50',
              '&:hover': {
                bgcolor: '#4E653D',
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Cadastrar Professor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddProfessorDialog;