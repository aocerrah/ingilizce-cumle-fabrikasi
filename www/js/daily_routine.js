/**
 * Akıllı Günlük Çalışma Rutini & Zorunlu Ders Akışı (Daily Routine Engine)
 * Sıralı Öğrenme Yolu:
 * 1. Adım: 🎥 Günün YouTube Video Dersi (Konu Anlatımı)
 * 2. Adım: 📚 Günün 5 Kritik Fiili (Kelime & Çekim Kartları)
 * 3. Adım: 🧩 SVOMPT Cümle Kurma & Cümle Fabrikası Ödevi
 * 4. Adım: 🎯 Günlük Pekiştirme Sınavı (Mini Test)
 * 5. Adım: 🏆 Başarı Kutlaması & Babandan Ödül Vaadi İlerlemesi
 */

class DailyRoutineEngine {
  constructor() {
    this.isActive = false;
    this.currentStep = 0; // 0: Video, 1: Vocab, 2: Sentence, 3: Quiz, 4: Completed
    this.sessionWords = [];
    this.sessionVideo = null;
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
    this.currentStep = 0; // Starts with Video Lesson
    this.currentVocabIndex = 0;
    this.currentSentenceIndex = 0;
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
    this.selectedScrambleTokens = [];
    this.showHint = false;

    // Pick 5 smart words for today
    this.sessionWords = this.pickSmartWords(5);

    // Pick today's featured video lesson based on streak/day
    const allVideos = window.grammarView ? window.grammarView.getAllVideos() : [];
    const streak = (window.app ? window.app.streak : 1) - 1;
    this.sessionVideo = allVideos[streak % allVideos.length] || allVideos[0];

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
      this.renderStep0Video(container);
    } else if (this.currentStep === 1) {
      this.renderStep1Vocab(container);
    } else if (this.currentStep === 2) {
      this.renderStep2Sentence(container);
    } else if (this.currentStep === 3) {
      this.renderStep3Quiz(container);
    } else if (this.currentStep === 4) {
      this.renderStep4Celebration(container);
    }
  }

  renderIntro(container) {
    const streak = window.app ? window.app.streak : 1;

    container.innerHTML = `
      <div class="hero-card" style="text-align:center; padding:32px 20px; border: 2px solid var(--primary); box-shadow: var(--shadow-glow);">
        <div style="font-size:3.5rem; margin-bottom:8px;">🎓</div>
        <span class="hero-badge" style="background:linear-gradient(135deg, #ef4444, #f59e0b);">GÜNLÜK ZORUNLU ÖĞRENME YOLU</span>
        <h3 style="font-size:1.4rem; font-weight:800; color:#ffffff; margin-top:8px;">
          Günün Adım Adım İngilizce Dersi
        </h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); max-width:440px; margin:8px auto 20px; line-height:1.5;">
          Önce Türkçe video dersi izle, ardından günün 5 fiilini öğren, SVOMPT cümlelerini kur ve mini test ile günün ödülünü kazan!
        </p>

        <!-- 4 Steps Roadmap Card -->
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; max-width:480px; margin:0 auto 24px; text-align:center;">
          <div style="background:var(--bg-surface); padding:10px 4px; border-radius:var(--radius-md); border:1px solid rgba(239,68,68,0.4);">
            <div style="font-size:1.3rem;">🎥</div>
            <div style="font-size:0.72rem; font-weight:800; color:#ef4444; margin-top:3px;">1. Video Ders</div>
          </div>
          <div style="background:var(--bg-surface); padding:10px 4px; border-radius:var(--radius-md); border:1px solid rgba(56,189,248,0.4);">
            <div style="font-size:1.3rem;">📚</div>
            <div style="font-size:0.72rem; font-weight:800; color:var(--primary); margin-top:3px;">2. Kelimeler</div>
          </div>
          <div style="background:var(--bg-surface); padding:10px 4px; border-radius:var(--radius-md); border:1px solid rgba(129,140,248,0.4);">
            <div style="font-size:1.3rem;">🧩</div>
            <div style="font-size:0.72rem; font-weight:800; color:var(--accent); margin-top:3px;">3. Cümle Kur</div>
          </div>
          <div style="background:var(--bg-surface); padding:10px 4px; border-radius:var(--radius-md); border:1px solid rgba(34,197,94,0.4);">
            <div style="font-size:1.3rem;">🎯</div>
            <div style="font-size:0.72rem; font-weight:800; color:var(--success); margin-top:3px;">4. Mini Test</div>
          </div>
        </div>

        <button class="btn-primary" style="padding:14px 28px; font-size:1.1rem; width:100%; max-width:320px; margin:0 auto; justify-content:center; box-shadow: 0 4px 20px var(--primary-glow);" onclick="dailyRoutine.startRoutine()">
          🚀 1. Adım: Video Dersi Başlat (10 Dk)
        </button>
      </div>
    `;
  }

  /* =========================================================
     STEP 0: 🎥 FEATURED YOUTUBE VIDEO LESSON
     ========================================================= */
  renderStep0Video(container) {
    const vid = this.sessionVideo || {
      title: "Simple Present Tense & Cümle Dizilimi",
      description: "Geniş zaman kuralları, Do/Does soru yapıları ve SVOMPT dizilimi.",
      video_id: "0m0Tp1_N3bs",
      topic: "Simple Present Tense"
    };

    container.innerHTML = `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:800; color:#ef4444; text-transform:uppercase; background:rgba(239,68,68,0.15); padding:3px 8px; border-radius:6px;">
            ADIM 1 / 4: GÜNÜN VİDEO EĞİTİMİ
          </span>
          <span class="stat-chip xp">⭐ +25 XP</span>
        </div>

        <!-- Video Spotlight Card -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border: 2px solid #ef4444; border-radius:var(--radius-lg); padding:18px; margin:14px 0; text-align:left;">
          <span class="stat-chip streak" style="font-size:0.75rem; margin-bottom:8px;">🎥 TÜRKÇE ANLATIMLI DERS</span>
          <h3 style="font-size:1.2rem; font-weight:900; color:#ffffff; margin:6px 0;">${vid.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; margin-bottom:14px;">${vid.description}</p>

          <!-- Interactive Embedded Player -->
          <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; margin-bottom:14px; border:1px solid rgba(255,255,255,0.15);">
            <iframe src="https://www.youtube.com/embed/${vid.video_id}?rel=0" 
                    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
            </iframe>
          </div>

          <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:10px 14px; font-size:0.82rem; color:#cbd5e1; margin-bottom:14px;">
            <strong style="color:#ef4444;">💡 İpucu:</strong> Videoyu dikkatlice izledikten sonra bir sonraki adımdaki kelime ve cümle kurma ödevlerine geçebilirsiniz!
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <a href="https://www.youtube.com/watch?v=${vid.video_id}" target="_blank" style="color:var(--primary); font-size:0.82rem; font-weight:700; text-decoration:none;">
              🌐 YouTube'da Aç ↗
            </a>
            <button class="btn-primary" style="background:#ef4444; padding:10px 20px; font-size:0.9rem;" onclick="dailyRoutine.completeVideoStep()">
              ✅ Dersi İzledim, 2. Adıma Geç (Kelimeler) ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  completeVideoStep() {
    if (this.sessionVideo && window.grammarView) {
      window.grammarView.markVideoWatched(this.sessionVideo.video_id);
    }
    this.currentStep = 1;
    this.currentVocabIndex = 0;
    this.render();
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
          <span style="font-size:0.8rem; font-weight:800; color:var(--primary); text-transform:uppercase; background:rgba(56,189,248,0.15); padding:3px 8px; border-radius:6px;">
            ADIM 2 / 4: GÜNÜN KELİMELERİ (${this.currentVocabIndex + 1} / ${this.sessionWords.length})
          </span>
          <span class="stat-chip streak">2. Adım</span>
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
            ${this.currentVocabIndex === this.sessionWords.length - 1 ? 'Adım 3: Cümle Fabrikasına Geç ➔' : 'Sonraki Kelime ▶'}
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
      this.currentStep = 2; // Move to Sentence building
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
    const cleanTokens = rawTarget.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
    const targetCleanString = cleanTokens.join(' ').toLowerCase();

    if (!this.currentScrambleTokens) {
      this.currentScrambleTokens = [...cleanTokens].sort(() => Math.random() - 0.5);
      this.selectedScrambleTokens = [];
      this.showHint = false;
    }

    const currentSelectedString = this.selectedScrambleTokens.join(' ').toLowerCase();
    const isAllPlaced = this.currentScrambleTokens.length === 0;
    const isCorrect = currentSelectedString === targetCleanString;
    const isWrong = isAllPlaced && !isCorrect;

    const svomptExplanation = this.generateSVOMPTBreakdown(w, rawTarget);

    container.innerHTML = `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:800; color:var(--accent); text-transform:uppercase; background:rgba(129,140,248,0.15); padding:3px 8px; border-radius:6px;">
            ADIM 3 / 4: CÜMLE FABRİKASI (${this.currentSentenceIndex + 1} / ${totalSentenceTasks})
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
            Aşağıdaki kelimelere dokunarak <strong>Özne ➔ Fiil ➔ Nesne ➔ Durum ➔ Yer ➔ Zaman</strong> kuralına göre dizin:
          </p>
        </div>

        <!-- SVOMPT Rule Guide Banner -->
        ${this.showHint ? `
          <div style="background: rgba(129, 140, 248, 0.15); border: 1px solid rgba(129, 140, 248, 0.4); border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px; font-size:0.82rem;">
            <strong style="color:var(--accent);">📐 SVOMPT Formülü:</strong> 
            <div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:4px;">
              <span style="background:var(--color-s-bg); color:var(--color-s); padding:2px 6px; border-radius:4px;">1. Özne (Kim?)</span>
              <span style="background:var(--color-v-bg); color:var(--color-v); padding:2px 6px; border-radius:4px;">2. Fiil (Ne yapar?)</span>
              <span style="background:var(--color-o-bg); color:var(--color-o); padding:2px 6px; border-radius:4px;">3. Nesne (Neyi?)</span>
              <span style="background:var(--color-m-bg); color:var(--color-m); padding:2px 6px; border-radius:4px;">4. Durum (Nasıl?)</span>
              <span style="background:var(--color-p-bg); color:var(--color-p); padding:2px 6px; border-radius:4px;">5. Yer (Nerede?)</span>
              <span style="background:var(--color-t-bg); color:var(--color-t); padding:2px 6px; border-radius:4px;">6. Zaman (Ne zaman?)</span>
            </div>
          </div>
        ` : ''}

        <!-- Selected Placement Area -->
        <div style="min-height:60px; background:rgba(15, 23, 42, 0.85); border:2px dashed ${isCorrect ? 'var(--success)' : (isWrong ? 'var(--danger)' : 'var(--border-subtle)')}; border-radius:var(--radius-md); padding:10px 14px; display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:12px;">
          ${this.selectedScrambleTokens.length === 0 ? '<span style="color:var(--text-muted); font-size:0.85rem;">👇 Aşağıdaki kelimelere dokunun...</span>' : ''}
          ${this.selectedScrambleTokens.map((tok, idx) => `
            <button class="token-chip" style="background:${isCorrect ? 'var(--success)' : (isWrong ? 'var(--danger)' : 'var(--accent)')}; color:#ffffff;" onclick="dailyRoutine.unselectToken(${idx})">
              ${tok} ✕
            </button>
          `).join('')}
        </div>

        <!-- Available Token Bank -->
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; min-height:40px;">
          ${this.currentScrambleTokens.map((tok, idx) => `
            <button class="token-chip" style="font-size:0.95rem; padding:8px 14px;" onclick="dailyRoutine.selectToken('${tok.replace(/'/g, "\\'")}', ${idx})">
              ${tok}
            </button>
          `).join('')}
        </div>

        <!-- SUCCESS STATE -->
        ${isCorrect ? `
          <div style="background:rgba(34, 197, 94, 0.15); border:2px solid var(--success); padding:14px; border-radius:var(--radius-md); margin-bottom:14px; animation: slideDownToast 0.3s ease;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-weight:900; font-size:1.05rem; color:var(--success);">🎉 MÜKEMMEL! CÜMLE DOĞRU KURULDU (+3 XP)</div>
              <button class="play-voice-btn" onclick="speechEngine.speak('${rawTarget.replace(/'/g, "\\'")}')">🔊 Dinle</button>
            </div>
            <div style="font-size:0.9rem; color:#ffffff; margin-top:6px; font-weight:700;">
              🇬🇧 "${rawTarget}"
            </div>
            ${svomptExplanation}
          </div>
        ` : ''}

        <!-- WRONG ORDER PEDAGOGICAL FEEDBACK STATE -->
        ${isWrong ? `
          <div style="background:rgba(239, 68, 68, 0.15); border:2px solid var(--danger); padding:14px; border-radius:var(--radius-md); margin-bottom:14px; animation: slideDownToast 0.3s ease;">
            <div style="font-weight:900; color:var(--danger); font-size:1rem;">
              ❌ Sıralama Hatası! Kelimeler Yanlış Dizildi
            </div>
            <p style="font-size:0.82rem; color:#cbd5e1; margin:8px 0;">
              İngilizce mantığında yardımcı kelimeler ve edatlar niteledikleri ögelerin hemen önüne gelir:
            </p>
            ${svomptExplanation}
            <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
              <button class="btn-secondary" style="background:var(--danger-bg); color:var(--danger); border-color:var(--danger); font-size:0.82rem;" onclick="dailyRoutine.resetScrambleTokens()">
                🔄 Sıfırla ve Tekrar Dene
              </button>
              <button class="btn-primary" style="background:var(--primary); font-size:0.82rem;" onclick="dailyRoutine.autoSolveScramble()">
                ✨ Doğru Dizilimi Göster & Öğren
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display:flex; justify-content:space-between; gap:10px; margin-top:8px;">
          <button class="btn-secondary" onclick="dailyRoutine.resetScrambleTokens()">
            🗑️ Sıfırla
          </button>
          <button class="btn-primary" ${!isCorrect ? 'disabled style="opacity:0.5;"' : ''} onclick="dailyRoutine.nextSentence()">
            ${this.currentSentenceIndex === totalSentenceTasks - 1 ? 'Adım 4: Günün Sınavına Geç ➔' : 'Sonraki Cümle ▶'}
          </button>
        </div>
      </div>
    `;

    if (isCorrect && !this.currentSentenceSolved) {
      this.currentSentenceSolved = true;
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
    this.render();
  }

  selectToken(tok, idx) {
    this.selectedScrambleTokens.push(tok);
    this.currentScrambleTokens.splice(idx, 1);
    this.render();
  }

  unselectToken(idx) {
    const removed = this.selectedScrambleTokens.splice(idx, 1)[0];
    this.currentScrambleTokens.push(removed);
    this.render();
  }

  resetScrambleTokens() {
    const w = this.sessionWords[this.currentSentenceIndex];
    const sentence = w.sentences.positive.en;
    const tokens = sentence.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
    this.currentScrambleTokens = [...tokens].sort(() => Math.random() - 0.5);
    this.selectedScrambleTokens = [];
    this.currentSentenceSolved = false;
    this.render();
  }

  autoSolveScramble() {
    const w = this.sessionWords[this.currentSentenceIndex];
    const sentence = w.sentences.positive.en;
    const tokens = sentence.replace(/[.,]/g, '').split(/\s+/).filter(t => t.length > 0);
    this.selectedScrambleTokens = [...tokens];
    this.currentScrambleTokens = [];
    this.render();
  }

  nextSentence() {
    const totalSentenceTasks = Math.min(3, this.sessionWords.length);
    if (this.currentSentenceIndex < totalSentenceTasks - 1) {
      this.currentSentenceIndex++;
      this.currentScrambleTokens = null;
      this.selectedScrambleTokens = [];
      this.currentSentenceSolved = false;
      this.showHint = false;
      this.render();
    } else {
      this.currentStep = 3; // Move to Quiz
      this.currentQuizIndex = 0;
      this.quizScore = 0;
      this.quizAnswered = false;
      this.render();
    }
  }

  /* =========================================================
     STEP 3: 5 SMART QUIZ QUESTIONS
     ========================================================= */
  renderStep3Quiz(container) {
    const currentWord = this.sessionWords[this.currentQuizIndex];
    const allVerbs = APP_DATA.verbs || [];
    
    // Distractors
    const otherVerbs = allVerbs.filter(v => v.id !== currentWord.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [currentWord, ...otherVerbs].sort(() => Math.random() - 0.5);

    const progress = ((this.currentQuizIndex + 1) / this.sessionWords.length) * 100;

    container.innerHTML = `
      <div class="quiz-arena-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:800; color:var(--success); text-transform:uppercase; background:rgba(34,197,94,0.15); padding:3px 8px; border-radius:6px;">
            ADIM 4 / 4: GÜNLÜK PEKİŞTİRME SINAVI (${this.currentQuizIndex + 1} / ${this.sessionWords.length})
          </span>
          <span class="stat-chip xp">⭐ Skor: ${this.quizScore}</span>
        </div>

        <div class="quiz-progress-bar" style="margin:8px 0 16px;">
          <div class="quiz-progress-fill" style="width: ${progress}%;"></div>
        </div>

        <div class="quiz-question-card" style="text-align:center; padding:20px;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--primary); text-transform:uppercase;">Bu Fiilin Türkçe Anlamı Nedir?</span>
          <div style="font-size:2.2rem; font-weight:900; color:#ffffff; margin:8px 0;">${currentWord.verb}</div>
          <p style="font-size:0.82rem; color:var(--text-secondary);">Doğru seçeneğe dokunun:</p>
        </div>

        <div class="quiz-options-list" style="margin-top:14px;">
          ${options.map(opt => `
            <button class="quiz-opt-btn" id="opt-btn-${opt.id}" onclick="dailyRoutine.answerQuiz(${opt.id}, ${currentWord.id})">
              <span>${opt.meaning}</span>
            </button>
          `).join('')}
        </div>

        <div id="quiz-feedback-box" style="margin-top:14px; min-height:40px;"></div>
      </div>
    `;
  }

  answerQuiz(selectedId, correctId) {
    if (this.quizAnswered) return;
    this.quizAnswered = true;

    const isCorrect = selectedId === correctId;
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const selectedBtn = document.getElementById(`opt-btn-${selectedId}`);
    const correctBtn = document.getElementById(`opt-btn-${correctId}`);

    if (selectedBtn) {
      selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    if (correctBtn && !isCorrect) {
      correctBtn.classList.add('correct');
    }

    if (isCorrect) {
      this.quizScore += 5;
      if (window.app) {
        window.app.addXP(5);
        window.app.recordQuestionAnswered(true);
      }
      if (feedbackBox) {
        feedbackBox.innerHTML = `
          <div style="background:rgba(34, 197, 94, 0.15); border:1px solid var(--success); color:var(--success); padding:10px 14px; border-radius:var(--radius-md); font-weight:700; font-size:0.9rem;">
            🎉 Harika! Doğru Cevap (+5 XP)
          </div>
        `;
      }
    } else {
      if (window.app) {
        window.app.recordQuestionAnswered(false);
      }
      if (feedbackBox) {
        feedbackBox.innerHTML = `
          <div style="background:rgba(239, 68, 68, 0.15); border:1px solid var(--danger); color:var(--danger); padding:10px 14px; border-radius:var(--radius-md); font-weight:700; font-size:0.9rem;">
            ❌ Yanlış! Doğru cevap yukarıda yeşille işaretlendi.
          </div>
        `;
      }
    }

    setTimeout(() => {
      if (this.currentQuizIndex < this.sessionWords.length - 1) {
        this.currentQuizIndex++;
        this.quizAnswered = false;
        this.render();
      } else {
        this.currentStep = 4; // Move to Celebration
        this.render();
      }
    }, 1200);
  }

  /* =========================================================
     STEP 4: CELEBRATION & XP REWARD
     ========================================================= */
  renderStep4Celebration(container) {
    const earnedXP = 25 + 15 + this.quizScore; // Video (25) + Sentences (15) + Quiz

    container.innerHTML = `
      <div class="hero-card" style="text-align:center; padding:32px 20px; border:2px solid var(--success); box-shadow:0 0 35px rgba(34, 197, 94, 0.35);">
        <div style="font-size:4rem; animation: bounce 1s infinite alternate;">🏆</div>
        <span class="hero-badge" style="background:rgba(34, 197, 94, 0.2); color:var(--success);">TEBRİKLER! GÜNLÜK DERS TAMAMLANDI</span>
        <h3 style="font-size:1.5rem; font-weight:900; color:#ffffff; margin-top:8px;">
          Günün Tüm Hedeflerini Başarıyla Bitirdin!
        </h3>
        
        <div style="display:flex; justify-content:center; gap:12px; margin:16px 0;">
          <div style="background:var(--bg-surface); padding:12px 18px; border-radius:var(--radius-md); border:1px solid rgba(245,158,11,0.4);">
            <div style="font-size:1.4rem; font-weight:900; color:#f59e0b;">+${earnedXP} XP</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Kazanılan Puan</div>
          </div>
          <div style="background:var(--bg-surface); padding:12px 18px; border-radius:var(--radius-md); border:1px solid rgba(239,68,68,0.4);">
            <div style="font-size:1.4rem; font-weight:900; color:#ef4444;">${window.app ? window.app.streak : 1} Gün 🔥</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Günlük Seri</div>
          </div>
        </div>

        <p style="font-size:0.85rem; color:var(--text-secondary); max-width:400px; margin:0 auto 20px;">
          Video dersi izledin, 5 fiili çalıştın, SVOMPT cümlelerini kurdun ve mini sınavı başarıyla tamamladın. Babandan ödül hedefine bir adım daha yaklaştın! 🌟
        </p>

        <div style="display:flex; flex-direction:column; gap:8px; max-width:320px; margin:0 auto;">
          <button class="btn-primary" style="justify-content:center; padding:12px 20px; font-size:1rem;" onclick="app.switchTab('home')">
            🏠 Ana Sayfaya Dön
          </button>
          <button class="btn-secondary" style="justify-content:center; padding:10px 20px; font-size:0.85rem;" onclick="app.switchTab('builder')">
            🧩 Cümle Fabrikasında Serbest Pratik Yap
          </button>
        </div>
      </div>
    `;
  }
}

// Global instance
window.dailyRoutine = new DailyRoutineEngine();
