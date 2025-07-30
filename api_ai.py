import google.generativeai as genai
import os
from dotenv import load_dotenv
import pyttsx3
import speech_recognition as sr

recognizer = sr.Recognizer()
engine = pyttsx3.init()
# SPEAK FUNCTION
def speak_old(text):
    engine.say(text)
    engine.runAndWait()
# Load .env file
load_dotenv()
API_KEY = os.getenv("YOUR_API_KEY_HERE")

# Configure Gemini
genai.configure(api_key=API_KEY)

# Generate content
# ---- AI Command Processor ----
def ai_command(command):
    try:
        model = genai.GenerativeModel(model_name="gemini-2.5-pro")  # or "gemini-pro", etc.
        response = model.generate_content(command)
        speak_old(response.text)
    except Exception as e:
        print(f"Error: {e}")