/* =====================================================
   FLOATING PARTICLES / ATOM EFFECT
   Shared across all BetterPlace pages.
   Loads Three.js via CDN, renders a fixed full-viewport
   canvas with floating particles + subtle orbit rings.
   ===================================================== */
(function () {
  // Create fixed canvas
  var canvas = document.createElement('canvas');
  canvas.id = 'bp-particles';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.35;';
  document.body.insertBefore(canvas, document.body.firstChild);

  // Load Three.js if not already present
  function boot() {
    if (typeof THREE !== 'undefined') {
      init(canvas);
    } else {
      var s = document.createElement('script');
      s.src =
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = function () {
        init(canvas);
      };
      document.head.appendChild(s);
    }
  }

  function init(canvas) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    var pl1 = new THREE.PointLight(0x3d5af1, 1.5, 30);
    pl1.position.set(4, 4, 4);
    scene.add(pl1);
    var pl2 = new THREE.PointLight(0x3d5af1, 0.8, 25);
    pl2.position.set(-4, -3, 3);
    scene.add(pl2);

    // Subtle orbit rings (decorative only)
    function makeRing(radius, tiltX, tiltZ, color, opacity, dashed) {
      var group = new THREE.Group();
      var offsets = [0, 0.012, -0.012];
      offsets.forEach(function (offset) {
        var pts = [];
        for (var i = 0; i <= 256; i++) {
          var a = (i / 256) * Math.PI * 2;
          pts.push(
            new THREE.Vector3(
              Math.cos(a) * (radius + offset),
              0,
              Math.sin(a) * (radius + offset)
            )
          );
        }
        var geo = new THREE.BufferGeometry().setFromPoints(pts);
        var mat = dashed
          ? new THREE.LineDashedMaterial({
              color: color,
              transparent: true,
              opacity: opacity,
              dashSize: 0.25,
              gapSize: 0.15,
            })
          : new THREE.LineBasicMaterial({
              color: color,
              transparent: true,
              opacity: opacity,
            });
        var line = new THREE.Line(geo, mat);
        if (dashed) line.computeLineDistances();
        group.add(line);
      });
      group.rotation.x = tiltX;
      group.rotation.z = tiltZ;
      return group;
    }

    var ring1 = makeRing(
      3.5,
      Math.PI * 0.42,
      Math.PI * 0.04,
      0x6b8cff,
      0.18,
      false
    );
    ring1.position.set(0.3, -0.3, 0);
    var ring2 = makeRing(
      1.3,
      Math.PI * 0.4,
      -Math.PI * 0.06,
      0x4a6cf7,
      0.14,
      false
    );
    ring2.position.set(-1.8, 2.1, 0.15);
    var ring3 = makeRing(
      5.2,
      Math.PI * 0.22,
      -Math.PI * 0.2,
      0xf59e0b,
      0.1,
      true
    );
    ring3.position.set(-2.2, -1.5, -0.4);
    scene.add(ring1, ring2, ring3);

    // Floating particles
    var particles = [];
    var pColors = [
      0xabd354, 0x32cad4, 0xf375aa, 0xffc401, 0xff9518, 0xffffff, 0x6b8cff,
    ];
    for (var i = 0; i < 80; i++) {
      var geo = new THREE.SphereGeometry(
        0.015 + Math.random() * 0.035,
        6,
        6
      );
      var mat = new THREE.MeshBasicMaterial({
        color: pColors[Math.floor(Math.random() * pColors.length)],
        transparent: true,
        opacity: 0.12 + Math.random() * 0.3,
      });
      var mesh = new THREE.Mesh(geo, mat);
      var dist = 2 + Math.random() * 5;
      var theta = Math.random() * Math.PI * 2;
      var phi = (Math.random() - 0.5) * Math.PI * 0.7;
      mesh.position.set(
        Math.cos(theta) * Math.cos(phi) * dist,
        Math.sin(phi) * dist * 0.5,
        Math.sin(theta) * Math.cos(phi) * dist
      );
      mesh.userData = {
        dist: dist,
        theta: theta,
        phi: phi,
        speed: 0.0002 + Math.random() * 0.001,
        yOsc: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      particles.push(mesh);
    }

    var time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.003;

      ring1.rotation.y = time * 0.04;
      ring2.rotation.y = time * 0.04;
      ring3.rotation.y = time * 0.028;

      particles.forEach(function (p) {
        p.userData.theta += p.userData.speed;
        p.userData.yOsc += 0.0015;
        var d = p.userData.dist;
        var th = p.userData.theta;
        var ph = p.userData.phi;
        p.position.set(
          Math.cos(th) * Math.cos(ph) * d,
          Math.sin(ph) * d * 0.5 + Math.sin(p.userData.yOsc) * 0.1,
          Math.sin(th) * Math.cos(ph) * d
        );
      });

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      w = window.innerWidth;
      h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // Boot after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
