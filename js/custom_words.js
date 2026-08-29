/**
 * Kelime Defterim (Custom Vocabulary Manager)
 * Clean, lightweight vocabulary manager: English Word + Turkish Meaning.
 * No forced or artificial template sentences.
 */

class CustomWordsManager {
  constructor() {
    this.customWords = this.loadCustomWords();
    this.cleanLegacyWords();
  }

  loadCustomWords() {
    try {
      const saved = localStorage.getItem('english_app_custom_vocab');
      if (saved) return JSON.parse(saved);
      
      // Migrate from old format if exists
      const oldSaved = localStorage.getItem('english_app_custom_verbs');
      if (oldSaved) {
        const oldList = JSON.parse(oldSaved);
        return oldList.map(w => ({
          id: w.id || Date.now(),
          wordEn: w.verb || w.wordEn,
          meaningTr: w.meaning || w.meaningTr,
          mastered: false,
          favorite: false,
          date: new Date().toLocaleDateString('tr-TR')
        }));
      }
      return [
        { id: 1, wordEn: "Soccer", meaningTr: "Futbol", mastered: false, favorite: false, date: "Bugün" },
        { id: 2, wordEn: "Chair", meaningTr: "Sandalye", mastered: false, favorite: false, date: "Bugün" }
      ];
    } catch (e) {
      return [];
    }
  }

  cleanLegacyWords() {
    // Ensure clean fields
    this.customWords = this.customWords.map(w => ({
      id: w.id || Date.now(),
      wordEn: (w.wordEn || w.verb || '').trim(),
      meaningTr: (w.meaningTr || w.meaning || '').trim(),
      mastered: !!w.mastered,
      favorite: !!w.favorite,
      date: w.date || 'Bugün'
    })).filter(w => w.wordEn.length > 0 && w.meaningTr.length > 0);

    this.save();
  }

  save() {
    localStorage.setItem('english_app_custom_vocab', JSON.stringify(this.customWords));
    if (window.verbsView) window.verbsView.render();
    if (window.vocabTrainer) window.vocabTrainer.render();
    if (window.app) window.app.renderHome();
  }

  hasWord(wordEn) {
    if (!wordEn) return false;
    const clean = wordEn.trim().toLowerCase();
    return this.customWords.some(w => w.wordEn.toLowerCase() === clean);
  }

  addWord(wordEn, meaningTr, typeLabel = 'Bilinmeyen Kelime') {
    if (!wordEn || !meaningTr) return false;

    const cleanEn = wordEn.trim().charAt(0).toUpperCase() + wordEn.trim().slice(1);
    const cleanTr = meaningTr.trim();

    // Check if word already exists
    const existingIndex = this.customWords.findIndex(w => w.wordEn.toLowerCase() === cleanEn.toLowerCase());
    if (existingIndex >= 0) {
      // Update existing word to top with new meaning if provided
      const existing = this.customWords.splice(existingIndex, 1)[0];
      existing.meaningTr = cleanTr || existing.meaningTr;
      existing.typeLabel = typeLabel || existing.typeLabel || 'Bilinmeyen Kelime';
      this.customWords.unshift(existing);
      this.save();
      return existing;
    }

    const newWord = {
      id: Date.now(),
      wordEn: cleanEn,
      meaningTr: cleanTr,
      typeLabel: typeLabel,
      mastered: false,
      favorite: false,
      date: new Date().toLocaleDateString('tr-TR')
    };

    this.customWords.unshift(newWord);
    this.save();

    if (window.app) window.app.addXP(3);
    return newWord;
  }

  deleteWord(id) {
    this.customWords = this.customWords.filter(w => w.id !== id);
    this.save();
  }

  toggleMastered(id) {
    const item = this.customWords.find(w => w.id === id);
    if (item) {
      item.mastered = !item.mastered;
      if (item.mastered && window.app) window.app.addXP(2);
      this.save();
    }
  }

  toggleFavorite(id) {
    const item = this.customWords.find(w => w.id === id);
    if (item) {
      item.favorite = !item.favorite;
      this.save();
    }
  }

  getAll() {
    return this.customWords;
  }

  getAllVerbsCombined() {
    const base = (window.APP_DATA && window.APP_DATA.verbs) ? [...window.APP_DATA.verbs] : [];
    const custom = (this.customWords || []).map(cw => ({
      id: cw.id,
      verb: cw.wordEn,
      meaning: cw.meaningTr,
      level: 'Özel',
      level_label: 'Kelime Defterim',
      forms: { v1: cw.wordEn, v2: '-', v3: '-' },
      sentences: {
        positive: { en: `${cw.wordEn} (${cw.meaningTr})`, tr: cw.meaningTr },
        negative: { en: '', tr: '' },
        question: { en: '', tr: '' }
      }
    }));
    return [...base, ...custom];
  }
}

// Global instance
window.customWordsManager = new CustomWordsManager();
