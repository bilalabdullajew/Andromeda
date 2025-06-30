import os
import logging
from flask import Flask, render_template, request, jsonify, session
from utils.ai_handler import AIHandler
from utils.lesson_manager import LessonManager

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-key-change-in-production")

# Initialize handlers
ai_handler = AIHandler()
lesson_manager = LessonManager()

@app.route('/')
def index():
    """Main learning path page"""
    # Initialize session data if not exists
    if 'user_progress' not in session:
        session['user_progress'] = {
            'xp': 0,
            'lives': 3,
            'completed_lessons': [],
            'current_lesson': 1,
            'daily_xp': 0
        }
    return render_template('index.html', progress=session['user_progress'])

@app.route('/initial-test')
def initial_test():
    """Initial placement test"""
    questions = lesson_manager.get_initial_test()
    return render_template('initial_test.html', questions=questions)

@app.route('/lesson/<int:lesson_id>')
def lesson(lesson_id):
    """Individual lesson page"""
    lesson_data = lesson_manager.get_lesson(lesson_id)
    if not lesson_data:
        return "Lesson not found", 404
    return render_template('lesson.html', lesson=lesson_data, lesson_id=lesson_id)

@app.route('/api/chat', methods=['POST'])
def chat_with_tutor():
    """AI tutor chat endpoint"""
    try:
        data = request.get_json()
        user_message = data.get('message')
        lesson_context = data.get('context', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        response = ai_handler.get_tutor_response(user_message, lesson_context)
        return jsonify({'response': response})
    
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return jsonify({'error': 'Entschuldigung, ich kann momentan nicht antworten.'}), 500

@app.route('/api/hint/<int:lesson_id>/<int:question_id>/<int:hint_level>')
def get_hint(lesson_id, question_id, hint_level):
    """Get hint for specific question"""
    hint = lesson_manager.get_hint(lesson_id, question_id, hint_level)
    return jsonify({'hint': hint})

@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    """Submit answer and update progress"""
    try:
        data = request.get_json()
        lesson_id = data.get('lesson_id')
        question_id = data.get('question_id')
        answer = data.get('answer')
        
        # Check answer
        is_correct = lesson_manager.check_answer(lesson_id, question_id, answer)
        
        # Update session progress
        if 'user_progress' not in session:
            session['user_progress'] = {
                'xp': 0,
                'lives': 3,
                'completed_lessons': [],
                'current_lesson': 1,
                'daily_xp': 0
            }
        
        progress = session['user_progress']
        
        if is_correct:
            progress['xp'] += 5
            progress['daily_xp'] += 5
            
            # Check if the lesson is already completed
            if lesson_id not in progress['completed_lessons']:
                progress['completed_lessons'].append(lesson_id)
                
                # Unlock the next lesson
                progress['current_lesson'] = max(progress['current_lesson'], lesson_id + 1)
        else:
            progress['lives'] = max(0, progress['lives'] - 1)
        
        session['user_progress'] = progress
        session.modified = True
        
        return jsonify({
            'correct': is_correct,
            'xp': progress['xp'],
            'lives': progress['lives'],
            'daily_xp': progress['daily_xp'],
            'completed_lessons': progress['completed_lessons'],
            'current_lesson': progress['current_lesson']
        })
        
    except Exception as e:
        logging.error(f"Submit answer error: {e}")
        return jsonify({'error': 'Fehler beim Verarbeiten der Antwort'}), 500

@app.route('/api/progress')
def get_progress():
    """Get current user progress"""
    if 'user_progress' not in session:
        session['user_progress'] = {
            'xp': 0,
            'lives': 3,
            'completed_lessons': [],
            'current_lesson': 1,
            'daily_xp': 0
        }
    return jsonify(session['user_progress'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
