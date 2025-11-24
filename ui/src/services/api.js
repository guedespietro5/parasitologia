import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const publicRoutes = ['/auth/login', '/users', '/post'];
  const isPublicRoute = publicRoutes.some(route => 
    config.url.startsWith(route) && config.method === 'get'
  ) || config.url === '/auth/login' || (config.url === 's' && config.method === 'post');
  
  if (!isPublicRoute) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro da API:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', error.request);
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

// Serviço de Posts
export const postService = {
  // GET - Buscar todos os posts (público)
  getPosts: async () => {
    const response = await api.get('/post');
    return response.data;
  },

  // GET - Buscar post por ID (público)
  getPostById: async (id) => {
    const response = await api.get(`/post/${id}`);
    return response.data;
  },

  // GET - Buscar posts por autor (público)
  getPostsByAuthor: async (authorId) => {
    const response = await api.get(`/post/author/${authorId}`);
    return response.data;
  },

  // GET - Buscar posts pendentes de validação (autenticado - apenas professores)
  getPendingPosts: async () => {
    const response = await api.get('/post/pending');
    return response.data;
  },

  // PUT - Validar ou rejeitar post (autenticado - apenas professores)
  validatePost: async (postId, approve) => {
    const response = await api.put(`/post/${postId}/validate`, { 
      validated: approve 
    });
    return response.data;
  },

  // POST - Criar novo post (autenticado)
  createPost: async (postData) => {
    const response = await api.post('/post', postData);
    return response.data;
  },

  // PUT - Atualizar post (autenticado)
  updatePost: async (id, postData) => {
    const response = await api.put(`/post/${id}`, postData);
    return response.data;
  },

  // DELETE - Deletar post (autenticado)
  deletePost: async (id) => {
    const response = await api.delete(`/post/${id}`);
    return response.data;
  },
};

// Serviço de Host
export const hostService = {
  getAll: async () => {
    const response = await api.get('/host');
    return response.data;
  },
  
  create: async (hostData) => {
    const response = await api.post('/host', hostData);
    return response.data;
  },
};

// Serviço de ParasiteAgent
export const parasiteAgentService = {
  getAll: async () => {
    const response = await api.get('/parasiteAgent');
    return response.data;
  },
  
  create: async (agentData) => {
    const response = await api.post('/parasiteAgent', agentData);
    return response.data;
  },
};

// Serviço de Transmission
export const transmissionService = {
  getAll: async () => {
    const response = await api.get('/transmission');
    return response.data;
  },
  
  create: async (transmissionData) => {
    const response = await api.post('/transmission', transmissionData);
    return response.data;
  },
};

// Serviço de Upload
export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

// Serviço de Autenticação
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roleId');
    localStorage.removeItem('userId'); // ← Remover userId também
  },
};

export default api;