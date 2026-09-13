/**
 * 🔮 Interactive Waveform Orb & Web Audio Visualizer (Full-Duplex Voice AI)
 * 
 * Features:
 * - 60 FPS Canvas-based Glowing Fluid Orb & Particle Field.
 * - Real-time Web Audio API frequency and amplitude analysis (Mic input & AI Audio output).
 * - 4 Organic Visual States:
 *    1. 'idle'     -> Breathing subtle cyan/indigo sphere.
 *    2. 'listening'-> Fluid expanding emerald/cyan waveform responding to student's voice volume.
 *    3. 'thinking' -> Dynamic spinning golden/violet vortex halo.
 *    4. 'speaking' -> Harmonic pulsating magenta/cyan waves synced to AI teacher's speech.
 */

class AudioVisualizerOrb {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;
    
    // Audio Context & Analyser
    this.audioCtx = null;
    this.micAnalyser = null;
    this.speakerAnalyser = null;
    this.micStream = null;
    this.micDataArray = null;
    this.speakerDataArray = null;
    
    // Orb Parameters & Animation State
    this.state = 'idle'; // 'idle' | 'listening' | 'thinking' | 'speaking'
    this.width = 320;
    this.height = 320;
    this.baseRadius = 75;
    this.currentRadius = 75;
    this.targetRadius = 75;
    this.rotation = 0;
    this.time = 0;
    
    // Amplitude smoothing
    this.smoothedVolume = 0;
    this.energyBands = [0, 0, 0, 0, 0];
    
    // Particles
    this.particles = [];
    this.initParticles(35);
  }

  init(canvasElement) {
    this.canvas = canvasElement || document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.startAnimation();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 320;
    this.height = rect.height || 320;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 60;
      this.particles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        angle: angle,
        speed: 0.005 + Math.random() * 0.015,
        radius: 1.5 + Math.random() * 2.5,
        dist: dist,
        baseDist: dist,
        alpha: 0.2 + Math.random() * 0.6
      });
    }
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  async attachMicrophone(mediaStream) {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      this.micStream = mediaStream;
      const source = this.audioCtx.createMediaStreamSource(mediaStream);
      this.micAnalyser = this.audioCtx.createAnalyser();
      this.micAnalyser.fftSize = 128;
      this.micAnalyser.smoothingTimeConstant = 0.8;
      source.connect(this.micAnalyser);
      
      const bufferLength = this.micAnalyser.frequencyBinCount;
      this.micDataArray = new Uint8Array(bufferLength);
    } catch (err) {
      console.warn("Could not attach microphone to visualizer:", err);
    }
  }

  attachAudioElement(audioElement) {
    this.ensureAudioContext();
    if (!this.audioCtx || !audioElement) return;

    try {
      if (!audioElement._hasVisualizerSource) {
        const source = this.audioCtx.createMediaElementSource(audioElement);
        this.speakerAnalyser = this.audioCtx.createAnalyser();
        this.speakerAnalyser.fftSize = 128;
        this.speakerAnalyser.smoothingTimeConstant = 0.82;
        source.connect(this.speakerAnalyser);
        this.speakerAnalyser.connect(this.audioCtx.destination);
        audioElement._hasVisualizerSource = true;
        
        const bufferLength = this.speakerAnalyser.frequencyBinCount;
        this.speakerDataArray = new Uint8Array(bufferLength);
      }
    } catch (err) {
      console.warn("Could not attach audio element to visualizer:", err);
    }
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
    }
  }

  getVolume() {
    let vol = 0;
    if (this.state === 'listening' && this.micAnalyser && this.micDataArray) {
      this.micAnalyser.getByteFrequencyData(this.micDataArray);
      let sum = 0;
      for (let i = 0; i < this.micDataArray.length; i++) {
        sum += this.micDataArray[i];
      }
      vol = sum / (this.micDataArray.length * 255);
    } else if (this.state === 'speaking' && this.speakerAnalyser && this.speakerDataArray) {
      this.speakerAnalyser.getByteFrequencyData(this.speakerDataArray);
      let sum = 0;
      for (let i = 0; i < this.speakerDataArray.length; i++) {
        sum += this.speakerDataArray[i];
      }
      vol = sum / (this.speakerDataArray.length * 255);
    } else if (this.state === 'speaking') {
      // Harmonic synthetic volume when streaming via direct stream
      vol = 0.35 + Math.sin(this.time * 8) * 0.18 + Math.cos(this.time * 14) * 0.12;
    } else if (this.state === 'listening') {
      vol = 0.15 + Math.sin(this.time * 6) * 0.08;
    } else if (this.state === 'thinking') {
      vol = 0.25 + Math.sin(this.time * 12) * 0.15;
    } else {
      vol = 0.05 + Math.sin(this.time * 2) * 0.03;
    }

    // Smooth volume transition
    this.smoothedVolume += (vol - this.smoothedVolume) * 0.18;
    return Math.max(0, Math.min(1, this.smoothedVolume));
  }

  startAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    const render = () => {
      this.draw();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;
    
    this.time += 0.025;
    this.rotation += (this.state === 'thinking' ? 0.045 : 0.012);
    
    const volume = this.getVolume();
    
    // Clear canvas with subtle trail
    ctx.clearRect(0, 0, w, h);

    // 1. Color Palettes by State
    let primaryColor, secondaryColor, glowColor, ringColor;
    if (this.state === 'listening') {
      // Emerald & Cyan (Active Listening)
      primaryColor = 'rgba(16, 185, 129, ';
      secondaryColor = 'rgba(6, 182, 212, ';
      glowColor = 'rgba(16, 185, 129, 0.4)';
      ringColor = 'rgba(52, 211, 153, ';
    } else if (this.state === 'thinking') {
      // Violet & Gold (Neural AI Thinking)
      primaryColor = 'rgba(234, 179, 8, ';
      secondaryColor = 'rgba(168, 85, 247, ';
      glowColor = 'rgba(234, 179, 8, 0.45)';
      ringColor = 'rgba(244, 114, 182, ';
    } else if (this.state === 'speaking') {
      // Electric Indigo, Pink & Cyan (Speaking Voice Harmonics)
      primaryColor = 'rgba(236, 72, 153, ';
      secondaryColor = 'rgba(99, 102, 241, ';
      glowColor = 'rgba(236, 72, 153, 0.45)';
      ringColor = 'rgba(56, 189, 248, ';
    } else {
      // Idle: Deep Indigo & Cyan (Peaceful Breathing)
      primaryColor = 'rgba(99, 102, 241, ';
      secondaryColor = 'rgba(56, 189, 248, ';
      glowColor = 'rgba(99, 102, 241, 0.25)';
      ringColor = 'rgba(129, 140, 248, ';
    }

    // 2. Draw Outer Halo Rings & Bloom
    const pulseRadius = this.baseRadius + (volume * 42) + (Math.sin(this.time * 3) * 4);
    
    const outerGrad = ctx.createRadialGradient(cx, cy, pulseRadius * 0.4, cx, cy, pulseRadius * 1.8);
    outerGrad.addColorStop(0, primaryColor + (0.22 + volume * 0.25) + ')');
    outerGrad.addColorStop(0.5, secondaryColor + (0.12 + volume * 0.15) + ')');
    outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.save();
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Draw Orbiting Nebula Particles
    ctx.save();
    ctx.translate(cx, cy);
    this.particles.forEach(p => {
      p.angle += p.speed * (this.state === 'thinking' ? 2.5 : 1);
      const currentDist = p.baseDist + (volume * 35) + Math.sin(this.time * 4 + p.angle) * 8;
      const px = Math.cos(p.angle) * currentDist;
      const py = Math.sin(p.angle) * currentDist;
      
      ctx.beginPath();
      ctx.arc(px, py, p.radius * (1 + volume * 0.8), 0, Math.PI * 2);
      ctx.fillStyle = secondaryColor + (p.alpha + volume * 0.3) + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = glowColor;
      ctx.fill();
    });
    ctx.restore();

    // 4. Multi-layered Morphing Fluid Core
    const layerCount = 3;
    for (let l = layerCount; l >= 1; l--) {
      const layerRadius = pulseRadius * (0.65 + l * 0.12);
      const layerSegments = 32;
      const angleStep = (Math.PI * 2) / layerSegments;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation * (l % 2 === 0 ? 1 : -1));
      
      ctx.beginPath();
      for (let i = 0; i <= layerSegments; i++) {
        const a = i * angleStep;
        // Harmonic deformation
        const wave1 = Math.sin(a * 3 + this.time * 4 + l) * (8 * volume + 3);
        const wave2 = Math.cos(a * 5 - this.time * 3) * (5 * volume + 2);
        const r = layerRadius + wave1 + wave2;
        
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      
      const coreGrad = ctx.createLinearGradient(-layerRadius, -layerRadius, layerRadius, layerRadius);
      if (l === 1) {
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.35, primaryColor + '0.95)');
        coreGrad.addColorStop(0.85, secondaryColor + '0.85)');
        coreGrad.addColorStop(1, primaryColor + '0.4)');
      } else {
        coreGrad.addColorStop(0, primaryColor + (0.35 / l) + ')');
        coreGrad.addColorStop(1, secondaryColor + (0.25 / l) + ')');
      }
      
      ctx.fillStyle = coreGrad;
      ctx.shadowBlur = 18 + volume * 25;
      ctx.shadowColor = glowColor;
      ctx.fill();
      
      if (l === 2) {
        ctx.strokeStyle = ringColor + (0.5 + volume * 0.4) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Center Core Specular Light Highlight
    ctx.save();
    ctx.translate(cx, cy);
    const specGrad = ctx.createRadialGradient(-pulseRadius * 0.25, -pulseRadius * 0.25, 2, -pulseRadius * 0.2, -pulseRadius * 0.2, pulseRadius * 0.5);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(-pulseRadius * 0.2, -pulseRadius * 0.2, pulseRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  destroy() {
    this.stopAnimation();
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.micStream = null;
    }
  }
}

// Global Singleton
window.AudioVisualizerOrb = AudioVisualizerOrb;
