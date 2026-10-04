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
  initGallery();
  initCopyButtons();
  initRSVP();
  loadRSVP();
  initStoryTypewriter();

  if (window.AOS) AOS.init({ duration: 700, once: true, offset: 40 });
});

$('#enter-invitation')?.addEventListener('click', () => {
  $('#prd-screen')?.classList.add('hidden');
  $('#header-nav')?.classList.add('visible');
  document.body.classList.remove('locked');
  const bgm = $('#bgm');
  bgm?.play().then(() => $('#music-toggle')?.classList.add('playing')).catch(() => {});
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

// ---------- Gallery ----------
const galleryImages = [
  'assets/galeri/1.png','assets/galeri/2.png','assets/galeri/3.png','assets/galeri/4.png',
  'assets/galeri/5.png','assets/galeri/6.png','assets/galeri/7.png','assets/galeri/8.png'
];
const galleryLabels = ['Momen Bahagia','Kebersamaan','Cinta','Tawa','Kenangan','Janji','Doa','Harapan'];
let galleryIndex = 0;

function initGallery() {
  const grid = $('#gallery-grid');
  if (!grid) return;

  grid.innerHTML = galleryImages.map((src, i) => `
    <div class="gallery-item" data-index="${i}">
      <img src="${src}" alt="${galleryLabels[i]}" loading="lazy" onerror="this.style.opacity='.25'" />
      <div class="gallery-overlay"><span>${galleryLabels[i]}</span></div>
      <span class="gallery-number">${String(i+1).padStart(2,'0')}</span>
    </div>`).join('');

  $$('.gallery-item').forEach(item => item.addEventListener('click', () => openLightbox(Number(item.dataset.index))));

  $('#lightbox-close')?.addEventListener('click', closeLightbox);
  $('#lightbox-prev')?.addEventListener('click', () => openLightbox((galleryIndex - 1 + galleryImages.length) % galleryImages.length));
  $('#lightbox-next')?.addEventListener('click', () => openLightbox((galleryIndex + 1) % galleryImages.length));
  $('#lightbox-modal')?.addEventListener('click', e => { if (e.target.id === 'lightbox-modal') closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!$('#lightbox-modal')?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox((galleryIndex - 1 + galleryImages.length) % galleryImages.length);
    if (e.key === 'ArrowRight') openLightbox((galleryIndex + 1) % galleryImages.length);
  });

  // ---------- Share handler ----------
  const shareUrl = () => encodeURIComponent(location.href);
  const shareText = () => encodeURIComponent('Undangan Pernikahan Nadya & Fadli — 17 Oktober 2026');

  $('#share-wa')?.addEventListener('click', () => {
    window.open(`https://wa.me/?text=${shareText()}%20${shareUrl()}`, '_blank');
  });
  $('#share-fb')?.addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl()}`, '_blank');
  });
  $('#share-tg')?.addEventListener('click', () => {
    window.open(`https://t.me/share/url?url=${shareUrl()}&text=${shareText()}`, '_blank');
  });
  $('#share-copy')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      const btn = $('#share-copy');
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-link"></i>', 1500);
    } catch {}
  });

  initGalleryAnimation();
}

// ============================================================
// GALERI — ANIMASI MASUK (desktop) + AUTO-SCROLL (mobile)
// ============================================================
function initGalleryAnimation() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const items = grid.querySelectorAll('.gallery-item');
  if (!items.length) return;

  if (items[0].dataset.animated === 'true') return;

  const isMobile = window.matchMedia('(max-width: 850px)').matches;

  if (isMobile) {
    const originalItems = Array.from(items);
    originalItems.forEach((el) => {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      grid.appendChild(clone);
    });

    grid.classList.add('is-marquee');
    originalItems.forEach((el) => (el.dataset.animated = 'true'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  document.body.classList.add('js-ready');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  items.forEach((el) => {
    el.dataset.animated = 'true';
    observer.observe(el);
  });
}

window.addEventListener('resize', () => {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  const isMarquee = grid.classList.contains('is-marquee');
  const isMobile = window.matchMedia('(max-width: 850px)').matches;

  if (!isMobile && isMarquee) {
    grid.classList.remove('is-marquee');
    grid.querySelectorAll('.gallery-item[aria-hidden="true"]').forEach(el => el.remove());
    grid.querySelectorAll('.gallery-item').forEach(el => { delete el.dataset.animated; });
    initGalleryAnimation();
  }

  if (isMobile && !isMarquee) {
    grid.querySelectorAll('.gallery-item').forEach(el => { delete el.dataset.animated; });
    initGalleryAnimation();
  }
});

function openLightbox(index) {
  galleryIndex = index;
  const modal = $('#lightbox-modal');
  const img = $('#lightbox-img');
  if (!modal || !img) return;
  img.src = galleryImages[index];
  img.alt = galleryLabels[index];
  $('#lightbox-caption').textContent = galleryLabels[index];
  modal.classList.add('active');
  document.body.classList.add('locked');
}

function closeLightbox() {
  $('#lightbox-modal')?.classList.remove('active');
  document.body.classList.remove('locked');
}

// ============================================================
// STORY — EFEK KETIKAN (TYPEWRITER)
// ============================================================
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

// ---------- Copy bank account ----------
function initCopyButtons() {
  $$('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    const number = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(number);
      const old = btn.textContent;
      btn.textContent = 'Tersalin';
      setTimeout(() => btn.textContent = old, 1600);
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
      if (status === 'Hadir') status = 'Hadir';
      else if (status === 'Tidak Hadir') status = 'Tidak Hadir';
      else if (status === 'Ragu') status = 'Ragu';
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