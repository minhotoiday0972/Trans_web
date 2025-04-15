import React, { useState, useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    const startRecording = async () => {
        try {
            // Yêu cầu quyền truy cập microphone với cấu hình đơn giản hơn
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true
            });
            
            // Tạo MediaRecorder với cấu hình mặc định
            mediaRecorder.current = new MediaRecorder(stream);
            
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                try {
                    // Tạo blob từ chunks
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                    
                    // Chuyển đổi sang ArrayBuffer
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Giải mã audio
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    
                    // Tạo WAV buffer
                    const wavBuffer = audioBufferToWav(audioBuffer);
                    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                    
                    onRecordingComplete(wavBlob);
                } catch (error) {
                    console.error('Error processing audio:', error);
                    alert('Có lỗi xảy ra khi xử lý audio. Vui lòng thử lại.');
                }
            };

            // Bắt đầu ghi âm với interval 1 giây
            mediaRecorder.current.start(1000);
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            if (error.name === 'NotReadableError') {
                alert('Không thể truy cập microphone. Vui lòng kiểm tra xem có ứng dụng khác đang sử dụng microphone không.');
            } else if (error.name === 'NotAllowedError') {
                alert('Bạn đã từ chối quyền truy cập microphone. Vui lòng cấp quyền trong cài đặt trình duyệt.');
            } else {
                alert('Có lỗi xảy ra khi truy cập microphone. Vui lòng thử lại.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    // Hàm chuyển đổi AudioBuffer thành WAV
    const audioBufferToWav = (buffer) => {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2;
        const buffer16Bit = new ArrayBuffer(44 + length);
        const view = new DataView(buffer16Bit);
        const channels = [];
        let sample;
        let offset = 0;
        let pos = 0;

        // Write WAV header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(36 + length);                        // file length
        setUint32(0x45564157);                         // "WAVE"
        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit
        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length);                             // chunk length

        // Write interleaved data
        for(let i = 0; i < buffer.numberOfChannels; i++)
            channels.push(buffer.getChannelData(i));

        while(pos < buffer.length) {
            for(let i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][pos]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0;
                view.setInt16(44 + offset, sample, true);
                offset += 2;
            }
            pos++;
        }

        return buffer16Bit;

        function setUint16(data) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    };

    return (
        <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="h6" gutterBottom>
                Ghi âm
            </Typography>
            <Button
                variant="contained"
                color={isRecording ? "error" : "primary"}
                startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                onClick={isRecording ? stopRecording : startRecording}
                sx={{ m: 1 }}
            >
                {isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
            </Button>
        </Box>
    );
};

export default AudioRecorder; 