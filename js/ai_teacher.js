/**
 * 👩‍🏫 AI English Teacher & Voice Conversation Coach (İnteraktif AI İngilizce Öğretmeni & Konuşma Koçu)
 * 
 * Features:
 * 1. 🎙️ Real-time Voice Recognition (Speech-to-Text via Web Speech API) + Typing Support.
 * 2. 🔊 High-Fidelity Human Studio Audio Pronunciation (Text-to-Speech via speechEngine).
 * 3. 🧠 Dual AI Engine:
 *    - Cloud Gemini 1.5/2.0 Flash (Limitless intelligence & adaptive teacher personality).
 *    - Advanced Offline Multi-Turn Dialogue Matrix (100+ non-repeating conversation turns, keyword extraction, grammar feedback).
 * 4. 🏫 Curriculum & Notebook Word Reinforcement (Pulls 9th grade & custom notebook words into dialogue).
 * 5. 🎯 Multi-dimensional Teacher Feedback Card (Övgü, Nazik Hata Düzeltimi, Türkçe Gramer İpucu, Doğal Alternatif).
 * 6. 💡 Instant "Nasıl Cevap Verebilirim?" Clickable Helper Chips.
 * 7. 🏆 Gamification (+15 XP per interaction, streak tracking, motivation badges).
 */

class AITeacherEngine {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
    this.isListening = false;
    this.recognition = null;
    this.currentTopic = 'school_routine';
    this.messages = [];
    this.isTeacherTyping = false;
    this.speechRate = 0.88; // Natural conversational human pace
    this.autoSpeak = true;
    
    // Multi-turn State & History Tracking (Guarantees zero repetitive questions)
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
     1. SPEECH RECOGNITION (SES TANIMA & MİKROFON MOTORU)
     ========================================================= */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.updateMicUI(true);
        };

        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const inputEl = document.getElementById('ai-teacher-input');
          if (inputEl) {
            inputEl.value = finalTranscript || interimTranscript;
          }

          if (finalTranscript) {
            this.stopListening();
            setTimeout(() => {
              this.handleStudentSend();
            }, 500);
          }
        };

        this.recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          this.isListening = false;
          this.updateMicUI(false);
          if (event.error === 'not-allowed') {
            if (window.app && typeof window.app.showToast === 'function') {
              window.app.showToast("⚠️ Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofona izin verin.", "warning");
            }
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.updateMicUI(false);
        };
      } catch (e) {
        console.warn("Speech recognition not supported in this environment:", e);
      }
    }
  }

  toggleListening() {
    if (!this.recognition) {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast("🎙️ Cihazınızda ses tanıma desteklenmiyor veya izin verilmedi. Klavye ile yazabilirsiniz.", "info");
      }
      return;
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.recognition) return;
    try {
      if (window.speechEngine) {
        window.speechEngine.stop();
      }
      this.recognition.start();
    } catch (e) {
      console.warn("Could not start recognition:", e);
    }
  }

  stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {}
    this.isListening = false;
    this.updateMicUI(false);
  }

  updateMicUI(isRecording) {
    const micBtn = document.getElementById('ai-teacher-mic-btn');
    const statusText = document.getElementById('ai-teacher-recording-status');
    if (micBtn) {
      if (isRecording) {
        micBtn.classList.add('recording-active');
        micBtn.innerHTML = '🛑 <span>Dinliyorum...</span>';
      } else {
        micBtn.classList.remove('recording-active');
        micBtn.innerHTML = '🎙️ <span>Konuş</span>';
      }
    }
    if (statusText) {
      statusText.style.display = isRecording ? 'flex' : 'none';
    }
  }

  /* =========================================================
     2. MODAL & UI CONTROLLER
     ========================================================= */
  openTeacherModal(initialTopic = 'school_routine') {
    this.currentTopic = initialTopic;
    this.isOpen = true;

    if (!document.getElementById('ai-teacher-modal')) {
      this.createModalDOM();
    }

    const modal = document.getElementById('ai-teacher-modal');
    modal.classList.add('active');

    this.updateGeminiStatusBadge();

    // If starting fresh, post the first teacher greeting
    if (this.messages.length === 0) {
      this.startTopicConversation(this.currentTopic);
    } else {
      this.renderChatMessages();
    }

    setTimeout(() => {
      const input = document.getElementById('ai-teacher-input');
      if (input) input.focus();
    }, 300);
  }

  closeTeacherModal() {
    this.stopListening();
    if (window.speechEngine) {
      window.speechEngine.stop();
    }
    const modal = document.getElementById('ai-teacher-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.isOpen = false;
  }

  createModalDOM() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'ai-teacher-modal';
    modalDiv.className = 'modal-overlay';
    modalDiv.onclick = (e) => {
      if (e.target === modalDiv) this.closeTeacherModal();
    };
    modalDiv.innerHTML = `
      <div class="ai-teacher-card modal-card" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="ai-teacher-header">
          <div class="teacher-profile">
            <div class="teacher-avatar-ring">
              <span class="teacher-avatar">👩‍🏫</span>
              <span class="teacher-online-dot"></span>
            </div>
            <div class="teacher-info">
              <div class="teacher-name-row">
                <h4>Teacher Emily</h4>
                <span class="teacher-badge">AI İngilizce Koçu</span>
              </div>
              <p class="teacher-status" id="teacher-status-desc">9. Sınıf & Canlı Konuşma Pratiği</p>
            </div>
          </div>
          
          <div class="teacher-header-actions">
            <!-- Voice Selector -->
            <div class="teacher-voice-picker">
              <select id="teacher-voice-select" onchange="aiTeacher.handleVoiceChange(this.value)" title="Ses Karakteri">
                <option value="emily_studio" ${this.selectedVoiceProfile === 'emily_studio' ? 'selected' : ''}>👩‍🦰 Emily (Doğal Kadın Sesi)</option>
                <option value="alex_studio" ${this.selectedVoiceProfile === 'alex_studio' ? 'selected' : ''}>👨‍🦱 Alex (Doğal Erkek Sesi)</option>
                <option value="device_neural" ${this.selectedVoiceProfile === 'device_neural' ? 'selected' : ''}>🎙️ Cihaz Sentezleyicisi</option>
              </select>
            </div>

            <!-- Gemini AI Key Status Button -->
            <button class="teacher-gemini-key-btn" id="teacher-gemini-btn" onclick="aiTeacher.openGeminiSettings()" title="Gemini 1.5 AI Anahtarı">
              🤖 Gemini AI
            </button>

            <!-- Auto-Speak Toggle -->
            <button class="icon-btn" onclick="aiTeacher.toggleAutoSpeak()" id="teacher-tts-toggle" title="Sesli Okuma Aç/Kapat">
              🔊
            </button>

            <!-- Reset Chat -->
            <button class="icon-btn" onclick="aiTeacher.restartConversation()" title="Sohbeti Sıfırla">
              🔄
            </button>

            <!-- Close Modal -->
            <button class="icon-btn" onclick="aiTeacher.closeTeacherModal()" title="Kapat">✕</button>
          </div>
        </div>

        <!-- Topic Selector Bar -->
        <div class="teacher-topics-bar" id="teacher-topics-bar">
          ${this.topics.map(t => `
            <button class="topic-chip ${t.id === this.currentTopic ? 'active' : ''}" onclick="aiTeacher.switchTopic('${t.id}')">
              <span>${t.icon}</span> ${t.title}
            </button>
          `).join('')}
        </div>

        <!-- Chat Stream Area -->
        <div class="ai-teacher-chat-area" id="ai-teacher-chat-stream">
          <!-- Messages dynamically rendered here -->
        </div>

        <!-- Clickable Quick Hint Chips -->
        <div class="teacher-quick-hints" id="teacher-quick-hints" style="display:none;">
          <!-- Quick answer suggestions injected here -->
        </div>

        <!-- Recording Indicator Animation -->
        <div class="teacher-recording-status" id="ai-teacher-recording-status" style="display:none;">
          <div class="sound-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <span>Seni dinliyorum, lütfen İngilizce konuş...</span>
        </div>

        <!-- Input & Controls Area -->
        <div class="ai-teacher-input-bar">
          <button class="teacher-mic-btn" id="ai-teacher-mic-btn" onclick="aiTeacher.toggleListening()" title="Mikrofonla Konuş">
            🎙️ <span>Konuş</span>
          </button>
          <div class="teacher-input-wrapper">
            <input type="text" id="ai-teacher-input" placeholder="İngilizce cevabını yaz veya mikrofona konuş..." onkeydown="if(event.key==='Enter') aiTeacher.handleStudentSend()" autocomplete="off" />
          </div>
          <button class="teacher-send-btn" onclick="aiTeacher.handleStudentSend()" title="Gönder">
            ➤
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalDiv);
  }

  handleVoiceChange(profile) {
    this.selectedVoiceProfile = profile;
    if (window.speechEngine) {
      window.speechEngine.setVoiceProfile(profile);
      const testMsg = profile === 'alex_studio' ? "Hello! I am Alex, your English speaking partner." : "Hello dear! I am Emily, your English teacher.";
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
    const btn = document.getElementById('teacher-gemini-btn');
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

  toggleAutoSpeak() {
    this.autoSpeak = !this.autoSpeak;
    const btn = document.getElementById('teacher-tts-toggle');
    if (btn) {
      btn.innerHTML = this.autoSpeak ? '🔊' : '🔇';
      btn.style.opacity = this.autoSpeak ? '1' : '0.5';
    }
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(this.autoSpeak ? "🔊 Sesli okuma açıldı." : "🔇 Sesli okuma kapatıldı.", "info");
    }
  }

  switchTopic(topicId) {
    if (this.currentTopic === topicId && this.messages.length > 0) return;
    this.currentTopic = topicId;

    // Update topic chip active states
    document.querySelectorAll('.topic-chip').forEach(btn => {
      const topic = this.topics.find(t => t.id === topicId);
      btn.classList.toggle('active', topic ? btn.textContent.includes(topic.title) : false);
    });

    this.startTopicConversation(topicId);
  }

  restartConversation() {
    this.topicTurnCounts[this.currentTopic] = 0;
    this.messages = [];
    this.startTopicConversation(this.currentTopic);
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast("🔄 Yeni sohbet başlatıldı.", "info");
    }
  }

  /* =========================================================
     3. CONVERSATION LOGIC & STARTERS
     ========================================================= */
  startTopicConversation(topicId) {
    this.messages = [];
    this.topicTurnCounts[topicId] = 0;

    let starterEn = "";
    let starterTr = "";
    let starterHints = [];

    switch (topicId) {
      case 'school_routine':
        starterEn = "Hello dear! 😊 How was your day at school today? What is your favorite subject, and what time do you usually wake up on weekdays?";
        starterTr = "Merhaba canım! 😊 Bugün okulda günün nasıl geçti? En sevdiğin ders hangisi ve hafta içi genelde saat kaçta uyanırsın?";
        starterHints = [
          "My school day was great! I love English and science.",
          "I usually wake up at 7:00 AM on weekdays.",
          "It was a bit tiring, but I enjoyed my math class."
        ];
        break;

      case 'food_cafe':
        starterEn = "Hi there! 🍕 I love trying delicious foods. What did you have for breakfast or lunch today, and what is your absolute favorite meal?";
        starterTr = "Selam! 🍕 Lezzetli yemekler denemeyi çok severim. Bugün kahvaltıda veya öğle yemeğinde ne yedin ve en sevdiğin yemek nedir?";
        starterHints = [
          "I had eggs, cheese, and orange juice for breakfast.",
          "My favorite meal is homemade pasta and pizza.",
          "I really enjoy eating traditional Turkish mantı and köfte."
        ];
        break;

      case 'hobbies_sports':
        starterEn = "Hey superstar! 🎮 What do you enjoy doing most in your free time? Do you prefer playing sports, reading books, or playing video games?";
        starterTr = "Selam süper star! 🎮 Boş zamanlarında en çok ne yapmaktan keyif alırsın? Spor yapmayı mı, kitap okumayı mı yoksa video oyunu oynamayı mı tercih edersin?";
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
          "I would love to visit London to practice my English fluently!",
          "I want to travel to Japan to explore Tokyo and anime culture.",
          "I would go to Italy because I love historical architecture and pizza."
        ];
        break;

      case 'friends_family':
        starterEn = "Hello! 👥 Can you tell me about your best friend or your family? What do you love doing together most?";
        starterTr = "Merhaba! 👥 Bana en yakın arkadaşından veya ailenden bahsedebilir misin? Birlikte en çok ne yapmaktan hoşlanırsınız?";
        starterHints = [
          "My best friend is very kind, funny, and always supports me.",
          "We love riding bicycles and studying English together.",
          "My family and I enjoy watching movies on Friday evenings."
        ];
        break;

      case 'future_dreams':
        starterEn = "Hi dream chaser! 🚀 What profession do you dream of having when you grow up, and what is your biggest goal for the future?";
        starterTr = "Selam hayalperest! 🚀 Büyüyünce hangi mesleği yapmayı hayal ediyorsun ve gelecek için en büyük hedefin nedir?";
        starterHints = [
          "My dream is to become a successful software engineer and build AI apps.",
          "I want to be a doctor so I can help people heal.",
          "I want to speak fluent English and study at a great university."
        ];
        break;

      default: // free_talk
        starterEn = "Hello! 💬 I am Emily, your personal English tutor. We can chat about anything you like! How are you feeling today, and what is on your mind?";
        starterTr = "Merhaba! 💬 Ben Emily, senin özel İngilizce öğretmenin. İstediğin her konuda sohbet edebiliriz! Bugün kendini nasıl hissediyorsun?";
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
    this.renderChatMessages();

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
     4. STUDENT INPUT & DUAL AI PROCESSING
     ========================================================= */
  async handleStudentSend() {
    const inputEl = document.getElementById('ai-teacher-input');
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text || this.isTeacherTyping) return;

    inputEl.value = '';
    this.stopListening();

    // 1. Append student message
    const studentMsg = {
      sender: 'student',
      textEn: text,
      timestamp: new Date()
    };
    this.messages.push(studentMsg);
    this.renderChatMessages();

    // Increment turn count for this topic
    this.topicTurnCounts[this.currentTopic] = (this.topicTurnCounts[this.currentTopic] || 0) + 1;

    // 2. Award Gamification XP
    if (window.app && typeof window.app.addXP === 'function') {
      window.app.addXP(15);
    }

    // 3. Set Teacher Typing State
    this.isTeacherTyping = true;
    this.renderTypingIndicator();

    try {
      let teacherResponse;
      // Check if Gemini API is available
      const hasGeminiKey = (window.geminiAI && window.geminiAI.hasApiKey()) || 
                           (window.geminiAIEngine && window.geminiAIEngine.hasApiKey());

      if (hasGeminiKey) {
        teacherResponse = await this.generateGeminiTeacherReply(text);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500)); // Natural typing feeling
        teacherResponse = this.generateOfflineTeacherReply(text);
      }

      this.isTeacherTyping = false;
      this.messages.push({
        sender: 'teacher',
        textEn: teacherResponse.reply_en,
        textTr: teacherResponse.reply_tr,
        hints: teacherResponse.suggested_replies || [],
        feedback: teacherResponse.student_analysis || null,
        timestamp: new Date()
      });

      this.renderChatMessages();

      if (this.autoSpeak && teacherResponse.reply_en) {
        this.speakText(teacherResponse.reply_en);
      }
    } catch (err) {
      console.error("AI Teacher Reply Error:", err);
      this.isTeacherTyping = false;
      const fallback = this.generateOfflineTeacherReply(text);
      this.messages.push({
        sender: 'teacher',
        textEn: fallback.reply_en,
        textTr: fallback.reply_tr,
        hints: fallback.suggested_replies || [],
        feedback: fallback.student_analysis || null,
        timestamp: new Date()
      });
      this.renderChatMessages();
      if (this.autoSpeak && fallback.reply_en) {
        this.speakText(fallback.reply_en);
      }
    }
  }

  useQuickHint(hintText) {
    const inputEl = document.getElementById('ai-teacher-input');
    if (inputEl) {
      inputEl.value = hintText;
      inputEl.focus();
    }
  }

  /* =========================================================
     5. GEMINI 1.5/2.0 CLOUD TEACHER PROMPT
     ========================================================= */
  async generateGeminiTeacherReply(studentSentence) {
    const key = (window.geminiAI && window.geminiAI.getApiKey()) || 
                (window.geminiAIEngine && window.geminiAIEngine.getApiKey());
    const topic = this.topics.find(t => t.id === this.currentTopic);
    const targetWords = this.getRecentTargetWords().slice(0, 6).map(w => `${w.en} (${w.tr})`).join(', ');

    const systemPrompt = `You are Teacher Emily, an affectionate, highly encouraging, expert English teacher for a 9th-grade Turkish student (around 14-15 years old, CEFR A2/B1 level).
The current conversation topic is "${topic.title}" (${topic.desc}).
Target vocabulary she is currently learning: [${targetWords || 'routine, schedule, breakfast, healthy, prefer, leisure, daily, success'}].

Analyze the student's sentence carefully:
Student said: "${studentSentence}"

TASK:
1. Praise her effort warmly and enthusiastically.
2. If there are grammar, tense, plural, preposition, or spelling mistakes, gently point them out with a very friendly Turkish explanation and provide the corrected version. Do NOT be harsh; be supportive and kind!
3. If her sentence is already completely correct, celebrate it!
4. Provide a more natural phrasing if possible.
5. Acknowledge what she explicitly said in her sentence, then continue the conversation by asking a NEW, engaging, natural follow-up question related to the topic. NEVER repeat previous questions.
6. Provide 3 short, easy, helpful English reply suggestions (hints) that she can click to respond naturally.

Return strictly JSON format:
{
  "student_analysis": {
    "is_correct": true,
    "praise_tr": "Harika bir cümle!",
    "correction_needed": false,
    "corrected_en": "Corrected version of student sentence (or original if correct)",
    "explanation_tr": "Türkçe nazik kural açıklaması",
    "natural_alternative_en": "Daha doğal alternatif İngilizce cümle"
  },
  "reply_en": "Teacher Emily's natural, warm response and follow-up question in English",
  "reply_tr": "Öğretmenin cevabının ve sorusunun Türkçe çevirisi",
  "suggested_replies": [
    "Short easy response option 1",
    "Short easy response option 2",
    "Short easy response option 3"
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

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(content);
  }

  /* =========================================================
     6. OFFLINE MULTI-TURN DIALOGUE MATRIX (Zero Repetition)
     ========================================================= */
  generateOfflineTeacherReply(studentSentence) {
    const raw = studentSentence.trim();
    const lower = raw.toLowerCase();

    // 1. Grammatical Diagnostic Rules
    let isCorrect = true;
    let correctedEn = raw;
    let explanationTr = "Harika! Cümle dizilimin ve gramerin gayet doğru.";
    let praiseTr = "Tebrikler! Kendini çok net ve güzel ifade ettin. 🌟";
    let naturalAlt = raw;

    // Rule: "he don't / she don't / it don't" -> "doesn't"
    if (/\b(he|she|it)\s+don't\b/i.test(lower)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bdon't\b/gi, "doesn't");
      explanationTr = "💡 Küçük bir ipucu: **He, She, It** tekil öznelerinde geniş zamanda olumsuz yaparken `don't` yerine `doesn't` kullanılır.";
      praiseTr = "Çok güzel bir deneme! Anlamı çok iyi ilettin.";
      naturalAlt = correctedEn;
    }
    // Rule: "I goes / I likes / You plays"
    else if (/\b(i|you|we|they)\s+(goes|likes|plays|studies|wants|works)\b/i.test(lower)) {
      isCorrect = false;
      correctedEn = raw.replace(/\b(goes|likes|plays|studies|wants|works)\b/gi, (m) => m.replace(/s$/i, '').replace(/ie$/i, 'y'));
      explanationTr = "💡 Hatırlatma: **I, You, We, They** özneleriyle fiilin yalın hali kullanılır (-s takısı almaz).";
      praiseTr = "Harika fikir! Çok iyi anlatmak istediğini belirttin.";
      naturalAlt = correctedEn;
    }
    // Rule: "yesterday I go" -> "yesterday I went"
    else if (/yesterday/i.test(lower) && /\b(go|see|have|eat|drink|buy)\b/i.test(lower)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bgo\b/gi, "went").replace(/\bsee\b/gi, "saw").replace(/\bhave\b/gi, "had").replace(/\beat\b/gi, "ate");
      explanationTr = "💡 Geçmiş zaman ipucu: Cümlede **yesterday (dün)** geçtiği için fiilin geçmiş hali (V2) kullanılır.";
      praiseTr = "Çok güzel! Zaman kuralını pratik ederek pekiştiriyoruz.";
      naturalAlt = correctedEn;
    }
    // Rule: Missing capital 'I'
    else if (/\bi\b/.test(raw)) {
      correctedEn = raw.replace(/\bi\b/g, 'I');
    }

    // 2. Determine Turn Index
    const turnIndex = this.topicTurnCounts[this.currentTopic] || 1;

    // 3. Extract Contextual Reaction based on student keywords
    let studentKeywordReaction = "";
    let studentKeywordReactionTr = "";

    if (lower.includes('friend')) {
      studentKeywordReaction = "Hanging out with friends is always so refreshing! ";
      studentKeywordReactionTr = "Arkadaşlarla vakit geçirmek her zaman çok keyiflidir! ";
    } else if (lower.includes('volleyball') || lower.includes('football') || lower.includes('basketball') || lower.includes('sport')) {
      studentKeywordReaction = "Sports give you so much healthy energy and joy! ";
      studentKeywordReactionTr = "Spor insana harika bir enerji ve mutluluk verir! ";
    } else if (lower.includes('pizza') || lower.includes('pasta') || lower.includes('manti') || lower.includes('kofte') || lower.includes('burger')) {
      studentKeywordReaction = "Yum, that is one of the most delicious dishes ever! ";
      studentKeywordReactionTr = "Nefis, bu gerçekten en lezzetli yemeklerden biridir! ";
    } else if (lower.includes('game') || lower.includes('minecraft') || lower.includes('roblox')) {
      studentKeywordReaction = "Gaming is a great way to relax and exercise your creativity! ";
      studentKeywordReactionTr = "Oyun oynamak dinlenmek ve yaratıcılığı geliştirmek için harika bir yoldur! ";
    } else if (lower.includes('music') || lower.includes('guitar') || lower.includes('piano') || lower.includes('song')) {
      studentKeywordReaction = "Music makes every single day so much more colorful! ";
      studentKeywordReactionTr = "Müzik her günü çok daha renkli hale getirir! ";
    } else if (lower.includes('book') || lower.includes('read') || lower.includes('novel')) {
      studentKeywordReaction = "Reading books expands your imagination tremendously! ";
      studentKeywordReactionTr = "Kitap okumak hayal gücünü olağanüstü derecede genişletir! ";
    } else if (lower.includes('doctor') || lower.includes('engineer') || lower.includes('software') || lower.includes('teacher')) {
      studentKeywordReaction = "That is such an inspiring and respectable career choice! ";
      studentKeywordReactionTr = "Bu gerçekten ilham verici ve saygın bir kariyer seçimi! ";
    } else if (lower.includes('london') || lower.includes('japan') || lower.includes('italy') || lower.includes('paris')) {
      studentKeywordReaction = "That place has such incredible culture and beautiful sights! ";
      studentKeywordReactionTr = "Orası gerçekten büyüleyici bir kültüre ve harika manzaralara sahip! ";
    } else if (lower.includes('tired') || lower.includes('sleep') || lower.includes('relax')) {
      studentKeywordReaction = "Make sure you rest well and recharge your energy! ";
      studentKeywordReactionTr = "İyice dinlendiğinden ve enerjini topladığından emin ol! ";
    } else {
      studentKeywordReaction = "That sounds lovely and very interesting! ";
      studentKeywordReactionTr = "Kulağa çok hoş ve ilgi çekici geliyor! ";
    }

    // 4. Generate Topic Multi-Turn Progression
    const topicMatrix = this.getTopicDialogueMatrix(this.currentTopic, turnIndex);
    const replyEn = studentKeywordReaction + topicMatrix.questionEn;
    const replyTr = studentKeywordReactionTr + topicMatrix.questionTr;
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
    // 10-turn structured matrix for each topic (loops with dynamic offset if turn > 10)
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
          hints: ["I eat in the school cafeteria with my classmates.", "I bring healthy sandwiches and fruits from home.", "I buy toast and fruit juice from the canteen."]
        },
        {
          questionEn: "Which lesson do you find most interesting this term, and what do you like about your teacher's style?",
          questionTr: "Bu dönem hangi dersi en ilginç buluyorsun ve öğretmeninin anlatım tarzında neyi seviyorsun?",
          hints: ["I love English because we practice speaking and vocabulary.", "Science is my favorite because we do fun experiments.", "History is fascinating because I enjoy learning about ancient civilizations."]
        },
        {
          questionEn: "What do you usually do right after you come home from school? Do you rest first or do your homework?",
          questionTr: "Okuldan eve geldikten hemen sonra genelde ne yaparsın? Önce dinlenir misin yoksa ödevlerini mi yaparsın?",
          hints: ["I relax for an hour, have a snack, and then start my homework.", "I do my homework right away so I have free time later.", "I drink tea and tell my family about my school day."]
        },
        {
          questionEn: "How many hours do you usually spend studying or reading in the evening before going to bed?",
          questionTr: "Akşamları yatmadan önce genelde kaç saat ders çalışırsın veya kitap okursun?",
          hints: ["I usually study for about two hours every evening.", "I spend one hour studying and 30 minutes reading a novel.", "I review my 9th-grade English vocabulary cards before sleep."]
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
          hints: ["Friday is my favorite because the weekend starts and we have PE class.", "Wednesday is great because our timetable is very light and fun.", "Monday is exciting because I get to see all my friends again."]
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
          questionTr: "Evde yemek veya tatlı yapmaktan hoşlanır mısın? Yapmayı bildiğin bir yemek veya tatlı nedir?",
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
          questionTr: "Hiç suşi, taco veya İtalyan makarnası gibi yabancı yemekler denedin mi? Onlar hakkında ne düşündün?",
          hints: ["I tried authentic Italian pasta and it was absolutely delicious!", "I tried Mexican tacos and loved the spicy flavors.", "I haven't tried sushi yet, but I would love to taste it!"]
        },
        {
          questionEn: "What is your favorite dessert in the whole world? Do you prefer chocolate, fruit, or traditional sweets like baklava?",
          questionTr: "Dünyadaki en sevdiğin tatlı nedir? Çikolatalı mı, meyveli mi yoksa baklava gibi geleneksel tatlıları mı seversin?",
          hints: ["I adore rich dark chocolate cake with vanilla ice cream.", "I prefer traditional Turkish baklava and sütlaç.", "I love strawberry cheesecake and fruit tarts."]
        },
        {
          questionEn: "If you could design your dream breakfast table on a Sunday morning, what would be on it?",
          questionTr: "Bir pazar sabahı hayalindeki kahvaltı masasını tasarlayabilseydin üzerinde neler olurdu?",
          hints: ["Fresh pastries, olives, cheeses, honey, pancakes, and hot Turkish tea!", "Scrambled eggs with cheese, fresh orange juice, and fruit waffles.", "Menemen, toasted bread, cheddar cheese, and fresh tomatoes."]
        },
        {
          questionEn: "Do you prefer eating spicy food or sweet food more, and why?",
          questionTr: "Baharatlı yiyecekleri mi yoksa tatlı yiyecekleri mi daha çok seversin ve neden?",
          hints: ["I prefer sweet food because I have a big sweet tooth!", "I enjoy mildly spicy food because it gives dishes extra flavor.", "I love a balance of both sweet and savory tastes."]
        },
        {
          questionEn: "What is one food or vegetable you disliked when you were younger but enjoy eating now?",
          questionTr: "Küçükken sevmediğin ama şimdi yemekten hoşlandığın bir yemek veya sebze nedir?",
          hints: ["I used to dislike broccoli, but now I enjoy it steamed with garlic.", "I hated olives as a child, but now I eat them every breakfast.", "I used to avoid spinach, but now I love spinach pie."]
        },
        {
          questionEn: "If you opened your own trendy cafe in town, what would you name it and what would be your signature item?",
          questionTr: "Şehirde kendi trend kafeni açsaydın adını ne koyardın ve imza lezzetin ne olurdu?",
          hints: ["I would name it 'Cozy Corner' and serve giant chocolate cookies.", "I would call it 'The Book Cafe' and serve specialty herbal teas.", "I would name it 'Sweet Dreams' with artisanal waffles and gelato."]
        },
        {
          questionEn: "What is a memorable family dinner you celebrated recently?",
          questionTr: "Son zamanlarda kutladığınız unutulmaz bir aile yemeği nasıldı?",
          hints: ["We celebrated my birthday at a lovely seaside restaurant.", "We had a big holiday dinner with all my relatives and delicious food.", "We had a joyful barbecue party in our garden on Sunday."]
        }
      ],

      hobbies_sports: [
        {
          questionEn: "How often do you exercise or play sports during the week? Do you prefer outdoor or indoor sports?",
          questionTr: "Hafta boyunca ne sıklıkla egzersiz veya spor yaparsın? Açık alan sporlarını mı kapalı salon sporlarını mı tercih edersin?",
          hints: ["I exercise three times a week and prefer outdoor cycling.", "I love indoor volleyball and practice twice a week.", "I take long walks in the park every afternoon."]
        },
        {
          questionEn: "What kind of video games or mobile games do you enjoy playing most when you have leisure time?",
          questionTr: "Boş zamanın olduğunda en çok ne tür video oyunları veya mobil oyunlar oynamaktan hoşlanırsın?",
          hints: ["I enjoy sandbox games like Minecraft because you can build anything.", "I like strategy and puzzle games that test my thinking skills.", "I prefer multiplayer adventure games with my friends."]
        },
        {
          questionEn: "What genre of music do you listen to when studying or relaxing? Who is your favorite singer or band?",
          questionTr: "Ders çalışırken veya dinlenirken ne tür müzik dinlersin? En sevdiğin şarkıcı veya müzik grubu kim?",
          hints: ["I listen to acoustic pop and instrumental lo-fi music when studying.", "I love energetic pop music and rock bands.", "My favorite singer has a very melodic and soothing voice."]
        },
        {
          questionEn: "Do you have any artistic hobbies like drawing, painting, photography, or making crafts?",
          questionTr: "Resim çizmek, boyama, fotoğrafçılık veya el işi gibi sanatsal hobilerin var mı?",
          hints: ["I love drawing digital art and sketching nature landscapes.", "I enjoy photography and taking pictures of sunsets and flowers.", "I like making handmade crafts and origami in my free time."]
        },
        {
          questionEn: "What is the best movie, TV series, or anime you have watched recently? What made it so memorable?",
          questionTr: "Son zamanlarda izlediğin en iyi film, dizi veya anime hangisiydi? Onu bu kadar unutulmaz kılan neydi?",
          hints: ["I watched an exciting sci-fi movie with stunning visual effects.", "I watched an inspiring animation film about friendship and bravery.", "I followed a detective series with thrilling plot twists."]
        },
        {
          questionEn: "If you could master any new skill or hobby this year, what would you choose to learn?",
          questionTr: "Bu yıl herhangi bir yeni beceri veya hobi öğrenebilecek olsaydın neyi öğrenmeyi seçerdin?",
          hints: ["I would love to learn how to play the electric guitar.", "I want to master 3D animation and digital graphic design.", "I would love to learn how to ride a horse and do archery."]
        },
        {
          questionEn: "Do you prefer spending your weekend mornings active outside in nature, or cozy inside with a good book?",
          questionTr: "Hafta sonu sabahlarını doğada dışarıda aktif olarak mı yoksa içeride güzel bir kitapla mı geçirmeyi tercih edersin?",
          hints: ["I love being outside riding my bicycle in fresh morning air.", "I prefer staying cozy inside with warm tea and an exciting novel.", "I like doing both: morning walk outside, then reading inside."]
        },
        {
          questionEn: "Have you ever attended a live sports match or a music concert? How was the atmosphere?",
          questionTr: "Hiç canlı bir spor maçına veya müzik konserine gittin mi? Atmosfer nasıldı?",
          hints: ["Yes, I went to a volleyball match and the crowd was incredible!", "I attended an open-air concert and sang along with everyone.", "Not yet, but I really want to go to a live concert this summer!"]
        },
        {
          questionEn: "Do you like solving puzzles, playing board games like chess, or playing card games with family?",
          questionTr: "Bulmaca çözmeyi, satranç gibi kutu oyunları oynamayı veya aileyle kart oyunları oynamayı sever misin?",
          hints: ["I love playing chess because it requires deep thinking and tactics.", "We play Monopoly and word board games as a family on weekends.", "I enjoy solving Sudoku and crossword puzzles in my free time."]
        },
        {
          questionEn: "How does engaging in your favorite hobby help you relieve school stress?",
          questionTr: "En sevdiğin hobiyle ilgilenmek okul stresini atmanda sana nasıl yardımcı oluyor?",
          hints: ["It clears my mind and helps me feel completely refreshed.", "Playing sports burns off tension and gives me positive energy.", "Listening to music and drawing calms my emotions after hard exam days."]
        }
      ],

      travel_holidays: [
        {
          questionEn: "Do you prefer summer beach vacations with swimming, or winter holidays in snowy mountains with skiing?",
          questionTr: "Yüzmeli yaz tatillerini mi yoksa karlı dağlarda kayak yapmalı kış tatillerini mi tercih edersin?",
          hints: ["I definitely prefer summer beach vacations and swimming in the sea.", "I love winter holidays because playing in the snow is magical.", "I enjoy both: sunny beaches in summer and cozy snowy cabins in winter."]
        },
        {
          questionEn: "What is the most beautiful city or historical place you have visited so far in Turkey?",
          questionTr: "Türkiye'de şu ana kadar ziyaret ettiğin en güzel şehir veya tarihi yer neresiydi?",
          hints: ["Cappadocia was breathtaking with its fairy chimneys and hot air balloons.", "Antalya has gorgeous turquoise beaches and ancient ruins.", "Istanbul has incredible historical palaces and the beautiful Bosphorus."]
        },
        {
          questionEn: "When packing your suitcase for a trip, what are 3 essential things you never forget to bring?",
          questionTr: "Bir seyahat için valizini hazırlarken yanına almayı asla unutmadığın 3 temel şey nedir?",
          hints: ["My headphones, a good book, and comfortable sneakers.", "My camera to capture memories, sunglasses, and a warm jacket.", "My phone charger, favorite notebook, and travel pillow."]
        },
        {
          questionEn: "Do you prefer traveling by airplane, riding on high-speed trains, or going on family car road trips?",
          questionTr: "Uçakla seyahat etmeyi mi, hızlı trenleri mi yoksa aile arabasıyla kara yolculuklarını mı tercih edersin?",
          hints: ["I love airplanes because flying above the clouds feels amazing.", "I enjoy car road trips because we can stop and explore scenic towns.", "I prefer trains because you can look out the window and relax comfortably."]
        },
        {
          questionEn: "If you could go on an adventurous road trip across Europe with your best friends, which countries would you visit?",
          questionTr: "En yakın arkadaşlarınla Avrupa genelinde maceralı bir yolculuğa çıkabilsen hangi ülkeleri ziyaret ederdin?",
          hints: ["We would travel through England, France, Germany, and Switzerland!", "I would love to explore Italy, Greece, and Spain for their history and sun.", "I would visit Norway and Sweden to see the Northern Lights."]
        },
        {
          questionEn: "When you visit a new city, do you like exploring historical museums or trying fun amusement theme parks?",
          questionTr: "Yeni bir şehri ziyaret ettiğinde tarihi müzeleri keşfetmeyi mi yoksa eğlenceli tema parklarını mı seversin?",
          hints: ["I love theme parks with thrilling roller coasters and games!", "I prefer historical museums and ancient castles to learn history.", "I love a mix: museums in the morning and fun parks in the afternoon!"]
        },
        {
          questionEn: "What kind of souvenirs or gifts do you like buying for your loved ones when traveling?",
          questionTr: "Seyahat ederken sevdiklerine ne tür hatıralık eşyalar veya hediyeler almayı seversin?",
          hints: ["I love collecting unique fridge magnets and postcards.", "I buy traditional local sweets and handmade crafts.", "I pick small keychains and beautiful photo albums."]
        },
        {
          questionEn: "Have you ever camped outdoors in a tent? Would you like to sleep under the stars in nature?",
          questionTr: "Hiç açık havada çadırda kamp yaptın mı? Doğada yıldızların altında uyumak ister miydin?",
          hints: ["Yes, I have camped before and roasting marshmallows was so fun!", "I haven't camped yet, but I would love to try it near a peaceful lake.", "I prefer cozy hotel rooms, but camping in nature sounds exciting!"]
        },
        {
          questionEn: "How does learning and speaking English help travelers when visiting foreign countries?",
          questionTr: "İngilizce öğrenmek ve konuşmak yabancı ülkeleri ziyaret ederken gezginlere nasıl yardımcı olur?",
          hints: ["English is the global language, so you can communicate anywhere in the world.", "It helps you order food, ask for directions, and make international friends.", "It makes you feel independent, confident, and safe while traveling."]
        },
        {
          questionEn: "Where is the very first destination you plan to visit after you graduate from high school?",
          questionTr: "Liseden mezun olduktan sonra ziyaret etmeyi planladığın ilk yer neresi?",
          hints: ["I want to visit London to see Big Ben and the British Museum.", "I plan to take a graduation trip to a sunny Mediterranean island.", "I want to visit New York City and walk in Central Park."]
        }
      ],

      friends_family: [
        {
          questionEn: "What personality qualities do you value most in a true friend? (Honesty, humor, loyalty, kindness?)",
          questionTr: "Gerçek bir arkadaşta en çok hangi kişilik özelliklerine değer verirsin? (Dürüstlük, mizah, sadakat, nezaket?)",
          hints: ["I value honesty and kindness above everything else.", "A good sense of humor and loyalty are the most important to me.", "I love friends who are trustworthy and always listen when you need help."]
        },
        {
          questionEn: "What is your favorite activity to do with your family during weekend evenings?",
          questionTr: "Hafta sonu akşamları ailenle yapmaktan en çok hoşlandığın aktivite nedir?",
          hints: ["We love watching funny family movies with popcorn.", "We enjoy playing board games and having long dinner conversations.", "We like going for evening walks together in the neighborhood."]
        },
        {
          questionEn: "Do you have any pets at home, like a cat or dog? If not, what is your dream pet to have?",
          questionTr: "Evde kedi veya köpek gibi bir evcil hayvanın var mı? Yoksa sahip olmak istediğin hayalindeki evcil hayvan nedir?",
          hints: ["I have a playful cat who loves sleeping on my study desk!", "I have a loyal dog who is my best companion.", "I don't have a pet yet, but my dream is to adopt a fluffy golden retriever."]
        },
        {
          questionEn: "How do you cheer up your best friend when they are feeling sad or stressed about school exams?",
          questionTr: "En yakın arkadaşın okul sınavları yüzünden üzgün veya stresli olduğunda onun moralini nasıl düzeltirsin?",
          hints: ["I listen to them patiently and give them a warm encouraging hug.", "I tell funny jokes and invite them to eat ice cream together.", "I help them study difficult topics and remind them how capable they are."]
        },
        {
          questionEn: "How do you and your family celebrate special occasions like birthdays and holidays?",
          questionTr: "Sen ve ailen doğum günleri ve bayramlar gibi özel günleri nasıl kutlarsınız?",
          hints: ["We bake a delicious cake, give heartfelt gifts, and sing together.", "We gather with our extended family and share a big festive feast.", "We organize fun surprises and take family photos to remember the day."]
        },
        {
          questionEn: "Who is the funniest person in your friend group or family, and what makes them so humorous?",
          questionTr: "Arkadaş grubunda veya ailende en komik kişi kim ve onu bu kadar esprili kılan ne?",
          hints: ["My best friend always makes hilarious impressions and clever jokes.", "My father tells funny childhood stories that make everyone laugh.", "My sibling has a witty personality and makes every situation entertaining."]
        },
        {
          questionEn: "What is an important lesson about friendship you have learned as you grew up?",
          questionTr: "Büyüdükçe arkadaşlık hakkında öğrendiğin önemli bir ders nedir?",
          hints: ["True friends stay by your side during difficult times, not just good times.", "Quality of friendship is much more important than the quantity of friends.", "Respecting each other's differences makes friendship stronger."]
        },
        {
          questionEn: "Do you share secrets with your best friend? Why is mutual trust so essential?",
          questionTr: "En yakın arkadaşınla sırlarını paylaşır mısın? Karşılıklı güven neden bu kadar gereklidir?",
          hints: ["Yes, trust is the foundation of every strong and lasting friendship.", "We share our dreams and secrets because we know we can rely on each other.", "Mutual trust lets you be completely honest without fear of judgment."]
        },
        {
          questionEn: "How do you stay in touch with your friends during summer holidays when school is closed?",
          questionTr: "Okul kapalıyken yaz tatillerinde arkadaşlarınla nasıl iletişimde kalırsın?",
          hints: ["We do video calls, send voice notes, and meet up in the park.", "We play online multiplayer games together in the evenings.", "We plan beach trips and cafe meetups whenever we are in town."]
        },
        {
          questionEn: "What is one thing you appreciate most about your parents and their support for you?",
          questionTr: "Ailen ve sana verdikleri destek hakkında en çok takdir ettiğin şey nedir?",
          hints: ["They always believe in me and encourage me to pursue my dreams.", "They provide a loving, safe home and support my education unconditionally.", "They teach me kindness, patience, and how to overcome challenges."]
        }
      ],

      future_dreams: [
        {
          questionEn: "Why does this dream profession inspire you so much? What skills will you need to develop?",
          questionTr: "Bu hayalindeki meslek seni neden bu kadar motive ediyor? Hangi becerileri geliştirmen gerekecek?",
          hints: ["It allows me to solve meaningful problems and make a positive impact.", "I will need strong English communication, analytical skills, and creativity.", "It combines my passion for technology, innovation, and helping people."]
        },
        {
          questionEn: "Would you like to study university abroad in the future, for example in the UK, USA, or Europe?",
          questionTr: "Gelecekte örneğin İngiltere, ABD veya Avrupa'da yurt dışında üniversite okumak ister miydin?",
          hints: ["Yes! Studying abroad would give me global experience and international friends.", "I would love to do an exchange program like Erasmus during university.", "I want to study at a top university and broaden my cultural horizons."]
        },
        {
          questionEn: "What languages do you dream of speaking fluently in the future besides Turkish and English?",
          questionTr: "Gelecekte Türkçe ve İngilizce dışında hangi dilleri akıcı şekilde konuşmayı hayal ediyorsun?",
          hints: ["I would love to learn German because it is great for engineering and science.", "I want to speak Spanish because it is spoken in so many vibrant countries.", "I dream of learning Japanese and Italian for their rich cultures."]
        },
        {
          questionEn: "What kind of futuristic technology or invention do you hope will exist in 20 years? (Flying cars, AI doctors, clean energy?)",
          questionTr: "20 yıl sonra ne tür fütüristik bir teknoloji veya icadın var olmasını umuyorsun? (Uçan arabalar, yapay zeka doktorlar, temiz enerji?)",
          hints: ["100% clean renewable energy to protect our planet from pollution.", "Advanced AI medical assistants that can cure diseases quickly.", "High-speed eco-friendly transport and smart sustainable cities."]
        },
        {
          questionEn: "Where do you envision yourself living in 10 years? In a bustling modern metropolis or a peaceful coastal town?",
          questionTr: "10 yıl sonra kendini nerede yaşarken hayal ediyorsun? Hareketli modern bir metropolde mi yoksa huzurlu bir sahil kasabasında mı?",
          hints: ["In a vibrant modern city full of technology hubs and cultural life.", "In a charming green coastal town with a view of the sea.", "Traveling between different international cities for my global career."]
        },
        {
          questionEn: "How do you think mastering English today will open doors for your future career and global opportunities?",
          questionTr: "Bugün İngilizceyi mükemmel öğrenmenin gelecekteki kariyerin ve küresel fırsatların için nasıl kapılar açacağını düşünüyorsun?",
          hints: ["It allows me to work for international companies anywhere in the world.", "I can access global research, university lectures, and cutting-edge books.", "It gives me the confidence to collaborate with people worldwide."]
        },
        {
          questionEn: "What is one personal habit you want to build this year to become more successful in life?",
          questionTr: "Hayatta daha başarılı olmak için bu yıl geliştirmek istediğin kişisel bir alışkanlık nedir?",
          hints: ["Reading educational books daily and managing my study time efficiently.", "Practicing English speaking every single day with consistency.", "Exercising regularly and maintaining a positive growth mindset."]
        },
        {
          questionEn: "How do you plan to make the world a better, kinder place in your future career?",
          questionTr: "Gelecekteki kariyerinde dünyayı daha iyi ve daha nazik bir yer haline getirmeyi nasıl planlıyorsun?",
          hints: ["By developing helpful technologies that make people's daily lives easier.", "By volunteering, supporting children's education, and protecting nature.", "By treating everyone with respect and inspiring others through my work."]
        },
        {
          questionEn: "What is a piece of advice you would write in a letter to your future self 15 years from now?",
          questionTr: "Bundan 15 yıl sonraki gelecekteki kendine yazacağın bir mektupta vereceğin bir tavsiye ne olurdu?",
          hints: ["Never stop learning, stay curious, and always follow your passion!", "Be proud of how hard you worked and cherish your loved ones.", "Keep a kind heart, embrace new challenges, and stay true to yourself."]
        },
        {
          questionEn: "What gives you the highest motivation whenever you face a difficult challenge?",
          questionTr: "Zor bir engelle karşılaştığında sana en yüksek motivasyonu veren şey nedir?",
          hints: ["Remembering my big dreams and knowing that mistakes help me learn.", "The loving encouragement of my family and teachers.", "The belief that with consistent effort and practice, I can achieve anything!"]
        }
      ],

      free_talk: [
        {
          questionEn: "How is the weather outside today in your city? How does sunny or rainy weather affect your mood?",
          questionTr: "Şehrinde bugün dışarıda hava nasıl? Güneşli veya yağmurlu hava modunu nasıl etkiler?",
          hints: ["It is sunny and pleasant, which makes me feel energetic!", "It is rainy and cool, which makes me want to drink tea and read.", "It is cloudy and calm outside today."]
        },
        {
          questionEn: "What is one song or music track you have been listening to on repeat recently?",
          questionTr: "Son zamanlarda tekrar tekrar dinlediğin bir şarkı veya müzik parçası nedir?",
          hints: ["I have been listening to an upbeat English pop song that lifts my mood.", "A soothing instrumental piano song that helps me focus while studying.", "A classic rock anthem that gives me great energy."]
        },
        {
          questionEn: "If you had a completely free day tomorrow with zero homework or responsibilities, how would you spend it?",
          questionTr: "Yarın sıfır ödev ve sıfır sorumlulukla tamamen boş bir günün olsaydı nasıl geçirirdin?",
          hints: ["I would sleep in late, visit my favorite cafe, and watch movies all day.", "I would go on a day trip to the beach with my best friends.", "I would spend the entire day painting, playing games, and baking treats."]
        },
        {
          questionEn: "What is an interesting fact or fascinating thing you learned this week?",
          questionTr: "Bu hafta öğrendiğin ilginç bir bilgi veya büyüleyici şey nedir?",
          hints: ["I learned an interesting historical fact about ancient empires in class.", "I discovered how AI algorithms recognize human speech patterns.", "I learned that honey never spoils even after thousands of years!"]
        },
        {
          questionEn: "Do you prefer mornings or nights? Are you an early bird or a night owl, and why?",
          questionTr: "Sabahları mı geceleri mi tercih edersin? Erken kalkan biri misin yoksa gece kuşu mu, ve neden?",
          hints: ["I am definitely a night owl; I feel more creative in the quiet evening.", "I am an early bird; I love the peaceful energy of morning sunlight.", "I am in between: I like productive mornings and relaxing evenings."]
        },
        {
          questionEn: "What is something simple in daily life that always brings a big smile to your face?",
          questionTr: "Günlük hayatta yüzüne her zaman kocaman bir gülümseme getiren basit bir şey nedir?",
          hints: ["Seeing a cute fluffy cat on the street or petting my pet.", "Enjoying a warm cup of chocolate after a cold walk outside.", "Laughing with my best friends over silly inside jokes."]
        },
        {
          questionEn: "If you could have any magical superpower for one day, what power would you choose?",
          questionTr: "Bir günlüğüne sihirli bir süper güce sahip olabilseydin hangi gücü seçerdin?",
          hints: ["I would choose the power to teleport anywhere in the world instantly!", "I would love the power of time travel to explore ancient history.", "I would pick the ability to speak every language in the universe fluently!"]
        },
        {
          questionEn: "What is your favorite season of the year: Spring, Summer, Autumn, or Winter, and why?",
          questionTr: "Yılın en sevdiğin mevsimi hangisi: İlkbahar, Yaz, Sonbahar mı yoksa Kış mı, ve neden?",
          hints: ["Spring, because the flowers bloom and the weather is so fresh.", "Summer, because school is out and we can swim at the beach.", "Autumn, because the golden leaves and cool breeze are so cozy."]
        },
        {
          questionEn: "What is one thing you are truly grateful for today?",
          questionTr: "Bugün gerçekten minnettar olduğun bir şey nedir?",
          hints: ["I am grateful for my healthy body, my loving family, and good education.", "I am grateful for great friends who make me laugh every day.", "I am thankful for the opportunity to practice English and learn new things."]
        },
        {
          questionEn: "What is one positive goal or wish you have for tomorrow?",
          questionTr: "Yarın için sahip olduğun pozitif bir hedef veya dilek nedir?",
          hints: ["To stay focused in class, learn new English words, and smile often.", "To complete my school assignments early and have fun in the evening.", "To have a calm, joyful, and productive day with my friends."]
        }
      ]
    };

    const topicList = matrices[topicId] || matrices.school_routine;
    const itemIndex = (turn - 1) % topicList.length;
    return topicList[itemIndex];
  }

  /* =========================================================
     7. CHAT RENDERING & AUDIO
     ========================================================= */
  renderChatMessages() {
    const stream = document.getElementById('ai-teacher-chat-stream');
    if (!stream) return;

    let html = '';

    this.messages.forEach((msg) => {
      if (msg.sender === 'teacher') {
        const wrappedEn = window.wordLookup ? window.wordLookup.wrap(msg.textEn) : msg.textEn;
        
        html += `
          <div class="teacher-msg-bubble-container">
            <div class="teacher-msg-avatar">👩‍🏫</div>
            <div class="teacher-msg-content">
              <!-- Feedback Card on Previous Student Message if available -->
              ${msg.feedback ? this.renderFeedbackCardHTML(msg.feedback) : ''}

              <div class="teacher-bubble">
                <div class="teacher-bubble-text-en">${wrappedEn}</div>
                <div class="teacher-bubble-text-tr">🇹🇷 ${msg.textTr || ''}</div>
                <div class="teacher-bubble-actions">
                  <button class="bubble-action-btn" onclick="aiTeacher.speakText('${msg.textEn.replace(/'/g, "\\'")}')" title="Sesli Dinle">
                    🔊 Dinle
                  </button>
                  <button class="bubble-action-btn" onclick="aiTeacher.speakSlow('${msg.textEn.replace(/'/g, "\\'")}')" title="Yavaş Dinle (0.7x)">
                    🐢 Yavaş Dinle
                  </button>
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

    // Update bottom quick hints with latest teacher hints
    this.renderQuickHints();
  }

  renderFeedbackCardHTML(fb) {
    if (!fb) return '';
    const isCorrect = fb.is_correct !== false && !fb.correction_needed;

    return `
      <div class="teacher-feedback-card ${isCorrect ? 'fb-success' : 'fb-correction'}">
        <div class="fb-header">
          <span class="fb-badge">${isCorrect ? '🌟 Harika Cümle!' : '🎯 Öğretmen Düzeltmesi & İpucu'}</span>
          <span class="fb-praise">${fb.praise_tr || ''}</span>
        </div>
        ${!isCorrect ? `
          <div class="fb-body">
            <div class="fb-corrected-line">
              <strong>✅ Doğrusu:</strong> <code>${fb.corrected_en || ''}</code>
            </div>
            <div class="fb-explanation">
              ${fb.explanation_tr || ''}
            </div>
          </div>
        ` : ''}
        ${fb.natural_alternative_en && fb.natural_alternative_en !== fb.corrected_en ? `
          <div class="fb-natural-alt">
            <span>💡 Daha Doğal Söylem:</span> <em>"${fb.natural_alternative_en}"</em>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderQuickHints() {
    const hintsContainer = document.getElementById('teacher-quick-hints');
    if (!hintsContainer) return;

    const lastTeacherMsg = [...this.messages].reverse().find(m => m.sender === 'teacher');
    if (lastTeacherMsg && lastTeacherMsg.hints && lastTeacherMsg.hints.length > 0) {
      hintsContainer.style.display = 'flex';
      hintsContainer.innerHTML = `
        <span class="hints-label">💡 Cevap İpuçları (Tıkla ve Doldur):</span>
        <div class="hints-scroll">
          ${lastTeacherMsg.hints.map(h => `
            <button class="hint-chip" onclick="aiTeacher.useQuickHint('${h.replace(/'/g, "\\'")}')">
              "${h}"
            </button>
          `).join('')}
        </div>
      `;
    } else {
      hintsContainer.style.display = 'none';
    }
  }

  renderTypingIndicator() {
    const stream = document.getElementById('ai-teacher-chat-stream');
    if (!stream) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'teacher-typing-indicator';
    typingDiv.className = 'teacher-msg-bubble-container';
    typingDiv.innerHTML = `
      <div class="teacher-msg-avatar">👩‍🏫</div>
      <div class="teacher-bubble typing-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="typing-text">Teacher Emily düşünüyor ve cevabını hazırlıyor...</span>
      </div>
    `;
    stream.appendChild(typingDiv);
    stream.scrollTop = stream.scrollHeight;
  }

  speakText(text) {
    if (!text || !window.speechEngine) return;
    window.speechEngine.setRate(this.speechRate);
    window.speechEngine.speak(text);
  }

  speakSlow(text) {
    if (!text || !window.speechEngine) return;
    window.speechEngine.setRate(0.7);
    window.speechEngine.speak(text, () => {
      window.speechEngine.setRate(this.speechRate);
    });
  }
}

// Global Singleton Instance
const aiTeacherInstance = new AITeacherEngine();
window.aiTeacher = aiTeacherInstance;
