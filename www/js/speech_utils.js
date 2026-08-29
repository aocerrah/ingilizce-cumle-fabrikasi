/**
 * Speech Synthesis (TTS) Dual-Engine Utility for English Words & Sentences
 * High compatibility with Android APK, WebView, iOS Safari, Chrome & Desktop.
 * 
 * Includes:
 * 1. Web Speech API with Android WebView GC protection & watchdog timer.
 * 2. High-Fidelity HTML5 Audio Fallback Engine (for devices where Web Speech is muted or missing).
 * 3. Proactive Audio Unlock on initial touch/click.
 */

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.9; // Optimal pace for language learners
    this.pitch = 1.0;
    this.isSpeaking = false;
    this._activeUtterance = null;
    this._watchdogTimer = null;
    this._currentAudio = null;
    this._isAudioUnlocked = false;

    this.init();
  }

  init() {
    // Setup Web Speech API
    if (this.synth) {
      this.initVoices();
      if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }

    // Proactive audio unlock on first user gesture
    const unlockAudio = () => {
      if (this._isAudioUnlocked) return;
      this._isAudioUnlocked = true;

      // Silent utterance / audio unlock for Android WebViews & iOS
      try {
        if (this.synth) {
          const silent = new SpeechSynthesisUtterance('');
          silent.volume = 0;
          this.synth.speak(silent);
        }
      } catch (e) {}

      // Remove listeners once unlocked
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
        // Priority 1: High quality English (US or UK/GB)
        this.selectedVoice = 
          this.voices.find(v => (v.lang === 'en-US' || v.lang === 'en_US') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Siri'))) ||
          this.voices.find(v => v.lang === 'en-US' || v.lang === 'en_US') ||
          this.voices.find(v => v.lang === 'en-GB' || v.lang === 'en_GB') ||
          this.voices.find(v => v.lang.startsWith('en')) ||
          this.voices[0];
      }
    } catch (e) {
      console.warn("Could not load voices:", e);
    }
  }

  speak(text, onEnd = null) {
    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    // Clean brackets, strange markdown or emojis
    const cleanText = text
      .replace(/[\(\)\[\]\{\}\*\_~#]/g, '')
      .replace(/[\u{1F600}-\u{1F6FF}|[\u{1F300}-\u{1F5FF}|[\u{1F680}-\u{1F6FF}|[\u{2600}-\u{26FF}]/gu, '')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // Stop previous audio
    this.stop();

    // Check if we can use Web Speech API
    const canUseWebSpeech = this.synth && typeof SpeechSynthesisUtterance !== 'undefined';

    if (canUseWebSpeech) {
      try {
        // Safety cancel
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        } else {
          this.initVoices();
          if (this.selectedVoice) utterance.voice = this.selectedVoice;
        }

        // CRITICAL FIX: Keep utterance in memory to avoid Android WebView GC bug
        this._activeUtterance = utterance;

        let hasStarted = false;

        utterance.onstart = () => {
          this.isSpeaking = true;
          hasStarted = true;
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this._activeUtterance = null;
          this.clearWatchdog();
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          console.warn("Web Speech API error, switching to HTML5 Audio fallback:", e);
          this.isSpeaking = false;
          this._activeUtterance = null;
          this.clearWatchdog();
          // Fallback to HTML5 audio stream
          this.speakViaAudioStream(cleanText, onEnd);
        };

        // Watchdog: If Web Speech doesn't start or finish within reasonable time (e.g. frozen in Android WebView)
        this.clearWatchdog();
        const expectedDuration = Math.max(2500, cleanText.length * 90);
        this._watchdogTimer = setTimeout(() => {
          if (!hasStarted) {
            console.warn("SpeechSynthesis did not start within 800ms, using Audio stream fallback.");
            if (this.synth) this.synth.cancel();
            this._activeUtterance = null;
            this.speakViaAudioStream(cleanText, onEnd);
          } else if (this.isSpeaking) {
            this.isSpeaking = false;
            this._activeUtterance = null;
            if (onEnd) onEnd();
          }
        }, Math.min(8000, expectedDuration));

        this.synth.speak(utterance);
        return;
      } catch (err) {
        console.warn("Exception in Web Speech speak, fallback to audio stream:", err);
      }
    }

    // Primary Fallback: HTML5 Audio Stream
    this.speakViaAudioStream(cleanText, onEnd);
  }

  speakViaAudioStream(cleanText, onEnd = null) {
    this.stop();
    this.isSpeaking = true;

    // High quality speech endpoints with graceful fallback
    const encoded = encodeURIComponent(cleanText);
    const audioUrl1 = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encoded}`;
    const audioUrl2 = `https://dict.youdao.com/dictvoice?audio=${encoded}&type=2`; // US English pronunciation fallback

    const audio = new Audio();
    this._currentAudio = audio;

    const cleanup = () => {
      this.isSpeaking = false;
      this._currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onended = cleanup;
    audio.onerror = () => {
      // Try secondary endpoint
      if (audio.src !== audioUrl2) {
        audio.src = audioUrl2;
        audio.play().catch(() => cleanup());
      } else {
        cleanup();
      }
    };

    audio.src = audioUrl1;
    audio.play().catch(e => {
      console.warn("Audio play rejected or failed:", e);
      cleanup();
    });
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
    this.rate = Math.max(0.5, Math.min(1.5, rate));
  }
}

// Global instance
window.speechEngine = new SpeechEngine();
