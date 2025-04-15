import React from 'react';
import { 
    Paper, 
    Typography, 
    Box, 
    Chip,
    Stack,
    Divider
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TextToSpeech from './TextToSpeech';

const TranscriptionResult = ({ result }) => {
    const { text_vi, text_en, processing_time } = result;

    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 3,
                background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                }
            }}
        >
            <Stack spacing={3}>
                {/* Phần văn bản tiếng Việt */}
                <Box>
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
                        Văn bản tiếng Việt
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.8,
                            color: 'text.primary',
                            fontSize: '1.1rem'
                        }}
                    >
                        {text_vi}
                    </Typography>
                </Box>

                <Divider />

                {/* Phần văn bản tiếng Anh */}
                <Box>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mb: 2,
                            flexWrap: 'wrap'
                        }}
                    >
                        <Chip 
                            icon={<TranslateIcon />} 
                            label="Bản dịch tiếng Anh" 
                            color="primary" 
                            variant="outlined"
                            sx={{ 
                                borderRadius: 2,
                                '& .MuiChip-icon': {
                                    color: 'primary.main'
                                }
                            }}
                        />
                        <TextToSpeech text={text_en} />
                    </Box>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.8,
                            color: 'text.primary',
                            fontSize: '1.1rem'
                        }}
                    >
                        {text_en}
                    </Typography>
                </Box>

                <Divider />

                {/* Thông tin xử lý */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.secondary',
                        fontSize: '0.9rem'
                    }}
                >
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                        Thời gian xử lý: {processing_time.toFixed(2)} giây
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
};

export default TranscriptionResult; 