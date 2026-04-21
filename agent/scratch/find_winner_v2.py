import os
import google.genai as genai
from dotenv import load_dotenv

load_dotenv()

def find_working_model():
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    client = genai.Client(api_key=api_key)
    
    # Handle PowerShell's default UTF-16LE encoding
    try:
        with open("full_models.txt", "r", encoding="utf-16-le") as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        with open("full_models.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()

    models = [line.strip() for line in lines if line.strip() and "models/" in line]

    print(f"Checking {len(models)} models for availability...")
    
    working_ones = []
    for m in models:
        # Skip specialty stuff
        if any(x in m for x in ["embedding", "imagen", "veo", "aqa", "robotics", "deep-research", "lyria", "nano"]):
            continue
            
        print(f"Checking {m}...", end=" ", flush=True)
        try:
            res = client.models.generate_content(model=m, contents="Say 'OK'")
            print(f" -> SUCCESS!")
            working_ones.append(m)
        except Exception as e:
            msg = str(e)
            if "429" in msg:
                print("FAILED (429 Quota)")
            elif "403" in msg:
                print("FAILED (403 Access)")
            elif "404" in msg:
                print("FAILED (404 Not Found)")
            else:
                print(f"FAILED ({msg[:80]}...)")
                
    return working_ones

if __name__ == "__main__":
    winners = find_working_model()
    if winners:
        print(f"\nWINNERS FOUND: {winners}")
    else:
        print("\nFATAL: No working generation models found. Quota is fully exhausted for the day.")
