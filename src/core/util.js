'use strict';
// Konstanta layar & util kecil
// =====================================================================
//  CORE: util, audio, input, layout
// =====================================================================
// Tata letak: 'mendatar' (bawaan, layar penuh landscape + kontrol transparan di atas gambar, gaya Genshin/MLBB) atau 'tegak' (lama)
const IS_TOUCH = matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
// pilihan 'lumina_layout': 'auto' (bawaan: HP tegak → tata letak tegak, HP mendatar → mendatar penuh), 'mendatar', 'tegak'
const LAYOUT_PREF = (() => { try { return localStorage.getItem('lumina_layout') || 'auto'; } catch (_) { return 'auto'; } })();
const LAYOUT_FULL = LAYOUT_PREF === 'tegak' ? false : LAYOUT_PREF === 'mendatar' ? true : !(IS_TOUCH && innerHeight > innerWidth);
// lebar dunia yang terlihat mengikuti rasio layar (16:9 s.d. ±21:9), tinggi tetap 216 → gambar mengisi layar tanpa pita hitam
const VW = (() => {
  if (!LAYOUT_FULL) return 384;
  const r = IS_TOUCH ? Math.max(innerWidth, innerHeight) / Math.min(innerWidth, innerHeight) : innerWidth / innerHeight;
  return Math.max(384, Math.min(512, Math.round(216 * r / 2) * 2));
})();
const VH = (() => {
  if (LAYOUT_FULL || !IS_TOUCH || innerWidth > innerHeight) return 216;
  return Math.max(216, Math.min(460, Math.round(VW * (innerHeight - 236) / (innerWidth - 10)))); /* tegak: dunia lebih tinggi */
})();
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const $ = id => document.getElementById(id);
const SCREEN = $('screen'), UI = $('ui'), FADE = $('fade');
