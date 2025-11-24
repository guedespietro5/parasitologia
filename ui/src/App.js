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
  IconButton,
  Button,
  Pagination,
} from '@mui/material';
import {
  Search,
  MenuBook,
  Add,
  Person,
  VerifiedUser,
  PersonAdd,
  Logout,
} from '@mui/icons-material';
import PostCard from './components/PostCard';
import LoginForm from './components/LoginDialog';
import CreatePostForm from './components/CreatePostDialog';
import AddProfessorDialog from './components/AddProfessorDialog';
import ValidatePostsDialog from './components/ValidatePostsDialog';
import AttachmentsViewer from './components/AttachmentsViewer';
import { postService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [addProfessorModalOpen, setAddProfessorModalOpen] = useState(false);
  const [validatePostsModalOpen, setValidatePostsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]); // Guardar todos os posts
  const [loading, setLoading] = useState(true);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const postsPerPage = 5; // Posts por página

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getPosts();
      const validatedPosts = data.filter(post => post.validated === true);
      const sortedPosts = validatedPosts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setAllPosts(sortedPosts); // Guardar todos para filtrar
      setPosts(sortedPosts);
      setShowMyPosts(false);
      setSearchTerm(''); // Limpar busca
      setCurrentPage(1); // Resetar para primeira página
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
      
      // NÃO filtrar por validated - mostrar todos os posts do usuário
      // para que ele veja o status de validação
      const sortedPosts = data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setAllPosts(sortedPosts); // Guardar todos para filtrar
      setPosts(sortedPosts);
      setShowMyPosts(true);
      setSearchTerm(''); // Limpar busca
      setCurrentPage(1); // Resetar para primeira página
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
      fetchPosts();
    } else {
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
    setSnackbar({
      open: true,
      message: 'Post criado com sucesso!',
      severity: 'success',
    });
    setTimeout(() => {
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
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) {
      return;
    }

    try {
      await postService.deletePost(postId);
      
      setSnackbar({
        open: true,
        message: 'Post excluído com sucesso!',
        severity: 'success',
      });

      // Atualizar lista de posts
      if (showMyPosts) {
        fetchMyPosts();
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir post. Tente novamente.',
        severity: 'error',
      });
    }
  };

  const handleLogout = () => {
    // Limpar todo o localStorage
    localStorage.clear();
    
    // Resetar estado do usuário
    setUser(null);
    setShowMyPosts(false);
    
    // Recarregar posts (apenas validados)
    fetchPosts();
    
    // Mostrar mensagem
    setSnackbar({
      open: true,
      message: 'Logout realizado com sucesso!',
      severity: 'success',
    });
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1); // Resetar para primeira página ao buscar

    if (term === '') {
      // Se busca vazia, mostrar todos os posts
      setPosts(allPosts);
      return;
    }

    // Filtrar posts por múltiplos campos
    const filtered = allPosts.filter(post => {
      const titleMatch = post.title?.toLowerCase().includes(term);
      const authorMatch = post.author?.toLowerCase().includes(term);
      const parasiteAgentMatch = post.parasiteAgent?.toLowerCase().includes(term);
      const hostMatch = post.host?.toLowerCase().includes(term);
      const transmissionMatch = post.transmission?.toLowerCase().includes(term);
      const contentMatch = post.content?.toLowerCase().includes(term);

      return titleMatch || authorMatch || parasiteAgentMatch || hostMatch || transmissionMatch || contentMatch;
    });

    setPosts(filtered);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular posts da página atual
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ed 40%, #e8f5e9 70%, #c8e6c9 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '300px',
        background: 'linear-gradient(180deg, rgba(200, 230, 201, 0.3) 0%, transparent 100%)',
        zIndex: 0,
      }
    }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(53, 76, 43, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'rgba(255, 255, 255, 0.1)', 
            px: 2, 
            py: 0.5, 
            borderRadius: 2,
            mr: 2
          }}>
            <MenuBook sx={{ mr: 1, fontSize: 32, color: '#C3CA92' }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
              Biblioteca Parasitologia
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <TextField
            placeholder="Buscar por título, autor, agente, hospedeiro ou transmissão..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              width: 400,
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
                  <Search sx={{ color: '#697E50' }} />
                </InputAdornment>
              ),
            }}
          />
          
          {user && (
            <Tooltip title={showMyPosts ? "Ver todos os posts" : "Ver meus posts"} arrow>
              <IconButton
                onClick={handleToggleMyPosts}
                sx={{
                  mr: 1,
                  color: 'white',
                  bgcolor: showMyPosts ? '#697E50' : 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid',
                  borderColor: showMyPosts ? '#697E50' : 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: showMyPosts ? '#4E653D' : 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Person sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          )}

          {user && user.roleId === 1 && (
            <Tooltip title="Adicionar Professor" arrow>
              <IconButton
                onClick={() => setAddProfessorModalOpen(true)}
                sx={{
                  mr: 1,
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <PersonAdd sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          )}

          {user && user.roleId === 1 && (
            <Tooltip title="Validar Posts Pendentes" arrow>
              <IconButton
                onClick={() => setValidatePostsModalOpen(true)}
                sx={{
                  mr: 1,
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <VerifiedUser sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Botão Logout - aparece para todos usuários logados */}
          {user && (
            <Tooltip title="Sair" arrow>
              <IconButton
                onClick={handleLogout}
                sx={{
                  mr: 2,
                  color: 'white',
                  bgcolor: 'rgba(244, 67, 54, 0.2)',
                  border: '2px solid rgba(244, 67, 54, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(244, 67, 54, 0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Logout sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          )}
          
          {user && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              bgcolor: 'rgba(255,255,255,0.15)', 
              px: 2, 
              py: 1, 
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                {user.email}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: user.roleId === 1 ? '#697E50' : '#859864',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {user.role}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4, pb: 10, position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          mb: 4, 
          textAlign: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          p: 4,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #354C2B 30%, #697E50 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Biblioteca de Parasitologia
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
            Compartilhe seus conhecimentos e nos ajude a crescer!
          </Typography>
          {user && (
            <Box sx={{ 
              display: 'inline-block',
              mt: 2,
              px: 3,
              py: 1,
              borderRadius: 2,
              bgcolor: '#697E50',
              color: 'white',
              boxShadow: '0 4px 12px rgba(105, 126, 80, 0.3)',
            }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Olá, {user.name || user.email}! 👋
              </Typography>
            </Box>
          )}
        </Box>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            mt: 4,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            p: 8,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <CircularProgress size={60} sx={{ color: '#697E50' }} />
            <Typography variant="h6" sx={{ mt: 2, color: '#697E50' }}>
              Carregando posts...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {posts.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}>
                  <Search sx={{ fontSize: 80, color: '#697E50', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h5" sx={{ color: '#354C2B', fontWeight: 'bold', mb: 1 }}>
                    {searchTerm ? 'Nenhum post encontrado' : 'Nenhum post disponível'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm 
                      ? `Nenhum resultado para "${searchTerm}". Tente outro termo de busca.`
                      : 'Seja o primeiro a criar um post!'}
                  </Typography>
                  {searchTerm && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm('');
                        setPosts(allPosts);
                      }}
                      sx={{
                        mt: 2,
                        color: '#697E50',
                        borderColor: '#697E50',
                        '&:hover': {
                          bgcolor: 'rgba(105, 126, 80, 0.1)',
                          borderColor: '#4E653D',
                        }
                      }}
                    >
                      Limpar Busca
                    </Button>
                  )}
                </Box>
              </Grid>
            ) : (
              <>
                {currentPosts.map((post, index) => (
                  <Grid item xs={12} key={post.id}>
                    <Box
                      sx={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                        '@keyframes fadeInUp': {
                          from: {
                            opacity: 0,
                            transform: 'translateY(30px)',
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                        },
                      }}
                    >
                      <PostCard 
                      post={post} 
                      showValidationStatus={showMyPosts}
                      onDelete={showMyPosts ? handleDeletePost : null}
                    />
                    </Box>
                  </Grid>
                ))}
                
                {/* Paginação */}
                {totalPages > 1 && (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 4,
                      mb: 2,
                    }}>
                      <Pagination 
                        count={totalPages} 
                        page={currentPage} 
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            '&:hover': {
                              bgcolor: 'rgba(105, 126, 80, 0.1)',
                            },
                          },
                          '& .Mui-selected': {
                            bgcolor: '#697E50 !important',
                            color: 'white',
                            '&:hover': {
                              bgcolor: '#4E653D !important',
                            },
                          },
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      textAlign="center" 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Mostrando {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, posts.length)} de {posts.length} posts
                    </Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        )}
      </Container>

      <Tooltip title={user ? "Criar novo post" : "Fazer login para criar post"} placement="left" arrow>
        <Fab
          color="primary"
          aria-label="criar post"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            bgcolor: '#697E50',
            width: 70,
            height: 70,
            boxShadow: '0 8px 24px rgba(105, 126, 80, 0.4)',
            '&:hover': {
              bgcolor: '#4E653D',
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: '0 12px 32px rgba(105, 126, 80, 0.6)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={handleFabClick}
        >
          <Add sx={{ fontSize: 36 }} />
        </Fab>
      </Tooltip>

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