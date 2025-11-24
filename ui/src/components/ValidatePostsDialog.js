import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  VerifiedUser,
  BugReport,
  Pets,
  CompareArrows,
  Close,
  AttachFile,
  Delete,
  PictureAsPdf,
  Description,
} from '@mui/icons-material';
import { postService } from '../services/api';
import AttachmentsViewer from './AttachmentsViewer';

function ValidatePostsDialog({ open, onClose, onValidate }) {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(null); // ID do post sendo validado

  useEffect(() => {
    if (open) {
      loadPendingPosts();
    }
  }, [open]);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const posts = await postService.getPendingPosts();
      
      // DEBUG: Ver estrutura dos posts
      console.log('===== POSTS PENDENTES =====');
      console.log('Total de posts:', posts.length);
      if (posts.length > 0) {
        console.log('Primeiro post completo:', posts[0]);
        console.log('Author:', posts[0].author);
        console.log('ParasiteAgent:', posts[0].parasiteAgent);
        console.log('Host:', posts[0].host);
        console.log('Transmission:', posts[0].transmission);
      }
      console.log('===========================');
      
      setPendingPosts(posts);
    } catch (err) {
      console.error('Erro ao carregar posts pendentes:', err);
      setError('Erro ao carregar posts pendentes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (postId, approve) => {
    try {
      setValidating(postId);
      await postService.validatePost(postId, approve);
      
      // Remove o post da lista
      setPendingPosts(pendingPosts.filter(post => post.id !== postId));
      
      // Notifica o App.js
      onValidate(approve ? 'Post aprovado com sucesso!' : 'Post rejeitado.');
      
    } catch (err) {
      console.error('Erro ao validar post:', err);
      setError('Erro ao validar post. Tente novamente.');
    } finally {
      setValidating(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getAvatar = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#697E50';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#697E50', '#859864', '#A4B17B', '#4E653D', '#354C2B'];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUser sx={{ fontSize: 40, color: '#697E50' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Validar Postagens
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Posts aguardando aprovação de professores
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ minHeight: '400px' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <CircularProgress />
          </Box>
        ) : pendingPosts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircle sx={{ fontSize: 80, color: '#697E50', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum post pendente de validação
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Todos os posts foram validados!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {pendingPosts.map((post) => (
              <Card key={post.id} sx={{ boxShadow: 3, borderRadius: 2, border: '2px solid #ff9800' }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: getAvatarColor(post.author), fontWeight: 'bold' }}>
                      {getAvatar(post.author)}
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      {post.author}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(post.createdAt)}
                      </Typography>
                      <Chip 
                        label="PENDENTE" 
                        size="small" 
                        sx={{ 
                          bgcolor: '#ff9800', 
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }} 
                      />
                    </Box>
                  }
                />
                <CardMedia
                  component="img"
                  height="250"
                  image={post.imageUrl}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: '#354C2B' }}>
                    {post.title}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                    <Chip
                      icon={<BugReport />}
                      label={`Agente: ${post.parasiteAgent}`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Pets />}
                      label={`Hospedeiro: ${post.host}`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                    <Chip
                      icon={<CompareArrows />}
                      label={`Transmissão: ${post.transmission}`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {post.content}
                  </Typography>

                  {/* Exibir anexos se existirem */}
                  {post.attachments && (
                    <AttachmentsViewer 
                      attachments={typeof post.attachments === 'string' ? JSON.parse(post.attachments) : post.attachments} 
                    />
                  )}
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'flex-end', p: 2, bgcolor: '#f5f5f5' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleValidate(post.id, false)}
                    disabled={validating === post.id}
                    sx={{ mr: 1 }}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => handleValidate(post.id, true)}
                    disabled={validating === post.id}
                    sx={{
                      bgcolor: '#697E50',
                      '&:hover': {
                        bgcolor: '#4E653D',
                      },
                    }}
                  >
                    {validating === post.id ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Aprovar'}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ValidatePostsDialog;