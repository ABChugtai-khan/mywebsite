/**
 * CODE. CREATE. EXPERIENCE. — MAIN APPLICATION ORCHESTRATOR
 * Coordinates Three.js 3D depth, 240-frame preloader, 2D Canvas engine,
 * GSAP ScrollTrigger synchronization, and interactive UI micro-effects.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[System] Initializing CODE. CREATE. EXPERIENCE interactive platform...');

  // 1. Initialize UI Effects (Custom cursor, audio, terminal, navigation)
  let uiEffects = null;
  try {
    uiEffects = new UIEffectsManager();
  } catch (e) {
    console.warn('[System] UIEffectsManager initialization notice:', e);
  }

  // 2. Initialize Three.js 3D Background Environment
  let threeScene = null;
  try {
    if (typeof THREE !== 'undefined') {
      threeScene = new ThreeSceneManager('three-canvas');
    } else {
      console.warn('[System] Three.js library not detected. Running canvas in standalone mode.');
    }
  } catch (e) {
    console.warn('[System] ThreeSceneManager notice:', e);
  }

  // 3. Preloader DOM Elements
  const preloaderEl = document.getElementById('preloader');
  const percentDisplay = document.getElementById('preloader-percent');
  const barFill = document.getElementById('preloader-bar-fill');
  const statusDisplay = document.getElementById('preloader-status');
  const skipBtn = document.getElementById('preloader-skip-btn');

  const canvasEl = document.getElementById('animation-canvas');
  let animationEngine = null;
  let scrollCoordinator = null;
  let hasEntered = false;

  // 4. Initialize Frame Preloader (All 240 frames, .jpg extension)
  const preloader = new FramePreloader({
    totalFrames: 240,
    basePath: 'images/',
    filePrefix: 'ezgif-frame-',
    extension: '.jpg',
    concurrency: 12, // High-performance concurrent fetching

    onProgress: (data) => {
      if (percentDisplay) {
        percentDisplay.textContent = `${data.percent}%`;
      }
      if (barFill) {
        barFill.style.width = `${data.percent}%`;
      }
      if (statusDisplay) {
        const framePad = String(data.loaded).padStart(3, '0');
        statusDisplay.textContent = `SYNCING HARDWARE BUFFERS [${framePad} / ${data.total}]...`;
      }
    },

    onComplete: (images) => {
      console.log('[System] All 240 video frames verified and ready.');
      revealExperience();
    },

    onError: (err) => {
      console.error('[System] Preloader error:', err);
    }
  });

  // Start preloading
  preloader.start();

  // Failsafe skip button
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      revealExperience();
    });
  }

  /**
   * Transition from preloader to interactive experience
   */
  function revealExperience() {
    if (hasEntered) return;
    hasEntered = true;

    if (preloaderEl) {
      preloaderEl.classList.add('loaded');
      setTimeout(() => {
        preloaderEl.style.display = 'none';
      }, 850);
    }

    // 5. Initialize Canvas 2D Animation Engine
    if (canvasEl) {
      animationEngine = new FrameAnimationEngine(canvasEl, preloader);
    }

    // 6. Initialize GSAP Scroll Coordinator
    if (animationEngine) {
      scrollCoordinator = new ScrollAnimationCoordinator({
        animationEngine,
        threeScene,
        totalFrames: 240
      });
    }

    // 7. Hero Entrance Stagger Animation
    if (typeof gsap !== 'undefined') {
      gsap.from('.hero-pill-badge', { y: -20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.from('.hero-title', { y: 30, opacity: 0, duration: 1, delay: 0.35, ease: 'power3.out' });
      gsap.from('.hero-description', { y: 20, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' });
      gsap.from('.hero-cta-group', { y: 20, opacity: 0, duration: 0.8, delay: 0.65, ease: 'power3.out' });
      gsap.from('.hero-telemetry-grid', { y: 20, opacity: 0, duration: 0.8, delay: 0.8, ease: 'power3.out' });
      gsap.from('.hero-scroll-indicator', { opacity: 0, duration: 1, delay: 1, ease: 'power3.out' });
    }

    console.log('[System] CODE. CREATE. EXPERIENCE initialized and live.');
  }

  // Refresh ScrollTrigger calculations on window resize
  window.addEventListener('resize', () => {
    if (scrollCoordinator) {
      scrollCoordinator.refresh();
    }
  });
});
