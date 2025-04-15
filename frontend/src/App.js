import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Snackbar,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import AudioRecorder from './components/AudioRecorder';
import TranscriptionResult from './components/TranscriptionResult';
import TextInput from './components/TextInput';
import MicIcon from '@mui/icons-material/Mic';
import EditIcon from '@mui/icons-material/Edit';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Tạo theme tùy chỉnh
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setResult(null);
        setError(null);
    };

    const handleRecordingComplete = async (audioBlob) => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);
            
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');

            console.log('Sending request to:', `${API_URL}/api/audio/upload`);
            const response = await fetch(`${API_URL}/api/audio/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Lỗi khi tải lên file audio');
            }

            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Có lỗi xảy ra khi xử lý audio');
        } finally {
            setLoading(false);
        }
    };

    const handleTextSubmit = async (text) => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const response = await fetch(`${API_URL}/api/text/translate`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Lỗi khi xử lý văn bản');
            }

            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Có lỗi xảy ra khi xử lý văn bản');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 4, 
                            mb: 4, 
                            textAlign: 'center',
                            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                            color: 'white',
                            borderRadius: 4
                        }}
                    >
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Chuyển đổi Giọng nói Việt-Anh
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Chọn phương thức nhập liệu bên dưới để bắt đầu chuyển đổi.
                        </Typography>
                    </Paper>

                    <Paper 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            centered
                            sx={{ 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                '& .MuiTab-root': {
                                    minHeight: 64,
                                    fontSize: '1rem',
                                }
                            }}
                        >
                            <Tab 
                                icon={<MicIcon />} 
                                label="Ghi âm" 
                                iconPosition="start"
                            />
                            <Tab 
                                icon={<EditIcon />} 
                                label="Nhập văn bản" 
                                iconPosition="start"
                            />
                        </Tabs>
                    </Paper>
                    
                    {tabValue === 0 ? (
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                p: 3, 
                                mb: 3,
                                background: 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            }}
                        >
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Nhấn nút bên dưới để bắt đầu ghi âm. Hệ thống sẽ tự động chuyển đổi giọng nói tiếng Việt của bạn thành văn bản và dịch sang tiếng Anh.
                            </Typography>
                            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                        </Paper>
                    ) : (
                        <TextInput onSubmit={handleTextSubmit} />
                    )}
                    
                    {loading && (
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                p: 3, 
                                mb: 3,
                                background: 'linear-gradient(to right, #f8f9fa, #ffffff)'
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                Đang xử lý...
                            </Typography>
                            <LinearProgress 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    backgroundColor: '#e0e0e0',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                    }
                                }}
                            />
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Vui lòng đợi trong khi hệ thống xử lý.
                                    Quá trình này có thể mất vài giây.
                                </Typography>
                            </Box>
                        </Paper>
                    )}
                    
                    {result && <TranscriptionResult result={result} />}

                    <Snackbar 
                        open={!!error} 
                        autoHideDuration={6000} 
                        onClose={handleCloseError}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert 
                            onClose={handleCloseError} 
                            severity="error" 
                            variant="filled"
                            sx={{ 
                                width: '100%',
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    fontSize: '2rem',
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    </Snackbar>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default App; 