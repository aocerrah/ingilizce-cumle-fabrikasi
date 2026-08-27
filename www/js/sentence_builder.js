/**
 * SVOMPT Studio & Cümle Sıralama Oyunu (Sentence Builder)
 * Interactive sentence building, color-coded SVOMPT tokens, and smart pedagogical error feedback.
 */

class SentenceBuilder {
  constructor() {
    this.currentMode = 'studio'; // 'studio' | 'scramble'
    this.selectedTense = 'present_simple';
    this.selectedType = 'pos'; // 'pos' | 'neg' | 'que'
    this.selectedVerb = (APP_DATA && APP_DATA.verbs && APP_DATA.verbs.length > 0) ? APP_DATA.verbs[0] : null;

    // Scramble Game State
    this.scrambleVerb = null;
    this.scrambleSentenceType = 'positive';
    this.scrambleTokens = [];
    this.selectedTokens = [];
    this.scrambleScore = 0;
    this.isScrambleSolved = false;
    this.showHint = false;
  }

  setMode(mode) {
    this.currentMode = mode;
    
    document.querySelectorAll('.builder-modes .mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'studio') {
      this.renderStudio();
    } else {
      this.initScramble();
      this.renderScramble();
    }
  }

  /* =========================================================
     1. SVOMPT STUDIO MODE
     ========================================================= */
  renderStudio() {
    const container = document.getElementById('builder-content-area');
    if (!container) return;

    const allVerbs = APP_DATA.verbs || [];
    if (!this.selectedVerb && allVerbs.length > 0) {
      this.selectedVerb = allVerbs[0];
    }

    const v = this.selectedVerb;
    if (!v) {
      container.innerHTML = '<div class="controls-card">Fiil verisi yüklenemedi.</div>';
      return;
    }

    const sentences = v.sentences || {};
    let targetSentence = sentences.positive;
    if (this.selectedType === 'neg') targetSentence = sentences.negative;
    if (this.selectedType === 'que') targetSentence = sentences.question;

    container.innerHTML = `
      <!-- Controls Bar -->
      <div class="controls-card">
        <div class="form-row">
          <label>Çalışılacak Fiil (158 Fiil Müfredatı):</label>
          <select class="select-input" id="builder-verb-select" onchange="sentenceBuilder.onVerbChange(this.value)">
            ${allVerbs.map(item => `
              <option value="${item.id}" ${item.id === v.id ? 'selected' : ''}>
                #${item.id} ${item.verb} - ${item.meaning} (${item.level})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-row" style="margin-top:10px;">
          <label>Cümle Türü:</label>
          <div style="display:flex; gap:8px;">
            <button class="cat-chip ${this.selectedType === 'pos' ? 'active' : ''}" onclick="sentenceBuilder.setType('pos')">
              ✅ Olumlu Cümle (+)
            </button>
            <button class="cat-chip ${this.selectedType === 'neg' ? 'active' : ''}" onclick="sentenceBuilder.setType('neg')">
              ❌ Olumsuz Cümle (-)
            </button>
            <button class="cat-chip ${this.selectedType === 'que' ? 'active' : ''}" onclick="sentenceBuilder.setType('que')">
              ❓ Soru Cümlesi (?)
            </button>
          </div>
        </div>
      </div>

      <!-- Live Sentence Display Box -->
      <div class="sentence-display-box">
        <div class="sentence-type-badge ${this.selectedType}">
          ${this.selectedType === 'pos' ? '✅ OLUMLU SVOMPT CÜMLESİ' : (this.selectedType === 'neg' ? '❌ OLUMSUZ SVOMPT CÜMLESİ' : '❓ SORU CÜMLESİ')}
        </div>

        <div class="sentence-en-text" id="live-sentence-en">
          ${targetSentence ? targetSentence.en : ''}
        </div>

        <div class="sentence-tr-text" id="live-sentence-tr">
          🇹🇷 ${targetSentence ? targetSentence.tr : ''}
        </div>

        <div class="audio-action-row" style="margin-top:16px;">
          <button class="btn-primary" onclick="speechEngine.speak('${targetSentence ? targetSentence.en.replace(/'/g, "\\'") : ''}')">
            🔊 Sesli Telaffuzu Dinle
          </button>
        </div>
      </div>

      <!-- SVOMPT Rule Explainer Card -->
      <div class="controls-card" style="margin-top:16px;">
        <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-primary); margin-bottom:10px;">
          📐 SVOMPT Cümle Kurma Kuralı Nedir?
        </h4>
        <div class="svompt-rule-grid">
          <div class="svompt-rule-item s">
            <strong>S (Subject)</strong>
            <span>Özne: Eylemi kimin yaptığını belirtir (I, You, Students).</span>
          </div>
          <div class="svompt-rule-item v">
            <strong>V (Verb)</strong>
            <span>Fiil: Yapılan eylem ve zaman eki (achieve, play, don't write).</span>
          </div>
          <div class="svompt-rule-item o">
            <strong>O (Object)</strong>
            <span>Nesne: Eylemden etkilenen şey (goals, English, the ball).</span>
          </div>
          <div class="svompt-rule-item m">
            <strong>M (Manner)</strong>
            <span>Durum: Eylemin nasıl yapıldığı (carefully, fluently, with passion).</span>
          </div>
          <div class="svompt-rule-item p">
            <strong>P (Place)</strong>
            <span>Yer: Eylemin nerede gerçekleştiği (in class, at home).</span>
          </div>
          <div class="svompt-rule-item t">
            <strong>T (Time)</strong>
            <span>Zaman: Eylemin ne zaman yapıldığı (every day, yesterday).</span>
          </div>
        </div>
      </div>
    `;
  }

  onVerbChange(verbId) {
    const allVerbs = APP_DATA.verbs || [];
    const found = allVerbs.find(v => v.id === parseInt(verbId, 10));
    if (found) {
      this.selectedVerb = found;
      this.renderStudio();
    }
  }

  setType(type) {
    this.selectedType = type;
    this.renderStudio();
  }

  /* =========================================================
     2. SCRAMBLE GAME WITH PEDAGOGICAL ERROR TEACHING
     ========================================================= */
  initScramble() {
    const allVerbs = APP_DATA.verbs || [];
    this.scrambleVerb = allVerbs[Math.floor(Math.random() * allVerbs.length)];
    const types = ['positive', 'negative', 'question'];
    this.scrambleSentenceType = types[Math.floor(Math.random() * types.length)];
    this.showHint = false;

    const sentence = this.scrambleVerb.sentences[this.scrambleSentenceType].en;
    const tokens = sentence.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
    this.scrambleTokens = [...tokens].sort(() => Math.random() - 0.5);
    this.selectedTokens = [];
    this.isScrambleSolved = false;
  }

  renderScramble() {
    const container = document.getElementById('builder-content-area');
    if (!container || !this.scrambleVerb) return;

    const targetSentenceObj = this.scrambleVerb.sentences[this.scrambleSentenceType];
    const rawTarget = targetSentenceObj.en.trim();
    const cleanTokens = rawTarget.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
    const targetCleanString = cleanTokens.join(' ').toLowerCase();

    const currentSelectedString = this.selectedTokens.join(' ').toLowerCase();
    const isAllPlaced = this.scrambleTokens.length === 0;
    const isCorrect = currentSelectedString === targetCleanString;
    const isWrong = isAllPlaced && !isCorrect;

    // Pedagogical SVOMPT Breakdown
    const svomptBreakdown = this.generateSVOMPTBreakdown(this.scrambleVerb, rawTarget);

    container.innerHTML = `
      <div class="scramble-game-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="stat-chip streak">🎮 Cümle Sıralama Oyunu</span>
          <div style="display:flex; gap:6px;">
            <button class="cat-chip" style="font-size:0.75rem; border-color:var(--accent); color:var(--accent);" onclick="sentenceBuilder.toggleHint()">
              💡 ${this.showHint ? 'İpucunu Gizle' : 'SVOMPT İpucu'}
            </button>
            <span class="stat-chip xp">⭐ Skor: ${this.scrambleScore}</span>
          </div>
        </div>

        <!-- Turkish Target Sentence -->
        <div style="background:var(--bg-surface); padding:14px; border-radius:var(--radius-md); margin:12px 0; border-left:4px solid var(--accent);">
          <span style="font-size:0.72rem; font-weight:800; color:var(--accent); letter-spacing:0.05em;">TÜRKÇE ANLAMI</span>
          <div style="font-size:1.1rem; font-weight:800; color:#ffffff; margin-top:2px; line-height:1.4;">
            🇹🇷 ${targetSentenceObj.tr}
          </div>
          <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:4px;">
            Kelimelere dokunarak doğru <strong>SVOMPT</strong> sırasına göre cümlenizi kurun:
          </p>
        </div>

        ${this.showHint ? `
          <div style="background: rgba(129, 140, 248, 0.15); border: 1px solid rgba(129, 140, 248, 0.4); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px; font-size:0.82rem;">
            <strong style="color:var(--accent);">📐 SVOMPT Formülü:</strong> Özne (Kim?) ➔ Fiil (Ne yapar?) ➔ Nesne (Neyi?) ➔ Durum (Nasıl?) ➔ Yer ➔ Zaman
          </div>
        ` : ''}

        <!-- Selected Result Box -->
        <div style="min-height:60px; background:rgba(15, 23, 42, 0.85); border:2px dashed ${isCorrect ? 'var(--success)' : (isWrong ? 'var(--danger)' : 'var(--border-subtle)')}; border-radius:var(--radius-md); padding:10px 14px; display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:12px;">
          ${this.selectedTokens.length === 0 ? '<span style="color:var(--text-muted); font-size:0.85rem;">👇 Aşağıdaki kelimelere dokunun...</span>' : ''}
          ${this.selectedTokens.map((tok, idx) => `
            <button class="token-chip" style="background:${isCorrect ? 'var(--success)' : (isWrong ? 'var(--danger)' : 'var(--accent)')}; color:#ffffff;" onclick="sentenceBuilder.unselectToken(${idx})">
              ${tok} ✕
            </button>
          `).join('')}
        </div>

        <!-- Available Token Bank -->
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; min-height:40px;">
          ${this.scrambleTokens.map((tok, idx) => `
            <button class="token-chip" style="font-size:0.95rem; padding:8px 14px;" onclick="sentenceBuilder.selectToken('${tok.replace(/'/g, "\\'")}', ${idx})">
              ${tok}
            </button>
          `).join('')}
        </div>

        <!-- SUCCESS STATE -->
        ${isCorrect ? `
          <div style="background:rgba(34, 197, 94, 0.15); border:2px solid var(--success); padding:14px; border-radius:var(--radius-md); margin-bottom:14px; animation: slideDownToast 0.3s ease;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-weight:900; font-size:1.05rem; color:var(--success);">🎉 MÜKEMMEL! DOĞRU CÜMLE KURULDU (+3 XP)</div>
              <button class="play-voice-btn" onclick="speechEngine.speak('${rawTarget.replace(/'/g, "\\'")}')">🔊 Dinle</button>
            </div>
            <div style="font-size:0.9rem; color:#ffffff; margin-top:6px; font-weight:700;">
              🇬🇧 "${rawTarget}"
            </div>
            ${svomptBreakdown}
          </div>
        ` : ''}

        <!-- WRONG ORDER PEDAGOGICAL FEEDBACK STATE -->
        ${isWrong ? `
          <div style="background:rgba(239, 68, 68, 0.15); border:2px solid var(--danger); padding:14px; border-radius:var(--radius-md); margin-bottom:14px; animation: slideDownToast 0.3s ease;">
            <div style="font-weight:900; color:var(--danger); font-size:1rem;">
              ❌ Sıralama Hatası! Kelimeler Yanlış Dizildi
            </div>
            <p style="font-size:0.82rem; color:#cbd5e1; margin:8px 0;">
              İngilizce cümle kalıbına göre niteleme ve edatlar ait oldukları ögelerin hemen önüne gelir:
            </p>
            ${svomptBreakdown}
            <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
              <button class="btn-secondary" style="background:var(--danger-bg); color:var(--danger); border-color:var(--danger); font-size:0.82rem;" onclick="sentenceBuilder.resetTokens()">
                🔄 Sıfırla ve Kendin Dene
              </button>
              <button class="btn-primary" style="background:var(--primary); font-size:0.82rem;" onclick="sentenceBuilder.autoSolve()">
                ✨ Doğru Dizilimi Göster & Öğren
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display:flex; justify-content:space-between; gap:10px; margin-top:8px;">
          <button class="btn-secondary" onclick="sentenceBuilder.resetTokens()">
            🗑️ Sıfırla
          </button>
          <button class="btn-primary" onclick="sentenceBuilder.nextScramble()">
            ${isCorrect ? 'Sonraki Cümleye Geç ➔' : '🔄 Başka Cümle Getir'}
          </button>
        </div>
      </div>
    `;

    if (isCorrect && !this.isScrambleSolved) {
      this.isScrambleSolved = true;
      this.scrambleScore += 3;
      if (window.app) window.app.addXP(3);
      setTimeout(() => speechEngine.speak(rawTarget), 200);
    }
  }

  generateSVOMPTBreakdown(verbObj, sentenceText) {
    const tokens = sentenceText.replace(/[.,]/g, '').split(/\s+/);
    const verbWord = verbObj.verb.toLowerCase();
    const verbIdx = tokens.findIndex(t => t.toLowerCase() === verbWord || t.toLowerCase() === verbObj.forms?.v1?.toLowerCase());
    
    let subject = tokens.slice(0, Math.max(1, verbIdx > 0 ? verbIdx : 1)).join(' ');
    let verb = verbIdx >= 0 ? tokens[verbIdx] : verbObj.verb;
    let rest = tokens.slice(verbIdx >= 0 ? verbIdx + 1 : 2).join(' ');

    return `
      <div style="background:rgba(15, 23, 42, 0.7); padding:10px 12px; border-radius:var(--radius-sm); margin-top:8px; border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); margin-bottom:4px;">🔍 DOĞRU SVOMPT DİZİLİŞİ:</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; font-size:0.78rem;">
          <span style="background:var(--color-s-bg); color:var(--color-s); padding:3px 8px; border-radius:4px; font-weight:700;">
            Özne (S): ${subject}
          </span>
          <span style="background:var(--color-v-bg); color:var(--color-v); padding:3px 8px; border-radius:4px; font-weight:700;">
            Fiil (V): ${verb}
          </span>
          ${rest ? `
            <span style="background:var(--color-o-bg); color:var(--color-o); padding:3px 8px; border-radius:4px; font-weight:700;">
              Nesne & Niteleme (O-M-P-T): ${rest}
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }

  toggleHint() {
    this.showHint = !this.showHint;
    this.renderScramble();
  }

  selectToken(tok, idx) {
    this.selectedTokens.push(tok);
    this.scrambleTokens.splice(idx, 1);
    this.renderScramble();
  }

  unselectToken(idx) {
    const removed = this.selectedTokens.splice(idx, 1)[0];
    this.scrambleTokens.push(removed);
    this.renderScramble();
  }

  resetTokens() {
    if (this.scrambleVerb) {
      const sentence = this.scrambleVerb.sentences[this.scrambleSentenceType].en;
      const tokens = sentence.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
      this.scrambleTokens = [...tokens].sort(() => Math.random() - 0.5);
      this.selectedTokens = [];
      this.renderScramble();
    }
  }

  autoSolve() {
    const sentence = this.scrambleVerb.sentences[this.scrambleSentenceType].en;
    const tokens = sentence.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
    this.selectedTokens = [...tokens];
    this.scrambleTokens = [];
    this.renderScramble();
  }

  nextScramble() {
    this.initScramble();
    this.renderScramble();
  }
}

// Global instance
window.sentenceBuilder = new SentenceBuilder();
