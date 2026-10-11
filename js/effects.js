/**
 * CODE. CREATE. EXPERIENCE. — UI EFFECTS & INTERACTIONS
 * Handles custom cyber cursor, 3D card tilts, synthesized audio FX,
 * interactive developer CLI terminal, navbar scroll effects, and form validation.
 */

class UIEffectsManager {
  constructor() {
    this.soundEnabled = false;
    this.audioCtx = null;
    this.init();
  }

  init() {
    this.setupCustomCursor();
    this.setupNavbarScroll();
    this.setupMobileMenu();
    this.setupCard3DTilt();
    this.setupAudioSynthesizer();
    this.setupInteractiveTerminal();
    this.setupContactForm();
    this.setupBackToTop();
  }

  /**
   * Smooth Cyber Cursor tracking
   */
  setupCustomCursor() {
    const dot = document.querySelector('.custom-cursor-dot');
    const ring = document.querySelector('.custom-cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth lerp for outer ring
    const renderCursorRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursorRing);
    };
    renderCursorRing();

    // Expand cursor ring on interactive hoverables
    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .process-card, .tech-card, .project-card');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        this.playHoverSound();
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  /**
   * Navbar blur & scroll spy
   */
  setupNavbarScroll() {
    const navbar = document.querySelector('.site-navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id], header[id], div[id="cinematic-wrapper"]');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }

      // Scroll Spy
      let currentSectionId = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href')?.replace('#', '');
        if (href === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
  }

  /**
   * Mobile menu toggle
   */
  setupMobileMenu() {
    const toggleBtn = document.getElementById('nav-toggle-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!toggleBtn || !navLinks) return;

    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      this.playClickSound();
    });

    // Close when clicking any nav link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  /**
   * 3D Specular Tilt on cards
   */
  setupCard3DTilt() {
    const tiltCards = document.querySelectorAll('.process-card, .project-card, .tech-card');

    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /**
   * Web Audio API Synthesizer for cyber sound FX (no external audio assets required)
   */
  setupAudioSynthesizer() {
    const soundToggle = document.getElementById('sound-toggle-btn');
    if (!soundToggle) return;

    soundToggle.addEventListener('click', () => {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      this.soundEnabled = !this.soundEnabled;
      soundToggle.classList.toggle('active', this.soundEnabled);

      if (this.soundEnabled) {
        this.playSuccessChime();
        soundToggle.title = 'Sound FX: ON';
      } else {
        soundToggle.title = 'Sound FX: OFF';
      }
    });
  }

  playClickSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  playHoverSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  playSuccessChime() {
    if (!this.audioCtx) return;
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + i * 0.06);
        osc.stop(this.audioCtx.currentTime + i * 0.06 + 0.2);
      });
    } catch (e) {}
  }

  /**
   * Interactive CLI Developer Terminal
   */
  setupInteractiveTerminal() {
    const input = document.getElementById('terminal-cli-input');
    const screen = document.getElementById('terminal-screen');
    const cmdButtons = document.querySelectorAll('.btn-terminal-cmd');

    if (!input || !screen) return;

    const executeCommand = (rawCmd) => {
      const cmd = rawCmd.trim().toLowerCase();
      if (!cmd) return;

      // Echo input
      const echoP = document.createElement('p');
      echoP.innerHTML = `<span class="prompt-cyan">guest@code-nexus:~$</span> ${escapeHTML(rawCmd)}`;
      screen.appendChild(echoP);

      const respP = document.createElement('p');

      switch (cmd) {
        case 'help':
          respP.innerHTML = `
            Available commands:<br>
            • <span class="prompt-green">about</span> - Project inspiration & specs<br>
            • <span class="prompt-green">stack</span> - Tech stack breakdown<br>
            • <span class="prompt-green">frames</span> - Animation frame sequence telemetry<br>
            • <span class="prompt-green">time</span> - Current system timestamp<br>
            • <span class="prompt-green">contact</span> - Jump directly to contact form<br>
            • <span class="prompt-green">clear</span> - Clear terminal logs
          `;
          break;
        case 'about':
          respP.innerHTML = `CODE. CREATE. EXPERIENCE. — A cinematic 240-frame interactive 3D developer experience powered by Three.js and GSAP ScrollTrigger.`;
          break;
        case 'stack':
          respP.innerHTML = `HTML5, CSS3 Glassmorphism, JavaScript ES6+, Three.js WebGL, GSAP ScrollTrigger, Canvas 2D API.`;
          break;
        case 'frames':
          respP.innerHTML = `Frames: 240 (1280x720 Native HD). Resolution: 16:9. Preloaded: 100%. Engine: Hardware-accelerated 2D Canvas Blit.`;
          break;
        case 'time':
          respP.innerHTML = `System Time: ${new Date().toUTCString()}`;
          break;
        case 'contact':
          respP.innerHTML = `Routing signal to contact dispatch...`;
          document.getElementById('name-input')?.focus();
          break;
        case 'clear':
          screen.innerHTML = '';
          return;
        default:
          respP.innerHTML = `<span style="color:#ff5252;">command not found: "${escapeHTML(cmd)}". Type 'help' for available commands.</span>`;
          break;
      }

      screen.appendChild(respP);
      screen.scrollTop = screen.scrollHeight;
      this.playClickSound();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        executeCommand(val);
      }
    });

    cmdButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          executeCommand(cmd);
        }
      });
    });

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }
  }

  /**
   * Contact Form Validation & State
   */
  setupContactForm() {
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status-msg');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name-input')?.value.trim();
      const email = document.getElementById('email-input')?.value.trim();
      const message = document.getElementById('message-input')?.value.trim();

      if (!name || !email || !message) {
        if (statusMsg) {
          statusMsg.className = 'form-status-msg error';
          statusMsg.textContent = '[ERROR: All telemetry fields required before dispatch]';
        }
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (statusMsg) {
          statusMsg.className = 'form-status-msg error';
          statusMsg.textContent = '[ERROR: Invalid quantum email signature]';
        }
        return;
      }

      // Simulated dispatch transmission
      if (statusMsg) {
        statusMsg.className = 'form-status-msg';
        statusMsg.style.color = 'var(--cyan-primary)';
        statusMsg.textContent = '[TRANSMITTING PACKETS TO SECURE NEXUS...]';
      }

      setTimeout(() => {
        if (statusMsg) {
          statusMsg.className = 'form-status-msg success';
          statusMsg.textContent = '✓ TRANSMISSION DELIVERED. Thank you! Response will be returned shortly.';
        }
        form.reset();
        this.playSuccessChime();
      }, 1000);
    });
  }

  /**
   * Smooth Back To Top Button
   */
  setupBackToTop() {
    const btn = document.getElementById('btn-back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      this.playClickSound();
    });
  }
}

// Export to window
window.UIEffectsManager = UIEffectsManager;
