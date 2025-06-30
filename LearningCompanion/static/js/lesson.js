// Lesson interaction system for Andromeda
class LessonController {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = Date.now();
        this.hintsUsed = 0;
        this.maxHints = 3;
        this.timeSpent = 0;
        this.correctAnswers = 0;
        
        this.init();
    }
    
    init() {
        if (typeof lessonData === 'undefined' || !lessonData.questions) {
            console.error('Lesson data not available');
            return;
        }
        
        this.setupEventListeners();
        this.loadQuestion();
        this.updateProgress();
    }
    
    setupEventListeners() {
        // Check answer button
        const checkBtn = document.getElementById('check-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAnswer());
        }
        
        // Continue button
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        // Skip button
        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipQuestion());
        }
        
        // Hint button
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
        
        // Answer input changes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'answer' || e.target.classList.contains('answer-input')) {
                this.enableCheckButton();
            }
        });
        
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('answer-input')) {
                this.enableCheckButton();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const checkBtn = document.getElementById('check-btn');
                const continueBtn = document.getElementById('continue-btn');
                
                if (continueBtn && !continueBtn.classList.contains('d-none')) {
                    this.nextQuestion();
                } else if (checkBtn && !checkBtn.disabled) {
                    this.checkAnswer();
                }
            }
        });
    }
    
    loadQuestion() {
        if (this.currentQuestionIndex >= lessonData.questions.length) {
            this.completeLesson();
            return;
        }
        
        const question = lessonData.questions[this.currentQuestionIndex];
        
        // Update question content
        document.getElementById('question-title').textContent = question.title || `Frage ${this.currentQuestionIndex + 1}`;
        document.getElementById('question-text').textContent = question.question;
        
        // Update question type indicator
        const typeIndicator = document.getElementById('question-type');
        if (typeIndicator) {
            typeIndicator.textContent = this.getQuestionTypeLabel(question.type);
        }
        
        // Load question visual if exists
        this.loadQuestionVisual(question);
        
        // Setup answer section based on question type
        this.setupAnswerSection(question);
        
        // Reset UI state
        this.resetQuestionState();
        
        // Update progress
        this.updateProgress();
    }
    
    getQuestionTypeLabel(type) {
        const labels = {
            'multiple_choice': 'Multiple Choice',
            'text_input': 'Texteingabe',
            'calculation': 'Berechnung',
            'true_false': 'Richtig/Falsch',
            'matching': 'Zuordnung',
            'complex_input': 'Komplexe Zahl'
        };
        return labels[type] || 'Frage';
    }
    
    loadQuestionVisual(question) {
        const visualContainer = document.getElementById('question-visual');
        
        if (question.visual) {
            visualContainer.innerHTML = question.visual;
            visualContainer.style.display = 'block';
        } else if (question.formula) {
            visualContainer.innerHTML = `
                <div class="formula-display">
                    <div class="formula-content">${question.formula}</div>
                </div>
            `;
            visualContainer.style.display = 'block';
        } else {
            visualContainer.style.display = 'none';
        }
    }
    
    setupAnswerSection(question) {
        const answerSection = document.getElementById('answer-section');
        
        switch (question.type) {
            case 'multiple_choice':
                this.setupMultipleChoice(question, answerSection);
                break;
            case 'text_input':
            case 'calculation':
            case 'complex_input':
                this.setupTextInput(question, answerSection);
                break;
            case 'true_false':
                this.setupTrueFalse(question, answerSection);
                break;
            default:
                this.setupTextInput(question, answerSection);
        }
    }
    
    setupMultipleChoice(question, container) {
        container.innerHTML = `
            <div class="answer-options">
                ${question.options.map((option, index) => `
                    <div class="answer-option" data-value="${option}">
                        <input type="radio" name="answer" id="option${index}" value="${option}" class="form-check-input">
                        <label for="option${index}" class="form-check-label flex-grow-1">
                            ${option}
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add click handlers for entire option divs
        container.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', () => {
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Update visual selection
                container.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                this.enableCheckButton();
            });
        });
    }
    
    setupTextInput(question, container) {
        const placeholder = question.type === 'complex_input' 
            ? 'z.B. 3+4i oder 2-5i' 
            : question.placeholder || 'Deine Antwort...';
            
        container.innerHTML = `
            <div class="answer-input-container">
                <input type="text" 
                       class="form-control answer-input" 
                       placeholder="${placeholder}"
                       autocomplete="off">
                ${question.type === 'complex_input' ? `
                    <small class="form-text text-muted mt-2">
                        <i class="fas fa-info-circle me-1"></i>
                        Gib komplexe Zahlen in der Form a+bi ein (z.B. 3+4i, 2-5i, 7+0i)
                    </small>
                ` : ''}
            </div>
        `;
        
        // Focus the input
        const input = container.querySelector('.answer-input');
        setTimeout(() => input.focus(), 100);
    }
    
    setupTrueFalse(question, container) {
        container.innerHTML = `
            <div class="answer-options">
                <div class="answer-option" data-value="true">
                    <input type="radio" name="answer" id="optionTrue" value="true" class="form-check-input">
                    <label for="optionTrue" class="form-check-label flex-grow-1">
                        <i class="fas fa-check text-success me-2"></i>Richtig
                    </label>
                </div>
                <div class="answer-option" data-value="false">
                    <input type="radio" name="answer" id="optionFalse" value="false" class="form-check-input">
                    <label for="optionFalse" class="form-check-label flex-grow-1">
                        <i class="fas fa-times text-danger me-2"></i>Falsch
                    </label>
                </div>
            </div>
        `;
        
        // Add click handlers
        container.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', () => {
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                
                container.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                this.enableCheckButton();
            });
        });
    }
    
    enableCheckButton() {
        const checkBtn = document.getElementById('check-btn');
        if (checkBtn) {
            checkBtn.disabled = false;
        }
    }
    
    checkAnswer() {
        const userAnswer = this.getUserAnswer();
        if (!userAnswer) return;
        
        const question = lessonData.questions[this.currentQuestionIndex];
        const isCorrect = this.validateAnswer(userAnswer, question);
        
        // Store answer
        this.answers.push({
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.correct_answer,
            isCorrect: isCorrect,
            hintsUsed: this.hintsUsed,
            timeSpent: Date.now() - this.startTime
        });
        
        if (isCorrect) {
            this.correctAnswers++;
        }
        
        // Show feedback
        this.showFeedback(isCorrect, question);
        
        // Update gamification
        if (typeof dispatchQuestionAnswer === 'function') {
            dispatchQuestionAnswer(isCorrect, question.type);
        }
        
        // Update UI
        this.updateAnswerState(isCorrect);
        
        // Submit answer to server
        this.submitAnswerToServer(userAnswer, isCorrect);
    }
    
    getUserAnswer() {
        const radioAnswer = document.querySelector('input[name="answer"]:checked');
        if (radioAnswer) {
            return radioAnswer.value;
        }
        
        const textAnswer = document.querySelector('.answer-input');
        if (textAnswer) {
            return textAnswer.value.trim();
        }
        
        return null;
    }
    
    validateAnswer(userAnswer, question) {
        const correctAnswer = question.correct_answer;
        
        if (Array.isArray(correctAnswer)) {
            // Multiple correct answers
            return correctAnswer.some(answer => 
                this.compareAnswers(userAnswer, answer, question.type)
            );
        } else {
            return this.compareAnswers(userAnswer, correctAnswer, question.type);
        }
    }
    
    compareAnswers(userAnswer, correctAnswer, questionType) {
        if (questionType === 'complex_input') {
            return this.compareComplexNumbers(userAnswer, correctAnswer);
        }
        
        // Default string comparison (case-insensitive)
        return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    }
    
    compareComplexNumbers(userInput, correctAnswer) {
        try {
            const userComplex = this.parseComplexNumber(userInput);
            const correctComplex = this.parseComplexNumber(correctAnswer);
            
            if (!userComplex || !correctComplex) return false;
            
            // Compare with tolerance for floating point precision
            const tolerance = 1e-10;
            return Math.abs(userComplex.real - correctComplex.real) < tolerance &&
                   Math.abs(userComplex.imag - correctComplex.imag) < tolerance;
        } catch (error) {
            return false;
        }
    }
    
    parseComplexNumber(input) {
        // Parse complex numbers like "3+4i", "2-5i", "7", "3i", etc.
        if (!input || typeof input !== 'string') return null;
        
        const cleaned = input.replace(/\s/g, '').toLowerCase();
        
        // Handle pure real numbers
        if (/^[+-]?\d*\.?\d+$/.test(cleaned)) {
            return { real: parseFloat(cleaned), imag: 0 };
        }
        
        // Handle pure imaginary numbers
        if (/^[+-]?\d*\.?\d*i$/.test(cleaned)) {
            const imagStr = cleaned.replace('i', '');
            const imag = imagStr === '' || imagStr === '+' ? 1 : 
                        imagStr === '-' ? -1 : parseFloat(imagStr);
            return { real: 0, imag: imag };
        }
        
        // Handle complex numbers like "a+bi" or "a-bi"
        const complexRegex = /^([+-]?\d*\.?\d+)([+-]\d*\.?\d*)i$/;
        const match = cleaned.match(complexRegex);
        
        if (match) {
            const real = parseFloat(match[1]);
            const imagStr = match[2];
            const imag = imagStr === '+' ? 1 : imagStr === '-' ? -1 : parseFloat(imagStr);
            return { real: real, imag: imag };
        }
        
        return null;
    }
    
    showFeedback(isCorrect, question) {
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackAlert = document.getElementById('feedback-alert');
        const feedbackContent = document.getElementById('feedback-content');
        
        if (isCorrect) {
            feedbackAlert.className = 'alert alert-success';
            feedbackContent.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-check-circle text-success me-2 fs-4"></i>
                    <div>
                        <strong>Richtig!</strong>
                        ${question.feedback_correct || 'Gut gemacht!'}
                    </div>
                </div>
            `;
        } else {
            feedbackAlert.className = 'alert alert-danger';
            feedbackContent.innerHTML = `
                <div class="d-flex align-items-start">
                    <i class="fas fa-times-circle text-danger me-2 fs-4 mt-1"></i>
                    <div>
                        <strong>Nicht ganz richtig.</strong>
                        <div class="mt-2">
                            ${question.feedback_incorrect || 'Versuche es nochmal oder nutze einen Hinweis.'}
                        </div>
                        ${question.explanation ? `
                            <div class="mt-2">
                                <strong>Erklärung:</strong> ${question.explanation}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        feedbackSection.classList.remove('d-none');
        feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    updateAnswerState(isCorrect) {
        const checkBtn = document.getElementById('check-btn');
        const continueBtn = document.getElementById('continue-btn');
        
        // Disable check button and show continue button
        checkBtn.classList.add('d-none');
        continueBtn.classList.remove('d-none');
        
        // Update answer options visual state
        const answerOptions = document.querySelectorAll('.answer-option');
        const question = lessonData.questions[this.currentQuestionIndex];
        
        answerOptions.forEach(option => {
            const value = option.dataset.value;
            const radio = option.querySelector('input');
            
            radio.disabled = true;
            
            if (Array.isArray(question.correct_answer)) {
                if (question.correct_answer.includes(value)) {
                    option.classList.add('correct');
                }
            } else {
                if (value === question.correct_answer) {
                    option.classList.add('correct');
                }
            }
            
            if (radio.checked && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        // Disable text input
        const textInput = document.querySelector('.answer-input');
        if (textInput) {
            textInput.disabled = true;
        }
    }
    
    async submitAnswerToServer(userAnswer, isCorrect) {
        try {
            const response = await fetch('/api/submit_answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lesson_id: lessonId,
                    question_id: this.currentQuestionIndex,
                    answer: userAnswer,
                    is_correct: isCorrect,
                    hints_used: this.hintsUsed,
                    time_spent: Date.now() - this.startTime
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update gamification display
                if (window.gamification) {
                    window.gamification.user.xp = data.xp;
                    window.gamification.user.lives = data.lives;
                    window.gamification.user.daily_xp = data.daily_xp;
                    window.gamification.updateUI();
                }
            }
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        
        if (this.currentQuestionIndex >= lessonData.questions.length) {
            this.completeLesson();
        } else {
            this.loadQuestion();
        }
    }
    
    skipQuestion() {
        // Show confirmation modal
        const skipConfirm = confirm('Möchtest du diese Frage wirklich überspringen? Du erhältst keine Punkte dafür.');
        
        if (skipConfirm) {
            // Record as skipped
            const question = lessonData.questions[this.currentQuestionIndex];
            this.answers.push({
                question: question.question,
                userAnswer: 'SKIPPED',
                correctAnswer: question.correct_answer,
                isCorrect: false,
                hintsUsed: this.hintsUsed,
                timeSpent: Date.now() - this.startTime,
                skipped: true
            });
            
            this.nextQuestion();
        }
    }
    
    async showHint() {
        if (this.hintsUsed >= this.maxHints) {
            showNotification('Keine Hinweise mehr verfügbar!', 'warning');
            return;
        }
        
        try {
            const response = await fetch(`/api/hint/${lessonId}/${this.currentQuestionIndex}/${this.hintsUsed}`);
            const data = await response.json();
            
            if (data.hint) {
                this.displayHint(data.hint);
                this.hintsUsed++;
                this.updateHintButton();
            } else {
                showNotification('Kein Hinweis verfügbar.', 'info');
            }
        } catch (error) {
            console.error('Failed to get hint:', error);
            showNotification('Hinweis konnte nicht geladen werden.', 'error');
        }
    }
    
    displayHint(hintText) {
        // Create hint modal or insert into page
        const hintModal = document.createElement('div');
        hintModal.className = 'modal fade';
        hintModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-lightbulb text-warning me-2"></i>
                            Hinweis
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="hint-content">
                            ${hintText}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(hintModal);
        const modal = new bootstrap.Modal(hintModal);
        modal.show();
        
        hintModal.addEventListener('hidden.bs.modal', () => {
            hintModal.remove();
        });
    }
    
    updateHintButton() {
        const hintBtn = document.getElementById('hint-btn');
        const hintCount = document.getElementById('hint-count');
        
        if (hintBtn && hintCount) {
            const remaining = this.maxHints - this.hintsUsed;
            hintCount.textContent = remaining;
            
            if (remaining === 0) {
                hintBtn.disabled = true;
                hintBtn.innerHTML = '<i class="fas fa-lightbulb me-1"></i>Keine Hinweise mehr';
            }
        }
    }
    
    updateProgress() {
        const progressBar = document.getElementById('lesson-progress');
        const currentQuestionSpan = document.getElementById('current-question');
        const totalQuestionsSpan = document.getElementById('total-questions');
        
        if (progressBar) {
            const progress = ((this.currentQuestionIndex + 1) / lessonData.questions.length) * 100;
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', progress);
        }
        
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
        }
        
        if (totalQuestionsSpan) {
            totalQuestionsSpan.textContent = lessonData.questions.length;
        }
    }
    
    resetQuestionState() {
        // Reset UI elements
        const checkBtn = document.getElementById('check-btn');
        const continueBtn = document.getElementById('continue-btn');
        const feedbackSection = document.getElementById('feedback-section');
        
        if (checkBtn) {
            checkBtn.classList.remove('d-none');
            checkBtn.disabled = true;
        }
        
        if (continueBtn) {
            continueBtn.classList.add('d-none');
        }
        
        if (feedbackSection) {
            feedbackSection.classList.add('d-none');
        }
        
        // Reset hint button
        const hintBtn = document.getElementById('hint-btn');
        const hintCount = document.getElementById('hint-count');
        
        if (hintBtn && hintCount) {
            hintBtn.disabled = false;
            hintCount.textContent = this.maxHints;
            hintBtn.innerHTML = '<i class="fas fa-lightbulb me-1"></i>Hinweis <span class="badge bg-warning text-dark" id="hint-count">3</span>';
        }
    }
    
    completeLesson() {
        this.timeSpent = Date.now() - this.startTime;
        
        // Calculate statistics
        const accuracy = this.correctAnswers / lessonData.questions.length;
        const earnedXP = this.calculateXP();
        
        // Dispatch lesson completion event
        if (typeof dispatchLessonComplete === 'function') {
            dispatchLessonComplete(
                lessonId,
                this.correctAnswers,
                lessonData.questions.length,
                Math.floor(this.timeSpent / 1000)
            );
        }
        
        // Show completion modal
        this.showCompletionModal(accuracy, earnedXP);
    }
    
    calculateXP() {
        let xp = 20; // Base XP
        
        const accuracy = this.correctAnswers / lessonData.questions.length;
        if (accuracy >= 0.9) xp += 15;
        else if (accuracy >= 0.8) xp += 10;
        else if (accuracy >= 0.7) xp += 5;
        
        // Time bonus
        const timeInMinutes = this.timeSpent / (1000 * 60);
        if (timeInMinutes < 5) xp += 10;
        else if (timeInMinutes < 10) xp += 5;
        
        return xp;
    }
    
    showCompletionModal(accuracy, earnedXP) {
        const modal = document.getElementById('lessonCompleteModal');
        
        if (modal) {
            // Update completion stats
            document.getElementById('earned-xp').textContent = `+${earnedXP} XP`;
            document.getElementById('accuracy').textContent = `${Math.round(accuracy * 100)}% Genauigkeit`;
            
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        } else {
            // Fallback: redirect to main page
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    }
}

// Initialize lesson controller
let lessonController;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lessonData !== 'undefined' && lessonData) {
        lessonController = new LessonController();
        
        // Make it globally accessible
        window.lessonController = lessonController;
    }
});

// Utility functions
function getCurrentQuestionIndex() {
    return lessonController ? lessonController.currentQuestionIndex : 0;
}

function restartLesson() {
    if (confirm('Möchtest du die Lektion wirklich neu starten? Dein Fortschritt geht verloren.')) {
        location.reload();
    }
}

function formatComplexNumber(real, imag) {
    if (imag === 0) return real.toString();
    if (real === 0) return imag === 1 ? 'i' : imag === -1 ? '-i' : `${imag}i`;
    
    const imagPart = imag === 1 ? '+i' : imag === -1 ? '-i' : 
                    imag > 0 ? `+${imag}i` : `${imag}i`;
    
    return `${real}${imagPart}`;
}

