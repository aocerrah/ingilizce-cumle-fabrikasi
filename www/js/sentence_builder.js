/**
 * SVOMPT Studio & Cümle Sıralama Oyunu (Sentence Builder)
 * Interactive sentence building, color-coded SVOMPT tokens, 20+ Grammar Tenses & Modals, dynamic conjugations, and Turkish translations.
 */

class SentenceBuilder {
  constructor() {
    this.currentMode = 'studio'; // 'studio' | 'scramble'

    // Studio Selection State
    this.selectedType = 'pos'; // 'pos' | 'neg' | 'que'
    this.selectedTense = 'present_simple';
    this.selectedSubject = 'She';
    this.selectedVerbKey = 'play';
    this.selectedObject = 'the VR headsets and sensors';
    this.selectedManner = 'regularly';
    this.selectedPlace = 'in the sports laboratory';
    this.selectedTime = 'every day';

    // Scramble Game State
    this.scrambleVerb = null;
    this.scrambleSentenceType = 'positive';
    this.scrambleTokens = [];
    this.selectedTokens = [];
    this.scrambleScore = 0;
    this.isScrambleSolved = false;
    this.showHint = false;

    // Rich Preset Data for Interactive Building
    this.subjects = [
      { en: 'I', tr: 'Ben', person: '1s' },
      { en: 'You', tr: 'Sen / Siz', person: '2s' },
      { en: 'He', tr: 'O (Erkek)', person: '3s' },
      { en: 'She', tr: 'O (Kadın)', person: '3s' },
      { en: 'We', tr: 'Biz', person: '1p' },
      { en: 'They', tr: 'Onlar', person: '3p' },
      { en: 'The coach', tr: 'Antrenör', person: '3s' },
      { en: 'Athletes', tr: 'Sporcular', person: '3p' },
      { en: 'Students', tr: 'Öğrenciler', person: '3p' },
      { en: 'The researcher', tr: 'Araştırmacı', person: '3s' },
      { en: 'Ela and Leo', tr: 'Ela ve Leo', person: '3p' },
      { en: 'The teacher', tr: 'Öğretmen', person: '3s' },
      { en: 'Doctors', tr: 'Doktorlar', person: '3p' }
    ];

    this.verbs = [
      { key: 'play', en: 'play', tr: 'oynamak', v_s: 'plays', v2: 'played', v3: 'played', v_ing: 'playing', tr_stem: 'oyna', icon: '🎮' },
      { key: 'study', en: 'study', tr: 'çalışmak / incelemek', v_s: 'studies', v2: 'studied', v3: 'studied', v_ing: 'studying', tr_stem: 'incele', icon: '📖' },
      { key: 'analyze', en: 'analyze', tr: 'analiz etmek', v_s: 'analyzes', v2: 'analyzed', v3: 'analyzed', v_ing: 'analyzing', tr_stem: 'analiz et', icon: '🔬' },
      { key: 'use', en: 'use', tr: 'kullanmak', v_s: 'uses', v2: 'used', v3: 'used', v_ing: 'using', tr_stem: 'kullan', icon: '💻' },
      { key: 'create', en: 'create', tr: 'oluşturmak', v_s: 'creates', v2: 'created', v3: 'created', v_ing: 'creating', tr_stem: 'oluştur', icon: '✨' },
      { key: 'develop', en: 'develop', tr: 'geliştirmek', v_s: 'develops', v2: 'developed', v3: 'developed', v_ing: 'developing', tr_stem: 'geliştir', icon: '🚀' },
      { key: 'watch', en: 'watch', tr: 'izlemek', v_s: 'watches', v2: 'watched', v3: 'watched', v_ing: 'watching', tr_stem: 'izle', icon: '👁️' },
      { key: 'test', en: 'test', tr: 'test etmek', v_s: 'tests', v2: 'tested', v3: 'tested', v_ing: 'testing', tr_stem: 'test et', icon: '🧪' },
      { key: 'learn', en: 'learn', tr: 'öğrenmek', v_s: 'learns', v2: 'learned', v3: 'learned', v_ing: 'learning', tr_stem: 'öğren', icon: '🎓' },
      { key: 'explore', en: 'explore', tr: 'keşfetmek', v_s: 'explores', v2: 'explored', v3: 'explored', v_ing: 'exploring', tr_stem: 'keşfet', icon: '🧭' },
      { key: 'practice', en: 'practice', tr: 'pratik yapmak', v_s: 'practices', v2: 'practiced', v3: 'practiced', v_ing: 'practicing', tr_stem: 'pratik yap', icon: '⚽' },
      { key: 'build', en: 'build', tr: 'inşa etmek', v_s: 'builds', v2: 'built', v3: 'built', v_ing: 'building', tr_stem: 'inşa et', icon: '🏗️' },
      { key: 'write', en: 'write', tr: 'yazmak', v_s: 'writes', v2: 'wrote', v3: 'written', v_ing: 'writing', tr_stem: 'yaz', icon: '✍️' },
      { key: 'read', en: 'read', tr: 'okumak', v_s: 'reads', v2: 'read', v3: 'read', v_ing: 'reading', tr_stem: 'oku', icon: '📚' },
      { key: 'listen', en: 'listen to', tr: 'dinlemek', v_s: 'listens to', v2: 'listened to', v3: 'listened to', v_ing: 'listening to', tr_stem: 'dinle', icon: '🎧' },
      { key: 'visit', en: 'visit', tr: 'ziyaret etmek', v_s: 'visits', v2: 'visited', v3: 'visited', v_ing: 'visiting', tr_stem: 'ziyaret et', icon: '🏛️' },
      { key: 'help', en: 'help', tr: 'yardım etmek', v_s: 'helps', v2: 'helped', v3: 'helped', v_ing: 'helping', tr_stem: 'yardım et', icon: '🤝' },
      { key: 'solve', en: 'solve', tr: 'çözmek', v_s: 'solves', v2: 'solved', v3: 'solved', v_ing: 'solving', tr_stem: 'çöz', icon: '🧩' }
    ];

    this.objects = [
      { en: 'the VR headsets and sensors', tr: 'VR başlıklarını ve sensörleri' },
      { en: 'the match data', tr: 'maç verilerini' },
      { en: 'English grammar', tr: 'İngilizce grameri' },
      { en: 'a new strategy', tr: 'yeni bir stratejiyi' },
      { en: 'the football tactics', tr: 'futbol taktiklerini' },
      { en: 'the project', tr: 'projeyi' },
      { en: 'the code', tr: 'kodları' },
      { en: 'a book', tr: 'bir kitabı' },
      { en: 'their skills', tr: 'yeteneklerini' },
      { en: 'healthy food', tr: 'sağlıklı yemekleri' },
      { en: 'the lesson', tr: 'dersi' },
      { en: 'a mystery', tr: 'bir gizemi' },
      { en: '', tr: '', label: '(Yok / Belirtilmemiş)' }
    ];

    this.manners = [
      { en: 'regularly', tr: 'düzenli olarak' },
      { en: 'carefully', tr: 'dikkatlice' },
      { en: 'fluently', tr: 'akıcı bir şekilde' },
      { en: 'with passion', tr: 'tutkuyla' },
      { en: 'successfully', tr: 'başarıyla' },
      { en: 'together', tr: 'birlikte' },
      { en: 'fast', tr: 'hızlıca' },
      { en: 'easily', tr: 'kolayca' },
      { en: 'happily', tr: 'mutlulukla' },
      { en: 'quietly', tr: 'sessizce' },
      { en: '', tr: '', label: '(Yok / Belirtilmemiş)' }
    ];

    this.places = [
      { en: 'in the sports laboratory', tr: 'spor laboratuvarında' },
      { en: 'at the stadium', tr: 'stadyumda' },
      { en: 'at school', tr: 'okulda' },
      { en: 'in the classroom', tr: 'sınıfta' },
      { en: 'at home', tr: 'evde' },
      { en: 'in the library', tr: 'kütüphanede' },
      { en: 'online', tr: 'çevrim içi' },
      { en: 'in the academy', tr: 'akademide' },
      { en: 'in the park', tr: 'parkta' },
      { en: '', tr: '', label: '(Yok / Belirtilmemiş)' }
    ];

    this.times = [
      { en: 'every day', tr: 'her gün', suitableTense: 'present_simple' },
      { en: 'yesterday', tr: 'dün', suitableTense: 'past_simple' },
      { en: 'tomorrow', tr: 'yarın', suitableTense: 'future_will' },
      { en: 'now', tr: 'şimdi', suitableTense: 'present_continuous' },
      { en: 'at the moment', tr: 'şu anda', suitableTense: 'present_continuous' },
      { en: 'at the weekend', tr: 'hafta sonu', suitableTense: 'present_simple' },
      { en: 'in the morning', tr: 'sabahları', suitableTense: 'present_simple' },
      { en: 'this week', tr: 'bu hafta', suitableTense: 'present_simple' },
      { en: 'last night', tr: 'dün gece', suitableTense: 'past_simple' },
      { en: 'two days ago', tr: 'iki gün önce', suitableTense: 'past_simple' },
      { en: 'soon', tr: 'yakında', suitableTense: 'future_will' },
      { en: '', tr: '', label: '(Yok / Belirtilmemiş)' }
    ];
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
     1. INTERACTIVE SVOMPT STUDIO MODE
     ========================================================= */
  renderStudio() {
    const container = document.getElementById('builder-content-area');
    if (!container) return;

    // Generate current sentence & translation
    const sentenceData = this.generateSentenceData();

    container.innerHTML = `
      <!-- SVOMPT Legend Pills -->
      <div class="svompt-legend">
        <span class="legend-pill pill-s" style="color:#f59e0b; border-color:rgba(245,158,11,0.4); background:rgba(245,158,11,0.15);">🟨 S (Özne)</span>
        <span class="legend-pill pill-v" style="color:#38bdf8; border-color:rgba(56,189,248,0.4); background:rgba(56,189,248,0.15);">🟦 V (Fiil & Zaman)</span>
        <span class="legend-pill pill-o" style="color:#34d399; border-color:rgba(52,211,153,0.4); background:rgba(16,185,129,0.15);">🟩 O (Nesne)</span>
        <span class="legend-pill pill-m" style="color:#c084fc; border-color:rgba(192,132,252,0.4); background:rgba(168,85,247,0.15);">🟪 M (Durum/Tarz)</span>
        <span class="legend-pill pill-p" style="color:#f472b6; border-color:rgba(244,114,182,0.4); background:rgba(236,72,153,0.15);">🟧 P (Yer)</span>
        <span class="legend-pill pill-t" style="color:#fb7185; border-color:rgba(251,113,133,0.4); background:rgba(239,68,68,0.15);">🟥 T (Zaman)</span>
      </div>

      <!-- Controls Card (Sentence Form & Extended Tense Selector) -->
      <div class="controls-card">
        <div class="form-row">
          <label>CÜMLE TÜRÜ (SENTENCE FORM)</label>
          <div class="type-buttons-group">
            <button class="type-btn ${this.selectedType === 'pos' ? 'active' : ''}" data-type="positive" onclick="sentenceBuilder.setType('pos')">
              ✅ Olumlu (+)
            </button>
            <button class="type-btn ${this.selectedType === 'neg' ? 'active' : ''}" data-type="negative" onclick="sentenceBuilder.setType('neg')">
              ❌ Olumsuz (-)
            </button>
            <button class="type-btn ${this.selectedType === 'que' ? 'active' : ''}" data-type="question" onclick="sentenceBuilder.setType('que')">
              ❓ Soru (?)
            </button>
          </div>
        </div>

        <div class="form-row" style="margin-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:4px;">
            <label style="margin:0;">ZAMAN / KİP YAPISI (20+ TENSES, ASPECTS & MODALS)</label>
            <button class="cat-chip" style="font-size:0.75rem; border-color:#ef4444; color:#ef4444; background:rgba(239,68,68,0.15); cursor:pointer; display:inline-flex; align-items:center; gap:4px; padding:3px 8px; font-weight:700;" 
                    onclick="sentenceBuilder.watchTenseVideo()">
              🎥 Bu Konunun Video Dersini İzle (+25 XP)
            </button>
          </div>
          <select class="select-input" id="builder-tense-select" onchange="sentenceBuilder.setTense(this.value)" style="font-weight:600;">
            <optgroup label="--- 📅 GÜNCEL ZAMANLAR (PRESENT TENSES) ---">
              <option value="present_simple" ${this.selectedTense === 'present_simple' ? 'selected' : ''}>Simple Present (Geniş Zaman / Rutinler - V1/Vs)</option>
              <option value="present_continuous" ${this.selectedTense === 'present_continuous' ? 'selected' : ''}>Present Continuous (Şimdiki Zaman - am/is/are + V-ing)</option>
              <option value="present_perfect" ${this.selectedTense === 'present_perfect' ? 'selected' : ''}>Present Perfect (Yakın Geçmiş / Etkisi Süren - have/has + V3)</option>
              <option value="present_perfect_continuous" ${this.selectedTense === 'present_perfect_continuous' ? 'selected' : ''}>Present Perfect Continuous (Süregelen Zaman - have been + V-ing)</option>
            </optgroup>

            <optgroup label="--- ⏳ GEÇMİŞ ZAMANLAR (PAST TENSES) ---">
              <option value="past_simple" ${this.selectedTense === 'past_simple' ? 'selected' : ''}>Simple Past (Geçmiş Zaman - V2 / Did)</option>
              <option value="past_continuous" ${this.selectedTense === 'past_continuous' ? 'selected' : ''}>Past Continuous (Geçmişte Süregelen - was/were + V-ing)</option>
              <option value="past_perfect" ${this.selectedTense === 'past_perfect' ? 'selected' : ''}>Past Perfect (Önceki Geçmiş Zaman - had + V3 / -mişti)</option>
              <option value="used_to" ${this.selectedTense === 'used_to' ? 'selected' : ''}>Used to (Eski Alışkanlık / Eskiden Yapardı)</option>
            </optgroup>

            <optgroup label="--- 🔮 GELECEK ZAMANLAR (FUTURE TENSES) ---">
              <option value="future_will" ${this.selectedTense === 'future_will' ? 'selected' : ''}>Future Simple (Gelecek Zaman - will + V1)</option>
              <option value="future_going_to" ${this.selectedTense === 'future_going_to' ? 'selected' : ''}>Be Going To (Planlı Gelecek Zaman - is/are going to + V1)</option>
              <option value="future_continuous" ${this.selectedTense === 'future_continuous' ? 'selected' : ''}>Future Continuous (Gelecekte Yapıyor Olacak - will be + V-ing)</option>
              <option value="future_perfect" ${this.selectedTense === 'future_perfect' ? 'selected' : ''}>Future Perfect (Gelecekte Tamamlanmış - will have + V3)</option>
            </optgroup>

            <optgroup label="--- 💡 KİPLER & MODALLAR (MODALS) ---">
              <option value="modal_can" ${this.selectedTense === 'modal_can' ? 'selected' : ''}>Modals: Can (Yetenek / İzin - -ebilmek)</option>
              <option value="modal_could" ${this.selectedTense === 'modal_could' ? 'selected' : ''}>Modals: Could (Geçmiş Yetenek / Nezaket - -ebilirdi)</option>
              <option value="modal_must" ${this.selectedTense === 'modal_must' ? 'selected' : ''}>Modals: Must (Güçlü Zorunluluk / -meli)</option>
              <option value="modal_have_to" ${this.selectedTense === 'modal_have_to' ? 'selected' : ''}>Modals: Have to (Dış Zorunluluk / -mek zorunda)</option>
              <option value="modal_should" ${this.selectedTense === 'modal_should' ? 'selected' : ''}>Modals: Should (Tavsiye / Öneri / -meli)</option>
              <option value="modal_may" ${this.selectedTense === 'modal_may' ? 'selected' : ''}>Modals: May (Olasılık / İzin / -ebilir)</option>
              <option value="modal_might" ${this.selectedTense === 'modal_might' ? 'selected' : ''}>Modals: Might (Düşük İhtimal / -ebilir)</option>
              <option value="modal_would" ${this.selectedTense === 'modal_would' ? 'selected' : ''}>Modals: Would (Koşul / İstek / -erdi)</option>
              <option value="modal_would_like" ${this.selectedTense === 'modal_would_like' ? 'selected' : ''}>Modals: Would like to (İstemek / Arzu etmek)</option>
            </optgroup>
          </select>
        </div>
      </div>

      <!-- Live Sentence Display Box (Glowing Border) -->
      <div class="sentence-result-box" style="border: 2px solid #38bdf8; box-shadow: 0 0 25px rgba(56, 189, 248, 0.3);">
        <div class="result-header">
          <span class="result-type-tag" style="background:${this.selectedType === 'pos' ? 'var(--pos-bg)' : (this.selectedType === 'neg' ? 'var(--neg-bg)' : 'var(--que-bg)')}; color:${this.selectedType === 'pos' ? 'var(--pos-color)' : (this.selectedType === 'neg' ? 'var(--neg-color)' : 'var(--que-color)')};">
            ${this.selectedType === 'pos' ? 'OLUMLU CÜMLE (+)' : (this.selectedType === 'neg' ? 'OLUMSUZ CÜMLE (-)' : 'SORU CÜMLESİ (?)')}
          </span>
          <button class="btn-primary" style="padding:6px 14px; font-size:0.8rem;" onclick="sentenceBuilder.speakCurrentSentence()">
            🔊 Seslendir
          </button>
        </div>

        <div class="sentence-en-display" id="builder-live-en">
          ${sentenceData.enHtml}
        </div>

        <div class="sentence-tr-display" id="builder-live-tr">
          🇹🇷 ${sentenceData.tr}
        </div>

        <div class="sentence-actions-bar">
          <span style="font-size:0.75rem; color:var(--text-muted);">
            SVOMPT Cümle Dizilimi Kuralına Uygun Üretildi
          </span>
          <button class="btn-secondary" style="font-size:0.8rem; padding:6px 12px;" onclick="sentenceBuilder.randomizeSentence()">
            🎲 Rastgele Cümle Kur
          </button>
        </div>
      </div>

      <!-- Interactive SVOMPT Blocks Palette -->
      <div class="blocks-palette" style="margin-top:16px;">
        
        <!-- 1. Subject (Özne) -->
        <div class="block-category">
          <div class="block-category-title" style="color:var(--color-s);">
            <span>🟨 1. Özne (Subject) - Kim?</span>
          </div>
          <div class="block-chips-container">
            ${this.subjects.map(s => `
              <button class="block-chip chip-s ${this.selectedSubject === s.en ? 'selected' : ''}" onclick="sentenceBuilder.setBlock('subject', '${s.en}')">
                <strong>${s.en}</strong> <span style="font-size:0.75rem; opacity:0.85;">(${s.tr})</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 2. Verb (Fiil & Zaman) -->
        <div class="block-category">
          <div class="block-category-title" style="color:var(--color-v);">
            <span>🟦 2. Eylem / Fiil (Verb) - Ne yapıyor?</span>
          </div>
          <div class="block-chips-container">
            ${this.verbs.map(v => `
              <button class="block-chip chip-v ${this.selectedVerbKey === v.key ? 'selected' : ''}" onclick="sentenceBuilder.setBlock('verb', '${v.key}')">
                <span>${v.icon}</span> <strong>${v.en}</strong> <span style="font-size:0.75rem; opacity:0.85;">(${v.tr})</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 3. Object (Nesne) -->
        <div class="block-category">
          <div class="block-category-title" style="color:var(--color-o);">
            <span>🟩 3. Nesne (Object) - Neyi / Kimi?</span>
          </div>
          <div class="block-chips-container">
            ${this.objects.map(o => `
              <button class="block-chip chip-o ${this.selectedObject === o.en ? 'selected' : ''}" onclick="sentenceBuilder.setBlock('object', '${o.en}')">
                ${o.en ? `<strong>${o.en}</strong> <span style="font-size:0.75rem; opacity:0.85;">(${o.tr})</span>` : `<em>${o.label}</em>`}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 4. Manner (Durum / Tarz) -->
        <div class="block-category">
          <div class="block-category-title" style="color:var(--color-m);">
            <span>🟪 4. Durum / Tarz (Manner) - Nasıl?</span>
          </div>
          <div class="block-chips-container">
            ${this.manners.map(m => `
              <button class="block-chip chip-m ${this.selectedManner === m.en ? 'selected' : ''}" onclick="sentenceBuilder.setBlock('manner', '${m.en}')">
                ${m.en ? `<strong>${m.en}</strong> <span style="font-size:0.75rem; opacity:0.85;">(${m.tr})</span>` : `<em>${m.label}</em>`}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 5. Place (Yer) -->
        <div class="block-category">
          <div class="block-category-title" style="color:var(--color-p);">
            <span>🟧 5. Yer (Place) - Nerede?</span>
          </div>
          <div class="block-chips-container">
            ${this.places.map(p => `
              <button class="block-chip chip-p ${this.selectedPlace === p.en ? 'selected' : ''}" onclick="sentenceBuilder.setBlock('place', '${p.en}')">
                ${p.en ? `<strong>${p.en}</strong> <span style="font-size:0.75rem; opacity:0.85;">(${p.tr})</span>` : `<em>${p.label}</em>`}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 6. Time (Zaman) -->
        <div class="block-category">
          <div class="block-category-title" style="color:var(--color-t);">
            <span>🟥 6. Zaman (Time) - Ne zaman?</span>
          </div>
          <div class="block-chips-container">
            ${this.times.map(t => `
              <button class="block-chip chip-t ${this.selectedTime === t.en ? 'selected' : ''}" onclick="sentenceBuilder.setBlock('time', '${t.en}')">
                ${t.en ? `<strong>${t.en}</strong> <span style="font-size:0.75rem; opacity:0.85;">(${t.tr})</span>` : `<em>${t.label}</em>`}
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  setBlock(category, value) {
    if (category === 'subject') this.selectedSubject = value;
    if (category === 'verb') this.selectedVerbKey = value;
    if (category === 'object') this.selectedObject = value;
    if (category === 'manner') this.selectedManner = value;
    if (category === 'place') this.selectedPlace = value;
    if (category === 'time') this.selectedTime = value;

    this.renderStudio();
  }

  setType(type) {
    this.selectedType = type;
    this.renderStudio();
  }

  setTense(tense) {
    this.selectedTense = tense;
    this.renderStudio();
  }

  randomizeSentence() {
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const sub = randomItem(this.subjects);
    const verb = randomItem(this.verbs);
    const obj = randomItem(this.objects);
    const man = randomItem(this.manners);
    const plc = randomItem(this.places);

    const tenses = [
      'present_simple', 'present_continuous', 'present_perfect', 'present_perfect_continuous',
      'past_simple', 'past_continuous', 'past_perfect', 'used_to',
      'future_will', 'future_going_to', 'future_continuous', 'future_perfect',
      'modal_can', 'modal_could', 'modal_must', 'modal_have_to', 'modal_should', 'modal_may', 'modal_might', 'modal_would', 'modal_would_like'
    ];
    const tense = randomItem(tenses);
    const types = ['pos', 'neg', 'que'];
    const type = randomItem(types);

    // Pick compatible time expression
    let matchingTimes = this.times.filter(t => !t.suitableTense || t.suitableTense === tense);
    if (matchingTimes.length === 0) matchingTimes = this.times;
    const time = randomItem(matchingTimes);

    this.selectedSubject = sub.en;
    this.selectedVerbKey = verb.key;
    this.selectedObject = obj.en;
    this.selectedManner = man.en;
    this.selectedPlace = plc.en;
    this.selectedTime = time.en;
    this.selectedTense = tense;
    this.selectedType = type;

    if (window.app) window.app.addXP(2);
    this.renderStudio();
  }

  /* =========================================================
     2. DYNAMIC CONJUGATION & TURKISH TRANSLATION ENGINE
     ========================================================= */
  conjugateTurkishVerb(stem, tense, type, person) {
    const endsWithVowel = /[aeıioöuü]$/i.test(stem);
    const lastVowel = (stem.match(/[aeıioöuü]/gi) || ['a']).pop().toLowerCase();
    const isFront = ['e', 'i', 'ö', 'ü'].includes(lastVowel); // ince ünlü
    
    const is1s = person === '1s';
    const isPlural = person === '3p' || person === '1p';

    // 1. Present Simple (Geniş Zaman)
    if (tense === 'present_simple') {
      if (type === 'pos') {
        const rSuffix = endsWithVowel ? 'r' : (isFront ? 'er' : 'ar');
        const base = stem + rSuffix;
        if (is1s) return isFront ? `${base}im` : `${base}ım`;
        if (isPlural) return isFront ? `${base}ler` : `${base}lar`;
        return base;
      } else if (type === 'neg') {
        const maz = isFront ? 'mez' : 'maz';
        if (is1s) return isFront ? `${stem}mem` : `${stem}mam`;
        if (isPlural) return `${stem}${maz}lar`;
        return `${stem}${maz}`;
      } else { // que
        const rSuffix = endsWithVowel ? 'r' : (isFront ? 'er' : 'ar');
        const base = stem + rSuffix;
        const mi = isFront ? 'mi' : 'mı';
        if (is1s) return isFront ? `${base} miyim?` : `${base} mıyım?`;
        if (isPlural) return isFront ? `${base}ler mi?` : `${base}lar mı?`;
        return `${base} ${mi}?`;
      }
    }

    // 2. Present Continuous (Şimdiki Zaman - yor)
    if (tense === 'present_continuous') {
      let yorStem = stem;
      if (endsWithVowel) {
        yorStem = stem.slice(0, -1) + (isFront ? 'i' : 'u');
      } else {
        yorStem = stem + (isFront ? 'i' : 'u');
      }
      const base = yorStem + 'yor';
      if (type === 'pos') {
        if (is1s) return `${base}um`;
        if (isPlural) return `${base}lar`;
        return base;
      } else if (type === 'neg') {
        const negStem = stem + (isFront ? 'mi' : 'mı') + 'yor';
        if (is1s) return `${negStem}um`;
        if (isPlural) return `${negStem}lar`;
        return negStem;
      } else { // que
        if (is1s) return `${base} muyum?`;
        if (isPlural) return `${base}lar mı?`;
        return `${base} mu?`;
      }
    }

    // 3. Present Perfect (Yakın Geçmiş - have/has V3)
    if (tense === 'present_perfect') {
      const mistir = isFront ? 'miştir' : 'mıştır';
      if (type === 'pos') return `${stem}${mistir}`;
      if (type === 'neg') return isFront ? `${stem}memiştir` : `${stem}mamıştır`;
      return isFront ? `${stem}miş midir?` : `${stem}mış mıdır?`;
    }

    // 4. Present Perfect Continuous (have been V-ing)
    if (tense === 'present_perfect_continuous') {
      const mekte = isFront ? 'mektedir' : 'maktadır';
      if (type === 'pos') return `${stem}${mekte}`;
      if (type === 'neg') return isFront ? `${stem}memektedir` : `${stem}mamaktadır`;
      return isFront ? `${stem}mekte midir?` : `${stem}makta mıdır?`;
    }

    // 5. Past Simple (Geçmiş Zaman - di/dı)
    if (tense === 'past_simple') {
      const d = isFront ? 'di' : 'dı';
      if (type === 'pos') {
        if (is1s) return `${stem}${d}m`;
        if (isPlural) return isFront ? `${stem}${d}ler` : `${stem}${d}lar`;
        return `${stem}${d}`;
      } else if (type === 'neg') {
        const neg = isFront ? 'medi' : 'madı';
        if (is1s) return `${stem}${neg}m`;
        if (isPlural) return isFront ? `${stem}${neg}ler` : `${stem}${neg}lar`;
        return `${stem}${neg}`;
      } else { // que
        const mi = isFront ? 'mi' : 'mı';
        if (is1s) return isFront ? `${stem}${d}m mi?` : `${stem}${d}m mı?`;
        if (isPlural) return isFront ? `${stem}${d}ler mi?` : `${stem}${d}lar mı?`;
        return `${stem}${d} ${mi}?`;
      }
    }

    // 6. Past Continuous (was/were V-ing)
    if (tense === 'past_continuous') {
      let yorStem = stem;
      if (endsWithVowel) {
        yorStem = stem.slice(0, -1) + (isFront ? 'i' : 'u');
      } else {
        yorStem = stem + (isFront ? 'i' : 'u');
      }
      const base = yorStem + 'yordu';
      if (type === 'pos') return base;
      if (type === 'neg') return stem + (isFront ? 'mi' : 'mı') + 'yordu';
      return `${yorStem}yor muydu?`;
    }

    // 7. Past Perfect (had + V3)
    if (tense === 'past_perfect') {
      const misti = isFront ? 'mişti' : 'mıştı';
      if (type === 'pos') return `${stem}${misti}`;
      if (type === 'neg') return isFront ? `${stem}memişti` : `${stem}mamıştı`;
      return isFront ? `${stem}miş miydi?` : `${stem}mış mıydı?`;
    }

    // 8. Used to
    if (tense === 'used_to') {
      const rSuffix = endsWithVowel ? 'r' : (isFront ? 'er' : 'ar');
      const di = isFront ? 'di' : 'dı';
      const base = 'eskiden ' + stem + rSuffix + di;
      if (type === 'pos') return base;
      if (type === 'neg') return 'eskiden ' + stem + (isFront ? 'mezdi' : 'mazdı');
      return 'eskiden ' + stem + rSuffix + (isFront ? ' miydi?' : ' mıydı?');
    }

    // 9. Future Simple (will + V1)
    if (tense === 'future_will') {
      const y = endsWithVowel ? 'y' : '';
      const ecek = isFront ? `${y}ecek` : `${y}acak`;
      if (type === 'pos') {
        if (is1s) return isFront ? `${stem}${y}eceğim` : `${stem}${y}acağım`;
        if (isPlural) return isFront ? `${stem}${ecek}ler` : `${stem}${ecek}lar`;
        return `${stem}${ecek}`;
      } else if (type === 'neg') {
        const neg = isFront ? 'meyecek' : 'mayacak';
        if (is1s) return isFront ? `${stem}meyeceğim` : `${stem}mayacağım`;
        if (isPlural) return isFront ? `${stem}${neg}ler` : `${stem}${neg}lar`;
        return `${stem}${neg}`;
      } else { // que
        if (is1s) return isFront ? `${stem}${ecek} miyim?` : `${stem}${ecek} mıyım?`;
        if (isPlural) return isFront ? `${stem}${ecek}ler mi?` : `${stem}${ecek}lar mı?`;
        return isFront ? `${stem}${ecek} mi?` : `${stem}${ecek} mı?`;
      }
    }

    // 10. Be Going To (is/are going to)
    if (tense === 'future_going_to') {
      const y = endsWithVowel ? 'y' : '';
      const ecek = isFront ? `${y}ecek (planlı)` : `${y}acak (planlı)`;
      if (type === 'pos') return `${stem}${ecek}`;
      if (type === 'neg') return isFront ? `${stem}meyecek (planlı)` : `${stem}mayacak (planlı)`;
      return isFront ? `${stem}${y}ecek mi?` : `${stem}${y}acak mı?`;
    }

    // 11. Future Continuous (will be V-ing)
    if (tense === 'future_continuous') {
      let yorStem = stem;
      if (endsWithVowel) {
        yorStem = stem.slice(0, -1) + (isFront ? 'i' : 'u');
      } else {
        yorStem = stem + (isFront ? 'i' : 'u');
      }
      if (type === 'pos') return `${yorStem}yor olacak`;
      if (type === 'neg') return stem + (isFront ? 'mi' : 'mı') + 'yor olacak';
      return `${yorStem}yor mu olacak?`;
    }

    // 12. Future Perfect (will have V3)
    if (tense === 'future_perfect') {
      const mis = isFront ? 'miş olacak' : 'mış olacak';
      if (type === 'pos') return `${stem}${mis}`;
      if (type === 'neg') return isFront ? `${stem}memiş olacak` : `${stem}mamış olacak`;
      return isFront ? `${stem}miş mi olacak?` : `${stem}mış mı olacak?`;
    }

    // 13. Modals
    if (tense === 'modal_can') {
      const y = endsWithVowel ? 'y' : '';
      const ebil = isFront ? `${y}ebilir` : `${y}abilir`;
      if (type === 'pos') return `${stem}${ebil}`;
      if (type === 'neg') return isFront ? `${stem}${y}emez` : `${stem}${y}amaz`;
      return `${stem}${ebil} mi?`;
    }

    if (tense === 'modal_could') {
      const y = endsWithVowel ? 'y' : '';
      const ebilirdi = isFront ? `${y}ebilirdi` : `${y}abilirdi`;
      if (type === 'pos') return `${stem}${ebilirdi}`;
      if (type === 'neg') return isFront ? `${stem}${y}emezdi` : `${stem}${y}amazdı`;
      return `${stem}${ebilirdi} mi?`;
    }

    if (tense === 'modal_must') {
      const meli = isFront ? 'meli' : 'malı';
      if (type === 'pos') return `${stem}${meli} (zorunlu)`;
      if (type === 'neg') return isFront ? `${stem}memeli` : `${stem}mamalı`;
      return `${stem}${meli} mi?`;
    }

    if (tense === 'modal_have_to') {
      const zor = isFront ? 'mek zorunda' : 'mak zorunda';
      if (type === 'pos') return `${stem}${zor}`;
      if (type === 'neg') return `${stem}${zor} değil`;
      return `${stem}${zor} mu?`;
    }

    if (tense === 'modal_should') {
      const meli = isFront ? 'meli' : 'malı';
      if (type === 'pos') return `${stem}${meli} (tavsiye)`;
      if (type === 'neg') return isFront ? `${stem}memeli (tavsiye)` : `${stem}mamalı (tavsiye)`;
      return `${stem}${meli} mi?`;
    }

    if (tense === 'modal_may') {
      const y = endsWithVowel ? 'y' : '';
      const ebil = isFront ? `${y}ebilir` : `${y}abilir`;
      if (type === 'pos') return `${stem}${ebil} (izin/ihtimal)`;
      if (type === 'neg') return `${stem}${ebil} değil`;
      return `${stem}${ebil} mi?`;
    }

    if (tense === 'modal_might') {
      const y = endsWithVowel ? 'y' : '';
      const ebil = isFront ? `${y}ebilir (ihtimal)` : `${y}abilir (ihtimal)`;
      if (type === 'pos') return `${stem}${ebil}`;
      if (type === 'neg') return isFront ? `${stem}${y}emeyebilir` : `${stem}${y}amayabilir`;
      return `${stem}${ebil} mi?`;
    }

    if (tense === 'modal_would') {
      const rSuffix = endsWithVowel ? 'r' : (isFront ? 'er' : 'ar');
      const di = isFront ? 'di' : 'dı';
      if (type === 'pos') return stem + rSuffix + di;
      if (type === 'neg') return stem + (isFront ? 'mezdi' : 'mazdı');
      return stem + rSuffix + (isFront ? ' miydi?' : ' mıydı?');
    }

    if (tense === 'modal_would_like') {
      const mek = isFront ? 'mek ister' : 'mak ister';
      if (type === 'pos') return `${stem}${mek}`;
      if (type === 'neg') return isFront ? `${stem}mek istemez` : `${stem}mak istemez`;
      return isFront ? `${stem}mek ister mi?` : `${stem}mak ister mi?`;
    }

    return stem;
  }

  generateSentenceData() {
    const subObj = this.subjects.find(s => s.en === this.selectedSubject) || this.subjects[0];
    const verbObj = this.verbs.find(v => v.key === this.selectedVerbKey) || this.verbs[0];
    const objObj = this.objects.find(o => o.en === this.selectedObject);
    const manObj = this.manners.find(m => m.en === this.selectedManner);
    const plcObj = this.places.find(p => p.en === this.selectedPlace);
    const timeObj = this.times.find(t => t.en === this.selectedTime);

    const is3rdSingular = subObj.person === '3s';
    const isFirstPerson = subObj.person === '1s';

    let enHtml = '';
    let rawEnText = '';

    const S = this.selectedSubject;
    const V1 = verbObj.en;
    const Vs = verbObj.v_s;
    const V2 = verbObj.v2;
    const V3 = verbObj.v3 || verbObj.v2;
    const Ving = verbObj.v_ing;
    const stem = verbObj.tr_stem;

    const O = this.selectedObject;
    const M = this.selectedManner;
    const P = this.selectedPlace;
    const T = this.selectedTime;

    const type = this.selectedType;
    const tense = this.selectedTense;

    // Direct SVOMPT Color Tokens Styles
    const styleS = 'color: #f59e0b; border-bottom: 3px solid #f59e0b; font-weight: 800; padding: 2px 6px; display: inline-block;';
    const styleV = 'color: #38bdf8; border-bottom: 3px solid #38bdf8; font-weight: 800; padding: 2px 6px; display: inline-block;';
    const styleO = 'color: #34d399; border-bottom: 3px solid #34d399; font-weight: 800; padding: 2px 6px; display: inline-block;';
    const styleM = 'color: #c084fc; border-bottom: 3px solid #c084fc; font-weight: 800; padding: 2px 6px; display: inline-block;';
    const styleP = 'color: #f472b6; border-bottom: 3px solid #f472b6; font-weight: 800; padding: 2px 6px; display: inline-block;';
    const styleT = 'color: #fb7185; border-bottom: 3px solid #fb7185; font-weight: 800; padding: 2px 6px; display: inline-block;';

    // 1. Simple Present
    if (tense === 'present_simple') {
      if (type === 'pos') {
        const verbWord = is3rdSingular ? Vs : V1;
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${verbWord}</span>`;
        rawEnText = `${S} ${verbWord}`;
      } else if (type === 'neg') {
        const aux = is3rdSingular ? "doesn't" : "don't";
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${aux} ${V1}</span>`;
        rawEnText = `${S} ${aux} ${V1}`;
      } else { // que
        const aux = is3rdSingular ? "Does" : "Do";
        enHtml = `<span class="svompt-word word-v" style="${styleV}">${aux}</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `${aux} ${S.toLowerCase()} ${V1}`;
      }
    } 
    // 2. Present Continuous
    else if (tense === 'present_continuous') {
      const be = isFirstPerson ? 'am' : (is3rdSingular ? 'is' : 'are');
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${be} ${Ving}</span>`;
        rawEnText = `${S} ${be} ${Ving}`;
      } else if (type === 'neg') {
        const negBe = isFirstPerson ? 'am not' : (is3rdSingular ? "isn't" : "aren't");
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${negBe} ${Ving}</span>`;
        rawEnText = `${S} ${negBe} ${Ving}`;
      } else { // que
        const capBe = be.charAt(0).toUpperCase() + be.slice(1);
        enHtml = `<span class="svompt-word word-v" style="${styleV}">${capBe}</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${Ving}</span>`;
        rawEnText = `${capBe} ${S.toLowerCase()} ${Ving}`;
      }
    } 
    // 3. Present Perfect
    else if (tense === 'present_perfect') {
      const have = is3rdSingular ? 'has' : 'have';
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${have} ${V3}</span>`;
        rawEnText = `${S} ${have} ${V3}`;
      } else if (type === 'neg') {
        const negHave = is3rdSingular ? "hasn't" : "haven't";
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${negHave} ${V3}</span>`;
        rawEnText = `${S} ${negHave} ${V3}`;
      } else { // que
        const capHave = is3rdSingular ? 'Has' : 'Have';
        enHtml = `<span class="svompt-word word-v" style="${styleV}">${capHave}</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V3}</span>`;
        rawEnText = `${capHave} ${S.toLowerCase()} ${V3}`;
      }
    }
    // 4. Present Perfect Continuous
    else if (tense === 'present_perfect_continuous') {
      const have = is3rdSingular ? 'has been' : 'have been';
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${have} ${Ving}</span>`;
        rawEnText = `${S} ${have} ${Ving}`;
      } else if (type === 'neg') {
        const negHave = is3rdSingular ? "hasn't been" : "haven't been";
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${negHave} ${Ving}</span>`;
        rawEnText = `${S} ${negHave} ${Ving}`;
      } else { // que
        const capHave = is3rdSingular ? 'Has' : 'Have';
        enHtml = `<span class="svompt-word word-v" style="${styleV}">${capHave}</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">been ${Ving}</span>`;
        rawEnText = `${capHave} ${S.toLowerCase()} been ${Ving}`;
      }
    }
    // 5. Simple Past
    else if (tense === 'past_simple') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${V2}</span>`;
        rawEnText = `${S} ${V2}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">didn't ${V1}</span>`;
        rawEnText = `${S} didn't ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Did</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Did ${S.toLowerCase()} ${V1}`;
      }
    } 
    // 6. Past Continuous
    else if (tense === 'past_continuous') {
      const was = (isFirstPerson || is3rdSingular) ? 'was' : 'were';
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${was} ${Ving}</span>`;
        rawEnText = `${S} ${was} ${Ving}`;
      } else if (type === 'neg') {
        const negWas = (isFirstPerson || is3rdSingular) ? "wasn't" : "weren't";
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${negWas} ${Ving}</span>`;
        rawEnText = `${S} ${negWas} ${Ving}`;
      } else { // que
        const capWas = (isFirstPerson || is3rdSingular) ? 'Was' : 'Were';
        enHtml = `<span class="svompt-word word-v" style="${styleV}">${capWas}</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${Ving}</span>`;
        rawEnText = `${capWas} ${S.toLowerCase()} ${Ving}`;
      }
    }
    // 7. Past Perfect
    else if (tense === 'past_perfect') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">had ${V3}</span>`;
        rawEnText = `${S} had ${V3}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">hadn't ${V3}</span>`;
        rawEnText = `${S} hadn't ${V3}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Had</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V3}</span>`;
        rawEnText = `Had ${S.toLowerCase()} ${V3}`;
      }
    }
    // 8. Used to
    else if (tense === 'used_to') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">used to ${V1}</span>`;
        rawEnText = `${S} used to ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">didn't use to ${V1}</span>`;
        rawEnText = `${S} didn't use to ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Did</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">use to ${V1}</span>`;
        rawEnText = `Did ${S.toLowerCase()} use to ${V1}`;
      }
    }
    // 9. Future Simple (will)
    else if (tense === 'future_will') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">will ${V1}</span>`;
        rawEnText = `${S} will ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">won't ${V1}</span>`;
        rawEnText = `${S} won't ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Will</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Will ${S.toLowerCase()} ${V1}`;
      }
    } 
    // 10. Be Going To
    else if (tense === 'future_going_to') {
      const be = isFirstPerson ? 'am' : (is3rdSingular ? 'is' : 'are');
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${be} going to ${V1}</span>`;
        rawEnText = `${S} ${be} going to ${V1}`;
      } else if (type === 'neg') {
        const negBe = isFirstPerson ? 'am not' : (is3rdSingular ? "isn't" : "aren't");
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${negBe} going to ${V1}</span>`;
        rawEnText = `${S} ${negBe} going to ${V1}`;
      } else { // que
        const capBe = be.charAt(0).toUpperCase() + be.slice(1);
        enHtml = `<span class="svompt-word word-v" style="${styleV}">${capBe}</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">going to ${V1}</span>`;
        rawEnText = `${capBe} ${S.toLowerCase()} going to ${V1}`;
      }
    }
    // 11. Future Continuous
    else if (tense === 'future_continuous') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">will be ${Ving}</span>`;
        rawEnText = `${S} will be ${Ving}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">won't be ${Ving}</span>`;
        rawEnText = `${S} won't be ${Ving}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Will</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">be ${Ving}</span>`;
        rawEnText = `Will ${S.toLowerCase()} be ${Ving}`;
      }
    }
    // 12. Future Perfect
    else if (tense === 'future_perfect') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">will have ${V3}</span>`;
        rawEnText = `${S} will have ${V3}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">won't have ${V3}</span>`;
        rawEnText = `${S} won't have ${V3}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Will</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">have ${V3}</span>`;
        rawEnText = `Will ${S.toLowerCase()} have ${V3}`;
      }
    }
    // 13. Modals: Can
    else if (tense === 'modal_can') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">can ${V1}</span>`;
        rawEnText = `${S} can ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">cannot ${V1}</span>`;
        rawEnText = `${S} cannot ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Can</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Can ${S.toLowerCase()} ${V1}`;
      }
    } 
    // 14. Modals: Could
    else if (tense === 'modal_could') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">could ${V1}</span>`;
        rawEnText = `${S} could ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">couldn't ${V1}</span>`;
        rawEnText = `${S} couldn't ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Could</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Could ${S.toLowerCase()} ${V1}`;
      }
    }
    // 15. Modals: Must
    else if (tense === 'modal_must') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">must ${V1}</span>`;
        rawEnText = `${S} must ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">mustn't ${V1}</span>`;
        rawEnText = `${S} mustn't ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Must</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Must ${S.toLowerCase()} ${V1}`;
      }
    } 
    // 16. Modals: Have to
    else if (tense === 'modal_have_to') {
      const have = is3rdSingular ? 'has to' : 'have to';
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${have} ${V1}</span>`;
        rawEnText = `${S} ${have} ${V1}`;
      } else if (type === 'neg') {
        const aux = is3rdSingular ? "doesn't have to" : "don't have to";
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">${aux} ${V1}</span>`;
        rawEnText = `${S} ${aux} ${V1}`;
      } else { // que
        const aux = is3rdSingular ? 'Does' : 'Do';
        enHtml = `<span class="svompt-word word-v" style="${styleV}">${aux}</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">have to ${V1}</span>`;
        rawEnText = `${aux} ${S.toLowerCase()} have to ${V1}`;
      }
    }
    // 17. Modals: Should
    else if (tense === 'modal_should') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">should ${V1}</span>`;
        rawEnText = `${S} should ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">shouldn't ${V1}</span>`;
        rawEnText = `${S} shouldn't ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Should</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Should ${S.toLowerCase()} ${V1}`;
      }
    }
    // 18. Modals: May
    else if (tense === 'modal_may') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">may ${V1}</span>`;
        rawEnText = `${S} may ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">may not ${V1}</span>`;
        rawEnText = `${S} may not ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">May</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `May ${S.toLowerCase()} ${V1}`;
      }
    }
    // 19. Modals: Might
    else if (tense === 'modal_might') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">might ${V1}</span>`;
        rawEnText = `${S} might ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">might not ${V1}</span>`;
        rawEnText = `${S} might not ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Might</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Might ${S.toLowerCase()} ${V1}`;
      }
    }
    // 20. Modals: Would
    else if (tense === 'modal_would') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">would ${V1}</span>`;
        rawEnText = `${S} would ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">wouldn't ${V1}</span>`;
        rawEnText = `${S} wouldn't ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Would</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">${V1}</span>`;
        rawEnText = `Would ${S.toLowerCase()} ${V1}`;
      }
    }
    // 21. Modals: Would like to
    else if (tense === 'modal_would_like') {
      if (type === 'pos') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">would like to ${V1}</span>`;
        rawEnText = `${S} would like to ${V1}`;
      } else if (type === 'neg') {
        enHtml = `<span class="svompt-word word-s" style="${styleS}">${S}</span> <span class="svompt-word word-v" style="${styleV}">wouldn't like to ${V1}</span>`;
        rawEnText = `${S} wouldn't like to ${V1}`;
      } else { // que
        enHtml = `<span class="svompt-word word-v" style="${styleV}">Would</span> <span class="svompt-word word-s" style="${styleS}">${S.toLowerCase()}</span> <span class="svompt-word word-v" style="${styleV}">like to ${V1}</span>`;
        rawEnText = `Would ${S.toLowerCase()} like to ${V1}`;
      }
    }

    // Append O, M, P, T to English sentence
    if (O) {
      enHtml += ` <span class="svompt-word word-o" style="${styleO}">${O}</span>`;
      rawEnText += ` ${O}`;
    }
    if (M) {
      enHtml += ` <span class="svompt-word word-m" style="${styleM}">${M}</span>`;
      rawEnText += ` ${M}`;
    }
    if (P) {
      enHtml += ` <span class="svompt-word word-p" style="${styleP}">${P}</span>`;
      rawEnText += ` ${P}`;
    }
    if (T) {
      enHtml += ` <span class="svompt-word word-t" style="${styleT}">${T}</span>`;
      rawEnText += ` ${T}`;
    }

    if (type === 'que') {
      enHtml += '<span style="color:#ffffff; font-weight:800;">?</span>';
      rawEnText += '?';
    } else {
      enHtml += '<span style="color:#ffffff; font-weight:800;">.</span>';
      rawEnText += '.';
    }

    // Turkish Conjugation
    const trVerbConjugated = this.conjugateTurkishVerb(stem, tense, type, subObj.person);

    // Turkish Sentence Assembly: [Özne], [Zaman] [Yer] [Nesne] [Durum] [Yüklem]
    const trParts = [];
    if (subObj.tr) trParts.push(subObj.tr + ',');
    if (timeObj && timeObj.tr) trParts.push(timeObj.tr);
    if (plcObj && plcObj.tr) trParts.push(plcObj.tr);
    if (objObj && objObj.tr) trParts.push(objObj.tr);
    if (manObj && manObj.tr) trParts.push(manObj.tr);
    trParts.push(trVerbConjugated);

    const fullTr = trParts.filter(Boolean).join(' ') + (type === 'que' ? '' : '.');

    this.currentRawSentence = rawEnText;

    return {
      enHtml,
      rawEnText,
      tr: fullTr
    };
  }

  speakCurrentSentence() {
    if (!this.currentRawSentence) {
      const data = this.generateSentenceData();
      this.currentRawSentence = data.rawEnText;
    }
    speechEngine.speak(this.currentRawSentence);
  }

  /* =========================================================
     3. SCRAMBLE GAME WITH PEDAGOGICAL ERROR TEACHING
     ========================================================= */
  initScramble() {
    const allVerbs = (APP_DATA && APP_DATA.verbs && APP_DATA.verbs.length > 0) ? APP_DATA.verbs : [];
    if (allVerbs.length === 0) return;

    this.scrambleVerb = allVerbs[Math.floor(Math.random() * allVerbs.length)];
    const types = ['positive', 'negative', 'question'];
    this.scrambleSentenceType = types[Math.floor(Math.random() * types.length)];
    this.showHint = false;

    const sentence = this.scrambleVerb.sentences[this.scrambleSentenceType].en;
    const tokens = sentence.replace(/[.,?]/g, '').split(/\s+/).filter(t => t.length > 0);
    this.scrambleTokens = [...tokens].sort(() => Math.random() - 0.5);
    this.selectedTokens = [];
    this.isScrambleSolved = false;
  }

  renderScramble() {
    const container = document.getElementById('builder-content-area');
    if (!container) return;

    if (!this.scrambleVerb) {
      this.initScramble();
      if (!this.scrambleVerb) {
        container.innerHTML = '<div class="controls-card">Fiil verisi yüklenemedi.</div>';
        return;
      }
    }

    const targetSentenceObj = this.scrambleVerb.sentences[this.scrambleSentenceType];
    const rawTarget = targetSentenceObj.en.trim();
    const cleanTokens = rawTarget.replace(/[.,?]/g, '').split(/\s+/).filter(t => t.length > 0);
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
    const tokens = sentenceText.replace(/[.,?]/g, '').split(/\s+/);
    const verbWord = verbObj.verb ? verbObj.verb.toLowerCase() : '';
    const verbIdx = tokens.findIndex(t => t.toLowerCase() === verbWord || t.toLowerCase() === verbObj.forms?.v1?.toLowerCase());
    
    let subject = tokens.slice(0, Math.max(1, verbIdx > 0 ? verbIdx : 1)).join(' ');
    let verb = verbIdx >= 0 ? tokens[verbIdx] : (verbObj.verb || '');
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
      const tokens = sentence.replace(/[.,?]/g, '').split(/\s+/).filter(t => t.length > 0);
      this.scrambleTokens = [...tokens].sort(() => Math.random() - 0.5);
      this.selectedTokens = [];
      this.renderScramble();
    }
  }

  autoSolve() {
    const sentence = this.scrambleVerb.sentences[this.scrambleSentenceType].en;
    const tokens = sentence.replace(/[.,?]/g, '').split(/\s+/).filter(t => t.length > 0);
    this.selectedTokens = [...tokens];
    this.scrambleTokens = [];
    this.renderScramble();
  }

  nextScramble() {
    this.initScramble();
    this.renderScramble();
  }

  watchTenseVideo() {
    if (window.grammarView) {
      const vid = window.grammarView.getVideoForTense(this.selectedTense);
      if (vid) {
        window.grammarView.openVideoModal(vid.video_id, vid.title);
      }
    }
  }
}

// Global instance
window.sentenceBuilder = new SentenceBuilder();
