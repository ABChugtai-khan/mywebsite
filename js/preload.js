/**
 * CODE. CREATE. EXPERIENCE. — FRAME PRELOAD SYSTEM
 * Discovers filenames, preloads all 240 frames with memory & concurrency control,
 * tracks loading percentage, and handles missing or corrupted frames gracefully.
 */

class FramePreloader {
  constructor(options = {}) {
    this.totalFrames = options.totalFrames || 240;
    this.basePath = options.basePath || 'images/';
    this.filePrefix = options.filePrefix || 'ezgif-frame-';
    this.extension = options.extension || '.jpg';
    this.concurrency = options.concurrency || 10;
    
    this.frames = new Array(this.totalFrames).fill(null);
    this.loadedCount = 0;
    this.failedCount = 0;
    this.isCompleted = false;
    
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Generates formatted file path for a 1-based frame index
   * e.g., index 1 -> "images/ezgif-frame-001.jpg"
   */
  getFrameUrl(frameIndex1Based) {
    const padIndex = String(frameIndex1Based).padStart(3, '0');
    return `${this.basePath}${this.filePrefix}${padIndex}${this.extension}`;
  }

  /**
   * Begins preloading with concurrency control
   */
  start() {
    console.log(`[Preloader] Initializing sequence for ${this.totalFrames} frames...`);
    
    // Priority: Preload frame 1 immediately for instant first paint
    this.preloadSingleFrame(1).then(() => {
      this.batchLoadRemaining();
    });
  }

  /**
   * Preload a single frame by 1-based index
   */
  preloadSingleFrame(frameNumber) {
    return new Promise((resolve) => {
      const arrayIndex = frameNumber - 1;
      if (this.frames[arrayIndex]) {
        resolve(this.frames[arrayIndex]);
        return;
      }

      const img = new Image();
      const url = this.getFrameUrl(frameNumber);

      img.onload = () => {
        this.frames[arrayIndex] = img;
        this.loadedCount++;
        this.updateProgress(url);
        resolve(img);
      };

      img.onerror = (err) => {
        console.warn(`[Preloader] Warning: Failed to load ${url}. Applying fallback.`, err);
        this.failedCount++;
        
        // Graceful fallback: If an image fails, borrow from previous frame or create canvas placeholder
        const fallbackImg = new Image();
        if (arrayIndex > 0 && this.frames[arrayIndex - 1]) {
          this.frames[arrayIndex] = this.frames[arrayIndex - 1];
        } else {
          this.frames[arrayIndex] = this.createFallbackPlaceholder(frameNumber);
        }
        
        this.loadedCount++;
        this.updateProgress(url);
        resolve(this.frames[arrayIndex]);
      };

      img.src = url;
    });
  }

  /**
   * Batch loads remaining frames in parallel chunks
   */
  async batchLoadRemaining() {
    const queue = [];
    for (let i = 2; i <= this.totalFrames; i++) {
      queue.push(i);
    }

    const workers = Array(this.concurrency).fill(null).map(async () => {
      while (queue.length > 0) {
        const frameNum = queue.shift();
        if (frameNum !== undefined) {
          await this.preloadSingleFrame(frameNum);
        }
      }
    });

    await Promise.all(workers);
    this.isCompleted = true;
    console.log(`[Preloader] All ${this.totalFrames} frames cached successfully. (Errors: ${this.failedCount})`);
    this.onComplete(this.frames);
  }

  /**
   * Updates loading progress
   */
  updateProgress(currentUrl) {
    const percent = Math.min(100, Math.round((this.loadedCount / this.totalFrames) * 100));
    this.onProgress({
      percent,
      loaded: this.loadedCount,
      total: this.totalFrames,
      currentUrl
    });
  }

  /**
   * Generates a sleek cyber placeholder canvas if a frame is missing
   */
  createFallbackPlaceholder(frameNumber) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#060b18';
    ctx.fillRect(0, 0, 1280, 720);
    
    // Cyber frame
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1200, 640);
    
    // Text
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 36px "Space Grotesk", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`FRAME ${String(frameNumber).padStart(3, '0')} // INTERPOLATED`, 640, 360);
    
    const fallbackImage = new Image();
    fallbackImage.src = canvas.toDataURL();
    return fallbackImage;
  }

  /**
   * Safely returns a frame by 0-based index
   */
  getFrame(zeroBasedIndex) {
    const clampedIndex = Math.max(0, Math.min(this.totalFrames - 1, zeroBasedIndex));
    return this.frames[clampedIndex] || this.frames[0];
  }
}

// Export to window
window.FramePreloader = FramePreloader;
