class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.90; // Natural conversational human pace
    this.pitch = 1.0;
    this.volume = 1.0;
    this.isSpeaking = false;
    this._activeUtterance = null;
    this._watchdogTimer = null;
    this._isAudioUnlocked = false;
    
    // Voice Persona: 'emily_studio' (Default HD Female) | 'alex_studio' (HD Male) | 'device_neural'
    this.voiceProfile = localStorage.getItem('english_app_voice_profile') || 'emily_studio';
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
          if (this.synth.paused) this.synth.resume();
          const silent = new SpeechSynthesisUtterance(' ');
          silent.volume = 0.01;
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
        const enVoices = this.voices.filter(v => v.lang && (v.lang.startsWith('en') || v.lang.includes('EN')));
        
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
          v.name.includes('Premium') ||
          v.name.includes('Karen') ||
          v.name.includes('Zira') ||
          v.name.includes('Susan')
        );

        // Priority ranking for natural sounding male voices
        const maleRanked = enVoices.find(v => 
          v.name.includes('Guy') || 
          v.name.includes('Daniel') || 
          v.name.includes('Tom') || 
          v.name.includes('Google UK English Male') || 
          v.name.includes('Oliver') ||
          v.name.includes('Alex') ||
          v.name.includes('David') ||
          v.name.includes('George')
        );

        if (this.voiceGender === 'male' || this.voiceProfile === 'alex_studio') {
          this.selectedVoice = maleRanked || enVoices.find(v => v.lang === 'en-GB') || enVoices[0];
        } else {
          this.selectedVoice = femaleRanked || enVoices.find(v => v.lang === 'en-US') || enVoices[0];
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
      this.voiceGender = 'male';
    } else {
      this.voiceGender = 'female';
    }
    localStorage.setItem('english_app_voice_gender', this.voiceGender);
    this.initVoices();
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

    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.clearWatchdog();

    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.cancel();

      this.isSpeaking = true;

      if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
        window.aiTeacher.visualizerOrb.setState('speaking');
      }
      if (window.aiTeacher && typeof window.aiTeacher.updateCallControlsUI === 'function') {
        window.aiTeacher.updateCallControlsUI();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.volume = 1.0;
      utterance.rate = this.rate || 0.90;
      utterance.pitch = (this.voiceGender === 'female' || this.voiceProfile === 'emily_studio') ? 1.05 : 0.95;

      if (!this.selectedVoice || this.voices.length === 0) {
        this.initVoices();
      }
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      let finished = false;
      const onFinished = () => {
        if (!finished) {
          finished = true;
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
        }
      };

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = onFinished;
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error event:", e);
        onFinished();
      };

      this._activeUtterance = utterance;

      // Watchdog timer (approx 75ms per character + 3s minimum)
      const expectedTime = Math.max(3000, cleanText.length * 80);
      this._watchdogTimer = setTimeout(() => {
        onFinished();
      }, Math.min(15000, expectedTime));

      // Chrome long-text keepalive
      const keepAliveInterval = setInterval(() => {
        if (!this.isSpeaking || finished) {
          clearInterval(keepAliveInterval);
        } else if (this.synth.paused) {
          this.synth.resume();
        }
      }, 3000);

      // Speak directly
      setTimeout(() => {
        try {
          if (this.synth.paused) this.synth.resume();
          this.synth.speak(utterance);
        } catch (e) {
          console.warn("Speech speak exception:", e);
          onFinished();
        }
      }, 50);

    } catch (err) {
      console.warn("Speech synthesis outer exception:", err);
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
