class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.88; // Natural conversational human pace
    this.pitch = 1.0;
    this.isSpeaking = false;
    this._activeUtterance = null;
    this._watchdogTimer = null;
    this._currentAudio = null;
    this._isAudioUnlocked = false;
    
    // Voice Persona: 'emily_studio' (Default HD Female) | 'alex_studio' (HD Male) | 'device_neural'
    this.voiceProfile = localStorage.getItem('english_app_voice_profile') || 'emily_studio';
    this.voiceMode = localStorage.getItem('english_app_voice_mode') || 'natural_human';
    this.voiceGender = localStorage.getItem('english_app_voice_gender') || 'female';

    this.init();
  }

  init() {
    if (this.synth) {
      this.initVoices();
      if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }

    const unlockAudio = () => {
      if (this._isAudioUnlocked) return;
      this._isAudioUnlocked = true;
      try {
        if (this.synth) {
          const silent = new SpeechSynthesisUtterance('');
          silent.volume = 0;
          this.synth.speak(silent);
        }
      } catch (e) {}

      window.removeEventListener('touchstart', unlockAudio, true);
      window.removeEventListener('click', unlockAudio, true);
    };

    window.addEventListener('touchstart', unlockAudio, { passive: true, capture: true });
    window.addEventListener('click', unlockAudio, { passive: true, capture: true });
  }

  initVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices() || [];
      if (this.voices.length > 0) {
        const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
        
        // Priority ranking for natural sounding female voices
        const femaleRanked = enVoices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Ava') || 
          v.name.includes('Jenny') || 
          v.name.includes('Aria') || 
          v.name.includes('Google US English') ||
          v.name.includes('Victoria') ||
          v.name.includes('Natural') ||
          v.name.includes('Enhanced') ||
          v.name.includes('Premium')
        );

        // Priority ranking for natural sounding male voices
        const maleRanked = enVoices.find(v => 
          v.name.includes('Guy') || 
          v.name.includes('Daniel') || 
          v.name.includes('Tom') || 
          v.name.includes('Google UK English Male') || 
          v.name.includes('Oliver') ||
          v.name.includes('Alex')
        );

        if (this.voiceGender === 'female' && femaleRanked) {
          this.selectedVoice = femaleRanked;
        } else if (this.voiceGender === 'male' && maleRanked) {
          this.selectedVoice = maleRanked;
        } else {
          this.selectedVoice = femaleRanked || enVoices.find(v => v.lang === 'en-US') || enVoices[0] || this.voices[0];
        }
      }
    } catch (e) {
      console.warn("Could not load voices:", e);
    }
  }

  setVoiceProfile(profile) {
    this.voiceProfile = profile;
    localStorage.setItem('english_app_voice_profile', profile);
    if (profile === 'alex_studio') {
      this.voiceMode = 'natural_human';
      this.voiceGender = 'male';
    } else if (profile === 'emily_studio') {
      this.voiceMode = 'natural_human';
      this.voiceGender = 'female';
    } else if (profile === 'device_neural') {
      this.voiceMode = 'device_neural';
    }
    localStorage.setItem('english_app_voice_mode', this.voiceMode);
    localStorage.setItem('english_app_voice_gender', this.voiceGender);
    this.initVoices();
  }

  setVoiceMode(mode) {
    this.voiceMode = mode;
    localStorage.setItem('english_app_voice_mode', mode);
  }

  setVoiceGender(gender) {
    this.voiceGender = gender;
    localStorage.setItem('english_app_voice_gender', gender);
    this.initVoices();
  }

  speak(text, onEnd = null) {
    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    const cleanText = text
      .replace(/[\(\)\[\]\{\}\*\_~#]/g, ' ')
      .replace(/[\u{1F600}-\u{1F6FF}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
      .replace(/["“”'‘’]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    this.speakDeviceSynth(cleanText, onEnd);
  }

  /**
   * High-Fidelity Voice Synthesis Engine (Web Speech API)
   * Streams sentences naturally with real-time UI/visualizer sync
   */
  speakDeviceSynth(cleanText, onEnd = null) {
    const canUseWebSpeech = this.synth && typeof SpeechSynthesisUtterance !== 'undefined';
    if (!canUseWebSpeech) {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    try {
      this.isSpeaking = true;

      if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
        window.aiTeacher.visualizerOrb.setState('speaking');
      }
      if (window.aiTeacher && typeof window.aiTeacher.updateCallControlsUI === 'function') {
        window.aiTeacher.updateCallControlsUI();
      }

      // Split into sentences for rhythmic, natural human phrasing
      const rawSentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
      const sentences = rawSentences.map(s => s.trim()).filter(s => s.length > 0);

      if (sentences.length === 0) {
        this.isSpeaking = false;
        if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
          window.aiTeacher.visualizerOrb.setState('idle');
        }
        if (onEnd) onEnd();
        return;
      }

      let sentenceIdx = 0;

      const speakSentence = () => {
        if (sentenceIdx >= sentences.length) {
          this.isSpeaking = false;
          this._activeUtterance = null;
          this.clearWatchdog();
          if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
            window.aiTeacher.visualizerOrb.setState('idle');
          }
          if (window.aiTeacher && typeof window.aiTeacher.updateCallControlsUI === 'function') {
            window.aiTeacher.updateCallControlsUI();
          }
          if (onEnd) onEnd();
          return;
        }

        const currentSentence = sentences[sentenceIdx];
        sentenceIdx++;

        if (window.aiTeacher && typeof window.aiTeacher.onTeacherSentenceSpoken === 'function') {
          window.aiTeacher.onTeacherSentenceSpoken(currentSentence);
        }

        const utterance = new SpeechSynthesisUtterance(currentSentence);
        utterance.lang = 'en-US';
        utterance.rate = this.rate;
        utterance.pitch = (this.voiceGender === 'female' || this.voiceProfile === 'emily_studio') ? 1.05 : 0.95;

        if (!this.selectedVoice) this.initVoices();
        if (this.selectedVoice) utterance.voice = this.selectedVoice;

        this._activeUtterance = utterance;
        let sentenceFinished = false;

        const advance = () => {
          if (!sentenceFinished) {
            sentenceFinished = true;
            this.clearWatchdog();
            speakSentence();
          }
        };

        utterance.onstart = () => {
          this.isSpeaking = true;
        };

        utterance.onend = advance;
        utterance.onerror = (e) => {
          console.warn("Speech synthesis error on sentence, advancing:", e);
          advance();
        };

        this.clearWatchdog();
        const expectedDuration = Math.max(2500, currentSentence.length * 90);
        this._watchdogTimer = setTimeout(() => {
          advance();
        }, Math.min(8000, expectedDuration));

        // Chrome/Safari safety: unpause and speak
        try {
          if (this.synth.paused) {
            this.synth.resume();
          }
          this.synth.cancel();
          setTimeout(() => {
            try {
              if (this.synth.paused) this.synth.resume();
              this.synth.speak(utterance);
            } catch (e) {
              advance();
            }
          }, 40);
        } catch (e) {
          advance();
        }
      };

      speakSentence();
    } catch (err) {
      console.warn("Speech synthesis exception:", err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  stop() {
    this.clearWatchdog();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    if (this._currentAudio) {
      try {
        this._currentAudio.pause();
        this._currentAudio.currentTime = 0;
      } catch (e) {}
      this._currentAudio = null;
    }
    this._activeUtterance = null;
    this.isSpeaking = false;
  }

  clearWatchdog() {
    if (this._watchdogTimer) {
      clearTimeout(this._watchdogTimer);
      this._watchdogTimer = null;
    }
  }

  setRate(rate) {
    this.rate = Math.max(0.6, Math.min(1.4, rate));
  }
}

// Global instances with dual aliasing for complete system compatibility
const speechInstance = new SpeechEngine();
window.speechEngine = speechInstance;
window.speechUtils = speechInstance;
