/**
 * "Babandan Ödül Var!" - Balanced Gamification & Rewards Engine
 * Realistic XP milestones, Progressive Daily Missions, and Grand Prize for mastering all words.
 */

class RewardsEngine {
  constructor() {
    this.defaultMilestones = [
      { xp: 50, title: "🍫 1. Baraj (İlk Adım)", reward: "Babandan Çikolata ve Büyük Bir Tebrik 🍫", icon: "🍫" },
      { xp: 150, title: "🍦 2. Baraj (Gümüş)", reward: "Babandan Dondurma veya Tatlı Ismarlama Ödülü 🍦", icon: "🍦" },
      { xp: 300, title: "📚 3. Baraj (Altın)", reward: "Babandan Sinema Bileti veya İstediğin Yeni Kitap 🎬📚", icon: "📚" },
      { xp: 600, title: "🎮 4. Baraj (Elmas)", reward: "Babandan İstediğin Özel Bir Oyun / Oyuncak / Hediye 🎮🎁", icon: "🎮" },
      { xp: 1000, title: "🎁 5. Baraj (Şampiyon)", reward: "Babandan Özel Spor Ayakkabı / Kıyafet / Teknolojik Hediye 👟📱", icon: "🎁" },
      { xp: 1500, requireAllWords: true, title: "👑 BÜYÜK NİHAİ ÖDÜL (Efsanevi Usta)", reward: "TÜM 158 KELİMEYİ ÖĞRENDİN! Babandan Büyük Efsanevi Hayal Ödülü 🚀🏆🎉", icon: "👑" }
    ];

    this.milestones = this.loadMilestones();
    this.claimedMilestones = JSON.parse(localStorage.getItem('english_app_claimed_milestones') || '[]');
  }

  loadMilestones() {
    try {
      const saved = localStorage.getItem('english_app_custom_milestones');
      return saved ? JSON.parse(saved) : this.defaultMilestones;
    } catch (e) {
      return this.defaultMilestones;
    }
  }

  saveMilestones(newMilestones) {
    this.milestones = newMilestones;
    localStorage.setItem('english_app_custom_milestones', JSON.stringify(this.milestones));
    if (window.app) window.app.renderHome();
  }

  checkMilestones(currentXP, masteredWordsCount, totalWordsCount) {
    for (const m of this.milestones) {
      if (currentXP >= m.xp && !this.claimedMilestones.includes(m.xp)) {
        if (m.requireAllWords) {
          // Check if all words are mastered
          if (masteredWordsCount >= totalWordsCount && totalWordsCount > 0) {
            this.claimMilestone(m);
            break;
          }
        } else {
          this.claimMilestone(m);
          break;
        }
      }
    }
  }

  claimMilestone(milestone) {
    this.claimedMilestones.push(milestone.xp);
    localStorage.setItem('english_app_claimed_milestones', JSON.stringify(this.claimedMilestones));
    this.triggerCelebrationModal(milestone);
  }

  triggerCelebrationModal(milestone) {
    const modal = document.getElementById('reward-celebration-modal');
    if (!modal) return;

    const titleEl = document.getElementById('reward-celeb-title');
    const descEl = document.getElementById('reward-celeb-desc');
    const xpBadgeEl = document.getElementById('reward-celeb-xp');

    if (titleEl) titleEl.textContent = `🎉 TEBRİKLER! ${milestone.title.toUpperCase()}!`;
    if (descEl) descEl.innerHTML = `<span style="font-size:1.1rem; color:#f59e0b; font-weight:800;">${milestone.reward}</span>`;
    if (xpBadgeEl) xpBadgeEl.textContent = `${milestone.xp} XP TAMAMLANDI ⭐`;

    modal.classList.add('active');

    speechEngine.speak(`Congratulations! You have reached ${milestone.xp} XP! Reward from your father unlocked!`);
  }

  closeCelebrationModal() {
    const modal = document.getElementById('reward-celebration-modal');
    if (modal) modal.classList.remove('active');
  }

  openSettingsModal() {
    const modal = document.getElementById('reward-settings-modal');
    const container = document.getElementById('reward-settings-list');
    if (!modal || !container) return;

    container.innerHTML = this.milestones.map((m, idx) => `
      <div style="background:var(--bg-card); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.85rem; color:var(--primary);">
          <span>${m.title} (${m.xp} XP ${m.requireAllWords ? '+ Tüm Kelimeler' : ''})</span>
          <span>${m.icon}</span>
        </div>
        <input type="text" id="custom-reward-input-${idx}" class="select-input" value="${m.reward}" placeholder="Ödül açıklaması yazın...">
      </div>
    `).join('');

    modal.classList.add('active');
  }

  saveSettingsFromModal() {
    const updated = this.milestones.map((m, idx) => {
      const input = document.getElementById(`custom-reward-input-${idx}`);
      return {
        ...m,
        reward: input ? input.value.trim() : m.reward
      };
    });

    this.saveMilestones(updated);
    this.closeSettingsModal();
    if (window.app) window.app.showToast("🎁 Babandan Ödüller Başarıyla Kaydedildi!");
  }

  closeSettingsModal() {
    const modal = document.getElementById('reward-settings-modal');
    if (modal) modal.classList.remove('active');
  }

  renderRewardTrackHtml(currentXP, masteredCount, totalWords) {
    const nextMilestone = this.milestones.find(m => {
      if (m.requireAllWords) {
        return currentXP < m.xp || masteredCount < totalWords;
      }
      return currentXP < m.xp;
    }) || this.milestones[this.milestones.length - 1];

    const progressPercent = Math.min(100, Math.round((currentXP / nextMilestone.xp) * 100));

    return `
      <div class="controls-card" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15)); border: 2px solid rgba(245, 158, 11, 0.4); margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.6rem;">🎁</span>
            <div>
              <span style="font-size:0.75rem; font-weight:800; color:#f59e0b; text-transform:uppercase;">BABANDAN ÖDÜL KUPONU</span>
              <h4 style="font-size:1.05rem; font-weight:800; color:#ffffff; margin-top:2px;">Sıradaki Hedef: ${nextMilestone.title} (${nextMilestone.xp} XP)</h4>
            </div>
          </div>
          <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="rewardsEngine.openSettingsModal()">
            ⚙️ Ödülleri Düzenle
          </button>
        </div>

        <p style="font-size:0.88rem; color:#fef08a; font-weight:700; margin-top:6px;">
          🎉 Ödül: "${nextMilestone.reward}"
        </p>

        <!-- Progress Bar -->
        <div style="margin-top:8px;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; color:var(--text-secondary); margin-bottom:4px;">
            <span>Mevcut XP: <strong>${currentXP} XP</strong></span>
            <span>Hedefe Kalan: <strong>${Math.max(0, nextMilestone.xp - currentXP)} XP</strong></span>
          </div>
          <div class="quiz-progress-bar" style="height:10px;">
            <div class="quiz-progress-fill" style="width: ${progressPercent}%; background: linear-gradient(90deg, #f59e0b, #ef4444);"></div>
          </div>
        </div>

        <!-- Grand Prize Special Box -->
        <div style="background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-md); padding: 10px 14px; margin-top: 10px; border: 1px solid rgba(245, 158, 11, 0.3); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:0.72rem; font-weight:800; color:#f59e0b;">👑 NİHAİ BÜYÜK ŞAMPİYONLUK ŞARTI</div>
            <div style="font-size:0.82rem; color:#ffffff; font-weight:700;">Tüm 158 Kelimeyi Öğren (${masteredCount}/${totalWords}) & 1500 XP</div>
          </div>
          <span class="stat-chip" style="color:#f59e0b; border-color:rgba(245, 158, 11, 0.4);">
            ${masteredCount >= totalWords && currentXP >= 1500 ? '🏆 KAZANILDI!' : '🔒 KİLİTLİ'}
          </span>
        </div>

        <!-- Milestone Badges Line -->
        <div style="display:flex; justify-content:space-between; gap:6px; margin-top:10px; overflow-x:auto; scrollbar-width:none;">
          ${this.milestones.map(m => {
            const isUnlocked = currentXP >= m.xp && (!m.requireAllWords || masteredCount >= totalWords);
            return `
              <div style="text-align:center; padding:6px 8px; background:${isUnlocked ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-surface)'}; border:1px solid ${isUnlocked ? 'var(--success)' : 'var(--border-subtle)'}; border-radius:var(--radius-md); min-width:65px;">
                <div style="font-size:1.1rem;">${isUnlocked ? '✅' : m.icon}</div>
                <div style="font-size:0.68rem; font-weight:800; color:${isUnlocked ? 'var(--success)' : 'var(--text-muted)'}; margin-top:2px;">${m.xp} XP</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
}

// Global instance
window.rewardsEngine = new RewardsEngine();
