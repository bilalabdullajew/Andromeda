// AI Tutor Chat System
class AITutor {
    constructor() {
        this.chatContainer = null;
        this.chatInput = null;
        this.sendButton = null;
        this.isLoading = false;
        this.chatHistory = [];
        this.currentContext = '';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadChatHistory();
    }
    
    setupEventListeners() {
        // Tutor button to open modal
        const tutorBtn = document.getElementById('tutor-btn');
        if (tutorBtn) {
            tutorBtn.addEventListener('click', () => {
                this.openTutorModal();
            });
        }
        
        // Send message button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'send-chat') {
                this.sendMessage();
            }
        });
        
        // Enter key in chat input
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'chat-input' && e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Modal shown event
        document.addEventListener('shown.bs.modal', (e) => {
            if (e.target.id === 'tutorModal') {
                const chatInput = document.getElementById('chat-input');
                if (chatInput) {
                    chatInput.focus();
                }
            }
        });
    }
    
    openTutorModal() {
        const modal = document.getElementById('tutorModal');
        if (modal) {
            // Update context based on current lesson
            this.updateContext();
            
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }
    
    updateContext() {
        // Get current lesson context
        if (typeof lessonData !== 'undefined' && lessonData) {
            this.currentContext = `Lektion: ${lessonData.title}. `;
            
            // Add current question context if available
            const currentQuestionIndex = this.getCurrentQuestionIndex();
            if (currentQuestionIndex >= 0 && lessonData.questions) {
                const question = lessonData.questions[currentQuestionIndex];
                this.currentContext += `Aktuelle Frage: ${question.question}`;
            }
        }
    }
    
    getCurrentQuestionIndex() {
        // Get current question index from lesson controller
        const currentQuestionElement = document.getElementById('current-question');
        if (currentQuestionElement) {
            return parseInt(currentQuestionElement.textContent) - 1;
        }
        return 0;
    }
    
    loadChatHistory() {
        // Load chat history from session storage
        const saved = sessionStorage.getItem('tutor_chat_history');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
        }
    }
    
    saveChatHistory() {
        sessionStorage.setItem('tutor_chat_history', JSON.stringify(this.chatHistory));
    }
    
    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message || this.isLoading) {
            return;
        }
        
        // Clear input
        chatInput.value = '';
        
        // Add user message to chat
        this.addMessageToChat(message, 'user');
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Send message to AI
            const response = await this.sendToAI(message);
            
            // Add AI response to chat
            this.addMessageToChat(response, 'tutor');
            
        } catch (error) {
            console.error('AI Tutor error:', error);
            this.addMessageToChat(
                'Entschuldigung, ich kann momentan nicht antworten. Versuche es später erneut.',
                'tutor'
            );
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async sendToAI(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: this.currentContext
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.response;
    }
    
    addMessageToChat(message, sender) {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}-message fade-in`;
        
        const avatar = sender === 'tutor' 
            ? '<i class="fas fa-robot"></i>'
            : '<i class="fas fa-user"></i>';
        
        const senderName = sender === 'tutor' ? 'Tutor' : 'Du';
        
        messageElement.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <strong>${senderName}:</strong> ${this.formatMessage(message)}
            </div>
        `;
        
        chatContainer.appendChild(messageElement);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Save to history
        this.chatHistory.push({ message, sender, timestamp: Date.now() });
        this.saveChatHistory();
        
        // Add animation
        setTimeout(() => {
            messageElement.classList.add('slide-in-up');
        }, 50);
    }
    
    formatMessage(message) {
        // Format message with basic markdown-like support
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    setLoadingState(loading) {
        this.isLoading = loading;
        const sendButton = document.getElementById('send-chat');
        const chatInput = document.getElementById('chat-input');
        
        if (loading) {
            sendButton.disabled = true;
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            chatInput.disabled = true;
            
            // Add typing indicator
            this.showTypingIndicator();
        } else {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            chatInput.disabled = false;
            chatInput.focus();
            
            // Remove typing indicator
            this.hideTypingIndicator();
        }
    }
    
    showTypingIndicator() {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message tutor-message typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatContainer.appendChild(typingElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add typing animation CSS if not exists
        if (!document.getElementById('typing-style')) {
            const style = document.createElement('style');
            style.id = 'typing-style';
            style.textContent = `
                .typing-dots {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }
                
                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #999;
                    animation: typing 1.4s infinite ease-in-out;
                }
                
                .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
                .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes typing {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    clearChat() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            // Keep the initial welcome message
            const welcomeMessage = chatContainer.querySelector('.tutor-message');
            chatContainer.innerHTML = '';
            if (welcomeMessage) {
                chatContainer.appendChild(welcomeMessage);
            }
        }
        
        this.chatHistory = [];
        this.saveChatHistory();
    }
    
    showQuickHelp() {
        const quickHelp = [
            "Ich kann dir bei folgenden Themen helfen:",
            "• Erklärung komplexer Zahlen",
            "• Schritt-für-Schritt Lösungen",
            "• Konzeptuelle Fragen",
            "• Beispiele und Analogien",
            "",
            "Stelle einfach deine Frage!"
        ].join('\n');
        
        this.addMessageToChat(quickHelp, 'tutor');
    }
    
    suggestQuestions() {
        const suggestions = [
            "Was ist die imaginäre Einheit i?",
            "Wie rechne ich mit komplexen Zahlen?",
            "Was bedeutet die geometrische Darstellung?",
            "Kannst du mir ein Beispiel zeigen?"
        ];
        
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        const suggestionsElement = document.createElement('div');
        suggestionsElement.className = 'chat-suggestions';
        suggestionsElement.innerHTML = `
            <div class="suggestions-header">
                <small class="text-muted">Vorschläge:</small>
            </div>
            <div class="suggestions-list">
                ${suggestions.map(suggestion => 
                    `<button class="btn btn-sm btn-outline-primary suggestion-btn" data-suggestion="${suggestion}">
                        ${suggestion}
                    </button>`
                ).join('')}
            </div>
        `;
        
        chatContainer.appendChild(suggestionsElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add click handlers for suggestions
        suggestionsElement.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                document.getElementById('chat-input').value = suggestion;
                suggestionsElement.remove();
            });
        });
        
        // Add suggestions CSS if not exists
        if (!document.getElementById('suggestions-style')) {
            const style = document.createElement('style');
            style.id = 'suggestions-style';
            style.textContent = `
                .chat-suggestions {
                    margin: 1rem 0;
                    padding: 1rem;
                    background-color: var(--background-color);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                }
                
                .suggestions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                
                .suggestion-btn {
                    text-align: left;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                }
                
                .suggestion-btn:hover {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    exportChatHistory() {
        const history = this.chatHistory.map(entry => 
            `[${new Date(entry.timestamp).toLocaleString()}] ${entry.sender === 'tutor' ? 'Tutor' : 'Du'}: ${entry.message}`
        ).join('\n');
        
        const blob = new Blob([history], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tutor-chat-history.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize AI Tutor
let aiTutor;

document.addEventListener('DOMContentLoaded', () => {
    aiTutor = new AITutor();
    
    // Make it globally accessible
    window.aiTutor = aiTutor;
});

// Utility functions for tutor integration
function askTutorAboutQuestion() {
    if (typeof lessonData !== 'undefined' && lessonData) {
        const currentQuestionIndex = aiTutor.getCurrentQuestionIndex();
        const question = lessonData.questions[currentQuestionIndex];
        
        if (question) {
            const message = `Ich brauche Hilfe bei dieser Frage: "${question.question}"`;
            document.getElementById('chat-input').value = message;
            aiTutor.openTutorModal();
        }
    }
}

function askTutorForConcept(concept) {
    const message = `Kannst du mir das Konzept "${concept}" erklären?`;
    document.getElementById('chat-input').value = message;
    aiTutor.openTutorModal();
}

function askTutorForExample(topic) {
    const message = `Kannst du mir ein Beispiel für "${topic}" zeigen?`;
    document.getElementById('chat-input').value = message;
    aiTutor.openTutorModal();
}
