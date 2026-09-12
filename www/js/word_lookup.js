/**
 * Interactive Word Lookup & Dictionary Engine (İnteraktif Kelime & Sözlük Motoru)
 * - Wraps all sentence words in interactive, clickable spans.
 * - Shows Part of Speech (Kelime Türü), Turkish Meaning (Türkçe Anlamı), Root/Lemma & Pronunciation.
 * - 1-Click "Bilinmeyen Kelimelere Ekle" (Add to Unknown Words / Kelime Defterim) with XP rewards.
 * - Massive offline dictionary (3,500+ words) + morphological lemmatizer + online dictionary fallback.
 */

class WordLookupEngine {
  constructor() {
    this.cache = this.loadCache();
    this.modalEl = null;
    this.activeWordData = null;
    this.localDict = {};
    this.initDictionary();
  }

  loadCache() {
    try {
      const saved = localStorage.getItem('english_app_lookup_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  saveCache() {
    try {
      localStorage.setItem('english_app_lookup_cache', JSON.stringify(this.cache));
    } catch (e) {}
  }

  /* =========================================================
     1. EMBEDDED MASTER VOCABULARY & PART-OF-SPEECH DATABASE
     ========================================================= */
  initDictionary() {
    // 1. Merge generated MASTER_DICTIONARY
    this.localDict = Object.assign({}, (window.MASTER_DICTIONARY || {}));

    // 2. Load external JSON asynchronously if available
    this.loadExternalDictionary();
  }

  async loadExternalDictionary() {
    try {
      const res = await fetch('./data/full_dictionary.json');
      if (res.ok) {
        const full = await res.json();
        this.localDict = Object.assign({}, this.localDict, full);
      }
    } catch (e) {}
  }

  /* =========================================================
     2. MORPHOLOGICAL LEMMATIZER (KÖK & EK AYIKLAMA MOTORU)
     ========================================================= */
  lemmatize(rawWord) {
    if (!rawWord || typeof rawWord !== 'string') {
      return { wordEn: '', tr: '', type_label: 'Kelime', icon: '📖' };
    }

    const cleanWord = rawWord.replace(/[^a-zA-Z'\-]/g, '').trim();
    const w = cleanWord.toLowerCase();

    if (!w) {
      return { wordEn: '', tr: '', type_label: 'Kelime', icon: '📖' };
    }

    // 1. Direct Local Dictionary / Master Dictionary match
    if (this.localDict[w]) {
      return { ...this.localDict[w], wordEn: w, original: cleanWord };
    }

    if (window.MASTER_DICTIONARY && window.MASTER_DICTIONARY[w]) {
      this.localDict[w] = window.MASTER_DICTIONARY[w];
      return { ...window.MASTER_DICTIONARY[w], wordEn: w, original: cleanWord };
    }

    // 2. Cache match
    if (this.cache[w]) {
      return { ...this.cache[w], wordEn: w, original: cleanWord };
    }

    // 3. School Mode 9th Grade Curriculum match
    if (window.schoolMode && window.schoolMode.schoolData && window.schoolMode.schoolData.units) {
      for (const u of window.schoolMode.schoolData.units) {
        if (u.words) {
          const uMatch = u.words.find(uw => uw.en && uw.en.toLowerCase() === w);
          if (uMatch) {
            return {
              tr: uMatch.tr,
              type: uMatch.pos || uMatch.type || "school",
              type_label: `${u.code} • ${uMatch.pos || uMatch.type || 'Kelime'}`,
              icon: "🏫",
              wordEn: uMatch.en,
              original: cleanWord
            };
          }
        }
      }
    }

    // 4. Contractions mapping
    const contractionMap = {
      "don't": { root: "do", tr: "yapma(mak) / olumsuz geniş zaman", type_label: "Olumsuz Yardımcı Fiil" },
      "doesn't": { root: "does", tr: "yapma(mak) / olumsuz geniş zaman", type_label: "Olumsuz Yardımcı Fiil" },
      "didn't": { root: "did", tr: "yapmadı / olumsuz geçmiş zaman", type_label: "Olumsuz Geçmiş Fiil" },
      "can't": { root: "can", tr: "yapamaz / yeteneksizlik", type_label: "Olumsuz Modal (Kip)" },
      "couldn't": { root: "could", tr: "yapamadı / geçmiş yeteneksizlik", type_label: "Olumsuz Modal (Kip)" },
      "won't": { root: "will", tr: "yapmayacak / olumsuz gelecek", type_label: "Olumsuz Gelecek Kip" },
      "wouldn't": { root: "would", tr: "yapmazdı / istemezdi", type_label: "Olumsuz Modal" },
      "shouldn't": { root: "should", tr: "yapmamalı / olumsuz tavsiye", type_label: "Olumsuz Modal (Tavsiye)" },
      "mustn't": { root: "must", tr: "yapmamalı / yasak", type_label: "Yasaklama Kipi" },
      "isn't": { root: "is", tr: "değildir (tekil)", type_label: "Olumsuz Yardımcı Fiil" },
      "aren't": { root: "are", tr: "değildirler (çoğul)", type_label: "Olumsuz Yardımcı Fiil" },
      "wasn't": { root: "was", tr: "değildi (geçmiş tekil)", type_label: "Olumsuz Geçmiş Fiil" },
      "weren't": { root: "were", tr: "değildiler (geçmiş çoğul)", type_label: "Olumsuz Geçmiş Fiil" },
      "haven't": { root: "have", tr: "sahip değil / perfect olumsuz", type_label: "Olumsuz Yardımcı Fiil" },
      "hasn't": { root: "has", tr: "sahip değil / perfect olumsuz", type_label: "Olumsuz Yardımcı Fiil" },
      "hadn't": { root: "had", tr: "sahip değildi / past perfect olumsuz", type_label: "Olumsuz Geçmiş Fiil" },
      "it's": { root: "it", tr: "o (it is / it has)", type_label: "Zamir + Yardımcı Fiil" },
      "i'm": { root: "i", tr: "ben (I am)", type_label: "Zamir + Fiil" },
      "you're": { root: "you", tr: "sen / siz (you are)", type_label: "Zamir + Fiil" },
      "they're": { root: "they", tr: "onlar (they are)", type_label: "Zamir + Fiil" },
      "we're": { root: "we", tr: "biz (we are)", type_label: "Zamir + Fiil" },
      "i've": { root: "i", tr: "ben (I have)", type_label: "Zamir + Fiil" },
      "you've": { root: "you", tr: "sen (you have)", type_label: "Zamir + Fiil" },
      "they've": { root: "they", tr: "onlar (they have)", type_label: "Zamir + Fiil" },
      "we've": { root: "we", tr: "biz (we have)", type_label: "Zamir + Fiil" },
      "i'll": { root: "i", tr: "ben yapacağım (I will)", type_label: "Zamir + Gelecek Kip" },
      "you'll": { root: "you", tr: "sen yapacaksın (you will)", type_label: "Zamir + Gelecek Kip" },
      "he'll": { root: "he", tr: "o yapacak (he will)", type_label: "Zamir + Gelecek Kip" },
      "she'll": { root: "she", tr: "o yapacak (she will)", type_label: "Zamir + Gelecek Kip" },
      "we'll": { root: "we", tr: "biz yapacağız (we will)", type_label: "Zamir + Gelecek Kip" },
      "they'll": { root: "they", tr: "onlar yapacak (they will)", type_label: "Zamir + Gelecek Kip" }
    };

    if (contractionMap[w]) {
      const c = contractionMap[w];
      return {
        tr: c.tr,
        root: c.root,
        type: "contraction",
        type_label: c.type_label,
        icon: "💡",
        wordEn: w,
        original: cleanWord
      };
    }

    // 5. Morphological Stemming Rules
    const candidates = [];

    // Rule: -ing (running -> run, making -> make, studying -> study, playing -> play)
    if (w.endsWith('ing') && w.length > 4) {
      const base = w.slice(0, -3);
      candidates.push({ stem: base, rule: 'verb_ing' });
      candidates.push({ stem: base + 'e', rule: 'verb_ing' });
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        candidates.push({ stem: base.slice(0, -1), rule: 'verb_ing' });
      }
      if (base.endsWith('y')) {
        candidates.push({ stem: base.slice(0, -1) + 'ie', rule: 'verb_ing' });
      }
    }

    // Rule: -ed / -d (played -> play, danced -> dance, stopped -> stop, studied -> study)
    if (w.endsWith('ed') && w.length > 3) {
      const base = w.slice(0, -2);
      candidates.push({ stem: base, rule: 'verb_ed' });
      candidates.push({ stem: base + 'e', rule: 'verb_ed' });
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        candidates.push({ stem: base.slice(0, -1), rule: 'verb_ed' });
      }
      if (base.endsWith('i')) {
        candidates.push({ stem: base.slice(0, -1) + 'y', rule: 'verb_ed' });
      }
    }

    // Rule: Plural or 3rd Person Singular -s, -es, -ies (books -> book, watches -> watch, flies -> fly)
    if (w.endsWith('ies') && w.length > 4) {
      candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'plural_ies' });
    } else if (w.endsWith('es') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'plural_es' });
      candidates.push({ stem: w.slice(0, -1), rule: 'plural_s' });
    } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) {
      candidates.push({ stem: w.slice(0, -1), rule: 'plural_s' });
    }

    // Rule: Adverbs -ly (carefully -> careful, quickly -> quick, effectively -> effective)
    if (w.endsWith('ly') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'adverb_ly' });
      if (w.endsWith('ily')) {
        candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'adverb_ly' });
      }
      if (w.endsWith('ally')) {
        candidates.push({ stem: w.slice(0, -4), rule: 'adverb_ly' });
        candidates.push({ stem: w.slice(0, -4) + 'ic', rule: 'adverb_ly' });
      }
    }

    // Rule: Comparatives & Superlatives -er, -est
    if (w.endsWith('est') && w.length > 4) {
      candidates.push({ stem: w.slice(0, -3), rule: 'superlative' });
      candidates.push({ stem: w.slice(0, -2), rule: 'superlative' });
      if (w.endsWith('iest')) candidates.push({ stem: w.slice(0, -4) + 'y', rule: 'superlative' });
    } else if (w.endsWith('er') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'comparative' });
      candidates.push({ stem: w.slice(0, -1), rule: 'comparative' });
      if (w.endsWith('ier')) candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'comparative' });
    }

    // Check if any candidate stem exists in the local dictionary
    for (const c of candidates) {
      const entry = this.localDict[c.stem] || (window.MASTER_DICTIONARY && window.MASTER_DICTIONARY[c.stem]);
      if (entry) {
        let suffixDesc = "";
        let finalType = entry.type_label || entry.type;

        if (c.rule === 'verb_ing') {
          suffixDesc = " (Şimdiki Zaman / -ing Hali)";
          finalType = "Şimdiki Zaman / Fiil (V-ing)";
        } else if (c.rule === 'verb_ed') {
          suffixDesc = " (Geçmiş Zaman / -ed Hali)";
          finalType = "Geçmiş Zaman / Fiil (V2/V3)";
        } else if (c.rule.startsWith('plural')) {
          suffixDesc = " (Çoğul / 3. Tekil)";
          finalType = entry.type === 'noun' || (entry.type_label && entry.type_label.includes('İsim')) 
            ? "Çoğul İsim (Plural Noun)" 
            : "Geniş Zaman Fiil (3. Tekil)";
        } else if (c.rule === 'adverb_ly') {
          suffixDesc = " (Zarf Hali)";
          finalType = "Durum Zarfı (Adverb)";
        } else if (c.rule === 'comparative') {
          suffixDesc = " (Daha ... Karşılaştırma Hali)";
          finalType = "Karşılaştırma Sıfatı (Comparative)";
        } else if (c.rule === 'superlative') {
          suffixDesc = " (En ... Üstünlük Hali)";
          finalType = "Üstünlük Sıfatı (Superlative)";
        }

        const baseMeaning = (entry.tr || '').split(',')[0].split('/')[0].trim();
        const fullTr = c.rule === 'adverb_ly' 
          ? `${baseMeaning} bir şekilde` 
          : `${entry.tr}${suffixDesc}`;

        return {
          ...entry,
          wordEn: w,
          root: c.stem,
          tr: fullTr,
          type_label: finalType,
          original: cleanWord
        };
      }
    }

    // 6. Default Guess based on ending if not found
    let guessedType = "Kelime (Word)";
    let guessedIcon = "📝";
    if (w.endsWith('ly')) { guessedType = "Muhtemel Zarf (Adverb)"; guessedIcon = "🟣"; }
    else if (w.endsWith('tion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity')) { guessedType = "İsim (Noun)"; guessedIcon = "🔴"; }
    else if (w.endsWith('able') || w.endsWith('ful') || w.endsWith('less') || w.endsWith('ous') || w.endsWith('ive')) { guessedType = "Sıfat (Adjective)"; guessedIcon = "🟩"; }
    else if (w.endsWith('ing') || w.endsWith('ed')) { guessedType = "Fiil / Sıfat"; guessedIcon = "🔵"; }

    return {
      wordEn: w,
      tr: "Anlam aranıyor...",
      type: "unknown",
      type_label: guessedType,
      icon: guessedIcon,
      isUnknown: true,
      original: cleanWord
    };
  }

  /* =========================================================
     3. UNIVERSAL SENTENCE WRAPPER (WRAP WORDS INTERACTIVELY)
     ========================================================= */
  wrap(htmlOrText) {
    if (!htmlOrText || typeof htmlOrText !== 'string') return htmlOrText || '';

    const parts = htmlOrText.split(/(<[^>]+>)/g);

    return parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part;
      }

      return part.replace(/\b([a-zA-Z]+(?:'[a-zA-Z]+)?)\b/g, (match) => {
        const clean = match.replace(/'s$/i, '').trim();
        return `<span class="interactive-word" onclick="wordLookup.openWord('${clean.replace(/'/g, "\\'")}', event)" data-word="${clean}">${match}</span>`;
      });
    }).join('');
  }

  /* =========================================================
     4. OPEN WORD DETAIL MODAL & ASYNC DICTIONARY FETCH
     ========================================================= */
  lookup(rawWord, event) {
    return this.openWord(rawWord, event);
  }

  openWord(rawWord, event) {
    if (event) {
      event.stopPropagation();
    }

    const clean = rawWord.replace(/[^a-zA-Z'\- ]/g, '').trim();
    if (!clean) return;

    let data = this.lemmatize(clean);
    this.activeWordData = data;

    this.renderModal(data);

    if (window.speechEngine) {
      setTimeout(() => window.speechEngine.speak(clean), 150);
    }

    if (data.isUnknown || data.tr.includes('aranıyor')) {
      this.fetchOnlineDefinition(clean);
    }
  }

  async fetchOnlineDefinition(word) {
    const cleanWord = word.toLowerCase().trim();
    try {
      // 1. Try Google Translate API for instant accurate Turkish meaning
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(cleanWord)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json[0] && json[0][0] && json[0][0][0]) {
          const turkishMeaning = json[0][0][0].trim();
          
          this.activeWordData.tr = turkishMeaning;
          this.activeWordData.isUnknown = false;
          
          this.cache[cleanWord] = {
            tr: turkishMeaning,
            type: this.activeWordData.type || "word",
            type_label: this.activeWordData.type_label || "Kelime",
            icon: this.activeWordData.icon || "📓",
            wordEn: cleanWord
          };
          this.saveCache();

          this.updateModalContent(this.activeWordData);
          return;
        }
      }
    } catch (e) {}

    // Fallback: Free Dictionary API
    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
      if (dictRes.ok) {
        const dictJson = await dictRes.json();
        if (dictJson && dictJson[0] && dictJson[0].meanings && dictJson[0].meanings[0]) {
          const m = dictJson[0].meanings[0];
          const partOfSpeech = m.partOfSpeech || 'word';
          const def = m.definitions && m.definitions[0] ? m.definitions[0].definition : '';
          
          this.activeWordData.tr = def || "Kelime açıklaması bulundu";
          this.activeWordData.type_label = partOfSpeech.toUpperCase();
          this.updateModalContent(this.activeWordData);
        }
      }
    } catch (e) {}
  }

  /* =========================================================
     5. RENDER WORD DETAIL MODAL
     ========================================================= */
  renderModal(data) {
    let modal = document.getElementById('word-lookup-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'word-lookup-modal';
      modal.className = 'word-modal-overlay';
      document.body.appendChild(modal);
    }

    const typeBadge = data.type_label || (data.type ? data.type.toUpperCase() : 'KELİME');
    const icon = data.icon || '📖';
    const rootInfo = data.root ? `<div class="word-modal-root">🌱 Kök Kelime: <strong>${data.root}</strong></div>` : '';

    modal.innerHTML = `
      <div class="word-modal-card" onclick="event.stopPropagation()">
        <div class="word-modal-header">
          <div class="word-modal-title-group">
            <span class="word-modal-icon">${icon}</span>
            <div>
              <h2 class="word-modal-title">${data.original || data.wordEn}</h2>
              <span class="word-modal-badge">${typeBadge}</span>
            </div>
          </div>
          <button class="word-modal-close" onclick="wordLookup.closeModal()">&times;</button>
        </div>

        <div class="word-modal-body">
          <div class="word-modal-tr-box">
            <div class="word-modal-tr-label">Türkçe Karşılığı</div>
            <div class="word-modal-tr-text" id="word-lookup-tr-text">🇹🇷 ${data.tr}</div>
          </div>

          ${rootInfo}

          <div class="word-modal-actions">
            <button class="btn-primary sm" onclick="speechEngine.speak('${(data.original || data.wordEn).replace(/'/g, "\\'")}')">
              🔊 Sesli Dinle
            </button>
            <button class="btn-success sm" id="add-to-unknown-btn" onclick="wordLookup.addActiveWordToNotebook()">
              ⭐ Kelime Defterime Ekle (+3 XP)
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');

    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal();
    };
  }

  updateModalContent(data) {
    const trEl = document.getElementById('word-lookup-tr-text');
    if (trEl) {
      trEl.innerHTML = `🇹🇷 ${data.tr}`;
    }
  }

  addActiveWordToNotebook() {
    if (!this.activeWordData) return;
    const w = this.activeWordData;

    const wordToSave = (w.root || w.original || w.wordEn || '').trim();
    const meaningToSave = (w.tr || '').replace(/🇹🇷/g, '').replace(/\(.*?\)/g, '').trim() || "Öğrenilecek Kelime";

    let addedToAny = false;

    // 1. If in School Mode or curriculum word, add to 9th Grade School Notebook
    if (window.schoolMode && typeof window.schoolMode.addWordToSchoolNotebook === 'function') {
      window.schoolMode.addWordToSchoolNotebook(wordToSave, meaningToSave, w.type_label || 'Kelime');
      addedToAny = true;
    }

    // 2. Also add to General Custom Words Manager
    if (window.customWordsManager) {
      window.customWordsManager.addWord(wordToSave, meaningToSave);
      addedToAny = true;
    }

    const btn = document.getElementById('add-to-unknown-btn');
    if (btn) {
      btn.innerHTML = '🎉 Kelime Defterine Eklendi! (+3 XP)';
      btn.style.background = 'var(--success)';
      btn.style.boxShadow = '0 0 25px rgba(34, 197, 94, 0.5)';
    }

    if (window.app && !window.schoolMode) {
      window.app.showToast(`⭐ "${wordToSave}" kelime defterinize eklendi! (+3 XP)`);
    }
  }

  closeModal() {
    const modal = document.getElementById('word-lookup-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}

// Global instance
window.wordLookup = new WordLookupEngine();
