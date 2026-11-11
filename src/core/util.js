'use strict';
// Konstanta layar & util kecil
// =====================================================================
//  CORE: util, audio, input, layout
// =====================================================================
const VW = 288;
const VH = (() => { const t = matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints > 0); if (!t || innerWidth > innerHeight) return 224; return Math.max(224, Math.min(320, Math.round(VW * (innerHeight - 236) / (innerWidth - 10)))); })();
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const $ = id => document.getElementById(id);
const SCREEN = $('screen'), UI = $('ui'), FADE = $('fade');
