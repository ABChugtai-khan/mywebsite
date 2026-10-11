/**
 * CODE. CREATE. EXPERIENCE. — FULL-SCREEN 2D CANVAS FRAME ANIMATION ENGINE
 * Renders all 240 frames to a full-screen viewport canvas (100vw x 100vh)
 * with symmetric cover-fit geometry, DPR clamp (≤ 2), 60 FPS requestAnimationFrame,
 * and zero-distortion aspect ratio preservation.
 */

class FrameAnimationEngine {
  constructor(canvasElement, preloaderInstance) {
    if (!canvasElement) {
      throw new Error('[AnimationEngine] Canvas element not provided.');
    }

    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.preloader = preloaderInstance;

    this.currentFrameIndex = 0;
    this.targetFrameIndex = 0;
    this.lastRenderedFrame = -1;
    this.rafId = null;

    // Source frame aspect ratio (1280 x 720 = 16:9)
    this.nativeWidth = 1280;
    this.nativeHeight = 720;
    this.nativeRatio = this.nativeWidth / this.nativeHeight;

    this.dpr = 1;
    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', this.onResizeBound = () => this.handleResize());
    
    // Draw initial frame 001 immediately if loaded
    const firstImg = this.preloader.getFrame(0);
    if (firstImg && firstImg.complete) {
      this.drawFrame(firstImg);
      this.lastRenderedFrame = 0;
    }

    this.startRenderLoop();
  }

  /**
   * Resizes canvas to fill physical screen pixels, clamped at DPR 2 for GPU efficiency
   */
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Force redraw on resize
    this.lastRenderedFrame = -1;
    this.requestFrame(this.currentFrameIndex);
  }

  /**
   * Updates target frame from scroll progress (0 to 239)
   */
  requestFrame(frameIndex) {
    this.targetFrameIndex = Math.max(0, Math.min(this.preloader.totalFrames - 1, Math.round(frameIndex)));
  }

  /**
   * 60 FPS render loop using requestAnimationFrame
   */
  startRenderLoop() {
    const loop = () => {
      if (this.currentFrameIndex !== this.targetFrameIndex || this.lastRenderedFrame !== this.targetFrameIndex) {
        this.currentFrameIndex = this.targetFrameIndex;
        const img = this.preloader.getFrame(this.currentFrameIndex);

        if (img && img.complete) {
          this.drawFrame(img);
          this.lastRenderedFrame = this.currentFrameIndex;
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * Draws frame filling 100vw x 100vh with symmetric cover geometry (unskewed, centered)
   */
  drawFrame(img) {
    if (!img) return;

    const screenW = this.canvas.width;
    const screenH = this.canvas.height;
    const screenRatio = screenW / screenH;

    let drawW, drawH, drawX, drawY;

    if (screenRatio > this.nativeRatio) {
      // Screen is wider than 16:9 -> fit width, crop height top and bottom symmetrically
      drawW = screenW;
      drawH = screenW / this.nativeRatio;
      drawX = 0;
      drawY = (screenH - drawH) / 2;
    } else {
      // Screen is taller than 16:9 -> fit height, crop width left and right symmetrically
      drawH = screenH;
      drawW = screenH * this.nativeRatio;
      drawX = (screenW - drawW) / 2;
      drawY = 0;
    }

    // Clear background with dark void
    this.ctx.fillStyle = '#040711';
    this.ctx.fillRect(0, 0, screenW, screenH);

    // Blit image
    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  getCurrentFrameIndex() {
    return this.currentFrameIndex;
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('resize', this.onResizeBound);
  }
}

// Export to window
window.FrameAnimationEngine = FrameAnimationEngine;
