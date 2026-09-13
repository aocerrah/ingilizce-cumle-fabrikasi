/**
 * 👩‍🏫 Full-Duplex Voice AI Tutor & Interactive Waveform Orb Engine
 * (Gerçek Zamanlı Sesli İngilizce Öğretmeni & Dalga Formlu Canlı Konuşma Koçu)
 * 
 * Features:
 * 1. 🔮 Real-time Canvas Waveform Orb (Web Audio API 60 FPS Visualizer).
 * 2. ⚡ Full-Duplex Continuous Hands-Free Call Mode with VAD & Instant Barge-In.
 * 3. 👩‍🏫 Genuine Teacher Persona: Speaks analysis, sentence improvement guidance, and natural follow-up questions.
 * 4. 🎛️ Optional Display Toggles:
 *    - 💬 Altyazı (Açık / Kapalı)
 *    - 🇹🇷 Türkçe Çeviri (Açık / Kapalı)
 *    - 💡 İpuçları (Açık / Kapalı)
 * 5. 🎯 Floating Live Coaching Badge (Instant polite grammar correction & encouragement).
 * 6. 🧠 Gemini 2.0 / 1.5 Flash Cloud AI + Deep Multi-Turn Offline Matrix (Zero repeats).
 * 7. 📜 Slide-up Transcript Drawer for full chat history & cards.
 */

class AITeacherEngine {
  constructor() {
    this.isOpen = false;
    this.isFullDuplexActive = false;
    this.isListening = false;
    this.isMuted = false;
    this.recognition = null;
    this.silenceTimer = null;
    this.currentTopic = 'school_routine';
    this.messages = [];
    this.isTeacherTyping = false;
    this.speechRate = 0.88;
    this.autoSpeak = true;
    this.isDrawerOpen = false;
    
    // Display Preferences
    this.showCaptions = localStorage.getItem('voice_pref_captions') !== 'false';
    this.showTranslation = localStorage.getItem('voice_pref_translation') !== 'false';
    this.showHints = localStorage.getItem('voice_pref_hints') !== 'false';

    // Waveform Orb Visualizer Instance
    this.visualizerOrb = null;
    this.micMediaStream = null;

    // Multi-turn State & History Tracking
    this.topicTurnCounts = {};
    this.askedQuestionKeys = new Set();
    this.sessionKeywords = [];

    // Voice Profiles
    this.selectedVoiceProfile = localStorage.getItem('english_app_voice_profile') || 'emily_studio';

    // Conversation Topics
    this.topics = [
      { id: 'school_routine', icon: '🏫', title: 'Okul & Günlük Rutin', desc: 'Dersler, sabah rutini ve okul aktiviteleri' },
      { id: 'food_cafe', icon: '🍕', title: 'Yemek & Kafe', desc: 'Restoran siparişi, favori yemekler ve tatlar' },
      { id: 'hobbies_sports', icon: '🎮', title: 'Hobiler & Spor', desc: 'Oyunlar, spor dalları ve boş zaman aktiviteleri' },
      { id: 'travel_holidays', icon: '✈️', title: 'Tatil & Gezi', desc: 'Gezilen şehirler, tatil planları ve maceralar' },
      { id: 'friends_family', icon: '👥', title: 'Arkadaşlar & Aile', desc: 'Kişilik özellikleri, aile ve arkadaşlık' },
      { id: 'future_dreams', icon: '🚀', title: 'Hayaller & Gelecek', desc: 'Gelecekteki hedefler, meslekler ve hayaller' },
      { id: 'free_talk', icon: '💬', title: 'Serbest Sohbet', desc: 'Öğretmen Emily ile dilediğin konuda sohbet et' }
    ];

    this.initSpeechRecognition();
  }

  /* =========================================================
     1. SPEECH RECOGNITION & FULL-DUPLEX VAD ENGINE
     ========================================================= */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.updateCallControlsUI();
          if (this.visualizerOrb && !window.speechEngine?.isSpeaking) {
            this.visualizerOrb.setState('listening');
          }
        };

        this.recognition.onresult = (event) => {
          if (this.isMuted) return;
          // Echo suppression: Ignore microphone input while teacher is speaking out loud
          if (window.speechEngine && window.speechEngine.isSpeaking) return;

          let fullTranscript = '';
          let hasFinal = false;

          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript + ' ';
            if (event.results[i].isFinal) {
              hasFinal = true;
            }
          }

          const activeText = fullTranscript.trim();
          if (!activeText) return;

          if (this.visualizerOrb) {
            this.visualizerOrb.setState('listening');
          }

          // Live visual feedback: Display student's spoken words immediately
          this.renderLiveCaption('student', activeText);

          // Mirror into quick input so user gets instant confirmation
          const quickInput = document.getElementById('voice-quick-input');
          if (quickInput && document.activeElement !== quickInput) {
            quickInput.value = activeText;
          }

          // Voice Activity Detection (VAD) Silence Timer
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
          }

          const delay = hasFinal ? 650 : 1100;
          this.silenceTimer = setTimeout(() => {
            if (activeText.length >= 2 && !this.isTeacherTyping) {
              // Stop recognition to reset session buffer & prevent picking up teacher's voice
              this.stopListening();
              if (quickInput) quickInput.value = '';
              this.processStudentSpokenSentence(activeText);
            }
          }, delay);
        };

        this.recognition.onerror = (event) => {
          console.warn("Speech recognition event:", event.error);
          if (event.error === 'not-allowed') {
            if (window.app && typeof window.app.showToast === 'function') {
              window.app.showToast("⚠️ Mikrofon izni verilmedi. Lütfen mikrofona izin verin.", "warning");
            }
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.isOpen && this.isFullDuplexActive && !this.isMuted && !window.speechEngine?.isSpeaking) {
            setTimeout(() => {
              if (this.isOpen && this.isFullDuplexActive && !this.isMuted && !window.speechEngine?.isSpeaking) {
                try {
                  this.recognition.start();
                  this.isListening = true;
                } catch (e) {}
              }
              this.updateCallControlsUI();
            }, 120);
          } else {
            this.updateCallControlsUI();
          }
        };
      } catch (e) {
        console.warn("Speech recognition not supported:", e);
      }
    }
  }

  async startMicrophoneAudioStream() {
    try {
      if (!this.micMediaStream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.micMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (this.visualizerOrb) {
          this.visualizerOrb.attachMicrophone(this.micMediaStream);
        }
      }
    } catch (e) {
      console.warn("Microphone stream access error:", e);
    }
  }

  startListening() {
    if (!this.recognition) return;
    try {
      this.startMicrophoneAudioStream();
      if (window.speechEngine && window.speechEngine.isSpeaking) {
        window.speechEngine.stop();
      }
      try { this.recognition.stop(); } catch(e) {}
      this.recognition.start();
      this.isListening = true;
      this.isFullDuplexActive = true;
      if (this.visualizerOrb) {
        this.visualizerOrb.setState('listening');
      }
      this.updateCallControlsUI();
    } catch (e) {
      console.warn("Could not start recognition:", e);
    }
  }

  stopListening() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.isFullDuplexActive = false;
    if (this.visualizerOrb && !window.speechEngine?.isSpeaking) {
      this.visualizerOrb.setState('idle');
    }
    this.updateCallControlsUI();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.recognition) {
        try { this.recognition.stop(); } catch (e) {}
      }
      if (this.visualizerOrb) {
        this.visualizerOrb.setState('idle');
      }
      if (window.app) window.app.showToast("🔇 Mikrofon kapatıldı.", "info");
    } else {
      this.startListening();
      if (window.app) window.app.showToast("🎙️ Mikrofon açıldı. Dinliyorum...", "info");
    }
    this.updateCallControlsUI();
  }

  /* =========================================================
     2. DISPLAY PREFERENCE TOGGLES (OPSİYONEL ALTYAZI & İPUCU)
     ========================================================= */
  toggleCaptions() {
    this.showCaptions = !this.showCaptions;
    localStorage.setItem('voice_pref_captions', this.showCaptions);
    const container = document.getElementById('voice-live-captions');
    const btn = document.getElementById('btn-toggle-captions');
    if (container) container.style.display = this.showCaptions ? 'flex' : 'none';
    if (btn) btn.classList.toggle('active', this.showCaptions);
    if (window.app) window.app.showToast(this.showCaptions ? "💬 Altyazı açıldı." : "💬 Altyazı gizlendi.", "info");
  }

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
    localStorage.setItem('voice_pref_translation', this.showTranslation);
    const trEl = document.getElementById('caption-text-tr');
    const btn = document.getElementById('btn-toggle-translation');
    if (trEl) trEl.style.display = (this.showTranslation && trEl.textContent) ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', this.showTranslation);
    if (window.app) window.app.showToast(this.showTranslation ? "🇹🇷 Türkçe çeviri açıldı." : "🇹🇷 Türkçe çeviri gizlendi.", "info");
  }

  toggleHints() {
    this.showHints = !this.showHints;
    localStorage.setItem('voice_pref_hints', this.showHints);
    const hintsEl = document.getElementById('voice-fast-hints');
    const btn = document.getElementById('btn-toggle-hints');
    if (hintsEl) hintsEl.style.display = this.showHints ? 'flex' : 'none';
    if (btn) btn.classList.toggle('active', this.showHints);
    if (window.app) window.app.showToast(this.showHints ? "💡 İpuçları açıldı." : "💡 İpuçları gizlendi.", "info");
  }

  /* =========================================================
     3. IMMERSIVE VOICE ROOM MODAL & UI CONTROLLER
     ========================================================= */
  openTeacherModal(initialTopic = 'school_routine') {
    this.currentTopic = initialTopic;
    this.isOpen = true;
    this.isFullDuplexActive = true;
    this.isMuted = false;

    if (!document.getElementById('ai-teacher-voice-room')) {
      this.createVoiceRoomDOM();
    }

    const modal = document.getElementById('ai-teacher-voice-room');
    modal.classList.add('active');

    // Initialize Canvas Orb Visualizer
    const canvas = document.getElementById('ai-teacher-orb-canvas');
    if (canvas && !this.visualizerOrb) {
      this.visualizerOrb = new AudioVisualizerOrb('ai-teacher-orb-canvas');
      this.visualizerOrb.init(canvas);
    }

    this.startMicrophoneAudioStream();
    this.updateGeminiStatusBadge();

    // If starting fresh, post first teacher greeting
    if (this.messages.length === 0) {
      this.startTopicConversation(this.currentTopic);
    } else {
      const lastMsg = [...this.messages].reverse().find(m => m.sender === 'teacher');
      if (lastMsg) {
        this.renderLiveCaption('teacher', lastMsg.textEn, lastMsg.textTr);
      }
      this.renderDrawerMessages();
    }

    setTimeout(() => {
      this.startListening();
    }, 600);
  }

  closeTeacherModal() {
    this.stopListening();
    if (window.speechEngine) {
      window.speechEngine.stop();
    }
    if (this.visualizerOrb) {
      this.visualizerOrb.setState('idle');
    }
    const modal = document.getElementById('ai-teacher-voice-room');
    if (modal) {
      modal.classList.remove('active');
    }
    this.isOpen = false;
  }

  createVoiceRoomDOM() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'ai-teacher-voice-room';
    modalDiv.className = 'voice-room-overlay';
    modalDiv.innerHTML = `
      <div class="voice-room-container">
        <!-- Ambient Glowing Background Stars & Nebula -->
        <div class="ambient-glow-orb ambient-1"></div>
        <div class="ambient-glow-orb ambient-2"></div>

        <!-- Top Header Bar -->
        <div class="voice-room-header">
          <div class="voice-tutor-identity">
            <div class="tutor-pulse-dot"></div>
            <div>
              <h3 class="tutor-name">Teacher Emily</h3>
              <span class="tutor-sub">Canlı İngilizce Öğretmeni & Konuşma Koçu</span>
            </div>
          </div>

          <div class="voice-room-header-tools">
            <!-- Voice Persona Picker -->
            <div class="voice-persona-select-wrap">
              <select id="voice-room-persona-select" onchange="aiTeacher.handleVoiceChange(this.value)" title="Ses Karakteri">
                <option value="emily_studio" ${this.selectedVoiceProfile === 'emily_studio' ? 'selected' : ''}>👩‍🦰 Emily (Doğal Kadın Sesi)</option>
                <option value="alex_studio" ${this.selectedVoiceProfile === 'alex_studio' ? 'selected' : ''}>👨‍🦱 Alex (Doğal Erkek Sesi)</option>
                <option value="device_neural" ${this.selectedVoiceProfile === 'device_neural' ? 'selected' : ''}>🎙️ Cihaz Sentezleyicisi</option>
              </select>
            </div>

            <!-- Display Toggles -->
            <button class="voice-tool-btn ${this.showCaptions ? 'active' : ''}" id="btn-toggle-captions" onclick="aiTeacher.toggleCaptions()" title="Altyazı Aç/Kapat">
              💬 Altyazı
            </button>
            <button class="voice-tool-btn ${this.showTranslation ? 'active' : ''}" id="btn-toggle-translation" onclick="aiTeacher.toggleTranslation()" title="Türkçe Çeviri Aç/Kapat">
              🇹🇷 Çeviri
            </button>
            <button class="voice-tool-btn ${this.showHints ? 'active' : ''}" id="btn-toggle-hints" onclick="aiTeacher.toggleHints()" title="Cevap İpuçları Aç/Kapat">
              💡 İpuçları
            </button>

            <!-- Gemini AI Key Connector Button -->
            <button class="voice-gemini-btn" id="voice-room-gemini-btn" onclick="aiTeacher.openGeminiSettings()" title="Gemini 1.5 / 2.0 Flash Bağla">
              🤖 Gemini AI
            </button>

            <!-- Topic Quick Switcher -->
            <button class="voice-tool-btn" onclick="aiTeacher.toggleTopicDropdown()" id="btn-topic-selector" title="Konu Seç">
              📚 Konu
            </button>

            <!-- Chat Transcript Drawer Toggle -->
            <button class="voice-tool-btn" onclick="aiTeacher.toggleDrawer()" title="Sohbet Geçmişi">
              📜 Geçmiş
            </button>

            <!-- Close / End Call -->
            <button class="voice-close-btn" onclick="aiTeacher.closeTeacherModal()" title="Kapat">✕</button>
          </div>
        </div>

        <!-- Topic Dropdown Menu Overlay -->
        <div class="voice-topic-menu" id="voice-topic-menu" style="display:none;">
          <div class="topic-menu-grid">
            ${this.topics.map(t => `
              <button class="topic-menu-item ${t.id === this.currentTopic ? 'active' : ''}" onclick="aiTeacher.switchTopic('${t.id}')">
                <span class="t-icon">${t.icon}</span>
                <div class="t-text">
                  <strong>${t.title}</strong>
                  <small>${t.desc}</small>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Center Stage: 3D Glowing Waveform Orb -->
        <div class="voice-orb-stage">
          <!-- Floating Live Grammar Coaching Pill -->
          <div class="floating-coach-pill" id="floating-coach-pill" style="display:none;"></div>

          <!-- Interactive 60 FPS Canvas Orb -->
          <div class="orb-canvas-wrapper" onclick="aiTeacher.handleOrbClick()">
            <canvas id="ai-teacher-orb-canvas" width="340" height="340"></canvas>
            <div class="orb-status-text" id="orb-status-text">Dinliyor 🎙️</div>
          </div>

          <!-- Live Flowing Subtitles / Captions -->
          <div class="voice-live-captions-container" id="voice-live-captions" style="${this.showCaptions ? 'display:flex;' : 'display:none;'}">
            <div class="caption-speaker-badge" id="caption-speaker">👩‍🏫 Teacher Emily</div>
            <div class="caption-text-en" id="caption-text-en">Hello dear! Let's practice English speaking together.</div>
            <div class="caption-text-tr" id="caption-text-tr" style="${this.showTranslation ? 'display:block;' : 'display:none;'}">Merhaba canım! Birlikte İngilizce konuşma pratiği yapalım.</div>
          </div>

          <!-- Clickable Fast Suggestion Chips -->
          <div class="voice-fast-hints" id="voice-fast-hints" style="${this.showHints ? 'display:flex;' : 'display:none;'}"></div>

          <!-- Quick Text & Voice Input Bar -->
          <div class="voice-quick-input-bar">
            <input 
              type="text" 
              id="voice-quick-input" 
              placeholder="💬 İster mikrofona konuş, istersen buraya yaz..." 
              onkeydown="if(event.key==='Enter') aiTeacher.handleQuickSend()"
              autocomplete="off"
            />
            <button class="voice-quick-send-btn" onclick="aiTeacher.handleQuickSend()" title="Cevabı Gönder">
              <span>Gönder</span> 🚀
            </button>
          </div>
        </div>

        <!-- Bottom Controls Bar -->
        <div class="voice-room-bottom-bar">
          <button class="call-control-btn mute-btn ${this.isMuted ? 'muted' : ''}" id="btn-call-mute" onclick="aiTeacher.toggleMute()" title="Mikrofon Aç/Kapat">
            <span class="ctrl-icon">${this.isMuted ? '🔇' : '🎙️'}</span>
            <span class="ctrl-label">${this.isMuted ? 'Aç' : 'Sessiz'}</span>
          </button>

          <button class="call-control-btn listen-pulse-btn" id="btn-call-speak-trigger" onclick="aiTeacher.handleManualSpeakTrigger()" title="Konuşmaya Başla">
            <span class="ctrl-icon">🎙️</span>
            <span class="ctrl-label">Dinle / Konuş</span>
          </button>

          <button class="call-control-btn reset-btn" onclick="aiTeacher.restartConversation()" title="Yeniden Başlat">
            <span class="ctrl-icon">🔄</span>
            <span class="ctrl-label">Sıfırla</span>
          </button>

          <button class="call-control-btn end-call-btn" onclick="aiTeacher.closeTeacherModal()" title="Kapat">
            <span class="ctrl-icon">📞</span>
            <span class="ctrl-label">Bitir</span>
          </button>
        </div>

        <!-- Slide-up Chat Transcript Drawer -->
        <div class="voice-transcript-drawer" id="voice-transcript-drawer">
          <div class="drawer-header" onclick="aiTeacher.toggleDrawer()">
            <div class="drawer-handle"></div>
            <h4>📜 Sohbet Geçmişi, Analiz & Cümle İpuçları</h4>
            <button class="drawer-close-btn" onclick="aiTeacher.toggleDrawer()">✕</button>
          </div>
          <div class="drawer-chat-stream" id="drawer-chat-stream"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modalDiv);
  }

  handleQuickSend() {
    const input = document.getElementById('voice-quick-input');
    if (!input) return;
    const val = input.value.trim();
    if (val) {
      input.value = '';
      this.processStudentSpokenSentence(val);
    }
  }

  handleOrbClick() {
    if (window.speechEngine && window.speechEngine.isSpeaking) {
      window.speechEngine.stop();
      if (this.visualizerOrb) this.visualizerOrb.setState('listening');
      this.updateCallControlsUI();
    } else {
      this.startListening();
    }
  }

  handleManualSpeakTrigger() {
    this.startListening();
  }

  toggleTopicDropdown() {
    const menu = document.getElementById('voice-topic-menu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    const drawer = document.getElementById('voice-transcript-drawer');
    if (drawer) {
      drawer.classList.toggle('open', this.isDrawerOpen);
    }
  }

  handleVoiceChange(profile) {
    this.selectedVoiceProfile = profile;
    if (window.speechEngine) {
      window.speechEngine.setVoiceProfile(profile);
      const testMsg = profile === 'alex_studio' ? "Hello! I am Alex, ready to practice speaking with you." : "Hello dear! I am Emily, your English speaking teacher.";
      window.speechEngine.speak(testMsg);
    }
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(`🎙️ Ses ayarlandı: ${profile === 'alex_studio' ? 'Alex (Erkek)' : profile === 'emily_studio' ? 'Emily (Kadın)' : 'Cihaz Sesi'}`, "info");
    }
  }

  openGeminiSettings() {
    if (window.geminiAI && typeof window.geminiAI.showConfigModal === 'function') {
      window.geminiAI.showConfigModal(() => {
        this.updateGeminiStatusBadge();
      });
    }
  }

  updateGeminiStatusBadge() {
    const btn = document.getElementById('voice-room-gemini-btn');
    if (!btn) return;
    const hasKey = window.geminiAI && window.geminiAI.hasApiKey();
    if (hasKey) {
      btn.innerHTML = '🤖 Gemini AI: Aktif ✅';
      btn.classList.add('active');
    } else {
      btn.innerHTML = '🤖 Gemini AI (Ücretsiz Bağla)';
      btn.classList.remove('active');
    }
  }

  updateCallControlsUI() {
    const muteBtn = document.getElementById('btn-call-mute');
    if (muteBtn) {
      muteBtn.classList.toggle('muted', this.isMuted);
      muteBtn.innerHTML = `
        <span class="ctrl-icon">${this.isMuted ? '🔇' : '🎙️'}</span>
        <span class="ctrl-label">${this.isMuted ? 'Aç' : 'Sessiz'}</span>
      `;
    }
    const statusText = document.getElementById('orb-status-text');
    if (statusText) {
      if (this.isMuted) {
        statusText.textContent = 'Mikrofon Kapalı';
      } else if (this.isTeacherTyping) {
        statusText.textContent = 'Düşünüyor...';
      } else if (window.speechEngine && window.speechEngine.isSpeaking) {
        statusText.textContent = 'Konuşuyor 🔊';
      } else {
        statusText.textContent = 'Dinliyor 🎙️';
      }
    }
  }

  switchTopic(topicId) {
    this.currentTopic = topicId;
    const menu = document.getElementById('voice-topic-menu');
    if (menu) menu.style.display = 'none';

    this.restartConversation();
  }

  restartConversation() {
    this.topicTurnCounts[this.currentTopic] = 0;
    this.messages = [];
    this.startTopicConversation(this.currentTopic);
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast("🔄 Yeni sesli sohbet başlatıldı.", "info");
    }
  }

  /* =========================================================
     4. CONVERSATION LOGIC & STARTERS
     ========================================================= */
  startTopicConversation(topicId) {
    this.messages = [];
    this.topicTurnCounts[topicId] = 0;

    let starterEn = "";
    let starterTr = "";
    let starterHints = [];

    switch (topicId) {
      case 'school_routine':
        starterEn = "Hello dear! 😊 How was your day at school today? What is your favorite subject, and what time do you usually wake up?";
        starterTr = "Merhaba canım! 😊 Bugün okulda günün nasıl geçti? En sevdiğin ders hangisi ve genelde saat kaçta uyanırsın?";
        starterHints = [
          "My school day was great! I love English and science.",
          "I usually wake up at 7:00 AM on weekdays.",
          "It was a bit tiring, but I enjoyed my classes."
        ];
        break;

      case 'food_cafe':
        starterEn = "Hi there! 🍕 I love trying delicious foods. What did you have for breakfast or lunch today, and what is your favorite meal?";
        starterTr = "Selam! 🍕 Lezzetli yemekler denemeyi çok severim. Bugün kahvaltıda ne yedin ve en sevdiğin yemek nedir?";
        starterHints = [
          "I had eggs, cheese, and orange juice for breakfast.",
          "My favorite meal is homemade pasta and pizza.",
          "I really enjoy eating Turkish mantı and köfte."
        ];
        break;

      case 'hobbies_sports':
        starterEn = "Hey superstar! 🎮 What do you enjoy doing most in your free time? Do you prefer sports, reading books, or playing video games?";
        starterTr = "Selam süper star! 🎮 Boş zamanlarında ne yapmaktan hoşlanırsın? Spor yapmayı mı, kitap okumayı mı yoksa oyun oynamayı mı seversin?";
        starterHints = [
          "In my free time, I really love playing volleyball.",
          "I prefer reading adventure novels and listening to music.",
          "I like playing computer games with my friends on weekends."
        ];
        break;

      case 'travel_holidays':
        starterEn = "Hello adventurer! ✈️ If you could travel to any country in the world tomorrow, where would you love to go and why?";
        starterTr = "Merhaba maceracı! ✈️ Yarın dünyadaki herhangi bir ülkeye seyahat edebilseydin nereye gitmek isterdin ve neden?";
        starterHints = [
          "I would love to visit London to practice English fluently!",
          "I want to travel to Japan to explore Tokyo.",
          "I would go to Italy because I love history and pizza."
        ];
        break;

      case 'friends_family':
        starterEn = "Hello! 👥 Can you tell me about your best friend or family? What do you love doing together most?";
        starterTr = "Merhaba! 👥 Bana en yakın arkadaşından veya ailenden bahsedebilir misin? Birlikte ne yapmaktan hoşlanırsınız?";
        starterHints = [
          "My best friend is kind, funny, and always supports me.",
          "We love riding bicycles and studying English together.",
          "My family and I enjoy watching movies on weekends."
        ];
        break;

      case 'future_dreams':
        starterEn = "Hi dream chaser! 🚀 What profession do you dream of having when you grow up, and what is your biggest goal for the future?";
        starterTr = "Selam hayalperest! 🚀 Büyüyünce hangi mesleği yapmak istiyorsun ve gelecekteki en büyük hedefin nedir?";
        starterHints = [
          "My dream is to become a software engineer and build AI apps.",
          "I want to be a doctor so I can help people heal.",
          "I want to speak fluent English and study at university."
        ];
        break;

      default: // free_talk
        starterEn = "Hello! 💬 I am Emily, your personal English tutor. We can chat about anything you like! How are you feeling today?";
        starterTr = "Merhaba! 💬 Ben Emily, senin özel İngilizce öğretmenin. İstediğin her konuda konuşabiliriz! Bugün kendini nasıl hissediyorsun?";
        starterHints = [
          "I feel energetic and excited to practice English today!",
          "I had a busy day, but I am happy to chat with you.",
          "I am feeling wonderful! How are you doing today?"
        ];
        break;
    }

    const firstMsg = {
      sender: 'teacher',
      textEn: starterEn,
      textTr: starterTr,
      hints: starterHints,
      feedback: null,
      timestamp: new Date()
    };

    this.messages.push(firstMsg);
    this.renderLiveCaption('teacher', starterEn, starterTr);
    this.renderDrawerMessages();
    this.renderFastHints(starterHints);

    if (this.autoSpeak) {
      setTimeout(() => {
        this.speakText(starterEn);
      }, 400);
    }
  }

  getRecentTargetWords() {
    const words = [];
    if (window.schoolMode && typeof window.schoolMode.getSchoolWords === 'function') {
      const sWords = window.schoolMode.getSchoolWords();
      if (sWords && sWords.length > 0) {
        words.push(...sWords);
      }
    }
    if (window.customWords && window.customWords.words) {
      words.push(...window.customWords.words);
    }
    return words;
  }

  /* =========================================================
     5. FULL-DUPLEX STUDENT INPUT & RESPONSE PIPELINE
     ========================================================= */
  async processStudentSpokenSentence(text) {
    if (!text) return;
    const cleanText = text.trim();
    if (cleanText.length < 2) return;
    if (this.isTeacherTyping) return;

    // 1. Append student message
    const studentMsg = {
      sender: 'student',
      textEn: cleanText,
      timestamp: new Date()
    };
    this.messages.push(studentMsg);
    this.renderLiveCaption('student', cleanText);
    this.renderDrawerMessages();

    // Increment turn count for this topic
    this.topicTurnCounts[this.currentTopic] = (this.topicTurnCounts[this.currentTopic] || 0) + 1;

    // 2. Award Gamification XP
    if (window.app && typeof window.app.addXP === 'function') {
      window.app.addXP(15);
    }

    // 3. Set Visualizer & Teacher State to 'Thinking'
    this.isTeacherTyping = true;
    if (this.visualizerOrb) {
      this.visualizerOrb.setState('thinking');
    }
    this.updateCallControlsUI();

    try {
      let teacherResponse;
      const hasGeminiKey = (window.geminiAI && window.geminiAI.hasApiKey()) || 
                           (window.geminiAIEngine && window.geminiAIEngine.hasApiKey());

      if (hasGeminiKey) {
        try {
          teacherResponse = await this.generateGeminiTeacherReply(cleanText);
        } catch (geminiErr) {
          console.warn("Gemini API call failed, falling back to offline matrix:", geminiErr);
          teacherResponse = this.generateOfflineTeacherReply(cleanText);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 250));
        teacherResponse = this.generateOfflineTeacherReply(cleanText);
      }

      this.messages.push({
        sender: 'teacher',
        textEn: teacherResponse.reply_en,
        textTr: teacherResponse.reply_tr,
        hints: teacherResponse.suggested_replies || [],
        feedback: teacherResponse.student_analysis || null,
        timestamp: new Date()
      });

      // Show floating coaching pill if correction needed
      if (teacherResponse.student_analysis) {
        this.renderFloatingCoachingPill(teacherResponse.student_analysis);
      }

      this.renderLiveCaption('teacher', teacherResponse.reply_en, teacherResponse.reply_tr);
      this.renderFastHints(teacherResponse.suggested_replies || []);
      this.renderDrawerMessages();

      if (this.autoSpeak && teacherResponse.reply_en) {
        this.speakText(teacherResponse.reply_en);
      } else {
        if (this.isOpen && this.isFullDuplexActive && !this.isMuted) {
          this.startListening();
        }
      }
    } catch (err) {
      console.error("AI Teacher Voice Pipeline Error:", err);
      const fallback = this.generateOfflineTeacherReply(cleanText);
      this.messages.push({
        sender: 'teacher',
        textEn: fallback.reply_en,
        textTr: fallback.reply_tr,
        hints: fallback.suggested_replies || [],
        feedback: fallback.student_analysis || null,
        timestamp: new Date()
      });
      this.renderLiveCaption('teacher', fallback.reply_en, fallback.reply_tr);
      this.renderFastHints(fallback.suggested_replies || []);
      this.renderDrawerMessages();
      if (this.autoSpeak && fallback.reply_en) {
        this.speakText(fallback.reply_en);
      } else {
        if (this.isOpen && this.isFullDuplexActive && !this.isMuted) {
          this.startListening();
        }
      }
    } finally {
      this.isTeacherTyping = false;
      this.updateCallControlsUI();
    }
  }

  useQuickHint(hintText) {
    this.processStudentSpokenSentence(hintText);
  }

  /* =========================================================
     6. GEMINI 1.5/2.0 CLOUD REAL-TIME SPOKEN TEACHER PROMPT
     ========================================================= */
  async generateGeminiTeacherReply(studentSentence) {
    const key = (window.geminiAI && window.geminiAI.getApiKey()) || 
                (window.geminiAIEngine && window.geminiAIEngine.getApiKey());
    const topic = this.topics.find(t => t.id === this.currentTopic);
    const targetWords = this.getRecentTargetWords().slice(0, 6).map(w => `${w.en} (${w.tr})`).join(', ');

    const systemPrompt = `You are Teacher Emily, an affectionate, expert English teacher speaking directly via live voice call with a 14-year-old Turkish high school student (A2/B1 level).
The current live conversation topic is "${topic.title}" (${topic.desc}).
Target vocabulary she is currently practicing: [${targetWords || 'routine, schedule, breakfast, healthy, prefer, leisure, daily, success'}].

Student just said to you: "${studentSentence}"

TASK:
1. Act like a real, dedicated human English tutor speaking warmly face-to-face.
2. In your spoken English response ('reply_en'):
   a. Warmly acknowledge and praise her answer.
   b. Analyze her sentence: if there is a grammatical mistake or awkward phrasing, kindly explain how to phrase it better in spoken English (e.g., "Good attempt! Notice that in English we say '...' instead of '...'. A more natural sentence is: '...'"). If her sentence was already correct, offer a natural native phrasing tip!
   c. Ask an engaging, fresh conversational follow-up question related to what she said. NEVER repeat previous questions.
3. Provide Turkish translation ('reply_tr') for subtitle support.
4. Provide 3 short, easy reply suggestion chips ('suggested_replies').

Return strictly JSON format:
{
  "student_analysis": {
    "is_correct": true,
    "praise_tr": "Harika bir deneme!",
    "correction_needed": false,
    "corrected_en": "Corrected sentence",
    "explanation_tr": "Türkçe nazik kural açıklaması",
    "natural_alternative_en": "Daha doğal alternatif"
  },
  "reply_en": "Emily's complete spoken response with sentence guidance and follow-up question",
  "reply_tr": "Öğretmenin cevabının ve sorusunun Türkçe çevirisi",
  "suggested_replies": [
    "Short easy reply 1",
    "Short easy reply 2",
    "Short easy reply 3"
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt }]
      }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json"
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}`);
    }

    const data = await res.json();
    let content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    content = content.trim();
    if (content.startsWith('```json')) content = content.replace(/^```json\s*/, '').replace(/```$/, '');
    else if (content.startsWith('```')) content = content.replace(/^```\s*/, '').replace(/```$/, '');
    return JSON.parse(content.trim());
  }

  /* =========================================================
     7. OFFLINE MULTI-TURN DIALOGUE MATRIX (Deep Vocal Coach)
     ========================================================= */
  generateOfflineTeacherReply(studentSentence) {
    const raw = studentSentence.trim();
    const lower = raw.toLowerCase().replace(/[.,!?;:]/g, '');
    const words = lower.split(/\s+/).filter(Boolean);

    let isCorrect = true;
    let correctedEn = raw;
    let explanationTr = "";
    let praiseTr = "";
    let naturalAlt = raw;
    let coachingSpeechEn = "";

    // ---------------------------------------------------------
    // A. Single-Word & Fragment Expansion Diagnosis
    // ---------------------------------------------------------
    if (words.length <= 2) {
      isCorrect = false;
      praiseTr = "Güzel bir başlangıç! Kelimeyi doğru bildin.";
      
      if (lower.includes('bus') || lower.includes('car') || lower.includes('walk') || lower.includes('train')) {
        correctedEn = lower.includes('walk') ? "I walk to school every morning." : `I travel to school by ${words[words.length - 1]}.`;
        explanationTr = "💡 Cümleyi genişletme ipucu: Sadece vasıtayı söylemek yerine 'I go to school by bus' diyerek tam bir cümle kurabilirsin.";
        coachingSpeechEn = `Good start! To practice fluent speaking, answer with a full sentence like: '${correctedEn}'. `;
      } else if (lower.includes('pizza') || lower.includes('pasta') || lower.includes('burger') || lower.includes('manti') || lower.includes('salad')) {
        correctedEn = `My favorite food is ${raw}.`;
        explanationTr = "💡 Tam cümle ipucu: 'My favorite food is " + raw + "' veya 'I love eating " + raw + "' şeklinde kurabilirsin.";
        coachingSpeechEn = `Yummy choice! You can say in a full sentence: 'My favorite food is ${raw}'. `;
      } else if (lower.includes('english') || lower.includes('math') || lower.includes('science') || lower.includes('history') || lower.includes('art')) {
        correctedEn = `My favorite subject is ${raw}.`;
        explanationTr = "💡 Dersler için tam cümle: 'My favorite subject is " + raw + "' diyerek kendini ifade edebilirsin.";
        coachingSpeechEn = `Great! In full sentence form, you can say: 'My favorite subject is ${raw}'. `;
      } else if (lower.includes('volleyball') || lower.includes('football') || lower.includes('basketball') || lower.includes('chess') || lower.includes('game')) {
        correctedEn = `I enjoy playing ${raw} in my free time.`;
        explanationTr = "💡 Hobi ve spor ipucu: 'I like playing " + raw + "' şeklinde tam cümle kurabilirsin.";
        coachingSpeechEn = `Awesome hobby! A complete sentence would be: 'I enjoy playing ${raw}'. `;
      } else if (lower.includes('doctor') || lower.includes('engineer') || lower.includes('teacher') || lower.includes('software')) {
        correctedEn = `I want to be a ${raw} in the future.`;
        explanationTr = "💡 Meslek hedefi ipucu: 'I want to be a " + raw + "' şeklinde kurabilirsin.";
        coachingSpeechEn = `Inspiring goal! You can say: 'I want to be a ${raw} in the future'. `;
      } else if (lower === 'yes' || lower === 'yeah' || lower === 'yep') {
        correctedEn = "Yes, I definitely do!";
        explanationTr = "💡 Kısa yanıtı zenginleştirme: Sadece 'Yes' yerine 'Yes, I do' veya 'Yes, I love it' diyebilirsin.";
        coachingSpeechEn = "Good! To sound more natural, you can expand it: 'Yes, I definitely do!'. ";
      } else if (lower === 'no' || lower === 'nope') {
        correctedEn = "No, I usually don't.";
        explanationTr = "💡 Olumsuz yanıt ipucu: 'No, I don't' veya 'Not really, I prefer something else' diyebilirsin.";
        coachingSpeechEn = "I see! You can say: 'No, I usually don't'. ";
      } else if (/\b\d+\b/.test(lower) || lower.includes('oclock') || lower.includes('am') || lower.includes('pm')) {
        correctedEn = `I usually wake up at ${raw}.`;
        explanationTr = "💡 Saat ve rutin ipucu: 'I usually wake up at " + raw + "' diyerek cümleni tamamlayabilirsin.";
        coachingSpeechEn = `Great! A full sentence would be: 'I usually wake up at ${raw}'. `;
      } else {
        correctedEn = `I like ${raw}.`;
        explanationTr = "💡 Tam cümle ipucu: Konuşma pratiği yaparken cümleni özne ve fiille genişletmek akıcılık kazandırır.";
        coachingSpeechEn = `Nice! You can express that as a complete sentence: 'I like ${raw}'. `;
      }
    }
    // ---------------------------------------------------------
    // B. Preposition & Collocation Diagnostics
    // ---------------------------------------------------------
    else if (/\bgo\s+school\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bgo\s+school\b/gi, "go to school");
      explanationTr = "🎯 Edat kuralı: Bir yere yönelme belirtirken **to** kullanılır: `go to school`.";
      praiseTr = "Harika deneme! Yönelme edatını ekliyoruz.";
      coachingSpeechEn = "Good attempt! In English, we say 'go to school' with the preposition 'to'. So we say: '" + correctedEn + "'. ";
    }
    else if (/\blisten\s+(music|songs?|radio|podcasts?)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\blisten\s+(music|songs?|radio|podcasts?)\b/gi, "listen to $1");
      explanationTr = "🎯 Kalıp kuralı: **Listen** fiili her zaman **to** ile kullanılır: `listen to music`.";
      praiseTr = "Çok güzel! Listen + to kalıbını pekiştiriyoruz.";
      coachingSpeechEn = "Nice! Remember that 'listen' always takes 'to', so we say: '" + correctedEn + "'. ";
    }
    else if (/\bgo\s+to\s+home\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bgo\s+to\s+home\b/gi, "go home");
      explanationTr = "🎯 İstisna kuralı: **Home** kelimesinden önce 'to' gelmez: `go home`.";
      praiseTr = "Çok iyi fikir! Home istisnasını hatırlayalım.";
      coachingSpeechEn = "Good try! With home, we don't use 'to', we just say: '" + correctedEn + "'. ";
    }
    else if (/\bwith\s+(bus|car|train|plane|bicycle|bike)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bwith\s+(bus|car|train|plane|bicycle|bike)\b/gi, "by $1");
      explanationTr = "🎯 Vasıta edatı: Ulaşım araçlarıyla giderken 'with' yerine **by** kullanılır: `by bus`, `by car`.";
      praiseTr = "Harika! Vasıta kuralını çok güzel uyguluyoruz.";
      coachingSpeechEn = "Nice sentence! In English, for transport we use 'by', so we say: '" + correctedEn + "'. ";
    }
    // ---------------------------------------------------------
    // C. Subject-Verb Agreement & Verb Form Diagnostics
    // ---------------------------------------------------------
    else if (/\b(he|she|it)\s+(don't|dont)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\b(don't|dont)\b/gi, "doesn't");
      explanationTr = "🎯 Özne-Yüklem uyumu: **He, She, It** tekil özneleriyle olumsuzda `doesn't` kullanılır.";
      praiseTr = "Güzel deneme! Tekil özne kuralını uyguluyoruz.";
      coachingSpeechEn = "Good attempt! With he or she, we say doesn't. So a better sentence is: '" + correctedEn + "'. ";
    }
    else if (/\b(he|she|it)\s+have\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\b(he|she|it)\s+have\b/gi, "$1 has");
      explanationTr = "🎯 Have/Has kuralı: **He, She, It** özneleriyle `has` kullanılır.";
      praiseTr = "Çok güzel! Has kullanımını pekiştiriyoruz.";
      coachingSpeechEn = "Well done! With he, she, or it, we use 'has'. So you can say: '" + correctedEn + "'. ";
    }
    else if (/\b(i|you|we|they)\s+(goes|likes|plays|studies|wants|works|eats)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\b(goes|likes|plays|studies|wants|works|eats)\b/gi, (m) => m.replace(/s$/i, '').replace(/ie$/i, 'y'));
      explanationTr = "🎯 Fiil takısı: **I, You, We, They** ile fiil yalın halde kullanılır (-s almaz).";
      praiseTr = "Harika anlatım! Fiili yalın kullanıyoruz.";
      coachingSpeechEn = "Nice! With 'I' or 'you', the verb stays in base form: '" + correctedEn + "'. ";
    }
    else if (/\b(he|she|it)\s+(like|play|go|study|eat|drink|want|need)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\b(he|she|it)\s+(like|play|go|study|eat|drink|want|need)\b/gi, (m, subj, verb) => {
        const v = verb.toLowerCase();
        let s = v + 's';
        if (v === 'go') s = 'goes';
        else if (v === 'study') s = 'studies';
        return `${subj} ${s}`;
      });
      explanationTr = "🎯 Geniş Zaman: **He, She, It** öznelerinde olumlu fiile `-s / -es` eklenir.";
      praiseTr = "Çok iyi! Geniş zaman kuralını uyguluyoruz.";
      coachingSpeechEn = "Good practice! In present simple with he or she, we add -s to the verb: '" + correctedEn + "'. ";
    }
    // ---------------------------------------------------------
    // D. Verb Complementation (like + -ing, can + bare)
    // ---------------------------------------------------------
    else if (/\b(like|love|enjoy|prefer)\s+(play|read|swim|dance|cook|run|walk|watch)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\b(like|love|enjoy|prefer)\s+(play|read|swim|dance|cook|run|walk|watch)\b/gi, (m, v1, v2) => {
        let ing = v2.toLowerCase() + 'ing';
        if (v2.toLowerCase() === 'swim') ing = 'swimming';
        if (v2.toLowerCase() === 'run') ing = 'running';
        if (v2.toLowerCase() === 'dance') ing = 'dancing';
        return `${v1} ${ing}`;
      });
      explanationTr = "🎯 Gerund kuralı: **Like, Love, Enjoy** fiillerinden sonra gelen eyleme `-ing` takısı eklenir: `like playing`.";
      praiseTr = "Çok güzel! Fiil tamlaması kuralını uyguluyoruz.";
      coachingSpeechEn = "Great try! After verbs like 'like' or 'enjoy', we add -ing: '" + correctedEn + "'. ";
    }
    else if (/\b(can|must|should|could)\s+to\s+(\w+)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\b(can|must|should|could)\s+to\s+(\w+)\b/gi, "$1 $2");
      explanationTr = "🎯 Modal kuralı: **Can, Must, Should** gibi kiplerden sonra 'to' kullanılmaz, fiil yalın gelir: `can speak`.";
      praiseTr = "Harika fikir! Modal kuralını pekiştiriyoruz.";
      coachingSpeechEn = "Good effort! Modal verbs like 'can' take a bare verb without 'to': '" + correctedEn + "'. ";
    }
    // ---------------------------------------------------------
    // E. Turkish-English False Friends & Literal Translations
    // ---------------------------------------------------------
    else if (/\bi\s+have\s+(\d+)\s+years\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bi\s+have\s+(\d+)\s+years\b/gi, "I am $1 years old");
      explanationTr = "🎯 Yaş belirtme: İngilizcede yaş söylerken 'have' yerine **to be (am)** kullanılır: `I am 14 years old`.";
      praiseTr = "Harika! Yaş belirtme kuralını doğru kullanıyoruz.";
      coachingSpeechEn = "Good try! In English, we use 'I am' for age: '" + correctedEn + "'. ";
    }
    else if (/\bvery\s+(like|love)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bvery\s+(like|love)\b/gi, "really $1");
      explanationTr = "🎯 Zarf dizilimi: 'Very like' yerine **really like** veya cümlenin sonuna **very much** denir.";
      praiseTr = "Çok güzel ifade! Doğal İngilizce dizilimini uyguluyoruz.";
      coachingSpeechEn = "Nice! Instead of 'very like', native speakers say: '" + correctedEn + "'. ";
    }
    else if (/\bmore\s+(better|faster|bigger|smaller|easier)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bmore\s+(better|faster|bigger|smaller|easier)\b/gi, "$1");
      explanationTr = "🎯 Karşılaştırma kuralı: `-er` alan kısa sıfatların başına 'more' gelmez: `better`, `faster`.";
      praiseTr = "Çok iyi deneme! Karşılaştırma kuralını düzeltiyoruz.";
      coachingSpeechEn = "Good attempt! We say '" + correctedEn + "' without 'more'. ";
    }
    else if (/\bbecause\s+is\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bbecause\s+is\b/gi, "because it is");
      explanationTr = "🎯 Özne eksikliği: İngilizce cümlelerde özne zorunludur: `because it is...`.";
      praiseTr = "Çok güzel! Cümleye özne zamirini ekliyoruz.";
      coachingSpeechEn = "Nice! In English sentences we include the pronoun: '" + correctedEn + "'. ";
    }
    else if (/\byesterday\b/i.test(raw) && /\b(go|see|have|eat|drink|buy|play)\b/i.test(raw)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bgo\b/gi, "went").replace(/\bsee\b/gi, "saw").replace(/\bhave\b/gi, "had").replace(/\beat\b/gi, "ate").replace(/\bplay\b/gi, "played");
      explanationTr = "🎯 Geçmiş Zaman: Cümlede **yesterday (dün)** olduğu için fiilin 2. hali (V2) kullanılır: `went`, `played`.";
      praiseTr = "Çok iyi! Geçmiş zaman kuralını pekiştiriyoruz.";
      coachingSpeechEn = "Great practice! Since you mentioned yesterday, we use past tense: '" + correctedEn + "'. ";
    }
    // ---------------------------------------------------------
    // F. Completely Correct Sentences -> Genuine Content Praise & Native Tips
    // ---------------------------------------------------------
    else {
      isCorrect = true;
      praiseTr = "Mükemmel bir cümle! Gramer ve SVOMPT sözcük dizilimini kusursuz kullandın. 🌟";
      explanationTr = "🌟 Harika! Kendini çok doğal ve doğru bir İngilizceyle ifade ettin.";
      
      if (lower.includes('bus') || lower.includes('walk') || lower.includes('car')) {
        naturalAlt = "I catch the morning school bus every single weekday.";
        coachingSpeechEn = "Brilliant sentence! You used the correct transport structure perfectly. A native speaker might also say: '" + naturalAlt + "'. ";
      } else if (lower.includes('cafeteria') || lower.includes('lunch') || lower.includes('eat')) {
        naturalAlt = "I usually grab lunch in the cafeteria with my classmates.";
        coachingSpeechEn = "Super clear! Your grammar is spot-on. You could also say: '" + naturalAlt + "'. ";
      } else if (lower.includes('english') || lower.includes('subject') || lower.includes('math') || lower.includes('lesson')) {
        naturalAlt = "English is definitely my all-time favorite school subject.";
        coachingSpeechEn = "Excellent sentence! Very natural. Another great way to say this is: '" + naturalAlt + "'. ";
      } else if (lower.includes('volleyball') || lower.includes('sport') || lower.includes('play')) {
        naturalAlt = "I am really passionate about playing sports with my friends.";
        coachingSpeechEn = "Fantastic! Your word order is totally accurate. A cool native alternative is: '" + naturalAlt + "'. ";
      } else {
        naturalAlt = raw;
        coachingSpeechEn = "Great job! Your sentence is very clear, grammatically sound, and well-structured. ";
      }
    }

    const turnIndex = this.topicTurnCounts[this.currentTopic] || 1;

    // Contextual reaction based on student keywords
    let studentKeywordReaction = "";
    let studentKeywordReactionTr = "";

    if (lower.includes('friend')) {
      studentKeywordReaction = "Hanging out with friends is always so refreshing! ";
      studentKeywordReactionTr = "Arkadaşlarla vakit geçirmek her zaman çok keyiflidir! ";
    } else if (lower.includes('volleyball') || lower.includes('football') || lower.includes('basketball') || lower.includes('sport')) {
      studentKeywordReaction = "Playing sports gives you so much healthy energy! ";
      studentKeywordReactionTr = "Spor yapmak insana harika bir enerji verir! ";
    } else if (lower.includes('pizza') || lower.includes('pasta') || lower.includes('manti') || lower.includes('kofte') || lower.includes('burger')) {
      studentKeywordReaction = "That is one of the most delicious meals ever! ";
      studentKeywordReactionTr = "Bu gerçekten en lezzetli yemeklerden biridir! ";
    } else if (lower.includes('game') || lower.includes('minecraft') || lower.includes('roblox')) {
      studentKeywordReaction = "Gaming is a wonderful way to exercise your creativity! ";
      studentKeywordReactionTr = "Oyun oynamak yaratıcılığı geliştirmek için harika bir yoldur! ";
    } else if (lower.includes('music') || lower.includes('guitar') || lower.includes('piano') || lower.includes('song')) {
      studentKeywordReaction = "Music makes every single day so much more inspiring! ";
      studentKeywordReactionTr = "Müzik her günü çok daha ilham verici hale getirir! ";
    } else if (lower.includes('book') || lower.includes('read') || lower.includes('novel')) {
      studentKeywordReaction = "Reading books expands your imagination tremendously! ";
      studentKeywordReactionTr = "Kitap okumak hayal gücünü olağanüstü derecede genişletir! ";
    } else if (lower.includes('doctor') || lower.includes('engineer') || lower.includes('software') || lower.includes('teacher')) {
      studentKeywordReaction = "That is such an inspiring and respectable career goal! ";
      studentKeywordReactionTr = "Bu gerçekten ilham verici ve saygın bir kariyer hedefi! ";
    } else if (lower.includes('london') || lower.includes('japan') || lower.includes('italy') || lower.includes('paris')) {
      studentKeywordReaction = "That place has such incredible culture and beautiful sights! ";
      studentKeywordReactionTr = "Orası gerçekten büyüleyici bir kültüre ve harika manzaralara sahip! ";
    } else if (lower.includes('tired') || lower.includes('sleep') || lower.includes('relax')) {
      studentKeywordReaction = "Make sure you rest well and recharge your energy! ";
      studentKeywordReactionTr = "İyice dinlendiğinden ve enerjini topladığından emin ol! ";
    }

    const topicMatrix = this.getTopicDialogueMatrix(this.currentTopic, turnIndex);
    const replyEn = coachingSpeechEn + studentKeywordReaction + topicMatrix.questionEn;
    const replyTr = (isCorrect ? (explanationTr ? `🌟 ${explanationTr} ` : "") : `🎯 ${explanationTr} `) + studentKeywordReactionTr + topicMatrix.questionTr;
    const hints = topicMatrix.hints;

    return {
      student_analysis: {
        is_correct: isCorrect,
        praise_tr: praiseTr,
        correction_needed: !isCorrect,
        corrected_en: correctedEn,
        explanation_tr: explanationTr,
        natural_alternative_en: naturalAlt
      },
      reply_en: replyEn,
      reply_tr: replyTr,
      suggested_replies: hints
    };
  }

  getTopicDialogueMatrix(topicId, turn) {
    const matrices = {
      school_routine: [
        {
          questionEn: "How do you usually travel to school in the morning? Do you walk, take the school bus, or go by car?",
          questionTr: "Sabahları okula genelde nasıl gidersin? Yürüyerek mi, okul servisiyle mi yoksa arabayla mı?",
          hints: ["I usually take the school bus.", "I walk to school because it is very close.", "My parents drop me off by car."]
        },
        {
          questionEn: "What is your lunch break like at school? Do you eat in the cafeteria or bring your own lunch from home?",
          questionTr: "Okulda öğle aran nasıl geçiyor? Yemekhanede mi yersin yoksa evden mi getirirsin?",
          hints: ["I eat in the school cafeteria with my classmates.", "I bring healthy sandwiches from home.", "I buy toast and juice from the canteen."]
        },
        {
          questionEn: "Which lesson do you find most interesting this term, and what do you like about your teacher's style?",
          questionTr: "Bu dönem hangi dersi en ilginç buluyorsun ve öğretmeninin anlatım tarzında neyi seviyorsun?",
          hints: ["I love English because we practice speaking and vocabulary.", "Science is my favorite because we do fun experiments.", "History is fascinating because I enjoy ancient stories."]
        },
        {
          questionEn: "What do you usually do right after you come home from school? Do you rest first or do your homework?",
          questionTr: "Okuldan eve geldikten hemen sonra genelde ne yaparsın? Önce dinlenir misin yoksa ödevlerini mi yaparsın?",
          hints: ["I relax for an hour, have a snack, and then start homework.", "I do my homework right away so I have free time later.", "I drink tea and tell my family about my school day."]
        },
        {
          questionEn: "How many hours do you usually spend studying or reading in the evening before going to bed?",
          questionTr: "Akşamları yatmadan önce genelde kaç saat ders çalışırsın veya kitap okursun?",
          hints: ["I usually study for about two hours every evening.", "I spend one hour studying and 30 minutes reading a novel.", "I review my 9th-grade English vocabulary cards."]
        },
        {
          questionEn: "Are there any school clubs or after-school activities you participate in, like sports, music, or drama?",
          questionTr: "Okulda katıldığın spor, müzik veya tiyatro gibi kulüpler veya okul sonrası aktiviteler var mı?",
          hints: ["I am a member of the school English drama club.", "I participate in the volleyball team after classes.", "I play guitar in the school music band."]
        },
        {
          questionEn: "How do you prepare for big exam weeks? Do you study alone or do study sessions with friends?",
          questionTr: "Büyük sınav haftalarına nasıl hazırlanırsın? Yalnız mı çalışırsın yoksa arkadaşlarınla mı?",
          hints: ["I prefer studying alone in a quiet room with summary notes.", "I do study sessions with my best friends to quiz each other.", "I solve online practice tests and review past mistakes."]
        },
        {
          questionEn: "What is your favorite day of the week at school and why is it special for you?",
          questionTr: "Okulda haftanın en sevdiğin günü hangisi ve senin için neden özel?",
          hints: ["Friday is my favorite because the weekend starts!", "Wednesday is great because our timetable is very light.", "Monday is exciting because I get to see all my friends."]
        },
        {
          questionEn: "What is one school memory that always makes you laugh or smile when you remember it?",
          questionTr: "Hatırladığında seni her zaman güldüren veya gülümseten bir okul anın nedir?",
          hints: ["A funny presentation we did in science class last month.", "When our entire class planned a surprise birthday party for our teacher.", "A hilarious goal we scored during recess soccer match."]
        },
        {
          questionEn: "What is your main goal for this academic school year in terms of success and personal growth?",
          questionTr: "Başarı ve kişisel gelişim açısından bu eğitim öğretim yılı için ana hedefin nedir?",
          hints: ["My goal is to achieve high grades and speak English with confidence!", "I want to improve my math and science test scores.", "I aim to read at least 15 new books this year."]
        }
      ],

      food_cafe: [
        {
          questionEn: "Do you enjoy cooking or baking at home? What is one dish or dessert you know how to make?",
          questionTr: "Evde yemek veya tatlı yapmaktan hoşlanır mısın? Yapmayı bildiğin bir yemek nedir?",
          hints: ["I know how to make delicious pancakes and scrambled eggs.", "I help my mom make homemade pizza on weekends.", "I can prepare fresh fruit salads and smoothies."]
        },
        {
          questionEn: "When you go to a cafe with friends, what kind of drinks and snacks do you usually order?",
          questionTr: "Arkadaşlarınla bir kafeye gittiğinde genelde ne tür içecekler ve atıştırmalıklar sipariş edersin?",
          hints: ["I usually order a hot chocolate and a slice of cheesecake.", "I love drinking iced caramel latte with a cookie.", "I prefer fresh lemonade and chocolate cake."]
        },
        {
          questionEn: "What is your opinion on fast food versus home-cooked meals? Which one tastes better to you?",
          questionTr: "Fast food ile ev yemekleri hakkında ne düşünüyorsun? Hangisi sana daha lezzetli geliyor?",
          hints: ["Home-cooked meals are much healthier and taste more delicious.", "Fast food is fun occasionally, but home food is best.", "I love homemade Turkish dishes prepared by my family."]
        },
        {
          questionEn: "Have you ever tried foreign foods like sushi, tacos, or Italian pasta? What did you think of them?",
          questionTr: "Hiç suşi, taco veya İtalyan makarnası gibi yabancı yemekler denedin mi?",
          hints: ["I tried authentic Italian pasta and it was absolutely delicious!", "I tried Mexican tacos and loved the spicy flavors.", "I haven't tried sushi yet, but I would love to taste it!"]
        },
        {
          questionEn: "What is your favorite dessert in the whole world? Do you prefer chocolate, fruit, or baklava?",
          questionTr: "Dünyadaki en sevdiğin tatlı nedir? Çikolatalı mı, meyveli mi yoksa baklava mı?",
          hints: ["I adore rich dark chocolate cake with vanilla ice cream.", "I prefer traditional Turkish baklava and sütlaç.", "I love strawberry cheesecake and fruit tarts."]
        },
        {
          questionEn: "If you could design your dream breakfast table on Sunday morning, what would be on it?",
          questionTr: "Bir pazar sabahı hayalindeki kahvaltı masasında neler olurdu?",
          hints: ["Fresh pastries, olives, cheeses, honey, pancakes, and hot Turkish tea!", "Scrambled eggs with cheese, fresh orange juice, and fruit waffles.", "Menemen, toasted bread, cheddar cheese, and fresh tomatoes."]
        },
        {
          questionEn: "Do you prefer eating spicy food or sweet food more, and why?",
          questionTr: "Baharatlı yiyecekleri mi yoksa tatlı yiyecekleri mi daha çok seversin?",
          hints: ["I prefer sweet food because I have a big sweet tooth!", "I enjoy mildly spicy food because it gives dishes extra flavor.", "I love a balance of both sweet and savory tastes."]
        },
        {
          questionEn: "What is one food you disliked when you were younger but enjoy eating now?",
          questionTr: "Küçükken sevmediğin ama şimdi yemekten hoşlandığın bir yemek nedir?",
          hints: ["I used to dislike broccoli, but now I enjoy it.", "I hated olives as a child, but now I eat them every breakfast.", "I used to avoid spinach, but now I love spinach pie."]
        },
        {
          questionEn: "If you opened your own trendy cafe in town, what would you name it?",
          questionTr: "Şehirde kendi trend kafeni açsaydın adını ne koyardın?",
          hints: ["I would name it 'Cozy Corner' and serve giant chocolate cookies.", "I would call it 'The Book Cafe' and serve specialty herbal teas.", "I would name it 'Sweet Dreams' with artisanal waffles."]
        },
        {
          questionEn: "What is a memorable family dinner you celebrated recently?",
          questionTr: "Son zamanlarda kutladığınız unutulmaz bir aile yemeği nasıldı?",
          hints: ["We celebrated my birthday at a lovely seaside restaurant.", "We had a big holiday dinner with all my relatives.", "We had a joyful barbecue party in our garden on Sunday."]
        }
      ],

      hobbies_sports: [
        {
          questionEn: "How often do you exercise or play sports during the week? Do you prefer outdoor or indoor sports?",
          questionTr: "Hafta boyunca ne sıklıkla spor yaparsın? Açık alan mı kapalı salon mu tercih edersin?",
          hints: ["I exercise three times a week and prefer outdoor cycling.", "I love indoor volleyball and practice twice a week.", "I take long walks in the park every afternoon."]
        },
        {
          questionEn: "What kind of video games or mobile games do you enjoy playing most when you have leisure time?",
          questionTr: "Boş zamanın olduğunda en çok ne tür oyunlar oynamaktan hoşlanırsın?",
          hints: ["I enjoy sandbox games like Minecraft because you can build anything.", "I like strategy and puzzle games that test my thinking skills.", "I prefer multiplayer adventure games with my friends."]
        },
        {
          questionEn: "What genre of music do you listen to when studying or relaxing? Who is your favorite singer?",
          questionTr: "Ders çalışırken veya dinlenirken ne tür müzik dinlersin? En sevdiğin şarkıcı kim?",
          hints: ["I listen to acoustic pop and instrumental lo-fi music when studying.", "I love energetic pop music and rock bands.", "My favorite singer has a very melodic and soothing voice."]
        },
        {
          questionEn: "Do you have any artistic hobbies like drawing, painting, photography, or making crafts?",
          questionTr: "Resim çizmek, boyama, fotoğrafçılık veya el işi gibi sanatsal hobilerin var mı?",
          hints: ["I love drawing digital art and sketching nature landscapes.", "I enjoy photography and taking pictures of sunsets and flowers.", "I like making handmade crafts and origami in my free time."]
        },
        {
          questionEn: "What is the best movie, TV series, or anime you have watched recently?",
          questionTr: "Son zamanlarda izlediğin en iyi film, dizi veya anime hangisiydi?",
          hints: ["I watched an exciting sci-fi movie with stunning visual effects.", "I watched an inspiring animation film about friendship.", "I followed a detective series with thrilling plot twists."]
        },
        {
          questionEn: "If you could master any new skill or hobby this year, what would you choose to learn?",
          questionTr: "Bu yıl herhangi bir yeni beceri veya hobi öğrenebilecek olsaydın neyi seçerdin?",
          hints: ["I would love to learn how to play the electric guitar.", "I want to master 3D animation and digital graphic design.", "I would love to learn how to ride a horse and do archery."]
        },
        {
          questionEn: "Do you prefer spending your weekend mornings active outside in nature, or cozy inside with a book?",
          questionTr: "Hafta sonu sabahlarını doğada dışarıda mı yoksa içeride güzel bir kitapla mı geçirmeyi seversin?",
          hints: ["I love being outside riding my bicycle in fresh morning air.", "I prefer staying cozy inside with warm tea and an exciting novel.", "I like doing both: morning walk outside, then reading inside."]
        },
        {
          questionEn: "Have you ever attended a live sports match or a music concert? How was the atmosphere?",
          questionTr: "Hiç canlı bir spor maçına veya müzik konserine gittin mi? Atmosfer nasıldı?",
          hints: ["Yes, I went to a volleyball match and the crowd was incredible!", "I attended an open-air concert and sang along with everyone.", "Not yet, but I really want to go to a live concert this summer!"]
        },
        {
          questionEn: "Do you like solving puzzles, playing board games like chess, or playing card games with family?",
          questionTr: "Bulmaca çözmeyi, satranç gibi kutu oyunları oynamayı sever misin?",
          hints: ["I love playing chess because it requires deep thinking and tactics.", "We play Monopoly and word board games as a family on weekends.", "I enjoy solving Sudoku and crossword puzzles in my free time."]
        },
        {
          questionEn: "How does engaging in your favorite hobby help you relieve school stress?",
          questionTr: "En sevdiğin hobiyle ilgilenmek okul stresini atmanda sana nasıl yardımcı oluyor?",
          hints: ["It clears my mind and helps me feel completely refreshed.", "Playing sports burns off tension and gives me positive energy.", "Drawing calms my emotions after hard exam days."]
        }
      ],

      travel_holidays: [
        {
          questionEn: "Do you prefer summer beach vacations with swimming, or winter holidays in snowy mountains?",
          questionTr: "Yüzmeli yaz tatillerini mi yoksa karlı dağlarda kış tatillerini mi tercih edersin?",
          hints: ["I definitely prefer summer beach vacations and swimming.", "I love winter holidays because playing in the snow is magical.", "I enjoy both: sunny beaches in summer and cozy cabins in winter."]
        },
        {
          questionEn: "What is the most beautiful city or historical place you have visited so far in Turkey?",
          questionTr: "Türkiye'de şu ana kadar ziyaret ettiğin en güzel şehir veya tarihi yer neresiydi?",
          hints: ["Cappadocia was breathtaking with its hot air balloons.", "Antalya has gorgeous turquoise beaches and ancient ruins.", "Istanbul has incredible palaces and the beautiful Bosphorus."]
        },
        {
          questionEn: "When packing your suitcase for a trip, what are 3 essential things you never forget to bring?",
          questionTr: "Bir seyahat için valizini hazırlarken yanına almayı asla unutmadığın 3 temel şey nedir?",
          hints: ["My headphones, a good book, and comfortable sneakers.", "My camera to capture memories, sunglasses, and a warm jacket.", "My phone charger, favorite notebook, and travel pillow."]
        },
        {
          questionEn: "Do you prefer traveling by airplane, riding on trains, or going on family car road trips?",
          questionTr: "Uçakla seyahat etmeyi mi, trenleri mi yoksa aile arabasıyla kara yolculuklarını mı tercih edersin?",
          hints: ["I love airplanes because flying above the clouds feels amazing.", "I enjoy car road trips because we can stop and explore towns.", "I prefer trains because you can look out the window and relax."]
        },
        {
          questionEn: "If you could go on an adventurous road trip across Europe with your best friends, which countries would you visit?",
          questionTr: "En yakın arkadaşlarınla Avrupa genelinde yolculuğa çıkabilsen hangi ülkeleri ziyaret ederdin?",
          hints: ["We would travel through England, France, Germany, and Switzerland!", "I would love to explore Italy, Greece, and Spain.", "I would visit Norway and Sweden to see the Northern Lights."]
        },
        {
          questionEn: "When you visit a new city, do you like exploring historical museums or trying theme parks?",
          questionTr: "Yeni bir şehri ziyaret ettiğinde tarihi müzeleri mi yoksa eğlenceli tema parklarını mı seversin?",
          hints: ["I love theme parks with thrilling roller coasters and games!", "I prefer historical museums and ancient castles to learn history.", "I love a mix: museums in the morning and fun parks in the afternoon!"]
        },
        {
          questionEn: "What kind of souvenirs or gifts do you like buying when traveling?",
          questionTr: "Seyahat ederken ne tür hatıralık eşyalar veya hediyeler almayı seversin?",
          hints: ["I love collecting unique fridge magnets and postcards.", "I buy traditional local sweets and handmade crafts.", "I pick small keychains and beautiful photo albums."]
        },
        {
          questionEn: "Have you ever camped outdoors in a tent? Would you like to sleep under the stars?",
          questionTr: "Hiç açık havada çadırda kamp yaptın mı? Yıldızların altında uyumak ister miydin?",
          hints: ["Yes, I have camped before and it was so fun!", "I haven't camped yet, but I would love to try it near a lake.", "I prefer hotel rooms, but camping in nature sounds exciting!"]
        },
        {
          questionEn: "How does learning English help travelers when visiting foreign countries?",
          questionTr: "İngilizce öğrenmek yabancı ülkeleri ziyaret ederken gezginlere nasıl yardımcı olur?",
          hints: ["English is the global language, so you can communicate anywhere.", "It helps you order food, ask for directions, and make friends.", "It makes you feel independent, confident, and safe."]
        },
        {
          questionEn: "Where is the first destination you plan to visit after you graduate?",
          questionTr: "Mezun olduktan sonra ziyaret etmeyi planladığın ilk yer neresi?",
          hints: ["I want to visit London to see Big Ben and the British Museum.", "I plan to take a graduation trip to a sunny island.", "I want to visit New York City and walk in Central Park."]
        }
      ],

      friends_family: [
        {
          questionEn: "What personality qualities do you value most in a true friend? (Honesty, humor, loyalty, kindness?)",
          questionTr: "Gerçek bir arkadaşta en çok hangi kişilik özelliklerine değer verirsin?",
          hints: ["I value honesty and kindness above everything else.", "A good sense of humor and loyalty are the most important to me.", "I love friends who are trustworthy and always listen."]
        },
        {
          questionEn: "What is your favorite activity to do with your family during weekend evenings?",
          questionTr: "Hafta sonu akşamları ailenle yapmaktan en çok hoşlandığın aktivite nedir?",
          hints: ["We love watching funny family movies with popcorn.", "We enjoy playing board games and having dinner conversations.", "We like going for evening walks together in the neighborhood."]
        },
        {
          questionEn: "Do you have any pets at home, like a cat or dog? What is your dream pet?",
          questionTr: "Evde kedi veya köpek gibi bir evcil hayvanın var mı? Hayalindeki evcil hayvan nedir?",
          hints: ["I have a playful cat who loves sleeping on my desk!", "I have a loyal dog who is my best companion.", "I dream of adopting a fluffy golden retriever."]
        },
        {
          questionEn: "How do you cheer up your best friend when they are feeling stressed about exams?",
          questionTr: "En yakın arkadaşın sınavlar yüzünden stresli olduğunda onun moralini nasıl düzeltirsin?",
          hints: ["I listen to them patiently and give them an encouraging hug.", "I tell funny jokes and invite them to eat ice cream together.", "I help them study difficult topics."]
        },
        {
          questionEn: "How do you and your family celebrate special occasions like birthdays?",
          questionTr: "Sen ve ailen doğum günleri gibi özel günleri nasıl kutlarsınız?",
          hints: ["We bake a delicious cake, give gifts, and sing together.", "We gather with our extended family and share a big feast.", "We organize fun surprises and take family photos."]
        },
        {
          questionEn: "Who is the funniest person in your friend group or family?",
          questionTr: "Arkadaş grubunda veya ailende en komik kişi kim?",
          hints: ["My best friend always makes hilarious impressions and clever jokes.", "My father tells funny childhood stories that make everyone laugh.", "My sibling has a witty personality."]
        },
        {
          questionEn: "What is an important lesson about friendship you have learned as you grew up?",
          questionTr: "Büyüdükçe arkadaşlık hakkında öğrendiğin önemli bir ders nedir?",
          hints: ["True friends stay by your side during difficult times.", "Quality of friendship is much more important than the quantity of friends.", "Respecting differences makes friendship stronger."]
        },
        {
          questionEn: "Do you share secrets with your best friend? Why is mutual trust so essential?",
          questionTr: "En yakın arkadaşınla sırlarını paylaşır mısın? Karşılıklı güven neden gereklidir?",
          hints: ["Yes, trust is the foundation of every strong friendship.", "We share our dreams because we know we can rely on each other.", "Mutual trust lets you be honest without fear of judgment."]
        },
        {
          questionEn: "How do you stay in touch with your friends during summer holidays?",
          questionTr: "Yaz tatillerinde arkadaşlarınla nasıl iletişimde kalırsın?",
          hints: ["We do video calls, send voice notes, and meet up in the park.", "We play online multiplayer games together in the evenings.", "We plan beach trips whenever we are in town."]
        },
        {
          questionEn: "What is one thing you appreciate most about your parents and their support?",
          questionTr: "Ailen ve sana verdikleri destek hakkında en çok takdir ettiğin şey nedir?",
          hints: ["They always believe in me and encourage me to pursue my dreams.", "They provide a loving, safe home and support my education.", "They teach me kindness, patience, and how to overcome challenges."]
        }
      ],

      future_dreams: [
        {
          questionEn: "Why does this dream profession inspire you so much? What skills will you need to develop?",
          questionTr: "Bu hayalindeki meslek seni neden motive ediyor? Hangi becerileri geliştirmen gerekecek?",
          hints: ["It allows me to solve meaningful problems and make an impact.", "I will need strong English communication and analytical skills.", "It combines my passion for technology and helping people."]
        },
        {
          questionEn: "Would you like to study university abroad in the future, for example in the UK, USA, or Europe?",
          questionTr: "Gelecekte yurt dışında örneğin İngiltere veya Avrupa'da üniversite okumak ister miydin?",
          hints: ["Yes! Studying abroad would give me global experience.", "I would love to do an exchange program like Erasmus during university.", "I want to study at a top university and broaden my horizons."]
        },
        {
          questionEn: "What languages do you dream of speaking fluently in the future besides Turkish and English?",
          questionTr: "Gelecekte Türkçe ve İngilizce dışında hangi dilleri akıcı konuşmayı hayal ediyorsun?",
          hints: ["I would love to learn German because it is great for engineering.", "I want to speak Spanish because it is spoken in so many countries.", "I dream of learning Japanese and Italian for their rich cultures."]
        },
        {
          questionEn: "What kind of futuristic technology do you hope will exist in 20 years? (Clean energy, AI medical cures?)",
          questionTr: "20 yıl sonra ne tür fütüristik bir teknolojinin var olmasını umuyorsun?",
          hints: ["100% clean renewable energy to protect our planet.", "Advanced AI medical assistants that can cure diseases quickly.", "High-speed eco-friendly transport and smart sustainable cities."]
        },
        {
          questionEn: "Where do you envision yourself living in 10 years? In a bustling modern city or a peaceful coastal town?",
          questionTr: "10 yıl sonra kendini nerede yaşarken hayal ediyorsun?",
          hints: ["In a vibrant modern city full of technology hubs and cultural life.", "In a charming green coastal town with a view of the sea.", "Traveling between different international cities for my career."]
        },
        {
          questionEn: "How do you think mastering English today will open doors for your future career?",
          questionTr: "Bugün İngilizceyi mükemmel öğrenmenin gelecekteki kariyerin için nasıl kapılar açacağını düşünüyorsun?",
          hints: ["It allows me to work for international companies anywhere in the world.", "I can access global research, university lectures, and books.", "It gives me confidence to collaborate with people worldwide."]
        },
        {
          questionEn: "What is one personal habit you want to build this year to become more successful?",
          questionTr: "Hayatta daha başarılı olmak için bu yıl geliştirmek istediğin alışkanlık nedir?",
          hints: ["Reading educational books daily and managing my study time.", "Practicing English speaking every single day with consistency.", "Exercising regularly and maintaining a positive growth mindset."]
        },
        {
          questionEn: "How do you plan to make the world a kinder place in your future career?",
          questionTr: "Gelecekteki kariyerinde dünyayı daha iyi bir yer haline getirmeyi nasıl planlıyorsun?",
          hints: ["By developing helpful technologies that make daily life easier.", "By volunteering, supporting children's education, and protecting nature.", "By treating everyone with respect and inspiring others."]
        },
        {
          questionEn: "What is a piece of advice you would write in a letter to your future self 15 years from now?",
          questionTr: "Gelecekteki kendine yazacağın bir mektupta vereceğin tavsiye ne olurdu?",
          hints: ["Never stop learning, stay curious, and always follow your passion!", "Be proud of how hard you worked and cherish your loved ones.", "Keep a kind heart, embrace challenges, and stay true to yourself."]
        },
        {
          questionEn: "What gives you the highest motivation whenever you face a difficult challenge?",
          questionTr: "Zor bir engelle karşılaştığında sana en yüksek motivasyonu veren şey nedir?",
          hints: ["Remembering my big dreams and knowing mistakes help me learn.", "The loving encouragement of my family and teachers.", "The belief that with consistent effort, I can achieve anything!"]
        }
      ],

      free_talk: [
        {
          questionEn: "How is the weather outside today in your city? How does sunny or rainy weather affect your mood?",
          questionTr: "Şehrinde bugün hava nasıl? Güneşli veya yağmurlu hava modunu nasıl etkiler?",
          hints: ["It is sunny and pleasant, which makes me feel energetic!", "It is rainy and cool, which makes me want to drink tea and read.", "It is cloudy and calm outside today."]
        },
        {
          questionEn: "What is one song or music track you have been listening to on repeat recently?",
          questionTr: "Son zamanlarda tekrar tekrar dinlediğin bir şarkı nedir?",
          hints: ["I have been listening to an upbeat English pop song that lifts my mood.", "A soothing instrumental piano song that helps me focus.", "A classic rock anthem that gives me great energy."]
        },
        {
          questionEn: "If you had a completely free day tomorrow with zero homework, how would you spend it?",
          questionTr: "Yarın sıfır ödevle tamamen boş bir günün olsaydı nasıl geçirirdin?",
          hints: ["I would sleep in late, visit my favorite cafe, and watch movies.", "I would go on a day trip to the beach with my best friends.", "I would spend the entire day painting and playing games."]
        },
        {
          questionEn: "What is an interesting fact or fascinating thing you learned this week?",
          questionTr: "Bu hafta öğrendiğin ilginç bir bilgi nedir?",
          hints: ["I learned an interesting historical fact about ancient empires in class.", "I discovered how AI algorithms recognize human speech patterns.", "I learned that honey never spoils even after thousands of years!"]
        },
        {
          questionEn: "Do you prefer mornings or nights? Are you an early bird or a night owl, and why?",
          questionTr: "Erken kalkan biri misin yoksa gece kuşu mu, ve neden?",
          hints: ["I am definitely a night owl; I feel more creative in the evening.", "I am an early bird; I love the peaceful energy of morning sunlight.", "I am in between: I like productive mornings and relaxing evenings."]
        },
        {
          questionEn: "What is something simple in daily life that always brings a big smile to your face?",
          questionTr: "Günlük hayatta yüzüne her zaman gülümseme getiren basit bir şey nedir?",
          hints: ["Seeing a cute fluffy cat on the street or petting my pet.", "Enjoying a warm cup of chocolate after a cold walk outside.", "Laughing with my best friends over silly inside jokes."]
        },
        {
          questionEn: "If you could have any magical superpower for one day, what power would you choose?",
          questionTr: "Bir günlüğüne sihirli bir süper gücün olsaydı neyi seçerdin?",
          hints: ["I would choose the power to teleport anywhere in the world instantly!", "I would love the power of time travel to explore ancient history.", "I would pick the ability to speak every language fluently!"]
        },
        {
          questionEn: "What is your favorite season of the year: Spring, Summer, Autumn, or Winter, and why?",
          questionTr: "Yılın en sevdiğin mevsimi hangisi: İlkbahar, Yaz, Sonbahar mı Kış mı?",
          hints: ["Spring, because the flowers bloom and the weather is so fresh.", "Summer, because school is out and we can swim at the beach.", "Autumn, because the golden leaves and cool breeze are so cozy."]
        },
        {
          questionEn: "What is one thing you are truly grateful for today?",
          questionTr: "Bugün gerçekten minnettar olduğun bir şey nedir?",
          hints: ["I am grateful for my healthy body, family, and education.", "I am grateful for great friends who make me laugh every day.", "I am thankful for the opportunity to practice English."]
        },
        {
          questionEn: "What is one positive goal or wish you have for tomorrow?",
          questionTr: "Yarın için sahip olduğun pozitif bir hedef nedir?",
          hints: ["To stay focused in class, learn new English words, and smile often.", "To complete my assignments early and have fun in the evening.", "To have a calm, joyful, and productive day."]
        }
      ]
    };

    const topicList = matrices[topicId] || matrices.school_routine;
    const itemIndex = (turn - 1) % topicList.length;
    return topicList[itemIndex];
  }

  /* =========================================================
     8. LIVE CAPTIONS, FLOATING PILL & DRAWER RENDERING
     ========================================================= */
  renderLiveCaption(speaker, textEn, textTr = "") {
    const container = document.getElementById('voice-live-captions');
    const speakerEl = document.getElementById('caption-speaker');
    const textEnEl = document.getElementById('caption-text-en');
    const textTrEl = document.getElementById('caption-text-tr');

    if (container) {
      container.style.display = this.showCaptions ? 'flex' : 'none';
    }

    if (speakerEl) {
      speakerEl.innerHTML = speaker === 'teacher' ? '👩‍🏫 Teacher Emily' : '👧 Sen (Öğrenci)';
      speakerEl.className = `caption-speaker-badge ${speaker === 'teacher' ? 'speaker-teacher' : 'speaker-student'}`;
    }

    if (textEnEl) {
      const wrappedEn = window.wordLookup ? window.wordLookup.wrap(textEn) : textEn;
      textEnEl.innerHTML = wrappedEn;
    }

    if (textTrEl) {
      textTrEl.textContent = textTr ? `🇹🇷 ${textTr}` : '';
      textTrEl.style.display = (this.showTranslation && textTr) ? 'block' : 'none';
    }
  }

  renderFloatingCoachingPill(fb) {
    const pill = document.getElementById('floating-coach-pill');
    if (!pill || !fb) return;

    const isCorrect = fb.is_correct !== false && !fb.correction_needed;

    pill.className = `floating-coach-pill ${isCorrect ? 'pill-success' : 'pill-correction'}`;
    pill.style.display = 'flex';

    if (isCorrect) {
      pill.innerHTML = `
        <span class="pill-badge">🌟 Harika Cümle!</span>
        <span class="pill-text">${(fb.natural_alternative_en && fb.natural_alternative_en !== fb.corrected_en) ? `💡 Doğal Alternatif: <em>"${fb.natural_alternative_en}"</em>` : (fb.praise_tr || 'Tebrikler! Cümleyi doğru kurdun.')}</span>
      `;
    } else {
      pill.innerHTML = `
        <span class="pill-badge">🎯 Cümle İpucu</span>
        <span class="pill-text">${fb.explanation_tr || ''} (✅ <code>${fb.corrected_en || ''}</code>)</span>
      `;
    }

    if (this._pillTimer) clearTimeout(this._pillTimer);
    this._pillTimer = setTimeout(() => {
      if (pill) pill.style.display = 'none';
    }, 7000);
  }

  renderFastHints(hints) {
    const hintsContainer = document.getElementById('voice-fast-hints');
    if (!hintsContainer) return;

    if (hints && hints.length > 0 && this.showHints) {
      hintsContainer.style.display = 'flex';
      hintsContainer.innerHTML = hints.map(h => `
        <button class="voice-hint-chip" onclick="aiTeacher.useQuickHint('${h.replace(/'/g, "\\'")}')">
          "${h}"
        </button>
      `).join('');
    } else {
      hintsContainer.style.display = 'none';
    }
  }

  renderDrawerMessages() {
    const stream = document.getElementById('drawer-chat-stream');
    if (!stream) return;

    let html = '';

    this.messages.forEach((msg) => {
      if (msg.sender === 'teacher') {
        const wrappedEn = window.wordLookup ? window.wordLookup.wrap(msg.textEn) : msg.textEn;
        html += `
          <div class="teacher-msg-bubble-container">
            <div class="teacher-msg-avatar">👩‍🏫</div>
            <div class="teacher-msg-content">
              ${msg.feedback ? this.renderFeedbackCardHTML(msg.feedback) : ''}
              <div class="teacher-bubble">
                <div class="teacher-bubble-text-en">${wrappedEn}</div>
                <div class="teacher-bubble-text-tr">🇹🇷 ${msg.textTr || ''}</div>
                <div class="teacher-bubble-actions">
                  <button class="bubble-action-btn" onclick="aiTeacher.speakText('${msg.textEn.replace(/'/g, "\\'")}')">🔊 Dinle</button>
                  <button class="bubble-action-btn" onclick="aiTeacher.speakSlow('${msg.textEn.replace(/'/g, "\\'")}')">🐢 Yavaş Dinle</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="student-msg-bubble-container">
            <div class="student-bubble">
              <div class="student-bubble-text">${msg.textEn}</div>
            </div>
            <div class="student-msg-avatar">👧</div>
          </div>
        `;
      }
    });

    stream.innerHTML = html;
    stream.scrollTop = stream.scrollHeight;
  }

  renderFeedbackCardHTML(fb) {
    if (!fb) return '';
    const isCorrect = fb.is_correct !== false && !fb.correction_needed;

    return `
      <div class="teacher-feedback-card ${isCorrect ? 'fb-success' : 'fb-correction'}">
        <div class="fb-header">
          <span class="fb-badge">${isCorrect ? '🌟 Harika Cümle!' : '🎯 Canlı Koçluk'}</span>
          <span class="fb-praise">${fb.praise_tr || ''}</span>
        </div>
        ${!isCorrect ? `
          <div class="fb-body">
            <div class="fb-corrected-line"><strong>✅ Doğrusu:</strong> <code>${fb.corrected_en || ''}</code></div>
            <div class="fb-explanation">${fb.explanation_tr || ''}</div>
          </div>
        ` : ''}
        ${fb.natural_alternative_en && fb.natural_alternative_en !== fb.corrected_en ? `
          <div class="fb-natural-alt"><span>💡 Alternatif:</span> <em>"${fb.natural_alternative_en}"</em></div>
        ` : ''}
      </div>
    `;
  }

  onTeacherSentenceSpoken(sentence) {
    if (this.visualizerOrb) {
      this.visualizerOrb.setState('speaking');
    }
    this.updateCallControlsUI();
  }

  speakText(text) {
    if (!text || !window.speechEngine) return;
    // Temporarily halt recognition to prevent audio loop / self-interruption from device speakers
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    window.speechEngine.setRate(this.speechRate);
    window.speechEngine.speak(text, () => {
      if (this.isOpen && this.isFullDuplexActive && !this.isMuted) {
        if (this.visualizerOrb) this.visualizerOrb.setState('listening');
        this.startListening();
      }
      this.updateCallControlsUI();
    });
  }

  speakSlow(text) {
    if (!text || !window.speechEngine) return;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    window.speechEngine.setRate(0.7);
    window.speechEngine.speak(text, () => {
      window.speechEngine.setRate(this.speechRate);
      if (this.isOpen && this.isFullDuplexActive && !this.isMuted) {
        if (this.visualizerOrb) this.visualizerOrb.setState('listening');
        this.startListening();
      }
      this.updateCallControlsUI();
    });
  }
}

// Global Singleton Instance
const aiTeacherInstance = new AITeacherEngine();
window.aiTeacher = aiTeacherInstance;
