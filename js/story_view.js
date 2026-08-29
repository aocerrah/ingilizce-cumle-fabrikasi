/**
 * Ela'nın Macerası (The Quest for the Lost Academy)
 * 10 Chapters Interactive Parallel Story Reader with TTS Audio
 */

class StoryView {
  constructor() {
    this.currentChapter = 1;
    this.showTranslations = true;
  }

  render() {
    const container = document.getElementById('story-content-area');
    if (!container) return;

    const chapters = APP_DATA.story_chapters || [];
    const chapterData = chapters.find(c => c.chapter === this.currentChapter) || chapters[0];

    container.innerHTML = `
      <div class="section-header">
        <h2>📜 Ela'nın İngilizce Macerası</h2>
        <p>A2 & B1 Seviye Fiillerle Dolu Paralel Okuma Hikayesi (The Quest for the Lost Academy)</p>
      </div>

      <!-- Chapter Selector Buttons -->
      <div class="chapter-selector-bar">
        ${chapters.map(c => `
          <button class="ch-btn ${this.currentChapter === c.chapter ? 'active' : ''}" 
                  onclick="storyView.setChapter(${c.chapter})">
            Bölüm ${c.chapter}
          </button>
        `).join('')}
      </div>

      <!-- Story Reader Card -->
      <div class="story-reader-card">
        <div class="story-header">
          <div>
            <span style="font-size:0.75rem; font-weight:800; color:var(--accent);">BÖLÜM ${chapterData.chapter}</span>
            <h3>${chapterData.title_en}</h3>
            <p>🇹🇷 ${chapterData.title_tr}</p>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-primary" style="background:var(--accent); color:#ffffff;" onclick="storyView.playChapterAudio()">
              🔊 Bölümü Dinle
            </button>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">
          <label style="font-size:0.78rem; color:var(--text-secondary); cursor:pointer;">
            <input type="checkbox" ${this.showTranslations ? 'checked' : ''} onchange="storyView.toggleTranslations(this.checked)">
            Türkçe Çevirileri Göster
          </label>
        </div>

        <!-- Story Paragraphs -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${this.renderStoryParagraphs(chapterData)}
        </div>
      </div>
    `;
  }

  renderStoryParagraphs(chapterData) {
    if (chapterData.paragraphs && chapterData.paragraphs.length > 0) {
      return chapterData.paragraphs.map(([en, tr]) => `
        <div class="story-paragraph">
          <div class="story-en-p">${this.highlightVerbs(en)}</div>
          ${this.showTranslations ? `<div class="story-tr-p">${tr}</div>` : ''}
          <div style="display:flex; justify-content:flex-end;">
            <button class="play-voice-btn" onclick="speechEngine.speak('${en.replace(/'/g, "\\'")}')">
              🔊 Bu Paragrafı Dinle
            </button>
          </div>
        </div>
      `).join('');
    }

    // Fallback if paragraphs list is single block
    return `
      <div class="story-paragraph">
        <div class="story-en-p">${this.highlightVerbs(chapterData.en_text)}</div>
        ${this.showTranslations ? `<div class="story-tr-p">${chapterData.tr_text}</div>` : ''}
      </div>
    `;
  }

  highlightVerbs(text) {
    if (!text) return '';
    // Wrap all words interactively for 1-click lookup & addition to custom notebook
    if (window.wordLookup && typeof window.wordLookup.wrap === 'function') {
      return window.wordLookup.wrap(text);
    }

    const targetVerbs = ["achieve", "wakes up", "eats", "walks", "noticed", "seemed", "belonged", "decided", "open", "found", "written", "contain", "called", "loves", "discovered", "came", "looked", "solve", "develop", "impress", "prepare", "start", "agreed", "promised", "support", "complete", "described", "built", "change", "whispered", "realized", "begun"];
    
    let formatted = text;
    targetVerbs.forEach(v => {
      const regex = new RegExp(`\\b(${v})\\b`, 'gi');
      formatted = formatted.replace(regex, '<span style="color:var(--primary); font-weight:700;">$1</span>');
    });
    return formatted;
  }

  setChapter(chNum) {
    this.currentChapter = chNum;
    this.render();
  }

  toggleTranslations(show) {
    this.showTranslations = show;
    this.render();
  }

  playChapterAudio() {
    const chapters = APP_DATA.story_chapters || [];
    const chapterData = chapters.find(c => c.chapter === this.currentChapter) || chapters[0];
    if (chapterData) {
      speechEngine.speak(chapterData.en_text);
    }
  }
}

// Global instance
window.storyView = new StoryView();
