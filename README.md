# Introduction to Trans_web
This web application is built based on two main functionalities: converting speech to text and translating text into another language (here, translating from Vietnamese to English).

# Main Idea
The initial challenge was to ensure the web processes requests quickly (in real-time). The solution approach involves using two transformer models for two different tasks, with each model fine-tuned for Vietnamese data and having a relatively small parameter size:
- **Fine-tuned PhoWhisper-small Model** (`model_fine-tuned_whisper`): Responsible for recognizing Vietnamese speech and converting it into text.
- **Fine-tuned Helsinki-NLP/opus-mt-en-vi Model** (`model_trans_vie2en`): Translates recorded or keyboard-entered text into English.

# Usage Instructions
This web application uses the Flask framework for the backend, and Node.js with React.js for the frontend. Therefore, the process of activating the web can be divided into two parts as follows:

- **For the Backend**, execute the following commands in order:
```bash
cd backend
pip install -r requirements.txt
flask run
```

- **For the Frontend**:
```bash
cd frontend
npm install
npm start
```
# Results