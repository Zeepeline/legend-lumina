'use strict';
// Jam & siang-malam
// ---------------- WAKTU, PENCAPAIAN, BAYANGAN ----------------
function nightAmt() { const h = S.time, N = .68; if (h >= 20 || h < 4.5) return N; if (h >= 17) return (h - 17) / 3 * N; if (h < 6.5) return (6.5 - h) / 2 * N; return 0; }
function isNight() { return S.time >= 19.5 || S.time < 5; }
function gameHours() { return S.day * 24 + S.time; }
function lerpCol(a, b, t) { const c = (sh) => Math.round(((a >> sh) & 255) + ((((b >> sh) & 255) - ((a >> sh) & 255)) * t)); return (c(16) << 16) | (c(8) << 8) | c(0); }
let _clk = '';
function updClock() { const e = $('hClock'); if (!e) return; const h = Math.floor(S.time), m = Math.floor((S.time % 1) * 6) * 10, t = (isNight() ? '☾ ' : '☀ ') + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); if (t !== _clk) { _clk = t; e.textContent = t; } }
