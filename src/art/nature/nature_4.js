'use strict';
// Gambar alam buatan kode (4) — isi: lihat docs/CODEMAP.md
function artFossilBed() {
  const c = mkC(30, 28), ctx = c.getContext("2d");
  // Clay / limestone cliff face
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(4, 8, 22, 18);
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(4, 20, 22, 6);

  // Layered strata bands
  ctx.fillStyle = "#a1887f";
  ctx.fillRect(4, 11, 22, 2);
  ctx.fillRect(4, 16, 22, 2);

  // Ammonite fossil spiral shell carved in rock
  ctx.fillStyle = "#d7ccc8";
  ctx.beginPath();
  ctx.arc(15, 14, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#efebe9";
  ctx.beginPath();
  ctx.arc(15, 14, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#a1887f";
  ctx.beginPath();
  ctx.arc(15, 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Spiral ridges
  ctx.strokeStyle = "#8d6e63";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(15, 14, 4.5, 0, Math.PI * 1.5);
  ctx.stroke();

  // Ancient fish bone impression beside it
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(7, 18, 5, 1);
  ctx.fillRect(9, 17, 1, 3);
  ctx.fillRect(11, 17, 1, 3);

  // Limestone rubble pebbles at base
  ctx.fillStyle = "#bcaaa4";
  ctx.fillRect(5, 23, 3, 2);
  ctx.fillRect(19, 22, 4, 3);
  ctx.fillRect(23, 24, 3, 2);

  // Top moss on rock
  ctx.fillStyle = "#558b2f";
  ctx.fillRect(5, 7, 20, 2);

  return c;
}
