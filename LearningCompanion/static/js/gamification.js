// Gamification system for Andromeda
class GamificationSystem {
    constructor() {
        this.user = {
            xp: 0,
            lives: 3,
            streak: 0,
            daily_xp: 0,
            achievements: [],
            level: 1
        };
        
        this.achievements = {
            'first-lesson': {
                name: 'Erste Schritte',
                description: 'Absolviere deine erste Lektion',
                icon: 'fas fa-star',
                xp: 10
            },
            'streak-3': {
                name: '3-Tage-Serie',
                description: 'Lerne 3 Tage hintereinander',
                icon: 'fas fa-fire',
                xp: 25
            },
            'perfectionist': {
                name: 'Perfektionist',
                description: 'Beantworte alle Fragen einer Lektion richtig',
                icon: 'fas fa-gem',
                xp: 50
            },
            'fast-learner': {
                name: 'Schnelllerner',
                description: 'Beende eine Lektion in unter 2 Minuten',
                icon: 'fas fa-bolt',
                xp: 30
            },
            'math-wizard': {
                name: 'Mathe-Zauberer',
                description: 'Erreiche Level 5',
                icon: 'fas fa-hat-wizard',
                xp: 100
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
        this.startDailyReset();
    }
    
    loadUserData() {
        // Load from localStorage or API
        const saved = localStorage.getItem('andromeda_gamification');
        if (saved) {
            this.user = { ...this.user, ...JSON.parse(saved) };
        }
    }
    
    saveUserData() {
        localStorage.setItem('andromeda_gamification', JSON.stringify(this.user));
    }
    
    setupEventListeners() {
        // Listen for custom events from lessons
        document.addEventListener('lesson-completed', (e) => {
            this.handleLessonComplete(e.detail);
        });
        
        document.addEventListener('question-answered', (e) => {
            this.handleQuestionAnswer(e.detail);
        });
        
        document.addEventListener('achievement-unlocked', (e) => {
            this.showAchievementModal(e.detail);
        });
    }
    
    addXP(amount, reason = '') {
        this.user.xp += amount;
        this.user.daily_xp += amount;
        
        // Check for level up
        const newLevel = this.calculateLevel(this.user.xp);
        if (newLevel > this.user.level) {
            this.user.level = newLevel;
            this.showLevelUpAnimation(newLevel);
        }
        
        // Show XP animation
        this.showXPAnimation(amount, reason);
        
        this.updateUI();
        this.saveUserData();
    }
    
    loseLife() {
        if (this.user.lives > 0) {
            this.user.lives--;
            this.showLifeLostAnimation();
            
            if (this.user.lives === 0) {
                this.showOutOfLivesModal();
            }
            
            this.updateUI();
            this.saveUserData();
        }
    }
    
    restoreLife() {
        if (this.user.lives < 5) {
            this.user.lives++;
            this.showLifeGainedAnimation();
            this.updateUI();
            this.saveUserData();
        }
    }
    
    calculateLevel(xp) {
        // XP required for each level: 100, 250, 450, 700, 1000, ...
        let level = 1;
        let requiredXP = 100;
        let totalRequired = 0;
        
        while (xp >= totalRequired + requiredXP) {
            totalRequired += requiredXP;
            level++;
            requiredXP += 150; // Increase XP requirement
        }
        
        return level;
    }
    
    getXPForNextLevel() {
        const currentLevelXP = this.getXPForLevel(this.user.level);
        const nextLevelXP = this.getXPForLevel(this.user.level + 1);
        return nextLevelXP - currentLevelXP;
    }
    
    getXPForLevel(level) {
        let totalXP = 0;
        let requiredXP = 100;
        
        for (let i = 1; i < level; i++) {
            totalXP += requiredXP;
            requiredXP += 150;
        }
        
        return totalXP;
    }
    
    checkAchievement(achievementId, condition) {
        if (!this.user.achievements.includes(achievementId) && condition) {
            this.unlockAchievement(achievementId);
        }
    }
    
    unlockAchievement(achievementId) {
        if (!this.user.achievements.includes(achievementId)) {
            this.user.achievements.push(achievementId);
            const achievement = this.achievements[achievementId];
            
            if (achievement) {
                this.addXP(achievement.xp, `Erfolg: ${achievement.name}`);
                this.showAchievementModal(achievement);
            }
            
            this.saveUserData();
        }
    }
    
    handleLessonComplete(data) {
        const { lessonId, correctAnswers, totalQuestions, timeSpent } = data;
        
        // Base XP for completing lesson
        let xp = 20;
        
        // Bonus for accuracy
        const accuracy = correctAnswers / totalQuestions;
        if (accuracy >= 0.9) xp += 15;
        else if (accuracy >= 0.8) xp += 10;
        else if (accuracy >= 0.7) xp += 5;
        
        // Bonus for speed
        if (timeSpent < 120) { // Under 2 minutes
            xp += 10;
            this.checkAchievement('fast-learner', true);
        }
        
        this.addXP(xp, 'Lektion abgeschlossen');
        
        // Check achievements
        this.checkAchievement('first-lesson', true);
        this.checkAchievement('perfectionist', accuracy === 1.0);
        
        // Update streak
        this.updateStreak();
    }
    
    handleQuestionAnswer(data) {
        const { correct, questionType } = data;
        
        if (correct) {
            this.addXP(5, 'Richtige Antwort');
        } else {
            this.loseLife();
        }
    }
    
    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('andromeda_last_active');
        
        if (lastActive === today) {
            // Already updated today
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive === yesterday.toDateString()) {
            // Continuing streak
            this.user.streak++;
        } else {
            // New streak
            this.user.streak = 1;
        }
        
        localStorage.setItem('andromeda_last_active', today);
        
        // Check streak achievements
        this.checkAchievement('streak-3', this.user.streak >= 3);
        
        this.saveUserData();
    }
    
    updateUI() {
        // Update XP progress
        this.updateXPDisplay();
        
        // Update lives
        this.updateLivesDisplay();
        
        // Update level
        this.updateLevelDisplay();
        
        // Update achievements
        this.updateAchievementsDisplay();
        
        // Update streak
        this.updateStreakDisplay();
    }
    
    updateXPDisplay() {
        const xpProgress = document.getElementById('xp-progress');
        const xpText = document.getElementById('xp-text');
        
        if (xpProgress && xpText) {
            const dailyGoal = 50;
            const percentage = Math.min((this.user.daily_xp / dailyGoal) * 100, 100);
            
            xpProgress.style.width = percentage + '%';
            xpText.textContent = `${this.user.daily_xp}/${dailyGoal} XP`;
            
            if (percentage >= 100) {
                xpProgress.classList.add('bg-success');
                this.checkAchievement('daily-goal', true);
            }
        }
    }
    
    updateLivesDisplay() {
        document.querySelectorAll('.life-heart').forEach((heart, index) => {
            if (index < this.user.lives) {
                heart.classList.add('active');
                heart.style.color = '#ff4b4b';
            } else {
                heart.classList.remove('active');
                heart.style.color = '#ddd';
            }
        });
    }
    
    updateLevelDisplay() {
        const levelElement = document.getElementById('user-level');
        if (levelElement) {
            levelElement.textContent = this.user.level;
        }
    }
    
    updateAchievementsDisplay() {
        document.querySelectorAll('.achievement').forEach(element => {
            const achievementId = element.dataset.achievement;
            
            if (this.user.achievements.includes(achievementId)) {
                element.classList.remove('locked');
                element.classList.add('unlocked');
                
                // Add glow effect
                element.style.boxShadow = '0 0 15px rgba(255, 200, 0, 0.5)';
            }
        });
    }
    
    updateStreakDisplay() {
        const streakElement = document.getElementById('streak-text');
        if (streakElement) {
            streakElement.textContent = `🔥 ${this.user.streak}`;
        }
    }
    
    showXPAnimation(amount, reason) {
        const xpAnimation = document.createElement('div');
        xpAnimation.className = 'xp-animation';
        xpAnimation.innerHTML = `
            <div class="xp-popup">
                +${amount} XP
                ${reason ? `<br><small>${reason}</small>` : ''}
            </div>
        `;
        
        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            .xp-animation {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                pointer-events: none;
            }
            
            .xp-popup {
                background: linear-gradient(135deg, #00d4aa, #58cc02);
                color: white;
                padding: 1rem 2rem;
                border-radius: 25px;
                font-weight: bold;
                font-size: 1.2rem;
                text-align: center;
                box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
                animation: xpBounce 2s ease-out forwards;
            }
            
            @keyframes xpBounce {
                0% {
                    opacity: 0;
                    transform: scale(0.3) translateY(0);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1) translateY(-20px);
                }
                70% {
                    transform: scale(1) translateY(-10px);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.8) translateY(-50px);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(xpAnimation);
        
        // Remove after animation
        setTimeout(() => {
            xpAnimation.remove();
            style.remove();
        }, 2000);
    }
    
    showLevelUpAnimation(newLevel) {
        const levelUpModal = document.createElement('div');
        levelUpModal.className = 'modal fade';
        levelUpModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body text-center p-5">
                        <div class="level-up-animation mb-4">
                            <i class="fas fa-trophy text-warning" style="font-size: 4rem;"></i>
                        </div>
                        <h2 class="text-gradient mb-3">Level Up!</h2>
                        <h3>Level ${newLevel}</h3>
                        <p class="text-muted">Du wirst immer besser!</p>
                        <div class="level-rewards mt-4">
                            <div class="badge bg-primary me-2">+1 Leben</div>
                            <div class="badge bg-success">Neue Inhalte freigeschaltet</div>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center border-0">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="fas fa-rocket me-1"></i>Weiter so!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(levelUpModal);
        const modal = new bootstrap.Modal(levelUpModal);
        modal.show();
        
        // Add celebration animation
        const trophy = levelUpModal.querySelector('.fas.fa-trophy');
        trophy.style.animation = 'bounce 1s infinite';
        
        // Give level-up rewards
        this.restoreLife();
        
        levelUpModal.addEventListener('hidden.bs.modal', () => {
            levelUpModal.remove();
        });
    }
    
    showAchievementModal(achievement) {
        const achievementModal = document.createElement('div');
        achievementModal.className = 'modal fade';
        achievementModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body text-center p-5">
                        <div class="achievement-animation mb-4">
                            <i class="${achievement.icon} text-warning" style="font-size: 4rem;"></i>
                        </div>
                        <h3>Erfolg freigeschaltet!</h3>
                        <h4 class="text-primary">${achievement.name}</h4>
                        <p class="text-muted">${achievement.description}</p>
                        <div class="achievement-reward">
                            <span class="badge bg-warning">+${achievement.xp} XP</span>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center border-0">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="fas fa-check me-1"></i>Klasse!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(achievementModal);
        const modal = new bootstrap.Modal(achievementModal);
        modal.show();
        
        // Add glow animation
        const icon = achievementModal.querySelector(`.${achievement.icon}`);
        icon.style.animation = 'glow 2s ease-in-out infinite alternate';
        
        // Add glow CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow {
                from { text-shadow: 0 0 10px #ffc800, 0 0 20px #ffc800, 0 0 30px #ffc800; }
                to { text-shadow: 0 0 20px #ffc800, 0 0 30px #ffc800, 0 0 40px #ffc800; }
            }
        `;
        document.head.appendChild(style);
        
        achievementModal.addEventListener('hidden.bs.modal', () => {
            achievementModal.remove();
            style.remove();
        });
    }
    
    showLifeLostAnimation() {
        // Shake animation for life lost
        document.querySelectorAll('.life-heart').forEach(heart => {
            if (!heart.classList.contains('active')) {
                heart.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    heart.style.animation = '';
                }, 500);
            }
        });
        
        // Add shake CSS if not exists
        if (!document.getElementById('shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showLifeGainedAnimation() {
        // Pulse animation for life gained
        document.querySelectorAll('.life-heart.active').forEach(heart => {
            heart.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                heart.style.animation = '';
            }, 600);
        });
    }
    
    showOutOfLivesModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body text-center p-5">
                        <div class="mb-4">
                            <i class="fas fa-heart-broken text-danger" style="font-size: 4rem;"></i>
                        </div>
                        <h3>Keine Leben mehr!</h3>
                        <p class="text-muted">Deine Leben regenerieren sich in 5 Stunden.</p>
                        <div class="lives-timer mt-3">
                            <div class="badge bg-info">5:00:00</div>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center border-0">
                        <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">
                            Später zurückkommen
                        </button>
                        <button type="button" class="btn btn-primary" onclick="gamification.restoreLife()">
                            <i class="fas fa-gem me-1"></i>Leben kaufen (Premium)
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
    
    startDailyReset() {
        // Reset daily XP at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.user.daily_xp = 0;
            this.saveUserData();
            this.updateUI();
            
            // Set up daily reset for next day
            setInterval(() => {
                this.user.daily_xp = 0;
                this.saveUserData();
                this.updateUI();
            }, 24 * 60 * 60 * 1000); // 24 hours
            
        }, msUntilMidnight);
    }
}

// Initialize gamification system
let gamification;

document.addEventListener('DOMContentLoaded', () => {
    gamification = new GamificationSystem();
    
    // Make it globally accessible
    window.gamification = gamification;
});

// Custom events for integration with lesson system
function dispatchLessonComplete(lessonId, correctAnswers, totalQuestions, timeSpent) {
    const event = new CustomEvent('lesson-completed', {
        detail: { lessonId, correctAnswers, totalQuestions, timeSpent }
    });
    document.dispatchEvent(event);
}

function dispatchQuestionAnswer(correct, questionType) {
    const event = new CustomEvent('question-answered', {
        detail: { correct, questionType }
    });
    document.dispatchEvent(event);
}
