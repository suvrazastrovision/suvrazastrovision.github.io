(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'dynamic-backdrop';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frameId = 0;
  let lastTime = 0;
  let points = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createMesh();
  }

  function createMesh() {
    const spacing = width < 700 ? 64 : 76;
    const columns = Math.ceil(width / spacing) + 3;
    const rows = 7;
    points = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const seed = row * columns + column;
        points.push({
          row,
          column,
          baseX: (column - 1) * spacing + (row % 2) * spacing * 0.35,
          phase: seed * 0.73 + Math.sin(seed * 2.1),
          brightness: 0.35 + ((seed * 17) % 65) / 100
        });
      }
    }
  }

  function pointPosition(point, time) {
    const horizon = height * 0.64;
    const wave = Math.sin(point.column * 0.72 + time * 0.00045 + point.phase) * 34;
    const swell = Math.sin(point.column * 0.22 - time * 0.00022 + point.row) * 52;
    const depth = (point.row - 3) * 26;
    const mouseLift = Math.max(0, 1 - Math.abs(point.baseX / width - pointer.x) * 3) * (pointer.y - 0.5) * 42;
    return {
      x: point.baseX + (pointer.x - 0.5) * (point.row - 3) * 5,
      y: horizon + wave + swell + depth + mouseLift
    };
  }

  function draw(time = 0) {
    frameId = 0;
    const isDark = document.documentElement.dataset.theme === 'dark';

    pointer.x += (pointer.targetX - pointer.x) * 0.035;
    pointer.y += (pointer.targetY - pointer.y) * 0.035;
    ctx.clearRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(pointer.x * width, height * 0.66, 0, pointer.x * width, height * 0.66, width * 0.55);
    glow.addColorStop(0, isDark ? 'rgba(18, 115, 190, 0.11)' : 'rgba(86, 174, 207, 0.2)');
    glow.addColorStop(1, isDark ? 'rgba(0, 26, 58, 0)' : 'rgba(143, 201, 223, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const positions = points.map(point => pointPosition(point, time));
    const columns = Math.max(...points.map(point => point.column)) + 1;
    ctx.lineWidth = 0.65;

    points.forEach((point, index) => {
      const here = positions[index];
      const rightIndex = point.column + 1 < columns ? index + 1 : -1;
      const downIndex = point.row < 6 ? index + columns : -1;
      const diagonalIndex = point.row < 6 && point.column + 1 < columns ? index + columns + 1 : -1;

      [rightIndex, downIndex, diagonalIndex].forEach(targetIndex => {
        if (targetIndex < 0 || !positions[targetIndex]) return;
        const target = positions[targetIndex];
        const fade = Math.max(0, 1 - Math.abs(here.x - pointer.x * width) / (width * 0.8));
        const lineAlpha = isDark ? 0.055 + fade * 0.12 : 0.09 + fade * 0.14;
        ctx.strokeStyle = isDark
          ? `rgba(53, 155, 229, ${lineAlpha})`
          : `rgba(70, 145, 174, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(here.x, here.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      const pulse = 0.65 + Math.sin(time * 0.0015 + point.phase) * 0.35;
      const radius = 0.8 + point.brightness * 1.5;
      const nodeAlpha = point.brightness * pulse * (isDark ? 1 : 0.78);
      ctx.fillStyle = isDark
        ? `rgba(130, 211, 255, ${nodeAlpha})`
        : `rgba(65, 142, 172, ${nodeAlpha})`;
      ctx.beginPath();
      ctx.arc(here.x, here.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reducedMotion.matches) frameId = requestAnimationFrame(draw);
  }

  function updateAnimation() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    if (reducedMotion.matches) draw(lastTime);
    else frameId = requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', event => {
    pointer.targetX = event.clientX / Math.max(width, 1);
    pointer.targetY = event.clientY / Math.max(height, 1);
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  reducedMotion.addEventListener('change', updateAnimation);
  new MutationObserver(updateAnimation).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  resize();
  updateAnimation();
})();
