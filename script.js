// ============================================================
// NADYA & FADLI — DIGITAL WEDDING INVITATION
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzQf1AV4PI7LoMi-uVN3y2XZFI73IEt2Qcz9lnWD8pRAaRQRxR7pDucMPilH4JXXfJ/exec';
const WEDDING_DATE = new Date('2026-10-17T08:00:00+07:00').getTime();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ---------- Loading / opening ----------
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => $('#loading-screen')?.classList.add('hidden'), 1200);

  const guest = getGuestNameFromURL();
  if (guest) updateGuestName(guest);

  initNavigation();
  initCountdown();
  initMusic();
  initCopyButtons();
  initRSVP();
  loadRSVP();
  initStoryTypewriter();
  initMascot();
  initCursorHeart();
  initTapHearts();
  initPolaroid();

  if (window.AOS) AOS.init({ duration: 700, once: true, offset: 40 });
});

// ---------- Buka Undangan + Amplop terbuka ----------
$('#enter-invitation')?.addEventListener('click', () => {
  const envelopeWrap = document.querySelector('.envelope-wrap');
  if (envelopeWrap) {
    envelopeWrap.classList.add('open');

    setTimeout(() => {
      $('#prd-screen')?.classList.add('hidden');
      $('#header-nav')?.classList.add('visible');
      document.body.classList.remove('locked');
      const bgm = $('#bgm');
      bgm?.play().then(() => $('#music-toggle')?.classList.add('playing')).catch(() => {});
    }, 700);
  } else {
    $('#prd-screen')?.classList.add('hidden');
    $('#header-nav')?.classList.add('visible');
    document.body.classList.remove('locked');
    const bgm = $('#bgm');
    bgm?.play().then(() => $('#music-toggle')?.classList.add('playing')).catch(() => {});
  }
});

$('#open-invitation')?.addEventListener('click', () => $('#info')?.scrollIntoView({ behavior: 'smooth' }));

function getGuestNameFromURL() {
  const value = new URLSearchParams(location.search).get('to');
  return value ? decodeURIComponent(value.replace(/\+/g, ' ')).trim() : null;
}

function updateGuestName(name) {
  if ($('#home-guest-name')) $('#home-guest-name').textContent = name;
  if ($('#nav-guest-name')) $('#nav-guest-name').textContent = name;
}

// ---------- Navigation ----------
function initNavigation() {
  const hamburger = $('#hamburger-btn');
  const menu = $('#nav-menu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    menu?.classList.toggle('active');
  });

  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    $$('.nav-link').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    menu?.classList.remove('active');
    hamburger?.classList.remove('active');
  }));

  const sections = [...document.querySelectorAll('section[id]')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: .45 });
  sections.forEach(section => observer.observe(section));

  window.addEventListener('scroll', () => {
    $('#scrollTopBtn')?.classList.toggle('show', scrollY > 600);
  }, { passive: true });
  $('#scrollTopBtn')?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---------- Countdown ----------
function initCountdown() {
  const update = () => {
    const diff = WEDDING_DATE - Date.now();
    const values = diff <= 0 ? [0,0,0,0] : [
      Math.floor(diff / 86400000),
      Math.floor((diff % 86400000) / 3600000),
      Math.floor((diff % 3600000) / 60000),
      Math.floor((diff % 60000) / 1000)
    ];
    ['days','hours','minutes','seconds'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(values[i]).padStart(2,'0');
    });
  };
  update();
  setInterval(update, 1000);
}

// ---------- Music ----------
function initMusic() {
  const toggle = $('#music-toggle');
  const audio = $('#bgm');
  if (!toggle || !audio) return;
  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => toggle.classList.add('playing')).catch(() => {});
      toggle.innerHTML = '<i class="fa-solid fa-music"></i>';
    } else {
      audio.pause();
      toggle.classList.remove('playing');
      toggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    }
  });
}

// ---------- Story Typewriter ----------
function initStoryTypewriter() {
  const target = document.getElementById('story-typewriter');
  if (!target) return;

  const fullText = target.dataset.text || target.textContent || '';
  const cursor = document.querySelector('.typewriter-cursor');

  target.textContent = '';
  let index = 0;

  const startTyping = () => {
    const speed = 35;
    const tick = () => {
      if (index < fullText.length) {
        target.textContent += fullText.charAt(index);
        index++;
        setTimeout(tick, speed);
      } else {
        setTimeout(() => cursor?.classList.add('hidden'), 2000);
      }
    };
    tick();
  };

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startTyping();
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(target);
  } else {
    startTyping();
  }
}

// ---------- Mascot Cupid ----------
function initMascot() {
  const mascot = document.getElementById('mascot');
  if (!mascot) return;

  let lastScroll = 0;
  let hideTimer;

  const showMascot = () => {
    mascot.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => mascot.classList.remove('show'), 3000);
  };

  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScroll > 2500) {
      lastScroll = now;
      showMascot();
    }
  }, { passive: true });

  setTimeout(showMascot, 4000);
}

// ---------- Kursor Hati ----------
function initCursorHeart() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cursor = document.getElementById('cursor-heart');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let lastTrailX = 0, lastTrailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.classList.add('active');
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    const dx = mouseX - lastTrailX;
    const dy = mouseY - lastTrailY;
    if (Math.sqrt(dx * dx + dy * dy) > 12) {
      lastTrailX = mouseX;
      lastTrailY = mouseY;
      createTrailHeart(mouseX, mouseY);
    }
  });

  document.addEventListener('mouseleave', () => cursor.classList.remove('active'));
}

function createTrailHeart(x, y) {
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.style.left = x + 'px';
  trail.style.top = y + 'px';
  trail.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 21 C12 15 4 13 2 18 C0 23 8 26 12 30 C16 26 24 23 22 18 C20 13 12 15 12 21 Z" fill="#e58aa8"/></svg>`;
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 800);
}

// ---------- Tap Hearts ----------
function initTapHearts() {
  document.addEventListener('click', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      setTimeout(() => createTapHeart(e.clientX, e.clientY), i * 90);
    }
  });
}

function createTapHeart(x, y) {
  const layer = document.getElementById('tap-hearts-layer');
  if (!layer) return;

  const heart = document.createElement('div');
  heart.className = 'tap-heart';

  const offsetX = (Math.random() - 0.5) * 40;
  const offsetY = (Math.random() - 0.5) * 30;

  heart.style.left = (x + offsetX) + 'px';
  heart.style.top = (y + offsetY) + 'px';
  heart.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 21 C12 15 4 13 2 18 C0 23 8 26 12 30 C16 26 24 23 22 18 C20 13 12 15 12 21 Z" fill="#e58aa8"/></svg>`;

  layer.appendChild(heart);
  setTimeout(() => heart.remove(), 1300);
}

// ---------- Polaroid — efek klik kamera ----------
function initPolaroid() {
  const polaroid = document.getElementById('polaroid');
  const flash = document.getElementById('camera-flash');
  if (!polaroid) return;

  const triggerFlash = () => {
    polaroid.classList.add('flash');
    flash?.classList.add('fire');

    const rect = polaroid.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createTapHeart(
        cx + (Math.random() - 0.5) * 200,
        cy + (Math.random() - 0.5) * 200
      ), i * 60);
    }

    setTimeout(() => {
      polaroid.classList.remove('flash');
      flash?.classList.remove('fire');
    }, 600);
  };

  polaroid.addEventListener('click', triggerFlash);
  polaroid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFlash();
    }
  });
}

// ---------- Confetti ----------
function fireConfetti() {
  const layer = document.getElementById('confetti-layer');
  if (!layer) return;

  const colors = ['#e58aa8', '#f6c56e', '#c8a4d4', '#a8d4c8', '#8c3d50', '#f6a5c0'];
  const total = 60;

  for (let i = 0; i < total; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2.5 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 0.6) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    layer.appendChild(piece);

    setTimeout(() => piece.remove(), 5000);
  }
}

// ---------- Fireworks ----------
function fireFireworks(x, y) {
  const layer = document.getElementById('fireworks-layer');
  if (!layer) return;

  const colors = ['#f6c56e', '#e58aa8', '#c8a4d4', '#a8d4c8', '#fff5d4'];
  const total = 14;

  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i) / total + Math.random() * 0.3;
    const distance = 40 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    const spark = document.createElement('div');
    spark.className = 'firework-spark';
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    spark.style.background = colors[Math.floor(Math.random() * colors.length)];
    spark.style.setProperty('--dx', dx + 'px');
    spark.style.setProperty('--dy', dy + 'px');
    spark.style.boxShadow = `0 0 8px ${spark.style.background}`;

    layer.appendChild(spark);
    setTimeout(() => spark.remove(), 1000);
  }
}

// ---------- Copy bank account + Fireworks ----------
function initCopyButtons() {
  $$('.copy-btn').forEach(btn => btn.addEventListener('click', async (e) => {
    const number = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(number);
      const old = btn.textContent;
      btn.textContent = 'Tersalin';
      setTimeout(() => btn.textContent = old, 1600);

      const rect = btn.getBoundingClientRect();
      fireFireworks(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } catch {
      alert(`Nomor rekening: ${number}`);
    }
  }));
}

// ---------- RSVP / Google Sheets ----------
const rsvpForm = $('#rsvp-form');
const rsvpBody = $('#rsvp-table-body');
const rsvpMessage = $('#rsvp-status-message');

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '-';
  return div.innerHTML;
}
function isOnline() { return navigator.onLine; }

async function loadRSVP() {
  if (!rsvpBody || !isOnline()) return;
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getData&_=${Date.now()}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!result.success || !Array.isArray(result.data) || !result.data.length) {
      rsvpBody.innerHTML = '<tr><td colspan="4">Belum ada konfirmasi kehadiran.</td></tr>';
      return;
    }
    rsvpBody.innerHTML = result.data.map(row => {
      let status = row.Status_Kehadiran || row.status || '-';
      return `<tr><td>${escapeHtml(row.Nama_Tamu || row.name || '-')}</td><td>${escapeHtml(status)}</td><td>${escapeHtml(String(row.Jumlah_Tamu || row.guests || '1'))}</td><td>${escapeHtml(row.Keterangan || row.message || '-')}</td></tr>`;
    }).join('');
  } catch (error) {
    console.error('RSVP load error:', error);
    rsvpBody.innerHTML = '<tr><td colspan="4">Data RSVP belum dapat dimuat.</td></tr>';
  }
}

async function submitRSVP(data) {
  if (!isOnline()) throw new Error('Tidak ada koneksi internet');
  const body = new URLSearchParams({ Nama_Tamu:data.name, Status_Kehadiran:data.status, Jumlah_Tamu:data.guests, Keterangan:data.message });
  await fetch(APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:body.toString() });
}

function initRSVP() {
  rsvpForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name: $('#rsvp-name').value.trim(),
      status: $('#rsvp-status').value,
      guests: $('#rsvp-guests').value || '1',
      message: $('#rsvp-message').value.trim()
    };
    if (!data.name || !data.status) {
      rsvpMessage.className = 'rsvp-message error';
      rsvpMessage.textContent = 'Mohon lengkapi nama dan status kehadiran.';
      return;
    }
    const btn = rsvpForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
    rsvpMessage.className = 'rsvp-message success';
    rsvpMessage.textContent = 'Mengirim konfirmasi...';
    try {
      await submitRSVP(data);
      rsvpForm.reset();
      rsvpMessage.textContent = 'Terima kasih. Konfirmasi Anda telah tercatat.';
      updateGuestName(data.name);
      fireConfetti();
      setTimeout(loadRSVP, 1000);
      setTimeout(() => rsvpMessage.className = 'rsvp-message', 4500);
    } catch (error) {
      rsvpMessage.className = 'rsvp-message error';
      rsvpMessage.textContent = 'Gagal mengirim. Silakan coba kembali.';
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fa-regular fa-paper-plane"></i> Kirim Konfirmasi';
    }
  });
}

setInterval(loadRSVP, 30000);
window.addEventListener('online', loadRSVP);