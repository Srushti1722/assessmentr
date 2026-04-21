import os
import google.genai as genai
from dotenv import load_dotenv

# Path to .env
env_path = ".env"
load_dotenv(env_path)

def test_specific_keys():
    gemini_key = os.getenv('GEMINI_API_KEY')
    google_key = os.getenv('GOOGLE_API_KEY')
    
    print(f"GEMINI_API_KEY: {gemini_key[:8]}..." if gemini_key else "GEMINI_API_KEY: MISSING")
    print(f"GOOGLE_API_KEY: {google_key[:8]}..." if google_key else "GOOGLE_API_KEY: MISSING")
    
    models = ["gemini-2.0-flash-lite", "gemini-1.5-flash"]
    
    for key_name, key_val in [("GEMINI_API_KEY", gemini_key), ("GOOGLE_API_KEY", google_key)]:
        if not key_val: continue
        print(f"\n--- Testing with {key_name} ---")
        client = genai.Client(api_key=key_val)
        for m in models:
            try:
                res = client.models.generate_content(model=m, contents="Say 'Working'")
                print(f"SUCCESS: {m} is working with {key_name}!")
                return m, key_name
            except Exception as e:
                print(f"FAILED: {m} with {key_name} - {str(e)[:100]}")
    
    return None, None

if __name__ == "__main__":
    winner, key_name = test_specific_keys()
    if winner:
        print(f"\nPROVEN COMPATIBLE: Model '{winner}' works with {key_name}.")
    else:
        print("\nFATAL: Both keys are fully exhausted for all flash models.")
