import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  PictureAsPdf,
  Description,
  Download,
  Visibility,
} from '@mui/icons-material';

function AttachmentsViewer({ attachments }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <PictureAsPdf sx={{ fontSize: 20, color: '#d32f2f' }} />;
    }
    return <Description sx={{ fontSize: 20, color: '#1976d2' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handlePreview = (url) => {
    window.open(url, '_blank');
  };

  const handleDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
        📎 Documentos Anexos ({attachments.length})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {attachments.map((file, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              bgcolor: '#f9f9f9',
              '&:hover': {
                bgcolor: '#f0f0f0',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              {getFileIcon(file.type)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Visualizar" arrow>
                <IconButton
                  size="small"
                  onClick={() => handlePreview(file.url)}
                  sx={{
                    color: '#697E50',
                    '&:hover': {
                      bgcolor: 'rgba(105, 126, 80, 0.1)',
                    },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleDownload(file.url, file.name)}
                  sx={{
                    color: '#697E50',
                    '&:hover': {
                      bgcolor: 'rgba(105, 126, 80, 0.1)',
                    },
                  }}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default AttachmentsViewer;