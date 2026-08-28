/**
 * Kapsamlı İngilizce Kelime & Gramer Ansiklopedisi (Master English Vocabulary Library)
 * 273+ Kelime Kartı: Fiiller, Phrasal Verbs, İsimler, Zarflar, Bağlaçlar, Edatlar, Sıfatlar, Kalıplar
 * V1/V2/V3 + Olumlu/Olumsuz/Soru Cümleleri + Doğal Sesli Telaffuz + Cümle Fabrikası Entegrasyonu
 */

class VerbsView {
  constructor() {
    this.searchTerm = '';
    this.selectedCategory = 'all'; // 'all', 'verb', 'phrasal_verb', 'noun', 'adverb', 'conjunction', 'preposition', 'adjective', 'idiom', 'A2', 'B1', 'fav', 'mastered'
    this.isFlashcardMode = false;
  }

  getAllItems() {
    return (APP_DATA && APP_DATA.all_words && APP_DATA.all_words.length > 0)
      ? APP_DATA.all_words
      : (APP_DATA.verbs || []).map(v => ({
          ...v,
          word: v.word || v.verb,
          type: v.type || 'verb',
          type_label: v.type_label || 'Fiil (Verb)',
          type_icon: v.type_icon || '🔵'
        }));
  }

  render() {
    const container = document.getElementById('verbs-content-area');
    if (!container) return;

    const allItems = this.getAllItems();
    const customCount = window.customWordsManager ? window.customWordsManager.getAll().length : 0;

    const verbsCount = allItems.filter(i => i.type === 'verb').length;
    const phrCount = allItems.filter(i => i.type === 'phrasal_verb').length;
    const nounCount = allItems.filter(i => i.type === 'noun').length;
    const advCount = allItems.filter(i => i.type === 'adverb').length;
    const conjCount = allItems.filter(i => i.type === 'conjunction').length;
    const prepCount = allItems.filter(i => i.type === 'preposition').length;
    const adjCount = allItems.filter(i => i.type === 'adjective').length;
    const idmCount = allItems.filter(i => i.type === 'idiom').length;

    const filterTabs = [
      { id: 'all', label: `✨ Tümü (${allItems.length})` },
      { id: 'verb', label: `🔵 Fiiller (${verbsCount})` },
      { id: 'phrasal_verb', label: `⚡ Phrasal Verbs (${phrCount})` },
      { id: 'noun', label: `🔴 İsimler (${nounCount})` },
      { id: 'adverb', label: `🟣 Zarflar (${advCount})` },
      { id: 'conjunction', label: `🟠 Bağlaçlar (${conjCount})` },
      { id: 'preposition', label: `🟢 Edatlar (${prepCount})` },
      { id: 'adjective', label: `🟡 Sıfatlar (${adjCount})` },
      { id: 'idiom', label: `💬 Kalıplar (${idmCount})` },
      { id: 'A2', label: `🟢 A2 Temel` },
      { id: 'B1', label: `🔵 B1 İleri` },
      { id: 'fav', label: `⭐ Favoriler` },
      { id: 'mastered', label: `✅ Öğrenilenler` }
    ];

    const filteredItems = this.getFilteredItems();

    container.innerHTML = `
      <!-- Action Bar & Custom Vocab Book Shortcut -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="font-size:1.05rem; font-weight:900; color:var(--text-primary);">
            📚 273+ İngilizce Kelime & Gramer Ansiklopedisi
          </span>
          <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
            Fiiller, Phrasal Verbs, İsimler, Zarflar, Bağlaçlar, Edatlar, Sıfatlar • Sesli & Örnek Cümleli
          </p>
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

      <!-- Type & Category Filter Chips (Horizontal Scrollable) -->
      <div style="display:flex; overflow-x:auto; gap:6px; margin-bottom:12px; scrollbar-width:none; padding-bottom:6px;">
        ${filterTabs.map(tab => `
          <button class="cat-chip ${this.selectedCategory === tab.id ? 'active' : ''}"
                  style="font-size:0.8rem; padding:7px 12px; white-space:nowrap; font-weight:700;"
                  onclick="verbsView.setCategory('${tab.id}')">
            ${tab.label}
          </button>
        `).join('')}
      </div>

      <!-- Search Bar -->
      <div class="search-filter-bar" style="margin-bottom:10px;">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="verb-search-input" 
                 placeholder="Kelime, zarf, bağlaç, phrasal verb veya Türkçe anlam ara (örn: give up, technology, because, quickly)..." 
                 value="${this.searchTerm}" 
                 oninput="verbsView.setSearch(this.value)">
        </div>
      </div>

      <!-- Stats & View Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:0.82rem; font-weight:700; color:var(--text-secondary);">
          Listelenen: <strong style="color:var(--primary);">${filteredItems.length}</strong> / ${allItems.length} Kelime
        </span>
        <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="verbsView.toggleFlashcardMode()">
          ${this.isFlashcardMode ? '📋 Detaylı Liste' : '🗂️ Flaş Kart Modu'}
        </button>
      </div>

      <!-- Word Cards Grid -->
      <div class="verbs-grid" id="verbs-cards-container">
        ${filteredItems.length === 0 ? `
          <div style="grid-column: 1/-1; text-align:center; padding: 40px 20px; background:var(--bg-surface); border-radius:var(--radius-lg);">
            <div style="font-size: 2.5rem; margin-bottom:10px;">🔍</div>
            <h4 style="color:var(--text-primary);">Aramanıza veya seçtiğiniz kategoriye uygun kelime bulunamadı</h4>
            <button class="btn-primary" style="margin-top:12px; font-size:0.85rem;" onclick="verbsView.setCategory('all')">
              Tüm Kelimeleri Göster
            </button>
          </div>
        ` : filteredItems.map(item => this.renderItemCard(item)).join('')}
      </div>
    `;
  }

  renderItemCard(item) {
    const isMastered = window.app && window.app.isVerbMastered(item.id);
    const isFav = window.app && window.app.isVerbFavorite(item.id);
    const wordText = item.word || item.verb;

    // Type Color Styles
    let badgeColor = 'var(--primary)';
    let badgeBg = 'rgba(56, 189, 248, 0.15)';
    let borderTop = '3px solid var(--primary)';

    if (item.type === 'phrasal_verb') {
      badgeColor = '#e879f9';
      badgeBg = 'rgba(232, 121, 249, 0.15)';
      borderTop = '3px solid #e879f9';
    } else if (item.type === 'noun') {
      badgeColor = '#f87171';
      badgeBg = 'rgba(248, 113, 113, 0.15)';
      borderTop = '3px solid #f87171';
    } else if (item.type === 'adverb') {
      badgeColor = '#c084fc';
      badgeBg = 'rgba(192, 132, 252, 0.15)';
      borderTop = '3px solid #c084fc';
    } else if (item.type === 'conjunction') {
      badgeColor = '#fb923c';
      badgeBg = 'rgba(251, 146, 60, 0.15)';
      borderTop = '3px solid #fb923c';
    } else if (item.type === 'preposition') {
      badgeColor = '#4ade80';
      badgeBg = 'rgba(74, 222, 128, 0.15)';
      borderTop = '3px solid #4ade80';
    } else if (item.type === 'adjective') {
      badgeColor = '#facc15';
      badgeBg = 'rgba(250, 204, 21, 0.15)';
      borderTop = '3px solid #facc15';
    } else if (item.type === 'idiom') {
      badgeColor = '#38bdf8';
      badgeBg = 'rgba(56, 189, 248, 0.15)';
      borderTop = '3px solid #38bdf8';
    } else if (item.level === 'B1') {
      badgeColor = 'var(--accent)';
      badgeBg = 'rgba(129, 140, 248, 0.15)';
      borderTop = '3px solid var(--accent)';
    }

    return `
      <div class="verb-card" id="verb-card-${item.id}" style="${borderTop}">
        <div class="verb-card-top">
          <div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span class="verb-id-badge" style="background:${badgeBg}; color:${badgeColor}; font-weight:800;">
                ${item.type_icon || '🏷️'} #${item.id} • ${item.type_label || item.level_label || 'Kelime'}
              </span>
              <span style="font-size:0.72rem; color:var(--text-muted);">${item.category || ''}</span>
            </div>
            <div class="verb-title-group" style="margin-top:6px;">
              <h3 class="verb-name" style="color:#ffffff;">${wordText}</h3>
              <span class="verb-meaning" style="color:${badgeColor}; font-weight:700;">${item.meaning}</span>
              <button class="play-voice-btn" title="Telaffuzu Dinle" onclick="speechEngine.speak('${wordText.replace(/'/g, "\\'")}')">
                🔊
              </button>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <button class="icon-btn" style="width:32px; height:32px; font-size:0.95rem; color:${isFav ? '#f59e0b' : 'var(--text-muted)'};" 
                    title="Favorilere Ekle"
                    onclick="verbsView.toggleFavorite(${item.id})">
              ${isFav ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        <!-- Meta / Forms Row -->
        ${item.type === 'verb' ? `
          <div class="verb-forms-row">
            <span><strong>V1:</strong> ${item.forms?.v1 || wordText}</span>
            <span><strong>V2:</strong> ${item.forms?.v2 || '-'}</span>
            <span><strong>V3:</strong> ${item.forms?.v3 || '-'}</span>
          </div>
        ` : `
          <div style="background:var(--bg-surface); padding:4px 10px; border-radius:var(--radius-sm); font-size:0.75rem; color:var(--text-secondary); margin:6px 0;">
            <strong>Tür & Kategori:</strong> ${item.category || item.type_label} • <em>${item.level_label || ''}</em>
          </div>
        `}

        <!-- Olumlu (+), Olumsuz (-), Soru (?) Örnek Cümleleri -->
        <div class="verb-sentences">
          <!-- Positive (+) -->
          <div class="sentence-item pos">
            <div class="sentence-type-header">
              <span>✅ Olumlu Cümle (+)</span>
              <button class="play-voice-btn" onclick="speechEngine.speak('${item.sentences.positive.en.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            <div class="sentence-text-en">${item.sentences.positive.en}</div>
            <div class="sentence-text-tr">🇹🇷 ${item.sentences.positive.tr}</div>
          </div>

          <!-- Negative (-) -->
          <div class="sentence-item neg">
            <div class="sentence-type-header">
              <span>❌ Olumsuz Cümle (-)</span>
              <button class="play-voice-btn" onclick="speechEngine.speak('${item.sentences.negative.en.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            <div class="sentence-text-en">${item.sentences.negative.en}</div>
            <div class="sentence-text-tr">🇹🇷 ${item.sentences.negative.tr}</div>
          </div>

          <!-- Question (?) -->
          <div class="sentence-item que">
            <div class="sentence-type-header">
              <span>❓ Soru Cümlesi (?)</span>
              <button class="play-voice-btn" onclick="speechEngine.speak('${item.sentences.question.en.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            <div class="sentence-text-en">${item.sentences.question.en}</div>
            <div class="sentence-text-tr">🇹🇷 ${item.sentences.question.tr}</div>
          </div>
        </div>

        <!-- Mastered Action Bar -->
        <div class="verb-card-footer" style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn-toggle-mastered ${isMastered ? 'mastered' : ''}" 
                  style="font-size:0.75rem; padding:6px 12px;"
                  onclick="verbsView.toggleMastered(${item.id})">
            ${isMastered ? '✅ Öğrenildi (+5 XP)' : '⚪ Öğrendim Olarak İşaretle'}
          </button>
          
          <button class="btn-secondary" style="font-size:0.75rem; padding:6px 10px;" 
                  onclick="sentenceBuilder.loadPresetWord('${wordText.replace(/'/g, "\\'")}', '${item.type}'); app.switchTab('builder');">
            🧩 Cümle Kur ➔
          </button>
        </div>
      </div>
    `;
  }

  getFilteredItems() {
    let list = this.getAllItems();

    // Category / Level Filter
    if (this.selectedCategory === 'verb') {
      list = list.filter(i => i.type === 'verb');
    } else if (this.selectedCategory === 'phrasal_verb') {
      list = list.filter(i => i.type === 'phrasal_verb');
    } else if (this.selectedCategory === 'noun') {
      list = list.filter(i => i.type === 'noun');
    } else if (this.selectedCategory === 'adverb') {
      list = list.filter(i => i.type === 'adverb');
    } else if (this.selectedCategory === 'conjunction') {
      list = list.filter(i => i.type === 'conjunction');
    } else if (this.selectedCategory === 'preposition') {
      list = list.filter(i => i.type === 'preposition');
    } else if (this.selectedCategory === 'adjective') {
      list = list.filter(i => i.type === 'adjective');
    } else if (this.selectedCategory === 'idiom') {
      list = list.filter(i => i.type === 'idiom');
    } else if (this.selectedCategory === 'A2') {
      list = list.filter(i => i.level && i.level.includes('A2'));
    } else if (this.selectedCategory === 'B1') {
      list = list.filter(i => i.level && i.level.includes('B1'));
    } else if (this.selectedCategory === 'fav') {
      const favIds = (window.app) ? window.app.favoriteVerbs : [];
      list = list.filter(i => favIds.includes(i.id));
    } else if (this.selectedCategory === 'mastered') {
      const masteredIds = (window.app) ? window.app.masteredVerbs : [];
      list = list.filter(i => masteredIds.includes(i.id));
    }

    // Search query filter
    if (this.searchTerm.trim() !== '') {
      const q = this.searchTerm.toLowerCase().trim();
      list = list.filter(i => {
        const wordStr = (i.word || i.verb || '').toLowerCase();
        const meaningStr = (i.meaning || '').toLowerCase();
        const catStr = (i.category || '').toLowerCase();
        return wordStr.includes(q) || meaningStr.includes(q) || catStr.includes(q);
      });
    }

    return list;
  }

  setCategory(cat) {
    this.selectedCategory = cat;
    this.render();
  }

  setLevel(lvl) {
    this.setCategory(lvl);
  }

  setSearch(val) {
    this.searchTerm = val;
    this.render();
  }

  toggleFavorite(id) {
    if (window.app) {
      window.app.toggleFavorite(id);
      this.render();
    }
  }

  toggleMastered(id) {
    if (window.app) {
      window.app.toggleMastered(id);
      this.render();
    }
  }

  toggleFlashcardMode() {
    this.isFlashcardMode = !this.isFlashcardMode;
    const grid = document.getElementById('verbs-cards-container');
    if (grid) {
      grid.classList.toggle('flashcard-compact', this.isFlashcardMode);
    }
  }

  openAddWordModal() {
    const modal = document.getElementById('add-word-modal');
    if (modal) modal.classList.add('active');
  }

  closeAddWordModal() {
    const modal = document.getElementById('add-word-modal');
    if (modal) modal.classList.remove('active');
  }

  saveCustomWordFromModal() {
    const enInput = document.getElementById('modal-word-en');
    const trInput = document.getElementById('modal-word-tr');

    if (!enInput || !trInput) return;

    const en = enInput.value.trim();
    const tr = trInput.value.trim();

    if (!en || !tr) {
      alert('Lütfen hem İngilizce kelimeyi hem de Türkçe anlamını girin.');
      return;
    }

    if (window.customWordsManager) {
      window.customWordsManager.addWord(en, tr);
    }

    enInput.value = '';
    trInput.value = '';
    this.closeAddWordModal();
    this.render();

    if (window.app) {
      window.app.showToast('✅ Yeni kelime Kelime Defterine eklendi!');
    }
  }
}

// Global instance
window.verbsView = new VerbsView();
