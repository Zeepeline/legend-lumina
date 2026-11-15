'use strict';
// Dermaga papan berlentera & perahu kayu (gaya tepi air Verdant; referensi pemilik: kolam bertepi batu + dermaga + perahu).
// Titik pasang (origin .5, 1) = pangkal dermaga di darat; papan menjorok ke utara (ke air).
function artDock() {
  const [c, x] = mk(44, 58);
  for (const px of [6, 34]) for (const py of [8, 30]) { fr(x, '#3e2614', px, py, 5, 14); fr(x, '#2a1a0e', px, py + 12, 5, 2); } // tiang masuk air
  fr(x, '#3b2618', 3, 4, 38, 46);                                             // garis luar
  for (let i = 0; i < 9; i++) {                                               // papan melintang
    const y = 5 + i * 5; fr(x, i % 2 ? '#a8703e' : '#b67d48', 4, y, 36, 4); fr(x, '#c8945a', 4, y, 36, 1); fr(x, '#6e4222', 4, y + 4, 36, 1);
    fr(x, '#6e4222', 11 + (i % 3) * 9, y + 1, 1, 2);                          // paku & serat
  }
  fr(x, '#5e3b20', 3, 49, 38, 6); fr(x, '#7a5230', 3, 49, 38, 2);             // pangkal di tepi
  fr(x, '#4a2e18', 34, 0, 4, 22); fr(x, '#6e4222', 35, 0, 2, 22);             // tiang lentera
  fr(x, '#4a2e18', 26, 1, 10, 2); fr(x, '#3b2618', 27, 3, 1, 3);              // lengan lentera
  fr(x, '#2a1a0e', 25, 6, 5, 6); fr(x, '#ffd36a', 26, 7, 3, 4); fr(x, '#fff3c4', 27, 8, 1, 2); // lentera menyala
  return c;
}
function artBoat() {
  const [c, x] = mk(40, 20), g = x;
  g.fillStyle = 'rgba(20,50,100,.35)'; g.beginPath(); g.ellipse(20, 13, 19, 6, 0, 0, 6.29); g.fill();          // bayangan di air
  g.fillStyle = '#3b2618'; g.beginPath(); g.ellipse(20, 10, 18, 7, 0, 0, 6.29); g.fill();                     // garis luar lambung
  g.fillStyle = '#8a5a32'; g.beginPath(); g.ellipse(20, 10, 16.5, 5.8, 0, 0, 6.29); g.fill();
  g.fillStyle = '#5e3b20'; g.beginPath(); g.ellipse(20, 10.5, 13, 3.8, 0, 0, 6.29); g.fill();                 // dalam perahu
  for (const bx of [13, 26]) { fr(x, '#a8703e', bx, 6, 3, 9); fr(x, '#c8945a', bx, 6, 1, 9); }                 // bangku
  fr(x, '#c8945a', 8, 4, 24, 1);                                                                                 // tepi atas terang
  return c;
}
