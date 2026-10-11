/**
 * CODE. CREATE. EXPERIENCE. — THREE.JS 3D SCENE & AMBIENT DEPTH SYSTEM
 * Creates an interactive 3D WebGL cyber universe with camera parallax, 
 * glowing cyan & blue lights, floating cyber particle field, and geometry grid.
 */

class ThreeSceneManager {
  constructor(canvasContainerId = 'three-canvas') {
    this.canvasId = canvasContainerId;
    this.canvas = document.getElementById(this.canvasId);
    this.isSupported = this.checkWebGLSupport();

    if (!this.isSupported) {
      console.warn('[ThreeScene] WebGL not supported on this device. Fallback mode active.');
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.gridPlane = null;
    this.ringsGroup = null;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.scrollProgress = 0;
    this.rafId = null;

    this.init();
  }

  checkWebGLSupport() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  init() {
    if (!this.canvas) {
      console.warn(`[ThreeScene] Target canvas #${this.canvasId} not found.`);
      return;
    }

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040711, 0.0018);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
    this.camera.position.set(0, 0, 400);

    // 3. Renderer with DPR clamp
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 4. Futuristic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a1428, 1.2);
    this.scene.add(ambientLight);

    // Cyan Directional Light
    const cyanLight = new THREE.DirectionalLight(0x00f2fe, 1.5);
    cyanLight.position.set(200, 300, 200);
    this.scene.add(cyanLight);

    // Royal Blue Point Light
    const bluePoint = new THREE.PointLight(0x0066ff, 2.0, 800);
    bluePoint.position.set(-200, -100, 250);
    this.scene.add(bluePoint);

    // Indigo Ambient Accent
    const indigoPoint = new THREE.PointLight(0x7928ca, 1.8, 600);
    indigoPoint.position.set(0, 200, -150);
    this.scene.add(indigoPoint);

    // 5. Build 3D Elements
    this.createParticleUniverse();
    this.createCyberWireframeGrid();
    this.createHolographicRings();

    // 6. Listeners
    window.addEventListener('resize', this.onResizeBound = () => this.handleResize());
    window.addEventListener('mousemove', this.onMouseMoveBound = (e) => this.handleMouseMove(e));

    // 7. Start Render Loop
    this.startLoop();
  }

  /**
   * Creates glowing floating 3D particle constellation
   */
  createParticleUniverse() {
    // 1200 lightweight particles
    const particleCount = window.innerWidth < 768 ? 400 : 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00f2fe);
    const blueColor = new THREE.Color(0x3b82f6);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 1600;
      positions[idx + 1] = (Math.random() - 0.5) * 1200;
      positions[idx + 2] = (Math.random() - 0.5) * 1200;

      // Color variation
      const rand = Math.random();
      const chosenColor = rand > 0.6 ? cyanColor : (rand > 0.3 ? blueColor : whiteColor);
      colors[idx] = chosenColor.r;
      colors[idx + 1] = chosenColor.g;
      colors[idx + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Soft glowing point material
    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  /**
   * Creates subtle 3D floor wireframe cyber grid
   */
  createCyberWireframeGrid() {
    const size = 1800;
    const divisions = 36;
    const grid = new THREE.GridHelper(size, divisions, 0x00f2fe, 0x0c1e3d);
    grid.position.y = -350;
    grid.position.z = -100;
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    grid.material.blending = THREE.AdditiveBlending;
    this.gridPlane = grid;
    this.scene.add(grid);
  }

  /**
   * Creates futuristic floating holographic rings in 3D space
   */
  createHolographicRings() {
    this.ringsGroup = new THREE.Group();

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x0066ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });

    const ringGeo1 = new THREE.TorusGeometry(320, 1.2, 8, 48);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.5;

    const ringGeo2 = new THREE.TorusGeometry(420, 1.2, 8, 48);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;

    this.ringsGroup.add(ring1);
    this.ringsGroup.add(ring2);
    this.ringsGroup.position.set(0, 0, -200);

    this.scene.add(this.ringsGroup);
  }

  handleMouseMove(event) {
    this.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 60;
    this.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 60;
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  handleResize() {
    if (!this.camera || !this.renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  startLoop() {
    const clock = new THREE.Clock();

    const render = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

      // Camera parallax
      this.camera.position.x = this.mouseX;
      this.camera.position.y = -this.mouseY;
      this.camera.lookAt(0, 0, 0);

      // Particle subtle ambient motion + scroll reaction
      if (this.particles) {
        this.particles.rotation.y = elapsed * 0.04 + this.scrollProgress * 1.5;
        this.particles.rotation.x = elapsed * 0.02 + this.scrollProgress * 0.5;
      }

      // Grid undulating motion
      if (this.gridPlane) {
        this.gridPlane.position.z = -100 + (elapsed * 30) % 50;
      }

      // Holographic rings rotation
      if (this.ringsGroup) {
        this.ringsGroup.rotation.z = elapsed * 0.08;
        this.ringsGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.2;
      }

      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(render);
    };

    this.rafId = requestAnimationFrame(render);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('resize', this.onResizeBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Export to window
window.ThreeSceneManager = ThreeSceneManager;
