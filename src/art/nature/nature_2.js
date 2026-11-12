'use strict';
// Gambar alam buatan kode (2) — isi: lihat docs/CODEMAP.md
function artCanaryPerch() {
  const [c, x] = mk(24, 26);
  // Ground mossy mound
  ellF(x, '#4a5440', 12, 22, 9, 3.5);

  // Slender willow wood pole / perch branch
  fr(x, '#6a5238', 11, 6, 3, 17);
  fr(x, '#8a6a48', 12, 6, 1, 17);
  // Horizontal branch fork
  fr(x, '#6a5238', 5, 10, 14, 2);
  fr(x, '#8a6a48', 6, 10, 12, 1);

  // Little yellow canary bird perched on left of branch
  ellF(x, '#ffcf30', 8, 7, 3.5, 2.8); // yellow body
  ellF(x, '#ffe468', 8, 6, 2.5, 1.8);
  px(x, '#2a1a10', 6, 6); // eye
  px(x, '#f07820', 5, 7); // tiny orange beak
  px(x, '#e0a818', 10, 8); // wing / tail
  px(x, '#4a3218', 7, 10); // claw on branch
  px(x, '#4a3218', 9, 10);

  // Little green willow leaf sprouting
  px(x, '#58b858', 17, 9);
  px(x, '#388838', 18, 10);

  return outline(c, '#1e1c18');
}

function artWoodlandShrine() {
  const [c, x] = mk(26, 32);
  // Mossy stone base
  ellF(x, '#424e44', 13, 27, 10, 4);
  ellF(x, '#58685c', 13, 26, 8, 3);
  // Soft emerald moss creeping up
  px(x, '#38a854', 6, 26);
  px(x, '#5cd878', 7, 25);
  px(x, '#38a854', 19, 27);

  // Ancient Forest Maiden stone statue
  // Lower gown / robe
  fr(x, '#76847c', 9, 14, 8, 12);
  fr(x, '#96a69e', 10, 14, 6, 12);
  fr(x, '#58665e', 9, 24, 8, 2);

  // Leafy vine sash around waist
  fr(x, '#38a854', 9, 17, 8, 2);
  px(x, '#78f098', 11, 17);
  px(x, '#78f098', 15, 18);

  // Stone torso & cupped hands holding water basin
  fr(x, '#96a69e', 10, 10, 6, 5);
  // Small stone basin with holy rainwater
  fr(x, '#627068', 10, 12, 6, 4);
  fr(x, '#68d4f0', 11, 12, 4, 2); // pure glowing rain water
  px(x, '#ffffff', 12, 12);

  // Serene maiden face & braided hair
  ellF(x, '#b4c4bc', 13, 7, 4, 4);
  fr(x, '#586860', 10, 4, 6, 3); // stone hair crown
  px(x, '#424e48', 11, 7); // gentle closed eyes
  px(x, '#424e48', 14, 7);

  // Tiny pink flower bud in hair
  px(x, '#f078a8', 9, 4);
  px(x, '#ffffff', 9, 5);

  return outline(c, '#18241c');
}

function artIceHole() {
  const c = mkC(28, 22), ctx = c.getContext("2d");
  // Snow / frost mound outer rim
  ctx.fillStyle = "#d0e6f8";
  ctx.beginPath();
  ctx.ellipse(14, 11, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bright ice glaze
  ctx.fillStyle = "#eef8ff";
  ctx.beginPath();
  ctx.ellipse(14, 10, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Deep cold water opening
  ctx.fillStyle = "#1e4d75";
  ctx.beginPath();
  ctx.ellipse(14, 11, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Deeper abyss center
  ctx.fillStyle = "#0c2844";
  ctx.beginPath();
  ctx.ellipse(14, 12, 6, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Translucent ice rim reflection & cracks
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(14, 9, 7.5, Math.PI * 0.8, Math.PI * 1.8);
  ctx.stroke();
  // Cracks radiating outwards
  ctx.strokeStyle = "#aed2ee";
  ctx.beginPath();
  ctx.moveTo(7, 11); ctx.lineTo(4, 13);
  ctx.moveTo(21, 10); ctx.lineTo(24, 8);
  ctx.moveTo(15, 16); ctx.lineTo(16, 19);
  ctx.stroke();
  return c;
}

function artWishTree() {
  const c = mkC(48, 56), ctx = c.getContext("2d");
  // Trunk and ancient twisted roots
  ctx.fillStyle = "#5a3d24";
  ctx.fillRect(20, 32, 8, 22);
  ctx.fillRect(16, 44, 16, 10);
  // Root flares
  ctx.fillStyle = "#3e2815";
  ctx.beginPath();
  ctx.moveTo(14, 54); ctx.lineTo(20, 42); ctx.lineTo(28, 42); ctx.lineTo(34, 54); ctx.closePath();
  ctx.fill();
  // Moss on trunk base
  ctx.fillStyle = "#557a3e";
  ctx.fillRect(18, 48, 4, 4);
  ctx.fillRect(26, 46, 3, 5);

  // Big lush canopy layers
  ctx.fillStyle = "#265428";
  ctx.beginPath();
  ctx.arc(24, 22, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#357037";
  ctx.beginPath();
  ctx.arc(20, 18, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a944a";
  ctx.beginPath();
  ctx.arc(24, 15, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#66b860";
  ctx.beginPath();
  ctx.arc(22, 11, 10, 0, Math.PI * 2);
  ctx.fill();

  // Hanging colorful wish ribbons (Red, Gold, Cyan/Blue, White)
  // Red ribbon
  ctx.fillStyle = "#e03b3b";
  ctx.fillRect(16, 28, 2, 8);
  ctx.fillRect(17, 36, 2, 4);
  // Gold ribbon
  ctx.fillStyle = "#f5c538";
  ctx.fillRect(22, 30, 2, 10);
  ctx.fillRect(23, 40, 2, 3);
  // Blue/Cyan ribbon
  ctx.fillStyle = "#42a5f5";
  ctx.fillRect(29, 29, 2, 9);
  ctx.fillRect(30, 38, 2, 4);
  // White ribbon
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12, 26, 2, 7);

  // Small wooden chime / bell
  ctx.fillStyle = "#c28847";
  ctx.fillRect(25, 27, 3, 4);
  ctx.fillStyle = "#ffe082";
  ctx.fillRect(26, 31, 1, 3);

  return c;
}

function artIceChasm() {
  const c = mkC(28, 32), ctx = c.getContext("2d");
  // Frozen blue glacier rock formation
  ctx.fillStyle = "#2c4866";
  ctx.fillRect(4, 8, 20, 22);
  ctx.fillStyle = "#1e344d";
  ctx.fillRect(6, 12, 16, 18);

  // Translucent glowing cyan ice fissure
  ctx.fillStyle = "#4dd0e1";
  ctx.beginPath();
  ctx.moveTo(14, 4); ctx.lineTo(19, 14); ctx.lineTo(15, 24); ctx.lineTo(17, 30);
  ctx.lineTo(12, 30); ctx.lineTo(10, 20); ctx.lineTo(13, 10); ctx.closePath();
  ctx.fill();

  // Core glow
  ctx.fillStyle = "#e0f7fa";
  ctx.beginPath();
  ctx.moveTo(14, 7); ctx.lineTo(17, 14); ctx.lineTo(14, 22);
  ctx.lineTo(12, 17); ctx.closePath();
  ctx.fill();

  // Hanging crystal frost moss tufts
  ctx.fillStyle = "#26a69a";
  ctx.fillRect(8, 16, 4, 6);
  ctx.fillRect(18, 12, 4, 7);
  ctx.fillRect(15, 22, 5, 5);

  ctx.fillStyle = "#80cbc4";
  ctx.fillRect(9, 18, 2, 5);
  ctx.fillRect(19, 14, 2, 6);
  ctx.fillRect(16, 24, 2, 4);

  // Frost edges and snow cap on top
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(5, 6, 18, 3);
  ctx.fillRect(8, 4, 12, 2);

  return c;
}

function artStoneCairn() {
  const c = mkC(24, 26), ctx = c.getContext("2d");
  // Base flat boulder
  ctx.fillStyle = "#4a5a68";
  ctx.beginPath();
  ctx.ellipse(12, 22, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#323e48";
  ctx.beginPath();
  ctx.ellipse(12, 23, 8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Second flat river stone
  ctx.fillStyle = "#637788";
  ctx.beginPath();
  ctx.ellipse(12, 17, 7.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7b91a3";
  ctx.beginPath();
  ctx.ellipse(11, 16, 5.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Third rounded stone
  ctx.fillStyle = "#556b7c";
  ctx.beginPath();
  ctx.ellipse(12, 12, 5.5, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8ba5ba";
  ctx.beginPath();
  ctx.ellipse(11, 11, 3.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top balancing pebble
  ctx.fillStyle = "#6c8498";
  ctx.beginPath();
  ctx.ellipse(12, 7, 3.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a1bfd6";
  ctx.beginPath();
  ctx.ellipse(11, 6.5, 2, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tiny water moss patches on base
  ctx.fillStyle = "#437854";
  ctx.fillRect(5, 21, 3, 2);
  ctx.fillRect(16, 20, 2, 2);

  return c;
}

function artMeadowWillow() {
  const c = mkC(46, 54), ctx = c.getContext("2d");
  // Trunk and sloping roots
  ctx.fillStyle = "#63432a";
  ctx.fillRect(20, 28, 7, 24);
  ctx.fillStyle = "#4a2f1b";
  ctx.fillRect(17, 44, 13, 8);

  // Drooping willow branch dome
  ctx.fillStyle = "#33691e";
  ctx.beginPath();
  ctx.arc(23, 22, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#558b2f";
  ctx.beginPath();
  ctx.arc(23, 19, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7cb342";
  ctx.beginPath();
  ctx.arc(22, 16, 14, 0, Math.PI * 2);
  ctx.fill();

  // Weeping hanging vine strands
  ctx.fillStyle = "#8bc34a";
  // Left streamers
  ctx.fillRect(8, 22, 2, 16);
  ctx.fillRect(12, 24, 2, 18);
  ctx.fillRect(16, 26, 2, 15);
  // Center streamers
  ctx.fillRect(21, 28, 2, 14);
  ctx.fillRect(25, 27, 2, 15);
  // Right streamers
  ctx.fillRect(29, 25, 2, 17);
  ctx.fillRect(33, 23, 2, 18);
  ctx.fillRect(37, 21, 2, 14);

  // Wild yellow asters and pink blossoms under tree
  ctx.fillStyle = "#fbc02d";
  ctx.fillRect(12, 48, 2, 2);
  ctx.fillRect(32, 49, 2, 2);
  ctx.fillStyle = "#f06292";
  ctx.fillRect(15, 50, 2, 2);
  ctx.fillRect(29, 47, 2, 2);

  return c;
}

function artHollowMangrove() {
  const c = mkC(46, 52), ctx = c.getContext("2d");
  // Stilt stilt roots splaying in muddy water
  ctx.fillStyle = "#3e2e1e";
  ctx.beginPath();
  ctx.moveTo(14, 50); ctx.lineTo(21, 34); ctx.lineTo(25, 34); ctx.lineTo(32, 50); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2c1f13";
  ctx.beginPath();
  ctx.moveTo(10, 52); ctx.lineTo(19, 36); ctx.lineTo(22, 36); ctx.lineTo(16, 52); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(36, 52); ctx.lineTo(27, 36); ctx.lineTo(24, 36); ctx.lineTo(30, 52); ctx.closePath();
  ctx.fill();

  // Main trunk with hollow cavity
  ctx.fillStyle = "#543d2b";
  ctx.fillRect(19, 22, 8, 16);
  // Hollow cavity in trunk
  ctx.fillStyle = "#1e140d";
  ctx.beginPath();
  ctx.ellipse(23, 29, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Amber resin drop in hollow
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(22, 30, 2, 3);
  ctx.fillStyle = "#fff59d";
  ctx.fillRect(22, 30, 1, 1);

  // Small coconut shell container mounted on root
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.arc(23, 37, 3, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(22, 36, 2, 1);

  // Swamp mangrove canopy
  ctx.fillStyle = "#1b4d2e";
  ctx.beginPath();
  ctx.arc(23, 16, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.arc(21, 13, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#43a047";
  ctx.beginPath();
  ctx.arc(24, 11, 10, 0, Math.PI * 2);
  ctx.fill();

  // Water ripples at root base
  ctx.strokeStyle = "#4e6a55";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(23, 49, 14, 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  return c;
}

