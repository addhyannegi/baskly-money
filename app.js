/**
 * BASKLY.MONEY — UNSEEN STUDIO® INSPIRED INTERACTIVE ENGINE
 * Features:
 * 1. Three.js Interactive 3D Iridescent Pearl & Glass Sculpture (Mouse + Scroll reactive)
 * 2. Cinematic Preloader Curtain with 000-100% Counter
 * 3. Custom Lerped Fluid Cursor + Contextual Morphing Label ("INSPECT ↗", "DRAG ↔")
 * 4. Magnetic Buttons & Links with Spring Physics
 * 5. 3D Perspective Card Tilt + Specular Glare Tracking
 * 6. Live HTML5 Canvas Bezier Spline Compounding Chart + Basket Inspector & Risk Quiz
 */

// ============================================================================
// 1. CURATED BASKETS DATA STORE
// ============================================================================
const basketsData = [
  {
    id: "top-5-index",
    indexNum: "01",
    name: "Top-5 Bluechip Index",
    serifWord: "Bluechip",
    tagline: "The five largest digital assets, market-cap weighted & rebalanced monthly.",
    description: "The foundational index of institutional crypto. Captures 82% of total market capitalization across Bitcoin, Ethereum, Solana, BNB, and XRP. Engineered for multi-cycle compounding.",
    risk: "Balanced Core",
    riskColor: "#0F6E56",
    fee_pct: 1.25,
    min_sip: 1000,
    expected_cagr: 28.5,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "BTC", name: "Bitcoin", weight: 55, color: "#D97706", price_inr: 7739249 },
      { symbol: "ETH", name: "Ethereum", weight: 20, color: "#4F46E5", price_inr: 228879 },
      { symbol: "SOL", name: "Solana", weight: 10, color: "#0D9488", price_inr: 9800 },
      { symbol: "BNB", name: "BNB", weight: 8, color: "#CA8A04", price_inr: 68535 },
      { symbol: "XRP", name: "XRP", weight: 7, color: "#1E293B", price_inr: 123 }
    ]
  },
  {
    id: "crypto-gold",
    indexNum: "02",
    name: "Crypto + Gold Reserve",
    serifWord: "Reserve",
    tagline: "Digital gold meets LBMA physical gold. Dampened volatility for calm stackers.",
    description: "Pairs 50% tokenised physical gold (PAX Gold) with Bitcoin and Ethereum. Designed specifically for Indian households seeking hard-asset inflation protection with muted drawdowns.",
    risk: "Conservative",
    riskColor: "#9A7B56",
    fee_pct: 0.95,
    min_sip: 1000,
    expected_cagr: 18.2,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "PAXG", name: "PAX Gold (1oz LBMA)", weight: 50, color: "#B4833E", price_inr: 396642 },
      { symbol: "BTC", name: "Bitcoin", weight: 35, color: "#D97706", price_inr: 7739249 },
      { symbol: "ETH", name: "Ethereum", weight: 15, color: "#4F46E5", price_inr: 228879 }
    ]
  },
  {
    id: "bitcoin",
    indexNum: "03",
    name: "Pure Bitcoin Sovereign",
    serifWord: "Sovereign",
    tagline: "100% Bitcoin. The purest way to accumulate satoshis every month in Rupees.",
    description: "Undiluted exposure to the world's premier scarce digital monetary asset. Built for long-horizon believers executing a disciplined Rupee-Cost Averaging mandate.",
    risk: "High Conviction",
    riskColor: "#B45309",
    fee_pct: 0.75,
    min_sip: 1000,
    expected_cagr: 32.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "BTC", name: "Bitcoin", weight: 100, color: "#D97706", price_inr: 7739249 }
    ]
  },
  {
    id: "ethereum",
    indexNum: "04",
    name: "Ethereum Settlement Layer",
    serifWord: "Settlement",
    tagline: "100% Ether — the programmable backbone of global tokenised finance.",
    description: "Direct ownership of Ethereum, powering stablecoins, institutional RWA tokenisation, and decentralised financial rails.",
    risk: "High Conviction",
    riskColor: "#4338CA",
    fee_pct: 0.85,
    min_sip: 1000,
    expected_cagr: 29.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "ETH", name: "Ethereum", weight: 100, color: "#4F46E5", price_inr: 228879 }
    ]
  },
  {
    id: "defi",
    indexNum: "05",
    name: "DeFi Protocol Architects",
    serifWord: "Architects",
    tagline: "Own the cash-flowing protocols replacing traditional financial middleware.",
    description: "Research-weighted allocation into dominant on-chain liquidity, lending, and oracle infrastructure: Uniswap, Aave, Chainlink, Pendle, and Lido.",
    risk: "Aggressive Growth",
    riskColor: "#9D174D",
    fee_pct: 1.50,
    min_sip: 1000,
    expected_cagr: 38.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "UNI", name: "Uniswap", weight: 25, color: "#DB2777", price_inr: 690 },
      { symbol: "AAVE", name: "Aave Protocol", weight: 25, color: "#7C3AED", price_inr: 14793 },
      { symbol: "LINK", name: "Chainlink Oracles", weight: 25, color: "#2563EB", price_inr: 1166 },
      { symbol: "PENDLE", name: "Pendle Finance", weight: 15, color: "#0891B2", price_inr: 198 },
      { symbol: "LDO", name: "Lido DAO", weight: 10, color: "#0284C7", price_inr: 38 }
    ]
  },
  {
    id: "altcoin-meme",
    indexNum: "06",
    name: "High-Beta Cultural Index",
    serifWord: "Cultural",
    tagline: "Equal-weighted Asymmetric frontier. Strictly for <5% satellite allocation.",
    description: "Systematic momentum exposure to high-liquidity community tokens. Monthly rebalancing automatically harvests spikes and prevents single-token wipeouts.",
    risk: "Asymmetric",
    riskColor: "#B85D43",
    fee_pct: 1.75,
    min_sip: 1000,
    expected_cagr: 45.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "DOGE", name: "Dogecoin", weight: 20, color: "#A16207", price_inr: 7.6 },
      { symbol: "SHIB", name: "Shiba Inu", weight: 20, color: "#EA580C", price_inr: 0.00048 },
      { symbol: "PEPE", name: "Pepe", weight: 20, color: "#15803D", price_inr: 0.00038 },
      { symbol: "BONK", name: "Bonk", weight: 20, color: "#C2410C", price_inr: 0.00029 },
      { symbol: "WIF", name: "dogwifhat", weight: 20, color: "#78716C", price_inr: 18.87 }
    ]
  }
];

function formatINR(val) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(Math.round(val));
}

// ============================================================================
// 2. CINEMATIC PRELOADER CURTAIN
// ============================================================================
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const countEl = document.getElementById('preloader-count');
  const barEl = document.getElementById('preloader-bar');
  if (!preloader) return;

  let progress = 0;
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    progress = Math.floor(eased * 100);

    if (countEl) countEl.textContent = String(progress).padStart(3, '0');
    if (barEl) barEl.style.width = `${progress}%`;

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        preloader.classList.add('loaded');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 1150);
        triggerHeroEntrance();
      }, 100);
    }
  }

  requestAnimationFrame(tick);
}

function triggerHeroEntrance() {
  const reveals = document.querySelectorAll('.hero-reveal');
  reveals.forEach((el, idx) => {
    setTimeout(() => {
      el.classList.add('is-visible');
    }, idx * 90);
  });
}

// ============================================================================
// 3. THREE.JS IRIDESCENT PEARL & LIQUID GLASS 3D SCULPTURE (r128 SAFE)
// ============================================================================
let webglPaused = false;

function initWebGLScene() {
  try {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const sculptureGroup = new THREE.Group();
    scene.add(sculptureGroup);

    // Studio Multi-Tone Lighting (Pearl, Champagne Gold, Rose & Emerald Rim)
    const ambientLight = new THREE.AmbientLight(0xF4EFEA, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xFFFDF9, 2.2);
    dirLight1.position.set(6, 8, 6);
    scene.add(dirLight1);

    const warmGoldLight = new THREE.PointLight(0xD4A373, 3.2, 25);
    warmGoldLight.position.set(-5, 3, 5);
    scene.add(warmGoldLight);

    const roseRimLight = new THREE.PointLight(0xE29578, 2.5, 22);
    roseRimLight.position.set(5, -4, 4);
    scene.add(roseRimLight);

    const sageLight = new THREE.PointLight(0x52B788, 2.0, 22);
    sageLight.position.set(0, 5, -4);
    scene.add(sageLight);

    // Three.js r128 compatible Physical Materials
    const pearlMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xF7F3EE,
      roughness: 0.14,
      metalness: 0.12,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06
    });

    const bronzeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xC8A986,
      roughness: 0.22,
      metalness: 0.72,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xEFE9E1,
      roughness: 0.1,
      metalness: 0.05,
      transparent: true,
      opacity: 0.78,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    // 1. Central Sculptural Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.44, 160, 32, 2, 3);
    const centralSculpture = new THREE.Mesh(knotGeo, pearlMaterial);
    centralSculpture.position.set(3.1, 0.2, -1.2);
    sculptureGroup.add(centralSculpture);

    // 2. Orbiting Metallic Bronze Ring
    const ringGeo = new THREE.TorusGeometry(2.6, 0.032, 24, 120);
    const orbitalRing = new THREE.Mesh(ringGeo, bronzeMaterial);
    orbitalRing.position.set(3.1, 0.2, -1.2);
    orbitalRing.rotation.x = Math.PI * 0.35;
    orbitalRing.rotation.y = Math.PI * 0.15;
    sculptureGroup.add(orbitalRing);

    // 3. Second Outer Delicate Ring
    const ringGeo2 = new THREE.TorusGeometry(3.1, 0.018, 20, 120);
    const orbitalRing2 = new THREE.Mesh(ringGeo2, glassMaterial);
    orbitalRing2.position.set(3.1, 0.2, -1.2);
    orbitalRing2.rotation.x = -Math.PI * 0.28;
    sculptureGroup.add(orbitalRing2);

    // 4. Floating Pearl & Bronze Orbs
    const orbs = [];
    const orbConfigs = [
      { r: 0.62, x: -4.2, y: 1.8, z: -0.5, mat: pearlMaterial, speed: 0.8 },
      { r: 0.40, x: -2.8, y: -2.1, z: 0.8, mat: bronzeMaterial, speed: 1.1 },
      { r: 0.82, x: -5.4, y: -0.6, z: -2.2, mat: glassMaterial, speed: 0.6 },
      { r: 0.30, x: 1.1, y: 2.5, z: 0.5, mat: bronzeMaterial, speed: 1.3 },
      { r: 0.50, x: 5.2, y: -2.2, z: -1.0, mat: pearlMaterial, speed: 0.9 }
    ];

    const sphereGeo = new THREE.SphereGeometry(1, 48, 48);
    orbConfigs.forEach((cfg, i) => {
      const mesh = new THREE.Mesh(sphereGeo, cfg.mat);
      mesh.scale.setScalar(cfg.r);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      sculptureGroup.add(mesh);
      orbs.push({ mesh, baseX: cfg.x, baseY: cfg.y, baseZ: cfg.z, speed: cfg.speed, offset: i * 1.7 });
    });

    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;
    let scrollY = window.scrollY || 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY || 0;
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (webglPaused) return;

      const elapsedTime = clock.getElapsedTime();

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      centralSculpture.rotation.x = elapsedTime * 0.2 + currentMouseY * 0.35;
      centralSculpture.rotation.y = elapsedTime * 0.26 + currentMouseX * 0.45;

      orbitalRing.rotation.z = -elapsedTime * 0.18;
      orbitalRing.rotation.x = Math.PI * 0.35 + currentMouseY * 0.25;

      orbitalRing2.rotation.z = elapsedTime * 0.12;
      orbitalRing2.rotation.y = currentMouseX * 0.3;

      orbs.forEach(o => {
        o.mesh.position.y = o.baseY + Math.sin(elapsedTime * o.speed + o.offset) * 0.42;
        o.mesh.position.x = o.baseX + Math.cos(elapsedTime * (o.speed * 0.7) + o.offset) * 0.25;
      });

      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
      sculptureGroup.rotation.y = currentMouseX * 0.22 + scrollProgress * Math.PI * 0.85;
      sculptureGroup.rotation.x = -currentMouseY * 0.15;
      sculptureGroup.position.y = Math.sin(scrollProgress * Math.PI) * 0.8;

      warmGoldLight.position.x = -5 + currentMouseX * 3.5;
      warmGoldLight.position.y = 3 + currentMouseY * 3.5;

      renderer.render(scene, camera);
    }

    animate();
  } catch (err) {
    console.warn("WebGL scene fallback:", err);
  }
}

function toggleAmbientMotion() {
  webglPaused = !webglPaused;
  const waveEl = document.getElementById('ambient-wave');
  const labelEl = document.getElementById('ambient-label');
  if (waveEl) waveEl.classList.toggle('paused', webglPaused);
  if (labelEl) labelEl.textContent = webglPaused ? '3D Paused' : '3D Live';
}

// ============================================================================
// 4. CUSTOM FLUID CURSOR & MAGNETIC ELEMENTS
// ============================================================================
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const label = document.getElementById('cursor-label');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  bindCursorHoverTargets();
}

function bindCursorHoverTargets() {
  const label = document.getElementById('cursor-label');
  document.querySelectorAll('[data-cursor-label]').forEach(el => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = '1';
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover-card');
      if (label) label.textContent = el.getAttribute('data-cursor-label');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover-card');
    });
  });

  document.querySelectorAll('a, button, summary').forEach(el => {
    if (el.hasAttribute('data-cursor-label') || el.dataset.cursorBound) return;
    el.dataset.cursorBound = '1';
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover-link'));
  });
}

function initMagneticElements() {
  const magnets = document.querySelectorAll('[data-magnetic]');
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

// ============================================================================
// 5. 3D PERSPECTIVE TILT CARDS & SPECULAR GLARE
// ============================================================================
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = '1';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4.0;
      const rotateY = ((x - centerX) / centerX) * 4.0;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

// ============================================================================
// 6. RENDER CURATED BASKETS GRID (LINKED WITH LIVE ORACLE & NAV)
// ============================================================================
// ============================================================================
// 6. HISTORICAL NAV & PERFORMANCE DATA ENGINE FOR ALL 6 FUNDS
// ============================================================================
const BASKET_HISTORICAL_DATA = {
  "top-5-index": {
    baseNav: 40.0,
    color: "#0F6E56",
    high52: "₹74.80",
    low52: "₹42.10",
    maxDd: "-21.4%",
    sharpe: "1.92",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 40.00 }, { date: "Nov 23", nav: 42.80 }, { date: "Dec 23", nav: 46.10 },
      { date: "Jan 24", nav: 44.50 }, { date: "Feb 24", nav: 51.20 }, { date: "Mar 24", nav: 58.40 },
      { date: "Apr 24", nav: 54.10 }, { date: "May 24", nav: 56.80 }, { date: "Jun 24", nav: 53.20 },
      { date: "Jul 24", nav: 57.50 }, { date: "Aug 24", nav: 52.80 }, { date: "Sep 24", nav: 55.40 },
      { date: "Oct 24", nav: 61.20 }, { date: "Nov 24", nav: 68.50 }, { date: "Dec 24", nav: 72.40 },
      { date: "Jan 25", nav: 69.10 }, { date: "Feb 25", nav: 66.80 }, { date: "Mar 25", nav: 64.50 },
      { date: "Apr 25", nav: 62.10 }, { date: "May 25", nav: 65.40 }, { date: "Jun 25", nav: 61.80 },
      { date: "Jul 25", nav: 63.90 }, { date: "Aug 25", nav: 60.50 }, { date: "Sep 25", nav: 62.40 },
      { date: "Oct 25", nav: 65.80 }, { date: "Nov 25", nav: 67.20 }, { date: "Dec 25", nav: 66.10 },
      { date: "Jan 26", nav: 64.80 }, { date: "Feb 26", nav: 62.90 }, { date: "Mar 26", nav: 63.09 }
    ]
  },
  "crypto-gold": {
    baseNav: 58.0,
    color: "#9A7B56",
    high52: "₹86.20",
    low52: "₹68.40",
    maxDd: "-9.8%",
    sharpe: "2.41",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 58.00 }, { date: "Nov 23", nav: 59.40 }, { date: "Dec 23", nav: 61.20 },
      { date: "Jan 24", nav: 60.80 }, { date: "Feb 24", nav: 63.50 }, { date: "Mar 24", nav: 66.80 },
      { date: "Apr 24", nav: 66.10 }, { date: "May 24", nav: 67.40 }, { date: "Jun 24", nav: 66.50 },
      { date: "Jul 24", nav: 69.20 }, { date: "Aug 24", nav: 68.80 }, { date: "Sep 24", nav: 70.40 },
      { date: "Oct 24", nav: 73.10 }, { date: "Nov 24", nav: 76.50 }, { date: "Dec 24", nav: 79.20 },
      { date: "Jan 25", nav: 78.40 }, { date: "Feb 25", nav: 79.80 }, { date: "Mar 25", nav: 80.50 },
      { date: "Apr 25", nav: 81.20 }, { date: "May 25", nav: 82.80 }, { date: "Jun 25", nav: 82.10 },
      { date: "Jul 25", nav: 83.40 }, { date: "Aug 25", nav: 82.90 }, { date: "Sep 25", nav: 84.10 },
      { date: "Oct 25", nav: 85.50 }, { date: "Nov 25", nav: 86.10 }, { date: "Dec 25", nav: 85.00 },
      { date: "Jan 26", nav: 84.20 }, { date: "Feb 26", nav: 83.10 }, { date: "Mar 26", nav: 83.58 }
    ]
  },
  "bitcoin": {
    baseNav: 32.0,
    color: "#B45309",
    high52: "₹82.50",
    low52: "₹34.80",
    maxDd: "-23.5%",
    sharpe: "1.88",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 32.00 }, { date: "Nov 23", nav: 35.80 }, { date: "Dec 23", nav: 41.20 },
      { date: "Jan 24", nav: 39.80 }, { date: "Feb 24", nav: 48.50 }, { date: "Mar 24", nav: 58.90 },
      { date: "Apr 24", nav: 53.40 }, { date: "May 24", nav: 57.80 }, { date: "Jun 24", nav: 52.10 },
      { date: "Jul 24", nav: 56.40 }, { date: "Aug 24", nav: 50.80 }, { date: "Sep 24", nav: 54.20 },
      { date: "Oct 24", nav: 62.50 }, { date: "Nov 24", nav: 74.80 }, { date: "Dec 24", nav: 82.10 },
      { date: "Jan 25", nav: 79.50 }, { date: "Feb 25", nav: 76.20 }, { date: "Mar 25", nav: 72.80 },
      { date: "Apr 25", nav: 68.40 }, { date: "May 25", nav: 73.10 }, { date: "Jun 25", nav: 67.50 },
      { date: "Jul 25", nav: 71.20 }, { date: "Aug 25", nav: 66.80 }, { date: "Sep 25", nav: 69.40 },
      { date: "Oct 25", nav: 73.50 }, { date: "Nov 25", nav: 75.20 }, { date: "Dec 25", nav: 73.80 },
      { date: "Jan 26", nav: 72.10 }, { date: "Feb 26", nav: 69.80 }, { date: "Mar 26", nav: 70.66 }
    ]
  },
  "ethereum": {
    baseNav: 35.0,
    color: "#4338CA",
    high52: "₹69.40",
    low52: "₹36.50",
    maxDd: "-28.2%",
    sharpe: "1.74",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 35.00 }, { date: "Nov 23", nav: 38.20 }, { date: "Dec 23", nav: 42.50 },
      { date: "Jan 24", nav: 41.00 }, { date: "Feb 24", nav: 49.20 }, { date: "Mar 24", nav: 59.80 },
      { date: "Apr 24", nav: 52.40 }, { date: "May 24", nav: 58.10 }, { date: "Jun 24", nav: 54.80 },
      { date: "Jul 24", nav: 56.20 }, { date: "Aug 24", nav: 48.50 }, { date: "Sep 24", nav: 50.10 },
      { date: "Oct 24", nav: 54.50 }, { date: "Nov 24", nav: 62.40 }, { date: "Dec 24", nav: 68.20 },
      { date: "Jan 25", nav: 64.10 }, { date: "Feb 25", nav: 61.80 }, { date: "Mar 25", nav: 58.50 },
      { date: "Apr 25", nav: 55.20 }, { date: "May 25", nav: 59.40 }, { date: "Jun 25", nav: 54.10 },
      { date: "Jul 25", nav: 57.50 }, { date: "Aug 25", nav: 53.20 }, { date: "Sep 25", nav: 55.80 },
      { date: "Oct 25", nav: 59.20 }, { date: "Nov 25", nav: 61.10 }, { date: "Dec 25", nav: 59.80 },
      { date: "Jan 26", nav: 58.40 }, { date: "Feb 26", nav: 55.90 }, { date: "Mar 26", nav: 56.74 }
    ]
  },
  "defi": {
    baseNav: 42.0,
    color: "#9D174D",
    high52: "₹76.50",
    low52: "₹39.10",
    maxDd: "-32.5%",
    sharpe: "1.65",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 42.00 }, { date: "Nov 23", nav: 45.10 }, { date: "Dec 23", nav: 49.80 },
      { date: "Jan 24", nav: 47.20 }, { date: "Feb 24", nav: 56.40 }, { date: "Mar 24", nav: 66.20 },
      { date: "Apr 24", nav: 58.50 }, { date: "May 24", nav: 62.80 }, { date: "Jun 24", nav: 57.40 },
      { date: "Jul 24", nav: 60.10 }, { date: "Aug 24", nav: 52.80 }, { date: "Sep 24", nav: 56.20 },
      { date: "Oct 24", nav: 63.40 }, { date: "Nov 24", nav: 71.80 }, { date: "Dec 24", nav: 75.40 },
      { date: "Jan 25", nav: 72.10 }, { date: "Feb 25", nav: 69.50 }, { date: "Mar 25", nav: 66.20 },
      { date: "Apr 25", nav: 63.80 }, { date: "May 25", nav: 68.20 }, { date: "Jun 25", nav: 62.50 },
      { date: "Jul 25", nav: 66.80 }, { date: "Aug 25", nav: 61.40 }, { date: "Sep 25", nav: 64.90 },
      { date: "Oct 25", nav: 69.20 }, { date: "Nov 25", nav: 72.10 }, { date: "Dec 25", nav: 70.50 },
      { date: "Jan 26", nav: 69.10 }, { date: "Feb 26", nav: 67.20 }, { date: "Mar 26", nav: 68.06 }
    ]
  },
  "altcoin-meme": {
    baseNav: 20.0,
    color: "#B85D43",
    high52: "₹48.90",
    low52: "₹18.40",
    maxDd: "-48.5%",
    sharpe: "1.42",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 20.00 }, { date: "Nov 23", nav: 22.50 }, { date: "Dec 23", nav: 26.80 },
      { date: "Jan 24", nav: 24.10 }, { date: "Feb 24", nav: 31.50 }, { date: "Mar 24", nav: 44.20 },
      { date: "Apr 24", nav: 36.80 }, { date: "May 24", nav: 41.50 }, { date: "Jun 24", nav: 33.20 },
      { date: "Jul 24", nav: 37.80 }, { date: "Aug 24", nav: 29.50 }, { date: "Sep 24", nav: 32.10 },
      { date: "Oct 24", nav: 39.40 }, { date: "Nov 24", nav: 47.80 }, { date: "Dec 24", nav: 46.20 },
      { date: "Jan 25", nav: 42.50 }, { date: "Feb 25", nav: 39.80 }, { date: "Mar 25", nav: 36.40 },
      { date: "Apr 25", nav: 33.10 }, { date: "May 25", nav: 38.50 }, { date: "Jun 25", nav: 32.40 },
      { date: "Jul 25", nav: 36.10 }, { date: "Aug 25", nav: 31.80 }, { date: "Sep 25", nav: 34.50 },
      { date: "Oct 25", nav: 38.20 }, { date: "Nov 25", nav: 40.10 }, { date: "Dec 25", nav: 38.40 },
      { date: "Jan 26", nav: 37.50 }, { date: "Feb 26", nav: 35.80 }, { date: "Mar 26", nav: 36.90 }
    ]
  }
};

// Render Baskets in 6-Grid with Embedded Performance Sparkline Charts
function renderBaskets() {
  const container = document.getElementById('baskets-grid');
  if (!container) return;

  container.innerHTML = basketsData.map((basket) => {
    const bars = basket.assets.map(a =>
      `<div style="width: ${a.weight}%; background-color: ${a.color};" class="h-1.5 transition-all duration-500" title="${a.name}: ${a.weight}%"></div>`
    ).join('');

    const topAssets = basket.assets.slice(0, 3).map(a =>
      `<span class="inline-flex items-center text-[11px] font-medium text-[#121110]/80 bg-[#F4EFEA]/90 border border-[#121110]/10 rounded-full px-2.5 py-0.5">
        <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: ${a.color}"></span>
        <span>${a.symbol} ${a.weight}%</span>
        <span class="ml-1 text-[10px] text-[#5C5752] font-mono" data-token-symbol="${a.symbol}">₹${formatINR(a.price_inr)}</span>
      </span>`
    ).join(' ');

    const isPos = basket.change_24h >= 0;
    const changeSign = isPos ? '+' : '';

    return `
      <div 
        class="tilt-card p-7 flex flex-col justify-between cursor-pointer group reveal-up" 
        data-cursor-label="INSPECT ↗"
        onclick="openBasketModal('${basket.id}')">
        
        <div class="tilt-card-content">
          <div class="flex items-center justify-between mb-4">
            <span class="font-mono text-xs text-[#8C857B]">/${basket.indexNum}</span>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide uppercase" style="background-color: ${basket.riskColor}14; color: ${basket.riskColor};">
                ${basket.risk}
              </span>
              <span id="basket-change-${basket.id}" class="font-mono text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${isPos ? 'text-emerald-800 bg-emerald-950/5' : 'text-rose-800 bg-rose-950/5'}">
                ${changeSign}${basket.change_24h}%
              </span>
            </div>
          </div>

          <h3 class="text-2xl font-semibold text-[#121110] tracking-editorial mb-1 group-hover:text-[#9A7B56] transition-colors">
            ${basket.name.replace(basket.serifWord, `<span class="font-serif-italic font-normal text-3xl">${basket.serifWord}</span>`)}
          </h3>

          <!-- Live Unit NAV Display linked to Oracle -->
          <div class="flex items-center gap-2 mb-3 font-mono text-xs">
            <span class="text-[#8C857B] text-[10px] uppercase tracking-wider">Live NAV:</span>
            <span id="basket-nav-${basket.id}" class="font-bold text-[#121110] px-1.5 py-0.5 rounded transition-colors">₹${basket.nav.toFixed(2)}</span>
            <span class="text-[10px] text-[#0F6E56] font-sans flex items-center gap-1">
              <span class="oracle-pulse-live" style="width: 5px; height: 5px;"></span> Ticking
            </span>
          </div>

          <p class="text-sm text-[#5C5752] leading-relaxed mb-4">
            ${basket.tagline}
          </p>

          <!-- Fund Performance Sparkline Chart on Card (Embedded Native Vector Curve) -->
          <div class="my-3 p-3 rounded-2xl bg-[#121110]/[0.02] border border-[#121110]/6">
            <div class="flex items-center justify-between text-[10px] font-mono mb-1.5">
              <span class="text-[#8C857B] uppercase tracking-wider">NAV Trajectory</span>
              <span class="text-[#0F6E56] font-semibold font-mono">${basket.expected_cagr}% CAGR ↗</span>
            </div>
            <div id="card-chart-wrap-${basket.id}" class="w-full h-14 relative flex items-center justify-center">
              ${generateCardSparklineSVG(basket.id, basket.nav)}
            </div>
          </div>

          <!-- Allocation Visual Bar -->
          <div class="space-y-3 mb-6">
            <div class="w-full flex rounded-full overflow-hidden bg-[#121110]/5 p-[1px]">
              ${bars}
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${topAssets}
              ${basket.assets.length > 3 ? `<span class="text-[11px] text-[#8C857B] self-center pl-1">+${basket.assets.length - 3} more</span>` : ''}
            </div>
          </div>
        </div>

        <div class="tilt-card-content pt-5 border-t border-[#121110]/10 flex items-center justify-between mt-2">
          <div>
            <div class="text-[10px] uppercase tracking-widest text-[#8C857B] font-semibold">Monthly Mandate</div>
            <div class="text-base font-bold text-[#121110] font-mono">₹${formatINR(basket.min_sip)}<span class="text-xs font-normal text-[#8C857B]">/mo</span></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-[10px] uppercase tracking-widest text-[#8C857B] font-semibold">Model CAGR</div>
              <div class="text-sm font-bold text-[#0F6E56] font-mono">${basket.expected_cagr}%</div>
            </div>
            <span class="w-9 h-9 rounded-full border border-[#121110]/15 flex items-center justify-center group-hover:bg-[#121110] group-hover:text-[#F4EFEA] transition-all duration-300">
              ↗
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initTiltCards();
  bindCursorHoverTargets();
}

// Generate Native Vector SVG Sparkline for Instant High-Res Visuals
function generateCardSparklineSVG(basketId, liveNav) {
  const hist = BASKET_HISTORICAL_DATA[basketId];
  if (!hist || !hist.monthlySeries) return '';

  const data = hist.monthlySeries.slice(-14);
  const vals = data.map(d => d.nav);
  if (liveNav) vals[vals.length - 1] = liveNav;

  const minVal = Math.min(...vals) * 0.98;
  const maxVal = Math.max(...vals) * 1.02;
  const range = (maxVal - minVal) || 1;

  const w = 300;
  const h = 56;
  const padX = 6;
  const padY = 6;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  const pts = vals.map((v, i) => {
    const x = padX + (i / (vals.length - 1)) * plotW;
    const y = padY + plotH - ((v - minVal) / range) * plotH;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = ((prev.x + curr.x) / 2).toFixed(1);
    const midY = ((prev.y + curr.y) / 2).toFixed(1);
    pathD += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }
  const last = pts[pts.length - 1];
  pathD += ` T ${last.x} ${last.y}`;

  const areaD = `${pathD} L ${last.x} ${h} L ${pts[0].x} ${h} Z`;
  const gradId = `card-grad-${basketId.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${hist.color}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="${hist.color}" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#${gradId})" />
      <path d="${pathD}" fill="none" stroke="${hist.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="${last.x}" cy="${last.y}" r="6" fill="${hist.color}" opacity="0.25" class="animate-ping" />
      <circle cx="${last.x}" cy="${last.y}" r="3.5" fill="${hist.color}" stroke="#FAF8F5" stroke-width="1.5" />
    </svg>
  `;
}

// Draw Sparkline on individual card
function drawCardSparkline(basketId) {
  const canvas = document.getElementById(`card-chart-${basketId}`);
  const hist = BASKET_HISTORICAL_DATA[basketId];
  if (!canvas || !hist) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 280;
  const h = rect.height || 56;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // Take the last 12 months for card 1Y sparkline
  const data = hist.monthlySeries.slice(-12);
  const vals = data.map(d => d.nav);
  // Replace last item with live basket NAV
  const currentBasket = basketsData.find(b => b.id === basketId);
  if (currentBasket) vals[vals.length - 1] = currentBasket.nav;

  const minVal = Math.min(...vals) * 0.98;
  const maxVal = Math.max(...vals) * 1.02;
  const padX = 6;
  const padY = 8;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  const pts = vals.map((v, idx) => ({
    x: padX + (idx / (vals.length - 1)) * plotW,
    y: padY + plotH - ((v - minVal) / (maxVal - minVal)) * plotH
  }));

  // Area Gradient
  const grad = ctx.createLinearGradient(0, padY, 0, h);
  grad.addColorStop(0, `${hist.color}28`);
  grad.addColorStop(1, `${hist.color}00`);

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.lineTo(pts[pts.length - 1].x, h);
  ctx.lineTo(pts[0].x, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.strokeStyle = hist.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // End Point Circle
  const last = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = hist.color;
  ctx.fill();
  ctx.strokeStyle = "#FAF8F5";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawAllCardSparklines() {
  basketsData.forEach(b => drawCardSparkline(b.id));
}

// ============================================================================
// 7. BASKET INSPECTOR PRO MODAL & INTERACTIVE CHART ENGINE
// ============================================================================
let currentlyInspectedBasketId = null;
let currentModalTimeframe = "1D";

// Generate Instant Vector SVG for Modal Performance Chart from Base 100.00
function generateModalChartSVG(basketId, tf, liveNav) {
  const basket = basketsData.find(b => b.id === basketId);
  const color = basket ? basket.riskColor : "#0F6E56";

  // Generate series starting from ₹100.00 base
  let series = [];
  if (tf === '1D') {
    series = [
      { date: '09:00', nav: 100.00 }, { date: '10:30', nav: 100.15 }, { date: '12:00', nav: 99.85 },
      { date: '13:30', nav: 100.40 }, { date: '15:00', nav: 100.22 }, { date: 'Now', nav: liveNav || 100.00 }
    ];
  } else if (tf === '1W') {
    series = [
      { date: 'Mon', nav: 100.00 }, { date: 'Tue', nav: 100.80 }, { date: 'Wed', nav: 99.40 },
      { date: 'Thu', nav: 101.20 }, { date: 'Fri', nav: 100.90 }, { date: 'Today', nav: liveNav || 100.00 }
    ];
  } else if (tf === '1M') {
    series = [
      { date: 'Wk 1', nav: 100.00 }, { date: 'Wk 2', nav: 101.50 }, { date: 'Wk 3', nav: 103.20 },
      { date: 'Wk 4', nav: 102.80 }, { date: 'Now', nav: liveNav || 100.00 }
    ];
  } else if (tf === '1Y') {
    series = [
      { date: 'Nov 25', nav: 100.00 }, { date: 'Jan 26', nav: 104.20 }, { date: 'Mar 26', nav: 109.80 },
      { date: 'May 26', nav: 114.50 }, { date: 'Jul 26', nav: 120.10 }, { date: 'Oct 26', nav: liveNav || 100.00 }
    ];
  } else {
    // 5Y
    series = [
      { date: '2021', nav: 100.00 }, { date: '2022', nav: 124.00 }, { date: '2023', nav: 158.00 },
      { date: '2024', nav: 194.00 }, { date: '2025', nav: 248.00 }, { date: '2026', nav: liveNav || 100.00 }
    ];
  }

  const vals = series.map(d => d.nav);
  if (liveNav) vals[vals.length - 1] = liveNav;

  const minVal = Math.min(...vals) * 0.98;
  const maxVal = Math.max(...vals) * 1.02;
  const range = (maxVal - minVal) || 1;

  const w = 600;
  const h = 224;
  const padX = 24;
  const padY = 20;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  const pts = vals.map((v, i) => {
    const x = padX + (i / (vals.length - 1)) * plotW;
    const y = padY + plotH - ((v - minVal) / range) * plotH;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = ((prev.x + curr.x) / 2).toFixed(1);
    const midY = ((prev.y + curr.y) / 2).toFixed(1);
    pathD += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }
  const last = pts[pts.length - 1];
  pathD += ` T ${last.x} ${last.y}`;

  const areaD = `${pathD} L ${last.x} ${h - padY} L ${pts[0].x} ${h - padY} Z`;
  const gradId = `modal-grad-${basketId.replace(/[^a-zA-Z0-9]/g, '-')}`;

  let gridMarkup = '';
  for (let r = 1; r <= 3; r++) {
    const gy = (padY + (plotH / 4) * r).toFixed(1);
    const valAt = (maxVal - (range / 4) * r).toFixed(1);
    gridMarkup += `
      <line x1="${padX}" y1="${gy}" x2="${w - padX}" y2="${gy}" stroke="#121110" stroke-opacity="0.06" stroke-dasharray="3 3"/>
      <text x="${padX}" y="${gy - 4}" fill="#8C857B" font-size="9" font-family="JetBrains Mono, monospace">₹${valAt}</text>
    `;
  }

  return `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.25" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
      </linearGradient>
    </defs>
    ${gridMarkup}
    <path d="${areaD}" fill="url(#${gradId})" />
    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="${last.x}" cy="${last.y}" r="8" fill="${color}" opacity="0.25" class="animate-ping" />
    <circle cx="${last.x}" cy="${last.y}" r="4.5" fill="${color}" stroke="#FAF8F5" stroke-width="2" />
  `;
}

function openBasketModal(id) {
  const basket = basketsData.find(b => b.id === id);
  if (!basket) return;
  currentlyInspectedBasketId = id;

  document.getElementById('modal-basket-name').innerHTML = basket.name.replace(
    basket.serifWord,
    `<span class="font-serif-italic font-normal text-3xl">${basket.serifWord}</span>`
  );
  document.getElementById('modal-basket-tagline').textContent = basket.tagline;
  document.getElementById('modal-basket-desc').textContent = basket.description;
  document.getElementById('modal-basket-nav').textContent = `₹${basket.nav.toFixed(2)}`;
  document.getElementById('modal-basket-fee').textContent = `${basket.fee_pct}% p.a.`;
  document.getElementById('modal-basket-min').textContent = `₹${formatINR(basket.min_sip)}/mo`;
  document.getElementById('modal-basket-cagr').textContent = `${basket.expected_cagr}%`;

  // Update statistics (Anchored at ₹100.00 Base)
  document.getElementById('modal-stat-52h').textContent = "₹" + (basket.nav * 1.08).toFixed(2);
  document.getElementById('modal-stat-52l').textContent = "₹" + (basket.nav * 0.96).toFixed(2);
  document.getElementById('modal-stat-dd').textContent = "-3.4%";
  document.getElementById('modal-stat-sharpe').textContent = "2.14";

  renderModalAssetBreakdown(basket);

  // Instantly paint SVG fallback chart
  const svgFallback = document.getElementById('modal-fund-svg-fallback');
  if (svgFallback) {
    svgFallback.innerHTML = generateModalChartSVG(id, currentModalTimeframe, basket.nav);
  }

  const modal = document.getElementById('basket-detail-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Let browser layout complete reflow, then draw interactive pro chart
  requestAnimationFrame(() => {
    setTimeout(() => {
      setModalChartTimeframe(currentModalTimeframe);
      attachModalChartScrubbing();
      initModalChartResizeObserver();
    }, 40);
  });
}

function initModalChartResizeObserver() {
  if (window._modalResizeObserverBound) return;
  const container = document.getElementById('modal-chart-container');
  if (container && window.ResizeObserver) {
    window._modalResizeObserverBound = true;
    const ro = new ResizeObserver(() => {
      if (currentlyInspectedBasketId) {
        drawModalProChart(currentlyInspectedBasketId, currentModalTimeframe);
      }
    });
    ro.observe(container);
  }
}

function setModalChartTimeframe(tf) {
  currentModalTimeframe = tf;
  const timeframes = ['1D', '1W', '1M', '1Y', '5Y'];
  timeframes.forEach(t => {
    const btn = document.getElementById(`tf-${t}`);
    if (btn) {
      if (t === tf) {
        btn.className = "px-2.5 py-1 rounded-full bg-[#121110] text-[#F4EFEA] font-bold shadow-xs";
      } else {
        btn.className = "px-2.5 py-1 rounded-full text-[#5C5752] hover:text-[#121110] transition";
      }
    }
  });

  const basket = basketsData.find(b => b.id === currentlyInspectedBasketId);
  const svgFallback = document.getElementById('modal-fund-svg-fallback');
  if (svgFallback && basket) {
    svgFallback.innerHTML = generateModalChartSVG(currentlyInspectedBasketId, tf, basket.nav);
  }

  drawModalProChart(currentlyInspectedBasketId, tf);
}

async function drawModalProChart(basketId, tf) {
  if (!basketId) return;
  const basket = basketsData.find(b => b.id === basketId);
  const canvas = document.getElementById('modal-fund-chart');
  if (!canvas || !basket) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const container = document.getElementById('modal-chart-container');
  const rect = container ? container.getBoundingClientRect() : canvas.getBoundingClientRect();
  const w = Math.round(rect.width > 50 ? rect.width : (canvas.parentElement ? canvas.parentElement.clientWidth : 0)) || 620;
  const h = Math.round(rect.height > 50 ? rect.height : 224);

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // Retrieve time-series directly from database engine
  let series = [];
  if (window.BasklyDB && window.BasklyDB.getHistoricalNAVSeries) {
    series = await BasklyDB.getHistoricalNAVSeries(basketId, tf);
  } else {
    series = [
      { date: '09:00', nav: 100.00 }, { date: '11:00', nav: 100.10 }, { date: '13:00', nav: 99.95 },
      { date: 'Now', nav: basket.nav }
    ];
  }

  const vals = series.map(d => d.nav);
  vals[vals.length - 1] = basket.nav;

  const startNav = vals[0] || 100.00;
  const endNav = vals[vals.length - 1] || basket.nav;
  const totalReturn = (((endNav - startNav) / startNav) * 100).toFixed(2);

  // Update header readout
  const navHoverEl = document.getElementById('chart-hover-nav');
  const retHoverEl = document.getElementById('chart-hover-return');
  if (navHoverEl) navHoverEl.textContent = `₹${endNav.toFixed(2)}`;
  if (retHoverEl) {
    retHoverEl.textContent = `${totalReturn >= 0 ? '+' : ''}${totalReturn}% (${tf})`;
    retHoverEl.className = `text-[11px] ${totalReturn >= 0 ? 'text-[#0F6E56] bg-[#0F6E56]/10' : 'text-rose-700 bg-rose-100'} px-1.5 py-0.5 rounded ml-1`;
  }

  const minVal = Math.min(...vals) * 0.95;
  const maxVal = Math.max(...vals) * 1.05;
  const padX = 24;
  const padY = 20;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  // Grid lines
  ctx.strokeStyle = 'rgba(18, 17, 16, 0.06)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  for (let r = 1; r <= 3; r++) {
    const y = padY + (plotH / 4) * r;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(w - padX, y);
    ctx.stroke();

    const priceLabel = maxVal - ((maxVal - minVal) / 4) * r;
    ctx.fillStyle = 'rgba(140, 133, 123, 0.65)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`₹${priceLabel.toFixed(1)}`, padX, y - 4);
  }
  ctx.setLineDash([]);

  const pts = vals.map((v, idx) => ({
    x: padX + (idx / (vals.length - 1)) * plotW,
    y: padY + plotH - ((v - minVal) / (maxVal - minVal)) * plotH,
    nav: v,
    date: series[idx]?.date || ""
  }));

  // Store pts on canvas for mousemove scrubbing
  canvas._cachedPts = pts;
  canvas._startNav = startNav;

  // Fill gradient
  const grad = ctx.createLinearGradient(0, padY, 0, h - padY);
  grad.addColorStop(0, `${hist.color}25`);
  grad.addColorStop(1, `${hist.color}00`);

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.lineTo(pts[pts.length - 1].x, h - padY);
  ctx.lineTo(pts[0].x, h - padY);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.strokeStyle = hist.color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // End Point with double ring
  const last = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = hist.color;
  ctx.fill();
  ctx.strokeStyle = "#FAF8F5";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function attachModalChartScrubbing() {
  const canvas = document.getElementById('modal-fund-chart');
  const tooltip = document.getElementById('chart-tooltip-badge');
  const navHoverEl = document.getElementById('chart-hover-nav');
  const retHoverEl = document.getElementById('chart-hover-return');
  if (!canvas || canvas._scrubAttached) return;
  canvas._scrubAttached = true;

  canvas.addEventListener('mousemove', (e) => {
    const pts = canvas._cachedPts;
    if (!pts || pts.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find nearest point
    let nearest = pts[0];
    let minDist = 9999;
    pts.forEach(p => {
      const d = Math.abs(p.x - mouseX);
      if (d < minDist) {
        minDist = d;
        nearest = p;
      }
    });

    const startNav = canvas._startNav || pts[0].nav;
    const ret = (((nearest.nav - startNav) / startNav) * 100).toFixed(1);

    if (navHoverEl) navHoverEl.textContent = `₹${nearest.nav.toFixed(2)}`;
    if (retHoverEl) {
      retHoverEl.textContent = `${ret >= 0 ? '+' : ''}${ret}% (${nearest.date})`;
    }

    if (tooltip) {
      tooltip.style.left = `${nearest.x}px`;
      tooltip.style.top = `${nearest.y - 10}px`;
      tooltip.textContent = `${nearest.date}: ₹${nearest.nav.toFixed(2)} (${ret >= 0 ? '+' : ''}${ret}%)`;
      tooltip.classList.remove('hidden');
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.classList.add('hidden');
    const basket = basketsData.find(b => b.id === currentlyInspectedBasketId);
    if (basket && navHoverEl) {
      navHoverEl.textContent = `₹${basket.nav.toFixed(2)}`;
    }
  });
}

function renderModalAssetBreakdown(basket) {
  const assetListEl = document.getElementById('modal-asset-breakdown');
  if (!assetListEl) return;

  assetListEl.innerHTML = basket.assets.map(asset => `
    <div class="flex items-center justify-between py-3 border-b border-[#121110]/10 last:border-0">
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 rounded-full" style="background-color: ${asset.color}"></div>
        <div>
          <div class="text-sm font-semibold text-[#121110]">${asset.name} <span class="text-xs font-mono text-[#8C857B]">(${asset.symbol})</span></div>
          <div class="text-xs text-[#5C5752] font-mono">
            Spot Price: <span id="modal-spot-${asset.symbol}" class="font-bold text-[#121110] px-1 rounded transition-colors">₹${formatINR(asset.price_inr)}</span>
            <span class="text-[10px] text-[#0F6E56]">● Live Feed</span>
          </div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm font-bold text-[#121110] font-mono">${asset.weight}%</div>
        <div class="text-[10px] uppercase tracking-wider text-[#8C857B]">Target Weight</div>
      </div>
    </div>
  `).join('');
}

function closeBasketModal() {
  currentlyInspectedBasketId = null;
  const modal = document.getElementById('basket-detail-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// ============================================================================
// 8. SIP COMPOUNDING ENGINE + INTERACTIVE SPLINE CHART CANVAS
// ============================================================================
function calculateSIP() {
  const amountInput = document.getElementById('sip-amount-range');
  const yearsInput = document.getElementById('sip-years-range');
  const cagrInput = document.getElementById('sip-cagr-range');
  if (!amountInput || !yearsInput || !cagrInput) return;

  const amount = parseFloat(amountInput.value);
  const years = parseFloat(yearsInput.value);
  const cagr = parseFloat(cagrInput.value) / 100;

  document.getElementById('sip-amount-label').textContent = `₹${formatINR(amount)}`;
  document.getElementById('sip-years-label').textContent = `${years} ${years > 1 ? 'Years' : 'Year'}`;
  document.getElementById('sip-cagr-label').textContent = `${(cagr * 100).toFixed(0)}% p.a.`;

  const months = years * 12;
  const i = cagr / 12;
  const futureValueCrypto = amount * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  const totalInvested = amount * months;
  const returnsEarned = Math.max(0, futureValueCrypto - totalInvested);

  const iNifty = 0.125 / 12;
  const futureValueNifty = amount * ((Math.pow(1 + iNifty, months) - 1) / iNifty) * (1 + iNifty);

  const iFD = 0.07 / 12;
  const futureValueFD = amount * ((Math.pow(1 + iFD, months) - 1) / iFD) * (1 + iFD);

  document.getElementById('calc-total-invested').textContent = `₹${formatINR(totalInvested)}`;
  document.getElementById('calc-returns-earned').textContent = `+₹${formatINR(returnsEarned)}`;
  document.getElementById('calc-future-value').textContent = `₹${formatINR(futureValueCrypto)}`;

  document.getElementById('comp-baskly-val').textContent = `₹${formatINR(futureValueCrypto)}`;
  document.getElementById('comp-nifty-val').textContent = `₹${formatINR(futureValueNifty)}`;
  document.getElementById('comp-fd-val').textContent = `₹${formatINR(futureValueFD)}`;

  drawCompoundingChart(amount, years, cagr);
}

function drawCompoundingChart(monthlyAmount, totalYears, cagr) {
  const canvas = document.getElementById('sip-spline-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 560;
  const height = rect.height || 224;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const w = width;
  const h = height;
  ctx.clearRect(0, 0, w, h);

  const steps = Math.max(12, totalYears * 4);
  const basklyPoints = [];
  const niftyPoints = [];
  const principalPoints = [];

  let maxVal = 1;
  for (let s = 0; s <= steps; s++) {
    const m = (s / steps) * (totalYears * 12);
    const iCrypto = cagr / 12;
    const iNifty = 0.125 / 12;

    const valCrypto = m === 0 ? 0 : monthlyAmount * ((Math.pow(1 + iCrypto, m) - 1) / iCrypto) * (1 + iCrypto);
    const valNifty = m === 0 ? 0 : monthlyAmount * ((Math.pow(1 + iNifty, m) - 1) / iNifty) * (1 + iNifty);
    const valPrincipal = monthlyAmount * m;

    if (valCrypto > maxVal) maxVal = valCrypto;
    basklyPoints.push(valCrypto);
    niftyPoints.push(valNifty);
    principalPoints.push(valPrincipal);
  }

  const padX = 14;
  const padY = 18;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  function toCoords(arr) {
    return arr.map((v, idx) => ({
      x: padX + (idx / steps) * plotW,
      y: padY + plotH - (v / maxVal) * plotH
    }));
  }

  const cBaskly = toCoords(basklyPoints);
  const cNifty = toCoords(niftyPoints);
  const cPrincipal = toCoords(principalPoints);

  ctx.strokeStyle = 'rgba(18, 17, 16, 0.06)';
  ctx.lineWidth = 1;
  for (let r = 1; r <= 3; r++) {
    const y = padY + (plotH / 4) * r;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(w - padX, y);
    ctx.stroke();
  }

  function drawCurve(pts, strokeColor, lineWidth, fillGradient, dashed = false) {
    ctx.save();
    if (dashed) ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);

    if (fillGradient) {
      ctx.lineTo(last.x, h - padY);
      ctx.lineTo(pts[0].x, h - padY);
      ctx.closePath();
      ctx.fillStyle = fillGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
      ctx.lineTo(last.x, last.y);
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  drawCurve(cPrincipal, 'rgba(140, 133, 123, 0.45)', 1.5, null, true);
  drawCurve(cNifty, 'rgba(154, 123, 86, 0.75)', 2, null, false);

  const grad = ctx.createLinearGradient(0, padY, 0, h - padY);
  grad.addColorStop(0, 'rgba(15, 110, 86, 0.24)');
  grad.addColorStop(1, 'rgba(15, 110, 86, 0.0)');
  drawCurve(cBaskly, '#0F6E56', 3, grad, false);

  const endPt = cBaskly[cBaskly.length - 1];
  ctx.beginPath();
  ctx.arc(endPt.x, endPt.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#0F6E56';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FAF8F5';
  ctx.stroke();
}

function setSIPAmount(val) {
  document.getElementById('sip-amount-range').value = val;
  calculateSIP();
}

function setSIPYears(val) {
  document.getElementById('sip-years-range').value = val;
  calculateSIP();
}

// ============================================================================
// 9. INTERACTIVE RISK PROFILER QUIZ
// ============================================================================
const quizQuestions = [
  {
    q: "What is your primary objective with digital asset accumulation?",
    options: [
      { text: "Preserve purchasing power with physical gold & Bitcoin ballast", score: 1 },
      { text: "Disciplined wealth compounding across the top 5 market leaders", score: 2 },
      { text: "Maximum multi-cycle alpha across Bitcoin, Ethereum & DeFi rails", score: 3 }
    ]
  },
  {
    q: "How do you react if the market experiences a 25% drawdown in a month?",
    options: [
      { text: "I prefer cushioned volatility anchored by 50% LBMA Gold", score: 1 },
      { text: "Unbothered — my monthly SIP automatically buys more units at lower NAV", score: 2 },
      { text: "I view drawdowns as generational accumulation windows", score: 3 }
    ]
  },
  {
    q: "What is your intended compounding horizon?",
    options: [
      { text: "1 to 2 Years", score: 1 },
      { text: "3 to 5 Years", score: 2 },
      { text: "5 to 10+ Years", score: 3 }
    ]
  }
];

let quizAnswers = [2, 2, 2];

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  container.innerHTML = quizQuestions.map((q, qIdx) => `
    <div class="mb-7 last:mb-0">
      <div class="font-mono text-[11px] uppercase tracking-widest text-[#8C857B] mb-2">Step 0${qIdx + 1} / 03</div>
      <h4 class="text-lg font-semibold text-[#121110] tracking-editorial mb-3.5">${q.q}</h4>
      <div class="grid gap-2.5">
        ${q.options.map((opt, optIdx) => {
          const active = quizAnswers[qIdx] === opt.score;
          return `
            <button 
              type="button" 
              onclick="selectQuizAnswer(${qIdx}, ${optIdx})" 
              class="text-left p-4 rounded-2xl border text-sm transition-all duration-300 flex items-center justify-between ${active ? 'border-[#121110] bg-[#121110] text-[#F4EFEA] font-medium shadow-md' : 'border-[#121110]/10 bg-[#FAF8F5]/80 text-[#121110]/80 hover:border-[#121110]/35'}">
              <span class="pr-4">${opt.text}</span>
              <span class="w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] ${active ? 'border-[#F4EFEA] text-[#F4EFEA]' : 'border-[#121110]/20 text-transparent'}">✓</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  updateQuizResult();
}

function selectQuizAnswer(qIdx, optIdx) {
  quizAnswers[qIdx] = quizQuestions[qIdx].options[optIdx].score;
  renderQuiz();
}

function updateQuizResult() {
  const totalScore = quizAnswers.reduce((a, b) => a + b, 0);

  let profile = {
    title: "Balanced Index Collector",
    serifWord: "Collector",
    badge: "Balanced Core",
    badgeColor: "#0F6E56",
    desc: "You understand market cycles and want institutional exposure to blue-chip digital assets without emotional day-trading.",
    recommendedBasket: "Top-5 Bluechip Index + Pure Bitcoin",
    suggestedSplit: "70% Top-5 Index · 30% Pure Bitcoin"
  };

  if (totalScore <= 4) {
    profile = {
      title: "Prudent Gold-Backed Stacker",
      serifWord: "Prudent",
      badge: "Capital Preservation",
      badgeColor: "#9A7B56",
      desc: "You value serenity over speed. Blending 50% physical LBMA gold with Bitcoin & Ether cushions drawdowns while beating fiat inflation.",
      recommendedBasket: "Crypto + Gold Reserve",
      suggestedSplit: "75% Crypto + Gold · 25% Top-5 Index"
    };
  } else if (totalScore >= 7) {
    profile = {
      title: "Sovereign Alpha Architect",
      serifWord: "Sovereign",
      badge: "High Conviction",
      badgeColor: "#9D174D",
      desc: "You have a multi-year horizon and the temperament to harness volatility across monetary networks and DeFi protocols.",
      recommendedBasket: "Top-5 Index + DeFi Architects",
      suggestedSplit: "60% Top-5 Index · 25% Pure BTC · 15% DeFi"
    };
  }

  const badgeEl = document.getElementById('quiz-profile-badge');
  if (badgeEl) {
    badgeEl.textContent = profile.badge;
    badgeEl.style.backgroundColor = `${profile.badgeColor}18`;
    badgeEl.style.color = profile.badgeColor;
  }
  const titleEl = document.getElementById('quiz-profile-title');
  if (titleEl) {
    titleEl.innerHTML = profile.title.replace(
      profile.serifWord,
      `<span class="font-serif-italic font-normal text-3xl">${profile.serifWord}</span>`
    );
  }
  document.getElementById('quiz-profile-desc').textContent = profile.desc;
  document.getElementById('quiz-profile-basket').textContent = profile.recommendedBasket;
  document.getElementById('quiz-profile-split').textContent = profile.suggestedSplit;
}

// ============================================================================
// 10. UPI AUTOPAY SIMULATOR DRAWER
// ============================================================================
function openUPIDrawer() {
  const drawer = document.getElementById('upi-simulation-drawer');
  drawer.classList.remove('hidden');
  drawer.classList.add('flex');
}

function closeUPIDrawer() {
  const drawer = document.getElementById('upi-simulation-drawer');
  drawer.classList.add('hidden');
  drawer.classList.remove('flex');
}

function submitUPISimulation(e) {
  e.preventDefault();
  const upiId = document.getElementById('sim-upi-input')?.value || 'investor@okhdfcbank';
  const amount = parseFloat(document.getElementById('sim-amount-select')?.value || '5000');
  const date = document.getElementById('sim-date-select')?.value || '5th';
  const basketSelect = document.getElementById('sim-basket-select');
  const basketId = basketSelect ? basketSelect.value : 'top-5-index';
  const basketOpt = basketSelect ? basketSelect.options[basketSelect.selectedIndex] : null;
  const basketName = basketOpt ? basketOpt.text.replace(/^\d+\s*\/\s*/, '').replace(/\s*\(.*?\)/, '').trim() : 'Top-5 Bluechip Index';

  // Persist directly into BasklyDB
  if (window.BasklyDB) {
    const liveBasket = basketsData.find(b => b.id === basketId);
    const nav = liveBasket ? liveBasket.nav : 63.09;

    // 1. Execute initial mandate deposit
    BasklyDB.buyBasket(basketId, basketName, amount, nav, 'UPI_MANDATE');

    // 2. Add or update mandate in database
    const existingMandate = BasklyDB.data.retailPortfolio.mandates.find(m => m.basketId === basketId);
    if (existingMandate) {
      existingMandate.monthlyAmountINR = amount;
      existingMandate.status = 'ACTIVE';
      existingMandate.vpa = upiId;
    } else {
      BasklyDB.data.retailPortfolio.mandates.push({
        id: 'mandate_' + Date.now().toString(36),
        basketId,
        basketName,
        monthlyAmountINR: amount,
        debitDay: parseInt(date) || 5,
        status: 'ACTIVE',
        vpa: upiId,
        nextDebitDate: '2026-11-05'
      });
    }
    BasklyDB.save();
  }

  const stepContainer = document.getElementById('upi-step-content');
  stepContainer.innerHTML = `
    <div class="text-center py-6 space-y-4">
      <div class="w-14 h-14 bg-[#0F6E56]/10 text-[#0F6E56] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
        ✓
      </div>
      <h3 class="text-2xl font-semibold text-[#121110] tracking-editorial">
        e-Mandate <span class="font-serif-italic font-normal text-3xl">Authorized</span>
      </h3>
      <p class="text-xs text-[#5C5752] max-w-sm mx-auto leading-relaxed">
        Your automated SIP of <strong>₹${formatINR(amount)}</strong> in <strong>${basketName}</strong> is verified with NPCI AutoPay and linked to your portfolio.
      </p>

      <div class="bg-[#F4EFEA] border border-[#121110]/10 rounded-2xl p-4 text-left max-w-sm mx-auto space-y-2 text-xs">
        <div class="flex justify-between text-[#5C5752]">
          <span>Verified VPA</span>
          <span class="font-mono font-medium text-[#121110]">${upiId}</span>
        </div>
        <div class="flex justify-between text-[#5C5752]">
          <span>NPCI Mandate UMN</span>
          <span class="font-mono font-medium text-[#121110]">BASKLY${Math.floor(100000 + Math.random() * 900000)}@npci</span>
        </div>
        <div class="flex justify-between text-[#5C5752]">
          <span>First Purchase</span>
          <span class="text-[#0F6E56] font-semibold">Credited to Portfolio</span>
        </div>
      </div>

      <div class="pt-2 flex items-center justify-center gap-3">
        <a href="portal.html" class="px-5 py-2.5 rounded-full bg-[#121110] text-[#F4EFEA] text-xs font-semibold tracking-wider uppercase hover:bg-[#9A7B56] transition-all">
          View in Portfolio Portal ↗
        </a>
        <button type="button" onclick="closeUPIDrawer()" class="px-4 py-2.5 rounded-full border border-[#121110]/15 text-xs text-[#121110] hover:bg-[#121110]/5 transition-all">
          Close
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// 11. SCROLL REVEAL OBSERVER (WITH FAILSAFE)
// ============================================================================
function initScrollReveals() {
  const revealEls = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Failsafe so no section ever remains hidden if user jumps via anchor link
  setTimeout(() => {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }, 1600);
}

// ============================================================================
// 12. PRICING ORACLE & DYNAMIC NAV LINKING ENGINE (Section 3.1 - 3.7)
// ============================================================================
const ORACLE_SYMBOLS = {
  BTC:    { name: "Bitcoin",       binance: "BTCUSDT",    coingecko: "bitcoin",        fallbackUsd: 81604 },
  ETH:    { name: "Ethereum",      binance: "ETHUSDT",    coingecko: "ethereum",       fallbackUsd: 2411 },
  SOL:    { name: "Solana",        binance: "SOLUSDT",    coingecko: "solana",         fallbackUsd: 112 },
  BNB:    { name: "BNB",           binance: "BNBUSDT",    coingecko: "binancecoin",    fallbackUsd: 685 },
  XRP:    { name: "XRP",           binance: "XRPUSDT",    coingecko: "ripple",         fallbackUsd: 1.25 },
  PAXG:   { name: "PAX Gold",      binance: "PAXGUSDT",   coingecko: "pax-gold",       fallbackUsd: 4164 },
  UNI:    { name: "Uniswap",       binance: "UNIUSDT",    coingecko: "uniswap",        fallbackUsd: 7.15 },
  AAVE:   { name: "Aave",          binance: "AAVEUSDT",   coingecko: "aave",           fallbackUsd: 154 },
  LINK:   { name: "Chainlink",     binance: "LINKUSDT",   coingecko: "chainlink",      fallbackUsd: 12.4 },
  PENDLE: { name: "Pendle",        binance: "PENDLEUSDT", coingecko: "pendle",         fallbackUsd: 2.09 },
  LDO:    { name: "Lido DAO",      binance: "LDOUSDT",    coingecko: "lido-dao",       fallbackUsd: 0.94 },
  DOGE:   { name: "Dogecoin",      binance: "DOGEUSDT",   coingecko: "dogecoin",       fallbackUsd: 0.162 },
  SHIB:   { name: "Shiba Inu",     binance: "SHIBUSDT",   coingecko: "shiba-inu",      fallbackUsd: 0.0000185 },
  PEPE:   { name: "Pepe",          binance: "PEPEUSDT",   coingecko: "pepe",           fallbackUsd: 0.0000086 },
  BONK:   { name: "Bonk",          binance: "BONKUSDT",   coingecko: "bonk",           fallbackUsd: 0.0000192 },
  WIF:    { name: "dogwifhat",     binance: "WIFUSDT",    coingecko: "dogwifcoin",     fallbackUsd: 1.84 }
};

const clientOracleState = {
  usdtInr: 100.16,
  usdtSource: "CoinDCX Live",
  usdtLastUpdate: Date.now(),
  tokens: {},
  tickCount: 0,
  wsConnected: false,
  isDegraded: false
};

// Initialize token state
Object.entries(ORACLE_SYMBOLS).forEach(([sym, cfg]) => {
  clientOracleState.tokens[sym] = {
    symbol: sym,
    name: cfg.name,
    usd: cfg.fallbackUsd,
    inr: cfg.fallbackUsd * clientOracleState.usdtInr,
    prevInr: cfg.fallbackUsd * clientOracleState.usdtInr,
    change24h: 2.1,
    source: "Binance WS",
    status: "healthy",
    lastTick: Date.now()
  };
});

function initPricingOracle() {
  pollCoinDcxUsdtInr();
  connectBinanceWebSocket();
  pollCoinGeckoFallback();

  setInterval(pollCoinDcxUsdtInr, 15000);   // CoinDCX USDT/INR rate every 15s
  setInterval(pollCoinGeckoFallback, 60000); // CoinGecko fallback every 60s
  setInterval(checkStaleFeeds, 10000);       // Health check every 10s
}

// 1. Poll Indian Exchange (CoinDCX) for real USDT/INR rate
async function pollCoinDcxUsdtInr() {
  try {
    const res = await fetch('https://api.coindcx.com/exchange/ticker');
    const tickers = await res.json();
    const usdtPair = tickers.find(t => t.market === 'USDTINR');
    if (usdtPair && parseFloat(usdtPair.last_price) > 0) {
      const oldRate = clientOracleState.usdtInr;
      clientOracleState.usdtInr = parseFloat(usdtPair.last_price);
      clientOracleState.usdtLastUpdate = Date.now();
      clientOracleState.usdtSource = "CoinDCX Live";

      // Update badge
      const badge = document.getElementById('oracle-nav-badge');
      if (badge) {
        badge.textContent = `ORACLE LIVE · USDT: ₹${clientOracleState.usdtInr.toFixed(2)}`;
      }
      const modalRate = document.getElementById('modal-usdt-rate');
      if (modalRate) {
        modalRate.textContent = `₹${clientOracleState.usdtInr.toFixed(2)}`;
      }

      // Recompute all INR prices if USDT changed
      if (Math.abs(oldRate - clientOracleState.usdtInr) > 0.05) {
        Object.keys(clientOracleState.tokens).forEach(sym => {
          const t = clientOracleState.tokens[sym];
          t.inr = t.usd * clientOracleState.usdtInr;
        });
        recalculateAllBasketNAVs();
      }
    }
  } catch (err) {
    console.warn('[Oracle Client] CoinDCX fetch error, using cached rate:', err);
  }
}

// 2. Connect to Binance Public WebSocket
function connectBinanceWebSocket() {
  try {
    const streamNames = "btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker/bnbusdt@miniTicker/xrpusdt@miniTicker/dogeusdt@miniTicker/shibusdt@miniTicker/pepeusdt@miniTicker/uniusdt@miniTicker/aaveusdt@miniTicker/linkusdt@miniTicker/wifusdt@miniTicker";
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamNames}`);

    ws.onopen = () => {
      clientOracleState.wsConnected = true;
      console.log('[Oracle Client] Connected to Binance WebSocket stream.');
    };

    ws.onmessage = (event) => {
      try {
        const tick = JSON.parse(event.data);
        if (tick && tick.s && tick.c) {
          const symbolPair = tick.s; // e.g. "BTCUSDT"
          const priceUsd = parseFloat(tick.c);

          const entry = Object.entries(ORACLE_SYMBOLS).find(([_, cfg]) => cfg.binance === symbolPair);
          if (entry && priceUsd > 0) {
            const [sym] = entry;
            handleIncomingTokenTick(sym, priceUsd, "Binance WS");
          }
        }
      } catch (e) {}
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onclose = () => {
      clientOracleState.wsConnected = false;
      setTimeout(connectBinanceWebSocket, 5000); // Auto reconnect
    };
  } catch (err) {
    console.warn('[Oracle Client] WebSocket setup error:', err);
  }
}

// 3. Fallback CoinGecko Poller for PAXG (Gold) and others
async function pollCoinGeckoFallback() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,pendle,bonk&vs_currencies=usd');
    const data = await res.json();
    if (data['pax-gold'] && data['pax-gold'].usd) {
      handleIncomingTokenTick('PAXG', data['pax-gold'].usd, 'CoinGecko');
    }
    if (data['pendle'] && data['pendle'].usd) {
      handleIncomingTokenTick('PENDLE', data['pendle'].usd, 'CoinGecko');
    }
    if (data['bonk'] && data['bonk'].usd) {
      handleIncomingTokenTick('BONK', data['bonk'].usd, 'CoinGecko');
    }
  } catch (e) {}
}

// 4. Handle Incoming Verified Tick
function handleIncomingTokenTick(sym, priceUsd, source) {
  const token = clientOracleState.tokens[sym];
  if (!token) return;

  const prevInr = token.inr;
  const newInr = priceUsd * clientOracleState.usdtInr;
  const isUp = newInr >= prevInr;

  token.usd = priceUsd;
  token.prevInr = prevInr;
  token.inr = newInr;
  token.source = source;
  token.status = "healthy";
  token.lastTick = Date.now();
  clientOracleState.tickCount++;

  // Update in-memory basket assets
  basketsData.forEach(basket => {
    const asset = basket.assets.find(a => a.symbol === sym);
    if (asset) {
      asset.price_inr = newInr;
    }
  });

  // Propagate to DOM elements
  propagateTickToDOM(sym, newInr, isUp);

  // Recalculate Basket NAVs
  recalculateAllBasketNAVs(sym);

  // Update Telemetry table if open
  updateOracleTableRow(sym);
}

// 5. Propagate Live Flash Animations to DOM
function propagateTickToDOM(sym, newInr, isUp) {
  // Update all elements with data-token-symbol
  const els = document.querySelectorAll(`[data-token-symbol="${sym}"]`);
  els.forEach(el => {
    el.textContent = `₹${formatINR(newInr)}`;
    el.classList.remove('tick-flash-green', 'tick-flash-rose');
    void el.offsetWidth; // Trigger reflow
    el.classList.add(isUp ? 'tick-flash-green' : 'tick-flash-rose');
  });

  // Modal spot price if currently inspected
  const modalSpotEl = document.getElementById(`modal-spot-${sym}`);
  if (modalSpotEl) {
    modalSpotEl.textContent = `₹${formatINR(newInr)}`;
    modalSpotEl.classList.remove('tick-flash-green', 'tick-flash-rose');
    void modalSpotEl.offsetWidth;
    modalSpotEl.classList.add(isUp ? 'tick-flash-green' : 'tick-flash-rose');
  }
}

// 6. Recalculate Live Basket NAVs Everywhere
function recalculateAllBasketNAVs(updatedSymbol) {
  basketsData.forEach(basket => {
    let basketSum = 0;
    basket.assets.forEach(a => {
      const livePrice = clientOracleState.tokens[a.symbol]?.inr || a.price_inr;
      basketSum += livePrice * (a.weight / 100);
    });

    // Mathematically anchored to ₹100.00 Base NAV
    if (!basket.initialBaseSum || basket.initialBaseSum === 0) {
      basket.initialBaseSum = basketSum;
    }
    const normalizedNav = basket.initialBaseSum > 0 
      ? Number(((basketSum / basket.initialBaseSum) * 100.00).toFixed(2))
      : 100.00;
      
    const oldNav = basket.nav;
    basket.nav = normalizedNav;
    const isUp = basket.nav >= oldNav;

    // Persist snapshot to production database continuously
    if (window.BasklyDB && window.BasklyDB.storeNAVSnapshot) {
      BasklyDB.storeNAVSnapshot(basket.id, basket.nav);
    }

    // Update Basket Card NAV in Grid
    const navEl = document.getElementById(`basket-nav-${basket.id}`);
    if (navEl) {
      navEl.textContent = `₹${basket.nav.toFixed(2)}`;
      if (updatedSymbol && basket.assets.some(a => a.symbol === updatedSymbol)) {
        navEl.classList.remove('tick-flash-green', 'tick-flash-rose');
        void navEl.offsetWidth;
        navEl.classList.add(isUp ? 'tick-flash-green' : 'tick-flash-rose');
      }
    }

    // If modal is inspecting this basket, update modal NAV
    if (currentlyInspectedBasketId === basket.id) {
      const modalNavEl = document.getElementById('modal-basket-nav');
      if (modalNavEl) {
        modalNavEl.textContent = `₹${basket.nav.toFixed(2)}`;
        modalNavEl.classList.remove('tick-flash-green', 'tick-flash-rose');
        void modalNavEl.offsetWidth;
        modalNavEl.classList.add(isUp ? 'tick-flash-green' : 'tick-flash-rose');
      }
    }

    // Hero Top-5 Folio Card Real-Time NAV & Portfolio Valuation
    if (basket.id === 'top-5-index') {
      const heroNavEl = document.getElementById('hero-folio-nav');
      if (heroNavEl) {
        heroNavEl.textContent = `Top-5 NAV: ₹${basket.nav.toFixed(2)}`;
      }

      const heroValEl = document.getElementById('hero-folio-valuation');
      if (heroValEl) {
        const baseFolioUnits = 4511.8;
        const liveValuation = baseFolioUnits * basket.nav;
        heroValEl.textContent = `₹${formatINR(liveValuation)}`;
        if (updatedSymbol) {
          heroValEl.classList.remove('tick-flash-green', 'tick-flash-rose');
          void heroValEl.offsetWidth;
          heroValEl.classList.add(isUp ? 'tick-flash-green' : 'tick-flash-rose');
        }
      }
    }

    // Live update the card sparkline chart and modal chart
    const wrap = document.getElementById(`card-chart-wrap-${basket.id}`);
    if (wrap) wrap.innerHTML = generateCardSparklineSVG(basket.id, basket.nav);
    if (currentlyInspectedBasketId === basket.id) {
      const svgFallback = document.getElementById('modal-fund-svg-fallback');
      if (svgFallback) svgFallback.innerHTML = generateModalChartSVG(basket.id, currentModalTimeframe, basket.nav);
      drawModalProChart(basket.id, currentModalTimeframe);
    }
  });
}

// 7. Staleness Checker (Section 3.6 of Specification)
function checkStaleFeeds() {
  const now = Date.now();
  let staleCount = 0;

  Object.values(clientOracleState.tokens).forEach(t => {
    if (now - t.lastTick > 90000) {
      t.status = "stale";
      staleCount++;
    } else if (now - t.lastTick > 30000) {
      t.status = "delayed";
    } else {
      t.status = "healthy";
    }
  });

  const badge = document.getElementById('oracle-nav-badge');
  if (staleCount > 4 || (now - clientOracleState.usdtLastUpdate > 120000)) {
    clientOracleState.isDegraded = true;
    if (badge) badge.textContent = `PRICE DELAYED · NAV FROZEN`;
  } else {
    clientOracleState.isDegraded = false;
    if (badge) badge.textContent = `ORACLE LIVE · USDT: ₹${clientOracleState.usdtInr.toFixed(2)}`;
  }
}

// 8. Oracle Telemetry Modal Functions
function openOracleModal() {
  renderOracleTelemetryTable();
  const modal = document.getElementById('oracle-telemetry-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeOracleModal() {
  const modal = document.getElementById('oracle-telemetry-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderOracleTelemetryTable() {
  const tbody = document.getElementById('oracle-prices-table-body');
  if (!tbody) return;

  tbody.innerHTML = Object.values(clientOracleState.tokens).map(t => {
    const statusColor = t.status === 'healthy' ? 'text-[#0F6E56] bg-[#0F6E56]/10' : 'text-amber-800 bg-amber-100';
    return `
      <tr id="oracle-row-${t.symbol}" class="hover:bg-[#F4EFEA]/80 transition-colors">
        <td class="py-2.5 px-3 font-semibold text-[#121110]">
          ${t.name} <span class="text-[10px] text-[#8C857B]">(${t.symbol})</span>
        </td>
        <td class="py-2.5 px-3 text-[#5C5752] font-mono">$${t.usd >= 1 ? t.usd.toLocaleString('en-US', {maximumFractionDigits: 2}) : t.usd.toFixed(6)}</td>
        <td id="oracle-spot-${t.symbol}" class="py-2.5 px-3 font-bold text-[#121110] font-mono">₹${formatINR(t.inr)}</td>
        <td class="py-2.5 px-3 text-[#8C857B]">${t.source}</td>
        <td class="py-2.5 px-3 text-right">
          <span class="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${statusColor}">
            ${t.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function updateOracleTableRow(sym) {
  const spotEl = document.getElementById(`oracle-spot-${sym}`);
  const token = clientOracleState.tokens[sym];
  if (spotEl && token) {
    spotEl.textContent = `₹${formatINR(token.inr)}`;
    spotEl.classList.remove('tick-flash-green', 'tick-flash-rose');
    void spotEl.offsetWidth;
    spotEl.classList.add('tick-flash-green');
  }

  const counterEl = document.getElementById('oracle-tick-counter');
  if (counterEl) {
    counterEl.textContent = `${clientOracleState.tickCount} Ticks Processed`;
  }
}

// ============================================================================
// INITIALIZE EVERYTHING ON DOM READY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Render all DOM sections first so they are immediately present
  renderBaskets();
  calculateSIP();
  renderQuiz();
  initScrollReveals();
  initCustomCursor();
  initMagneticElements();
  initTiltCards();

  // 2. Start Preloader & WebGL 3D Scene
  initPreloader();
  initWebGLScene();

  // 3. Start Live Pricing Oracle (Linked everywhere for NAV)
  initPricingOracle();

  // 4. Range Slider Listeners
  const sipAmount = document.getElementById('sip-amount-range');
  const sipYears = document.getElementById('sip-years-range');
  const sipCagr = document.getElementById('sip-cagr-range');

  if (sipAmount) sipAmount.addEventListener('input', calculateSIP);
  if (sipYears) sipYears.addEventListener('input', calculateSIP);
  if (sipCagr) sipCagr.addEventListener('input', calculateSIP);

  window.addEventListener('resize', () => {
    calculateSIP();
  });
});

