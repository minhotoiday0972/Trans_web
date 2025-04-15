import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Box,
    Paper,
    Typography,
    InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import TranslateIcon from '@mui/icons-material/Translate';

const TextInput = ({ onSubmit }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text);
            setText('');
        }
    };

    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 3, 
                mb: 3,
                background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                }
            }}
        >
            <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                Nhập văn bản tiếng Việt
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="Nhập văn bản tiếng Việt..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        sx={{ 
                            flexGrow: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                },
                            },
                            '& .MuiOutlinedInput-input': {
                                fontSize: '1.1rem',
                                lineHeight: 1.8,
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <TranslateIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        endIcon={<SendIcon />}
                        disabled={!text.trim()}
                        sx={{ 
                            alignSelf: 'flex-end',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }
                        }}
                    >
                        Gửi
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default TextInput; 