/**
 * @fileoverview EcoLens application module: background-3d.js
 * Follows strict Google JavaScript Style Guide.
 */
/**
 * Three.js Interactive Green Globe Background
 * Renders a glowing, wireframe-style earth that follows the cursor.
 */

export function init3DBackground() {
  const container = document.getElementById('bg-canvas');
  if (!container) return;
  if (!window.THREE) {
    console.warn('Three.js not loaded');
    return;
  }

  // We'll replace the canvas with a div for Three.js to mount into
  // Actually, since index.html has <canvas id="bg-canvas">, we can pass it to the renderer
  const canvas = container;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060b18); // Match var(--color-bg)

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 250;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create Globe
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. Solid core sphere (dark)
  const coreGeometry = new THREE.SphereGeometry(80, 64, 64);
  const coreMaterial = new THREE.MeshPhongMaterial({
    color: 0x030610,
    emissive: 0x061220,
    transparent: true,
    opacity: 0.9,
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  globeGroup.add(coreMesh);

  // 2. Wireframe / points sphere
  const wireGeometry = new THREE.SphereGeometry(82, 32, 32);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x10b981, // Emerald green
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
  globeGroup.add(wireMesh);

  // 3. Particles representing cities/nodes
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 800;
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    // Generate random points on sphere surface
    const phi = Math.acos(-1 + (2 * i) / 3 / particlesCount);
    const theta = Math.sqrt(particlesCount * Math.PI) * phi;

    const r = 83 + Math.random() * 2; // slightly above surface
    posArray[i] = r * Math.cos(theta) * Math.sin(phi);
    posArray[i + 1] = r * Math.sin(theta) * Math.sin(phi);
    posArray[i + 2] = r * Math.cos(phi);
  }

  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(posArray, 3)
  );
  const particlesMaterial = new THREE.PointsMaterial({
    size: 1.5,
    color: 0x06b6d4, // Cyan highlights
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  globeGroup.add(particleMesh);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x10b981, 1.5);
  pointLight.position.set(100, 100, 100);
  scene.add(pointLight);

  // Positioning
  globeGroup.position.x = window.innerWidth > 768 ? 80 : 0; // Shift right on desktop
  globeGroup.position.y = -20;

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    globeGroup.position.x = window.innerWidth > 768 ? 80 : 0;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Constant slow rotation
    globeGroup.rotation.y = elapsedTime * 0.05;

    // Wireframe rotates slightly differently
    wireMesh.rotation.y = elapsedTime * -0.02;
    wireMesh.rotation.x = elapsedTime * 0.01;

    // Smooth mouse follow (Parallax)
    targetX = mouseX * 0.0005;
    targetY = mouseY * 0.0005;

    globeGroup.rotation.x += 0.05 * (targetY - globeGroup.rotation.x);
    globeGroup.position.z += 0.05 * (targetX * -50 - globeGroup.position.z);

    renderer.render(scene, camera);
  }

  animate();
}
