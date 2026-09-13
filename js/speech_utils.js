/**
 * 🔊 High-Performance Multi-Tier Speech & Web Audio Engine
 * Inspired by JARVIS V3 AudioContext PCM Streaming & Web Speech Synthesis.
 * 
 * Features:
 * 1. 🛡️ Safe Utterance Scheduler (Zero silent drops / eliminates cancel() race conditions).
 * 2. ⚡ Web Audio Context Unlocker & Soundcard Wakeup (Pipelined to speakers).
 * 3. 🎙️ Natural Voice Profiling (Samantha / Ava / Jenny / Google US English / Alex / Guy).
 * 4. 🔮 Real-time Audio Visualizer synchronization (Pulsing Orb harmonics).
 * 5. 🌐 Web Audio Direct Buffer Fallback Player (Direct sound card PCM/Audio delivery).
 */

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.audioCtx = null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.88; // Natural conversational human pace
    this.pitch = 1.0;
    this.volume = 1.0;
    this.isSpeaking = false;
    this._activeUtterance = null;
    this._watchdogTimer = null;
    this._isAudioUnlocked = false;
    this._cancelInProgress = false;
    this._pendingSpeakTimeout = null;
    this._audioSources = [];
    
    // Voice Persona: 'emily_studio' (HD Female) | 'alex_studio' (HD Male)
    this.voiceProfile = localStorage.getItem('english_app_voice_profile') || 'emily_studio';
    this.voiceGender = localStorage.getItem('english_app_voice_gender') || 'female';

    this.init();
  }

  init() {
    this.ensureAudioContext();

    if (this.synth) {
      this.initVoices();
      if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }

    const unlockAudio = () => {
      this.unlockSoundcard();
    };

    ['touchstart', 'touchend', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { passive: true, capture: true });
    });
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  unlockSoundcard() {
    this.ensureAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    if (!this._isAudioUnlocked) {
      this._isAudioUnlocked = true;
      try {
        if (this.synth) {
          if (this.synth.paused) this.synth.resume();
        }
      } catch (e) {}

      // Subtle 10ms inaudible wake-up pulse to activate OS sound device
      try {
        if (this.audioCtx) {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          gain.gain.value = 0.001; // Silent
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start();
          osc.stop(this.audioCtx.currentTime + 0.02);
        }
      } catch (e) {}
    }
  }

  initVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices() || [];
      if (this.voices.length > 0) {
        const enVoices = this.voices.filter(v => v.lang && (v.lang.startsWith('en') || v.lang.includes('EN')));
        
        // Female voices ranked
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

        // Male voices ranked
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
          this.selectedVoice = maleRanked || enVoices.find(v => v.lang === 'en-GB') || enVoices[0] || null;
        } else {
          this.selectedVoice = femaleRanked || enVoices.find(v => v.lang === 'en-US') || enVoices[0] || null;
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

  /**
   * Speak English text with zero drops and multi-engine resilience
   */
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

    this.unlockSoundcard();
    this.clearWatchdog();

    if (this._pendingSpeakTimeout) {
      clearTimeout(this._pendingSpeakTimeout);
      this._pendingSpeakTimeout = null;
    }

    // Stop any existing playback smoothly
    this.stopPlayback();

    // Start speaking process
    this.isSpeaking = true;
    if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
      window.aiTeacher.visualizerOrb.setState('speaking');
    }
    if (window.aiTeacher && typeof window.aiTeacher.updateCallControlsUI === 'function') {
      window.aiTeacher.updateCallControlsUI();
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

    // Watchdog safety timer (15s max or calculated duration)
    const expectedDuration = Math.max(3500, cleanText.length * 85);
    this._watchdogTimer = setTimeout(() => {
      onFinished();
    }, Math.min(18000, expectedDuration));

    if (!this.synth) {
      // Direct Web Audio fallback
      this.playToneIndicator(cleanText, onFinished);
      return;
    }

    // Safe execution after clean queue drain
    this._pendingSpeakTimeout = setTimeout(() => {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.volume = 1.0;
        utterance.rate = this.rate || 0.88;
        utterance.pitch = (this.voiceGender === 'female' || this.voiceProfile === 'emily_studio') ? 1.05 : 0.95;

        if (!this.selectedVoice || this.voices.length === 0) {
          this.initVoices();
        }
        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        utterance.onstart = () => {
          this.isSpeaking = true;
          if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
            window.aiTeacher.visualizerOrb.setState('speaking');
          }
        };

        utterance.onend = () => {
          onFinished();
        };

        utterance.onerror = (e) => {
          console.warn("Speech synthesis error event:", e?.error || e);
          if (e?.error === 'canceled' || e?.error === 'interrupted') {
            // Ignored if caused by new user interruption
            return;
          }
          // If browser speech fails, finish gracefully
          onFinished();
        };

        this._activeUtterance = utterance;
        this.synth.speak(utterance);

        // macOS Chrome Keepalive
        const keepAlive = setInterval(() => {
          if (!this.isSpeaking || finished) {
            clearInterval(keepAlive);
          } else if (this.synth.paused) {
            this.synth.resume();
          }
        }, 1500);

      } catch (err) {
        console.warn("Speech speak error:", err);
        onFinished();
      }
    }, 40);
  }

  /**
   * Direct Web Audio Sound Player (Plays AudioBuffer or Audio ArrayBuffer via AudioContext)
   * Inspired by JARVIS V3 playAudioChunk.
   */
  async playAudioBuffer(audioData, onEnd = null) {
    this.unlockSoundcard();
    const ctx = this.ensureAudioContext();
    if (!ctx) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.stopPlayback();
      this.isSpeaking = true;

      if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
        window.aiTeacher.visualizerOrb.setState('speaking');
      }

      let buffer;
      if (audioData instanceof AudioBuffer) {
        buffer = audioData;
      } else if (audioData instanceof ArrayBuffer || audioData instanceof Uint8Array) {
        const copyBuf = audioData instanceof Uint8Array ? audioData.buffer.slice(audioData.byteOffset, audioData.byteOffset + audioData.byteLength) : audioData.slice(0);
        buffer = await ctx.decodeAudioData(copyBuf);
      }

      if (!buffer) {
        if (onEnd) onEnd();
        return;
      }

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      // Connect to speakers and visualizer analyser if available
      if (window.aiTeacher?.visualizerOrb?.speakerAnalyser) {
        src.connect(window.aiTeacher.visualizerOrb.speakerAnalyser);
        window.aiTeacher.visualizerOrb.speakerAnalyser.connect(ctx.destination);
      } else {
        src.connect(ctx.destination);
      }

      this._audioSources.push(src);

      src.onended = () => {
        const idx = this._audioSources.indexOf(src);
        if (idx >= 0) this._audioSources.splice(idx, 1);
        if (this._audioSources.length === 0) {
          this.isSpeaking = false;
          if (window.aiTeacher && window.aiTeacher.visualizerOrb) {
            window.aiTeacher.visualizerOrb.setState('idle');
          }
          if (window.aiTeacher && typeof window.aiTeacher.updateCallControlsUI === 'function') {
            window.aiTeacher.updateCallControlsUI();
          }
          if (onEnd) onEnd();
        }
      };

      src.start(0);

    } catch (e) {
      console.warn("Web Audio buffer playback exception:", e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  playToneIndicator(text, onEnd) {
    try {
      const ctx = this.ensureAudioContext();
      if (!ctx) { if (onEnd) onEnd(); return; }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => { if (onEnd) onEnd(); }, 350);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  stopPlayback() {
    this.clearWatchdog();
    if (this._pendingSpeakTimeout) {
      clearTimeout(this._pendingSpeakTimeout);
      this._pendingSpeakTimeout = null;
    }

    // Stop Web Audio sources
    for (const src of this._audioSources) {
      try { src.stop(); } catch (e) {}
    }
    this._audioSources = [];

    // Stop speech synthesis
    if (this.synth) {
      try {
        if (this.synth.speaking || this.synth.pending) {
          this.synth.cancel();
        }
      } catch (e) {}
    }

    this._activeUtterance = null;
    this.isSpeaking = false;
  }

  stop() {
    this.stopPlayback();
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
