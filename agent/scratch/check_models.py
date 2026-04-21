import os
import json
import google.genai as genai
from dotenv import load_dotenv

load_dotenv()

def test_models():
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("ERROR: No API key found in environment")
        return

    client = genai.Client(api_key=api_key)
    
    # Get all models that support generation
    try:
        models = [m.name.replace('models/', '') for m in client.models.list() 
                 if 'generateContent' in m.supported_generation_methods]
        print(f"Detected {len(models)} models: {models}")
    except Exception as e:
        print(f"FAILED to list models: {e}")
        return

    # Test top candidates
    candidates = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.0-pro', 'gemini-2.0-flash-lite']
    # Filter to only models we actually have access to
    candidates = [m for m in candidates if m in models]
    
    for m in candidates:
        print(f"Testing {m}...")
        try:
            res = client.models.generate_content(model=m, contents='Hi')
            print(f"SUCCESS: {m} is working!")
            return m
        except Exception as e:
            print(f"FAILED: {m} - {e}")
    
    print("\nCRITICAL: All tested models failed with 429 or other errors.")
    return None

if __name__ == "__main__":
    test_models()
