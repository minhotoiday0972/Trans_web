import React, { useState, useEffect } from 'react';
import { 
    IconButton, 
    Box, 
    Slider, 
    Typography,
    Tooltip,
    Paper,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Divider
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SpeedIcon from '@mui/icons-material/Speed';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SearchIcon from '@mui/icons-material/Search';

const TextToSpeech = ({ text }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [volume, setVolume] = useState(1);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            
            const englishFemaleVoice = availableVoices.find(
                voice => voice.lang.includes('en') && voice.name.includes('Female')
            );
            
            if (englishFemaleVoice) {
                setSelectedVoice(englishFemaleVoice);
            } else if (availableVoices.length > 0) {
                setSelectedVoice(availableVoices[0]);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const filteredVoices = voices.filter(voice => {
        const searchLower = searchQuery.toLowerCase();
        return (
            voice.name.toLowerCase().includes(searchLower) ||
            voice.lang.toLowerCase().includes(searchLower)
        );
    });

    const speak = () => {
        if (!text) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisErrorEvent:', event);
            setError('Có lỗi xảy ra khi đọc văn bản. Vui lòng thử lại.');
            setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    return (
        <Paper 
            elevation={3}
            sx={{ 
                p: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <Stack spacing={3}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={isPlaying ? "Dừng" : "Đọc"}>
                            <IconButton 
                                onClick={isPlaying ? stop : speak}
                                color="primary"
                                size="large"
                                sx={{ 
                                    backgroundColor: isPlaying ? 'primary.light' : 'background.paper',
                                    '&:hover': {
                                        backgroundColor: isPlaying ? 'primary.main' : 'primary.light',
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <FormControl sx={{ minWidth: 250 }}>
                        <InputLabel>Chọn giọng đọc</InputLabel>
                        <Select
                            value={selectedVoice ? selectedVoice.name : ''}
                            onChange={(e) => {
                                const voice = voices.find(v => v.name === e.target.value);
                                setSelectedVoice(voice);
                            }}
                            label="Chọn giọng đọc"
                            startAdornment={
                                <RecordVoiceOverIcon sx={{ mr: 1, color: 'action.active' }} />
                            }
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                    borderRadius: 2
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                }
                            }}
                        >
                            {filteredVoices.map((voice) => (
                                <MenuItem key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Tìm kiếm giọng đọc..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                            ),
                        }}
                        sx={{
                            minWidth: 250,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                }
                            },
                        }}
                    />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 3,
                    flexWrap: 'wrap'
                }}>
                    <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <SpeedIcon color="action" />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Tốc độ
                            </Typography>
                        </Box>
                        <Slider
                            value={rate}
                            onChange={(_, value) => setRate(value)}
                            min={0.5}
                            max={2}
                            step={0.1}
                            size="small"
                            sx={{ 
                                color: 'primary.main',
                                '& .MuiSlider-thumb': {
                                    height: 16,
                                    width: 16,
                                    backgroundColor: '#fff',
                                    border: '2px solid currentColor',
                                    '&:hover, &.Mui-focusVisible': {
                                        boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                                    },
                                },
                                '& .MuiSlider-track': {
                                    height: 4,
                                    borderRadius: 2,
                                },
                                '& .MuiSlider-rail': {
                                    height: 4,
                                    borderRadius: 2,
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <MusicNoteIcon color="action" />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Cao độ
                            </Typography>
                        </Box>
                        <Slider
                            value={pitch}
                            onChange={(_, value) => setPitch(value)}
                            min={0.5}
                            max={2}
                            step={0.1}
                            size="small"
                            sx={{ 
                                color: 'primary.main',
                                '& .MuiSlider-thumb': {
                                    height: 16,
                                    width: 16,
                                    backgroundColor: '#fff',
                                    border: '2px solid currentColor',
                                    '&:hover, &.Mui-focusVisible': {
                                        boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                                    },
                                },
                                '& .MuiSlider-track': {
                                    height: 4,
                                    borderRadius: 2,
                                },
                                '& .MuiSlider-rail': {
                                    height: 4,
                                    borderRadius: 2,
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <VolumeUpIcon color="action" />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Âm lượng
                            </Typography>
                        </Box>
                        <Slider
                            value={volume}
                            onChange={(_, value) => setVolume(value)}
                            min={0}
                            max={1}
                            step={0.1}
                            size="small"
                            sx={{ 
                                color: 'primary.main',
                                '& .MuiSlider-thumb': {
                                    height: 16,
                                    width: 16,
                                    backgroundColor: '#fff',
                                    border: '2px solid currentColor',
                                    '&:hover, &.Mui-focusVisible': {
                                        boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                                    },
                                },
                                '& .MuiSlider-track': {
                                    height: 4,
                                    borderRadius: 2,
                                },
                                '& .MuiSlider-rail': {
                                    height: 4,
                                    borderRadius: 2,
                                }
                            }}
                        />
                    </Box>
                </Box>

                {error && (
                    <Typography 
                        variant="body2" 
                        color="error"
                        sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'error.light',
                            color: 'error.contrastText'
                        }}
                    >
                        {error}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

export default TextToSpeech; 