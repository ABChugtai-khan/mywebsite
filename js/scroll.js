/**
 * CODE. CREATE. EXPERIENCE. — FULL-SCREEN GSAP SCROLL COORDINATOR
 * Connects page scroll progress to the full-screen background canvas animation (Frames 001–240),
 * supports buttery-smooth forward/reverse scrubbing with zero jitter,
 * and synchronizes live HUD telemetry and phase milestones.
 */

class ScrollAnimationCoordinator {
  constructor(options = {}) {
    this.animationEngine = options.animationEngine;
    this.threeScene = options.threeScene;
    this.totalFrames = options.totalFrames || 240;

    // Persistent Floating HUD Elements
    this.frameCounterHud = document.getElementById('current-frame-hud');
    this.phaseChipHud = document.getElementById('current-phase-hud');
    this.progressHud = document.getElementById('progress-hud');
    this.timelineFill = document.getElementById('timeline-fill');
    this.phaseStepBtns = document.querySelectorAll('.btn-phase-step');
    this.autoScrubBtn = document.getElementById('btn-auto-scrub');
    this.storyMilestoneCards = document.querySelectorAll('.milestone-card');

    this.scrollTriggerInstance = null;
    this.isAutoScrubbing = false;
    this.autoScrubInterval = null;
    this.currentPhase = 1;

    this.phases = [
      { id: 1, name: 'ACT I // ARCHITECTING', start: 0, end: 69, progressStart: 0, progressEnd: 0.29 },
      { id: 2, name: 'ACT II // THE ALGORITHM', start: 70, end: 130, progressStart: 0.29, progressEnd: 0.54 },
      { id: 3, name: 'ACT III // RUNTIME TRIGGER', start: 131, end: 180, progressStart: 0.54, progressEnd: 0.75 },
      { id: 4, name: 'ACT IV // DIGITAL REALITY', start: 181, end: 239, progressStart: 0.75, progressEnd: 1.0 }
    ];

    this.init();
  }

  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.error('[ScrollCoordinator] GSAP or ScrollTrigger not loaded.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    this.setupScrollTrigger();
    this.setupInteractiveControls();
  }

  /**
   * Configures ScrollTrigger across the full page document scroll
   */
  setupScrollTrigger() {
    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: '#main-content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3, // 0.3s smooth scrub for responsive, lag-free frame advancement
      onUpdate: (self) => {
        this.handleScrollProgress(self.progress);
      }
    });

    // Render initial frame at position 0
    this.handleScrollProgress(0);
  }

  /**
   * Primary callback driving the full-screen background frame blitter
   */
  handleScrollProgress(progress) {
    // Calculate normalized frame index (0 to 239)
    const frameIndex = Math.min(
      this.totalFrames - 1,
      Math.max(0, Math.floor(progress * (this.totalFrames - 1)))
    );

    // Request frame on full-screen 2D canvas
    if (this.animationEngine) {
      this.animationEngine.requestFrame(frameIndex);
    }

    // Synchronize 3D Three.js spatial depth & particle flow
    if (this.threeScene) {
      this.threeScene.setScrollProgress(progress);
    }

    // Update HUD & Story Milestones
    this.updateHUD(frameIndex, progress);
    this.updatePhases(frameIndex, progress);
  }

  updateHUD(frameIndex, progress) {
    const frameNum1Based = frameIndex + 1;
    const formattedFrame = String(frameNum1Based).padStart(3, '0');
    const percentInt = Math.round(progress * 100);

    if (this.frameCounterHud) {
      this.frameCounterHud.textContent = formattedFrame;
    }

    if (this.progressHud) {
      this.progressHud.textContent = `${percentInt}%`;
    }

    if (this.timelineFill) {
      this.timelineFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }
  }

  updatePhases(frameIndex, progress) {
    let activePhaseObj = this.phases[0];

    for (const phase of this.phases) {
      if (frameIndex >= phase.start && frameIndex <= phase.end) {
        activePhaseObj = phase;
        break;
      }
    }

    if (this.currentPhase !== activePhaseObj.id) {
      this.currentPhase = activePhaseObj.id;

      if (this.phaseChipHud) {
        this.phaseChipHud.textContent = activePhaseObj.name;
      }

      // Update Phase Step Buttons in HUD
      this.phaseStepBtns.forEach((btn) => {
        const btnPhase = parseInt(btn.getAttribute('data-phase'), 10);
        if (btnPhase === activePhaseObj.id) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Highlight corresponding Story Milestone Cards
      this.storyMilestoneCards.forEach((card) => {
        const cardPhase = parseInt(card.getAttribute('data-phase'), 10);
        if (cardPhase === activePhaseObj.id) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
  }

  setupInteractiveControls() {
    // Quick Phase Navigation buttons
    this.phaseStepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetPhaseId = parseInt(btn.getAttribute('data-phase'), 10);
        this.scrollToPhase(targetPhaseId);
      });
    });

    // Timeline Scrubber track click
    const timelineTrack = document.getElementById('timeline-track');
    if (timelineTrack) {
      timelineTrack.addEventListener('click', (e) => {
        const rect = timelineTrack.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.scrollToProgress(clickRatio);
      });
    }

    // Auto-Scrub Demo Playback
    if (this.autoScrubBtn) {
      this.autoScrubBtn.addEventListener('click', () => {
        this.toggleAutoScrub();
      });
    }
  }

  scrollToPhase(phaseId) {
    const targetPhase = this.phases.find(p => p.id === phaseId);
    if (!targetPhase || !this.scrollTriggerInstance) return;

    this.scrollToProgress(targetPhase.progressStart + 0.02);
  }

  scrollToProgress(targetProgress) {
    if (!this.scrollTriggerInstance) return;

    const start = this.scrollTriggerInstance.start;
    const end = this.scrollTriggerInstance.end;
    const targetY = start + (end - start) * targetProgress;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  }

  toggleAutoScrub() {
    if (this.isAutoScrubbing) {
      this.stopAutoScrub();
    } else {
      this.startAutoScrub();
    }
  }

  startAutoScrub() {
    if (!this.scrollTriggerInstance) return;
    this.isAutoScrubbing = true;
    if (this.autoScrubBtn) {
      this.autoScrubBtn.classList.add('playing');
      this.autoScrubBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>PAUSE SCRUB</span>
      `;
    }

    const start = this.scrollTriggerInstance.start;
    const end = this.scrollTriggerInstance.end;
    let currentY = window.scrollY;

    if (currentY >= end - 20) {
      window.scrollTo({ top: start, behavior: 'instant' });
      currentY = start;
    }

    this.autoScrubInterval = setInterval(() => {
      currentY += 7;
      if (currentY >= end) {
        this.stopAutoScrub();
        return;
      }
      window.scrollTo(0, currentY);
    }, 16);
  }

  stopAutoScrub() {
    this.isAutoScrubbing = false;
    if (this.autoScrubInterval) {
      clearInterval(this.autoScrubInterval);
      this.autoScrubInterval = null;
    }
    if (this.autoScrubBtn) {
      this.autoScrubBtn.classList.remove('playing');
      this.autoScrubBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>AUTO SCRUB</span>
      `;
    }
  }

  refresh() {
    if (ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  destroy() {
    this.stopAutoScrub();
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
  }
}

// Export to window
window.ScrollAnimationCoordinator = ScrollAnimationCoordinator;
