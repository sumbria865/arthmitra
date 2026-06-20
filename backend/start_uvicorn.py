import pathlib
import os
from dotenv import load_dotenv
import uvicorn

root = pathlib.Path(__file__).parent
# Load .env from backend folder
load_dotenv(root / '.env')

# Ensure expected environment variables exist (fallbacks for local dev)
os.environ.setdefault('ANTHROPIC_API_KEY', os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('Gemini_API_Key') or 'test_key')

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True, app_dir=str(root))
