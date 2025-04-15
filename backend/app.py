import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import (
    WhisperForConditionalGeneration,
    WhisperProcessor,
    MarianMTModel,
    MarianTokenizer,
)
import torch
import soundfile as sf
import librosa
import time
from werkzeug.utils import secure_filename

app = Flask(__name__)
# Cấu hình CORS đơn giản
CORS(app)

# Cấu hình
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3'}

# Sử dụng đường dẫn tương đối cho các model
WHISPER_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../model_fine-tuned_whisper')
TRANSLATION_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../model_trans_vie2en')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Tạo thư mục uploads nếu chưa tồn tại
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

class ModelService:
    _instance = None

    def __init__(self):
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        print(f"Using device: {self.device}")
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        """Tải các model ML"""
        print("Đang tải mô hình PhoWhisper từ local...")
        self.whisper_processor = WhisperProcessor.from_pretrained(
            WHISPER_MODEL_PATH
        )
        self.whisper_model = (
            WhisperForConditionalGeneration.from_pretrained(WHISPER_MODEL_PATH)
            .to(self.device)
        )

        print("Đang tải mô hình dịch thuật từ local...")
        self.translation_tokenizer = MarianTokenizer.from_pretrained(
            TRANSLATION_MODEL_PATH
        )
        self.translation_model = (
            MarianMTModel.from_pretrained(TRANSLATION_MODEL_PATH)
            .to(self.device)
        )

        self.whisper_model.eval()
        self.translation_model.eval()
        print("Đã tải xong các model!")

    def speech_to_text(self, audio_path):
        """Chuyển đổi audio thành text tiếng Việt"""
        print("Đang chuyển giọng nói thành văn bản...")
        start_time = time.time()

        # Đọc và xử lý file audio
        audio, sample_rate = sf.read(audio_path)
        if sample_rate != 16000:
            audio = librosa.resample(
                audio, orig_sr=sample_rate, target_sr=16000
            )

        # Chuyển đổi audio thành input features
        input_features = self.whisper_processor(
            audio, 
            sampling_rate=16000, 
            return_tensors="pt"
        ).input_features.to(self.device)

        # Sinh text với các tham số tối ưu
        with torch.no_grad():
            predicted_ids = self.whisper_model.generate(
                input_features,
                language="vi",
                num_beams=2,
                max_length=448,
                no_repeat_ngram_size=3,
                temperature=0.7
            )
        text_vi = self.whisper_processor.batch_decode(
            predicted_ids,
            skip_special_tokens=True
        )[0]

        process_time = time.time() - start_time
        print(f"Thời gian xử lý speech-to-text: {process_time:.2f} giây")
        return text_vi

    def translate_vi_to_en(self, text_vi):
        """Dịch text từ tiếng Việt sang tiếng Anh"""
        print("Đang dịch từ tiếng Việt sang tiếng Anh...")
        start_time = time.time()

        # Chuẩn bị input
        inputs = self.translation_tokenizer(
            text_vi,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        ).to(self.device)

        # Dịch với các tham số tối ưu
        with torch.no_grad():
            translated = self.translation_model.generate(
                **inputs,
                num_beams=4,
                length_penalty=0.6,
                max_length=512
            )
        text_en = self.translation_tokenizer.decode(
            translated[0],
            skip_special_tokens=True
        )

        process_time = time.time() - start_time
        print(f"Thời gian xử lý dịch thuật: {process_time:.2f} giây")
        return text_en

def allowed_file(filename):
    """Kiểm tra định dạng file được phép"""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in ALLOWED_EXTENSIONS

@app.route('/api/audio/upload', methods=['POST'])
def process_audio():
    """API endpoint để xử lý file audio"""
    try:
        # Kiểm tra file
        if 'file' not in request.files:
            return jsonify({'error': 'Không tìm thấy file audio'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Không có file được chọn'}), 400
            
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Định dạng file không được hỗ trợ'}), 400

        # Lưu file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"Đã lưu file tại: {filepath}")

        # Xử lý audio
        start_time = time.time()
        model_service = ModelService.get_instance()
        
        # Chuyển speech thành text
        text_vi = model_service.speech_to_text(filepath)
        print(f"Văn bản tiếng Việt: {text_vi}")
        
        # Dịch sang tiếng Anh
        text_en = model_service.translate_vi_to_en(text_vi)
        print(f"Bản dịch tiếng Anh: {text_en}")
        
        # Tính thời gian xử lý
        processing_time = time.time() - start_time
        
        # Xóa file tạm
        os.remove(filepath)
        
        return jsonify({
            'text_vi': text_vi,
            'text_en': text_en,
            'processing_time': processing_time,
            'status': 'completed'
        }), 200
            
    except Exception as e:
        print(f"Lỗi khi xử lý audio: {str(e)}")
        # Xóa file tạm nếu có lỗi
        if 'filepath' in locals():
            try:
                os.remove(filepath)
            except Exception as cleanup_error:
                print(f"Lỗi khi xóa file tạm: {cleanup_error}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/text/translate', methods=['POST', 'OPTIONS'])
def translate_text():
    """API endpoint để dịch văn bản tiếng Việt sang tiếng Anh"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Không tìm thấy văn bản cần dịch'}), 400

        text_vi = data['text']
        if not text_vi.strip():
            return jsonify({'error': 'Văn bản không được để trống'}), 400

        # Xử lý dịch thuật
        start_time = time.time()
        model_service = ModelService.get_instance()
        text_en = model_service.translate_vi_to_en(text_vi)
        processing_time = time.time() - start_time

        return jsonify({
            'text_vi': text_vi,
            'text_en': text_en,
            'processing_time': processing_time,
            'status': 'completed'
        }), 200

    except Exception as e:
        print(f"Lỗi khi dịch văn bản: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Khởi tạo ModelService khi start server
    ModelService.get_instance()
    app.run(debug=True)
