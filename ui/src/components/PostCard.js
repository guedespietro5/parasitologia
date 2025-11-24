import React from 'react';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BugReport,
  Pets,
  CompareArrows,
  Delete,
} from '@mui/icons-material';
import AttachmentsViewer from './AttachmentsViewer';

function PostCard({ post, showValidationStatus, onDelete }) {
  // Gera avatar baseado no nome do autor
  const getAvatar = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Gera cor aleatória consistente baseada no nome
  const getAvatarColor = (name) => {
    if (!name) return '#697E50';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#697E50', '#859864', '#A4B17B', '#4E653D', '#354C2B'];
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <Card sx={{ 
      boxShadow: 3, 
      borderRadius: 2, 
      height: '750px', // Altura fixa para todos os cards
      width: '100%', // Largura 100%
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: getAvatarColor(post.author), fontWeight: 'bold' }}>
            {getAvatar(post.author)}
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {post.author}
            </Typography>
            {showValidationStatus && (
              <Chip
                label={post.validated ? "APROVADO" : "PENDENTE"}
                size="small"
                sx={{
                  bgcolor: post.validated ? '#4caf50' : '#ff9800',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.65rem',
                  height: '20px',
                }}
              />
            )}
          </Box>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatDate(post.createdAt)}
          </Typography>
        }
        sx={{ flexShrink: 0 }} // Não encolhe
      />
      <CardMedia
        component="img"
        height="300"
        image={post.imageUrl}
        alt={post.title}
        sx={{ objectFit: 'cover', flexShrink: 0 }} // Não encolhe
      />
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0, // Importante para overflow funcionar
        pb: 2
      }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          fontWeight="bold" 
          sx={{ 
            color: '#354C2B',
            flexShrink: 0 // Título não encolhe
          }}
        >
          {post.title}
        </Typography>
        
        {/* Chips com informações de parasitologia */}
        <Stack 
          direction="row" 
          spacing={1} 
          flexWrap="wrap" 
          sx={{ 
            mb: 2, 
            gap: 1,
            flexShrink: 0 // Chips não encolhem
          }}
        >
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

        {/* Área de conteúdo com altura fixa e scroll */}
        <Box sx={{ 
          flexGrow: 1,
          minHeight: '150px', // Altura mínima
          maxHeight: '250px', // Altura máxima
          overflow: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: '#f1f1f1',
            borderRadius: 1,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#697E50',
            borderRadius: 1,
            '&:hover': {
              bgcolor: '#4E653D',
            },
          },
        }}>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {post.content}
          </Typography>

          {/* Exibir anexos se existirem */}
          {post.attachments && (
            <AttachmentsViewer 
              attachments={typeof post.attachments === 'string' ? JSON.parse(post.attachments) : post.attachments} 
            />
          )}
        </Box>
      </CardContent>

      {/* Botão de Excluir - só aparece se onDelete foi passado */}
      {onDelete && (
        <CardActions sx={{ justifyContent: 'flex-end', p: 2, bgcolor: '#f5f5f5' }}>
          <Tooltip title="Excluir Post" arrow>
            <IconButton
              onClick={() => onDelete(post.id)}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
}

export default PostCard;