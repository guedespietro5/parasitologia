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
  Divider,
} from '@mui/material';
import { Login as LoginIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '../services/api';

function LoginDialog({ open, onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: 2, // Aluno por padrão
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
    
    if (isRegister) {
      // Validação para registro
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Por favor, preencha todos os campos');
        return;
      }
    } else {
      // Validação para login
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Por favor, preencha todos os campos');
        return;
      }
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isRegister) {
        // Registrar novo usuário
        console.log('Tentando registrar usuário:', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          roleId: formData.roleId,
        });
        
        const registerResponse = await authService.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          roleId: formData.roleId,
        });
        
        console.log('Resposta do registro:', registerResponse);

        // Após registrar, faz login automaticamente
        console.log('Fazendo login automático...');
        const loginResponse = await authService.login({
          email: formData.email.trim(),
          password: formData.password.trim(),
        });
        
        console.log('Resposta do login:', loginResponse);

        // Salva dados do usuário
        localStorage.setItem('token', loginResponse.token);
        localStorage.setItem('roleId', loginResponse.roleId);
        localStorage.setItem('userId', loginResponse.userId); // ← Salvar userId
        
        const userRole = loginResponse.roleId === 1 ? 'Professor' : 'Aluno';
        
        const userData = {
          id: loginResponse.userId, // ← Adicionar id
          email: formData.email.trim(),
          name: formData.name.trim(),
          roleId: loginResponse.roleId,
          role: userRole,
          avatar: formData.name.substring(0, 2).toUpperCase(),
          avatarColor: '#697E50',
        };

        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Usuário salvo com sucesso:', userData);
        onLogin(userData);
        handleClose();
        
      } else {
        // Login
        const response = await authService.login({
          email: formData.email.trim(),
          password: formData.password.trim(),
        });

        // Salva token, roleId e userId no localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('roleId', response.roleId);
        localStorage.setItem('userId', response.userId); // ← Salvar userId
        
        const userRole = response.roleId === 1 ? 'Professor' : 'Aluno';
        
        const userData = {
          id: response.userId, // ← Adicionar id
          email: formData.email.trim(),
          roleId: response.roleId,
          role: userRole,
          name: formData.email.split('@')[0],
          avatar: formData.email.substring(0, 2).toUpperCase(),
          avatarColor: '#697E50',
        };

        localStorage.setItem('user', JSON.stringify(userData));
        onLogin(userData);
        handleClose();
      }
      
    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Resposta do erro:', err.response);
      
      if (isRegister) {
        // Verifica se há uma mensagem específica do servidor
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.status === 400) {
          setError('Email já está em uso ou dados inválidos.');
        } else if (err.response?.status === 409) {
          setError('Email já está cadastrado.');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      } else {
        if (err.response?.status === 401) {
          setError('Email ou senha incorretos.');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
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
      roleId: 2,
    });
    setShowPassword(false);
    setError('');
    setIsRegister(false);
    onClose();
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      roleId: 2,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <LoginIcon sx={{ fontSize: 48, color: '#697E50', mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          {isRegister ? 'Criar Conta' : 'Bem-vindo ao ParasitoBlog'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {isRegister 
            ? 'Cadastre-se para começar a compartilhar conhecimentos' 
            : 'Faça login para compartilhar conhecimentos'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            {isRegister && (
              <TextField
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                autoFocus
                disabled={loading}
              />
            )}
            
            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              autoFocus={!isRegister}
              disabled={loading}
            />
            
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
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

            <Divider sx={{ my: 1 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              </Typography>
              <Button
                onClick={toggleMode}
                sx={{ 
                  color: '#697E50',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
                disabled={loading}
              >
                {isRegister ? 'Fazer Login' : 'Criar Conta'}
              </Button>
            </Box>
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
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (isRegister ? 'Cadastrar' : 'Entrar')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LoginDialog;