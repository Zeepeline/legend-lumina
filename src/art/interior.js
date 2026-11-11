'use strict';
// Lantai & perabot interior
// ---- interior ----
const FURN = { bed: [22, 36, 1], table: [34, 22, 1], shelf: [36, 28, 1], counter: [80, 16, 1], rug: [56, 34, 0], stove: [30, 30, 1] };
function drawFurn(x, t, X, Y, v) {
  const [w, h] = FURN[t], L = '#4a2e22';
  const box = (a, b, ww, hh, col) => { fr(x, L, a - 1, b - 1, ww + 2, hh + 2); fr(x, col, a, b, ww, hh); };
  if (t === 'rug') { fr(x, '#f0c070', X, Y, w, h); fr(x, v ? '#5a8ad8' : '#c8504a', X + 2, Y + 2, w - 4, h - 4); fr(x, '#f0c070', X + 6, Y + 6, w - 12, h - 12); fr(x, v ? '#7aa8e8' : '#e0705a', X + 8, Y + 8, w - 16, h - 16); }
  if (t === 'bed') { box(X, Y, w, h, '#a06a52'); fr(x, '#f8f0e0', X + 2, Y + 3, w - 4, h - 5); fr(x, '#ffffff', X + 4, Y + 4, w - 8, 7); fr(x, v ? '#5a8ad8' : '#d85a5a', X + 2, Y + 14, w - 4, h - 16); fr(x, v ? '#8ab0f0' : '#f08a7a', X + 2, Y + 14, w - 4, 2); fr(x, '#7a5446', X, Y + h - 3, w, 3); }
  if (t === 'table') { box(X, Y, w, h, '#c48c66'); fr(x, '#dca87e', X, Y, w, 2); fr(x, '#7a5446', X, Y + h - 5, w, 5); fr(x, '#ffffff', X + 6, Y + 5, 6, 5); fr(x, '#e85a4a', X + 20, Y + 6, 5, 4); }
  if (t === 'shelf') { box(X, Y, w, h, '#7a5446'); const bc = ['#d85a5a', '#5a8ad8', '#5fbf68', '#f0c040', '#b46ae0', '#f4ead8']; for (let r = 0; r < 2; r++) { fr(x, '#4a2e22', X + 2, Y + 3 + r * 12, w - 4, 10); for (let i = 0; i < 10; i++) fr(x, bc[(i * 7 + r * 3 + v) % 6], X + 3 + i * 3, Y + 4 + r * 12 + (i % 3 === 0 ? 2 : 0), 2, 9 - (i % 3 === 0 ? 2 : 0)); } }
  if (t === 'counter') { box(X, Y, w, h, '#a06a52'); fr(x, '#c48c66', X, Y, w, 5); fr(x, '#dca87e', X, Y, w, 1); for (let i = 8; i < w; i += 12) fr(x, '#7a5446', X + i, Y + 6, 1, h - 6); }
  if (t === 'stove') { box(X, Y, w, h, '#9a8a84'); for (let i = 0; i < 4; i++) fr(x, '#6a5a5a', X, Y + 6 + i * 6, w, 1); fr(x, '#2a1a1a', X + 6, Y + 12, w - 12, 14); fr(x, '#ff8a2a', X + 8, Y + 17, w - 16, 9); fr(x, '#ffd84a', X + 11, Y + 20, w - 22, 6); }
}
function genRoom(M) {
  const [c, x] = mk(M.w, M.h), [rx, ry, rw, rh] = M.room;
  fr(x, '#140e0c', 0, 0, M.w, M.h);
  fr(x, '#5a3a30', rx - 5, ry - 41, rw + 10, rh + 46); 
  for (let y = ry; y < ry + rh + 30; y += 8) { const r = Math.floor(y / 8); for (let X = rx; X < rx + rw; X++) { if (y >= ry + rh && (X < 140 || X >= 180)) continue; const seam = (X + (r % 2) * 13) % 26 === 0; const F = M.floor || ['#9a7248', '#c89a62', '#d0a46c', '#a87e50']; fr(x, seam ? F[0] : r % 2 ? F[1] : F[2], X, y, 1, 7); fr(x, F[3], X, y + 7, 1, 1); } }
  fr(x, '#5a3a30', rx - 5, ry + rh, 140 - rx + 5, 5); fr(x, '#5a3a30', 180, ry + rh, rx + rw - 180 + 5, 5);
  fr(x, M.wallc || '#ecdcb8', rx, ry - 36, rw, 36); fr(x, '#c8a878', rx, ry - 12, rw, 12); fr(x, '#a8845a', rx, ry - 12, rw, 1); fr(x, '#6e4222', rx, ry - 2, rw, 2);
  for (let X = rx + 8; X < rx + rw; X += 16) fr(x, '#b89668', X, ry - 11, 1, 9);
  for (const wx of M.windows || [150]) { fr(x, '#6e4222', wx - 1, ry - 32, 22, 18); fr(x, '#8fd0ee', wx, ry - 31, 20, 16); fr(x, '#d8f6ff', wx + 2, ry - 29, 5, 6); fr(x, '#6e4222', wx + 9, ry - 31, 2, 16); }
  for (const f of M.furn || []) drawFurn(x, f[0], f[1], f[2], f[3] || 0);
  return c;
}
