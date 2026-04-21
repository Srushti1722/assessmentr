import os
import google.genai as genai
from dotenv import load_dotenv

load_dotenv()

def find_working_model():
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    client = genai.Client(api_key=api_key)
    
    with open("full_models.txt", "r") as f:
        models = [line.strip() for line in f if line.strip().startswith("models/")]

    print(f"Checking {len(models)} models for availability...")
    
    for m in models:
        # Skip embedding and image models
        if any(x in m for x in ["embedding", "imagen", "veo", "aqa", "robotics"]):
            continue
            
        print(f"Checking {m}...", end=" ", flush=True)
        try:
            res = client.models.generate_content(model=m, contents="Say 'OK'")
            print(f" -> SUCCESS!")
            return m
        except Exception as e:
            msg = str(e)
            if "429" in msg:
                print("FAILED (429 Quota)")
            elif "403" in msg:
                print("FAILED (403 Access)")
            elif "404" in msg:
                print("FAILED (404 Not Found)")
            else:
                print(f"FAILED ({msg[:50]}...)")
                
    return None

if __name__ == "__main__":
    winner = find_working_model()
    if winner:
        print(f"\nWINNER: Found working model: {winner}")
    else:
        print("\nFATAL: No working generation models found. Quota is fully exhausted for the day.")
