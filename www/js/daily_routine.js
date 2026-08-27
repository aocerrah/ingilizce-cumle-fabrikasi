/**
 * Akıllı Günlük Çalışma Rutini & Zorunlu Ders Akışı (Daily Routine Engine)
 * Includes Pedagogical SVOMPT Feedback, Color-Coded Grammar Breakdown, and Smart Hints.
 */

class DailyRoutineEngine {
  constructor() {
    this.isActive = false;
    this.currentStep = 0; // 0: Vocab, 1: Sentence, 2: Quiz, 3: Completed
    this.sessionWords = [];
    this.currentVocabIndex = 0;
    this.currentSentenceIndex = 0;
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
    this.selectedScrambleTokens = [];
    this.showHint = false;
  }

  startRoutine() {
    this.isActive = true;
    this.currentStep = 0;
    this.currentVocabIndex = 0;
    this.currentSentenceIndex = 0;
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
    this.selectedScrambleTokens = [];
    this.showHint = false;

    this.sessionWords = this.pickSmartWords(5);

    if (window.app) {
      window.app.switchTab('routine');
    }
  }

  pickSmartWords(count = 5) {
    const allVerbs = (APP_DATA && APP_DATA.verbs) ? [...APP_DATA.verbs] : [];
    const masteredIds = (window.app) ? window.app.masteredVerbs : [];

    const unmasteredVerbs = allVerbs.filter(v => !masteredIds.includes(v.id));
    const pool = unmasteredVerbs.length >= count ? unmasteredVerbs : allVerbs;

    const shuffledVerbs = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

    return shuffledVerbs.map(v => ({
      id: v.id,
      verb: v.verb,
      meaning: v.meaning,
      level: v.level,
      forms: v.forms,
      sentences: v.sentences
    }));
  }

  render() {
    const container = document.getElementById('routine-content-area');
    if (!container) return;

    if (!this.isActive || this.sessionWords.length === 0) {
      this.renderIntro(container);
      return;
    }

    if (this.currentStep === 0) {
      this.renderStep1Vocab(container);
    } else if (this.currentStep === 1) {
      this.renderStep2Sentence(container);
    } else if (this.currentStep === 2) {
      this.renderStep3Quiz(container);
    } else if (this.currentStep === 3) {
      this.renderStep4Celebration(container);
    }
  }

  renderIntro(container) {
    const streak = window.app ? window.app.streak : 1;

    container.innerHTML = `
      <div class="hero-card" style="text-align:center; padding:32px 20px;">
        <div style="font-size:3.5rem; margin-bottom:8px;">⚡</div>
        <span class="hero-badge">GÜNLÜK ZORUNLU DERS RUTİNİ</span>
        <h3 style="font-size:1.4rem; font-weight:800; color:#ffffff; margin-top:8px;">
          Günün İngilizce Antrenmanı
        </h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); max-width:420px; margin:8px auto 20px;">
          Hangi kelimeyi çalışacağını düşünmene gerek yok! Sistem senin için özel seçilmiş 5 kelime, SVOMPT cümle kurma ve mini test hazırladı.
        </p>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; max-width:480px; margin:0 auto 24px; text-align:center;">
          <div style="background:var(--bg-surface); padding:8px 4px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:1.2rem;">🗂️</div>
            <div style="font-size:0.68rem; font-weight:800; color:var(--primary); margin-top:2px;">1. Kelimeler</div>
          </div>
          <div style="background:var(--bg-surface); padding:8px 4px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:1.2rem;">🧩</div>
            <div style="font-size:0.68rem; font-weight:800; color:var(--accent); margin-top:2px;">2. Cümle Kur</div>
          </div>
          <div style="background:var(--bg-surface); padding:8px 4px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:1.2rem;">🎯</div>
            <div style="font-size:0.68rem; font-weight:800; color:#10b981; margin-top:2px;">3. Mini Sınav</div>
          </div>
          <div style="background:var(--bg-surface); padding:8px 4px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:1.2rem;">🎁</div>
            <div style="font-size:0.68rem; font-weight:800; color:#f59e0b; margin-top:2px;">4. Ödül & XP</div>
          </div>
        </div>

        <button class="btn-primary" style="padding:14px 28px; font-size:1.1rem; width:100%; max-width:320px; margin:0 auto; justify-content:center;" onclick="dailyRoutine.startRoutine()">
          🚀 Bugünkü Rutini Başlat (10 Dk)
        </button>
      </div>
    `;
  }

  /* =========================================================
     STEP 1: 5 SMART VOCABULARY WORDS
     ========================================================= */
  renderStep1Vocab(container) {
    const w = this.sessionWords[this.currentVocabIndex];
    const progress = ((this.currentVocabIndex + 1) / this.sessionWords.length) * 100;

    container.innerHTML = `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:800; color:var(--primary); text-transform:uppercase;">
            ADIM 1 / 3: GÜNÜN KELİMELERİ (${this.currentVocabIndex + 1} / ${this.sessionWords.length})
          </span>
          <span class="stat-chip streak">1. Adım</span>
        </div>

        <div class="quiz-progress-bar" style="margin:8px 0 16px;">
          <div class="quiz-progress-fill" style="width: ${progress}%;"></div>
        </div>

        <!-- Word Spotlight Card -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); border: 2px solid rgba(56, 189, 248, 0.4); border-radius:var(--radius-lg); padding:24px 16px; text-align:center;">
          <span class="stat-chip" style="color:var(--primary); margin-bottom:8px;">${w.level} Seviyesi Fiil</span>
          <div style="font-size:2.4rem; font-weight:900; color:#ffffff; margin:8px 0;">${w.verb}</div>
          <div style="font-size:1.3rem; font-weight:700; color:var(--primary); margin-bottom:12px;">🇹🇷 ${w.meaning}</div>

          <button class="btn-primary" style="margin:0 auto 16px; padding:8px 20px;" onclick="speechEngine.speak('${w.verb}')">
            🔊 Doğal Telaffuzu Dinle
          </button>

          <!-- Forms -->
          <div class="verb-forms-row" style="margin-bottom:14px;">
            <span><strong>V1:</strong> ${w.forms?.v1 || w.verb}</span>
            <span><strong>V2:</strong> ${w.forms?.v2 || '-'}</span>
            <span><strong>V3:</strong> ${w.forms?.v3 || '-'}</span>
          </div>

          <!-- Positive Sentence Example -->
          <div class="sentence-item pos" style="text-align:left; margin-top:8px;">
            <div class="sentence-type-header">
              <span>✅ Günlük Kullanım Örneği</span>
              <button class="play-voice-btn" onclick="speechEngine.speak('${w.sentences.positive.en.replace(/'/g, "\\'")}')">🔊</button>
            </div>
            <div class="sentence-text-en">${w.sentences.positive.en}</div>
            <div class="sentence-text-tr">🇹🇷 ${w.sentences.positive.tr}</div>
          </div>
        </div>

        <!-- Next / Prev Controls -->
        <div style="display:flex; justify-content:space-between; gap:10px; margin-top:16px;">
          <button class="btn-secondary" style="flex:1; justify-content:center;" onclick="dailyRoutine.prevVocab()">
            ◀ Önceki
          </button>
          <button class="btn-primary" style="flex:2; justify-content:center;" onclick="dailyRoutine.nextVocab()">
            ${this.currentVocabIndex === this.sessionWords.length - 1 ? 'Adım 2: Cümle Fabrikasına Geç ➔' : 'Sonraki Kelime ▶'}
          </button>
        </div>
      </div>
    `;

    setTimeout(() => speechEngine.speak(w.verb), 300);
  }

  nextVocab() {
    if (this.currentVocabIndex < this.sessionWords.length - 1) {
      this.currentVocabIndex++;
      this.render();
    } else {
      this.currentStep = 1;
      this.currentSentenceIndex = 0;
      this.currentScrambleTokens = null;
      this.selectedScrambleTokens = [];
      this.showHint = false;
      this.render();
    }
  }

  prevVocab() {
    if (this.currentVocabIndex > 0) {
      this.currentVocabIndex--;
      this.render();
    }
  }

  /* =========================================================
     STEP 2: SENTENCE PUZZLE WITH PEDAGOGICAL SVOMPT TEACHING
     ========================================================= */
  renderStep2Sentence(container) {
    const totalSentenceTasks = Math.min(3, this.sessionWords.length);
    const w = this.sessionWords[this.currentSentenceIndex];
    const rawTarget = w.sentences.positive.en.trim();
    // Normalize target sentence tokens
    const cleanTokens = rawTarget.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
    const targetCleanString = cleanTokens.join(' ').toLowerCase();

    // Prepare randomized tokens once per sentence
    if (!this.currentScrambleTokens) {
      this.currentScrambleTokens = [...cleanTokens].sort(() => Math.random() - 0.5);
      this.selectedScrambleTokens = [];
      this.showHint = false;
    }

    const currentSelectedString = this.selectedScrambleTokens.join(' ').toLowerCase();
    const isAllPlaced = this.currentScrambleTokens.length === 0;
    const isCorrect = currentSelectedString === targetCleanString;
    const isWrong = isAllPlaced && !isCorrect;

    // Pedagogical SVOMPT Breakdown Helper
    const svomptExplanation = this.generateSVOMPTBreakdown(w, rawTarget);

    container.innerHTML = `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:800; color:var(--accent); text-transform:uppercase;">
            ADIM 2 / 3: CÜMLE FABRİKASI (${this.currentSentenceIndex + 1} / ${totalSentenceTasks})
          </span>
          <button class="cat-chip" style="font-size:0.75rem; border-color:var(--accent); color:var(--accent);" onclick="dailyRoutine.toggleHint()">
            💡 ${this.showHint ? 'İpucunu Gizle' : 'SVOMPT İpucu Al'}
          </button>
        </div>

        <!-- Turkish Target Sentence -->
        <div style="background:var(--bg-surface); padding:14px; border-radius:var(--radius-md); margin:12px 0; border-left:4px solid var(--accent);">
          <span style="font-size:0.72rem; font-weight:800; color:var(--accent); letter-spacing:0.05em;">TÜRKÇE ANLAMI</span>
          <div style="font-size:1.1rem; font-weight:800; color:#ffffff; margin-top:2px; line-height:1.4;">
            🇹🇷 ${w.sentences.positive.tr}
          </div>
          <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:4px;">
            Aşağıdaki kelimelere dokunarak <strong>Özne ➔ Fiil ➔ Nesne ➔ Durum</strong> kuralına göre dizin:
          </p>
        </div>

        <!-- SVOMPT Rule Guide Banner (Collapsible / Active on Hint) -->
        ${this.showHint ? `
          <div style="background: rgba(129, 140, 248, 0.15); border: 1px solid rgba(129, 140, 248, 0.4); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px; font-size:0.82rem; line-height:1.5;">
            <strong style="color:var(--accent);">📐 İngilizce SVOMPT Cümle Dizilişi Kuralı:</strong>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:6px;">
              <span class="svompt-pill s"><strong>S</strong> (Özne)</span> ➔
              <span class="svompt-pill v"><strong>V</strong> (Fiil)</span> ➔
              <span class="svompt-pill o"><strong>O</strong> (Nesne)</span> ➔
              <span class="svompt-pill m"><strong>M</strong> (Durum/Nasıl?)</span> ➔
              <span class="svompt-pill p"><strong>P</strong> (Yer)</span> ➔
              <span class="svompt-pill t"><strong>T</strong> (Zaman)</span>
            </div>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:6px;">
              İngilizce cümleler Türkçe gibi sondan başa kurulmaz! Önce eylemi kimin yaptığı (Özne), hemen ardından yapılan iş (Fiil) söylenir.
            </p>
          </div>
        ` : ''}

        <!-- Selected Result Box -->
        <div style="min-height:60px; background:rgba(15, 23, 42, 0.85); border:2px dashed ${isCorrect ? 'var(--success)' : (isWrong ? 'var(--danger)' : 'var(--border-subtle)')}; border-radius:var(--radius-md); padding:10px 14px; display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:12px;">
          ${this.selectedScrambleTokens.length === 0 ? '<span style="color:var(--text-muted); font-size:0.85rem;">👇 Kelimelere sırayla dokunarak cümlenizi oluşturun...</span>' : ''}
          ${this.selectedScrambleTokens.map((tok, idx) => `
            <button class="token-chip" style="background: ${isCorrect ? 'var(--success)' : (isWrong ? 'var(--danger)' : 'var(--accent)')}; color:#ffffff;" onclick="dailyRoutine.removeToken(${idx})">
              ${tok} <span style="font-size:0.7rem; opacity:0.8;">✕</span>
            </button>
          `).join('')}
        </div>

        <!-- Available Token Bank -->
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; min-height:40px;">
          ${this.currentScrambleTokens.map((tok, idx) => `
            <button class="token-chip" style="font-size:0.95rem; padding:8px 14px;" onclick="dailyRoutine.addToken('${tok.replace(/'/g, "\\'")}', ${idx})">
              ${tok}
            </button>
          `).join('')}
        </div>

        <!-- SUCCESS STATE -->
        ${isCorrect ? `
          <div style="background:rgba(34, 197, 94, 0.15); border:2px solid var(--success); padding:14px; border-radius:var(--radius-md); margin-bottom:14px; animation: slideDownToast 0.3s ease;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-weight:900; font-size:1.05rem; color:var(--success);">🎉 TEBRİKLER! DOĞRU SVOMPT DİZİLİMİ (+3 XP)</div>
              <button class="play-voice-btn" onclick="speechEngine.speak('${rawTarget.replace(/'/g, "\\'")}')">🔊 Dinle</button>
            </div>
            <div style="font-size:0.88rem; color:#ffffff; margin-top:6px; font-weight:700;">
              🇬🇧 "${rawTarget}"
            </div>
            ${svomptExplanation}
          </div>
        ` : ''}

        <!-- WRONG ORDER PEDAGOGICAL FEEDBACK STATE -->
        ${isWrong ? `
          <div style="background:rgba(239, 68, 68, 0.15); border:2px solid var(--danger); padding:14px; border-radius:var(--radius-md); margin-bottom:14px; animation: slideDownToast 0.3s ease;">
            <div style="display:flex; align-items:center; gap:6px; font-weight:900; color:var(--danger); font-size:1rem;">
              <span>❌ Sıralama Hatası! Kelimeler Yanlış Dizildi</span>
            </div>
            
            <p style="font-size:0.82rem; color:#cbd5e1; margin:8px 0;">
              İngilizcede edatlar ve niteleyiciler ait oldukları kelimelerden hemen önce gelir. Cümle kalıbını incele:
            </p>

            ${svomptExplanation}

            <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
              <button class="btn-secondary" style="background:var(--danger-bg); color:var(--danger); border-color:var(--danger); font-size:0.82rem;" onclick="dailyRoutine.resetSentenceTokens()">
                🔄 Sıfırla ve Kendin Tekrar Dene
              </button>
              <button class="btn-primary" style="background:var(--primary); font-size:0.82rem;" onclick="dailyRoutine.autoSolveSentence()">
                ✨ Doğru Dizilimi Göster & Öğren (+1 XP)
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Action Footer -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:6px;">
          <button class="btn-secondary" onclick="dailyRoutine.resetSentenceTokens()">
            🗑️ Sıfırla
          </button>
          
          <button class="btn-primary" ${!isCorrect ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} onclick="dailyRoutine.nextSentence()">
            ${this.currentSentenceIndex === totalSentenceTasks - 1 ? 'Adım 3: Sınava Geç ➔' : 'Sonraki Cümle ▶'}
          </button>
        </div>
      </div>
    `;

    if (isCorrect) {
      setTimeout(() => speechEngine.speak(rawTarget), 200);
    }
  }

  generateSVOMPTBreakdown(verbObj, sentenceText) {
    const tokens = sentenceText.replace(/[.,]/g, '').split(/\s+/);
    const verbWord = verbObj.verb.toLowerCase();
    
    // Find verb index
    const verbIdx = tokens.findIndex(t => t.toLowerCase() === verbWord || t.toLowerCase() === verbObj.forms?.v1?.toLowerCase());
    
    let subject = tokens.slice(0, Math.max(1, verbIdx > 0 ? verbIdx : 1)).join(' ');
    let verb = verbIdx >= 0 ? tokens[verbIdx] : verbObj.verb;
    let rest = tokens.slice(verbIdx >= 0 ? verbIdx + 1 : 2).join(' ');

    return `
      <div style="background:rgba(15, 23, 42, 0.7); padding:10px 12px; border-radius:var(--radius-sm); margin-top:8px; border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); margin-bottom:4px;">🔍 CÜMLE YAPISI ANALİZİ (SVOMPT):</div>
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
    this.render();
  }

  addToken(tok, idx) {
    this.selectedScrambleTokens.push(tok);
    this.currentScrambleTokens.splice(idx, 1);
    this.render();
  }

  removeToken(idx) {
    const removed = this.selectedScrambleTokens.splice(idx, 1)[0];
    this.currentScrambleTokens.push(removed);
    this.render();
  }

  resetSentenceTokens() {
    this.currentScrambleTokens = null;
    this.selectedScrambleTokens = [];
    this.render();
  }

  autoSolveSentence() {
    const w = this.sessionWords[this.currentSentenceIndex];
    const rawTarget = w.sentences.positive.en.trim();
    const cleanTokens = rawTarget.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);

    this.selectedScrambleTokens = [...cleanTokens];
    this.currentScrambleTokens = [];
    if (window.app) window.app.addXP(1);
    this.render();
  }

  nextSentence() {
    const totalSentenceTasks = Math.min(3, this.sessionWords.length);
    if (this.currentSentenceIndex < totalSentenceTasks - 1) {
      this.currentSentenceIndex++;
      this.currentScrambleTokens = null;
      this.selectedScrambleTokens = [];
      this.showHint = false;
      this.render();
    } else {
      this.currentStep = 2;
      this.currentQuizIndex = 0;
      this.quizScore = 0;
      this.generateQuizQuestions();
      this.render();
    }
  }

  /* =========================================================
     STEP 3: 5-QUESTION DAILY RETENTION QUIZ
     ========================================================= */
  generateQuizQuestions() {
    const list = APP_DATA.verbs || [];
    this.quizQuestions = this.sessionWords.map(w => {
      const isEnToTr = Math.random() > 0.5;
      const otherWords = list.filter(o => o.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3);

      if (isEnToTr) {
        return {
          prompt: `"${w.verb}" kelimesinin Türkçe anlamı nedir?`,
          correct: w.meaning,
          options: [w.meaning, ...otherWords.map(o => o.meaning)].sort(() => Math.random() - 0.5)
        };
      } else {
        return {
          prompt: `"${w.meaning}" anlamına gelen İngilizce kelime hangisidir?`,
          correct: w.verb,
          options: [w.verb, ...otherWords.map(o => o.verb)].sort(() => Math.random() - 0.5)
        };
      }
    });
  }

  renderStep3Quiz(container) {
    const q = this.quizQuestions[this.currentQuizIndex];
    if (!q) {
      this.currentStep = 3;
      this.render();
      return;
    }

    this.quizAnswered = false;
    const progress = ((this.currentQuizIndex + 1) / this.quizQuestions.length) * 100;

    container.innerHTML = `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:800; color:#10b981; text-transform:uppercase;">
            ADIM 3 / 3: GÜNLÜK PEKİŞTİRME SINAVI (${this.currentQuizIndex + 1} / ${this.quizQuestions.length})
          </span>
          <span class="stat-chip streak">3. Adım</span>
        </div>

        <div class="quiz-progress-bar" style="margin:8px 0 16px;">
          <div class="quiz-progress-fill" style="width: ${progress}%; background:linear-gradient(90deg, #38bdf8, #10b981);"></div>
        </div>

        <div class="quiz-question-box">
          <div style="font-size:1.2rem; font-weight:800; color:#ffffff;">${q.prompt}</div>
        </div>

        <div class="quiz-options-list">
          ${q.options.map((opt, i) => `
            <button class="quiz-opt-btn" id="routine-opt-${i}" onclick="dailyRoutine.selectQuizAnswer('${opt.replace(/'/g, "\\'")}', ${i})">
              <span><strong>${String.fromCharCode(65 + i)})</strong> ${opt}</span>
            </button>
          `).join('')}
        </div>

        <div id="routine-quiz-feedback" style="display:none; justify-content:space-between; align-items:center; margin-top:12px;">
          <div id="routine-feedback-msg" style="font-weight:700;"></div>
          <button class="btn-primary" onclick="dailyRoutine.nextQuiz()">
            ${this.currentQuizIndex === this.quizQuestions.length - 1 ? 'Sonuçları Gör ➔' : 'Sonraki Soru ▶'}
          </button>
        </div>
      </div>
    `;
  }

  selectQuizAnswer(selected, btnIdx) {
    if (this.quizAnswered) return;
    this.quizAnswered = true;

    const q = this.quizQuestions[this.currentQuizIndex];
    const isCorrect = selected === q.correct;
    const btn = document.getElementById(`routine-opt-${btnIdx}`);
    const feed = document.getElementById('routine-quiz-feedback');
    const msg = document.getElementById('routine-feedback-msg');

    if (window.app) {
      window.app.recordQuestionAnswered(isCorrect);
    }

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

  nextQuiz() {
    this.quizAnswered = false;
    this.currentQuizIndex++;
    if (this.currentQuizIndex < this.quizQuestions.length) {
      this.render();
    } else {
      this.currentStep = 3;
      this.render();
    }
  }

  /* =========================================================
     STEP 4: CELEBRATION & BONUS REWARD
     ========================================================= */
  renderStep4Celebration(container) {
    if (window.app) {
      window.app.addXP(15);
    }

    const totalXP = (this.quizScore * 3) + 15 + 6;

    container.innerHTML = `
      <div class="hero-card" style="text-align:center; padding:36px 20px; border:2px solid #10b981; box-shadow:0 0 30px rgba(16, 185, 129, 0.3);">
        <div style="font-size:4rem; animation:bounce 1s infinite alternate;">🏆</div>
        <span class="hero-badge" style="background:rgba(16, 185, 129, 0.2); color:#10b981; border-color:#10b981;">GÜNLÜK DERS BAŞARIYLA TAMAMLANDI</span>
        <h3 style="font-size:1.6rem; font-weight:900; color:#ffffff; margin-top:10px;">
          Harikasın! Günlük Rutini Bitirdin!
        </h3>
        
        <div style="display:flex; justify-content:center; gap:12px; margin:20px 0;">
          <div class="stat-chip xp" style="font-size:1.1rem; padding:10px 18px;">
            ⭐ +${totalXP} Toplam XP
          </div>
          <div class="stat-chip streak" style="font-size:1.1rem; padding:10px 18px;">
            🔥 Günlük Seri Korundu
          </div>
        </div>

        <p style="font-size:0.9rem; color:var(--text-secondary); max-width:420px; margin:0 auto 24px;">
          Bugünkü 5 kelimeyi çalıştın, SVOMPT cümlelerini kurdun ve sınavı tamamladın. Babandan ödül barajına 1 adım daha yaklaştın!
        </p>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button class="btn-secondary" onclick="app.switchTab('home')">
            🏠 Ana Sayfaya Dön
          </button>
          <button class="btn-primary" onclick="dailyRoutine.startRoutine()">
            🔄 Bir Ders Daha Yap (Yeni 5 Kelime)
          </button>
        </div>
      </div>
    `;

    speechEngine.speak("Awesome job! You have completed today's guided lesson successfully!");
  }
}

// Global instance
window.dailyRoutine = new DailyRoutineEngine();
