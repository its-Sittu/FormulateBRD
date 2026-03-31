import os
from dotenv import load_dotenv
load_dotenv()
import sys

try:
    from google import genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    print(f"Key: {GEMINI_API_KEY[:10]}...")
    client = genai.Client(api_key=GEMINI_API_KEY)
    print(f"Client: {client}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
