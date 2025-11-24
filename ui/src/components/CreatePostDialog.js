import React, { useState, useEffect, useCallback } from 'react';
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
  Autocomplete,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { CloudUpload, MenuBook, AttachFile, Delete, PictureAsPdf, Description } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { 
  postService, 
  hostService, 
  parasiteAgentService, 
  transmissionService,
  uploadService 
} from '../services/api';

function CreatePostDialog({ open, onClose, onCreatePost, user }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    parasiteAgentId: null,
    hostId: null,
    transmissionId: null,
  });

  const [hosts, setHosts] = useState([]);
  const [parasiteAgents, setParasiteAgents] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState([]); // Arquivos selecionados
  const [uploadingFiles, setUploadingFiles] = useState(false); // Estado de upload
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Carregar dados ao abrir o modal
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [hostsData, agentsData, transmissionsData] = await Promise.all([
        hostService.getAll(),
        parasiteAgentService.getAll(),
        transmissionService.getAll(),
      ]);
      
      setHosts(hostsData);
      setParasiteAgents(agentsData);
      setTransmissions(transmissionsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar opções. Tente novamente.');
    } finally {
      setLoadingData(false);
    }
  };

  // Dropzone para upload de imagem
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      
      // Preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
  });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                          file.type === 'application/msword' ||
                          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        setError('Apenas arquivos PDF e Word são permitidos');
        return false;
      }
      if (!isValidSize) {
        setError('Arquivo muito grande. Máximo 10MB');
        return false;
      }
      return true;
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <PictureAsPdf sx={{ color: '#d32f2f' }} />;
    }
    return <Description sx={{ color: '#1976d2' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleAutocompleteChange = (field, value, reason) => {
    console.log('Autocomplete change:', field, value, reason);
    
    // Se o usuário digitou um valor novo (string)
    if (typeof value === 'string' && value.trim()) {
      setFormData({
        ...formData,
        [`${field}Id`]: null,
        [`new${field}`]: value.trim(),
      });
    } 
    // Se selecionou um objeto existente
    else if (value && typeof value === 'object' && value.id) {
      setFormData({
        ...formData,
        [`${field}Id`]: value.id,
        [`new${field}`]: null,
      });
    }
    // Se limpou o campo
    else {
      setFormData({
        ...formData,
        [`${field}Id`]: null,
        [`new${field}`]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Por favor, preencha título e conteúdo');
      return;
    }

    if (!formData.parasiteAgentId && !formData.newparasiteAgent) {
      setError('Por favor, selecione ou adicione um Agente Parasita');
      return;
    }

    if (!formData.hostId && !formData.newhost) {
      setError('Por favor, selecione ou adicione um Hospedeiro');
      return;
    }

    if (!formData.transmissionId && !formData.newtransmission) {
      setError('Por favor, selecione ou adicione uma Transmissão');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let imageUrl = formData.imageUrl;

      // Upload da imagem se houver
      if (selectedImage) {
        setUploadingImage(true);
        const uploadResponse = await uploadService.uploadImage(selectedImage);
        imageUrl = uploadResponse.url || uploadResponse.imageUrl;
        setUploadingImage(false);
      }

      // Upload dos arquivos anexados se houver
      let attachments = [];
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          const uploadResponse = await uploadService.uploadDocument(file);
          attachments.push({
            name: file.name,
            url: uploadResponse.url || uploadResponse.documentUrl,
            type: file.type,
            size: file.size,
          });
        }
        setUploadingFiles(false);
      }

      // Criar novos itens se necessário
      let parasiteAgentId = formData.parasiteAgentId;
      let hostId = formData.hostId;
      let transmissionId = formData.transmissionId;

      // Criar novo Parasite Agent se necessário
      if (formData.newparasiteAgent) {
        const newAgent = await parasiteAgentService.create({ 
          name: formData.newparasiteAgent 
        });
        parasiteAgentId = newAgent.id;
      }

      // Criar novo Host se necessário
      if (formData.newhost) {
        const newHost = await hostService.create({ 
          name: formData.newhost 
        });
        hostId = newHost.id;
      }

      // Criar nova Transmission se necessário
      if (formData.newtransmission) {
        const newTransmission = await transmissionService.create({ 
          name: formData.newtransmission 
        });
        transmissionId = newTransmission.id;
      }

      // Pegar o ID do usuário do localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const authorId = user?.id || storedUser?.id || parseInt(localStorage.getItem('userId')) || 1;

      // Criar o post
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800',
        authorId: authorId,
        parasiteAgentId: parasiteAgentId,
        hostId: hostId,
        transmissionId: transmissionId,
        attachments: JSON.stringify(attachments), // Converter para JSON string
      };

      console.log('Enviando post:', postData);
      const newPost = await postService.createPost(postData);
      console.log('Post criado:', newPost);
      
      onCreatePost(newPost);
      handleClose();

    } catch (err) {
      console.error('Erro ao criar post:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro ao criar post. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      parasiteAgentId: null,
      hostId: null,
      transmissionId: null,
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedFiles([]); // Limpar arquivos anexados
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <MenuBook sx={{ fontSize: 48, color: '#697E50', mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          Criar Nova Postagem
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Compartilhe conhecimentos sobre parasitologia
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {loadingData && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {!loadingData && (
              <>
                <TextField
                  label="Título *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Ex: Ciclo de vida do Plasmodium"
                  disabled={loading}
                />

                <TextField
                  label="Conteúdo *"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Descreva detalhes sobre o parasita, ciclo de vida, sintomas, etc..."
                  disabled={loading}
                />

                {/* Autocomplete para Agente Parasita */}
                <Autocomplete
                  freeSolo
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  options={parasiteAgents}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.name || '';
                  }}
                  onChange={(e, value, reason) => handleAutocompleteChange('parasiteAgent', value, reason)}
                  filterOptions={(options, params) => {
                    const filtered = options.filter(option => 
                      option.name.toLowerCase().includes(params.inputValue.toLowerCase())
                    );
                    
                    const { inputValue } = params;
                    const isExisting = options.some(option => 
                      inputValue.toLowerCase() === option.name.toLowerCase()
                    );
                    
                    if (inputValue !== '' && !isExisting) {
                      filtered.push(inputValue);
                    }
                    
                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Agente Parasita *"
                      placeholder="Digite ou selecione"
                      helperText="Digite um novo nome para adicionar"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={typeof option === 'string' ? option : option.id}>
                      {typeof option === 'string' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="➕ Adicionar" size="small" sx={{ bgcolor: '#697E50', color: 'white' }} />
                          <span><strong>{option}</strong></span>
                        </Box>
                      ) : (
                        option.name
                      )}
                    </li>
                  )}
                  disabled={loading}
                />

                {/* Autocomplete para Hospedeiro */}
                <Autocomplete
                  freeSolo
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  options={hosts}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.name || '';
                  }}
                  onChange={(e, value, reason) => handleAutocompleteChange('host', value, reason)}
                  filterOptions={(options, params) => {
                    const filtered = options.filter(option => 
                      option.name.toLowerCase().includes(params.inputValue.toLowerCase())
                    );
                    
                    const { inputValue } = params;
                    const isExisting = options.some(option => 
                      inputValue.toLowerCase() === option.name.toLowerCase()
                    );
                    
                    if (inputValue !== '' && !isExisting) {
                      filtered.push(inputValue);
                    }
                    
                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Hospedeiro *"
                      placeholder="Digite ou selecione"
                      helperText="Digite um novo nome para adicionar"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={typeof option === 'string' ? option : option.id}>
                      {typeof option === 'string' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="➕ Adicionar" size="small" sx={{ bgcolor: '#697E50', color: 'white' }} />
                          <span><strong>{option}</strong></span>
                        </Box>
                      ) : (
                        option.name
                      )}
                    </li>
                  )}
                  disabled={loading}
                />

                {/* Autocomplete para Transmissão */}
                <Autocomplete
                  freeSolo
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  options={transmissions}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.name || '';
                  }}
                  onChange={(e, value, reason) => handleAutocompleteChange('transmission', value, reason)}
                  filterOptions={(options, params) => {
                    const filtered = options.filter(option => 
                      option.name.toLowerCase().includes(params.inputValue.toLowerCase())
                    );
                    
                    const { inputValue } = params;
                    const isExisting = options.some(option => 
                      inputValue.toLowerCase() === option.name.toLowerCase()
                    );
                    
                    if (inputValue !== '' && !isExisting) {
                      filtered.push(inputValue);
                    }
                    
                    return filtered;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Forma de Transmissão *"
                      placeholder="Digite ou selecione"
                      helperText="Digite um novo nome para adicionar"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={typeof option === 'string' ? option : option.id}>
                      {typeof option === 'string' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="➕ Adicionar" size="small" sx={{ bgcolor: '#697E50', color: 'white' }} />
                          <span><strong>{option}</strong></span>
                        </Box>
                      ) : (
                        option.name
                      )}
                    </li>
                  )}
                  disabled={loading}
                />

                {/* Upload de Imagem */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Imagem (opcional)
                  </Typography>
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: '2px dashed #697E50',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: isDragActive ? 'rgba(105, 126, 80, 0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(105, 126, 80, 0.05)',
                      },
                    }}
                  >
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 48, color: '#697E50', mb: 1 }} />
                    {imagePreview ? (
                      <Box>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} 
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Clique para trocar a imagem
                        </Typography>
                      </Box>
                    ) : (
                      <Typography>
                        {isDragActive 
                          ? 'Solte a imagem aqui...' 
                          : 'Arraste uma imagem ou clique para selecionar'}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Upload de Documentos (PDF/Word) */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Documentos Anexos (opcional)
                  </Typography>
                  <Box
                    sx={{
                      border: '2px dashed #697E50',
                      borderRadius: 2,
                      p: 2,
                      textAlign: 'center',
                    }}
                  >
                    <input
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      style={{ display: 'none' }}
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<AttachFile />}
                        sx={{
                          color: '#697E50',
                          borderColor: '#697E50',
                          '&:hover': {
                            borderColor: '#4E653D',
                            bgcolor: 'rgba(105, 126, 80, 0.05)',
                          },
                        }}
                      >
                        Anexar PDF ou Word
                      </Button>
                    </label>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Máximo 10MB por arquivo
                    </Typography>
                  </Box>

                  {/* Lista de arquivos selecionados */}
                  {selectedFiles.length > 0 && (
                    <List sx={{ mt: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      {selectedFiles.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {getFileIcon(file)}
                          </ListItemIcon>
                          <ListItemText
                            primary={file.name}
                            secondary={formatFileSize(file.size)}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </>
            )}
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
            disabled={loading || loadingData}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : uploadingFiles ? (
              'Enviando documentos...'
            ) : uploadingImage ? (
              'Enviando imagem...'
            ) : (
              'Publicar'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreatePostDialog;