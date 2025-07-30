import speech_recognition as sr
import webbrowser
import pyttsx3
import musicLib
import api_ai 
import requests
from gtts import gTTS
import pygame
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GENAI_API_KEY = os.getenv("YOUR_API_KEY_HERE")
NEWS_API_KEY = os.getenv("YOUR_API_KEY_HERE")

# Initialize components
recognizer = sr.Recognizer()
engine = pyttsx3.init()

# ---- Text to Speech ----
def speak_old(text):
    engine.say(text)
    engine.runAndWait()
# ---- MODIFIED VERSION OF Text to Speech ----
def speak(text):
    tts = gTTS(text)
    tts.save('temp.mp3')
    pygame.mixer.init()
    pygame.mixer.music.load('temp.mp3')
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)
    pygame.mixer.music.unload()
    os.remove("temp.mp3")

# ---- Command Handler ----
def processCommand(c):
    command = c.lower()

    if "open google" in command:
        webbrowser.open("https://google.com")

    elif "open facebook" in command:
        webbrowser.open("https://facebook.com")

    elif "open youtube" in command:
        webbrowser.open("https://youtube.com")

    elif "open linkedin" in command:
        webbrowser.open("https://linkedin.com")
        
    elif any(word in command for word in ["how are you",'ssup','yo','how are you doing']):
        speak("i am well")

    elif command.startswith("play"):
        try:
            song_name = command.split(" ", 1)[1]
            link = musicLib.music.get(song_name)
            if link:
                webbrowser.open(link)
            else:
                speak(f"Sorry, I couldn't find {song_name}")
        except IndexError:
            speak("Please specify a song name.")

    elif any(word in command for word in ["close", "exit", "stop",'do nothing','bye','get lost','go','go away','shu']):
        speak("Sayonara")
        exit()

    elif "news" in command:
        r = requests.get(f"https://newsapi.org/v2/top-headlines?country=us&apiKey={NEWS_API_KEY}")
        if r.status_code == 200:
            articles = r.json().get('articles', [])
            for article in articles[:5]:
                speak(article['title'])
        else:
            speak("Failed to fetch news.")

    elif "ai" in command:
        prompt = command.replace("ai", "").strip()
        speak(api_ai.ai_command(prompt))


# ---- Main Loop ----
if __name__ == "__main__":
    speak("Initializing Jarvis")
    while True:
        try:
            print("Listening for wake word...")
            with sr.Microphone() as source:
                audio = recognizer.listen(source, timeout=3, phrase_time_limit=2)
            word = recognizer.recognize_google(audio)

            if word.lower() == "jarvis":
                speak("Yes,YOUR_NAME")
                with sr.Microphone() as source:
                    print("Jarvis Active...")
                    audio = recognizer.listen(source, timeout=10)
                    command = recognizer.recognize_google(audio)
                    processCommand(command)

        except Exception as e:
            print(f"Error: {e}")