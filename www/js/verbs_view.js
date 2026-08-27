/**
 * 158 Fiil Kartlığı (Curriculum Verbs) & Kelime Defteri Entegrasyonu
 * Hand-crafted 80 A2 + 78 B1 Verbs with authentic PDF sentences + Shortcut to Vocab Trainer.
 */

class VerbsView {
  constructor() {
    this.searchTerm = '';
    this.selectedLevel = 'all'; // 'all', 'A2', 'B1', 'fav', 'mastered'
    this.isFlashcardMode = false;
  }

  render() {
    const container = document.getElementById('verbs-content-area');
    if (!container) return;

    const allVerbs = APP_DATA.verbs || [];
    const customCount = window.customWordsManager ? window.customWordsManager.getAll().length : 0;

    const filterTabs = [
      { id: 'all', label: `✨ Tümü (${allVerbs.length})` },
      { id: 'A2', label: `🟢 A2 Temel (80 Fiil)` },
      { id: 'B1', label: `🔵 B1 İleri (78 Fiil)` },
      { id: 'fav', label: `⭐ Favoriler` },
      { id: 'mastered', label: `✅ Öğrenilenler` }
    ];

    const filteredVerbs = this.getFilteredVerbs();

    container.innerHTML = `
      <!-- Action Bar & Custom Vocab Book Shortcut -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">158 Temel & İleri Düzey Fiil Kartlığı</span>
          <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">PDF müfredatındaki V1/V2/V3 ve Olumlu/Olumsuz/Soru cümleleri</p>
        </div>
        
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary" style="border-color:var(--primary); color:var(--primary);" onclick="app.switchTab('vocab')">
            📓 Kelime Defterim (${customCount})
          </button>
          <button class="btn-primary" onclick="verbsView.openAddWordModal()">
            ➕ Yeni Kelime Ekle
          </button>
        </div>
      </div>

      <!-- Level Filter Selector -->
      <div style="display:flex; overflow-x:auto; gap:6px; margin-bottom:12px; scrollbar-width:none;">
        ${filterTabs.map(tab => `
          <button class="cat-chip ${this.selectedLevel === tab.id ? 'active' : ''}"
                  style="font-size:0.8rem; padding:7px 12px;"
                  onclick="verbsView.setLevel('${tab.id}')">
            ${tab.label}
          </button>
        `).join('')}
      </div>

      <!-- Search Bar -->
      <div class="search-filter-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="verb-search-input" 
                 placeholder="Fiil veya Türkçe anlam ara (örn: be, achieve, wash, gitmek, başarmak)..." 
                 value="${this.searchTerm}" 
                 oninput="verbsView.setSearch(this.value)">
        </div>
      </div>

      <!-- Stats & View Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:0.82rem; font-weight:700; color:var(--text-secondary);">
          Listelenen: <strong style="color:var(--primary);">${filteredVerbs.length}</strong> / ${allVerbs.length} Fiil
        </span>
        <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="verbsView.toggleFlashcardMode()">
          ${this.isFlashcardMode ? '📋 Detaylı Liste' : '🗂️ Flaş Kart Modu'}
        </button>
      </div>

      <!-- Verbs Grid -->
      <div class="verbs-grid" id="verbs-cards-container">
        ${filteredVerbs.length === 0 ? `
          <div style="grid-column: 1/-1; text-align:center; padding: 40px 20px; background:var(--bg-surface); border-radius:var(--radius-lg);">
            <div style="font-size: 2.5rem; margin-bottom:10px;">🔍</div>
            <h4 style="color:var(--text-primary);">Aramanıza uygun fiil bulunamadı</h4>
          </div>
        ` : filteredVerbs.map(v => this.renderVerbCard(v)).join('')}
      </div>
    `;
  }

  renderVerbCard(v) {
    const isMastered = window.app && window.app.isVerbMastered(v.id);
    const isFav = window.app && window.app.isVerbFavorite(v.id);
    const isB1 = v.level === 'B1';

    const badgeBg = isB1 ? 'rgba(129, 140, 248, 0.2)' : 'rgba(56, 189, 248, 0.2)';
    const badgeColor = isB1 ? 'var(--accent)' : 'var(--primary)';
    const borderTop = isB1 ? '3px solid var(--accent)' : '3px solid var(--primary)';
    const levelLabel = isB1 ? 'B1 İleri Düzey Fiil' : 'A2 Temel Fiil';

    return `
      <div class="verb-card" id="verb-card-${v.id}" style="${borderTop}">
        <div class="verb-card-top">
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="verb-id-badge" style="background:${badgeBg}; color:${badgeColor};">
                #${v.id} • ${levelLabel}
              </span>
              <span style="font-size:0.72rem; color:var(--text-muted);">${v.category || ''}</span>
            </div>
            <div class="verb-title-group" style="margin-top:4px;">
              <h3 class="verb-name">${v.verb}</h3>
              <span class="verb-meaning">${v.meaning}</span>
              <button class="play-voice-btn" title="Telaffuzu Dinle" onclick="speechEngine.speak('${v.verb}')">
                🔊
              </button>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <button class="icon-btn" style="width:32px; height:32px; font-size:0.9rem; color:${isFav ? '#f59e0b' : 'var(--text-muted)'};" 
                    onclick="verbsView.toggleFavorite(${v.id})">
              ${isFav ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        <!-- Forms (V1, V2, V3) -->
        <div class="verb-forms-row">
          <span><strong>V1:</strong> ${v.forms?.v1 || v.verb}</span>
          <span><strong>V2:</strong> ${v.forms?.v2 || '-'}</span>
          <span><strong>V3:</strong> ${v.forms?.v3 || '-'}</span>
        </div>

        <!-- Olumlu (+), Olumsuz (-), Soru (?) Sentences from PDF -->
        <div class="verb-sentences">
          <!-- Positive (+) -->
          <div class="sentence-item pos">
            <div class="sentence-type-header">
              <span>✅ Olumlu Cümle (+)</span>
              <button class="play-voice-btn" onclick="speechEngine.speak('${v.sentences.positive.en.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            <div class="sentence-text-en">${v.sentences.positive.en}</div>
            <div class="sentence-text-tr">🇹🇷 ${v.sentences.positive.tr}</div>
          </div>

          <!-- Negative (-) -->
          <div class="sentence-item neg">
            <div class="sentence-type-header">
              <span>❌ Olumsuz Cümle (-)</span>
              <button class="play-voice-btn" onclick="speechEngine.speak('${v.sentences.negative.en.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            <div class="sentence-text-en">${v.sentences.negative.en}</div>
            <div class="sentence-text-tr">🇹🇷 ${v.sentences.negative.tr}</div>
          </div>

          <!-- Question (?) -->
          <div class="sentence-item que">
            <div class="sentence-type-header">
              <span>❓ Soru Cümlesi (?)</span>
              <button class="play-voice-btn" onclick="speechEngine.speak('${v.sentences.question.en.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            <div class="sentence-text-en">${v.sentences.question.en}</div>
            <div class="sentence-text-tr">🇹🇷 ${v.sentences.question.tr}</div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="card-actions-footer">
          <span style="font-size:0.72rem; color:var(--text-muted);">${v.source}</span>
          <button class="btn-mastered ${isMastered ? 'mastered' : ''}" onclick="verbsView.toggleMastered(${v.id})">
            ${isMastered ? '✅ Öğrenildi' : '○ Öğrendim Olarak İşaretle'}
          </button>
        </div>
      </div>
    `;
  }

  getFilteredVerbs() {
    const all = APP_DATA.verbs || [];
    let list = all;

    if (this.selectedLevel === 'A2') {
      list = list.filter(v => v.level === 'A2');
    } else if (this.selectedLevel === 'B1') {
      list = list.filter(v => v.level === 'B1');
    } else if (this.selectedLevel === 'fav') {
      list = list.filter(v => window.app && window.app.isVerbFavorite(v.id));
    } else if (this.selectedLevel === 'mastered') {
      list = list.filter(v => window.app && window.app.isVerbMastered(v.id));
    }

    if (this.searchTerm.trim() !== '') {
      const q = this.searchTerm.toLowerCase().trim();
      list = list.filter(v => 
        v.verb.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        (v.sentences.positive.en && v.sentences.positive.en.toLowerCase().includes(q)) ||
        (v.sentences.positive.tr && v.sentences.positive.tr.toLowerCase().includes(q))
      );
    }

    return list;
  }

  setSearch(val) {
    this.searchTerm = val;
    this.render();
  }

  setLevel(level) {
    this.selectedLevel = level;
    this.render();
  }

  toggleFavorite(verbId) {
    if (window.app) {
      window.app.toggleFavorite(verbId);
      this.render();
    }
  }

  toggleMastered(verbId) {
    if (window.app) {
      window.app.toggleMastered(verbId);
      this.render();
    }
  }

  toggleFlashcardMode() {
    this.isFlashcardMode = !this.isFlashcardMode;
    this.render();
  }

  openAddWordModal() {
    const modal = document.getElementById('add-word-modal');
    if (modal) {
      document.getElementById('new-word-en').value = '';
      document.getElementById('new-word-tr').value = '';
      modal.classList.add('active');
    }
  }

  closeAddWordModal() {
    const modal = document.getElementById('add-word-modal');
    if (modal) modal.classList.remove('active');
  }

  submitNewWord() {
    const enInput = document.getElementById('new-word-en');
    const trInput = document.getElementById('new-word-tr');

    const en = enInput ? enInput.value.trim() : '';
    const tr = trInput ? trInput.value.trim() : '';

    if (!en || !tr) {
      alert('Lütfen hem İngilizce kelimeyi hem de Türkçe anlamını giriniz.');
      return;
    }

    window.customWordsManager.addWord(en, tr);
    this.closeAddWordModal();
    if (window.app) {
      window.app.showToast(`🎉 "${en} (${tr})" Kelime Defterine Eklendi! (+3 XP)`);
      window.app.switchTab('vocab');
    }
  }
}

// Global instance
window.verbsView = new VerbsView();
