/**
 * School Mode Manager (Richmond Fly Higher 2.0 & Oxford Bookworms for 9th Grade)
 * Complete curriculum isolation from general 158-verb system.
 */

class SchoolModeManager {
  constructor() {
    this.curriculum = null;
    this.currentSubTab = 'units';
    this.activeUnit = null;
    this.activeBook = null;
    this.activeChapterIdx = 0;
    this.flashcardsState = {
      queue: [],
      currentIndex: 0,
      isFlipped: false,
      correctCount: 0,
      unitId: null
    };
    this.examState = {
      activeExam: null,
      userAnswers: {},
      result: null
    };

    this.myWordsFilter = 'all'; // 'all', 'unmastered', 'mastered'
    this.schoolWordsKey = 'school_custom_words_9th';
    this.init();
  }

  speakWord(text, btnElement = null) {
    if (!text) return;
    if (btnElement) {
      btnElement.classList.add('playing');
      setTimeout(() => btnElement.classList.remove('playing'), 1500);
    }
    const engine = window.speechEngine || window.speechUtils;
    if (engine) {
      engine.speak(text, () => {
        if (btnElement) btnElement.classList.remove('playing');
      });
    }
  }

  openUnitGrammarVideo(unitId, initialVideoIndex = 0) {
    const unit = (this.curriculum.units || []).find(u => u.id === unitId);
    if (!unit || !unit.grammar_details || !unit.grammar_details.video_data) {
      if (window.app) window.app.showToast('Bu ünite için video ders hazırlanıyor.');
      return;
    }

    const vData = unit.grammar_details.video_data;
    const lessonObj = {
      id: `school_vid_${unit.id}`,
      title: `${unit.code}: ${unit.grammar_details.badge || unit.grammar_focus}`,
      topic: unit.grammar_details.badge || unit.grammar_focus,
      description: unit.grammar_summary || '',
      duration: "12 Dk",
      level: "9. Sınıf (A2+/B1)",
      search_query: vData.search_query,
      videos: vData.videos
    };

    if (window.grammarView) {
      const existingIdx = window.grammarView.defaultVideoLessons.findIndex(l => l.id === lessonObj.id);
      if (existingIdx !== -1) {
        window.grammarView.defaultVideoLessons[existingIdx] = lessonObj;
      } else {
        window.grammarView.defaultVideoLessons.unshift(lessonObj);
      }
      window.grammarView.openVideoModal(lessonObj.id, initialVideoIndex);
    }
  }

  openUnit(unitId) {
    if (typeof this.closeGrammarDetailModal === 'function') {
      this.closeGrammarDetailModal();
    }
    if (window.app && window.app.appMode !== 'school') {
      window.app.switchAppMode('school');
    }
    const targetUnit = (this.curriculum && this.curriculum.units)
      ? this.curriculum.units.find(u => u.id === unitId || u.code === unitId || `fh_unit_${u.number}` === unitId)
      : null;
    const finalUnitId = targetUnit ? targetUnit.id : (unitId || 'fh_unit_1');

    this.switchSubTab('units', finalUnitId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openGrammarDetailModal(unitId) {
    const unit = (this.curriculum.units || []).find(u => u.id === unitId) || this.curriculum.units[0];
    if (!unit || !unit.grammar_details) {
      if (window.app) window.app.showToast('Gramer detayları yüklenemedi.');
      return;
    }

    const modal = document.getElementById('grammar-detail-modal');
    const modalCard = document.getElementById('grammar-detail-modal-card');
    if (!modal || !modalCard) return;

    const gd = unit.grammar_details;

    modalCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
        <div>
          <span class="school-unit-tag" style="background:${unit.color}25; color:${unit.color}; font-size:0.75rem; font-weight:800; margin-bottom:4px;">
            🎓 9. SINIF ${unit.code} • GRAMER AKADEMİSİ
          </span>
          <h2 style="font-size:1.3rem; font-weight:900; color:#ffffff; margin-top:4px;">
            ${gd.title || unit.grammar_focus}
          </h2>
          <p style="font-size:0.85rem; color:#38bdf8; margin-top:2px;">
            ${gd.badge || unit.grammar_summary}
          </p>
        </div>
        <button class="icon-btn" onclick="schoolMode.closeGrammarDetailModal()" style="font-size:1.2rem; background:rgba(255,255,255,0.08); border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:#ffffff; cursor:pointer; border:none;" title="Kapat">✕</button>
      </div>

      <!-- Video Shelf Inside Modal -->
      ${gd.video_data && gd.video_data.videos && gd.video_data.videos.length > 0 ? `
        <div class="grammar-video-topics-container" style="margin-bottom:16px;">
          <div class="gvt-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="gvt-icon">🎬</span>
              <div>
                <div class="gvt-title">Bu Konunun Video Dersleri</div>
                <div class="gvt-sub">İstediğin alt konuyu seçip hemen izleyebilirsin:</div>
              </div>
            </div>
          </div>
          <div class="gvt-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            ${gd.video_data.videos.map((vid, vIdx) => `
              <div class="gvt-card" onclick="schoolMode.closeGrammarDetailModal(); schoolMode.openUnitGrammarVideo('${unit.id}', ${vIdx});" title="Bu videoyu izlemek için tıkla">
                <div class="gvt-card-top">
                  <span class="gvt-card-badge">${vid.badge || `Konu ${vIdx + 1}`}</span>
                  <span class="gvt-card-duration">⏱ ${vid.duration || '12 Dk'}</span>
                </div>
                <div class="gvt-card-title">${vid.topic_name || vid.title}</div>
                <div class="gvt-card-bottom">
                  <span class="gvt-card-author">👨‍🏫 ${vid.author}</span>
                  <span class="gvt-card-play">İzle ▶</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Formula Cards -->
      ${gd.formula_cards ? `
        <div style="margin-bottom: 16px;">
          <h4 style="font-size:0.95rem; font-weight:800; color:#38bdf8; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span>📐</span> Cümle Formülleri & Kurallar:
          </h4>
          <div class="grammar-formula-grid">
            ${gd.formula_cards.map(fc => `
              <div class="grammar-formula-box">
                <div class="fc-title">${fc.tense}</div>
                <div class="fc-usage">📌 <strong>Kullanım:</strong> ${fc.usage}</div>
                <div class="fc-patterns">
                  <div class="fc-row pos"><span class="sign">✅ (+)</span><code>${fc.pos_formula}</code></div>
                  <div class="fc-row neg"><span class="sign">❌ (-)</span><code>${fc.neg_formula}</code></div>
                  <div class="fc-row que"><span class="sign">❓ (?)</span><code>${fc.que_formula}</code></div>
                </div>
                ${fc.keywords ? `<div class="fc-keywords"><span>🔑 <strong>Zaman Zarfları:</strong></span><span class="kw-tag">${fc.keywords}</span></div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Golden Rules -->
      ${gd.state_verbs_note ? `
        <div class="grammar-golden-rule-card" style="margin-bottom:16px;">
          <div class="gr-header"><span>⚡</span><strong>${gd.state_verbs_note.title}</strong></div>
          <p class="gr-desc">${gd.state_verbs_note.desc.replace(/\n/g, '<br>')}</p>
          ${gd.state_verbs_note.verbs ? `
            <div class="gr-chips">
              ${gd.state_verbs_note.verbs.map(v => `<span class="gr-chip">${v}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Examples -->
      ${gd.examples ? `
        <div style="margin-bottom: 16px;">
          <h4 style="font-size:0.95rem; font-weight:800; color:#818cf8; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span>💬</span> Sesli Örnek Cümleler:
          </h4>
          <div class="grammar-examples-grid">
            ${gd.examples.map(ex => `
              <div class="grammar-example-card">
                <div class="g-ex-top">
                  <span class="g-ex-en">${this.wrapSentence(ex.en)}</span>
                  <button class="icon-audio-btn" onclick="schoolMode.speakWord('${ex.en.replace(/'/g, "\\'")}', this)">🔊</button>
                </div>
                <div class="g-ex-tr">🇹🇷 ${ex.tr}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Pitfalls -->
      ${gd.pitfalls ? `
        <div style="margin-bottom: 16px;">
          <h4 style="font-size:0.95rem; font-weight:800; color:#f87171; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span>⚠️</span> Sınavlarda En Çok Yapılan Hatalar:
          </h4>
          <div class="grammar-pitfalls-grid">
            ${gd.pitfalls.map(pf => `
              <div class="grammar-pitfall-box">
                <div class="grammar-pitfall-comparison">
                  <div class="grammar-pitfall-wrong"><span>❌</span><code>${this.wrapSentence(pf.wrong)}</code></div>
                  <div class="grammar-pitfall-correct"><span>✅</span><code>${this.wrapSentence(pf.correct)}</code></div>
                </div>
                <div class="grammar-pitfall-note">💡 ${pf.note}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:14px; flex-wrap:wrap; gap:10px;">
        <button class="btn-primary" onclick="schoolMode.closeGrammarDetailModal(); schoolMode.openUnitGrammarVideo('${unit.id}', 0);">
          <span>🎬</span>
          <span>YouTube Video Dersini Başlat (+10 XP)</span>
        </button>
        <button class="btn-secondary" onclick="schoolMode.closeGrammarDetailModal(); schoolMode.openUnit('${unit.id}');">
          <span>🏛️</span>
          <span>Bu Konunun 9. Sınıf Ünitesine Git ➔</span>
        </button>
      </div>
    `;

    modal.classList.add('active');
  }

  closeGrammarDetailModal() {
    const modal = document.getElementById('grammar-detail-modal');
    if (modal) modal.classList.remove('active');
  }

  async init() {
    try {
      const resp = await fetch('./data/school_fly_higher.json?v=' + Date.now());
      if (resp.ok) {
        this.curriculum = await resp.json();
      } else {
        console.warn('Failed to load school_fly_higher.json, status:', resp.status);
      }
    } catch (e) {
      console.error('Error loading school curriculum:', e);
    }
  }

  getSchoolWords() {
    try {
      return JSON.parse(localStorage.getItem(this.schoolWordsKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  saveSchoolWords(words) {
    localStorage.setItem(this.schoolWordsKey, JSON.stringify(words));
  }

  addWordToSchoolNotebook(en, tr, pos = 'Kelime', example = '') {
    if (!en || !tr) return false;
    const words = this.getSchoolWords();
    const cleanEn = en.trim().toLowerCase();
    
    // Check if exists
    const exists = words.some(w => w.en.toLowerCase() === cleanEn);
    if (exists) {
      if (window.app) window.app.showToast(`"${en}" zaten okul defterinizde kayıtlı!`);
      return false;
    }

    const newWord = {
      id: 'sw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      en: en.trim(),
      tr: tr.trim(),
      pos: pos || 'Kelime',
      example: example || '',
      dateAdded: new Date().toISOString(),
      mastered: false,
      reviews: 0
    };

    words.unshift(newWord);
    this.saveSchoolWords(words);

    if (window.app) {
      window.app.addXP(2);
      window.app.showToast(`✨ "${en}" 9. Sınıf Okul Defterine eklendi! (+2 XP)`);
    }

    return true;
  }

  render(container) {
    if (!container) return;
    if (!this.curriculum) {
      container.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
          <div class="spinner" style="margin:0 auto 16px;"></div>
          <h3>Richmond Fly Higher 2.0 Müfredatı Yükleniyor...</h3>
        </div>
      `;
      // Retry once loaded
      setTimeout(() => this.render(container), 300);
      return;
    }

    container.innerHTML = `
      <div class="school-portal-wrapper">
        <!-- School Top Hero Banner -->
        <div class="school-hero-card">
          <div class="school-hero-badge">
            <span>🏫 MEB & Kolej 9. Sınıf İngilizce Portalı</span>
          </div>
          <div class="school-hero-content">
            <div>
              <h2 class="school-hero-title">Richmond Fly Higher 2.0 & Oxford Bookworms</h2>
              <p class="school-hero-subtitle">
                9. Sınıf ders kitabı üniteleri, Oxford hikaye serisi, akıllı sayfa tarayıcı ve dönem yazılı sınav simülatörü.
              </p>
            </div>
            <div class="school-hero-stats">
              <div class="school-stat-box">
                <span class="val">${this.curriculum.units ? this.curriculum.units.length : 9}</span>
                <span class="lbl">Ünite</span>
              </div>
              <div class="school-stat-box">
                <span class="val">${this.getTotalVocabCount()}</span>
                <span class="lbl">Hedef Kelime</span>
              </div>
              <div class="school-stat-box">
                <span class="val">${this.getSchoolWords().length}</span>
                <span class="lbl">Defterim</span>
              </div>
            </div>
          </div>

          <!-- School Sub Navigation Tabs -->
          <div class="school-subnav">
            <button class="school-tab-btn ${this.currentSubTab === 'units' ? 'active' : ''}" onclick="schoolMode.switchSubTab('units')">
              <span>📚</span>
              <span>Fly Higher Üniteleri</span>
            </button>
            <button class="school-tab-btn ${this.currentSubTab === 'flashcards' ? 'active' : ''}" onclick="schoolMode.switchSubTab('flashcards')">
              <span>⚡</span>
              <span>Kart Ezber</span>
            </button>
            <button class="school-tab-btn ${this.currentSubTab === 'bookworms' ? 'active' : ''}" onclick="schoolMode.switchSubTab('bookworms')">
              <span>📖</span>
              <span>Oxford Bookworms</span>
            </button>
            <button class="school-tab-btn ${this.currentSubTab === 'scanner' ? 'active' : ''}" onclick="schoolMode.switchSubTab('scanner')">
              <span>📷</span>
              <span>Kitap / Ödev Tara</span>
            </button>
            <button class="school-tab-btn ${this.currentSubTab === 'exams' ? 'active' : ''}" onclick="schoolMode.switchSubTab('exams')">
              <span>📝</span>
              <span>Yazılı Sınavı</span>
            </button>
            <button class="school-tab-btn ${this.currentSubTab === 'mywords' ? 'active' : ''}" onclick="schoolMode.switchSubTab('mywords')">
              <span>📓</span>
              <span>Okul Defterim (${this.getSchoolWords().length})</span>
            </button>
          </div>
        </div>

        <!-- Sub Content View Area -->
        <div id="school-subtab-content" class="school-subtab-content"></div>
      </div>
    `;

    this.renderSubTabContent();
  }

  getTotalVocabCount() {
    if (!this.curriculum || !this.curriculum.units) return 0;
    return this.curriculum.units.reduce((acc, u) => acc + (u.words ? u.words.length : 0), 0);
  }

  switchSubTab(tabName, extraData = null) {
    this.currentSubTab = tabName;
    if (tabName === 'units' && extraData) {
      this.activeUnit = extraData;
    } else if (tabName === 'units' && !extraData) {
      this.activeUnit = null;
    }

    if (tabName === 'flashcards' && extraData) {
      this.flashcardsState.unitId = extraData;
    }

    if (tabName === 'bookworms' && extraData) {
      this.activeBook = extraData;
      this.activeChapterIdx = 0;
    }

    // Update tab button styles
    document.querySelectorAll('.school-tab-btn').forEach(btn => {
      const isMatch = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`);
      btn.classList.toggle('active', !!isMatch);
    });

    this.renderSubTabContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderSubTabContent() {
    const content = document.getElementById('school-subtab-content');
    if (!content) return;

    switch (this.currentSubTab) {
      case 'units':
        if (this.activeUnit) {
          this.renderUnitDetailView(content);
        } else {
          this.renderUnitsGridView(content);
        }
        break;
      case 'flashcards':
        this.renderFlashcardsView(content);
        break;
      case 'bookworms':
        if (this.activeBook) {
          this.renderBookwormReaderView(content);
        } else {
          this.renderBookwormsLibraryView(content);
        }
        break;
      case 'scanner':
        this.renderScannerView(content);
        break;
      case 'exams':
        this.renderExamsView(content);
        break;
      case 'mywords':
        this.renderMyWordsView(content);
        break;
      default:
        this.renderUnitsGridView(content);
    }
  }

  /* ----------------------------------------------------
   * 1. UNITS VIEW & DETAIL
   * ---------------------------------------------------- */
  renderUnitsGridView(container) {
    const units = this.curriculum.units || [];
    const myWords = this.getSchoolWords();

    container.innerHTML = `
      <div class="school-section-header">
        <div>
          <h3>📚 Richmond Fly Higher 2.0 (Student's Book & Workbook)</h3>
          <p>9. Sınıf müfredatına ait 9 temel ünite, kelime listeleri, gramer özetleri ve etkileşimli okuma parçaları</p>
        </div>
      </div>

      <div class="school-units-grid">
        ${units.map(unit => {
          const wordsCount = unit.words ? unit.words.length : 0;
          return `
            <div class="school-unit-card" onclick="schoolMode.switchSubTab('units', '${unit.id}')">
              <div class="school-unit-card-header" style="border-left-color: ${unit.color || '#818cf8'};">
                <div class="school-unit-icon" style="background:${unit.color}22; color:${unit.color};">
                  ${unit.icon || '📖'}
                </div>
                <div class="school-unit-meta">
                  <span class="school-unit-tag" style="background:${unit.color}20; color:${unit.color};">${unit.code}</span>
                  <h4 class="school-unit-name">${unit.title}</h4>
                </div>
              </div>

              <div class="school-unit-body">
                <div class="school-unit-row">
                  <span class="lbl">🎯 Konu:</span>
                  <span class="val">${unit.topic}</span>
                </div>
                <div class="school-unit-row">
                  <span class="lbl">⚡ Gramer:</span>
                  <span class="val" style="color:var(--accent); font-weight:600;">${unit.grammar_focus}</span>
                </div>
              </div>

              <div class="school-unit-footer">
                <span class="school-badge-vocab">🔤 ${wordsCount} Kelime</span>
                <button class="school-btn-sm" onclick="event.stopPropagation(); schoolMode.switchSubTab('units', '${unit.id}')">
                  İncele & Çalış →
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderUnitDetailView(container) {
    const unit = this.curriculum.units.find(u => u.id === this.activeUnit);
    if (!unit) {
      this.activeUnit = null;
      this.renderUnitsGridView(container);
      return;
    }

    const words = unit.words || [];
    const myWords = this.getSchoolWords();

    container.innerHTML = `
      <div class="school-unit-detail-view">
        <!-- Back button & Header -->
        <div class="school-detail-nav">
          <button class="btn-secondary" onclick="schoolMode.switchSubTab('units', null)">
            ← Tüm Ünitelere Dön
          </button>
          <div style="display:flex; gap:8px;">
            <button class="btn-primary" onclick="schoolMode.switchSubTab('flashcards', '${unit.id}')">
              ⚡ Bu Ünitenin Kartlarıyla Çalış (${words.length} Kart)
            </button>
          </div>
        </div>

        <div class="school-unit-banner" style="border-left: 5px solid ${unit.color || '#818cf8'};">
          <div class="unit-banner-left">
            <span class="school-unit-tag" style="background:${unit.color}25; color:${unit.color};">${unit.code}</span>
            <h2>${unit.title}</h2>
            <p class="unit-topic-desc">📌 <strong>Ana Tema:</strong> ${unit.topic}</p>
          </div>
          <div class="unit-banner-right">
            <div class="grammar-spotlight">
              <span class="badge">📖 Gramer Odağı</span>
              <strong>${unit.grammar_focus}</strong>
              <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">${unit.grammar_summary}</p>
            </div>
          </div>
        </div>

        <!-- Section 1: Comprehensive 9th Grade Grammar Academy & Video Lesson -->
        ${unit.grammar_details ? `
          <div class="school-card-panel grammar-detail-panel" style="border: 2px solid ${unit.color || '#818cf8'}; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.85));">
            <div class="panel-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <span class="school-unit-tag" style="background:${unit.color}25; color:${unit.color}; font-size:0.75rem; font-weight:800; margin-bottom:4px;">
                  🎓 9. SINIF GRAMER DERSİ & AKADEMİ
                </span>
                <h3 style="font-size:1.25rem; font-weight:900; color:#ffffff; margin-top:4px;">
                  ${unit.grammar_details.title || unit.grammar_focus}
                </h3>
                <p style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">
                  ${unit.grammar_details.badge || unit.grammar_summary}
                </p>
              </div>

              <!-- YouTube Quick Play All Button -->
              <div style="display:flex; gap:8px; align-items:center;">
                <button class="btn-video-watch" onclick="schoolMode.openUnitGrammarVideo('${unit.id}', 0)" title="Bu ünitenin video derslerini başlat">
                  <span>🎬</span>
                  <span>Video Dersi Başlat (+10 XP)</span>
                </button>
              </div>
            </div>

            <!-- YouTube Video Lessons & Sub-Topics Shelf -->
            ${unit.grammar_details.video_data && unit.grammar_details.video_data.videos && unit.grammar_details.video_data.videos.length > 0 ? `
              <div class="grammar-video-topics-container">
                <div class="gvt-header">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="gvt-icon">🎬</span>
                    <div>
                      <div class="gvt-title">Bu Ünitenin Video Dersleri (Alt Konular)</div>
                      <div class="gvt-sub">İstediğin alt konuyu seçip doğrudan ilgili dersi izleyebilirsin:</div>
                    </div>
                  </div>
                </div>
                <div class="gvt-cards-grid">
                  ${unit.grammar_details.video_data.videos.map((vid, vIdx) => `
                    <div class="gvt-card" onclick="schoolMode.openUnitGrammarVideo('${unit.id}', ${vIdx})" title="Bu videoyu izlemek için tıkla">
                      <div class="gvt-card-top">
                        <span class="gvt-card-badge">${vid.badge || `Alt Konu ${vIdx + 1}`}</span>
                        <span class="gvt-card-duration">⏱ ${vid.duration || '12 Dk'}</span>
                      </div>
                      <div class="gvt-card-title">${vid.topic_name || vid.title}</div>
                      <div class="gvt-card-bottom">
                        <span class="gvt-card-author">👨‍🏫 ${vid.author}</span>
                        <span class="gvt-card-play">İzle ▶</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- 1. Formula & Rules Grid -->
            ${unit.grammar_details.formula_cards ? `
              <div style="margin-bottom: 16px;">
                <h4 style="font-size:0.95rem; font-weight:800; color:#38bdf8; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                  <span>📐</span> Kullanım Alanları ve Cümle Formülleri:
                </h4>
                <div class="grammar-formula-grid">
                  ${unit.grammar_details.formula_cards.map(fc => `
                    <div class="grammar-formula-box">
                      <div class="fc-title">${fc.tense}</div>
                      <div class="fc-usage">📌 <strong>Kullanım:</strong> ${fc.usage}</div>
                      
                      <div class="fc-patterns">
                        <div class="fc-row pos">
                          <span class="sign">✅ (+)</span>
                          <code>${fc.pos_formula}</code>
                        </div>
                        <div class="fc-row neg">
                          <span class="sign">❌ (-)</span>
                          <code>${fc.neg_formula}</code>
                        </div>
                        <div class="fc-row que">
                          <span class="sign">❓ (?)</span>
                          <code>${fc.que_formula}</code>
                        </div>
                      </div>

                      ${fc.keywords ? `
                        <div class="fc-keywords">
                          <span>🔑 <strong>Zaman Zarfları:</strong></span>
                          <span class="kw-tag">${fc.keywords}</span>
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- 2. State Verbs / Golden Rule Spotlight -->
            ${unit.grammar_details.state_verbs_note ? `
              <div class="grammar-golden-rule-card">
                <div class="gr-header">
                  <span>⚡</span>
                  <strong>${unit.grammar_details.state_verbs_note.title}</strong>
                </div>
                <p class="gr-desc">${unit.grammar_details.state_verbs_note.desc.replace(/\n/g, '<br>')}</p>
                ${unit.grammar_details.state_verbs_note.verbs ? `
                  <div class="gr-chips">
                    ${unit.grammar_details.state_verbs_note.verbs.map(v => `
                      <span class="gr-chip">${v}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <!-- 3. Audio Example Sentences -->
            ${unit.grammar_details.examples ? `
              <div style="margin-top: 18px;">
                <h4 style="font-size:0.95rem; font-weight:800; color:#818cf8; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                  <span>💬</span> Örnek Cümleler & Sesli Telaffuz:
                </h4>
                <div class="grammar-examples-grid">
                  ${unit.grammar_details.examples.map(ex => `
                    <div class="grammar-example-card">
                      <div class="g-ex-top">
                        <span class="g-ex-en">${this.wrapSentence(ex.en)}</span>
                        <button class="icon-audio-btn" onclick="schoolMode.speakWord('${ex.en.replace(/'/g, "\\'")}', this)" title="Cümleyi Dinle">
                          🔊
                        </button>
                      </div>
                      <div class="g-ex-tr">🇹🇷 ${ex.tr}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- 4. Common Pitfalls & Traps -->
            ${unit.grammar_details.pitfalls ? `
              <div style="margin-top: 18px;">
                <h4 style="font-size:0.95rem; font-weight:800; color:#f87171; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                  <span>⚠️</span> Sınavlarda En Çok Yapılan Hatalar & Doğruları:
                </h4>
                <div class="grammar-pitfalls-grid">
                  ${unit.grammar_details.pitfalls.map(pf => `
                    <div class="grammar-pitfall-box">
                      <div class="grammar-pitfall-comparison">
                        <div class="grammar-pitfall-wrong">
                          <span>❌ <strong>Yanlış:</strong> "${this.wrapSentence(pf.wrong)}"</span>
                        </div>
                        <div class="grammar-pitfall-correct">
                          <span>✅ <strong>Doğru:</strong> "${this.wrapSentence(pf.correct)}"</span>
                        </div>
                        <div class="grammar-pitfall-note">
                          💡 <strong>Açıklama:</strong> ${pf.explanation}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Section 2: Vocabulary List -->
        <div class="school-card-panel">
          <div class="panel-header">
            <h3>🔤 ${unit.code} Hedef Kelimeler (${words.length} Kelime)</h3>
            <span style="font-size:0.8rem; color:var(--text-secondary);">Hoparlör butonuna basarak telaffuzu dinleyin, "+" ile defterinize ekleyin.</span>
          </div>

          <div class="school-vocab-grid">
            ${words.map(w => {
              const inNotebook = myWords.some(mw => mw.en.toLowerCase() === w.en.toLowerCase());
              return `
                <div class="school-word-card">
                  <div class="word-card-top">
                    <div class="word-card-main" onclick="schoolMode.speakWord('${w.en.replace(/'/g, "\\'")}')" style="cursor:pointer;" title="Dinlemek için tıklayın">
                      <span class="word-en">${w.en}</span>
                      <span class="word-pos">${w.pos || w.type}</span>
                    </div>
                    <div class="word-actions">
                      <button class="icon-audio-btn" onclick="schoolMode.speakWord('${w.en.replace(/'/g, "\\'")}', this)" title="Telaffuz Dinle">
                        🔊
                      </button>
                      <button class="icon-add-btn ${inNotebook ? 'added' : ''}" 
                              onclick="schoolMode.toggleWordInNotebook('${w.en.replace(/'/g, "\\'")}', '${w.tr.replace(/'/g, "\\'")}', '${(w.pos || '').replace(/'/g, "\\'")}', '${(w.example || '').replace(/'/g, "\\'")}', this)" 
                              title="${inNotebook ? 'Defterde Ekli' : 'Okul Defterine Ekle'}">
                        ${inNotebook ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                  <div class="word-tr">${w.tr}</div>
                  ${w.example ? `
                    <div class="word-example">
                      💬 "${this.wrapSentence(w.example)}"
                    </div>
                  ` : ''}

                  <!-- Açılır Cümle Kalıpları (+ / - / ?) -->
                  <div class="school-card-expand-bar" 
                       onclick="schoolMode.toggleCardSentences(this, '${w.en.replace(/'/g, "\\'")}', '${(w.tr || '').replace(/'/g, "\\'")}', '${(w.pos || w.type || '').replace(/'/g, "\\'")}', '${(unit.grammar_focus || unit.title || '').replace(/'/g, "\\'")}')">
                    <span class="expand-label">📖 Örnek Cümleler (+ / - / ?)</span>
                    <span class="expand-icon">▾</span>
                  </div>
                  <div class="school-card-sentences-drawer" style="display:none;"></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 3: Interactive Reading Passage -->
        ${unit.reading_passage ? `
          <div class="school-card-panel">
            <div class="panel-header">
              <h3>📖 ${unit.reading_passage.title || 'Okuma Parçası (Reading Passage)'}</h3>
              <span class="reading-hint-badge">💡 Metindeki herhangi bir kelimenin üzerine dokunup anlamını görebilir ve defterinize ekleyebilirsiniz.</span>
            </div>

            <div class="interactive-reading-box">
              <h4 style="color:var(--primary); margin-bottom:12px; font-size:1.1rem;">${unit.reading_passage.title}</h4>
              <div class="interactive-text-body">
                ${this.renderInteractiveText(unit.reading_passage.text)}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  toggleWordInNotebook(en, tr, pos, example = '', btnElement = null) {
    if (!en) return;
    const words = this.getSchoolWords();
    const cleanEn = en.trim().toLowerCase();
    const index = words.findIndex(w => w.en.toLowerCase() === cleanEn);
    let isNowAdded = false;

    if (index >= 0) {
      words.splice(index, 1);
      this.saveSchoolWords(words);
      if (window.app) window.app.showToast(`🗑️ "${en}" okul defterinden çıkarıldı.`);
      isNowAdded = false;
    } else {
      const added = this.addWordToSchoolNotebook(en, tr, pos, example);
      isNowAdded = added;
    }

    // Direct in-place UI update for the clicked button
    if (btnElement && btnElement.classList) {
      btnElement.classList.toggle('added', isNowAdded);
      btnElement.innerHTML = isNowAdded ? '✓' : '+';
      btnElement.title = isNowAdded ? 'Defterde Ekli' : 'Okul Defterine Ekle';
    }

    // Also update all matching buttons across the currently rendered DOM
    document.querySelectorAll('.icon-add-btn').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      if (onclickAttr.toLowerCase().includes(`'${cleanEn}'`) || onclickAttr.toLowerCase().includes(`"${cleanEn}"`)) {
        btn.classList.toggle('added', isNowAdded);
        btn.innerHTML = isNowAdded ? '✓' : '+';
        btn.title = isNowAdded ? 'Defterde Ekli' : 'Okul Defterine Ekle';
      }
    });

    // Only refresh active view when on notebook/mywords or flashcards subtab
    if (this.currentSubTab === 'mywords' || this.currentSubTab === 'flashcards') {
      this.renderSubTabContent();
    }
  }

  wrapSentence(rawText) {
    if (!rawText || typeof rawText !== 'string') return rawText || '';
    if (window.wordLookup && typeof window.wordLookup.wrap === 'function') {
      return window.wordLookup.wrap(rawText);
    }
    return this.renderInteractiveText(rawText);
  }

  renderInteractiveText(rawText) {
    if (!rawText) return '';
    if (window.wordLookup && typeof window.wordLookup.wrap === 'function') {
      return window.wordLookup.wrap(rawText);
    }
    // Split into tokens preserving punctuation and whitespace
    const tokens = rawText.split(/(\s+|[.,!?;:"()]+)/);
    return tokens.map(token => {
      const clean = token.replace(/[^a-zA-Z'-]/g, '').trim();
      if (!clean || clean.length < 2) {
        return token;
      }
      return `<span class="interactive-word" onclick="schoolMode.handleWordTokenClick('${clean.replace(/'/g, "\\'")}', event)" data-word="${clean}">${token}</span>`;
    }).join('');
  }

  handleWordTokenClick(word, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (window.wordLookup) {
      window.wordLookup.openWord(word, event);
    } else {
      this.speakWord(word);
    }
  }

  /* ----------------------------------------------------
   * 2. FLASHCARD TRAINER VIEW
   * ---------------------------------------------------- */
  renderFlashcardsView(container) {
    const units = this.curriculum.units || [];
    const myWords = this.getSchoolWords();

    // Prepare cards queue if not prepared
    if (!this.flashcardsState.queue || this.flashcardsState.queue.length === 0) {
      this.loadFlashcardsQueue();
    }

    const state = this.flashcardsState;
    const currentCard = state.queue[state.currentIndex];
    const totalCards = state.queue.length;

    container.innerHTML = `
      <div class="school-flashcard-module">
        <div class="school-flashcard-header">
          <div>
            <h3>⚡ 9. Sınıf Akıllı Kelime Ezberleme Kartları</h3>
            <p>Kartı çevirmek için üzerine tıklayın. Bilmediğiniz kelimeleri tekrar kuyruğuna alın.</p>
          </div>

          <!-- Unit Filter Selector -->
          <div class="flashcard-filter-group">
            <label style="font-size:0.8rem; color:var(--text-secondary); font-weight:700;">Ünite Seç:</label>
            <select class="select-input" style="max-width:260px;" onchange="schoolMode.onFlashcardUnitChange(this.value)">
              <option value="all" ${state.unitId === 'all' || !state.unitId ? 'selected' : ''}>Tüm Üniteler (Karma)</option>
              <option value="mywords" ${state.unitId === 'mywords' ? 'selected' : ''}>📓 Okul Defterim - Tümü (${myWords.length} Kelime)</option>
              <option value="mywords_unmastered" ${state.unitId === 'mywords_unmastered' ? 'selected' : ''}>🎯 Okul Defterim - Çalışılacaklar (${myWords.filter(w => !w.mastered).length} Kelime)</option>
              <option value="mywords_mastered" ${state.unitId === 'mywords_mastered' ? 'selected' : ''}>✅ Okul Defterim - Öğrenilenler (${myWords.filter(w => w.mastered).length} Kelime)</option>
              ${units.map(u => `
                <option value="${u.id}" ${state.unitId === u.id ? 'selected' : ''}>${u.code}: ${u.title.split(':')[1] || u.title}</option>
              `).join('')}
            </select>
          </div>
        </div>

        ${totalCards === 0 ? `
          <div class="school-card-panel" style="text-align:center; padding:50px 20px;">
            <div style="font-size:3rem; margin-bottom:12px;">📭</div>
            <h4>Bu kategoride henüz kelime bulunmuyor.</h4>
            <p style="color:var(--text-secondary); margin-top:6px;">Lütfen başka bir ünite seçin veya okul defterinize kelime ekleyin.</p>
          </div>
        ` : currentCard ? `
          <!-- Progress bar -->
          <div class="flashcard-progress-bar-wrapper">
            <div class="progress-info">
              <span>Kart: <strong>${state.currentIndex + 1} / ${totalCards}</strong></span>
              <span>Doğru: <strong>${state.correctCount}</strong></span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${((state.currentIndex + 1) / totalCards) * 100}%"></div>
            </div>
          </div>

          <!-- Flip Card Container -->
          <div class="flashcard-card-scene" onclick="schoolMode.flipCard()">
            <div class="flashcard-card-inner ${state.isFlipped ? 'flipped' : ''}">
              <!-- Front Side -->
              <div class="flashcard-face flashcard-front">
                <span class="card-side-label">🇬🇧 İngilizce</span>
                <div class="card-word-main">
                  <h2>${currentCard.en}</h2>
                  <span class="card-pos-badge">${currentCard.pos || currentCard.type || 'Kelime'}</span>
                </div>
                <div class="card-audio-btn-row">
                  <button class="icon-audio-btn large" onclick="event.stopPropagation(); schoolMode.speakWord('${currentCard.en.replace(/'/g, "\\'")}', this)">
                    🔊 Dinle
                  </button>
                </div>
                ${currentCard.example ? `
                  <div class="card-example-box">
                    💬 "${this.wrapSentence(currentCard.example)}"
                  </div>
                ` : ''}
                <div class="card-click-hint">🔄 Anlamını görmek için karta dokunun</div>
              </div>

              <!-- Back Side -->
              <div class="flashcard-face flashcard-back">
                <span class="card-side-label">🇹🇷 Türkçe Karşılığı</span>
                <div class="card-word-main">
                  <h2 style="color:var(--accent);">${currentCard.tr}</h2>
                </div>
                ${currentCard.example ? `
                  <div class="card-example-box" style="border-left-color:var(--accent);">
                    <div style="font-size:0.85rem; color:var(--text-secondary);">Örnek Cümle:</div>
                    <div style="font-weight:600; color:var(--text-primary); margin-top:2px;">"${this.wrapSentence(currentCard.example)}"</div>
                  </div>
                ` : ''}
                <div class="card-click-hint">🔄 Ön yüze dönmek için dokunun</div>
              </div>
            </div>
          </div>

          <!-- Flashcard Action Controls -->
          <div class="flashcard-controls-bar">
            <button class="fc-btn fc-btn-wrong" onclick="schoolMode.answerFlashcard(false)">
              <span>❌</span>
              <span>Tekrar Et (Bilemedim)</span>
            </button>
            <button class="fc-btn fc-btn-speak" onclick="schoolMode.speakWord('${currentCard.en.replace(/'/g, "\\'")}', this)">
              <span>🔊</span>
              <span>Telaffuz</span>
            </button>
            <button class="fc-btn fc-btn-correct" onclick="schoolMode.answerFlashcard(true)">
              <span>✓</span>
              <span>Biliyorum (+1 XP)</span>
            </button>
          </div>
        ` : `
          <!-- Completion View -->
          <div class="school-card-panel flashcard-completion-card">
            <div style="font-size:4rem; animation: bounce 1s infinite alternate;">🎉</div>
            <h3>Tebrikler! Kart Destesini Tamamladınız!</h3>
            <p style="color:var(--text-secondary); margin-top:6px;">
              ${totalCards} kelimeden <strong>${state.correctCount}</strong> tanesini başarıyla bildiniz.
            </p>
            <div style="display:flex; justify-content:center; gap:12px; margin-top:20px;">
              <button class="btn-primary" onclick="schoolMode.restartFlashcards()">
                🔄 Tekrar Başlat
              </button>
              <button class="btn-secondary" onclick="schoolMode.switchSubTab('units')">
                📚 Ünitelere Dön
              </button>
            </div>
          </div>
        `}
      </div>
    `;
  }

  onFlashcardUnitChange(unitId) {
    this.flashcardsState.unitId = unitId;
    this.loadFlashcardsQueue();
    this.renderSubTabContent();
  }

  loadFlashcardsQueue() {
    let list = [];
    const unitId = this.flashcardsState.unitId;

    if (unitId === 'mywords') {
      list = [...this.getSchoolWords()];
    } else if (unitId === 'mywords_unmastered') {
      list = this.getSchoolWords().filter(w => !w.mastered);
    } else if (unitId === 'mywords_mastered') {
      list = this.getSchoolWords().filter(w => w.mastered);
    } else if (unitId && unitId !== 'all') {
      const u = this.curriculum.units.find(x => x.id === unitId);
      if (u && u.words) list = [...u.words];
    } else {
      // All units combined
      (this.curriculum.units || []).forEach(u => {
        if (u.words) list.push(...u.words);
      });
    }

    // Shuffle list
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    this.flashcardsState.queue = list;
    this.flashcardsState.currentIndex = 0;
    this.flashcardsState.isFlipped = false;
    this.flashcardsState.correctCount = 0;
  }

  flipCard() {
    this.flashcardsState.isFlipped = !this.flashcardsState.isFlipped;
    const cardInner = document.querySelector('.flashcard-card-inner');
    if (cardInner) {
      cardInner.classList.toggle('flipped', this.flashcardsState.isFlipped);
    }
  }

  answerFlashcard(isCorrect) {
    const state = this.flashcardsState;
    if (isCorrect) {
      state.correctCount++;
      if (window.app) window.app.addXP(1);
    } else {
      // Push back to queue for repeated learning
      const current = state.queue[state.currentIndex];
      if (current) state.queue.push(current);
    }

    state.currentIndex++;
    state.isFlipped = false;
    this.renderSubTabContent();
  }

  restartFlashcards() {
    this.loadFlashcardsQueue();
    this.renderSubTabContent();
  }

  /* ----------------------------------------------------
   * 3. OXFORD BOOKWORMS LIBRARY VIEW & READER
   * ---------------------------------------------------- */
  renderBookwormsLibraryView(container) {
    const books = this.curriculum.oxford_bookworms || [];

    container.innerHTML = `
      <div class="school-section-header">
        <div>
          <h3>📖 Oxford Bookworms Graded Readers (9. Sınıf Kütüphanesi)</h3>
          <p>Seviyelendirilmiş dünya klasikleri, interaktif metin okuma, sesli telaffuz ve bilinmeyen kelime analizi</p>
        </div>
      </div>

      <div class="bookworms-grid">
        ${books.map(book => {
          return `
            <div class="bookworm-card" onclick="schoolMode.switchSubTab('bookworms', '${book.id}')">
              <div class="bookworm-cover-badge" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
                <span class="book-icon">📚</span>
                <span class="book-level-badge">${book.level}</span>
                <h4 class="book-title">${book.title}</h4>
                <span class="book-author">${book.author}</span>
              </div>
              <div class="bookworm-info-body">
                <div class="book-genre-tag">${book.genre}</div>
                <div class="book-stat-row">
                  <span>📑 ${book.chapters ? book.chapters.length : 0} Bölüm</span>
                  <span>🔤 ${book.featured_vocab ? book.featured_vocab.length : 0} Anahtar Kelime</span>
                </div>
                <button class="school-btn-sm" style="width:100%; justify-content:center; margin-top:10px;">
                  Kitabı Oku →
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderBookwormReaderView(container) {
    const book = (this.curriculum.oxford_bookworms || []).find(b => b.id === this.activeBook);
    if (!book) {
      this.activeBook = null;
      this.renderBookwormsLibraryView(container);
      return;
    }

    const chapters = book.chapters || [];
    const activeChapter = chapters[this.activeChapterIdx] || chapters[0];
    const myWords = this.getSchoolWords();

    container.innerHTML = `
      <div class="bookworm-reader-container">
        <!-- Reader Navigation Header -->
        <div class="reader-nav-header">
          <button class="btn-secondary" onclick="schoolMode.switchSubTab('bookworms', null)">
            ← Kitaplığa Dön
          </button>
          
          <div class="reader-chapter-selector">
            <label style="font-size:0.8rem; font-weight:700; color:var(--text-secondary);">Bölüm:</label>
            <select class="select-input" onchange="schoolMode.onReaderChapterChange(parseInt(this.value, 10))">
              ${chapters.map((ch, idx) => `
                <option value="${idx}" ${idx === this.activeChapterIdx ? 'selected' : ''}>${ch.title}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Book Header Banner -->
        <div class="book-banner-card">
          <div>
            <span class="school-unit-tag" style="background:rgba(129,140,248,0.2); color:var(--accent);">${book.level} • ${book.genre}</span>
            <h2 style="font-size:1.4rem; margin-top:4px;">${book.title}</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary);">Yazar: <strong>${book.author}</strong></p>
          </div>
          <div class="reader-mode-hint">
            💡 Metindeki kelimelere dokunarak anında Türkçe karşılığını görün ve okul defterinize ekleyin!
          </div>
        </div>

        <!-- Chapter Content Body -->
        <div class="school-card-panel reader-story-paper">
          <h3 class="chapter-headline">${activeChapter ? activeChapter.title : 'Bölüm'}</h3>
          
          <div class="chapter-interactive-paragraphs">
            ${(activeChapter ? activeChapter.text : []).map(p => `
              <p class="reader-paragraph">${this.renderInteractiveText(p)}</p>
            `).join('')}
          </div>

          <!-- Chapter Navigation Buttons -->
          <div class="chapter-nav-buttons">
            <button class="btn-secondary" 
                    ${this.activeChapterIdx === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} 
                    onclick="schoolMode.onReaderChapterChange(${this.activeChapterIdx - 1})">
              ← Önceki Bölüm
            </button>
            <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:600;">
              ${this.activeChapterIdx + 1} / ${chapters.length}
            </span>
            <button class="btn-primary" 
                    ${this.activeChapterIdx >= chapters.length - 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} 
                    onclick="schoolMode.onReaderChapterChange(${this.activeChapterIdx + 1})">
              Sonraki Bölüm →
            </button>
          </div>
        </div>

        <!-- Featured Vocabulary for the Book -->
        ${book.featured_vocab ? `
          <div class="school-card-panel" style="margin-top:16px;">
            <div class="panel-header">
              <h3>⭐ Bu Kitabın Öne Çıkan Kelimeleri</h3>
            </div>
            <div class="school-vocab-grid">
              ${book.featured_vocab.map(w => {
                const inNotebook = myWords.some(mw => mw.en.toLowerCase() === w.en.toLowerCase());
                return `
                  <div class="school-word-card">
                    <div class="word-card-top">
                      <div class="word-card-main">
                        <span class="word-en">${w.en}</span>
                        <span class="word-pos">${w.pos || 'Kelime'}</span>
                      </div>
                      <div class="word-actions">
                        <button class="icon-audio-btn" onclick="speechUtils.speak('${w.en.replace(/'/g, "\\'")}')">🔊</button>
                        <button class="icon-add-btn ${inNotebook ? 'added' : ''}" 
                                onclick="schoolMode.toggleWordInNotebook('${w.en.replace(/'/g, "\\'")}', '${w.tr.replace(/'/g, "\\'")}', '${(w.pos || '').replace(/'/g, "\\'")}', '', this)"
                                title="${inNotebook ? 'Defterde Ekli' : 'Okul Defterine Ekle'}">
                          ${inNotebook ? '✓' : '+'}
                        </button>
                      </div>
                    </div>
                    <div class="word-tr">${w.tr}</div>

                    <!-- Açılır Cümle Kalıpları (+ / - / ?) -->
                    <div class="school-card-expand-bar" 
                         onclick="schoolMode.toggleCardSentences(this, '${w.en.replace(/'/g, "\\'")}', '${(w.tr || '').replace(/'/g, "\\'")}', '${(w.pos || 'Kelime').replace(/'/g, "\\'")}', '${(book.title || 'Oxford Graded Reader').replace(/'/g, "\\'")}')">
                      <span class="expand-label">📖 Örnek Cümleler (+ / - / ?)</span>
                      <span class="expand-icon">▾</span>
                    </div>
                    <div class="school-card-sentences-drawer" style="display:none;"></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  onReaderChapterChange(idx) {
    const book = (this.curriculum.oxford_bookworms || []).find(b => b.id === this.activeBook);
    if (!book || !book.chapters) return;
    if (idx >= 0 && idx < book.chapters.length) {
      this.activeChapterIdx = idx;
      this.renderSubTabContent();
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  }

  /* ----------------------------------------------------
   * 4. SMART BOOK & HOMEWORK SCANNER VIEW
   * ---------------------------------------------------- */
  renderScannerView(container) {
    const hasGemini = window.geminiAI && window.geminiAI.hasApiKey();

    container.innerHTML = `
      <div class="school-scanner-module">
        <div class="school-section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <h3>📷 Akıllı Kitap & Ödev Sayfa Tarayıcısı</h3>
            <p>Richmond Fly Higher ders kitabı veya ödev kağıdınızın fotoğrafını yükleyin ya da metnini yapıştırın. Sistem tüm kelimeleri ve gramer yapılarını saniyeler içinde analiz eder.</p>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button id="btn-gemini-status" class="btn-secondary sm" style="display:inline-flex; align-items:center; gap:6px; border:1px solid ${hasGemini ? '#38bdf8' : 'rgba(255,255,255,0.2)'}; background:${hasGemini ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)'}; font-weight:700;" onclick="window.geminiAI.openConfigModal(() => schoolMode.renderScannerView(document.getElementById('school-tab-content')))">
              <span>🤖</span>
              <span>${hasGemini ? 'Gemini AI: Aktif ✅' : 'Gemini AI: API Bağla 🔑'}</span>
            </button>
          </div>
        </div>

        <div class="scanner-input-grid">
          <!-- Left: Image Upload & Presets -->
          <div class="school-card-panel">
            <h4 style="margin-bottom:10px;">📸 1. Sayfa Fotoğrafı veya Metin</h4>
            
            <div class="scanner-drop-zone" onclick="document.getElementById('scanner-file-input').click()">
              <input type="file" id="scanner-file-input" accept="image/*" style="display:none;" onchange="schoolMode.handleScannerFileUpload(this)">
              <div style="font-size:2.5rem; margin-bottom:8px;">📤</div>
              <strong>Ders Kitabı / Ödev Sayfasının Fotoğrafını Seçin</strong>
              <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">PNG, JPG veya Kamera ile çekilmiş fotoğraflar</p>
            </div>

            <div style="margin:14px 0 6px; font-size:0.8rem; font-weight:700; color:var(--text-secondary);">
              VEYA Örnek 9. Sınıf Sayfası Deneyin:
            </div>
            
            <div class="scanner-presets-row">
              <button class="btn-secondary sm" onclick="schoolMode.loadScannerPreset('unit1')">
                📄 Unit 1: Hobbies & Passions
              </button>
              <button class="btn-secondary sm" onclick="schoolMode.loadScannerPreset('unit3')">
                📄 Unit 3: Tech & AI Dilemmas
              </button>
              <button class="btn-secondary sm" onclick="schoolMode.loadScannerPreset('workbook')">
                📄 Workbook: Grammar Exercise
              </button>
            </div>
          </div>

          <!-- Right: Textarea for Direct Input -->
          <div class="school-card-panel">
            <h4 style="margin-bottom:10px;">✍️ 2. Analiz Edilecek Metin</h4>
            <textarea id="scanner-text-input" class="scanner-textarea" placeholder="Kitap veya ödev metnini buraya yapıştırın veya sol taraftan fotoğraf yükleyin..."></textarea>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; gap:8px; flex-wrap:wrap;">
              <span style="font-size:0.75rem; color:var(--text-secondary);">⚡ 3.091+ kelimelik çevrimdışı sözlük & Gemini AI</span>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-secondary" onclick="schoolMode.runTextScan()" title="Yerel sözlük ve hızlı çeviri ile analiz et">
                  🔍 Standart Analiz (+15 XP)
                </button>
                <button class="btn-primary" style="background:linear-gradient(135deg, #6366f1, #38bdf8); font-weight:800;" onclick="schoolMode.runGeminiScan()" title="Gemini 1.5 Flash ile yazım hatalarını düzeltip derin analiz yap">
                  🤖 Gemini AI ile Akıllı Analiz (+20 XP)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Scan Results Area -->
        <div id="scanner-results-area" style="margin-top:20px;"></div>
      </div>
    `;
  }

  loadScannerPreset(presetKey) {
    const textarea = document.getElementById('scanner-text-input');
    if (!textarea) return;

    if (presetKey === 'unit1') {
      textarea.value = `Finding Your True Passion in High School.
Many ambitious teenagers admire young innovators who accomplish remarkable projects. Ela took up digital photography last year and developed a creative portfolio. She never gives up when facing technical difficulties. Her cheerful personality and confident mindset serve as a great inspiration to our class.`;
    } else if (presetKey === 'unit3') {
      textarea.value = `Artificial Intelligence and the Future of Education.
Artificial intelligence is transforming traditional learning methods at an incredible speed. Modern algorithms can analyze student performance and provide personalized feedback. However, cybersecurity and privacy concerns present significant dilemmas for digital society. Students must acquire essential digital skills without sacrificing critical thinking.`;
    } else if (presetKey === 'workbook') {
      textarea.value = `Fly Higher 2.0 Workbook Practice Page 38.
Exercise 1: While I was studying in the quiet library, my best friend called me.
Exercise 2: If we protect the oceans and plant more trees, global warming will decrease.
Exercise 3: The famous painting was stolen from the gallery last night.
Exercise 4: She has already completed her science experiment.`;
    }

    this.runTextScan();
  }

  async handleScannerFileUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const textarea = document.getElementById('scanner-text-input');
    const resultsArea = document.getElementById('scanner-results-area');
    
    // Create image preview in dropzone
    const dropZone = document.querySelector('.scanner-drop-zone');
    if (dropZone) {
      dropZone.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
          <div style="font-size:2rem;">📸</div>
          <strong style="color:var(--text-primary); font-size:0.88rem;">${file.name}</strong>
          <div id="ocr-progress-box" style="font-size:0.78rem; color:var(--primary); font-weight:700;">
            🔄 Metin Çıkarılıyor: %0
          </div>
          <div class="quiz-progress-bar" style="width:180px; height:6px;">
            <div id="ocr-progress-bar" class="quiz-progress-fill" style="width: 5%;"></div>
          </div>
        </div>
      `;
    }

    if (resultsArea) {
      resultsArea.innerHTML = `
        <div style="text-align:center; padding:30px;">
          <div class="spinner" style="margin:0 auto 12px;"></div>
          <h4>Fotoğraf Taranıyor... Tesseract OCR yazıları okuyor.</h4>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">Bu işlem fotoğrafın çözünürlüğüne bağlı olarak 3-6 saniye sürebilir.</p>
        </div>
      `;
    }

    try {
      if (window.bookScanner && typeof window.bookScanner.recognizeImageWithOCR === 'function') {
        const extractedText = await window.bookScanner.recognizeImageWithOCR(file, (m) => {
          const progressBox = document.getElementById('ocr-progress-box');
          const progressBar = document.getElementById('ocr-progress-bar');
          if (m && m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            if (progressBox) progressBox.textContent = `🔄 Metin Çıkarılıyor: %${pct}`;
            if (progressBar) progressBar.style.width = `${pct}%`;
          }
        });

        if (textarea) textarea.value = extractedText;

        // Auto run scan on extracted text
        if (window.geminiAI && window.geminiAI.hasApiKey()) {
          this.runGeminiScan();
        } else {
          this.runTextScan();
        }
      }
    } catch (err) {
      console.error(err);
      if (resultsArea) {
        resultsArea.innerHTML = `
          <div class="school-card-panel" style="border-color:#ef4444; color:#fca5a5;">
            <strong>OCR Tarama Hatası:</strong> ${err.message}<br>
            <span style="font-size:0.8rem; color:var(--text-secondary);">Fotoğraf çok bulanık olabilir veya metin doğrudan metin kutusuna yapıştırılabilir.</span>
          </div>
        `;
      }
    } finally {
      if (dropZone) {
        dropZone.innerHTML = `
          <input type="file" id="scanner-file-input" accept="image/*" style="display:none;" onchange="schoolMode.handleScannerFileUpload(this)">
          <div style="font-size:2.5rem; margin-bottom:8px;">📤</div>
          <strong>Başka Bir Sayfa Fotoğrafı Seçin</strong>
          <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">PNG, JPG veya Kamera</p>
        `;
      }
    }
  }

  async runGeminiScan() {
    const textarea = document.getElementById('scanner-text-input');
    const resultsArea = document.getElementById('scanner-results-area');
    if (!textarea || !resultsArea) return;

    const rawText = textarea.value.trim();
    if (!rawText || rawText.length < 5) {
      if (window.app) window.app.showToast('Lütfen taranacak bir metin girin veya fotoğraf yükleyin.');
      return;
    }

    if (!window.geminiAI || !window.geminiAI.hasApiKey()) {
      window.geminiAI.openConfigModal(() => this.runGeminiScan());
      return;
    }

    resultsArea.innerHTML = `
      <div style="text-align:center; padding:35px; background:rgba(30,27,75,0.4); border-radius:var(--radius-lg); border:1px solid #818cf8;">
        <div class="spinner" style="margin:0 auto 12px; border-top-color:#818cf8;"></div>
        <h4 style="color:#ffffff; font-weight:800;">🤖 Google Gemini AI Sayfayı Analiz Ediyor...</h4>
        <p style="font-size:0.82rem; color:#94a3b8; margin-top:4px;">
          OCR yazım hataları düzeltiliyor, tüm kelimelerin doğal anlamları ve gramer yapıları çıkarılıyor.
        </p>
      </div>
    `;

    try {
      const scanResult = await window.bookScanner.scanTextWithGemini(rawText, 'Gemini AI Sayfa Analizi');
      this.renderScanResult(resultsArea, scanResult);
      if (window.app) {
        window.app.addXP(20);
        window.app.showToast('✨ Gemini AI Analizi Tamamlandı! (+20 XP)');
      }
    } catch (err) {
      console.error(err);
      resultsArea.innerHTML = `
        <div class="school-card-panel" style="border-color:#ef4444; color:#fca5a5;">
          <strong>Gemini AI Hatası:</strong> ${err.message}<br>
          <button class="btn-secondary sm" style="margin-top:10px;" onclick="schoolMode.runTextScan()">
            Standart Yerel Analiz ile Devam Et
          </button>
        </div>
      `;
    }
  }

  runTextScan() {
    const textarea = document.getElementById('scanner-text-input');
    const resultsArea = document.getElementById('scanner-results-area');
    if (!textarea || !resultsArea) return;

    const rawText = textarea.value.trim();
    if (!rawText || rawText.length < 5) {
      if (window.app) window.app.showToast('Lütfen taranacak bir metin girin veya fotoğraf yükleyin.');
      return;
    }

    if (!window.bookScanner) {
      resultsArea.innerHTML = `<div class="school-card-panel">Tarayıcı motoru hazır değil.</div>`;
      return;
    }

    resultsArea.innerHTML = `
      <div style="text-align:center; padding:30px;">
        <div class="spinner" style="margin:0 auto 12px;"></div>
        <h4>Sayfa Analiz Ediliyor... Kelimeler ve gramer yapıları ayrıştırılıyor.</h4>
      </div>
    `;

    setTimeout(() => {
      const scanResult = window.bookScanner.scanText(rawText, 'Sayfa Taraması');
      this.renderScanResult(resultsArea, scanResult);
      if (window.app) {
        window.app.addXP(15);
        window.app.showToast('🎉 Sayfa Analizi Tamamlandı! (+15 XP)');
      }
    }, 400);
  }

  renderScanResult(container, res) {
    const myWords = this.getSchoolWords();

    container.innerHTML = `
      <div class="school-card-panel scanner-results-panel">
        <div class="panel-header" style="border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h3 style="margin:0;">✨ Sayfa Analiz Raporu</h3>
              ${res.isGemini ? `
                <span style="background:rgba(129,140,248,0.25); color:#818cf8; border:1px solid #818cf8; font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:var(--radius-full);">
                  🤖 Gemini AI Analizi (${res.cefrLevel || 'A2/B1'})
                </span>
              ` : ''}
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
              Toplam <strong>${res.tokenCount}</strong> kelime tarandı, <strong>${res.uniqueWordCount}</strong> hedef kelime ve <strong>${res.grammarMatches.length}</strong> gramer yapısı tespit edildi.
            </p>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-primary sm" onclick="schoolMode.addAllScannedWordsToNotebook()">
              📥 Tüm Kelimeleri Okul Defterine Kaydet (+5 XP)
            </button>
          </div>
        </div>

        ${res.summaryTr ? `
          <div class="controls-card" style="background:linear-gradient(135deg, rgba(30,27,75,0.7), rgba(15,23,42,0.9)); border:1px solid #818cf8; margin-bottom:16px; padding:12px 14px;">
            <div style="font-size:0.8rem; font-weight:800; color:#818cf8; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
              <span>🤖</span> <span>Gemini AI Sayfa Özeti & Anlamı:</span>
            </div>
            <p style="font-size:0.88rem; color:#e2e8f0; line-height:1.5; margin:0;">
              ${res.summaryTr}
            </p>
          </div>
        ` : ''}

        <!-- Detected Grammar Structures -->
        ${res.grammarMatches.length > 0 ? `
          <div class="scanner-grammar-section">
            <h4 style="color:var(--primary); font-size:0.95rem; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <span>⚡</span> Tespit Edilen 9. Sınıf Gramer Yapıları (${res.grammarMatches.length}):
            </h4>
            <div class="scanner-grammar-grid">
              ${res.grammarMatches.map(gm => `
                <div class="grammar-match-card">
                  <div class="gm-top-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <div class="gm-badge">📐 ${gm.structure}</div>
                    <span class="school-unit-tag" style="background:rgba(56,189,248,0.15); color:#38bdf8; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:var(--radius-full);">
                      ${gm.unit_code || '9. Sınıf'}
                    </span>
                  </div>
                  <div class="gm-rule" style="font-size:0.8rem; color:#cbd5e1; margin-bottom:8px;">${gm.rule}</div>
                  <div class="gm-sentence" style="background:rgba(0,0,0,0.25); padding:8px 10px; border-radius:var(--radius-md); font-size:0.8rem; color:#93c5fd; font-style:italic; margin-bottom:12px; border-left:3px solid #38bdf8;">
                    💬 "${gm.sentence}"
                  </div>

                  <!-- Quick Action Buttons for Grammar Video & Details -->
                  <div class="scanner-gm-actions">
                    <button class="btn-gm-video" onclick="schoolMode.openUnitGrammarVideo('${gm.unit_id || 'fh_unit_1'}', ${gm.subtopic_index || 0})" title="Bu konunun YouTube video dersini izle">
                      <span>🎬</span>
                      <span>Dersi İzle (+10 XP)</span>
                    </button>
                    <button class="btn-gm-detail" onclick="schoolMode.openGrammarDetailModal('${gm.unit_id || 'fh_unit_1'}')" title="Formülleri, püf noktalarını ve örnekleri incele">
                      <span>📖</span>
                      <span>Konu Anlatımı</span>
                    </button>
                    <button class="btn-gm-unit" onclick="schoolMode.openUnit('${gm.unit_id || 'fh_unit_1'}')" title="Bu konunun yer aldığı 9. sınıf ünitesine git">
                      <span>🏛️</span>
                      <span>Üniteye Git</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Extracted Vocabulary Items -->
        <div class="scanner-vocab-section" style="margin-top:20px;">
          <h4 style="font-size:0.95rem; margin-bottom:10px;">🔤 Metinden Çıkarılan Hedef Kelimeler (${res.extractedWords.length}):</h4>
          
          <div class="school-vocab-grid">
            ${res.extractedWords.map((w, idx) => {
              const inNotebook = myWords.some(mw => mw.en.toLowerCase() === w.en.toLowerCase());
              return `
                <div class="school-word-card">
                  <div class="word-card-top">
                    <div class="word-card-main" onclick="schoolMode.speakWord('${w.en.replace(/'/g, "\\'")}')" style="cursor:pointer;">
                      <span class="word-en">${w.en}</span>
                      <span class="word-pos">${w.pos || 'Kelime'}</span>
                    </div>
                    <div class="word-actions">
                      <button class="icon-audio-btn" onclick="schoolMode.speakWord('${w.en.replace(/'/g, "\\'")}', this)">🔊</button>
                      <button class="icon-add-btn ${inNotebook ? 'added' : ''}" 
                              onclick="schoolMode.toggleWordInNotebook('${w.en.replace(/'/g, "\\'")}', '${w.tr.replace(/'/g, "\\'")}', '${(w.pos || '').replace(/'/g, "\\'")}', '', this)"
                              title="${inNotebook ? 'Defterde Ekli' : 'Okul Defterine Ekle'}">
                        ${inNotebook ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                  <div class="word-tr">${w.tr}</div>
                  <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
                    Metinde geçiş: <strong>${w.count} kez</strong>
                  </div>

                  <!-- Açılır Cümle Kalıpları (+ / - / ?) -->
                  <div class="school-card-expand-bar" 
                       onclick="schoolMode.toggleCardSentences(this, '${w.en.replace(/'/g, "\\'")}', '${(w.tr || '').replace(/'/g, "\\'")}', '${(w.pos || 'Kelime').replace(/'/g, "\\'")}', '${((res.detectedGrammar && res.detectedGrammar.length > 0) ? res.detectedGrammar.map(g => g.structure || '').join(', ') : 'Kitap Analizi').replace(/'/g, "\\'")}')">
                    <span class="expand-label">📖 Örnek Cümleler (+ / - / ?)</span>
                    <span class="expand-icon">▾</span>
                  </div>
                  <div class="school-card-sentences-drawer" style="display:none;"></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    this.lastScanResult = res;
  }

  addAllScannedWordsToNotebook() {
    if (!this.lastScanResult || !this.lastScanResult.extractedWords) return;
    let addedCount = 0;
    this.lastScanResult.extractedWords.forEach(w => {
      const added = this.addWordToSchoolNotebook(w.en, w.tr, w.pos);
      if (added) addedCount++;
    });

    if (window.app) {
      window.app.addXP(5);
      window.app.showToast(`✨ ${addedCount} kelime okul defterine kaydedildi! (+5 XP)`);
    }

    // Update all add buttons in scanner results in-place without re-rendering or losing scroll
    const scannerGrid = document.querySelector('.scanner-results-container .school-vocab-grid');
    if (scannerGrid) {
      scannerGrid.querySelectorAll('.icon-add-btn').forEach(btn => {
        btn.classList.add('added');
        btn.innerHTML = '✓';
        btn.title = 'Defterde Ekli';
      });
    }
  }

  /* ----------------------------------------------------
   * 5. 9TH GRADE WRITTEN EXAM SIMULATOR
   * ---------------------------------------------------- */
  renderExamsView(container) {
    const exams = this.curriculum.school_exams || [];

    if (this.examState.activeExam) {
      this.renderActiveExamInterface(container);
      return;
    }

    container.innerHTML = `
      <div class="school-exams-module">
        <div class="school-section-header">
          <div>
            <h3>📝 9. Sınıf İngilizce Yazılı Sınav Simülatörü</h3>
            <p>MEB ve Kolej 1. ve 2. Dönem müfredatına uygun çoktan seçmeli, boşluk doldurma ve cümle analizi soruları</p>
          </div>
        </div>

        <div class="school-exams-grid">
          ${exams.map(ex => `
            <div class="exam-card">
              <div class="exam-card-header">
                <span class="school-unit-tag" style="background:rgba(129,140,248,0.2); color:var(--accent);">${ex.term}</span>
                <span class="exam-duration">⏱️ ${ex.duration_minutes} Dakika</span>
              </div>
              <h4 class="exam-title">${ex.title}</h4>
              <p class="exam-coverage">📌 <strong>Kapsam:</strong> ${ex.coverage}</p>
              
              <div class="exam-card-footer">
                <span class="exam-q-count">❓ ${ex.questions ? ex.questions.length : 0} Soru (100 Puan)</span>
                <button class="btn-primary sm" onclick="schoolMode.startExam('${ex.id}')">
                  Sınava Başla 🚀
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  startExam(examId) {
    const ex = (this.curriculum.school_exams || []).find(e => e.id === examId);
    if (!ex) return;

    this.examState.activeExam = ex;
    this.examState.userAnswers = {};
    this.examState.result = null;
    this.renderSubTabContent();
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }

  renderActiveExamInterface(container) {
    const ex = this.examState.activeExam;
    const questions = ex.questions || [];
    const userAnswers = this.examState.userAnswers;
    const result = this.examState.result;

    container.innerHTML = `
      <div class="active-exam-container">
        <!-- Exam Header -->
        <div class="school-card-panel exam-status-banner">
          <div>
            <span class="school-unit-tag" style="background:rgba(129,140,248,0.2); color:var(--accent);">${ex.term}</span>
            <h2 style="font-size:1.3rem; margin-top:4px;">${ex.title}</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary);">${ex.coverage}</p>
          </div>
          <button class="btn-secondary sm" onclick="schoolMode.exitExam()">
            ✕ Sınavdan Çık
          </button>
        </div>

        ${result ? `
          <!-- Result Score Card -->
          <div class="school-card-panel exam-score-result-card">
            <div style="font-size:3.5rem;">${result.score >= 70 ? '🏆' : '📚'}</div>
            <h2>Sınav Sonucu: ${result.score} / 100 Puan</h2>
            <p style="color:var(--text-secondary); font-size:0.95rem;">
              Doğru: <strong>${result.correctCount}</strong> | Yanlış: <strong>${result.wrongCount}</strong> | Boş: <strong>${result.emptyCount}</strong>
            </p>
            <div style="display:flex; justify-content:center; gap:10px; margin-top:14px;">
              <button class="btn-primary" onclick="schoolMode.startExam('${ex.id}')">
                🔄 Sınavı Tekrar Çöz
              </button>
              <button class="btn-secondary" onclick="schoolMode.exitExam()">
                📝 Sınav Listesine Dön
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Questions List -->
        <div class="exam-questions-list">
          ${questions.map((q, idx) => {
            const userAnswer = userAnswers[q.id];
            const isSubmitted = !!result;
            const isCorrect = isSubmitted && userAnswer === q.correct_answer;

            return `
              <div class="school-card-panel exam-question-card ${isSubmitted ? (isCorrect ? 'q-correct' : 'q-wrong') : ''}">
                <div class="question-header">
                  <span class="q-num">Soru ${idx + 1} (${q.points} Puan)</span>
                  <span class="q-type-badge">${q.type === 'multiple_choice' ? 'Çoktan Seçmeli' : 'Boşluk Doldurma'}</span>
                </div>

                <div class="question-text">
                  ${this.wrapSentence(q.question)}
                </div>

                <!-- Choices -->
                <div class="question-options-list">
                  ${(q.options || []).map(opt => {
                    const optKey = opt.charAt(0);
                    const isSelected = userAnswer === optKey;
                    const isRightOption = isSubmitted && q.correct_answer === optKey;

                    let optClass = '';
                    if (isSelected) optClass += ' selected';
                    if (isSubmitted) {
                      if (isRightOption) optClass += ' right-answer';
                      else if (isSelected && !isCorrect) optClass += ' wrong-answer';
                    }

                    return `
                      <button class="exam-option-btn ${optClass}" 
                              ${isSubmitted ? 'disabled' : ''}
                              onclick="schoolMode.selectExamAnswer('${q.id}', '${optKey}')">
                        <span class="opt-key">${optKey}</span>
                        <span class="opt-label">${this.wrapSentence(opt.substring(3))}</span>
                      </button>
                    `;
                  }).join('')}
                </div>

                ${isSubmitted ? `
                  <div class="question-feedback-box ${isCorrect ? 'fb-correct' : 'fb-wrong'}">
                    <strong>${isCorrect ? '✅ Doğru!' : `❌ Yanlış! Doğru Cevap: ${q.correct_answer}`}</strong>
                    <p style="font-size:0.85rem; margin-top:4px;">${this.wrapSentence(q.explanation || '')}</p>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        ${!result ? `
          <!-- Submit Button -->
          <div style="display:flex; justify-content:flex-end; margin-top:20px; margin-bottom:40px;">
            <button class="btn-primary large" onclick="schoolMode.submitExam()">
              🏁 Sınavı Bitir ve Puanla (+25 XP)
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  selectExamAnswer(qId, answerKey) {
    if (this.examState.result) return;
    this.examState.userAnswers[qId] = answerKey;
    this.renderSubTabContent();
  }

  submitExam() {
    const ex = this.examState.activeExam;
    if (!ex) return;

    const questions = ex.questions || [];
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    questions.forEach(q => {
      const userAns = this.examState.userAnswers[q.id];
      if (!userAns) {
        emptyCount++;
      } else if (userAns === q.correct_answer) {
        correctCount++;
        score += q.points || 10;
      } else {
        wrongCount++;
      }
    });

    this.examState.result = {
      score,
      correctCount,
      wrongCount,
      emptyCount
    };

    if (window.app) {
      window.app.addXP(25);
      window.app.showToast(`🎉 Sınav Tamamlandı! Notunuz: ${score}/100 (+25 XP)`);
    }

    this.renderSubTabContent();
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }

  exitExam() {
    this.examState.activeExam = null;
    this.examState.userAnswers = {};
    this.examState.result = null;
    this.renderSubTabContent();
  }

  /* ----------------------------------------------------
   * 6. MY SCHOOL WORDS NOTEBOOK VIEW
   * ---------------------------------------------------- */
  renderMyWordsView(container) {
    const allWords = this.getSchoolWords();
    const masteredCount = allWords.filter(w => w.mastered).length;
    const unmasteredCount = allWords.length - masteredCount;
    const percent = allWords.length > 0 ? Math.round((masteredCount / allWords.length) * 100) : 0;

    let displayedWords = allWords;
    if (this.myWordsFilter === 'unmastered') {
      displayedWords = allWords.filter(w => !w.mastered);
    } else if (this.myWordsFilter === 'mastered') {
      displayedWords = allWords.filter(w => w.mastered);
    }

    const flashcardTarget = this.myWordsFilter === 'unmastered' ? 'mywords_unmastered' : (this.myWordsFilter === 'mastered' ? 'mywords_mastered' : 'mywords');

    container.innerHTML = `
      <div class="school-notebook-module">
        <div class="school-section-header">
          <div>
            <h3>📓 9. Sınıf Okul Kelime Defterim (${allWords.length} Kelime)</h3>
            <p>Ders kitaplarından, Oxford hikayelerinden ve tarayıcıdan kaydettiğiniz tüm kelimeler</p>
          </div>
          <div style="display:flex; gap:8px;">
            ${allWords.length > 0 ? `
              <button class="btn-primary sm" onclick="schoolMode.switchSubTab('flashcards', '${flashcardTarget}')">
                ⚡ ${this.myWordsFilter === 'unmastered' ? 'Çalışılacaklarla' : (this.myWordsFilter === 'mastered' ? 'Öğrenilenlerle' : 'Bu Kelimelerle')} Kart Çalış
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Progress Track & Filter Chips -->
        ${allWords.length > 0 ? `
          <div class="school-card-panel" style="margin-bottom:16px; padding:14px 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
              <div style="display:flex; gap:8px; overflow-x:auto; scrollbar-width:none;">
                <button class="cat-chip ${this.myWordsFilter === 'all' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 12px; font-weight:700;" onclick="schoolMode.setMyWordsFilter('all')">
                  📂 Tümü (${allWords.length})
                </button>
                <button class="cat-chip ${this.myWordsFilter === 'unmastered' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 12px; font-weight:700;" onclick="schoolMode.setMyWordsFilter('unmastered')">
                  🎯 Çalışılacaklar (${unmasteredCount})
                </button>
                <button class="cat-chip ${this.myWordsFilter === 'mastered' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 12px; font-weight:700;" onclick="schoolMode.setMyWordsFilter('mastered')">
                  ✅ Öğrenilenler (${masteredCount})
                </button>
              </div>

              <div style="font-size:0.82rem; font-weight:800; color:var(--text-secondary);">
                🏆 Öğrenme Oranı: <strong style="color:#22c55e;">%${percent}</strong> (${masteredCount} / ${allWords.length})
              </div>
            </div>

            <!-- Progress Track -->
            <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden;">
              <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #38bdf8, #22c55e); border-radius:10px; transition:width 0.4s ease;"></div>
            </div>
          </div>
        ` : ''}

        ${allWords.length === 0 ? `
          <div class="school-card-panel" style="text-align:center; padding:50px 20px;">
            <div style="font-size:3.5rem; margin-bottom:12px;">📖</div>
            <h4>Okul defteriniz henüz boş.</h4>
            <p style="color:var(--text-secondary); margin-top:6px;">
              Fly Higher ünitelerindeki kelimelerin yanındaki <strong>"+"</strong> butonuna basarak veya Kitap Tarayıcısından analiz edilen kelimeleri buraya ekleyebilirsiniz.
            </p>
          </div>
        ` : displayedWords.length === 0 ? `
          <div class="school-card-panel" style="text-align:center; padding:40px 20px;">
            <div style="font-size:3rem; margin-bottom:10px;">${this.myWordsFilter === 'mastered' ? '🎯' : '🎉'}</div>
            <h4>${this.myWordsFilter === 'mastered' ? 'Henüz "Öğrendim" olarak işaretlediğiniz kelime yok.' : 'Tebrikler! Defterinizdeki tüm kelimeleri öğrendiniz.'}</h4>
            <p style="color:var(--text-secondary); margin-top:6px;">
              ${this.myWordsFilter === 'mastered' ? 'Kelimeleri öğrendikçe kartın altındaki "⚪ Öğrendim Olarak İşaretle" butonuna basabilirsiniz.' : 'Öğrenilen kelimeleri tekrar etmek için "✅ Öğrenilenler" filtresine tıklayabilirsiniz.'}
            </p>
          </div>
        ` : `
          <div class="school-vocab-grid">
            ${displayedWords.map(w => `
              <div class="school-word-card ${w.mastered ? 'mastered-card' : ''}">
                <div class="word-card-top">
                  <div class="word-card-main" onclick="schoolMode.speakWord('${w.en.replace(/'/g, "\\'")}')" style="cursor:pointer;">
                    <span class="word-en">${w.en}</span>
                    <span class="word-pos">${w.pos || 'Kelime'}</span>
                    ${w.mastered ? '<span style="font-size:0.68rem; font-weight:800; color:#22c55e; background:rgba(34,197,94,0.15); padding:2px 6px; border-radius:4px; margin-left:4px;">✅ Öğrenildi</span>' : ''}
                  </div>
                  <div class="word-actions">
                    <button class="icon-audio-btn" onclick="schoolMode.speakWord('${w.en.replace(/'/g, "\\'")}', this)">🔊</button>
                    <button class="icon-add-btn added" onclick="schoolMode.deleteFromNotebook('${w.id}')" title="Defterden Sil">✕</button>
                  </div>
                </div>
                <div class="word-tr">${w.tr}</div>
                ${w.example ? `
                  <div class="word-example">💬 "${this.wrapSentence(w.example)}"</div>
                ` : ''}

                <!-- Açılır Cümle Kalıpları (+ / - / ?) -->
                <div class="school-card-expand-bar" 
                     onclick="schoolMode.toggleCardSentences(this, '${w.en.replace(/'/g, "\\'")}', '${(w.tr || '').replace(/'/g, "\\'")}', '${(w.pos || 'Kelime').replace(/'/g, "\\'")}', '9. Sınıf Okul Defterim')">
                  <span class="expand-label">📖 Örnek Cümleler (+ / - / ?)</span>
                  <span class="expand-icon">▾</span>
                </div>
                <div class="school-card-sentences-drawer" style="display:none;"></div>

                <!-- Mastered Status Toggle Footer -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06);">
                  <button class="btn-mastered ${w.mastered ? 'mastered' : ''}" onclick="schoolMode.toggleWordMastered('${w.id}')">
                    ${w.mastered ? '✅ Öğrendim (+3 XP)' : '⚪ Öğrendim Olarak İşaretle'}
                  </button>
                  <span style="font-size:0.7rem; color:var(--text-muted);">
                    ${w.dateAdded ? new Date(w.dateAdded).toLocaleDateString('tr-TR') : ''}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  setMyWordsFilter(filter) {
    this.myWordsFilter = filter;
    this.renderSubTabContent();
  }

  toggleWordMastered(id) {
    const words = this.getSchoolWords();
    const word = words.find(w => w.id === id);
    if (!word) return;

    word.mastered = !word.mastered;
    this.saveSchoolWords(words);

    if (word.mastered) {
      if (window.app) window.app.addXP(3);
      if (window.app) window.app.showToast(`🎉 "${word.en}" öğrenildi olarak kaydedildi! (+3 XP)`);
    } else {
      if (window.app) window.app.showToast(`🎯 "${word.en}" tekrar çalışılacaklar listesine alındı.`);
    }

    this.renderSubTabContent();
  }

  deleteFromNotebook(id) {
    let words = this.getSchoolWords();
    words = words.filter(w => w.id !== id);
    this.saveSchoolWords(words);
    if (window.app) window.app.showToast('🗑️ Kelime defterden silindi.');
    this.renderSubTabContent();
  }

  /* ----------------------------------------------------
   * 6. GRAMMAR-ALIGNED SENTENCE ENGINE (+ / - / ?)
   * ---------------------------------------------------- */
  getCuratedSentenceDatabase() {
    return {
      "and": {
        positive: { en: "Students practice English grammar and vocabulary every day.", tr: "Öğrenciler her gün İngilizce dilbilgisi ve kelime pratiği yapar." },
        negative: { en: "She didn't finish her reading passage and homework yesterday.", tr: "Dün okuma parçasını ve ödevini bitirmedi." },
        question: { en: "Do you like reading books and listening to English podcasts?", tr: "Kitap okumayı ve İngilizce podcast dinlemeyi sever misin?" }
      },
      "grammar": {
        positive: { en: "Our English teacher explains difficult grammar rules with clear examples.", tr: "İngilizce öğretmenimiz zor dilbilgisi kurallarını net örneklerle açıklar." },
        negative: { en: "You don't need to memorize all grammar formulas without practice.", tr: "Pratik yapmadan tüm gramer formüllerini ezberlemenize gerek yoktur." },
        question: { en: "Can you identify the grammar mistakes in this paragraph?", tr: "Bu paragraftaki dilbilgisi hatalarını tespit edebilir misin?" }
      },
      "to": {
        positive: { en: "He wants to improve his English speaking skills this semester.", tr: "Bu dönem İngilizce konuşma becerilerini geliştirmek istiyor." },
        negative: { en: "They decided not to cancel the high school football tournament.", tr: "Lise futbol turnuvasını iptal etmemeye karar verdiler." },
        question: { en: "Where do you plan to go after the afternoon classes?", tr: "Öğleden sonraki derslerden sonra nereye gitmeyi planlıyorsun?" }
      },
      "in": {
        positive: { en: "Students participate in various science club activities at school.", tr: "Öğrenciler okulda çeşitli bilim kulübü etkinliklerine katılırlar." },
        negative: { en: "He doesn't stay in the classroom during the lunch break.", tr: "Öğle molasında sınıfta kalmaz." },
        question: { en: "How many students are there in your English study group?", tr: "İngilizce çalışma grubunuzda kaç öğrenci var?" }
      },
      "intermediate": {
        positive: { en: "This textbook contains rich intermediate level reading passages.", tr: "Bu ders kitabı zengin orta seviye okuma parçaları içerir." },
        negative: { en: "The new exam is not too intermediate for motivated learners.", tr: "Yeni sınav istekli öğrenciler için fazla orta seviye/zor değildir." },
        question: { en: "Have you reached the intermediate level in English writing?", tr: "İngilizce yazmada orta seviyeye ulaştın mı?" }
      },
      "pre": {
        positive: { en: "Pre-reading tasks help students understand the story easily.", tr: "Okuma öncesi görevler öğrencilerin hikayeyi kolayca anlamasına yardımcı olur." },
        negative: { en: "We don't skip the pre-exam review sessions before finals.", tr: "Finallerden önceki sınav öncesi tekrar seanslarını atlamayız." },
        question: { en: "Did you complete the pre-test before starting the new unit?", tr: "Yeni üniteye başlamadan önce ön testi tamamladın mı?" }
      },
      "the": {
        positive: { en: "The school library provides modern resources for all students.", tr: "Okul kütüphanesi tüm öğrenciler için modern kaynaklar sağlar." },
        negative: { en: "The coach didn't allow players to miss the morning session.", tr: "Antrenör oyuncuların sabah seansını kaçırmasına izin vermedi." },
        question: { en: "Did you find the answer to the difficult exam question?", tr: "Zor sınav sorusunun cevabını buldun mu?" }
      },
      "english": {
        positive: { en: "We practice English conversation with international friends online.", tr: "İnternette uluslararası arkadaşlarla İngilizce sohbet pratiği yaparız." },
        negative: { en: "He doesn't feel nervous when speaking English in class.", tr: "Sınıfta İngilizce konuşurken gergin hissetmez." },
        question: { en: "Why is learning English essential for modern science and careers?", tr: "İngilizce öğrenmek modern bilim ve kariyerler için neden gereklidir?" }
      },
      "for": {
        positive: { en: "She prepared a comprehensive study schedule for the upcoming exam.", tr: "Gelecek sınav için kapsamlı bir çalışma takvimi hazırladı." },
        negative: { en: "This beginner exercise is not designed for advanced students.", tr: "Bu başlangıç alıştırması ileri düzey öğrenciler için tasarlanmamıştır." },
        question: { en: "How long have you been preparing for the English competition?", tr: "İngilizce yarışması için ne kadar süredir hazırlanıyorsun?" }
      },
      "connect": {
        positive: { en: "Social media helps students connect with friends around the world.", tr: "Sosyal medya öğrencilerin dünyadaki arkadaşlarla iletişim kurmasına yardımcı olur." },
        negative: { en: "He doesn't connect to unknown networks without a secure password.", tr: "Güvenli bir şifre olmadan bilinmeyen ağlara bağlanmaz." },
        question: { en: "How do you connect these two grammar ideas in your essay?", tr: "Denemenizde bu iki gramer fikrini nasıl bağlıyorsunuz?" }
      },
      "routine": {
        positive: { en: "Her morning routine includes a healthy breakfast and light exercise.", tr: "Sabah rutini sağlıklı bir kahvaltı ve hafif egzersiz içerir." },
        negative: { en: "He doesn't break his study routine even at weekends.", tr: "Hafta sonları bile çalışma rutinini bozmaz." },
        question: { en: "What is the most effective daily routine for high school success?", tr: "Lise başarısı için en etkili günlük rutin nedir?" }
      },
      "leisure": {
        positive: { en: "In my leisure time, I enjoy reading historical novels and coding.", tr: "Boş zamanlarımda tarihi romanlar okumaktan ve kod yazmaktan keyif alırım." },
        negative: { en: "Busy athletes don't have much leisure time during the season.", tr: "Meşgul sporcuların sezon boyunca çok fazla boş vakti olmaz." },
        question: { en: "How do you spend your leisure hours after school?", tr: "Okuldan sonraki boş saatlerini nasıl geçirirsin?" }
      },
      "enthusiastic": {
        positive: { en: "She is very enthusiastic about learning new foreign languages.", tr: "Yeni yabancı diller öğrenme konusunda çok heveslidir." },
        negative: { en: "He wasn't very enthusiastic about waking up early on Sunday.", tr: "Pazar günü erken uyanma konusunda pek hevesli değildi." },
        question: { en: "Why is the science club so enthusiastic about the robotics fair?", tr: "Bilim kulübü robotik fuarı hakkında neden bu kadar hevesli?" }
      },
      "discovery": {
        positive: { en: "The recent archaeological discovery attracted worldwide attention.", tr: "Son arkeolojik keşif dünya çapında dikkat çekti." },
        negative: { en: "The scientists didn't announce the discovery without verification.", tr: "Bilim insanları doğrulama yapmadan keşfi duyurmadı." },
        question: { en: "What was the most important scientific discovery of the century?", tr: "Yüzyılın en önemli bilimsel keşfi neydi?" }
      },
      "mysterious": {
        positive: { en: "The detective found a mysterious letter inside the old book.", tr: "Dedektif eski kitabın içinde gizemli bir mektup buldu." },
        negative: { en: "There was nothing mysterious about the sudden power outage.", tr: "Ani elektrik kesintisinde gizemli hiçbir şey yoktu." },
        question: { en: "Who left this mysterious package at the school gate?", tr: "Bu gizemli paketi okul kapısına kim bıraktı?" }
      },
      "archaeological": {
        positive: { en: "The team conducted archaeological research in the ancient valley.", tr: "Ekip antik vadide arkeolojik araştırmalar yürüttü." },
        negative: { en: "They didn't damage any archaeological artifacts during excavation.", tr: "Kazı sırasında hiçbir arkeolojik esere zarar vermediler." },
        question: { en: "Have you ever visited an archaeological museum in Turkey?", tr: "Türkiye'de hiç arkeoloji müzesi ziyaret ettin mi?" }
      },
      "interaction": {
        positive: { en: "Group projects encourage positive student interaction in class.", tr: "Grup projeleri derste olumlu öğrenci etkileşimini teşvik eder." },
        negative: { en: "Lack of interaction can make online lessons feel lonely.", tr: "Etkileşim eksikliği çevrimiçi derslerin yalnız hissettirmesine neden olabilir." },
        question: { en: "How can teachers increase student interaction during lectures?", tr: "Öğretmenler ders anlatımı sırasında öğrenci etkileşimini nasıl artırabilir?" }
      },
      "belong": {
        positive: { en: "This English notebook belongs to the new high school student.", tr: "Bu İngilizce defteri yeni lise öğrencisine aittir." },
        negative: { en: "These keys don't belong to the science laboratory.", tr: "Bu anahtarlar fen laboratuvarına ait değildir." },
        question: { en: "Does this sports equipment belong to our team?", tr: "Bu spor ekipmanı bizim takımımıza mı ait?" }
      },
      "hang out": {
        positive: { en: "We usually hang out at the youth center after classes.", tr: "Derslerden sonra genellikle gençlik merkezinde takılırız/vakit geçiririz." },
        negative: { en: "They don't hang out outside when the weather is stormy.", tr: "Hava fırtınalıyken dışarıda vakit geçirmezler." },
        question: { en: "Where do teenagers usually hang out in your hometown?", tr: "Memleketinizde gençler genellikle nerede vakit geçirir?" }
      },
      "keen on": {
        positive: { en: "Leo is very keen on science experiments and robotics.", tr: "Leo fen deneylerine ve robotiğe çok düşkündür/meraklıdır." },
        negative: { en: "She isn't keen on watching violent action movies.", tr: "Şiddet içeren aksiyon filmleri izlemeye meraklı değildir." },
        question: { en: "Are you keen on joining the school drama club this year?", tr: "Bu yıl okul tiyatro kulübüne katılmaya istekli misin?" }
      },
      "prefer": {
        positive: { en: "I prefer working in quiet libraries to crowded cafes.", tr: "Sessiz kütüphanelerde çalışmayı kalabalık kafelere tercih ederim." },
        negative: { en: "He doesn't prefer studying late at night before an exam.", tr: "Sınavdan önce gece geç saatlerde ders çalışmayı tercih etmez." },
        question: { en: "Do you prefer studying alone or with a group of friends?", tr: "Yalnız mı yoksa bir grup arkadaşla mı çalışmayı tercih edersin?" }
      },
      "schedule": {
        positive: { en: "Our school schedule starts at eight-thirty in the morning.", tr: "Okul ders programımız sabah sekiz buçukta başlar." },
        negative: { en: "We didn't change the examination schedule this week.", tr: "Bu hafta sınav takvimini değiştirmedik." },
        question: { en: "Can you send me the updated weekly club schedule?", tr: "Bana güncellenmiş haftalık kulüp programını gönderebilir misin?" }
      },
      "worldwide": {
        positive: { en: "English is a worldwide language used for global communication.", tr: "İngilizce küresel iletişim için kullanılan dünya çapında bir dildir." },
        negative: { en: "This phenomenon is not worldwide; it only happens locally.", tr: "Bu fenomen dünya çapında değildir; yalnızca yerel olarak gerçekleşir." },
        question: { en: "Why does soccer have such a massive worldwide fan base?", tr: "Futbolun neden dünya çapında bu kadar büyük bir hayran kitlesi var?" }
      },
      "ancient": {
        positive: { en: "Archaeologists discovered ancient Roman coins near the site.", tr: "Arkeologlar kazı alanının yakınında antik Roma sikkeleri keşfettiler." },
        negative: { en: "The modern building doesn't contain any ancient architecture.", tr: "Modern bina hiçbir antik mimari içermez." },
        question: { en: "Did you study the ancient civilizations of Anatolia in history class?", tr: "Tarih dersinde Anadolu'nun antik medeniyetlerini çalıştınız mı?" }
      },
      "artifacts": {
        positive: { en: "The museum exhibits precious historical artifacts from ancient times.", tr: "Müze antik dönemlerden kalma değerli tarihi eserleri sergiliyor." },
        negative: { en: "Visitors shouldn't touch sensitive artifacts without permission.", tr: "Ziyaretçiler izin almadan hassas tarihi eserlere dokunmamalıdır." },
        question: { en: "Where did researchers find these mysterious clay artifacts?", tr: "Araştırmacılar bu gizemli kilden tarihi eserleri nerede buldular?" }
      }
    };
  }

  generateDynamicGrammarSentences(en, cleanTr, cleanPos, grammarContext = '') {
    const w = (en || '').trim();
    const tr = cleanTr || 'öğrenilecek kelime';
    const isVerb = cleanPos.includes('fiil') || cleanPos.includes('verb');
    const isNoun = cleanPos.includes('isim') || cleanPos.includes('noun');
    const isAdj = cleanPos.includes('sıfat') || cleanPos.includes('adj');
    const isAdv = cleanPos.includes('zarf') || cleanPos.includes('adv');

    // Context-based grammar tense detection
    const isPast = grammarContext.toLowerCase().includes('past') || grammarContext.toLowerCase().includes('geçmiş');
    const isModal = grammarContext.toLowerCase().includes('modal') || grammarContext.toLowerCase().includes('can') || grammarContext.toLowerCase().includes('must');

    if (isVerb) {
      if (isPast) {
        return {
          positive: { en: `The students carefully ${w}ed the key points during yesterday's class.`, tr: `Öğrenciler dünkü derste önemli noktaları dikkatlice ${tr} yaptı/etti.` },
          negative: { en: `He didn't ${w} with the rest of the study group last week.`, tr: `Geçen hafta çalışma grubunun geri kalanıyla ${tr} yapmadı.` },
          question: { en: `Did you ${w} all necessary assignments before the deadline?`, tr: `Teslim tarihinden önce gerekli tüm ödevleri ${tr} yaptın mı?` }
        };
      }
      if (isModal) {
        return {
          positive: { en: `You must ${w} these essential vocabulary items for the exam.`, tr: `Sınav için bu temel kelimeleri mutlaka ${tr} yapmalısın/etmelisin.` },
          negative: { en: `Students shouldn't ${w} without reviewing the main instructions.`, tr: `Öğrenciler ana yönergeleri gözden geçirmeden ${tr} yapmamalıdır.` },
          question: { en: `How can we ${w} our language skills more effectively?`, tr: `Dil becerilerimizi nasıl daha etkili bir şekilde ${tr} yapabiliriz/geliştirebiliriz?` }
        };
      }
      return {
        positive: { en: `We often ${w} important topics together in our study sessions.`, tr: `Çalışma seanslarımızda önemli konuları sık sık birlikte ${tr} yaparız/ederiz.` },
        negative: { en: `He doesn't ${w} without checking his notes first.`, tr: `Önce notlarını kontrol etmeden ${tr} yapmaz/etmez.` },
        question: { en: `How often do you ${w} new expressions in daily conversation?`, tr: `Günlük konuşmalarda yeni ifadeleri ne sıklıkla ${tr} yaparsınız/kullanırsınız?` }
      };
    }

    if (isNoun) {
      return {
        positive: { en: `Our English teacher emphasized the importance of ${w} in today's lesson.`, tr: `İngilizce öğretmenimiz bugünkü derste ${tr} konusunun/kavramının önemini vurguladı.` },
        negative: { en: `They didn't encounter any difficulty regarding the ${w} in the project.`, tr: `Projelerinde ${tr} ile ilgili hiçbir zorlukla karşılaşmadılar.` },
        question: { en: `Did you take clear notes about the ${w} during the lecture?`, tr: `Ders sırasında ${tr} hakkında net notlar aldın mı?` }
      };
    }

    if (isAdj) {
      return {
        positive: { en: `She always maintains a very ${w} attitude towards learning English.`, tr: `İngilizce öğrenmeye karşı her zaman çok ${tr} bir tutum sergiler.` },
        negative: { en: `This practice exercise is not too ${w} for motivated students.`, tr: `Bu alıştırma istekli öğrenciler için fazla ${tr}/zor değildir.` },
        question: { en: `Do you find this new reading topic ${w} and informative?`, tr: `Bu yeni okuma konusunu ${tr} ve bilgilendirici buluyor musun?` }
      };
    }

    if (isAdv) {
      return {
        positive: { en: `He completes all required assignments ${w} before the bell rings.`, tr: `Zil çalmadan önce gerekli tüm ödevleri ${tr} tamamlar.` },
        negative: { en: `They don't act ${w} when solving difficult grammar problems.`, tr: `Zor gramer problemlerini çözerken ${tr} davranmazlar.` },
        question: { en: `Why should we practice speaking and listening more ${w}?`, tr: `Neden daha ${tr} konuşma ve dinleme pratiği yapmalıyız?` }
      };
    }

    // Fallback for Prepositions, Conjunctions, Articles, etc.
    return {
      positive: { en: `Students read passages ${w} analyze key grammar rules in class.`, tr: `Öğrenciler derste parçalar okur ${tr} önemli gramer kurallarını analiz eder.` },
      negative: { en: `We don't neglect grammar exercises ${w} vocabulary review.`, tr: `Gramer alıştırmalarını ${tr} kelime tekrarını ihmal etmeyiz.` },
      question: { en: `How do you use this structure ${w} express your thoughts clearly?`, tr: `Düşüncelerinizi net ifade etmek için bu yapıyı ${tr} nasıl kullanırsınız?` }
    };
  }

  getWordGrammarSentences(en, tr, pos = '', grammarContext = '') {
    const cleanEn = (en || '').trim().toLowerCase();
    const cleanTr = (tr || '').replace(/🇹🇷/g, '').replace(/\(.*?\)/g, '').trim() || 'öğrenilecek kelime';
    const cleanPos = (pos || '').toLowerCase();

    // 1. Check APP_DATA verbs / words if available
    if (typeof APP_DATA !== 'undefined' && APP_DATA.verbs) {
      const verbMatch = APP_DATA.verbs.find(v => v.word.toLowerCase() === cleanEn || (v.forms && (v.forms.v1 === cleanEn || v.forms.v2 === cleanEn || v.forms.v3 === cleanEn)));
      if (verbMatch && verbMatch.sentences && verbMatch.sentences.positive) {
        return {
          positive: verbMatch.sentences.positive,
          negative: verbMatch.sentences.negative,
          question: verbMatch.sentences.question
        };
      }
    }

    // 2. High-Frequency Curated 9th Grade Vocabulary Sentences
    const curated = this.getCuratedSentenceDatabase();
    if (curated[cleanEn]) {
      return curated[cleanEn];
    }

    // 3. Dynamic Grammatical Generator
    return this.generateDynamicGrammarSentences(en, cleanTr, cleanPos, grammarContext);
  }

  renderWordSentencesDrawer(en, tr, pos, grammarContext = '') {
    const s = this.getWordGrammarSentences(en, tr, pos, grammarContext);
    const hasGemini = window.geminiAI && window.geminiAI.hasApiKey();

    return `
      <div class="school-word-sentences-box">
        ${hasGemini ? `
          <div style="display:flex; justify-content:flex-end; margin-bottom:4px;">
            <button class="ai-regen-btn" onclick="event.stopPropagation(); schoolMode.generateAISentences(this, '${en.replace(/'/g, "\\'")}', '${(tr || '').replace(/'/g, "\\'")}', '${(pos || '').replace(/'/g, "\\'")}', '${(grammarContext || '').replace(/'/g, "\\'")}')" title="Gemini AI ile bu kelimeye özel yeni cümleler üret">
              ✨ Gemini ile Yenile
            </button>
          </div>
        ` : ''}
        <div class="school-card-sentences-content">
          <!-- Positive (+) -->
          <div class="sentence-item pos">
            <div class="sentence-type-header">
              <span>✅ Olumlu Cümle (+)</span>
              <button class="play-voice-btn" onclick="event.stopPropagation(); schoolMode.speakWord('${s.positive.en.replace(/'/g, "\\'")}', this)" title="Cümleyi Dinle">🔊</button>
            </div>
            <div class="sentence-text-en">${this.wrapSentence(s.positive.en)}</div>
            <div class="sentence-text-tr">🇹🇷 ${s.positive.tr}</div>
          </div>

          <!-- Negative (-) -->
          <div class="sentence-item neg">
            <div class="sentence-type-header">
              <span>❌ Olumsuz Cümle (-)</span>
              <button class="play-voice-btn" onclick="event.stopPropagation(); schoolMode.speakWord('${s.negative.en.replace(/'/g, "\\'")}', this)" title="Cümleyi Dinle">🔊</button>
            </div>
            <div class="sentence-text-en">${this.wrapSentence(s.negative.en)}</div>
            <div class="sentence-text-tr">🇹🇷 ${s.negative.tr}</div>
          </div>

          <!-- Question (?) -->
          <div class="sentence-item que">
            <div class="sentence-type-header">
              <span>❓ Soru Cümlesi (?)</span>
              <button class="play-voice-btn" onclick="event.stopPropagation(); schoolMode.speakWord('${s.question.en.replace(/'/g, "\\'")}', this)" title="Cümleyi Dinle">🔊</button>
            </div>
            <div class="sentence-text-en">${this.wrapSentence(s.question.en)}</div>
            <div class="sentence-text-tr">🇹🇷 ${s.question.tr}</div>
          </div>
        </div>
      </div>
    `;
  }

  toggleCardSentences(barElement, en, tr, pos, grammarContext = '') {
    const card = barElement.closest('.school-word-card');
    if (!card) return;
    const drawer = card.querySelector('.school-card-sentences-drawer');
    if (!drawer) return;

    const isClosed = drawer.style.display === 'none' || !drawer.classList.contains('open');

    if (isClosed) {
      if (!drawer.hasChildNodes() || drawer.innerHTML.trim() === '') {
        const sHtml = this.renderWordSentencesDrawer(en, tr, pos, grammarContext);
        drawer.innerHTML = sHtml;
      }
      drawer.style.display = 'flex';
      drawer.classList.add('open');
      barElement.classList.add('active');
      const icon = barElement.querySelector('.expand-icon');
      if (icon) icon.textContent = '▴';
    } else {
      drawer.style.display = 'none';
      drawer.classList.remove('open');
      barElement.classList.remove('active');
      const icon = barElement.querySelector('.expand-icon');
      if (icon) icon.textContent = '▾';
    }
  }

  async generateAISentences(btnElement, en, tr, pos, grammarContext) {
    if (!window.geminiAI || !window.geminiAI.hasApiKey()) {
      if (window.geminiAI) {
        window.geminiAI.openConfigModal();
      } else {
        if (window.app) window.app.showToast('Gemini API anahtarı gerekli.');
      }
      return;
    }

    const drawer = btnElement.closest('.school-card-sentences-drawer');
    const contentArea = drawer ? drawer.querySelector('.school-card-sentences-content') : null;
    const origText = btnElement.innerHTML;
    btnElement.innerHTML = '⏳ AI Üretiyor...';
    btnElement.disabled = true;

    try {
      const result = await window.geminiAI.generateGrammarSentences(en, tr, pos, grammarContext);
      if (result && result.positive && result.negative && result.question && contentArea) {
        contentArea.innerHTML = `
          <!-- Positive (+) -->
          <div class="sentence-item pos">
            <div class="sentence-type-header">
              <span>✅ Olumlu Cümle (+)</span>
              <button class="play-voice-btn" onclick="event.stopPropagation(); schoolMode.speakWord('${result.positive.en.replace(/'/g, "\\'")}', this)">🔊</button>
            </div>
            <div class="sentence-text-en">${this.wrapSentence(result.positive.en)}</div>
            <div class="sentence-text-tr">🇹🇷 ${result.positive.tr}</div>
          </div>

          <!-- Negative (-) -->
          <div class="sentence-item neg">
            <div class="sentence-type-header">
              <span>❌ Olumsuz Cümle (-)</span>
              <button class="play-voice-btn" onclick="event.stopPropagation(); schoolMode.speakWord('${result.negative.en.replace(/'/g, "\\'")}', this)">🔊</button>
            </div>
            <div class="sentence-text-en">${this.wrapSentence(result.negative.en)}</div>
            <div class="sentence-text-tr">🇹🇷 ${result.negative.tr}</div>
          </div>

          <!-- Question (?) -->
          <div class="sentence-item que">
            <div class="sentence-type-header">
              <span>❓ Soru Cümlesi (?)</span>
              <button class="play-voice-btn" onclick="event.stopPropagation(); schoolMode.speakWord('${result.question.en.replace(/'/g, "\\'")}', this)">🔊</button>
            </div>
            <div class="sentence-text-en">${this.wrapSentence(result.question.en)}</div>
            <div class="sentence-text-tr">🇹🇷 ${result.question.tr}</div>
          </div>
        `;
        if (window.app) window.app.showToast(`✨ "${en}" için Gemini örnek cümleleri oluşturuldu!`);
      }
    } catch (err) {
      console.error('AI sentence gen failed:', err);
      if (window.app) window.app.showToast('AI cümle üretimi sırasında hata oluştu.');
    } finally {
      btnElement.innerHTML = origText;
      btnElement.disabled = false;
    }
  }
}

// Global instance
window.schoolMode = new SchoolModeManager();
