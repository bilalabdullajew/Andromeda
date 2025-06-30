// Main application JavaScript
class AndromedaApp {
    constructor() {
        this.currentUser = {
            xp: 0,
            lives: 3,
            completed_lessons: [],
            current_lesson: 1,
            daily_xp: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadUserProgress();
        this.initializeEventListeners();
        this.checkFirstVisit();
        this.updateUI();
    }
    
    loadUserProgress() {
        // Load progress from API
        fetch('/api/progress')
            .then(response => response.json())
            .then(data => {
                this.currentUser = data;
                this.updateUI();
            })
            .catch(error => {
                console.error('Failed to load progress:', error);
            });
    }
    
    initializeEventListeners() {
        // Learning path node clicks
        document.querySelectorAll('.path-node').forEach(node => {
            node.addEventListener('click', (e) => {
                if (!node.classList.contains('locked')) {
                    this.handleNodeClick(node);
                }
            });
        });
        
        // Start buttons
        document.querySelectorAll('.start-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const node = btn.closest('.path-node');
                if (!node.classList.contains('locked')) {
                    this.handleNodeClick(node);
                }
            });
        });
        
        // Navigation icons
        document.querySelectorAll('.nav-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                this.handleNavigation(icon.dataset.section);
            });
        });
        
        // Placement test
        const startTestBtn = document.getElementById('startPlacementTest');
        if (startTestBtn) {
            startTestBtn.addEventListener('click', () => {
                window.location.href = '/initial-test';
            });
        }
    }
    
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('andromeda_visited');
        if (!hasVisited) {
            // Show welcome modal
            const welcomeModal = document.getElementById('welcomeModal');
            if (welcomeModal) {
                const modal = new bootstrap.Modal(welcomeModal);
                modal.show();
                localStorage.setItem('andromeda_visited', 'true');
            }
        }
    }
    
    handleNodeClick(node) {
        const lessonId = node.dataset.lesson;
        const theoryId = node.dataset.theory;
        const rewardId = node.dataset.reward;
        
        if (lessonId) {
            // Navigate to lesson
            window.location.href = `/lesson/${lessonId}`;
        } else if (theoryId) {
            // Show theory modal or navigate
            this.showTheoryContent(theoryId);
        } else if (rewardId) {
            // Show reward modal
            this.showReward(rewardId);
        }
    }
    
    showTheoryContent(theoryId) {
        // Create and show theory modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-book me-2"></i>
                            Theorie laden...
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Wird geladen...</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                        <button type="button" class="btn btn-primary" id="continueFromTheory">Weiter</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Load theory content
        this.loadTheoryContent(theoryId, modal);
        
        // Remove modal after closing
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    loadTheoryContent(theoryId, modal) {
        // Simulate theory content loading
        setTimeout(() => {
            const modalTitle = modal.querySelector('.modal-title');
            const modalBody = modal.querySelector('.modal-body');
            
            modalTitle.innerHTML = `
                <i class="fas fa-book me-2"></i>
                Theorie: Darstellung komplexer Zahlen
            `;
            
            modalBody.innerHTML = `
                <div class="theory-content">
                    <h6>Algebraische Form</h6>
                    <p>Eine komplexe Zahl z kann in der Form <strong>z = a + bi</strong> dargestellt werden, wobei:</p>
                    <ul>
                        <li><strong>a</strong> der Realteil (Re(z)) ist</li>
                        <li><strong>b</strong> der Imaginärteil (Im(z)) ist</li>
                        <li><strong>i</strong> die imaginäre Einheit mit i² = -1</li>
                    </ul>
                    
                    <h6>Geometrische Interpretation</h6>
                    <p>Komplexe Zahlen können als Punkte in der Gaußschen Zahlenebene dargestellt werden:</p>
                    <div class="text-center my-3">
                        <div class="theory-visual bg-light p-3 rounded">
                            <p><i class="fas fa-chart-line text-primary"></i> Koordinatensystem mit Real- und Imaginärachse</p>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-lightbulb me-2"></i>
                        <strong>Merktipp:</strong> Die x-Achse repräsentiert den Realteil, die y-Achse den Imaginärteil.
                    </div>
                </div>
            `;
            
            // Continue button functionality
            const continueBtn = modal.querySelector('#continueFromTheory');
            continueBtn.addEventListener('click', () => {
                // Mark theory as completed and unlock next lesson
                this.completeTheory(theoryId);
                bootstrap.Modal.getInstance(modal).hide();
            });
        }, 1500);
    }
    
    showReward(rewardId) {
        // Show reward modal with animations
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header border-0">
                        <h5 class="modal-title text-center w-100">
                            <i class="fas fa-trophy text-warning me-2"></i>
                            Schatztruhe geöffnet!
                        </h5>
                    </div>
                    <div class="modal-body text-center">
                        <div class="reward-animation mb-4">
                            <i class="fas fa-gem text-warning" style="font-size: 4rem;"></i>
                        </div>
                        <h4>Glückwunsch!</h4>
                        <p>Du hast eine Belohnung erhalten:</p>
                        <div class="reward-items">
                            <div class="badge bg-primary me-2">+50 XP</div>
                            <div class="badge bg-success me-2">Perfektionist Erfolg</div>
                            <div class="badge bg-warning">Bonus Leben</div>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center border-0">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="fas fa-check me-1"></i>Awesome!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Add bounce animation to gem
        const gem = modal.querySelector('.fas.fa-gem');
        gem.classList.add('bounce-in');
        
        // Apply rewards
        this.currentUser.xp += 50;
        this.currentUser.daily_xp += 50;
        this.currentUser.lives = Math.min(5, this.currentUser.lives + 1);
        this.updateUI();
        
        // Remove modal after closing
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    completeTheory(theoryId) {
        // Mark theory as completed and unlock next content
        console.log(`Theory ${theoryId} completed`);
        
        // Update UI to show next unlocked content
        const nextNode = document.querySelector(`[data-lesson="2"]`);
        if (nextNode) {
            nextNode.classList.remove('locked');
            nextNode.classList.add('active');
            const btn = nextNode.querySelector('.start-btn');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play me-1"></i>START';
                btn.classList.remove('btn-outline-success');
                btn.classList.add('btn-success');
            }
        }
    }
    
    handleNavigation(section) {
        // Handle navigation between sections
        document.querySelectorAll('.nav-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        switch(section) {
            case 'learn':
                // Already on learning page
                break;
            case 'practice':
                this.showComingSoon('Übungsmodus');
                break;
            case 'profile':
                this.showProfile();
                break;
        }
    }
    
    showComingSoon(feature) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-rocket me-2"></i>
                            Bald verfügbar!
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <i class="fas fa-tools text-primary" style="font-size: 3rem;"></i>
                        </div>
                        <h4>${feature}</h4>
                        <p class="text-muted">Diese Funktion wird bald verfügbar sein. Bleib dran!</p>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    showProfile() {
        // Show user profile modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user me-2"></i>
                            Dein Profil
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="profile-stats">
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="stat-card p-3">
                                        <i class="fas fa-star text-warning mb-2" style="font-size: 2rem;"></i>
                                        <h5>${this.currentUser.xp}</h5>
                                        <small class="text-muted">Gesamt XP</small>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="stat-card p-3">
                                        <i class="fas fa-fire text-danger mb-2" style="font-size: 2rem;"></i>
                                        <h5>0</h5>
                                        <small class="text-muted">Tage Serie</small>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="stat-card p-3">
                                        <i class="fas fa-trophy text-warning mb-2" style="font-size: 2rem;"></i>
                                        <h5>0</h5>
                                        <small class="text-muted">Erfolge</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <div class="profile-settings">
                            <h6>Einstellungen</h6>
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" id="soundEffects" checked>
                                <label class="form-check-label" for="soundEffects">
                                    Soundeffekte
                                </label>
                            </div>
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" id="dailyReminder" checked>
                                <label class="form-check-label" for="dailyReminder">
                                    Tägliche Erinnerungen
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    updateUI() {
        // Update XP progress
        const xpProgress = document.getElementById('xp-progress');
        const xpText = document.getElementById('xp-text');
        
        if (xpProgress && xpText) {
            const dailyGoal = 20;
            const percentage = Math.min((this.currentUser.daily_xp / dailyGoal) * 100, 100);
            xpProgress.style.width = percentage + '%';
            xpText.textContent = `${this.currentUser.daily_xp}/${dailyGoal} XP`;
        }
        
        // Update lives
        document.querySelectorAll('.life-heart').forEach((heart, index) => {
            if (index < this.currentUser.lives) {
                heart.classList.add('active');
            } else {
                heart.classList.remove('active');
            }
        });
        
        // Update achievement states
        this.updateAchievements();
    }
    
    updateAchievements() {
        const achievements = document.querySelectorAll('.achievement');
        
        achievements.forEach(achievement => {
            const type = achievement.dataset.achievement;
            let unlocked = false;
            
            switch(type) {
                case 'first-lesson':
                    unlocked = this.currentUser.completed_lessons.length > 0;
                    break;
                case 'streak-3':
                    unlocked = false; // Implement streak tracking
                    break;
                case 'perfectionist':
                    unlocked = false; // Implement perfect score tracking
                    break;
                case 'fast-learner':
                    unlocked = false; // Implement time-based tracking
                    break;
            }
            
            if (unlocked) {
                achievement.classList.remove('locked');
                achievement.classList.add('unlocked');
            }
        });
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('d-none');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('d-none');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.andromedaApp = new AndromedaApp();
});

// Utility functions
function showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bootstrapToast = new bootstrap.Toast(toast);
    bootstrapToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}
