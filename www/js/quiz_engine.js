/**
 * Sınav & Alıştırma Arenası (Interactive Quiz Engine)
 * Generates dynamic quizzes for 158+ vocabulary, grammar rules, tense forms, and listening.
 * Balanced XP progression (+3 XP per correct answer) and Daily Progressive Goal tracking.
 */

class QuizEngine {
  constructor() {
    this.currentMode = null;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.totalQuestions = 10;
    this.answered = false;
  getWordList() {
    if (window.customWordsManager && typeof window.customWordsManager.getAllVerbsCombined === 'function') {
      return window.customWordsManager.getAllVerbsCombined();
    }
    return (window.APP_DATA && window.APP_DATA.verbs) ? window.APP_DATA.verbs : [];
  }

  renderMenu() {
    const container = document.getElementById('quiz-content-area');
    if (!container) return;

    const allWords = this.getWordList();
    const dailyGoal = window.app ? window.app.getDailyGoalTarget() : 5;
    const dailyDone = window.app ? window.app.getDailyQuestionsAnswered() : 0;
    const dailyPercent = Math.min(100, Math.round((dailyDone / dailyGoal) * 100));
    const streakDays = window.app ? window.app.streak : 1;

    container.innerHTML = `
      <div class="section-header">
        <h2>🎯 Sınav & Alıştırma Arenası</h2>
        <p>158+ Temel ve İleri Seviye Kelimeleri, SVOMPT Cümle Kurallarını ve Zamanları Test Edin</p>
      </div>

      <!-- Progressive Daily Mission Card -->
      <div class="controls-card" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(16, 185, 129, 0.2)); border: 2px solid rgba(56, 189, 248, 0.4); margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.6rem;">🔥</span>
            <div>
              <span style="font-size:0.75rem; font-weight:800; color:var(--primary); text-transform:uppercase;">GÜN ${streakDays} ZORUNLU GÖREVİ</span>
              <h4 style="font-size:1.05rem; font-weight:800; color:#ffffff; margin-top:2px;">
                Bugün En Az ${dailyGoal} Soru Çöz!
              </h4>
            </div>
          </div>
          <span class="stat-chip streak" style="font-size:0.85rem;">${dailyDone} / ${dailyGoal} Soru</span>
        </div>

        <div style="margin-top:8px;">
          <div class="quiz-progress-bar" style="height:10px;">
            <div class="quiz-progress-fill" style="width: ${dailyPercent}%; background: linear-gradient(90deg, #38bdf8, #10b981);"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-secondary); margin-top:4px;">
            <span>İlerleme: %${dailyPercent}</span>
            <span>${dailyDone >= dailyGoal ? '🎉 Bugünkü Görev Tamamlandı! (+15 Bonus XP)' : `${dailyGoal - dailyDone} soru daha çözmelisin`}</span>
          </div>
        </div>
      </div>

      <div class="quiz-modes-grid">
        <div class="quiz-type-card" onclick="quizEngine.startQuiz('vocab')">
          <div class="q-icon">🔤</div>
          <h4>158+ Kelime & Fiil Anlam Testi</h4>
          <p>A2 Temel ve B1 İleri düzey tüm kelimelerin Türkçe/İngilizce eşleştirme testi</p>
        </div>

        <div class="quiz-type-card" onclick="quizEngine.startQuiz('grammar')">
          <div class="q-icon">⚙️</div>
          <h4>Cümle Yapısı & Zamanlar</h4>
          <p>Olumlu, olumsuz ve soru yardımcı fiilleri (don't/didn't/won't/has) tamamlama</p>
        </div>

        <div class="quiz-type-card" onclick="quizEngine.startQuiz('forms')">
          <div class="q-icon">📑</div>
          <h4>V1 - V2 - V3 Çekimleri</h4>
          <p>Düzensiz fiillerin 2. ve 3. hallerini doğru seçme testi</p>
        </div>

        <div class="quiz-type-card" onclick="quizEngine.startQuiz('listening')">
          <div class="q-icon">🎧</div>
          <h4>Sesli Dinleme Testi</h4>
          <p>Seslendirilen cümleyi dinleyerek doğru anlamını bulma</p>
        </div>
      </div>

      <!-- Motivation Banner -->
      <div class="hero-card" style="margin-top:16px;">
        <span class="hero-badge">⚡ Doğru Başına +3 XP • Günlük Görev +15 XP</span>
        <h3>Düzenli Çalış, XP Topla ve Babandan Büyük Ödüle Ulaş!</h3>
        <p>Her gün artan sayıda soru çözerek serini koru, tüm kelimeleri öğrenerek son büyük efsanevi ödülün kilidini aç!</p>
      </div>
    `;
  }

  startQuiz(mode) {
    this.currentMode = mode;
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.questions = this.generateQuestions(mode);
    this.renderQuestion();
  }

  generateQuestions(mode) {
    const list = this.getWordList();
    const questions = [];
    const shuffledList = [...list].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(this.totalQuestions, shuffledList.length); i++) {
      const w = shuffledList[i];
      const otherWords = list.filter(item => item.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3);

      if (mode === 'vocab') {
        const isEnToTr = Math.random() > 0.5;
        if (isEnToTr) {
          const options = [w.meaning, ...otherWords.map(o => o.meaning)].sort(() => Math.random() - 0.5);
          questions.push({
            prompt: `"${w.verb}" (${w.typeLabel || 'Kelime'}) anlamı nedir?`,
            correctAnswer: w.meaning,
            options: options,
            type: 'vocab_en_tr'
          });
        } else {
          const options = [w.verb, ...otherWords.map(o => o.verb)].sort(() => Math.random() - 0.5);
          questions.push({
            prompt: `"${w.meaning}" anlamına gelen İngilizce kelime hangisidir?`,
            correctAnswer: w.verb,
            options: options,
            type: 'vocab_tr_en'
          });
        }
      } else if (mode === 'grammar') {
        const sentType = Math.random() > 0.5 ? 'negative' : 'question';
        const rawSentence = w.sentences[sentType].en;
        
        let blankWord = "";
        let blankSentence = rawSentence;
        const auxList = ["didn't", "don't", "doesn't", "won't", "hasn't", "haven't", "shouldn't", "cannot", "must not", "Did", "Do", "Does", "Will", "Have", "Has", "Should", "Can", "Why", "Where", "How"];
        
        for (const aux of auxList) {
          if (rawSentence.includes(aux)) {
            blankWord = aux;
            blankSentence = rawSentence.replace(aux, "_____");
            break;
          }
        }

        if (!blankWord) {
          blankWord = w.verb;
          blankSentence = rawSentence.replace(w.verb, "_____");
        }

        const fakeOptions = ["doesn't", "didn't", "won't", "haven't"].filter(f => f !== blankWord);
        fakeOptions.push(blankWord);
        const options = fakeOptions.slice(0, 4).sort(() => Math.random() - 0.5);

        questions.push({
          prompt: `Boşluğa gelebilecek en uygun yardımcı fiil/kelime hangisidir?\n\n"${blankSentence}"`,
          subPrompt: `🇹🇷 Anlamı: ${w.sentences[sentType].tr}`,
          correctAnswer: blankWord,
          options: options,
          type: 'grammar_blank'
        });
      } else if (mode === 'forms') {
        const isV2 = Math.random() > 0.5;
        const targetForm = isV2 ? (w.forms?.v2 || w.formsRow?.val2) : (w.forms?.v3 || w.formsRow?.val3);
        const formLabel = isV2 ? '2. hali (Past / V2)' : '3. hali (Past Participle / V3)';
        
        const otherForms = otherWords.map(o => isV2 ? (o.forms?.v2 || o.formsRow?.val2) : (o.forms?.v3 || o.formsRow?.val3)).filter(f => f && f !== targetForm);
        const options = [targetForm, ...otherForms.slice(0, 3)].sort(() => Math.random() - 0.5);

        questions.push({
          prompt: `"${w.verb}" (${w.meaning}) fiilinin ${formLabel} hangisidir?`,
          correctAnswer: targetForm,
          options: options,
          type: 'verb_forms'
        });
      } else if (mode === 'listening') {
        const sent = w.sentences.positive;
        const options = [sent.tr, ...otherWords.map(o => o.sentences.positive.tr)].sort(() => Math.random() - 0.5);

        questions.push({
          prompt: `Cümleyi dinleyin ve doğru Türkçe çevirisini seçin:`,
          audioText: sent.en,
          correctAnswer: sent.tr,
          options: options,
          type: 'listening'
        });
      }
    }

    return questions;
  }

  renderQuestion() {
    const container = document.getElementById('quiz-content-area');
    if (!container) return;

    const q = this.questions[this.currentIndex];
    if (!q) {
      this.renderSummary();
      return;
    }

    this.answered = false;
    const progressPercent = ((this.currentIndex + 1) / this.questions.length) * 100;

    container.innerHTML = `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="quizEngine.renderMenu()">
            ✕ Sınavdan Çık
          </button>
          <span style="font-size:0.85rem; font-weight:800; color:var(--primary);">
            Soru ${this.currentIndex + 1} / ${this.questions.length}
          </span>
          <span class="stat-chip xp">⭐ +${this.score * 3} XP</span>
        </div>

        <!-- Progress Bar -->
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <!-- Question Prompt -->
        <div class="quiz-question-box">
          <div style="white-space: pre-wrap;">${q.prompt}</div>
          ${q.subPrompt ? `<div style="font-size:0.85rem; color:var(--text-secondary); margin-top:6px;">${q.subPrompt}</div>` : ''}
          ${q.audioText ? `
            <div style="margin-top:12px;">
              <button class="btn-primary" style="padding:10px 20px; font-size:1rem;" onclick="speechEngine.speak('${q.audioText.replace(/'/g, "\\'")}')">
                🔊 Sesli Cümleyi Dinle
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Options List -->
        <div class="quiz-options-list" id="quiz-options-container">
          ${q.options.map((opt, i) => `
            <button class="quiz-opt-btn" id="opt-btn-${i}" onclick="quizEngine.selectAnswer('${opt.replace(/'/g, "\\'")}', ${i})">
              <span><strong>${String.fromCharCode(65 + i)})</strong> ${opt}</span>
              <span class="opt-icon"></span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Next Button -->
        <div id="quiz-next-container" style="display:none; justify-content:space-between; align-items:center; margin-top:10px;">
          <div id="quiz-feedback-text" style="font-weight:700;"></div>
          <button class="btn-primary" onclick="quizEngine.nextQuestion()">
            Sonraki Soru ➔
          </button>
        </div>
      </div>
    `;

    if (q.audioText) {
      setTimeout(() => speechEngine.speak(q.audioText), 300);
    }
  }

  selectAnswer(selectedOpt, btnIdx) {
    if (this.answered) return;
    this.answered = true;

    const q = this.questions[this.currentIndex];
    const isCorrect = selectedOpt === q.correctAnswer;
    const selectedBtn = document.getElementById(`opt-btn-${btnIdx}`);
    const nextContainer = document.getElementById('quiz-next-container');
    const feedbackText = document.getElementById('quiz-feedback-text');

    // Register question answered into daily progressive tracker
    if (window.app) {
      window.app.recordQuestionAnswered(isCorrect);
    }

    if (isCorrect) {
      this.score++;
      if (selectedBtn) selectedBtn.classList.add('correct');
      if (feedbackText) {
        feedbackText.style.color = 'var(--success)';
        feedbackText.textContent = '🎉 Doğru Cevap! (+3 XP)';
      }
      if (window.app) window.app.addXP(3);
    } else {
      if (selectedBtn) selectedBtn.classList.add('wrong');
      q.options.forEach((opt, idx) => {
        if (opt === q.correctAnswer) {
          const cBtn = document.getElementById(`opt-btn-${idx}`);
          if (cBtn) cBtn.classList.add('correct');
        }
      });
      if (feedbackText) {
        feedbackText.style.color = 'var(--danger)';
        feedbackText.textContent = `❌ Yanlış! Doğru cevap: ${q.correctAnswer}`;
      }
    }

    if (nextContainer) nextContainer.style.display = 'flex';
  }

  nextQuestion() {
    this.currentIndex++;
    this.renderQuestion();
  }

  renderSummary() {
    const container = document.getElementById('quiz-content-area');
    if (!container) return;

    const totalXP = this.score * 3;
    const isPerfect = this.score === this.questions.length;

    container.innerHTML = `
      <div class="quiz-arena-box" style="text-align:center; padding:32px 20px;">
        <div style="font-size:3.5rem; margin-bottom:12px;">${isPerfect ? '🏆' : '🌟'}</div>
        <h3 style="font-size:1.4rem; font-weight:800; color:#ffffff;">
          ${isPerfect ? 'Mükemmel Başarı!' : 'Tebrikler! Sınavı Tamamladınız'}
        </h3>
        
        <div style="display:flex; justify-content:center; gap:16px; margin:20px 0;">
          <div class="stat-chip xp" style="padding:10px 18px; font-size:1rem;">
            ⭐ +${totalXP} XP Kazanıldı
          </div>
          <div class="stat-chip" style="padding:10px 18px; font-size:1rem; color:var(--primary);">
            📊 ${this.score} / ${this.questions.length} Doğru
          </div>
        </div>

        <p style="font-size:0.85rem; color:var(--text-secondary); max-width:400px; margin:0 auto 20px;">
          Her gün düzenli test çözerek hedefine adım adım yaklaş ve babandan büyük ödülü kazan!
        </p>

        <div style="display:flex; justify-content:center; gap:12px;">
          <button class="btn-secondary" onclick="quizEngine.renderMenu()">
            📋 Menüye Dön
          </button>
          <button class="btn-primary" onclick="quizEngine.startQuiz('${this.currentMode}')">
            🔄 Tekrar Çöz
          </button>
        </div>
      </div>
    `;
  }
}

// Global instance
window.quizEngine = new QuizEngine();
