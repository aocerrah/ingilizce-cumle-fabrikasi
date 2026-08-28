/**
 * Main Application Coordinator & State Manager
 * Daily Smart Routine Integration, Notification Reminders, Streak & Balanced XP.
 */

class AppController {
  constructor() {
    this.currentTab = 'home';
    this.xp = parseInt(localStorage.getItem('english_app_xp') || '0', 10);
    this.streak = parseInt(localStorage.getItem('english_app_streak') || '1', 10);
    this.masteredVerbs = JSON.parse(localStorage.getItem('english_app_mastered_verbs') || '[]');
    this.favoriteVerbs = JSON.parse(localStorage.getItem('english_app_favorite_verbs') || '[]');
    this.theme = localStorage.getItem('english_app_theme') || 'dark';

    this.init();
  }

  init() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();

    // Check streak & Daily mission reset
    this.checkStreakAndDailyMission();

    // Setup tab clicks
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = tab.dataset.tab;
        if (targetTab) this.switchTab(targetTab);
      });
    });

    // Update Header stats
    this.updateHeaderStats();

    // Register Service Worker for PWA / Offline
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration failed:', err);
        });
      });
    }

    // Check rewards on load
    this.checkRewards();

    // Render Home initial view
    this.renderHome();
  }

  getTodayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  checkStreakAndDailyMission() {
    const todayKey = this.getTodayDateKey();
    const lastActiveKey = localStorage.getItem('english_app_last_active_date');

    if (!lastActiveKey) {
      localStorage.setItem('english_app_last_active_date', todayKey);
      localStorage.setItem('english_app_streak', '1');
      this.streak = 1;
    } else if (lastActiveKey !== todayKey) {
      const lastDate = new Date(lastActiveKey);
      const todayDate = new Date(todayKey);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.streak += 1;
      } else if (diffDays > 1) {
        this.streak = 1;
      }

      localStorage.setItem('english_app_streak', this.streak.toString());
      localStorage.setItem('english_app_last_active_date', todayKey);
      localStorage.setItem(`english_app_questions_${todayKey}`, '0');
      localStorage.setItem(`english_app_goal_claimed_${todayKey}`, 'false');
    }
  }

  getDailyGoalTarget() {
    if (this.streak === 1) return 5;
    if (this.streak === 2) return 8;
    if (this.streak === 3) return 12;
    if (this.streak === 4) return 15;
    return Math.min(25, 15 + (this.streak - 4) * 2);
  }

  getDailyQuestionsAnswered() {
    const todayKey = this.getTodayDateKey();
    return parseInt(localStorage.getItem(`english_app_questions_${todayKey}`) || '0', 10);
  }

  recordQuestionAnswered(isCorrect) {
    const todayKey = this.getTodayDateKey();
    let current = this.getDailyQuestionsAnswered() + 1;
    localStorage.setItem(`english_app_questions_${todayKey}`, current.toString());

    const target = this.getDailyGoalTarget();
    const alreadyClaimed = localStorage.getItem(`english_app_goal_claimed_${todayKey}`) === 'true';

    if (current >= target && !alreadyClaimed) {
      localStorage.setItem(`english_app_goal_claimed_${todayKey}`, 'true');
      this.addXP(15);
      this.showToast(`🔥 Gün ${this.streak} Zorunlu Hedefi Tamamlandı! (+15 Bonus XP)`);
    }

    this.updateHeaderStats();
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update Bottom Nav
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Show active section
    const activeSec = document.getElementById(`view-${tabName}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Trigger tab specific renderers
    if (tabName === 'home') {
      this.renderHome();
    } else if (tabName === 'routine') {
      window.dailyRoutine.render();
    } else if (tabName === 'builder') {
      window.sentenceBuilder.renderStudio();
    } else if (tabName === 'verbs') {
      window.verbsView.render();
    } else if (tabName === 'vocab') {
      window.vocabTrainer.render();
    } else if (tabName === 'grammar') {
      window.grammarView.render();
    } else if (tabName === 'story') {
      window.storyView.render();
    } else if (tabName === 'quiz') {
      window.quizEngine.renderMenu();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderHome() {
    const container = document.getElementById('home-content-area');
    if (!container) return;

    const allVerbs = APP_DATA.verbs || [];
    const totalVerbs = allVerbs.length;
    const a2Verbs = allVerbs.filter(v => v.level === 'A2').length;
    const b1Verbs = allVerbs.filter(v => v.level === 'B1').length;
    const customWordsCount = window.customWordsManager ? window.customWordsManager.getAll().length : 0;

    const masteredCount = this.masteredVerbs.length;
    const progressPercent = Math.min(100, Math.round((masteredCount / totalVerbs) * 100));

    // Daily Mission details
    const dailyGoal = this.getDailyGoalTarget();
    const dailyDone = this.getDailyQuestionsAnswered();
    const dailyPercent = Math.min(100, Math.round((dailyDone / dailyGoal) * 100));

    // Notification permission status
    const hasNotif = window.notificationManager && window.notificationManager.hasPermission;

    // Reward Track HTML
    const rewardTrackHtml = window.rewardsEngine ? window.rewardsEngine.renderRewardTrackHtml(this.xp, masteredCount, totalVerbs) : '';

    container.innerHTML = `
      <!-- 1. Guided Daily Routine Main Hero Action -->
      <div class="hero-card" style="background: linear-gradient(135deg, #1e1b4b, #1e293b); border: 2px solid #818cf8; box-shadow: 0 0 25px rgba(129, 140, 248, 0.3);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <span class="hero-badge" style="background: rgba(129, 140, 248, 0.2); color: #818cf8; border-color: #818cf8;">
            🔥 GÜN ${this.streak} ZORUNLU DERS YOLU
          </span>
          <span class="stat-chip streak" style="font-size:0.75rem;">10 Dakika</span>
        </div>

        <h3 style="font-size:1.35rem; font-weight:900; color:#ffffff; margin-top:8px;">
          Bugünkü 4 Aşamalı Ders Rutini Hazır!
        </h3>
        <p style="font-size:0.85rem; color:#cbd5e1; margin-top:4px;">
          Sıralı Öğrenme Yolu: <strong>1. YouTube Video Dersi ➔ 2. Günün 5 Fiili ➔ 3. SVOMPT Cümle Fabrikası ➔ 4. Mini Sınav</strong>
        </p>

        <div style="margin-top:14px;">
          <button class="btn-primary" style="width:100%; justify-content:center; padding:12px; font-size:1.05rem; background: linear-gradient(90deg, #ef4444, #6366f1, #38bdf8);" 
                  onclick="dailyRoutine.startRoutine()">
            🚀 Dersi Başlat (1. Video ➔ 2. Kelimeler ➔ 3. Cümle ➔ 4. Sınav)
          </button>
        </div>
      </div>

      <!-- 2. Phone Reminder & Push Notification Card -->
      <div class="controls-card" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(56, 189, 248, 0.15)); border: 1px solid rgba(245, 158, 11, 0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.5rem;">🔔</span>
            <div>
              <h4 style="font-size:0.95rem; font-weight:800; color:#ffffff;">Günlük Hatırlatıcı Bildirimler</h4>
              <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                ${hasNotif ? '✅ Bildirimler açık (Günde 3 kez hatırlatılır)' : 'Günde en az 3 kez telefona ders hatırlatması gelsin'}
              </p>
            </div>
          </div>
          
          <button class="btn-secondary" style="padding:6px 12px; font-size:0.78rem;" 
                  onclick="${hasNotif ? 'notificationManager.sendTestNotification()' : 'notificationManager.requestPermission()'}">
            ${hasNotif ? '🔔 Test Et' : '🔔 Bildirimi Aç'}
          </button>
        </div>
      </div>

      <!-- 3. Overall Progress Box -->
      <div class="controls-card">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:6px;">
          <span>📚 Toplam 158 Fiil İlerlemesi</span>
          <span style="color:var(--primary);">${masteredCount} / ${totalVerbs} Fiil (${progressPercent}%)</span>
        </div>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-secondary); margin-top:6px;">
          <span>🟢 A2: <strong>${a2Verbs} Fiil</strong></span>
          <span>🔵 B1: <strong>${b1Verbs} Fiil</strong></span>
          <span>📓 Kelime Defteri: <strong>${customWordsCount} Kelime</strong></span>
        </div>
      </div>

      <!-- 4. Babandan Ödül Var! Gamification Track -->
      ${rewardTrackHtml}

      <!-- 5. Quick Shortcuts Grid -->
      <div class="quick-grid">
        <div class="quick-card" onclick="app.switchTab('vocab')">
          <div class="card-icon" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">📓</div>
          <h4>Kelime Ezber Kartları</h4>
          <p>Çift taraflı kart çevir & ezberle</p>
        </div>

        <div class="quick-card" onclick="app.switchTab('builder')">
          <div class="card-icon" style="background: var(--color-s-bg); color: var(--color-s);">🧩</div>
          <h4>Cümle Fabrikası</h4>
          <p>SVOMPT bloklarıyla cümle kur</p>
        </div>

        <div class="quick-card" onclick="verbsView.setLevel('all'); app.switchTab('verbs');">
          <div class="card-icon" style="background: var(--color-v-bg); color: var(--color-v);">📚</div>
          <h4>158 Fiil Kartlığı</h4>
          <p>80 A2 + 78 B1 ve sesli örnekler</p>
        </div>

        <div class="quick-card" onclick="app.switchTab('grammar')">
          <div class="card-icon" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;">🎥</div>
          <h4>Video & Gramer</h4>
          <p>YouTube dersleri izle (+10 XP)</p>
        </div>
      </div>

      <!-- Ela's Adventure Shortcut -->
      <div class="controls-card" style="background: linear-gradient(135deg, rgba(129, 140, 248, 0.15), rgba(56, 189, 248, 0.15)); border-color: rgba(129, 140, 248, 0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:0.75rem; font-weight:800; color:var(--accent);">📖 PARALEL OKUMA METNİ</span>
            <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-primary); margin-top:2px;">Ela'nın Macerası: Kayıp Akademi</h4>
            <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">10 Bölümlük sesli İngilizce hikaye</p>
          </div>
          <button class="btn-primary" style="background:var(--accent); color:#ffffff;" onclick="app.switchTab('story')">
            Oku ➔
          </button>
        </div>
      </div>
    `;
  }

  addXP(amount) {
    this.xp += amount;
    localStorage.setItem('english_app_xp', this.xp.toString());
    this.updateHeaderStats();
    this.showToast(`⭐ +${amount} XP Kazandınız!`);
    this.checkRewards();
  }

  checkRewards() {
    if (window.rewardsEngine) {
      const allVerbs = APP_DATA.verbs || [];
      window.rewardsEngine.checkMilestones(this.xp, this.masteredVerbs.length, allVerbs.length);
    }
  }

  updateHeaderStats() {
    const xpEl = document.getElementById('header-xp-val');
    const streakEl = document.getElementById('header-streak-val');
    if (xpEl) xpEl.textContent = `${this.xp} XP`;
    if (streakEl) streakEl.textContent = `${this.streak} Gün`;
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('english_app_theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  isVerbMastered(id) {
    return this.masteredVerbs.includes(id);
  }

  toggleMastered(id) {
    if (this.isVerbMastered(id)) {
      this.masteredVerbs = this.masteredVerbs.filter(vId => vId !== id);
    } else {
      this.masteredVerbs.push(id);
      this.addXP(2);
    }
    localStorage.setItem('english_app_mastered_verbs', JSON.stringify(this.masteredVerbs));
    this.checkRewards();
  }

  isVerbFavorite(id) {
    return this.favoriteVerbs.includes(id);
  }

  toggleFavorite(id) {
    if (this.isVerbFavorite(id)) {
      this.favoriteVerbs = this.favoriteVerbs.filter(vId => vId !== id);
    } else {
      this.favoriteVerbs.push(id);
    }
    localStorage.setItem('english_app_favorite_verbs', JSON.stringify(this.favoriteVerbs));
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 2500);
    }
  }

  openInstallGuideModal() {
    const modal = document.getElementById('install-modal');
    if (modal) modal.classList.add('active');
  }

  closeInstallGuideModal() {
    const modal = document.getElementById('install-modal');
    if (modal) modal.classList.remove('active');
  }
}

// Instantiate App
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
