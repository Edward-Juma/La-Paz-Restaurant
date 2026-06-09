 /* ═══════════════════════════════════════════════════════
   LA-PAZ RESTAURANT  ·  script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── PRELOADER ─────────────────────────────────────── */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('done');
    document.querySelector('.hero-bg').classList.add('loaded');
  }, 1800);
});

/* ─── NAVBAR SCROLL ──────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── HAMBURGER ──────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
  });
});

/* ─── ACTIVE NAV ─────────────────────────────────────── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

/* ─── SCROLL REVEAL ──────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.about-grid, .about-image-wrap, .menu-card, .feature-card, ' +
  '.cw-card, .review-card, .contact-grid, .gal-item, .stat, .section-header, .cw-cta-wrap'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ─── COUNTERS ───────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num[data-target]').forEach(n => animateCounter(n));
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

/* ─── MENU TABS ──────────────────────────────────────── */
const tabBtns   = document.querySelectorAll('.tab-btn');
const menuCards = document.querySelectorAll('.menu-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    menuCards.forEach(card => {
      card.classList.toggle('hide', tab !== 'all' && card.dataset.cat !== tab);
    });
  });
});

/* ─── REVIEWS CAROUSEL ───────────────────────────────── */
const track    = document.getElementById('reviewsTrack');
const dotsWrap = document.getElementById('reviewsDots');
const prevBtn  = document.getElementById('prevReview');
const nextBtn  = document.getElementById('nextReview');

if (track) {
  const cards = track.querySelectorAll('.review-card');
  let currentIdx = 0;
  let perView    = getPerView();
  let autoTimer  = null;

  function getPerView() {
    if (window.innerWidth < 640)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const total = Math.ceil(cards.length / perView);
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'reviews-dot' + (i === currentIdx ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.reviews-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIdx);
    });
  }

  function goTo(idx) {
    perView = getPerView();
    const maxIdx = Math.max(0, Math.ceil(cards.length / perView) - 1);
    currentIdx = Math.max(0, Math.min(idx, maxIdx));
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${currentIdx * perView * cardW}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => { goTo(currentIdx - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(currentIdx + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      const maxIdx = Math.max(0, Math.ceil(cards.length / perView) - 1);
      goTo(currentIdx >= maxIdx ? 0 : currentIdx + 1);
    }, 5000);
  }

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goTo(currentIdx + 1) : goTo(currentIdx - 1); resetAuto(); }
  });

  window.addEventListener('resize', () => {
    perView = getPerView();
    buildDots();
    goTo(Math.min(currentIdx, Math.ceil(cards.length / perView) - 1));
  });

  buildDots();
  resetAuto();
}

/* ─── ORDER MODAL ────────────────────────────────────── */
const modalOverlay = document.getElementById('orderModal');
const modalContent = document.getElementById('modalContent');

const menuData = {
  nyama:     { tag:'Grills · Signature',       name:'Nyama Choma, Ugali &amp; Kachumbari',    desc:'Slow-roasted Kenyan beef, charcoal-smoked to perfection. Served with hand-rolled ugali and freshly prepared tomato kachumbari.', price:'From Ksh 650' },
  mbuzi:     { tag:"Grills · Chef's Pick",     name:'Ugali Mbuzi Choma &amp; Kachumbari',     desc:'Tender goat choma, slow-fired over charcoal to a rich, smoky finish. Plated with soft ugali and vibrant kachumbari.',            price:'From Ksh 800' },
  wings:     { tag:'Mains · Crowd Favourite',  name:'Chicken Wings with Fries',               desc:'Crispy marinated chicken wings, fried golden and served with seasoned fries and our signature house dipping sauce.',               price:'From Ksh 550' },
  pizza:     { tag:'Mains · Italian Twist',    name:'Pizza Chicken Tikka',                    desc:'Stone-baked pizza loaded with spiced chicken tikka, mixed peppers, mozzarella, and a rich tomato base.',                          price:'From Ksh 700' },
  fries:     { tag:'Mains · Quick Bite',       name:'French Fries with Fried Meat',           desc:'Golden crispy fries paired with seasoned fried meat strips. Fast, delicious, and satisfying.',                                    price:'From Ksh 400' },
  tea:       { tag:'Drinks · Hot Beverages',   name:'African Tea &amp; Coffee',               desc:'Rich milky African chai, perfectly spiced. Or enjoy our freshly brewed barista coffee — Americano, latte, cappuccino, or black.', price:'From Ksh 80'  },
  sugarcane: { tag:'Drinks · Fresh &amp; Cold',name:'Sugarcane Juice with Ginger &amp; Lemon',desc:'Freshly pressed sugarcane juice, blended with zingy ginger and a squeeze of lemon. The ultimate Nairobi refresher.',             price:'From Ksh 120' },
  passion:   { tag:'Drinks · Tropical',        name:'Passion Fruit Juice',                    desc:'Locally sourced passion fruit blended to a tangy, sweet juice. Perfectly chilled and pairs brilliantly with any grill.',         price:'From Ksh 100' },
};

window.openModal = function(key) {
  const item = menuData[key];
  if (!item) return;
  modalContent.innerHTML = `
    <p class="modal-dish">${item.tag}</p>
    <h3>${item.name}</h3>
    <p>${item.desc}</p>
    <span class="modal-price">${item.price}</span>
    <div class="modal-actions">
      <a href="tel:+254720445347" class="btn btn-primary">
        <i class="fa-solid fa-phone"></i> Call to Order
      </a>
      <button class="btn btn-outline" onclick="closeModal()">Back to Menu</button>
    </div>
  `;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
};

modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown',   e => { if (e.key === 'Escape') closeModal(); });

/* ─── CONTACT FORM ───────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const msg  = contactForm.message.value.trim();
    if (!name || !msg) { alert('Please fill in your name and message.'); return; }
    const text   = encodeURIComponent(`Hi LA-PAZ! My name is ${name}.\n\n${msg}\n\n— Sent via LA-PAZ website`);
    const waLink = `https://wa.me/254720445347?text=${text}`;
    formSuccess.classList.remove('hidden');
    contactForm.reset();
    setTimeout(() => window.open(waLink, '_blank'), 600);
  });
}

/* ─── BACK TO TOP ────────────────────────────────────── */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─── PARALLAX HERO ──────────────────────────────────── */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      heroBg.style.transform = `scale(1) translateY(${window.scrollY * 0.28}px)`;
    }
  }, { passive: true });
}

/* ─── GALLERY LIGHTBOX ───────────────────────────────── */
document.querySelectorAll('.gal-item').forEach(item => {
  item.addEventListener('click', () => {
    const bgUrl = item.style.backgroundImage.slice(5, -2).split('?')[0];
    const label = item.querySelector('.gal-overlay span').textContent;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9500;
      background:rgba(10,4,0,.94);
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
      cursor:zoom-out;animation:fadeIn .25s ease;
    `;
    const img = document.createElement('img');
    img.src = bgUrl;
    img.alt = label;
    img.style.cssText = 'max-width:90vw;max-height:82vh;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.7);';
    const cap = document.createElement('p');
    cap.textContent = label;
    cap.style.cssText = "color:rgba(255,255,255,.7);font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;";
    overlay.appendChild(img);
    overlay.appendChild(cap);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    });
  });
});

// Inject fadeIn keyframe
const style = document.createElement('style');
style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
document.head.appendChild(style);

console.log('%c LA-PAZ RESTAURANT ', 'background:#C8950A;color:#1A0A00;font-size:18px;font-weight:bold;padding:8px 16px;border-radius:4px;', '\nKabete Gardens · 0720 445347');