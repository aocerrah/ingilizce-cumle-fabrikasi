/**
 * 17+ Modül Gramer Akademisi, YouTube Video Arama & Ders İzleme Modülü
 */

class GrammarView {
  constructor() {
    this.expandedModuleId = 'modul_10';
    this.videoSearchQuery = '';
    this.watchedVideos = JSON.parse(localStorage.getItem('english_app_watched_videos') || '[]');
  }

  render() {
    const container = document.getElementById('grammar-content-area');
    if (!container) return;

    const modules = APP_DATA.grammar_modules || [];
    const videoLessons = this.getFilteredVideos();
    const svomptRules = APP_DATA.svompt_rules || [];

    container.innerHTML = `
      <!-- SVOMPT Overview Card -->
      <div class="hero-card" style="margin-bottom:16px;">
        <span class="hero-badge">📐 Temel Cümle Dizilimi</span>
        <h3>İngilizce SVOMPT Kuralı</h3>
        <p>Türkçe'de fiil en sonda yer alırken, İngilizce'de <strong>fiil daima özneden hemen sonra</strong> gelir!</p>
        
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
          ${svomptRules.map(r => `
            <div style="background:var(--bg-surface); padding:8px 12px; border-radius:var(--radius-md); border-left:3px solid ${r.color};">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:${r.color}; font-size:0.85rem;">${r.code} - ${r.name}</strong>
                <span style="font-size:0.75rem; color:var(--text-secondary);">${r.question}</span>
              </div>
              <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">${r.description}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- YouTube Video Lessons & Search Section -->
      <div class="controls-card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <span class="hero-badge" style="background:rgba(239, 68, 68, 0.2); color:#ef4444;">🎥 VİDEO AKADEMİSİ</span>
            <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-primary); margin-top:2px;">
              Türkçe Anlatımlı YouTube Gramer Dersleri
            </h3>
          </div>
          <span style="font-size:0.75rem; font-weight:800; color:var(--success);">Her Video +25 XP ⭐</span>
        </div>

        <!-- Video Search Input -->
        <div class="search-input-wrapper" style="margin-bottom:10px;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" placeholder="YouTube'da gramer konusu ara (örn: Simple Present, Edilgen Çatı, Bağlaçlar)..."
                 value="${this.videoSearchQuery}" oninput="grammarView.setVideoSearch(this.value)">
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">
          ${videoLessons.map((v, i) => {
            const isWatched = this.watchedVideos.includes(v.video_id);
            return `
              <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:0.72rem; font-weight:800; color:var(--danger);">▶ DERS ${i+1}</span>
                    ${isWatched ? '<span style="font-size:0.72rem; font-weight:800; color:var(--success);">✅ İzlendi (+25 XP)</span>' : ''}
                  </div>
                  <h4 style="font-size:0.88rem; font-weight:800; color:var(--text-primary);">${v.title}</h4>
                  <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:4px;">${v.description}</p>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                  <button class="btn-video-watch" onclick="grammarView.openVideoModal('${v.video_id}', '${v.title.replace(/'/g, "\\'")}')">
                    ▶ Hemen İzle
                  </button>
                  ${!isWatched ? `
                    <button class="btn-secondary" style="padding:4px 8px; font-size:0.72rem;" onclick="grammarView.markVideoWatched('${v.video_id}')">
                      İzledim (+25 XP)
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 17 Modules Accordion -->
      <div class="section-header" style="margin-bottom:12px;">
        <h2>📚 Kapsamlı Gramer Rehberi</h2>
        <p>17 Modül detaylı kurallar, formül kartları ve bağlamlı örnekler</p>
      </div>

      <div class="modules-accordion">
        ${modules.map(mod => `
          <div class="module-card ${this.expandedModuleId === mod.module_id ? 'expanded' : ''}" id="card-${mod.module_id}">
            <div class="module-header" onclick="grammarView.toggleModule('${mod.module_id}')">
              <div class="module-header-left">
                <div class="module-num-badge">${mod.number}</div>
                <div class="module-title-wrap">
                  <h3>${mod.title}</h3>
                  <span>${mod.category}</span>
                </div>
              </div>
              <span class="expand-chevron">▼</span>
            </div>

            <div class="module-body">
              <div class="grammar-content-box">${mod.content || 'Bu modül için detaylı gramer açıklamaları ve cümle formülleri.'}</div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <span style="font-size:0.75rem; color:var(--text-muted);">Kaynak: ${mod.file}</span>
                <button class="btn-primary" style="padding:6px 12px; font-size:0.78rem;" 
                        onclick="verbsView.setSearch('${mod.title.split(':')[0]}'); app.switchTab('verbs');">
                  🔍 Bu Konunun Fiillerine Git
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getFilteredVideos() {
    let list = APP_DATA.youtube_videos || [];
    if (this.videoSearchQuery.trim() !== '') {
      const q = this.videoSearchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  setVideoSearch(val) {
    this.videoSearchQuery = val;
    this.render();
  }

  toggleModule(moduleId) {
    this.expandedModuleId = this.expandedModuleId === moduleId ? null : moduleId;
    this.render();
  }

  openVideoModal(videoId, title) {
    const modal = document.getElementById('video-modal');
    const modalTitle = document.getElementById('video-modal-title');
    const videoWrapper = document.getElementById('video-modal-iframe-wrapper');

    if (!modal || !modalTitle || !videoWrapper) return;

    modalTitle.textContent = title;
    videoWrapper.innerHTML = `
      <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
      </iframe>
    `;

    modal.classList.add('active');
  }

  closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoWrapper = document.getElementById('video-modal-iframe-wrapper');
    if (modal) modal.classList.remove('active');
    if (videoWrapper) videoWrapper.innerHTML = '';
  }

  markVideoWatched(videoId) {
    if (!this.watchedVideos.includes(videoId)) {
      this.watchedVideos.push(videoId);
      localStorage.setItem('english_app_watched_videos', JSON.stringify(this.watchedVideos));
      if (window.app) window.app.addXP(25);
      this.render();
    }
  }
}

// Global instance
window.grammarView = new GrammarView();
