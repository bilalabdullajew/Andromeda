import json
import os
import logging

class LessonManager:
    """Manages lesson content and progress"""
    
    def __init__(self):
        self.data_path = 'data'
        
    def load_json(self, filename):
        """Load JSON data from file"""
        filepath = os.path.join(self.data_path, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logging.error(f"File not found: {filepath}")
            return {}
        except json.JSONDecodeError as e:
            logging.error(f"JSON decode error in {filepath}: {e}")
            return {}
    
    def get_initial_test(self):
        """Get initial placement test questions"""
        return self.load_json('initial_test.json')
    
    def get_lesson(self, lesson_id):
        """Get lesson data by ID"""
        lessons = self.load_json('lessons.json')
        return lessons.get(str(lesson_id), {})
    
    def get_theory(self, theory_id):
        """Get theory content by ID"""
        theory = self.load_json('theory.json')
        return theory.get(str(theory_id), {})
    
    def get_hint(self, lesson_id, question_id, hint_level):
        """Get hint for specific question"""
        lesson = self.get_lesson(lesson_id)
        questions = lesson.get('questions', [])
        
        if question_id < len(questions):
            hints = questions[question_id].get('hints', [])
            if hint_level < len(hints):
                return hints[hint_level]
        
        return "Kein Hinweis verfügbar."
    
    def check_answer(self, lesson_id, question_id, user_answer):
        """Check if user answer is correct"""
        lesson = self.get_lesson(lesson_id)
        questions = lesson.get('questions', [])
        
        if question_id < len(questions):
            correct_answer = questions[question_id].get('correct_answer')
            if isinstance(correct_answer, list):
                # Multiple correct answers possible
                return user_answer.strip().lower() in [ans.lower() for ans in correct_answer]
            else:
                return user_answer.strip().lower() == str(correct_answer).lower()
        
        return False
    
    def get_lesson_count(self):
        """Get total number of lessons"""
        lessons = self.load_json('lessons.json')
        return len(lessons)
