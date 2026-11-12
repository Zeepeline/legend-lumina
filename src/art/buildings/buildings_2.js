'use strict';
// Gambar bangunan & properti buatan kode (2) — isi: lihat docs/CODEMAP.md
function artSwampTotem() {
  const [c, x] = mk(26, 32);
  // Base wet mossy stone pedestal with water bowl
  ellF(x, '#3a443e', 13, 27, 10, 4);
  ellF(x, '#4a584e', 13, 26, 8, 3);
  ellF(x, '#58d8c8', 13, 26, 5, 2); // pure spring water in stone basin
  px(x, '#ffffff', 14, 26);

  // Carved wooden pole
  fr(x, '#5a4230', 9, 8, 8, 18);
  fr(x, '#7a5a42', 10, 8, 6, 18);
  fr(x, '#3a2a1e', 9, 8, 1, 18);
  fr(x, '#3a2a1e', 16, 8, 1, 18);

  // Totem smiling guardian mask carving
  fr(x, '#9a7656', 10, 9, 6, 8);
  px(x, '#2a1a10', 11, 11); // eyes
  px(x, '#2a1a10', 14, 11);
  fr(x, '#2a1a10', 11, 14, 4, 1); // serene smile
  px(x, '#50c878', 10, 8); // moss on top
  px(x, '#50c878', 15, 8);

  // Top crossbeam for bamboo chimes
  fr(x, '#7a5a42', 4, 6, 18, 2);
  fr(x, '#9a7656', 5, 6, 16, 1);

  // Hanging bamboo pipes
  // Left pipe
  fr(x, '#88b858', 5, 8, 2, 7);
  fr(x, '#b0d878', 6, 8, 1, 7);
  px(x, '#4a7030', 5, 11);
  // Center-left pipe
  fr(x, '#88b858', 8, 8, 1, 5);
  // Center-right pipe
  fr(x, '#88b858', 17, 8, 1, 5);
  // Right pipe
  fr(x, '#88b858', 19, 8, 2, 8);
  fr(x, '#b0d878', 20, 8, 1, 8);
  px(x, '#4a7030', 19, 12);

  // Small feather or leafy charm on right
  px(x, '#e86a5a', 21, 11);
  px(x, '#ffd23a', 21, 12);

  return outline(c, '#1a241e');
}

function artTeaTable() {
  const [c, x] = mk(28, 22);
  // Bamboo mat floor spread
  ellF(x, '#c8b47e', 14, 16, 12, 5);
  ellF(x, '#e0cca0', 14, 15, 10, 4);

  // Low wooden tea table
  fr(x, '#7a5438', 6, 11, 16, 5);
  fr(x, '#9a704c', 7, 10, 14, 2);
  fr(x, '#5a3820', 6, 15, 2, 4);
  fr(x, '#5a3820', 20, 15, 2, 4);

  // Steaming teapot / kettle in center
  fr(x, '#4a5058', 12, 7, 5, 4);
  fr(x, '#7a8088', 13, 6, 3, 2);
  px(x, '#9aa0a8', 11, 8); // spout
  px(x, '#3a3e44', 17, 8); // handle

  // White steam rising
  fr(x, '#ffffff', 14, 3, 1, 2);
  px(x, '#e8f4fc', 15, 2);

  // Twin ceramic cups on sides
  fr(x, '#7ad0a0', 8, 9, 3, 3); // green tea cup
  px(x, '#38a868', 9, 9);
  fr(x, '#7ad0a0', 18, 9, 3, 3);
  px(x, '#38a868', 19, 9);

  return outline(c, '#281c14');
}

function artDockBoat() {
  const [c, x] = mk(44, 22);
  // Water ripple underneath
  ellF(x, '#2a6a88', 22, 17, 19, 4.5);
  ellF(x, '#4a8aa8', 22, 16, 16, 3.5);

  // Wooden hull
  fr(x, '#8a5a32', 4, 8, 36, 7);
  fr(x, '#a87444', 6, 8, 32, 3);
  fr(x, '#6a4224', 8, 14, 28, 2);
  fr(x, '#5a3a20', 6, 6, 32, 2);

  // Wooden seats
  fr(x, '#c89a5a', 14, 7, 3, 5);
  fr(x, '#c89a5a', 26, 7, 3, 5);

  // Oar resting across
  fr(x, '#d8b070', 10, 5, 24, 2);

  // Brass lantern on bow (right)
  fr(x, '#e8a838', 37, 3, 4, 5);
  fr(x, '#fff090', 38, 4, 2, 3); // warm light glow
  px(x, '#6a4218', 38, 2); // lantern cap

  // Tied rope to mooring post on left
  fr(x, '#7a5a3a', 0, 8, 4, 8); // wooden dock post
  fr(x, '#d8c090', 4, 10, 5, 1); // hemp rope

  return outline(c, '#241a12');
}

function artCoffeeKettle() {
  const [c, x] = mk(24, 24);
  // Charcoal stones on ground
  ellF(x, '#2a2828', 12, 19, 10, 4);
  ellF(x, '#443e3e', 12, 18, 8, 3);
  // Glowing charcoal embers
  fr(x, '#e84a14', 10, 18, 4, 2);
  px(x, '#ff9a28', 11, 18);

  // Black cast-iron kettle on tripod
  fr(x, '#3a383c', 7, 10, 10, 8);
  fr(x, '#58545a', 8, 9, 8, 3);
  fr(x, '#242226', 7, 17, 10, 1);
  px(x, '#6a666e', 6, 12); // spout
  px(x, '#6a666e', 5, 11);
  // Kettle handle arch
  fr(x, '#6a666e', 10, 5, 4, 1);
  fr(x, '#3a383c', 9, 6, 1, 3);
  fr(x, '#3a383c', 14, 6, 1, 3);

  // Fragrant steam rising
  fr(x, '#ffffff', 5, 8, 1, 2);
  px(x, '#e8f4fc', 6, 7);

  // Wooden cup beside kettle
  fr(x, '#8a5a36', 18, 13, 4, 5);
  fr(x, '#2a1a10', 19, 13, 2, 1); // black coffee inside

  return outline(c, '#18161a');
}

function artStreetDrum() {
  const [c, x] = mk(26, 26);
  // Shadow on ground
  ellF(x, '#2a241e', 13, 22, 10, 4);

  // Wooden cylindrical barrel drum
  fr(x, '#6a4224', 6, 9, 14, 13);
  fr(x, '#8a5a32', 8, 9, 10, 13);
  fr(x, '#52321a', 6, 9, 2, 13);
  fr(x, '#52321a', 18, 9, 2, 13);

  // Crossed rope tensioners on drum sides
  for (let i = 0; i < 4; i++) {
    px(x, '#d8c49a', 7 + i * 3, 11 + (i % 2) * 5);
    px(x, '#d8c49a', 8 + i * 3, 15 - (i % 2) * 4);
  }

  // Taut leather drum skin top
  ellF(x, '#caa472', 13, 9, 7, 3.5);
  ellF(x, '#e2c08e', 13, 8, 6, 2.5);
  fr(x, '#b48a58', 12, 8, 2, 1);

  // Twin wooden drumsticks crossed in front
  fr(x, '#d8a86c', 3, 6, 8, 2); // left stick angled
  px(x, '#f0d09a', 3, 6); // head
  fr(x, '#d8a86c', 16, 6, 8, 2); // right stick angled
  px(x, '#f0d09a', 23, 6);

  return outline(c, '#1e140c');
}

function artBellows() {
  const [c, x] = mk(24, 22);
  // Ground shadow
  ellF(x, '#2a2018', 12, 18, 9, 3.5);

  // Triangular accordion leather bellows chamber
  fr(x, '#7a4e2c', 4, 10, 14, 8);
  fr(x, '#9a643a', 5, 11, 12, 6);
  // Accordion leather folds / pleats
  for (let i = 0; i < 3; i++) {
    fr(x, '#5a3418', 7 + i * 4, 10, 1, 8);
    fr(x, '#c88c5a', 8 + i * 4, 11, 1, 6);
  }

  // Wooden end-plates
  fr(x, '#5a3820', 3, 9, 2, 10);
  fr(x, '#5a3820', 17, 9, 2, 10);

  // Iron nozzle pointing right (toward forge)
  fr(x, '#5a6068', 19, 13, 4, 3);
  fr(x, '#8a929e', 19, 13, 4, 1);
  fr(x, '#2a2e34', 22, 14, 1, 1); // nozzle hole

  // Wooden pumping lever on top
  fr(x, '#8a5a32', 2, 5, 12, 2);
  fr(x, '#a87444', 3, 5, 10, 1);
  // Lever hinge & handle
  fr(x, '#3a2212', 3, 7, 2, 3);
  fr(x, '#d89c62', 1, 4, 3, 3); // round wooden grip

  return outline(c, '#181008');
}

function artRingBooth() {
  const [c, x] = mk(32, 28);
  // Ground shadow
  ellF(x, '#24201c', 16, 23, 14, 4);

  // Wooden carnival table
  fr(x, '#6a4224', 4, 13, 24, 10);
  fr(x, '#8a5a32', 5, 14, 22, 8);
  fr(x, '#523218', 4, 21, 24, 2);

  // Stepped tier on table for bottles
  fr(x, '#523218', 6, 11, 20, 3);
  fr(x, '#7a4e2c', 7, 11, 18, 1);

  // Row of colored glass bottles on the steps
  // Green bottle
  fr(x, '#38a858', 8, 7, 3, 5);
  px(x, '#78e898', 8, 7);
  px(x, '#f0d8a0', 9, 6); // cork
  // Ruby red bottle
  fr(x, '#d82838', 13, 6, 3, 6);
  px(x, '#ffa0a8', 13, 6);
  px(x, '#f0d8a0', 14, 5);
  // Gold bottle
  fr(x, '#e8a820', 18, 7, 3, 5);
  px(x, '#ffe070', 18, 7);
  px(x, '#f0d8a0', 19, 6);
  // Blue bottle
  fr(x, '#2878d8', 23, 6, 3, 6);
  px(x, '#88c0ff', 23, 6);
  px(x, '#f0d8a0', 24, 5);

  // Striped festive awning roof (red & cream canopy)
  fr(x, '#e83838', 2, 2, 28, 4);
  for (let i = 0; i < 5; i++) {
    fr(x, '#fff2d0', 3 + i * 6, 2, 3, 4);
  }
  // Wooden awning poles
  fr(x, '#6a4224', 3, 6, 2, 8);
  fr(x, '#6a4224', 27, 6, 2, 8);

  // Wicker basket with rattan rings in front
  fr(x, '#b48a54', 12, 17, 8, 5);
  ellF(x, '#8a5e30', 16, 17, 4, 1.5);
  // Rattan rings sticking out
  ellF(x, '#ffd070', 14, 16, 2, 2);
  ellF(x, '#ffd070', 18, 16, 2, 2);

  return outline(c, '#1a1410');
}

function artArcheryTarget() {
  const [c, x] = mk(26, 28);
  // Ground shadow
  ellF(x, '#242018', 13, 25, 10, 3.5);

  // Tripod wooden wooden legs
  fr(x, '#6a4e32', 8, 14, 2, 12);
  fr(x, '#6a4e32', 16, 14, 2, 12);
  fr(x, '#4a3420', 12, 16, 2, 10);

  // Round straw-bale target face
  ellF(x, '#c8a452', 13, 11, 10, 10);
  ellF(x, '#e8c468', 13, 11, 9, 9);

  // Concentric target rings
  // Outer white ring
  ellF(x, '#ffffff', 13, 11, 7, 7);
  // Middle red ring
  ellF(x, '#d83838', 13, 11, 5, 5);
  // Inner white ring
  ellF(x, '#ffffff', 13, 11, 3, 3);
  // Bullseye center (golden-red)
  ellF(x, '#e82424', 13, 11, 1.8, 1.8);
  px(x, '#ffd84a', 13, 11);

  // Arrows sticking out
  // Arrow 1 in outer ring
  px(x, '#3a2412', 17, 8);
  fr(x, '#f0f0f0', 18, 7, 2, 1);
  // Arrow 2 near bullseye
  px(x, '#3a2412', 14, 11);
  fr(x, '#f0f0f0', 15, 10, 2, 1);

  return outline(c, '#1e140c');
}

function artLakeLighthouse() {
  const [c, x] = mk(36, 52);
  // Ground rocky foundation shadow
  ellF(x, '#2a3038', 18, 48, 16, 4);

  // Stone tower base
  fr(x, '#5a6470', 10, 36, 16, 12);
  fr(x, '#7a8694', 12, 36, 12, 12);
  // Stone masonry line
  for (let y = 38; y < 48; y += 4) {
    fr(x, '#444e58', 10, y, 16, 1);
  }

  // Wooden mid-tower tapering up
  fr(x, '#8a5e38', 12, 18, 12, 18);
  fr(x, '#a8784c', 13, 18, 10, 18);
  fr(x, '#6a4628', 12, 18, 2, 18);
  fr(x, '#6a4628', 22, 18, 2, 18);
  // Window slit
  fr(x, '#241a10', 17, 24, 2, 5);
  px(x, '#ffea78', 17, 25);

  // Observation deck walkway & railing
  fr(x, '#4a321a', 8, 16, 20, 2);
  fr(x, '#6a4628', 9, 14, 18, 2);
  // Railing bars
  for (let i = 9; i <= 26; i += 3) {
    fr(x, '#8a5e38', i, 12, 1, 3);
  }
  fr(x, '#4a321a', 8, 12, 20, 1);

  // Glass lantern chamber housing
  fr(x, '#60b8e8', 12, 6, 12, 6);
  fr(x, '#b4e8ff', 13, 7, 10, 4);
  // Golden brass beacon lamp core
  fr(x, '#e8a820', 16, 7, 4, 4);
  fr(x, '#ffffff', 17, 8, 2, 2); // bright radiant flame

  // Conical metal copper roof on top
  for (let i = 0; i < 6; i++) {
    fr(x, '#388868', 12 + i, 5 - i, 12 - i * 2, 1);
  }
  // Finial spire tip
  fr(x, '#ffd050', 17, -1, 2, 2);

  return outline(c, '#182026');
}

function artCraftTable() {
  const c = mkC(24, 20), ctx = c.getContext("2d");
  // Wooden low table top
  ctx.fillStyle = "#8a5832";
  ctx.fillRect(2, 6, 20, 6);
  ctx.fillStyle = "#633c1d";
  ctx.fillRect(2, 11, 20, 2);
  // Table legs
  ctx.fillStyle = "#4a2a12";
  ctx.fillRect(4, 12, 3, 7);
  ctx.fillRect(17, 12, 3, 7);
  // Parchment paper roll on top
  ctx.fillStyle = "#f5ebd2";
  ctx.fillRect(4, 3, 6, 4);
  ctx.fillStyle = "#d8caa0";
  ctx.fillRect(4, 6, 6, 1);
  // Folded paper boat mini on table
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(13, 5); ctx.lineTo(18, 5); ctx.lineTo(16, 7); ctx.lineTo(14, 7); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(15, 3); ctx.lineTo(17, 5); ctx.lineTo(15, 5); ctx.closePath();
  ctx.fill();
  // Small ceramic candle bowl
  ctx.fillStyle = "#9c4a2f";
  ctx.fillRect(19, 4, 3, 3);
  // Candle flame glow
  ctx.fillStyle = "#ffdd44";
  ctx.fillRect(20, 2, 1, 2);
  return c;
}

function artPaperBoat() {
  const c = mkC(12, 10), ctx = c.getContext("2d");
  // Paper boat hull
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(1, 5); ctx.lineTo(11, 5); ctx.lineTo(9, 9); ctx.lineTo(3, 9); ctx.closePath();
  ctx.fill();
  // Crease shadow
  ctx.fillStyle = "#d0dce8";
  ctx.beginPath();
  ctx.moveTo(6, 5); ctx.lineTo(11, 5); ctx.lineTo(9, 9); ctx.lineTo(6, 9); ctx.closePath();
  ctx.fill();
  // Sail triangle
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(6, 1); ctx.lineTo(9, 5); ctx.lineTo(6, 5); ctx.closePath();
  ctx.fill();
  // Little candle flame in center
  ctx.fillStyle = "#ffaa22";
  ctx.fillRect(5, 3, 2, 2);
  ctx.fillStyle = "#ffffaa";
  ctx.fillRect(5, 4, 1, 1);
  return c;
}

