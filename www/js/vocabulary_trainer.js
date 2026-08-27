/**
 * Kelime Ezberleme & Flaş Kart Motoru (Vocabulary Trainer)
 * Dual-direction Flip Cards (TR -> EN & EN -> TR), Vocabulary Book, and Memory Quizzes.
 */

class VocabularyTrainer {
  constructor() {
    this.currentMode = 'flashcards'; // 'flashcards', 'list', 'quiz'
    this.direction = 'tr_to_en';     // 'tr_to_en' (TR -> EN) or 'en_to_tr' (EN -> TR)
    this.currentIndex = 0;
    this.isFlipped = false;
    this.filterOnlyUnmastered = false;
    
    // Quiz state
    this.quizQuestions = [];
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
  }

  render() {
    const container = document.getElementById('vocab-trainer-content-area');
    if (!container) return;

    const words = this.getTrainingWords();

    container.innerHTML = `
      <div class="section-header" style="margin-bottom:12px;">
        <h2>📓 Kelime Defterim & Ezber Kartları</h2>
        <p>Kendi eklediğin kelimeleri çift taraflı flaş kartlarla ezberle ve test et</p>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="builder-modes" style="margin-bottom:14px;">
        <button class="mode-btn ${this.currentMode === 'flashcards' ? 'active' : ''}" onclick="vocabTrainer.setMode('flashcards')">
          🗂️ Flaş Kart Ezber
        </button>
        <button class="mode-btn ${this.currentMode === 'list' ? 'active' : ''}" onclick="vocabTrainer.setMode('list')">
          📋 Kelime Listem (${window.customWordsManager.getAll().length})
        </button>
        <button class="mode-btn ${this.currentMode === 'quiz' ? 'active' : ''}" onclick="vocabTrainer.setMode('quiz')">
          🎯 Hızlı Kelime Testi
        </button>
      </div>

      <div id="vocab-sub-content">
        ${this.renderSubContent(words)}
      </div>
    `;
  }

  getTrainingWords() {
    const all = window.customWordsManager ? window.customWordsManager.getAll() : [];
    if (this.filterOnlyUnmastered) {
      return all.filter(w => !w.mastered);
    }
    return all;
  }

  renderSubContent(words) {
    if (this.currentMode === 'flashcards') {
      return this.renderFlashcardsMode(words);
    } else if (this.currentMode === 'list') {
      return this.renderListMode(words);
    } else if (this.currentMode === 'quiz') {
      return this.renderQuizMode(words);
    }
  }

  /* =========================================================
     1. FLASHCARD FLIP MODE (Çift Taraflı Kart Çevirme)
     ========================================================= */
  renderFlashcardsMode(words) {
    if (words.length === 0) {
      return `
        <div class="controls-card" style="text-align:center; padding:32px 16px;">
          <div style="font-size:3rem; margin-bottom:8px;">📓</div>
          <h4 style="color:var(--text-primary);">Kelime Defterinizde Henüz Kelime Yok</h4>
          <p style="color:var(--text-secondary); font-size:0.85rem; margin-top:4px;">
            Aşağıdaki formdan hızlıca öğrenmek istediğiniz İngilizce ve Türkçe kelimeleri ekleyin.
          </p>
          <div style="margin-top:16px;">
            <button class="btn-primary" onclick="vocabTrainer.setMode('list')">
              ➕ Hemen Kelime Ekle
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentIndex >= words.length) {
      this.currentIndex = 0;
    }

    const currentWord = words[this.currentIndex];
    const isTrToEn = this.direction === 'tr_to_en';

    const frontLabel = isTrToEn ? '🇹🇷 TÜRKÇE ANLAMI' : '🇬🇧 İNGİLİZCE KELİME';
    const frontText = isTrToEn ? currentWord.meaningTr : currentWord.wordEn;

    const backLabel = isTrToEn ? '🇬🇧 İNGİLİZCE KARŞILIĞI' : '🇹🇷 TÜRKÇE ANLAMI';
    const backText = isTrToEn ? currentWord.wordEn : currentWord.meaningTr;

    return `
      <!-- Direction & Settings Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; gap:6px;">
          <button class="cat-chip ${isTrToEn ? 'active' : ''}" onclick="vocabTrainer.setDirection('tr_to_en')">
            🇹🇷 Türkçe ➔ 🇬🇧 İngilizce
          </button>
          <button class="cat-chip ${!isTrToEn ? 'active' : ''}" onclick="vocabTrainer.setDirection('en_to_tr')">
            🇬🇧 İngilizce ➔ 🇹🇷 Türkçe
          </button>
        </div>

        <span style="font-size:0.82rem; font-weight:800; color:var(--primary);">
          Kart ${this.currentIndex + 1} / ${words.length}
        </span>
      </div>

      <!-- 3D Flip Card Container -->
      <div class="flip-card-wrapper" onclick="vocabTrainer.toggleFlip()">
        <div class="flip-card-inner ${this.isFlipped ? 'flipped' : ''}">
          <!-- Front Face -->
          <div class="flip-card-face flip-card-front">
            <span class="card-face-tag">${frontLabel}</span>
            <div class="card-main-word">${frontText}</div>
            <span class="card-tap-hint">👆 Cevabı görmek için dokunun</span>
          </div>

          <!-- Back Face -->
          <div class="flip-card-face flip-card-back">
            <span class="card-face-tag">${backLabel}</span>
            <div class="card-main-word" style="color:var(--primary);">${backText}</div>
            <button class="btn-primary" style="margin-top:12px; padding:6px 16px; font-size:0.85rem;" 
                    onclick="event.stopPropagation(); speechEngine.speak('${currentWord.wordEn}')">
              🔊 Telaffuzu Dinle
            </button>
          </div>
        </div>
      </div>

      <!-- Card Action Buttons -->
      <div style="display:flex; justify-content:space-between; gap:10px; margin-top:16px;">
        <button class="btn-secondary" style="flex:1; justify-content:center;" onclick="vocabTrainer.prevCard()">
          ◀ Önceki
        </button>

        <button class="btn-secondary" style="background:var(--danger-bg); color:var(--danger); border-color:var(--danger); flex:1; justify-content:center;" 
                onclick="vocabTrainer.markNeedReview(${currentWord.id})">
          🔄 Tekrar Et
        </button>

        <button class="btn-primary" style="background:var(--success); color:#ffffff; flex:1; justify-content:center;" 
                onclick="vocabTrainer.markKnown(${currentWord.id})">
          ✅ Biliyorum (+2 XP)
        </button>

        <button class="btn-secondary" style="flex:1; justify-content:center;" onclick="vocabTrainer.nextCard()">
          Sonraki ▶
        </button>
      </div>
    `;
  }

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
    const inner = document.querySelector('.flip-card-inner');
    if (inner) {
      inner.classList.toggle('flipped', this.isFlipped);
    }
  }

  nextCard() {
    this.isFlipped = false;
    const words = this.getTrainingWords();
    if (words.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % words.length;
      this.render();
    }
  }

  prevCard() {
    this.isFlipped = false;
    const words = this.getTrainingWords();
    if (words.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + words.length) % words.length;
      this.render();
    }
  }

  markKnown(wordId) {
    window.customWordsManager.toggleMastered(wordId);
    if (window.app) window.app.showToast("⭐ Harika! Kelime öğrenildi (+2 XP)");
    this.nextCard();
  }

  markNeedReview(wordId) {
    if (window.app) window.app.showToast("🔄 Bu kelime tekrar listesine alındı.");
    this.nextCard();
  }

  setDirection(dir) {
    this.direction = dir;
    this.isFlipped = false;
    this.render();
  }

  /* =========================================================
     2. VOCABULARY LIST MODE (Hızlı Ekleme ve Liste)
     ========================================================= */
  renderListMode(words) {
    return `
      <!-- Fast Add Input Box -->
      <div class="controls-card" style="margin-bottom:16px;">
        <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-primary); margin-bottom:8px;">
          ➕ Yeni Kelime Kaydet
        </h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr auto; gap:8px;">
          <input type="text" id="fast-word-en" class="select-input" placeholder="İngilizce (örn: Library)">
          <input type="text" id="fast-word-tr" class="select-input" placeholder="Türkçe (örn: Kütüphane)">
          <button class="btn-primary" onclick="vocabTrainer.submitFastWord()">
            Kaydet (+3 XP)
          </button>
        </div>
      </div>

      <!-- Words Table / List -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${words.length === 0 ? '<div style="text-align:center; padding:20px; color:var(--text-secondary);">Henüz kelime eklenmedi.</div>' : ''}
        ${words.map(w => `
          <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <button class="play-voice-btn" onclick="speechEngine.speak('${w.wordEn}')">🔊</button>
              <div>
                <strong style="font-size:1.05rem; color:#ffffff;">${w.wordEn}</strong>
                <span style="font-size:0.9rem; color:var(--primary); margin-left:8px;">🇹🇷 ${w.meaningTr}</span>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-mastered ${w.mastered ? 'mastered' : ''}" style="padding:4px 8px; font-size:0.72rem;" onclick="customWordsManager.toggleMastered(${w.id})">
                ${w.mastered ? '✅ Öğrendim' : '○ Ezberle'}
              </button>
              <button class="icon-btn" style="width:30px; height:30px; font-size:0.8rem; color:var(--danger);" onclick="customWordsManager.deleteWord(${w.id})">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  submitFastWord() {
    const enInput = document.getElementById('fast-word-en');
    const trInput = document.getElementById('fast-word-tr');
    const en = enInput ? enInput.value.trim() : '';
    const tr = trInput ? trInput.value.trim() : '';

    if (!en || !tr) {
      alert('Lütfen İngilizce kelimeyi ve Türkçe karşılığını yazın.');
      return;
    }

    window.customWordsManager.addWord(en, tr);
    enInput.value = '';
    trInput.value = '';
    this.render();
  }

  /* =========================================================
     3. QUICK MATCH QUIZ MODE
     ========================================================= */
  renderQuizMode(words) {
    if (words.length < 2) {
      return `
        <div class="controls-card" style="text-align:center; padding:32px 16px;">
          <h4>Test için en az 2 kelime gereklidir.</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Lütfen önce kelime defterinize birkaç kelime ekleyin.</p>
          <button class="btn-primary" style="margin-top:12px;" onclick="vocabTrainer.setMode('list')">➕ Kelime Ekle</button>
        </div>
      `;
    }

    if (this.quizQuestions.length === 0) {
      this.generateQuiz(words);
    }

    const q = this.quizQuestions[this.quizIndex];
    if (!q) {
      return `
        <div class="quiz-arena-box" style="text-align:center; padding:32px 20px;">
          <div style="font-size:3rem; margin-bottom:8px;">🏆</div>
          <h3>Kelime Testi Tamamlandı!</h3>
          <p style="color:var(--primary); font-weight:800; font-size:1.1rem; margin:10px 0;">Skor: ${this.quizScore} / ${this.quizQuestions.length}</p>
          <button class="btn-primary" onclick="vocabTrainer.generateQuiz(customWordsManager.getAll())">🔄 Yeni Test Başlat</button>
        </div>
      `;
    }

    return `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.85rem; font-weight:800; color:var(--primary);">Soru ${this.quizIndex + 1} / ${this.quizQuestions.length}</span>
          <span class="stat-chip xp">⭐ +${this.quizScore * 3} XP</span>
        </div>

        <div class="quiz-question-box">
          <div style="font-size:1.2rem; font-weight:800; color:#ffffff;">"${q.prompt}"</div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">kelimesinin karşılığı hangisidir?</p>
        </div>

        <div class="quiz-options-list">
          ${q.options.map((opt, i) => `
            <button class="quiz-opt-btn" id="vocab-opt-${i}" onclick="vocabTrainer.selectQuizAnswer('${opt.replace(/'/g, "\\'")}', ${i})">
              <span><strong>${String.fromCharCode(65 + i)})</strong> ${opt}</span>
            </button>
          `).join('')}
        </div>

        <div id="vocab-quiz-feedback" style="display:none; justify-content:space-between; align-items:center; margin-top:10px;">
          <div id="vocab-feedback-msg" style="font-weight:700;"></div>
          <button class="btn-primary" onclick="vocabTrainer.nextQuizQuestion()">Sonraki Soru ➔</button>
        </div>
      </div>
    `;
  }

  generateQuiz(words) {
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
    this.quizQuestions = [];

    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
    shuffled.forEach(w => {
      const isTrToEn = Math.random() > 0.5;
      const prompt = isTrToEn ? w.meaningTr : w.wordEn;
      const correct = isTrToEn ? w.wordEn : w.meaningTr;
      
      const otherWords = words.filter(item => item.id !== w.id).map(item => isTrToEn ? item.wordEn : item.meaningTr).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [correct, ...otherWords].sort(() => Math.random() - 0.5);

      this.quizQuestions.push({ prompt, correct, options });
    });

    this.render();
  }

  selectQuizAnswer(selected, btnIdx) {
    if (this.quizAnswered) return;
    this.quizAnswered = true;

    const q = this.quizQuestions[this.quizIndex];
    const isCorrect = selected === q.correct;
    const btn = document.getElementById(`vocab-opt-${btnIdx}`);
    const feed = document.getElementById('vocab-quiz-feedback');
    const msg = document.getElementById('vocab-feedback-msg');

    if (isCorrect) {
      this.quizScore++;
      if (btn) btn.classList.add('correct');
      if (msg) {
        msg.style.color = 'var(--success)';
        msg.textContent = '🎉 Doğru! (+3 XP)';
      }
      if (window.app) window.app.addXP(3);
    } else {
      if (btn) btn.classList.add('wrong');
      if (msg) {
        msg.style.color = 'var(--danger)';
        msg.textContent = `❌ Doğru cevap: ${q.correct}`;
      }
    }

    if (feed) feed.style.display = 'flex';
  }

  nextQuizQuestion() {
    this.quizAnswered = false;
    this.quizIndex++;
    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.render();
  }
}

// Global instance
window.vocabTrainer = new VocabularyTrainer();
