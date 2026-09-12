/**
 * "Babandan Ödül Var!" - Yüksek Disiplinli & Dengeli Ödül Sistemi (Strict Rewards Engine)
 * Kolay ödüle ulaşılamaz! Her baraj için XP + Kelime Ezberi + Video Dersi şartlarının TÜMÜ zorunludur.
 * Nihai Büyük Ödül: 3500 XP + TÜM 158 KELİME (158/158) + TÜM 22 VİDEO DERSİ (22/22) tamamlanmadan KESİNLİKLE AÇILMAZ!
 */

class RewardsEngine {
  constructor() {
    this.defaultMilestones = [
      {
        id: "m1",
        xp: 300,
        requiredWords: 20,
        requiredVideos: 3,
        title: "🍫 1. Baraj (Bronz - İlk Adım)",
        reward: "Babandan Çikolata ve Büyük Bir Tebrik 🍫",
        icon: "🍫",
        description: "300 XP + En az 20 Fiil + En az 3 Video Dersi"
      },
      {
        id: "m2",
        xp: 800,
        requiredWords: 50,
        requiredVideos: 8,
        title: "🍦 2. Baraj (Gümüş - Kararlı Öğrenci)",
        reward: "Babandan Dondurma veya Tatlı Ismarlama Ödülü 🍦",
        icon: "🍦",
        description: "800 XP + En az 50 Fiil + En az 8 Video Dersi"
      },
      {
        id: "m3",
        xp: 1600,
        requiredWords: 80,
        requiredVideos: 14,
        title: "📚 3. Baraj (Altın - Cümle Ustası)",
        reward: "Babandan Sinema Bileti veya İstediğin Yeni Kitap 🎬📚",
        icon: "📚",
        description: "1600 XP + Tüm A2 Seviyesi (80 Fiil) + En az 14 Video Dersi"
      },
      {
        id: "m4",
        xp: 2500,
        requiredWords: 120,
        requiredVideos: 18,
        title: "🎮 4. Baraj (Elmas - Gramer Şampiyonu)",
        reward: "Babandan İstediğin Özel Bir Oyun / Oyuncak / Hediye 🎮🎁",
        icon: "🎮",
        description: "2500 XP + En az 120 Fiil + En az 18 Video Dersi"
      },
      {
        id: "m5",
        xp: 3500,
        requiredWords: 158,
        requiredVideos: 22,
        requireAllWordsAndVideos: true,
        title: "👑 BÜYÜK NİHAİ ÖDÜL (Efsanevi Usta)",
        reward: "TÜM 158 KELİMEYİ VE 22 VİDEOYU BİTİRDİN! Babandan Büyük Efsanevi Hayal Ödülü 🚀🏆🎉",
        icon: "👑",
        description: "3500 XP + TÜM 158 FİİL (158/158) + TÜM 22 VİDEO DERSİ (22/22)"
      }
    ];

    this.milestones = this.loadMilestones();
    this.claimedMilestones = JSON.parse(localStorage.getItem('english_app_claimed_milestones') || '[]');
  }

  loadMilestones() {
    try {
      const saved = localStorage.getItem('english_app_custom_milestones_v2');
      if (saved) return JSON.parse(saved);
      // Eski versiyon kaydını temizle ve yeni sıkı sistemi yükle
      localStorage.removeItem('english_app_custom_milestones');
      return this.defaultMilestones;
    } catch (e) {
      return this.defaultMilestones;
    }
  }

  saveMilestones(newMilestones) {
    this.milestones = newMilestones;
    localStorage.setItem('english_app_custom_milestones_v2', JSON.stringify(this.milestones));
    if (window.app) window.app.renderHome();
  }

  /**
   * Sıkı Çok Kriterli Baraj Kontrolü (XP + Kelimeler + Videolar)
   */
  checkMilestones(currentXP, masteredWordsCount, totalWordsCount, watchedVideosCount = 0, totalVideosCount = 22) {
    for (const m of this.milestones) {
      const isXpMet = currentXP >= m.xp;
      const isWordsMet = masteredWordsCount >= (m.requiredWords || 0);
      const isVideosMet = watchedVideosCount >= (m.requiredVideos || 0);

      const milestoneKey = m.id || `m_${m.xp}`;

      // Tüm 3 şart eksiksiz sağlanmalı!
      if (isXpMet && isWordsMet && isVideosMet && !this.claimedMilestones.includes(milestoneKey)) {
        this.claimMilestone(m, milestoneKey);
        break;
      }
    }
  }

  claimMilestone(milestone, key) {
    this.claimedMilestones.push(key);
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
    if (descEl) descEl.innerHTML = `
      <div style="font-size:1.15rem; color:#f59e0b; font-weight:900; line-height:1.4;">${milestone.reward}</div>
      <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px;">
        ✅ Gerekli tüm şartları (${milestone.xp} XP, ${milestone.requiredWords} Kelime, ${milestone.requiredVideos} Video Dersi) tamamladın!
      </div>
    `;
    if (xpBadgeEl) xpBadgeEl.textContent = `${milestone.xp} XP & KELİME & VİDEO ŞARTI TAMAMLANDI ⭐`;

    modal.classList.add('active');

    speechEngine.speak(`Congratulations! You have completed all conditions and unlocked ${milestone.title}! Reward from your father unlocked!`);
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
          <span>${m.title}</span>
          <span>${m.icon}</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-secondary);">
          Gereksinim: <strong>${m.xp} XP</strong> • <strong>${m.requiredWords} Kelime</strong> • <strong>${m.requiredVideos} Video</strong>
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

  renderRewardTrackHtml(currentXP, masteredCount, totalWords, watchedCount = 0, totalVideos = 22) {
    // Sıradaki hedefin bulunması (XP, Kelime veya Video eksik olan ilk baraj)
    const nextMilestone = this.milestones.find(m => {
      return currentXP < m.xp || masteredCount < m.requiredWords || watchedCount < m.requiredVideos;
    }) || this.milestones[this.milestones.length - 1];

    // İlerleme yüzdeleri
    const xpPercent = Math.min(100, Math.round((currentXP / nextMilestone.xp) * 100));
    const wordPercent = Math.min(100, Math.round((masteredCount / nextMilestone.requiredWords) * 100));
    const videoPercent = Math.min(100, Math.round((watchedCount / nextMilestone.requiredVideos) * 100));

    // Genel baraj tamamlama ortalaması
    const overallProgress = Math.round((xpPercent + wordPercent + videoPercent) / 3);

    // Kalan eksikler
    const remXp = Math.max(0, nextMilestone.xp - currentXP);
    const remWords = Math.max(0, nextMilestone.requiredWords - masteredCount);
    const remVideos = Math.max(0, nextMilestone.requiredVideos - watchedCount);

    const isAllGrandUnlocked = masteredCount >= totalWords && watchedCount >= totalVideos && currentXP >= 3500;

    return `
      <div class="controls-card" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15)); border: 2px solid rgba(245, 158, 11, 0.4); margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.8rem;">🎁</span>
            <div>
              <span class="hero-badge" style="background:rgba(245,158,11,0.25); color:#f59e0b; font-size:0.7rem;">BABANDAN BÜYÜK ÖDÜL KUPONU</span>
              <h4 style="font-size:1.05rem; font-weight:800; color:#ffffff; margin-top:2px;">
                Sıradaki Hedef: ${nextMilestone.title}
              </h4>
            </div>
          </div>
          <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="rewardsEngine.openSettingsModal()">
            ⚙️ Ödülleri Düzenle
          </button>
        </div>

        <p style="font-size:0.9rem; color:#fef08a; font-weight:700; margin-top:8px;">
          🎉 Ödül: "${nextMilestone.reward}"
        </p>

        <!-- 3-Condition Strict Progress Bars -->
        <div style="background: rgba(15, 23, 42, 0.7); border-radius: var(--radius-md); padding: 12px; margin-top: 10px; border: 1px solid rgba(245, 158, 11, 0.2);">
          <div style="font-size:0.75rem; font-weight:800; color:#f59e0b; margin-bottom:8px; text-transform:uppercase;">
            🎯 Bu Baraj İçin Gerekli 3 Zorunlu Şart:
          </div>

          <!-- 1. XP Bar -->
          <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:0.74rem; font-weight:700; color:var(--text-secondary); margin-bottom:2px;">
              <span>⭐ Toplam XP: <strong>${currentXP} / ${nextMilestone.xp} XP</strong></span>
              <span style="color:${remXp === 0 ? 'var(--success)' : '#f59e0b'};">${remXp === 0 ? '✅ Tamamlandı' : `${remXp} XP Kaldı`}</span>
            </div>
            <div class="quiz-progress-bar" style="height:7px; margin:0;">
              <div class="quiz-progress-fill" style="width: ${xpPercent}%; background: #f59e0b;"></div>
            </div>
          </div>

          <!-- 2. Words Bar -->
          <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:0.74rem; font-weight:700; color:var(--text-secondary); margin-bottom:2px;">
              <span>📚 Öğrenilen Fiil: <strong>${masteredCount} / ${nextMilestone.requiredWords} Fiil</strong></span>
              <span style="color:${remWords === 0 ? 'var(--success)' : 'var(--primary)'};">${remWords === 0 ? '✅ Tamamlandı' : `${remWords} Fiil Kaldı`}</span>
            </div>
            <div class="quiz-progress-bar" style="height:7px; margin:0;">
              <div class="quiz-progress-fill" style="width: ${wordPercent}%; background: var(--primary);"></div>
            </div>
          </div>

          <!-- 3. Videos Bar -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.74rem; font-weight:700; color:var(--text-secondary); margin-bottom:2px;">
              <span>🎥 İzlenen Video Dersi: <strong>${watchedCount} / ${nextMilestone.requiredVideos} Video</strong></span>
              <span style="color:${remVideos === 0 ? 'var(--success)' : '#ef4444'};">${remVideos === 0 ? '✅ Tamamlandı' : `${remVideos} Video Kaldı`}</span>
            </div>
            <div class="quiz-progress-bar" style="height:7px; margin:0;">
              <div class="quiz-progress-fill" style="width: ${videoPercent}%; background: #ef4444;"></div>
            </div>
          </div>
        </div>

        <!-- Grand Prize Special Strict Box -->
        <div style="background: rgba(15, 23, 42, 0.85); border-radius: var(--radius-md); padding: 12px 14px; margin-top: 10px; border: 2px solid ${isAllGrandUnlocked ? 'var(--success)' : 'rgba(239, 68, 68, 0.4)'}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-size:0.75rem; font-weight:900; color:#f59e0b;">👑 NİHAİ BÜYÜK ŞAMPİYONLUK ŞARTI</div>
            <div style="font-size:0.84rem; color:#ffffff; font-weight:700; margin-top:2px;">
              Tüm 158 Kelime (${masteredCount}/158) + Tüm 22 Video (${watchedCount}/22) + 3500 XP
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
              ${isAllGrandUnlocked ? '🎉 Tebrikler! Tüm eğitim tamamlandı ve büyük ödül hak edildi!' : '⚠️ Kelimelerin veya videoların tamamı bitmeden bu ödül açılamaz.'}
            </div>
          </div>
          <span class="stat-chip" style="color:${isAllGrandUnlocked ? 'var(--success)' : '#ef4444'}; border-color:${isAllGrandUnlocked ? 'var(--success)' : 'rgba(239,68,68,0.4)'}; font-weight:900;">
            ${isAllGrandUnlocked ? '🏆 KAZANILDI!' : '🔒 KİLİTLİ'}
          </span>
        </div>

        <!-- Milestone Badges Line -->
        <div style="display:flex; justify-content:space-between; gap:6px; margin-top:12px; overflow-x:auto; scrollbar-width:none;">
          ${this.milestones.map((m, idx) => {
            const isXpDone = currentXP >= m.xp;
            const isWordDone = masteredCount >= m.requiredWords;
            const isVidDone = watchedCount >= m.requiredVideos;
            const isUnlocked = isXpDone && isWordDone && isVidDone;

            return `
              <div style="text-align:center; padding:8px 6px; background:${isUnlocked ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-surface)'}; border:1px solid ${isUnlocked ? 'var(--success)' : 'var(--border-subtle)'}; border-radius:var(--radius-md); min-width:72px;"
                   title="${m.title} (${m.xp} XP, ${m.requiredWords} Kelime, ${m.requiredVideos} Video)">
                <div style="font-size:1.15rem;">${isUnlocked ? '✅' : m.icon}</div>
                <div style="font-size:0.7rem; font-weight:800; color:${isUnlocked ? 'var(--success)' : 'var(--text-muted)'}; margin-top:2px;">${m.xp} XP</div>
                <div style="font-size:0.62rem; color:var(--text-secondary);">${m.requiredWords}K • ${m.requiredVideos}V</div>
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
