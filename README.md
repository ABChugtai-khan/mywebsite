# CODE. CREATE. EXPERIENCE. — FULL-SCREEN 3D SCROLL ANIMATION WEBSITE

A premium, futuristic, fully responsive developer website featuring a **cinematic FULL-SCREEN BACKGROUND FRAME ANIMATION** using your existing 240 images (`ezgif-frame-001.jpg` to `ezgif-frame-240.jpg`).

As visitors scroll down using the mouse wheel, the full-screen background animates smoothly from Frame 001 to Frame 240, and reverses smoothly when scrolling upward. All website content, navigation, and HUD overlays sit cleanly above the background with high contrast and readable typography.

---

## 1. Quick Start Guide (Windows)

### Option A: Built-in Zero-Dependency Dev Server (Recommended)
No external npm installations required! Run:

```powershell
node server.js
```
Then open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

### Option B: Using npm
```powershell
npm start
```
or
```powershell
npm run dev
```

---

## 2. Full-Screen Architecture & Visual Stack

The website uses a layered visual architecture to ensure maximum visual impact while keeping all text legible:

1. **Layer 0 (Fixed Full-Screen Viewport `100vw × 100vh`, `z-index: 0`)**:
   - `#animation-canvas`: 2D Canvas covering the entire screen using symmetric `cover` scaling (16:9 aspect ratio preserved without stretching).
   - `#three-canvas`: Three.js WebGL canvas adding subtle 3D floating particles, cyan & blue lighting, and mouse parallax depth.
   - `.bg-vignette-overlay`: Dark transparent cinematic vignette (`rgba(4, 7, 17, 0.4)` to `0.8`) ensuring white text and headings pop with high contrast while keeping the video clear.
   - `.bg-scanline-overlay`: Subtle cyber scanlines.
2. **Layer 1 (Foreground Content, `z-index: 10`)**:
   - `#hero`: Introduction with bold headline, cyber badge, telemetry pills, and scroll indicator.
   - `#story`: 4 Story Milestone cards tracking the developer's journey across the 240 frames.
   - `#process`: Development Process (Write the Code, Run the Project, Experience the Result).
   - `#tech`: Technology Matrix (HTML5, CSS3, JavaScript ES6+, Three.js, GSAP 3, ScrollTrigger, Canvas 2D, Web Audio API).
   - `#projects`: Featured Projects with 3D tilt and code snippets.
   - `#contact`: Interactive Developer CLI Terminal + Contact Form.
   - `footer`: Telemetry status, sitemap, and back-to-top button.
3. **Layer 2 (Persistent Floating HUD, `z-index: 500`)**:
   - Pinned at the bottom of the screen.
   - Displays live telemetry: `FRAME: 084 / 240`, `ACT II // THE ALGORITHM`, scrub progress %, and an interactive scrubber bar that lets visitors scrub or jump to any phase.
4. **Layer 3 (Navigation Bar, `z-index: 1000`)**:
   - Fixed glassmorphic navbar with logo, status beacon, navigation links, sound toggle, and mobile menu.

---

## 3. Frame Animation & Scroll Synchronization

- **Images**: All 240 sequential frames (`images/ezgif-frame-001.jpg` through `images/ezgif-frame-240.jpg`).
- **Normalized Scroll**:
  $$\text{frameIndex} = \min(239, \max(0, \lfloor \text{progress} \times 239 \rfloor))$$
- **Reverse Scrubbing**: Natural, lag-free reverse playback when scrolling upward.
- **Hold at Finish**: Holds at Frame 240 when reaching the bottom (does not loop or reset).
- **Auto-Scrub Mode**: Built-in `[ AUTO SCRUB ]` button in the floating HUD allows one-click automated playback.

---

## 4. File Organization

```
website/
├── index.html                  # Semantic HTML5 with full-screen background & content
├── server.js                   # Zero-dependency local Node.js static server
├── package.json                # Project config & scripts
├── README.md                   # Project documentation
│
├── css/
│   ├── styles.css              # Full-screen canvas styling, glassmorphism, HUD, terminal
│   └── responsive.css          # Responsive design for desktop, tablet, and mobile
│
├── js/
│   ├── main.js                 # App orchestrator & sequential initialization
│   ├── preload.js              # 240-frame concurrent preloader with progress tracking (0%–100%)
│   ├── animation.js            # Full-screen 2D canvas cover-fit rendering engine
│   ├── scroll.js               # GSAP ScrollTrigger page-wide scrub & reverse coordinator
│   ├── three-scene.js          # Three.js 3D spatial particles & directional lighting
│   └── effects.js              # Custom cursor, 3D card tilt, synthesized audio, CLI terminal
│
├── images/
│   ├── ezgif-frame-001.jpg     # 240 existing frame assets
│   └── ...
│
└── assets/
    └── favicon.png             # Cyber neon icon
```

---

## 5. Performance & Device Compatibility

- **Device Pixel Ratio (DPR)**: Clamped to $\le 2.0$ to prevent GPU strain on 4K/Retina displays.
- **Image Smoothing**: High-quality interpolation configured for crisp display.
- **Accessibility**: Honors `prefers-reduced-motion` settings.
- **Touch & Mobile**: Responsive layout with touch scrolling and adaptive HUD.
