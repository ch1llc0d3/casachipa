// ── Settings you will want to change ──────────────────────────────
const CONFIG = {
  whatsapp: '376000000',        // TODO: your number with country code, digits only (Andorra = 376)
  pricePerBag: 12,              // TODO: price in euros per bag of 12
  deliveryMinBags: 10,          // home delivery only for orders of this many bags or more
  instagram: 'https://instagram.com/casachipa.andorra', // TODO: your Instagram URL
  maxBags: 20
};
// ──────────────────────────────────────────────────────────────────

const I18N = window.CC_I18N;
const SUPPORTED = Object.keys(I18N);
const state = {
  lang: 'es',
  qty: 1,
  mode: 'pickup'
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.es[key] || key;
}

function formatPrice(n) {
  // Spanish/Catalan use "12 €"; English uses "€12".
  const num = Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', state.lang === 'en' ? '.' : ',');
  return state.lang === 'en' ? `€${num}` : `${num} €`;
}

function buildMessage() {
  const bags = state.qty === 1 ? t('msg.bag') : t('msg.bags');
  const how = state.mode === 'delivery' ? t('msg.delivery') : t('msg.pickup');
  return `${t('msg.hi')} ${state.qty} ${bags}. ${how} ${t('msg.bye')}`;
}

function waUrl(text) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

function render() {
  // Static strings
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.documentElement.lang = state.lang;
  $('meta[name="description"]').setAttribute('content', t('meta.desc'));

  // Aria labels
  $('.lang').setAttribute('aria-label', t('aria.lang'));
  $('.site-nav').setAttribute('aria-label', t('nav.label'));
  $('#themeToggle').setAttribute('aria-label', t('aria.theme'));
  $('[data-delta="-1"]').setAttribute('aria-label', t('aria.less'));
  $('[data-delta="1"]').setAttribute('aria-label', t('aria.more'));

  // Language buttons
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));

  // Prices
  $$('[data-price]').forEach(el => { el.textContent = formatPrice(CONFIG.pricePerBag); });
  $$('[data-total]').forEach(el => { el.textContent = formatPrice(CONFIG.pricePerBag * state.qty); });

  // Order
  const deliveryOk = state.qty >= CONFIG.deliveryMinBags;
  if (!deliveryOk && state.mode === 'delivery') state.mode = 'pickup';
  const deliveryInput = $('input[name="mode"][value="delivery"]');
  deliveryInput.disabled = !deliveryOk;
  deliveryInput.checked = state.mode === 'delivery';
  $('input[name="mode"][value="pickup"]').checked = state.mode === 'pickup';
  $('#deliveryHint').textContent = deliveryOk
    ? t('order.deliveryOk')
    : t(CONFIG.deliveryMinBags - state.qty === 1 ? 'order.deliveryMin1' : 'order.deliveryMin')
        .replace('{min}', String(CONFIG.deliveryMinBags)).replace('{missing}', String(CONFIG.deliveryMinBags - state.qty));
  $('#qtyOut').textContent = String(state.qty);
  $('[data-delta="-1"]').disabled = state.qty <= 1;
  $('[data-delta="1"]').disabled = state.qty >= CONFIG.maxBags;
  const msg = buildMessage();
  $('#chatBubble').textContent = msg;
  $('#waLink').href = waUrl(msg);
  $('#waFooter').href = `https://wa.me/${CONFIG.whatsapp}`;
  $('#igLink').href = CONFIG.instagram;
}

function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  state.lang = lang;
  try { localStorage.setItem('cc-lang', lang); } catch (e) {}
  render();
}

function detectLang() {
  try {
    const saved = localStorage.getItem('cc-lang');
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch (e) {}
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : 'es';
}

// Theme: follows system unless the user has toggled.
function currentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit) return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('cc-theme', next); } catch (e) {}
}

// Wire up
$$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
$('#themeToggle').addEventListener('click', toggleTheme);
$$('.qty-btn').forEach(b => b.addEventListener('click', () => {
  state.qty = Math.min(CONFIG.maxBags, Math.max(1, state.qty + Number(b.dataset.delta)));
  render();
}));
$$('input[name="mode"]').forEach(r => r.addEventListener('change', () => { state.mode = r.value; render(); }));
$('#orderForm').addEventListener('submit', e => e.preventDefault());
$('#year').textContent = String(new Date().getFullYear());

state.lang = detectLang();
render();

// Keep the mobile shortcut out of the way while the order form is visible.
if ('IntersectionObserver' in window) {
  const dock = $('.mobile-order');
  new IntersectionObserver(([entry]) => {
    dock.hidden = entry.isIntersecting;
  }, { threshold: 0 }).observe($('#pedir'));
}
