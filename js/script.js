document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ 1. Typewriter boot sequence ============ */
const bootLines = [
  { ok: true, text: 'loading profile ', field: 'noureldeen_mohammad.sys' },
  { ok: true, text: 'role: ', field: 'computer engineering student' },
  { ok: true, text: 'focus: ', field: 'information security' },
  { ok: true, text: 'location: ', field: 'Beirut, Lebanon' }
];
const bootEl = document.getElementById('bootText');

function typeBoot(){
  if(!bootEl) return;
  if(reducedMotion){
    bootEl.innerHTML = bootLines.map(l =>
      `<span class="ok">[ OK ]</span> ${l.text}<span class="field">${l.field}</span>`
    ).join('<br>') + '<span class="cursor"></span>';
    return;
  }
  let lineIndex = 0, charIndex = 0;

  function render(){
    let html = '';
    for(let i = 0; i < lineIndex; i++){
      const l = bootLines[i];
      html += `<span class="ok">[ OK ]</span> ${l.text}<span class="field">${l.field}</span><br>`;
    }
    const cur = bootLines[lineIndex];
    if(cur){
      const combined = cur.text + cur.field;
      const shown = combined.slice(0, charIndex);
      const textPart = shown.slice(0, cur.text.length);
      const fieldPart = shown.slice(cur.text.length);
      html += `<span class="ok">[ OK ]</span> ${textPart}<span class="field">${fieldPart}</span>`;
    } else {
      html += '<span class="cursor"></span>';
    }
    bootEl.innerHTML = html;
  }

  function typeChar(){
    if(lineIndex >= bootLines.length){
      render();
      return;
    }
    const line = bootLines[lineIndex];
    charIndex++;
    render();
    if(charIndex <= line.text.length + line.field.length){
      setTimeout(typeChar, 14);
    } else {
      lineIndex++;
      charIndex = 0;
      setTimeout(typeChar, 120);
    }
  }

  typeChar();
}
typeBoot();

/* ============ 2. Scroll-triggered reveal animations ============ */
const revealEls = document.querySelectorAll('.reveal');
if(reducedMotion){
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const idx = parseInt(entry.target.dataset.index || '0', 10);
        entry.target.style.transitionDelay = (idx * 90) + 'ms';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
}

/* ============ 3. Tilt + glow on cards ============ */
if(!reducedMotion){
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

/* ============ 4. Circuit particle background (hero canvas) ============ */
const canvas = document.getElementById('particles');
if(canvas && !reducedMotion){
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let particles = [];
  let w, h;

  function resizeCanvas(){
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    const count = Math.min(48, Math.floor((w * h) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6
    }));
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function tick(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
    });
    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 130){
          ctx.strokeStyle = `rgba(217,142,76,${(1 - dist / 130) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      ctx.fillStyle = 'rgba(79,179,169,0.7)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
}

/* ============ 5. CGPA counter animation ============ */
const cgpaEl = document.getElementById('cgpaValue');
if(cgpaEl){
  const target = parseFloat(cgpaEl.dataset.target || '0');
  if(reducedMotion){
    cgpaEl.textContent = target.toFixed(2);
  } else {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          let start = null;
          const duration = 1200;
          function step(ts){
            if(!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            cgpaEl.textContent = (target * progress).toFixed(2);
            if(progress < 1) requestAnimationFrame(step);
            else cgpaEl.textContent = target.toFixed(2);
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterObserver.observe(cgpaEl);
  }
}

/* ============ 6. Trace line vias + active section tracking ============ */
const sections = document.querySelectorAll('section, header.hero');
const trace = document.getElementById('traceLine');
const navLinks = document.querySelectorAll('.navlinks a');
const vias = [];

function layoutVias(){
  vias.forEach(v => v.el.remove());
  vias.length = 0;
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const via = document.createElement('div');
    via.className = 'via';
    via.style.top = top + 'px';
    trace.appendChild(via);
    vias.push({ el: via, top, section: sec });
  });
}
layoutVias();
window.addEventListener('resize', layoutVias);

function updateActive(){
  let closest = null, closestDist = Infinity;
  vias.forEach(v => {
    const dist = Math.abs(v.top - window.scrollY - 100);
    if(dist < closestDist){ closestDist = dist; closest = v; }
  });
  vias.forEach(v => v.el.classList.toggle('active', v === closest));

  if(closest){
    const id = closest.section.id;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  const toTop = document.getElementById('toTop');
  if(toTop){
    toTop.classList.toggle('show', window.scrollY > 600);
  }
}
window.addEventListener('scroll', updateActive);
updateActive();

/* ============ 7. Back to top button ============ */
const toTopBtn = document.getElementById('toTop');
if(toTopBtn){
  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
}
