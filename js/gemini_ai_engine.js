/**
 * 🤖 Google Gemini AI Engine for Intelligent Book Scanning & Grammar Analysis
 * - Direct REST API integration with Gemini 1.5 Flash & 2.0 Flash
 * - Fixes OCR typos (e.g., '1o' -> 'to', 'prapares' -> 'prepares', 'motwation' -> 'motivation')
 * - Generates contextual Turkish translations, CEFR levels, and grammatical analysis
 * - Seamless fallback to free Google Translate & offline dictionary
 */

class GeminiAIEngine {
  constructor() {
    this.apiKey = localStorage.getItem('english_app_gemini_api_key') || '';
    this.model = 'gemini-1.5-flash';
    this.isAnalyzing = false;
  }

  getApiKey() {
    return this.apiKey || localStorage.getItem('english_app_gemini_api_key') || '';
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (this.apiKey) {
      localStorage.setItem('english_app_gemini_api_key', this.apiKey);
    } else {
      localStorage.removeItem('english_app_gemini_api_key');
    }
  }

  hasApiKey() {
    return Boolean(this.getApiKey() && this.getApiKey().length > 10);
  }

  /**
   * Gemini 1.5 Flash ile Sayfa ve OCR Metnini Analiz Et
   */
  async analyzePage(rawText) {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('NO_API_KEY');
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Analiz edilecek metin boş.');
    }

    this.isAnalyzing = true;

    const systemPrompt = `You are an expert English teacher for 9th-grade Turkish high school students (A2/B1/B2 level).
Analyze the provided English textbook / OCR text and return a strict JSON response.

Fix any OCR spelling artifacts (e.g., '1o' -> 'to', 'prapares' -> 'prepares', 'motwation' -> 'motivation', ignore footer urls).

Return strictly JSON with the following structure:
{
  "cleaned_text": "Cleaned and corrected English text with OCR errors fixed",
  "summary_tr": "Metnin 1-2 cümlelik Türkçe kısa özeti",
  "cefr_level": "A2" | "B1" | "B2",
  "words": [
    {
      "en": "english word in base or natural form",
      "tr": "doğal ve doğru Türkçe anlamı",
      "pos": "Fiil (Verb) / İsim (Noun) / Sıfat (Adjective) / Zarf (Adverb) / Bağlaç / Kalıp",
      "type_label": "Sıfat / Fiil / İsim vb.",
      "count": 1
    }
  ],
  "grammar_points": [
    {
      "structure": "Gramer Konusu (Örn: Present Simple vs. Continuous, Modals, Relative Clauses)",
      "rule": "Kuralın Türkçe kısa açıklaması",
      "sentence": "Metinde geçen örnek cümle",
      "unit_code": "9. Sınıf"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${key}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nHere is the scanned text to analyze:\n"""\n${rawText}\n"""` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status} Hatası`;
        throw new Error(`Gemini API Hatası: ${errMsg}`);
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Gemini API boş yanıt döndürdü.');
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Gemini API yanıtı JSON olarak ayrıştırılamadı.');
        }
      }

      this.isAnalyzing = false;
      return parsed;
    } catch (err) {
      this.isAnalyzing = false;
      console.error('Gemini API Error:', err);
      throw err;
    }
  }

  /**
   * Open Gemini API Key Configuration Modal
   */
  openConfigModal(onSuccessCallback = null) {
    const existing = document.getElementById('gemini-config-modal');
    if (existing) existing.remove();

    const currentKey = this.getApiKey();
    const modalHtml = `
      <div class="modal-overlay" id="gemini-config-modal" style="display:flex;">
        <div class="modal-card" style="max-width:540px; width:92%; border:2px solid #818cf8; box-shadow:0 0 35px rgba(129,140,248,0.3);">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.6rem;">🤖</span>
              <h3 style="color:#ffffff; font-size:1.15rem; font-weight:800; margin:0;">Gemini AI API Bağlantısı</h3>
            </div>
            <button class="icon-btn" onclick="document.getElementById('gemini-config-modal').remove()">✕</button>
          </div>

          <div style="font-size:0.85rem; color:#cbd5e1; line-height:1.5; margin-bottom:16px;">
            <p>
              Google Gemini AI entegrasyonu ile kitap sayfalarınızdaki <strong>OCR yazım hataları otomatik düzeltilir</strong>, tüm kelimelerin tam Türkçe anlamları ve cümle gramer analizleri saniyeler içinde çıkarılır.
            </p>
            <div style="background:rgba(56,189,248,0.1); border-left:3px solid #38bdf8; padding:10px 12px; border-radius:6px; margin:10px 0;">
              <strong style="color:#38bdf8;">🎁 Google AI Studio'dan Ücretsiz Anahtar Alın:</strong><br>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#93c5fd; text-decoration:underline; font-weight:700;">
                Google AI Studio API Key Sayfası (Ücretsiz Alın) ↗
              </a>
            </div>
          </div>

          <div class="form-row" style="margin-bottom:12px;">
            <label style="font-size:0.82rem; font-weight:700; color:#ffffff; margin-bottom:6px; display:block;">
              🔑 Google Gemini API Anahtarınız (AIzaSy...):
            </label>
            <input type="password" id="gemini-api-key-input" class="select-input" 
                   placeholder="AIzaSy..." value="${currentKey}" 
                   style="width:100%; font-family:monospace; font-size:0.9rem;">
          </div>

          <div id="gemini-modal-status-msg" style="font-size:0.82rem; margin-bottom:14px; min-height:20px;"></div>

          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            ${currentKey ? `
              <button class="btn-secondary" style="color:#ef4444; border-color:#ef4444;" onclick="geminiAI.removeKey()">
                🗑️ Anahtarı Sil
              </button>
            ` : '<div></div>'}
            
            <div style="display:flex; gap:8px;">
              <button class="btn-secondary" onclick="document.getElementById('gemini-config-modal').remove()">
                Kapat
              </button>
              <button class="btn-primary" id="gemini-save-btn" style="background:linear-gradient(135deg, #6366f1, #38bdf8);" onclick="geminiAI.saveKeyFromModal()">
                💾 Test Et & Etkinleştir
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this._onSuccessCallback = onSuccessCallback;
  }

  async saveKeyFromModal() {
    const input = document.getElementById('gemini-api-key-input');
    const key = input ? input.value.trim() : '';
    const statusMsgEl = document.getElementById('gemini-modal-status-msg');
    const saveBtn = document.getElementById('gemini-save-btn');

    if (!key) {
      if (statusMsgEl) {
        statusMsgEl.innerHTML = `<span style="color:#f87171;">⚠️ Lütfen geçerli bir Gemini API anahtarı girin.</span>`;
      }
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '🔄 Doğrulanıyor...';
    }
    if (statusMsgEl) {
      statusMsgEl.innerHTML = `<span style="color:#38bdf8;">🔄 Google Gemini API bağlantısı test ediliyor...</span>`;
    }

    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${key}`;
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with OK.' }] }]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errDetail = errJson.error?.message || `HTTP ${res.status}`;
        throw new Error(`API Hatası: ${errDetail}`);
      }

      this.setApiKey(key);
      if (statusMsgEl) {
        statusMsgEl.innerHTML = `<span style="color:#4ade80;">✅ Başarılı! Gemini 1.5 Flash bağlandı.</span>`;
      }

      setTimeout(() => {
        const modal = document.getElementById('gemini-config-modal');
        if (modal) modal.remove();
        if (window.app) {
          window.app.showToast('✅ Google Gemini AI Başarıyla Bağlandı! (+20 XP)');
        }
        const btnStatus = document.getElementById('btn-gemini-status');
        if (btnStatus) {
          btnStatus.innerHTML = '<span>🤖</span><span>Gemini AI: Aktif ✅</span>';
          btnStatus.style.borderColor = '#38bdf8';
          btnStatus.style.background = 'rgba(56,189,248,0.2)';
        }
        if (this._onSuccessCallback && typeof this._onSuccessCallback === 'function') {
          this._onSuccessCallback();
          this._onSuccessCallback = null;
        }
      }, 700);

    } catch (err) {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 Test Et & Etkinleştir';
      }
      if (statusMsgEl) {
        statusMsgEl.innerHTML = `<span style="color:#f87171;">❌ ${err.message}</span>`;
      }
    }
  }

  removeKey() {
    this.setApiKey('');
    const modal = document.getElementById('gemini-config-modal');
    if (modal) modal.remove();
    if (window.app) {
      window.app.showToast('Gemini API anahtarı kaldırıldı.');
    }
    const btnStatus = document.getElementById('btn-gemini-status');
    if (btnStatus) {
      btnStatus.innerHTML = '<span>🤖</span><span>Gemini AI: API Bağla 🔑</span>';
      btnStatus.style.borderColor = 'rgba(255,255,255,0.2)';
      btnStatus.style.background = 'rgba(255,255,255,0.05)';
    }
  }
}

// Global instance
window.geminiAI = new GeminiAIEngine();
