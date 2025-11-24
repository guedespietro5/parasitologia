import React, { useState, useEffect } from 'react';
import './App.css';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Fab,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
  IconButton,
} from '@mui/material';
import {
  Search,
  MenuBook,
  Add,
  Person,
  VerifiedUser,
  PersonAdd,
} from '@mui/icons-material';
import PostCard from './components/PostCard';
import LoginForm from './components/LoginDialog';
import CreatePostForm from './components/CreatePostDialog';
import AddProfessorDialog from './components/AddProfessorDialog';
import ValidatePostsDialog from './components/ValidatePostsDialog';
import { postService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [addProfessorModalOpen, setAddProfessorModalOpen] = useState(false);
  const [validatePostsModalOpen, setValidatePostsModalOpen] = useState(false); // Novo estado
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMyPosts, setShowMyPosts] = useState(false);

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Buscar posts da API
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getPosts();
      
      // Filtrar apenas posts validados (validated = true)
      const validatedPosts = data.filter(post => post.validated === true);
      
      // Ordenar posts por data de criação (mais recente primeiro)
      const sortedPosts = validatedPosts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setPosts(sortedPosts);
      setShowMyPosts(false); // Reset do filtro
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar posts. Verifique se a API está rodando.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    if (!user || !user.id) {
      setSnackbar({
        open: true,
        message: 'Você precisa estar logado para ver seus posts.',
        severity: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const data = await postService.getPostsByAuthor(user.id);
      
      // Filtrar apenas posts validados (validated = true)
      const validatedPosts = data.filter(post => post.validated === true);
      
      // Ordenar posts por data de criação (mais recente primeiro)
      const sortedPosts = validatedPosts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setPosts(sortedPosts);
      setShowMyPosts(true);
    } catch (error) {
      console.error('Erro ao buscar meus posts:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar seus posts.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMyPosts = () => {
    if (showMyPosts) {
      // Se já está mostrando meus posts, volta para todos
      fetchPosts();
    } else {
      // Mostra apenas meus posts
      fetchMyPosts();
    }
  };

  const handleFabClick = () => {
    if (user) {
      setCreatePostModalOpen(true);
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setSnackbar({
      open: true,
      message: `Bem-vindo, ${userData.name}!`,
      severity: 'success',
    });
  };

  const handleCreatePost = async (newPost) => {
    // Mostra mensagem de sucesso
    setSnackbar({
      open: true,
      message: 'Post criado com sucesso!',
      severity: 'success',
    });
    
    // Aguarda um pouco para o usuário ver a mensagem
    setTimeout(() => {
      // Recarrega os posts da API (pega do banco atualizado)
      fetchPosts();
    }, 500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleProfessorAdded = (message) => {
    setSnackbar({
      open: true,
      message: message,
      severity: 'success',
    });
  };

  const handlePostValidated = (message) => {
    setSnackbar({
      open: true,
      message: message,
      severity: 'success',
    });
    // Recarrega os posts para atualizar a lista
    fetchPosts();
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Barra de Navegação */}
      <AppBar position="sticky" sx={{ bgcolor: '#354C2B' }}>
        <Toolbar>
          <MenuBook sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            ParasitoBlog
          </Typography>
          <TextField
            placeholder="Buscar posts..."
            size="small"
            sx={{
              bgcolor: 'white',
              borderRadius: 1,
              width: 300,
              mr: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Botão Meus Posts - só aparece se logado */}
          {user && (
            <Tooltip title={showMyPosts ? "Ver todos os posts" : "Ver meus posts"}>
              <IconButton
                onClick={handleToggleMyPosts}
                sx={{
                  mr: 1,
                  color: 'white',
                  bgcolor: showMyPosts ? '#697E50' : 'transparent',
                  '&:hover': {
                    bgcolor: showMyPosts ? '#4E653D' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <Person sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Botão Adicionar Professor - só para professores (roleId === 1) */}
          {user && user.roleId === 1 && (
            <Tooltip title="Adicionar Professor">
              <IconButton
                onClick={() => setAddProfessorModalOpen(true)}
                sx={{
                  mr: 1,
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <PersonAdd sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Botão Validar Posts - só para professores (roleId === 1) */}
          {user && user.roleId === 1 && (
            <Tooltip title="Validar Posts Pendentes">
              <IconButton
                onClick={() => setValidatePostsModalOpen(true)}
                sx={{
                  mr: 1,
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <VerifiedUser sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Exibir informações do usuário se estiver logado */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.15)', px: 2, py: 1, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {user.email}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: user.roleId === 1 ? '#697E50' : '#859864',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'bold'
                }}
              >
                {user.role}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, pb: 10 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#354C2B' }}>
            Blog de Parasitologia
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Compartilhe conhecimentos sobre parasitas, hospedeiros e formas de transmissão
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: '#697E50' }}>
              Olá, {user.name || user.email}! 👋
            </Typography>
          )}
        </Box>

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          /* Posts */
          <Grid container spacing={3}>
            {posts.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    Nenhum post encontrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Seja o primeiro a criar um post!
                  </Typography>
                </Box>
              </Grid>
            ) : (
              posts.map((post) => (
                <Grid item xs={12} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>

      {/* Botão Flutuante para Criar Post */}
      <Tooltip title={user ? "Criar novo post" : "Fazer login para criar post"} placement="left">
        <Fab
          color="primary"
          aria-label="criar post"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            bgcolor: '#697E50',
            '&:hover': {
              bgcolor: '#4E653D',
            },
          }}
          onClick={handleFabClick}
        >
          <Add sx={{ fontSize: 32 }} />
        </Fab>
      </Tooltip>

      {/* Modais */}
      <LoginForm
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <CreatePostForm
        open={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onCreatePost={handleCreatePost}
        user={user}
      />

      <AddProfessorDialog
        open={addProfessorModalOpen}
        onClose={() => setAddProfessorModalOpen(false)}
        onSuccess={handleProfessorAdded}
      />

      <ValidatePostsDialog
        open={validatePostsModalOpen}
        onClose={() => setValidatePostsModalOpen(false)}
        onValidate={handlePostValidated}
      />

      {/* Notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;