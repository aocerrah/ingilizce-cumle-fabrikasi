/**
 * Speech Synthesis (TTS) Utility for English Words & Sentences
 * High compatibility with Android WebView, Chrome, iOS & Desktop
 */

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.9; // Slightly slower for clear learning pronunciation
    this.pitch = 1.0;
    this.isSpeaking = false;

    if (this.synth) {
      this.initVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Prioritize English US or UK voices
    this.selectedVoice = this.voices.find(v => v.lang === 'en-US') ||
                         this.voices.find(v => v.lang.startsWith('en')) ||
                         this.voices[0];
  }

  speak(text, onEnd = null) {
    if (!this.synth) {
      console.warn("Speech Synthesis not supported in this browser.");
      if (onEnd) onEnd();
      return;
    }

    if (this.synth.speaking) {
      this.synth.cancel();
    }

    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    const cleanText = text.replace(/[\(\)]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(1.5, rate));
  }
}

// Global instance
window.speechEngine = new SpeechEngine();
