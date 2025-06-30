# Andromeda Learning Platform - Replit.md

## Overview

Andromeda is a gamified learning platform for complex numbers, designed with a Duolingo-like interface. The platform combines interactive lessons, AI-powered tutoring, and progressive gamification to create an engaging mathematical learning experience for engineering students.

## System Architecture

### Frontend Architecture
- **Framework**: Pure HTML/CSS/JavaScript with Bootstrap 5.3.0
- **Layout**: Three-column responsive design:
  - Left sidebar: Navigation (Learn, Practice, Profile)
  - Center: Main content area for lessons and learning path
  - Right sidebar: Gamification widgets (XP, lives, achievements)
- **UI Components**: Card-based lesson interface, progress bars, modal dialogs
- **Styling**: Custom CSS with Duolingo-inspired color scheme and animations

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Structure**: Modular design with utility classes
- **Session Management**: Flask sessions for user progress tracking
- **API Endpoints**: RESTful design for chat interactions and progress tracking

### Data Storage
- **Primary Storage**: JSON files for lesson content and structure
- **Session Storage**: Flask sessions for user progress (temporary)
- **Content Structure**: 
  - `lessons.json`: Interactive exercises and questions
  - `theory.json`: Theoretical content and explanations
  - `initial_test.json`: Placement test questions

## Key Components

### 1. Lesson Management System (`utils/lesson_manager.py`)
- **Purpose**: Centralized content management and progress tracking
- **Features**: JSON content loading, answer validation, hint system
- **Design Choice**: File-based storage chosen for simplicity and rapid prototyping

### 2. AI Tutor Integration (`utils/ai_handler.py`)
- **Purpose**: Contextual mathematical tutoring using Google Gemini API
- **Features**: Personalized explanations, step-by-step guidance, no direct answers
- **Design Choice**: Gemini API selected for strong mathematical reasoning capabilities

### 3. Gamification System (`static/js/gamification.js`)
- **Purpose**: User engagement through XP, achievements, and progress tracking
- **Features**: Daily goals, streak tracking, achievement unlocking
- **Design Choice**: Client-side implementation for responsive feedback

### 4. Learning Path Interface (`templates/index.html`)
- **Purpose**: Visual progression through structured curriculum
- **Features**: Node-based progression, locked/unlocked states, visual feedback
- **Design Choice**: Linear progression model for structured learning

## Data Flow

### User Journey
1. **Initial Assessment**: Placement test determines starting point
2. **Lesson Progression**: Step-by-step completion of interactive exercises
3. **Theory Integration**: Contextual theoretical content between lessons
4. **AI Support**: On-demand tutoring through chat interface
5. **Progress Tracking**: XP accumulation and achievement unlocking

### Content Delivery
1. Flask serves static content and templates
2. JavaScript controllers manage interactive lesson flow
3. AJAX calls handle AI tutor interactions
4. Session storage maintains progress state

## External Dependencies

### Required APIs
- **Google Gemini API**: AI tutoring functionality
  - Environment variable: `GEMINI_API_KEY`
  - Fallback: Graceful degradation with error message

### Frontend Libraries
- **Bootstrap 5.3.0**: UI framework and responsive design
- **Font Awesome 6.4.0**: Icon library for consistent visual elements

### Python Dependencies
- **Flask 2.3.3**: Web framework
- **google-genai**: Gemini API client library

## Deployment Strategy

### Replit Configuration
- **Environment**: Python runtime with Flask server
- **Port Configuration**: Standard Flask development server
- **File Structure**: Organized for Replit's automatic detection

### Environment Variables
- `GEMINI_API_KEY`: Required for AI tutor functionality
- `SESSION_SECRET`: Flask session security (defaults to dev key)

### Static Asset Serving
- CSS/JS files served through Flask's static file handling
- CDN dependencies for Bootstrap and Font Awesome
- Local assets for custom styling and functionality

## Development Notes

### Current Limitations
- No persistent database (sessions reset on server restart)
- File-based content storage (suitable for prototype phase)
- Single-user experience (no multi-user support)

### Extensibility Points
- Database integration ready (Drizzle ORM structure prepared)
- User authentication system can be added
- Content management interface potential
- Analytics and learning insights framework

### Code Organization
- Separation of concerns between utilities and presentation
- Modular JavaScript for feature expansion
- Template inheritance for consistent UI
- JSON-based content for easy modification

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.