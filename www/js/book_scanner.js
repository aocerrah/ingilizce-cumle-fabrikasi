/**
 * 📸 Fly Higher 2.0 & Bookworms Akıllı Sayfa Tarayıcı & Gerçek OCR Motoru (Book Scanner Engine)
 * - Kitap ve Workbook sayfalarının fotoğrafını Tesseract OCR ile tarar ve tüm metni eksiksiz çıkarır.
 * - Metindeki tüm 9. sınıf kelimelerini, fiillerini ve deyimlerini ayıklar.
 * - Sayfada kullanılan Gramer Yapılarını (Tenses, Modals, Passive, Conditionals, Relative Clauses) otomatik tespit eder.
 * - 1-Tıkla "Fly Higher 9. Sınıf Kelime Defteri"ne ekler.
 */

class BookScannerEngine {
  constructor() {
    this.scannedHistory = this.loadHistory();
    this.currentAnalysis = null;
    this.isOcrBusy = false;
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('english_app_scanned_pages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('english_app_scanned_pages', JSON.stringify(this.scannedHistory));
    } catch (e) {}
  }

  /**
   * Gerçek Tesseract.js OCR ile Fotoğraftan Metin Okuma
   */
  async recognizeImageWithOCR(imageFileOrUrl, onProgress = null) {
    if (this.isOcrBusy) {
      throw new Error('Bir tarama işlemi zaten devam ediyor.');
    }

    if (typeof Tesseract === 'undefined') {
      throw new Error('OCR Kütüphanesi (Tesseract.js) henüz yüklenmedi. Lütfen internet bağlantınızı kontrol edin veya metni doğrudan yapıştırın.');
    }

    this.isOcrBusy = true;

    try {
      const result = await Tesseract.recognize(
        imageFileOrUrl,
        'eng',
        {
          logger: (m) => {
            if (onProgress && typeof onProgress === 'function') {
              onProgress(m);
            }
          }
        }
      );

      this.isOcrBusy = false;

      let extractedText = (result.data && result.data.text) ? result.data.text : '';
      
      // Post-processing to fix common OCR artifacts
      extractedText = this.cleanOcrText(extractedText);
      return extractedText;
    } catch (err) {
      this.isOcrBusy = false;
      console.error('OCR Error:', err);
      throw err;
    }
  }

  /**
   * OCR Metin Temizleyici (Satır sonu tireleri ve fazla boşlukları düzeltir)
   */
  cleanOcrText(text) {
    if (!text) return '';
    return text
      // Satır sonundaki tireli kelimeleri birleştir (örn: envi- \n ronment -> environment)
      .replace(/([a-zA-Z]+)-\s*\n\s*([a-zA-Z]+)/g, '$1$2')
      // Çoklu boşlukları ve gereksiz satır başlarını düzelt
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();
  }

  /**
   * Metin / Sayfa Analizi Yap ve Gramer + Kelimeleri Ayrıştır
   */
  scanText(rawText, pageTitle = "Sayfa Taraması") {
    return this.analyzeText(rawText, pageTitle);
  }

  /**
   * Google Gemini AI ile Derin Sayfa Analizi, OCR Hata Düzeltme & Zengin Gramer Çıkarma
   */
  async scanTextWithGemini(rawText, pageTitle = "Gemini AI Sayfa Analizi") {
    if (!window.geminiAI || !window.geminiAI.hasApiKey()) {
      throw new Error('NO_API_KEY');
    }

    const geminiData = await window.geminiAI.analyzePage(rawText);
    
    // Map Gemini words to our format
    const extractedWords = (geminiData.words || []).map(w => {
      let lookup = window.wordLookup ? window.wordLookup.lemmatize(w.en) : null;
      return {
        en: w.en,
        tr: w.tr || (lookup ? lookup.tr : 'Kelime'),
        pos: w.pos || w.type_label || (lookup ? lookup.type_label : 'Kelime'),
        count: w.count || 1,
        isStopWord: false
      };
    });

    // Map Gemini grammar points to our format
    const grammarMatches = (geminiData.grammar_points || []).map(gp => ({
      key: 'gemini_grammar',
      structure: gp.structure || 'Gramer Konusu',
      rule: gp.rule || 'Kural açıklaması',
      sentence: gp.sentence || '',
      unit_id: 'fh_unit_1',
      unit_code: gp.unit_code || '9. Sınıf',
      subtopic_index: 0
    }));

    const result = {
      id: "scan_gemini_" + Date.now(),
      title: pageTitle,
      date: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      rawText: rawText,
      cleanedText: geminiData.cleaned_text || rawText,
      summaryTr: geminiData.summary_tr || '',
      cefrLevel: geminiData.cefr_level || 'A2/B1',
      isGemini: true,
      tokenCount: (geminiData.cleaned_text || rawText).split(/\s+/).length,
      uniqueWordCount: extractedWords.length,
      grammarMatches: grammarMatches,
      extractedWords: extractedWords
    };

    this.currentAnalysis = result;
    this.scannedHistory.unshift(result);
    if (this.scannedHistory.length > 20) this.scannedHistory.pop();
    this.saveHistory();

    return result;
  }

  analyzeText(rawText, pageTitle = "Fly Higher Ders Sayfası", unitId = "fh_unit_1") {
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return {
        tokenCount: 0,
        uniqueWordCount: 0,
        grammarMatches: [],
        extractedWords: []
      };
    }

    const cleanText = rawText.trim();
    
    // 1. Cümleleri ayır
    const sentences = cleanText
      .split(/(?<=[.?!])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    // 2. Kelimeleri ayıkla ve frekans analizi yap
    const tokens = cleanText.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || [];
    const wordFreqMap = {};

    tokens.forEach(t => {
      const clean = t.toLowerCase().replace(/'s$/, '').trim();
      if (clean.length >= 2) {
        wordFreqMap[clean] = (wordFreqMap[clean] || 0) + 1;
      }
    });

    // 3. Stop-words filtreleme
    const basicStopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'had', 'her', 'was',
      'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
      'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'say', 'she', 'too', 'use',
      'this', 'that', 'from', 'they', 'have', 'were', 'which', 'their', 'there', 'been'
    ]);

    const extractedWords = [];

    Object.keys(wordFreqMap).forEach(word => {
      let lookup = window.wordLookup ? window.wordLookup.lemmatize(word) : null;
      
      const isStopWord = basicStopWords.has(word);
      const meaning = lookup && lookup.tr ? lookup.tr : this.fallbackMeaning(word);
      const pos = lookup && lookup.type_label ? lookup.type_label : (lookup && lookup.type ? lookup.type : 'Kelime');

      // Önemsiz kelimeleri filtrele, anlamlı olanları listeye al
      if (!isStopWord || wordFreqMap[word] > 2) {
        extractedWords.push({
          en: word,
          tr: meaning,
          pos: pos,
          count: wordFreqMap[word],
          isStopWord
        });
      }
    });

    // Frekansa göre sırala
    extractedWords.sort((a, b) => b.count - a.count || a.en.localeCompare(b.en));

    // 4. Gramer Yapılarını Cümlelerle Eşleştirerek Tespit Et
    const grammarMatches = this.detectGrammarWithSentences(sentences, cleanText);

    const result = {
      id: "scan_" + Date.now(),
      title: pageTitle,
      unitId,
      date: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      rawText: cleanText,
      tokenCount: tokens.length,
      totalWordsCount: tokens.length,
      uniqueWordCount: Object.keys(wordFreqMap).length,
      uniqueWordsCount: Object.keys(wordFreqMap).length,
      grammarMatches,
      detectedGrammar: grammarMatches,
      extractedWords: extractedWords.slice(0, 60),
      keyVocabulary: extractedWords.slice(0, 60)
    };

    this.currentAnalysis = result;
    this.scannedHistory.unshift(result);
    if (this.scannedHistory.length > 20) this.scannedHistory.pop();
    this.saveHistory();

    // Auto-enrich any unknown words in background with parallel fetch
    setTimeout(() => {
      this.enrichUnknownWords(result.extractedWords);
    }, 50);

    return result;
  }

  /**
   * Bilinmeyen kelimelerin Türkçe karşılıklarını paralel hızlı çeviriyle anında getirir
   */
  async enrichUnknownWords(wordList) {
    if (!wordList || !Array.isArray(wordList)) return;
    const unknownItems = wordList.filter(w => !w.tr || w.tr.includes('aranıyor') || w.tr === 'Sözlükte anlamı aranabilir' || w.tr === 'Kelime');
    if (unknownItems.length === 0) return;

    const translatePromises = unknownItems.slice(0, 30).map(async (item) => {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(item.en)}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json[0] && json[0][0] && json[0][0][0]) {
            const tr = json[0][0][0].trim();
            item.tr = tr;
            if (window.wordLookup) {
              window.wordLookup.cache[item.en] = { tr, type_label: item.pos || 'Kelime', icon: '📖', wordEn: item.en };
              window.wordLookup.saveCache();
            }
            // Update card in DOM if visible
            const cards = document.querySelectorAll('.school-word-card');
            cards.forEach(card => {
              const enEl = card.querySelector('.word-en');
              if (enEl && enEl.textContent.trim().toLowerCase() === item.en.toLowerCase()) {
                const trEl = card.querySelector('.word-tr');
                if (trEl) {
                  trEl.textContent = tr;
                  trEl.style.color = '#38bdf8';
                }
              }
            });
          }
        }
      } catch (e) {}
    });

    await Promise.allSettled(translatePromises);
  }

  /**
   * Gramer Kurallarını Gerçek Cümlelerle Eşleştir
   */
  detectGrammarWithSentences(sentences, fullText) {
    const matches = [];
    const addedRules = new Set();

    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();

      // 1. Past Continuous (was/were + V-ing)
      if (/\b(was|were)\s+[a-z]+ing\b/i.test(sentence) && !addedRules.has('past_continuous')) {
        matches.push({
          key: 'past_continuous',
          structure: "Past Continuous Tense (was/were + V-ing)",
          rule: "Geçmişte belirli bir zamanda devam etmekte olan süreç",
          sentence: sentence,
          unit_id: 'fh_unit_1',
          unit_code: 'Unit 1',
          subtopic_index: 1
        });
        addedRules.add('past_continuous');
      }

      // 2. Present Perfect (have/has + V3)
      if (/\b(have|has)\s+([a-z]+ed|been|gone|seen|done|visited|written|read|learned|discovered)\b/i.test(sentence) && !addedRules.has('present_perfect')) {
        matches.push({
          key: 'present_perfect',
          structure: "Present Perfect Tense (have/has + V3)",
          rule: "Geçmişte olup etkisi devam eden veya yaşam tecrübeleri",
          sentence: sentence,
          unit_id: 'fh_unit_2',
          unit_code: 'Unit 2',
          subtopic_index: 0
        });
        addedRules.add('present_perfect');
      }

      // 3. Passive Voice (is/are/was/were/been + V3)
      if (/\b(is|are|was|were|been|being)\s+([a-z]+ed|written|made|built|invented|watched|used|produced|discovered|stolen)\b/i.test(sentence) && !addedRules.has('passive')) {
        matches.push({
          key: 'passive',
          structure: "Passive Voice (Edilgen Çatı: be + V3)",
          rule: "Yapılan eylemin kendisini ve nesneyi öne çıkaran çatı",
          sentence: sentence,
          unit_id: 'fh_unit_6',
          unit_code: 'Unit 6',
          subtopic_index: 0
        });
        addedRules.add('passive');
      }

      // 4. Conditionals (If Clauses)
      if (/\bif\b/i.test(sentence) && !addedRules.has('conditionals')) {
        matches.push({
          key: 'conditionals',
          structure: "Conditionals (Şart Cümlesi - If Clause)",
          rule: "Eğer koşulu (Zero & First Conditionals)",
          sentence: sentence,
          unit_id: 'fh_unit_7',
          unit_code: 'Unit 7',
          subtopic_index: 0
        });
        addedRules.add('conditionals');
      }

      // 5. Modals of Obligation & Advice
      if (/\b(must|should|mustn't|shouldn't|have to|has to|don't have to|doesn't have to|can|could|might)\b/i.test(sentence) && !addedRules.has('modals')) {
        matches.push({
          key: 'modals',
          structure: "Modals (Zorunluluk, Yasak & Tavsiye Kipleri)",
          rule: "Must, Have to, Musn't, Should ile kural ve öneri bildirme",
          sentence: sentence,
          unit_id: 'fh_unit_4',
          unit_code: 'Unit 4',
          subtopic_index: 0
        });
        addedRules.add('modals');
      }

      // 6. Time Clauses (When / While / As soon as / Unless)
      if (/\b(when|while|as soon as|unless)\b/i.test(sentence) && !addedRules.has('time_clauses')) {
        matches.push({
          key: 'time_clauses',
          structure: "Time Clauses (When / While / Unless Bağlaçları)",
          rule: "Zaman ve durum bağlacı ile birleşik cümle kurma",
          sentence: sentence,
          unit_id: 'fh_unit_1',
          unit_code: 'Unit 1',
          subtopic_index: 2
        });
        addedRules.add('time_clauses');
      }

      // 7. Comparatives & Superlatives
      if (/\b(more\s+[a-z]+|the\s+most\s+[a-z]+|[a-z]+er\s+than|as\s+[a-z]+\s+as|too\s+[a-z]+|[a-z]+\s+enough)\b/i.test(sentence) && !addedRules.has('comparatives')) {
        matches.push({
          key: 'comparatives',
          structure: "Comparatives & Superlatives (Karşılaştırma ve Üstünlük)",
          rule: "Sıfatlarda karşılaştırma (-er/more), en üstünlük ve Too/Enough",
          sentence: sentence,
          unit_id: 'fh_unit_5',
          unit_code: 'Unit 5',
          subtopic_index: 0
        });
        addedRules.add('comparatives');
      }

      // 8. Relative Clauses (Who, Which, That, Where, Whose)
      if (/\b(who|which|whose|where)\s+[a-z]+/i.test(sentence) && !addedRules.has('relatives')) {
        matches.push({
          key: 'relatives',
          structure: "Relative Clauses (Sıfat Cümlecikleri: Who, Which, Where)",
          rule: "İsimleri tanımlayan ve niteleyen ilgi zamirleri",
          sentence: sentence,
          unit_id: 'fh_unit_8',
          unit_code: 'Unit 8',
          subtopic_index: 0
        });
        addedRules.add('relatives');
      }

      // 9. Used to
      if (/\b(used to|didn't use to)\b/i.test(sentence) && !addedRules.has('used_to')) {
        matches.push({
          key: 'used_to',
          structure: "Used to (Geçmiş Alışkanlıklar)",
          rule: "Eskiden yapılıp artık terk edilmiş geçmiş alışkanlıklar",
          sentence: sentence,
          unit_id: 'fh_unit_8',
          unit_code: 'Unit 8',
          subtopic_index: 2
        });
        addedRules.add('used_to');
      }

      // 10. Future Forms (Will / Going to)
      if (/\b(will|won't|going to)\s+[a-z]+/i.test(sentence) && !addedRules.has('future_forms')) {
        matches.push({
          key: 'future_forms',
          structure: "Future Forms (Will vs. Be Going To)",
          rule: "Gelecek zaman planları, tahminler ve anlık kararlar",
          sentence: sentence,
          unit_id: 'fh_unit_3',
          unit_code: 'Unit 3',
          subtopic_index: 0
        });
        addedRules.add('future_forms');
      }

      // 11. Present Simple vs Continuous
      if (/\b(always|usually|often|sometimes|never|every\s+day|now|at the moment|currently)\b/i.test(sentence) && !addedRules.has('present_simple_cont')) {
        matches.push({
          key: 'present_simple_cont',
          structure: "Present Simple vs. Present Continuous & State Verbs",
          rule: "Geniş zaman alışkanlıkları ve şimdiki zaman eylemleri",
          sentence: sentence,
          unit_id: 'fh_unit_starter',
          unit_code: 'Welcome Unit',
          subtopic_index: 0
        });
        addedRules.add('present_simple_cont');
      }
    });

    if (matches.length === 0) {
      matches.push({
        key: 'svompt',
        structure: "Present & Past SVOMPT Dizilimi",
        rule: "Standart İngilizce Özne + Fiil + Nesne cümle yapısı",
        sentence: sentences[0] || fullText.slice(0, 80),
        unit_id: 'fh_unit_starter',
        unit_code: 'Welcome Unit',
        subtopic_index: 0
      });
    }

    return matches;
  }

  fallbackMeaning(word) {
    return "Kelime";
  }
}

// Global instance
window.bookScanner = new BookScannerEngine();
