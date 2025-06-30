import os
import logging
from google import genai
from google.genai import types

class AIHandler:
    """Handles AI interactions using Google Gemini"""
    
    def __init__(self):
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            logging.warning("GEMINI_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = genai.Client(api_key=api_key)
        
    def get_tutor_response(self, user_message, context=""):
        """Get AI tutor response for student question"""
        if not self.client:
            return "Entschuldigung, der KI-Tutor ist momentan nicht verfügbar. Bitte versuche es später erneut."
        
        system_prompt = """Du bist ein geduldiger Mathematik-Tutor für Ingenieurstudenten, spezialisiert auf komplexe Zahlen.

Deine Aufgabe:
1. Erkläre Konzepte verständlich, nicht nur rechnerisch
2. Verwende Schritt-für-Schritt Erklärungen
3. Stelle Rückfragen zum Verständnis
4. Gib keine direkten Antworten, sondern leite den Studenten an
5. Verwende einfache, klare deutsche Sprache
6. Bei komplexen Zahlen: Erkläre sowohl die algebraische als auch die geometrische Sichtweise
7. Nutze Beispiele und Analogien aus dem Ingenieurwesen

Kontext der aktuellen Aufgabe: """ + context

        user_prompt = f"Studentenfrage: {user_message}"
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Content(role="user", parts=[types.Part(text=user_prompt)])
                ],
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.7,
                    max_output_tokens=500
                )
            )
            
            if response.text:
                return response.text
            else:
                return "Entschuldigung, ich konnte keine Antwort generieren. Kannst du deine Frage anders formulieren?"
                
        except Exception as e:
            logging.error(f"Gemini API error: {e}")
            return "Entschuldigung, ich kann momentan nicht antworten. Versuche es später erneut."
    
    def generate_explanation(self, topic, difficulty_level="beginner"):
        """Generate explanation for a specific topic"""
        if not self.client:
            return "Erklärung nicht verfügbar."
        
        prompt = f"""Erkläre das Thema '{topic}' für Ingenieurstudenten auf {difficulty_level} Niveau.
        
Verwende:
- Klare, strukturierte Erklärung
- Praktische Beispiele
- Schritt-für-Schritt Vorgehen
- Deutsche Sprache
- Maximal 300 Wörter"""
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.5,
                    max_output_tokens=400
                )
            )
            
            return response.text if response.text else "Erklärung konnte nicht generiert werden."
            
        except Exception as e:
            logging.error(f"Explanation generation error: {e}")
            return "Erklärung momentan nicht verfügbar."
