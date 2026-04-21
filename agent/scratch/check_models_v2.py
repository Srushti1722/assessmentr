import os
import json
import google.genai as genai
from dotenv import load_dotenv

load_dotenv()

def test_models():
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("ERROR: No API key found")
        return

    client = genai.Client(api_key=api_key)
    
    # Candidate list
    candidates = [
        'gemini-1.5-flash', 
        'gemini-1.5-flash-8b', 
        'gemini-1.0-pro', 
        'gemini-2.0-flash-lite-preview-02-05',
        'gemini-1.5-flash-latest'
    ]
    
    print("Testing model accessibility and quota...")
    
    for m in candidates:
        print(f"--- Testing {m} ---")
        try:
            res = client.models.generate_content(model=m, contents='Hi')
            print(f"SUCCESS: {m} is working fine.")
            return m
        except Exception as e:
            msg = str(e)
            if "429" in msg:
                print(f"FAILED: {m} - Quota Exceeded (429)")
            elif "404" in msg:
                print(f"FAILED: {m} - Model Not Found (404)")
            elif "403" in msg:
                print(f"FAILED: {m} - Permission Denied (403)")
            else:
                print(f"FAILED: {m} - {msg}")
    
    print("\nCRITICAL: All candidate models failed. Your Free Tier quota is likely fully exhausted for the day.")
    return None

if __name__ == "__main__":
    test_models()
