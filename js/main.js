/* =====================================================
   BetterPlace — main.js (Revamp 2026 — Scroll-Driven 3D Orbit)
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCounters();
  initCarousel();
  initSmoothScroll();
  initFormValidation();
  initFadeIn();
  setActiveNavLink();
  initParticles();
  init3DOrbit();
  initOrbitScroll();
});

/* ----- Navigation ----- */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  const hamburger = nav.querySelector('.nav__hamburger');
  const mobileMenu = nav.querySelector('.nav__mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }
}

/* ----- Set Active Nav Link ----- */
function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ----- Counter Animation ----- */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = el.dataset.counter;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();

    const numMatch = target.match(/[\d.]+/);
    if (!numMatch) { el.textContent = prefix + target + suffix; return; }

    const targetNum = parseFloat(numMatch[0]);
    const isDecimal = target.includes('.');
    const decimals = isDecimal ? (target.split('.')[1] || '').length : 0;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = easeOut(progress) * targetNum;
      el.textContent = prefix + (isDecimal ? current.toFixed(decimals) : Math.round(current).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

/* ----- Fade In Animation ----- */
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ----- Carousel ----- */
function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  if (!wrapper) return;

  const track = wrapper.querySelector('.carousel-track');
  const slides = wrapper.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn--prev');
  const nextBtn = document.querySelector('.carousel-btn--next');

  if (!slides.length) return;

  let current = 0;
  let autoplayTimer = null;
  let touchStartX = 0;
  let isDragging = false;

  const goTo = (index) => {
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const startAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 4500);
  };
  const pauseAutoplay = () => clearInterval(autoplayTimer);

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
  });

  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
    pauseAutoplay();
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    isDragging = false;
    startAutoplay();
  });

  wrapper.addEventListener('mouseenter', pauseAutoplay);
  wrapper.addEventListener('mouseleave', startAutoplay);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    if (e.key === 'ArrowRight') { next(); startAutoplay(); }
  });

  goTo(0);
  startAutoplay();
}

/* ----- Smooth Scroll ----- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ----- Contact Form Validation ----- */
function initFormValidation() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;

  const showError = (input, msg) => {
    clearError(input);
    input.style.borderColor = '#E53E3E';
    const err = document.createElement('span');
    err.className = 'form-error';
    err.style.cssText = 'color:#E53E3E;font-size:0.8rem;font-weight:600;margin-top:4px;display:block;';
    err.textContent = msg;
    input.parentNode.appendChild(err);
  };

  const clearError = (input) => {
    input.style.borderColor = '';
    const existing = input.parentNode.querySelector('.form-error');
    if (existing) existing.remove();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const required = form.querySelectorAll('[required]');
    required.forEach(field => {
      clearError(field);
      if (!field.value.trim()) {
        showError(field, 'This field is required.');
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        showError(field, 'Please enter a valid email address.');
        valid = false;
      }
    });

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Message Sent!';
      btn.style.background = '#10B981';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    }
  });

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });
}

/* ----- Floating Particles ----- */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    p.style.opacity = (0.15 + Math.random() * 0.35);

    const colors = [
      'rgba(74,108,247,0.6)',
      'rgba(139,92,246,0.5)',
      'rgba(236,72,153,0.4)',
      'rgba(16,185,129,0.4)',
      'rgba(255,255,255,0.4)'
    ];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(p);
  }
}

/* =====================================================
   SCROLL-DRIVEN ORBIT INTERACTION
   ===================================================== */
let orbitActiveStep = -1; // shared with 3D orbit

function initOrbitScroll() {
  const journey = document.getElementById('orbit-journey');
  if (!journey) return;

  const triggers = journey.querySelectorAll('.orbit-journey__trigger');
  const infoPanels = document.querySelectorAll('.orbit-step-info');
  const labels = document.querySelectorAll('.orbit-label');
  const dots = document.querySelectorAll('.orbit-progress-dot');

  const bgLayers = document.querySelectorAll('.orbit-bg-layer');
  const scrollHint = document.getElementById('orbit-scroll-hint');

  function setActiveStep(step) {
    if (step === orbitActiveStep) return;
    orbitActiveStep = step;

    // Update info panels
    infoPanels.forEach(panel => {
      const pStep = parseInt(panel.dataset.step);
      panel.classList.toggle('active', pStep === step);
    });

    // Update orbit labels
    labels.forEach(label => {
      const lStep = parseInt(label.dataset.step);
      label.classList.toggle('active', lStep === step);
    });

    // Update progress dots
    dots.forEach(dot => {
      const dStep = parseInt(dot.dataset.step);
      dot.classList.toggle('active', dStep === step);
    });

    // Update background layers
    bgLayers.forEach(layer => {
      const bgStep = parseInt(layer.dataset.bg);
      layer.classList.toggle('active', bgStep === step);
    });

    // Hide scroll hint after leaving intro
    if (scrollHint && step !== -1) {
      scrollHint.classList.add('hidden');
    } else if (scrollHint && step === -1) {
      scrollHint.classList.remove('hidden');
    }
  }

  // Intersection Observer on scroll triggers
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = parseInt(entry.target.dataset.trigger);
        setActiveStep(step);
      }
    });
  }, {
    root: null,
    threshold: 0.5
  });

  triggers.forEach(trigger => observer.observe(trigger));

  // Hide fixed background layers when orbit section is not in view
  const orbitBg = document.getElementById('orbit-bg');
  const particlesEl = document.querySelector('.orbit-journey__particles');
  if (orbitBg) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        orbitBg.style.opacity = entry.isIntersecting ? '1' : '0';
        if (particlesEl) particlesEl.style.opacity = entry.isIntersecting ? '1' : '0';
      });
    }, { threshold: 0 });
    sectionObserver.observe(journey);
  }

  // Clickable progress dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.dataset.step);
      const triggerIdx = step + 1; // offset because -1 is first
      const targetTrigger = triggers[triggerIdx];
      if (targetTrigger) {
        clearInterval(autoOrbitTimer);
        targetTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Auto-advance every 3 seconds through all steps
  let autoOrbitIndex = 0; // starts at trigger index 0 (step -1 already shown)
  const autoOrbitTimer = setInterval(() => {
    autoOrbitIndex++;
    if (autoOrbitIndex >= triggers.length) {
      clearInterval(autoOrbitTimer);
      return;
    }
    triggers[autoOrbitIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 3000);

  // Pause auto-advance on manual scroll
  window.addEventListener('wheel', () => clearInterval(autoOrbitTimer), { once: true });
  window.addEventListener('touchmove', () => clearInterval(autoOrbitTimer), { once: true });

  // Show "See Overview" button once the orbit section is in view
  const overviewBtn = document.getElementById('orbit-overview-btn');
  if (overviewBtn) {
    const btnObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        overviewBtn.style.opacity = entry.isIntersecting ? '1' : '0';
        overviewBtn.style.pointerEvents = entry.isIntersecting ? 'auto' : 'none';
      });
    }, { threshold: 0.1 });
    btnObserver.observe(journey);
  }

  // Initialize first step
  setActiveStep(-1);
}

/* =====================================================
   3D ORBIT — Three.js (Scroll-Driven)
   ===================================================== */
function init3DOrbit() {
  const canvas = document.getElementById('orbit-canvas');
  if (!canvas) return;

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = () => setup3DOrbit(canvas);
  document.head.appendChild(script);
}

function setup3DOrbit(canvas) {
  const container = canvas.parentElement;
  let width = container.clientWidth;
  let height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 2.5, 9);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Colors — BetterPlace brand secondary palette
  const blue = new THREE.Color(0x1B2D93);
  const chutney = new THREE.Color(0xABD354);  // Green
  const kaveri = new THREE.Color(0x32CAD4);   // Teal
  const litchi = new THREE.Color(0xF375AA);   // Pink
  const taxi = new THREE.Color(0xFFC401);     // Yellow
  const mausambi = new THREE.Color(0xFF9518); // Orange

  // Lights — bright enough to illuminate the globe
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const pl1 = new THREE.PointLight(0x3D5AF1, 2.0, 25);
  pl1.position.set(3, 3, 3);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(0x3D5AF1, 1.2, 20);
  pl2.position.set(-3, -2, 2);
  scene.add(pl2);
  const pl3 = new THREE.PointLight(0xF59E0B, 0.6, 18);
  pl3.position.set(0, 4, -3);
  scene.add(pl3);

  // Central wireframe sphere — bright enough to see against dark bg
  const hubGeo = new THREE.SphereGeometry(1.4, 28, 28);
  const hubMat = new THREE.MeshBasicMaterial({ color: 0x6B8CFF, wireframe: true, transparent: true, opacity: 0.25 });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  scene.add(hub);

  // Inner glow — visible soft fill
  const glowGeo = new THREE.SphereGeometry(1.35, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x3D5AF1, transparent: true, opacity: 0.08 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glow);

  // Orbit rings
  function makeRing(radius, tiltX, tiltZ, color, opacity, dashed) {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.15, gapSize: 0.1 })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const line = new THREE.Line(geo, mat);
    if (dashed) line.computeLineDistances();
    line.rotation.x = tiltX;
    line.rotation.z = tiltZ;
    return line;
  }

  const ring1 = makeRing(3.5, Math.PI * 0.35, 0, 0x6B8CFF, 0.3, false);
  const ring2 = makeRing(4.2, Math.PI * 0.45, Math.PI * 0.15, 0x4A6CF7, 0.18, true);
  const ring3 = makeRing(4.8, Math.PI * 0.25, -Math.PI * 0.1, 0xF59E0B, 0.12, true);
  scene.add(ring1, ring2, ring3);

  // Node data — 9 nodes: Hire, Verify, Attendance, Upskilling, Vendor, Performance, Payroll, Staffing, Gig
  const nodeColors = [chutney, kaveri, litchi, taxi, kaveri, litchi, taxi, mausambi, mausambi];
  const nodeData = [
    { ring: 1, angle: 0 },
    { ring: 1, angle: Math.PI * (2/6) },
    { ring: 1, angle: Math.PI * (4/6) },
    { ring: 1, angle: Math.PI * (6/6) },
    { ring: 1, angle: Math.PI * (8/6) },
    { ring: 1, angle: Math.PI * (10/6) },
    { ring: 2, angle: 0 },
    { ring: 2, angle: Math.PI * (2/3) },
    { ring: 2, angle: Math.PI * (4/3) },
  ];

  // Node meshes
  const nodeMeshes = [];
  const nodeGlows = [];
  nodeData.forEach((data, i) => {
    const geo = new THREE.SphereGeometry(0.22, 16, 16);
    const mat = new THREE.MeshPhongMaterial({
      color: nodeColors[i],
      emissive: nodeColors[i],
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    nodeMeshes.push(mesh);

    const spriteMat = new THREE.SpriteMaterial({ color: nodeColors[i], transparent: true, opacity: 0 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0, 0, 0);
    scene.add(sprite);
    nodeGlows.push(sprite);
  });

  // Connection lines
  const lineMeshes = [];
  nodeData.forEach((_, i) => {
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: nodeColors[i], transparent: true, opacity: 0.06 });
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
    lineMeshes.push(line);
  });

  // Floating particles
  const particles = [];
  for (let i = 0; i < 60; i++) {
    const geo = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 6, 6);
    const colors = [0xABD354, 0x32CAD4, 0xF375AA, 0xFFC401, 0xFF9518, 0xFFFFFF];
    const mat = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.15 + Math.random() * 0.35
    });
    const mesh = new THREE.Mesh(geo, mat);
    const dist = 1.5 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.6;
    mesh.position.set(
      Math.cos(theta) * Math.cos(phi) * dist,
      Math.sin(phi) * dist * 0.5,
      Math.sin(theta) * Math.cos(phi) * dist
    );
    mesh.userData = { dist, theta, phi, speed: 0.0003 + Math.random() * 0.0015, yOsc: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    particles.push(mesh);
  }

  // Labels
  const labelsContainer = document.getElementById('orbit-labels');

  function getNodePosition(i, time) {
    const d = nodeData[i];
    const ringRadius = d.ring === 1 ? 3.5 : 4.2;
    const tiltX = d.ring === 1 ? Math.PI * 0.35 : Math.PI * 0.45;
    const tiltZ = d.ring === 1 ? 0 : Math.PI * 0.15;
    const speed = d.ring === 1 ? 0.08 : 0.06;
    const angle = d.angle + time * speed;

    let x = Math.cos(angle) * ringRadius;
    let y = 0;
    let z = Math.sin(angle) * ringRadius;

    // Tilt X
    const cX = Math.cos(tiltX), sX = Math.sin(tiltX);
    const y1 = y * cX - z * sX;
    const z1 = y * sX + z * cX;
    y = y1; z = z1;

    // Tilt Z
    const cZ = Math.cos(tiltZ), sZ = Math.sin(tiltZ);
    const x2 = x * cZ - y * sZ;
    const y2 = x * sZ + y * cZ;
    x = x2; y = y2;

    // Ring rotation
    const ringYRot = time * (d.ring === 1 ? 0.08 : -0.06);
    const cY = Math.cos(ringYRot), sY = Math.sin(ringYRot);
    const rx = x * cY + z * sY;
    const rz = -x * sY + z * cY;

    return { x: rx, y, z: rz };
  }

  function updateLabels(time) {
    if (!labelsContainer) return;
    const labels = labelsContainer.querySelectorAll('.orbit-label');
    labels.forEach((label, i) => {
      if (i >= nodeMeshes.length) return;
      const pos = nodeMeshes[i].position.clone();
      pos.project(camera);
      const lx = (pos.x * 0.5 + 0.5) * width;
      const ly = (-pos.y * 0.5 + 0.5) * height;
      const depth = pos.z;

      label.style.left = lx + 'px';
      label.style.top = ly + 'px';

      const isActive = label.classList.contains('active');
      // Active node is always fully visible; inactive uses depth-based opacity
      const depthOpacity = depth < 1 ? (0.3 + (1 - depth) * 0.7) : 0.2;
      label.style.opacity = isActive ? 1 : depthOpacity;

      const depthScale = depth < 1 ? (0.65 + (1 - depth) * 0.35) : 0.5;
      label.querySelector('.orbit-label__inner').style.transform = isActive
        ? `scale(1.15)`
        : `scale(${depthScale})`;
    });
  }

  // Animation
  let time = 0;
  let prevActiveStep = -2;

  // Smoothly interpolated node positions (for snap-to-right)
  const smoothPositions = nodeData.map((_, i) => {
    const p = getNodePosition(i, 0);
    return { x: p.x, y: p.y, z: p.z };
  });
  const SNAP_LERP = 0.045; // smooth transition

  // Target position: upper-right of the globe, staying within the orbit canvas area
  const SNAP_TARGET = { x: 2.2, y: 1.2, z: 3.0 };

  function animate() {
    requestAnimationFrame(animate);
    time += 0.004;

    // Slow base rotation
    hub.rotation.y = time * 0.12;
    hub.rotation.x = 0.1;
    glow.rotation.y = time * 0.08;

    ring1.rotation.y = time * 0.08;
    ring2.rotation.y = -time * 0.06;
    ring3.rotation.y = time * 0.04;

    // Update nodes
    nodeData.forEach((_, i) => {
      const orbitPos = getNodePosition(i, time);
      const isActive = (orbitActiveStep === i);

      // Determine target: snap to right side if active, otherwise follow orbit
      const tx = isActive ? SNAP_TARGET.x : orbitPos.x;
      const ty = isActive ? SNAP_TARGET.y : orbitPos.y;
      const tz = isActive ? SNAP_TARGET.z : orbitPos.z;

      // Smooth interpolation
      const sp = smoothPositions[i];
      const lerpSpeed = isActive ? SNAP_LERP : SNAP_LERP * 2;
      sp.x += (tx - sp.x) * lerpSpeed;
      sp.y += (ty - sp.y) * lerpSpeed;
      sp.z += (tz - sp.z) * lerpSpeed;

      nodeMeshes[i].position.set(sp.x, sp.y, sp.z);
      nodeGlows[i].position.copy(nodeMeshes[i].position);

      // Highlight active node
      nodeMeshes[i].material.emissiveIntensity = isActive ? 1.2 : 0.4;
      nodeMeshes[i].material.opacity = isActive ? 1 : 0.6;
      nodeMeshes[i].scale.setScalar(isActive ? 1.5 : 1);
      nodeGlows[i].material.opacity = 0;
      nodeGlows[i].scale.setScalar(0);

      // Connection line
      const positions = lineMeshes[i].geometry.attributes.position.array;
      positions[0] = 0; positions[1] = 0; positions[2] = 0;
      positions[3] = sp.x; positions[4] = sp.y; positions[5] = sp.z;
      lineMeshes[i].geometry.attributes.position.needsUpdate = true;
      lineMeshes[i].material.opacity = isActive ? 0.2 : 0.04;
    });

    // Floating particles
    particles.forEach(p => {
      p.userData.theta += p.userData.speed;
      p.userData.yOsc += 0.002;
      const d = p.userData.dist;
      const th = p.userData.theta;
      const ph = p.userData.phi;
      p.position.set(
        Math.cos(th) * Math.cos(ph) * d,
        Math.sin(ph) * d * 0.5 + Math.sin(p.userData.yOsc) * 0.12,
        Math.sin(th) * Math.cos(ph) * d
      );
    });

    // Hub glow pulse
    glowMat.opacity = 0.08 + Math.sin(time * 2) * 0.04;

    updateLabels(time);
    renderer.render(scene, camera);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}
