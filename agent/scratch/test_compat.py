import os
import google.genai as genai
from dotenv import load_dotenv

load_dotenv()

def test_model(model_name):
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    client = genai.Client(api_key=api_key)
    
    print(f"Testing Model: {model_name}...")
    try:
        # Use full name if it has models/ prefix, or try both
        if not model_name.startswith("models/"):
            model_name = f"models/{model_name}"
            
        res = client.models.generate_content(model=model_name, contents="Say 'Working'")
        print(f"SUCCESS: {model_name} responded: {res.text.strip()}")
        return True
    except Exception as e:
        print(f"FAILED: {model_name} - {e}")
        return False

if __name__ == "__main__":
    # Test our top candidates
    test_model("gemini-flash-latest")
    test_model("gemini-2.0-flash-lite")
    test_model("gemini-pro-latest")
