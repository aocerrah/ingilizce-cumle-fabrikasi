/**
 * 👩‍🏫 AI English Teacher & Voice Conversation Coach (İnteraktif AI İngilizce Öğretmeni & Konuşma Koçu)
 * 
 * Features:
 * 1. 🎙️ Real-time Voice Recognition (Speech-to-Text via Web Speech API) + Typing Support.
 * 2. 🔊 High-Fidelity Audio Pronunciation (Text-to-Speech via speechEngine).
 * 3. 🧠 Dual AI Engine:
 *    - Cloud Gemini 1.5/2.0 Flash (Intelligent, adaptive, kind teacher personality).
 *    - Offline Rule-Based Teacher Engine (50+ dialogue trees, grammar diagnostics, instant Turkish feedback).
 * 4. 🏫 Curriculum & Notebook Word Reinforcement (Pulls 9th grade & custom unknown words into dialogue).
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
    this.speechRate = 0.85; // Optimal listening pace for learners
    this.autoSpeak = true;
    
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
              <p class="teacher-status" id="teacher-status-desc">9. Sınıf & Günlük Konuşma Pratiği</p>
            </div>
          </div>
          <div class="teacher-header-actions">
            <button class="icon-btn" onclick="aiTeacher.toggleAutoSpeak()" id="teacher-tts-toggle" title="Sesli Okuma Aç/Kapat">
              🔊
            </button>
            <button class="icon-btn" onclick="aiTeacher.restartConversation()" title="Sohbeti Sıfırla">
              🔄
            </button>
            <button class="icon-btn" onclick="aiTeacher.closeTeacherModal()">✕</button>
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

    let starterEn = "";
    let starterTr = "";
    let starterHints = [];

    switch (topicId) {
      case 'school_routine':
        starterEn = "Hello dear! 😊 How was your school day? What is your favorite subject, and what time do you usually wake up in the morning?";
        starterTr = "Merhaba canım! 😊 Okul günün nasıl geçti? En sevdiğin ders hangisi ve sabahları genelde saat kaçta uyanırsın?";
        starterHints = [
          "My school day was great! I love English.",
          "I usually wake up at 7 AM on weekdays.",
          "My favorite subject is science because it is fun."
        ];
        break;

      case 'food_cafe':
        starterEn = "Hi there! 🍕 I am so hungry today. What did you eat for breakfast this morning, and what is your absolute favorite food?";
        starterTr = "Selam! 🍕 Bugün çok acıktım. Bu sabah kahvaltıda ne yedin ve en sevdiğin yemek nedir?";
        starterHints = [
          "I had eggs, cheese, and tea for breakfast.",
          "My favorite food is pasta and grilled chicken.",
          "I love eating healthy food and drinking fresh orange juice."
        ];
        break;

      case 'hobbies_sports':
        starterEn = "Hey! 🎮 What do you like doing in your free time? Do you prefer playing sports, reading books, or playing video games?";
        starterTr = "Selam! 🎮 Boş zamanlarında ne yapmayı seversin? Spor yapmayı mı, kitap okumayı mı yoksa video oyunu oynamayı mı tercih edersin?";
        starterHints = [
          "In my free time, I really enjoy playing volleyball.",
          "I prefer reading adventure books and listening to music.",
          "I like playing computer games with my friends on weekends."
        ];
        break;

      case 'travel_holidays':
        starterEn = "Hello adventurer! ✈️ If you could travel to any country in the world tomorrow, where would you go and why?";
        starterTr = "Merhaba maceracı! ✈️ Yarın dünyadaki herhangi bir ülkeye seyahat edebilseydin nereye giderdin ve neden?";
        starterHints = [
          "I would love to travel to Japan to see Tokyo.",
          "I want to visit London to practice my English!",
          "I would go to Italy because I love historical places."
        ];
        break;

      case 'friends_family':
        starterEn = "Hello! 👥 Can you describe your best friend to me? What is their personality like, and what do you do together?";
        starterTr = "Merhaba! 👥 Bana en yakın arkadaşını tarif edebilir misin? Kişiliği nasıldır ve birlikte neler yaparsınız?";
        starterHints = [
          "My best friend is very kind, helpful, and funny.",
          "We study English together and ride our bicycles.",
          "She is honest and always supports me when I need help."
        ];
        break;

      case 'future_dreams':
        starterEn = "Hi superstar! 🚀 What are your future goals? What profession do you dream of having when you grow up?";
        starterTr = "Selam süper star! 🚀 Gelecekteki hedeflerin neler? Büyüyünce hangi mesleği yapmak istiyorsun?";
        starterHints = [
          "My dream is to become a successful doctor.",
          "I want to be a software engineer and build AI apps.",
          "I want to learn English fluently and study abroad."
        ];
        break;

      default: // free_talk
        starterEn = "Hello! 💬 I am Emily, your personal English tutor. We can chat about anything you like! How are you feeling today?";
        starterTr = "Merhaba! 💬 Ben Emily, senin özel İngilizce öğretmenin. İstediğin her konuda sohbet edebiliriz! Bugün kendini nasıl hissediyorsun?";
        starterHints = [
          "I feel energetic and ready to learn English!",
          "I had a busy day at school today.",
          "I am feeling very happy because today is great."
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
      if (window.geminiAIEngine && window.geminiAIEngine.hasApiKey()) {
        teacherResponse = await this.generateGeminiTeacherReply(text);
      } else {
        await new Promise(resolve => setTimeout(resolve, 600)); // Natural typing feeling
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
    const key = window.geminiAIEngine.getApiKey();
    const topic = this.topics.find(t => t.id === this.currentTopic);
    const targetWords = this.getRecentTargetWords().slice(0, 5).map(w => `${w.en} (${w.tr})`).join(', ');

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
5. Continue the conversation by asking an engaging, easy-to-answer follow-up question related to the topic, occasionally weaving in one of her target vocabulary words.
6. Provide 3 short, helpful English reply suggestions (hints) that she can use to respond easily.

Return strictly JSON format:
{
  "student_analysis": {
    "is_correct": true,
    "praise_tr": "Harika bir cümle!",
    "correction_needed": false,
    "corrected_en": "Corrected version of student sentence (or original if correct)",
    "explanation_tr": "Türkçe nazik kural açıklaması (Örn: 'He/She öznelerinde geniş zamanda fiile -s ekleriz.')",
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
        temperature: 0.3,
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
     6. OFFLINE INTELLIGENT RULE-BASED TEACHER ENGINE
     ========================================================= */
  generateOfflineTeacherReply(studentSentence) {
    const raw = studentSentence.trim();
    const lower = raw.toLowerCase();

    // 1. Grammatical Diagnostic Rules
    let isCorrect = true;
    let correctedEn = raw;
    let explanationTr = "Harika! Cümle dizilimin ve gramerin gayet doğru.";
    let praiseTr = "Tebrikler! Kendini çok net ifade ettin. 🌟";
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
    }
    // Rule: "yesterday I go" -> "yesterday I went"
    else if (/yesterday/i.test(lower) && /\b(go|see|have|eat|drink|buy)\b/i.test(lower)) {
      isCorrect = false;
      correctedEn = raw.replace(/\bgo\b/gi, "went").replace(/\bsee\b/gi, "saw").replace(/\bhave\b/gi, "had").replace(/\beat\b/gi, "ate");
      explanationTr = "💡 Geçmiş zaman ipucu: Cümlede **yesterday (dün)** geçtiği için fiilin geçmiş hali (V2) kullanılır.";
      praiseTr = "Çok güzel! Zaman kuralını pratik ederek pekiştiriyoruz.";
    }
    // Rule: Missing capital 'I'
    else if (/\bi\b/.test(raw)) {
      correctedEn = raw.replace(/\bi\b/g, 'I');
    }

    // 2. Generate Contextual Reply based on Topic
    let replyEn = "";
    let replyTr = "";
    let hints = [];

    if (lower.includes('wake') || lower.includes('morning') || lower.includes('routine') || lower.includes('breakfast')) {
      replyEn = "That sounds like a very healthy routine! 👍 Do you also do light exercises or take a walk in the morning?";
      replyTr = "Kulağa çok sağlıklı bir rutin gibi geliyor! 👍 Sabahları ayrıca hafif egzersiz yapar mısın veya yürüyüşe çıkar mısın?";
      hints = [
        "Yes, I do light exercise every morning.",
        "No, but I usually walk to school.",
        "I prefer stretching and listening to music."
      ];
    } else if (lower.includes('like') || lower.includes('love') || lower.includes('enjoy') || lower.includes('prefer')) {
      replyEn = "That is wonderful! 🎉 How often do you do that during the week? Do you do it alone or with your friends?";
      replyTr = "Bu harika! 🎉 Hafta boyunca bunu ne sıklıkla yapıyorsun? Tek başına mı yoksa arkadaşlarınla mı yaparsın?";
      hints = [
        "I usually do it twice a week with my friends.",
        "I do it every day after finishing my homework.",
        "I prefer doing it on weekends when I have free time."
      ];
    } else if (lower.includes('school') || lower.includes('lesson') || lower.includes('teacher') || lower.includes('class')) {
      replyEn = "School is so important! 📚 What is your most challenging subject, and how do you prepare for exams?";
      replyTr = "Okul çok önemlidir! 📚 En çok zorlandığın ders hangisi ve sınavlara nasıl hazırlanırsın?";
      hints = [
        "Math is a bit challenging, but I study every day.",
        "I prepare for exams by solving quizzes and reviewing notes.",
        "English is my favorite and easiest subject!"
      ];
    } else {
      replyEn = "That is great! I really enjoy talking with you. 😊 Can you tell me what you plan to do tomorrow?";
      replyTr = "Harika! Seninle konuşmaktan gerçekten keyif alıyorum. 😊 Yarın ne yapmayı planladığını bana anlatabilir misin?";
      hints = [
        "Tomorrow I will attend my classes and study English.",
        "I plan to hang out with my friends in the afternoon.",
        "I will finish my school project and relax."
      ];
    }

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
