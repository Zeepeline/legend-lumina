'use strict';
// Gambar alam buatan kode (3) — isi: lihat docs/CODEMAP.md
function artClimberLedge() {
  const c = mkC(36, 34), ctx = c.getContext("2d");
  // Stone ledge base
  ctx.fillStyle = "#4a4f54";
  ctx.fillRect(4, 20, 28, 12);
  ctx.fillStyle = "#33373b";
  ctx.fillRect(4, 28, 28, 4);

  // Wooden anchor stake and post
  ctx.fillStyle = "#795548";
  ctx.fillRect(10, 8, 4, 18);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(10, 16, 4, 10);

  // Thick climbing rope coil
  ctx.fillStyle = "#d7ccc8";
  ctx.fillRect(8, 12, 8, 5);
  ctx.fillRect(9, 17, 6, 4);

  // Explorer leather satchel
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(20, 16, 10, 8);
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(20, 19, 10, 2);
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(24, 19, 2, 2);

  // Small blue swift bird perched / entangled on rope
  ctx.fillStyle = "#1e88e5";
  ctx.beginPath();
  ctx.arc(13, 10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d47a1";
  ctx.fillRect(10, 11, 4, 3);
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(15, 10, 2, 1); // Beak

  // Green cliff moss
  ctx.fillStyle = "#558b2f";
  ctx.fillRect(4, 20, 4, 3);
  ctx.fillRect(26, 21, 6, 2);

  return c;
}

function artHoneyTree() {
  const c = mkC(48, 54), ctx = c.getContext("2d");
  // Ancient oak trunk
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(20, 26, 9, 26);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(17, 42, 15, 10);

  // Large deep canopy
  ctx.fillStyle = "#1b5e20";
  ctx.beginPath();
  ctx.arc(24, 20, 21, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.arc(22, 16, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#388e3c";
  ctx.beginPath();
  ctx.arc(25, 13, 13, 0, Math.PI * 2);
  ctx.fill();

  // Branch extending with hanging beehive
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(11, 24, 10, 4);

  // Honeycomb hive (oval layered honey comb)
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.ellipse(14, 32, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffa000";
  ctx.fillRect(11, 30, 6, 2);
  ctx.fillRect(12, 33, 4, 2);

  // Golden honey droplet dripping from hive
  ctx.fillStyle = "#fff59d";
  ctx.fillRect(13, 37, 2, 3);
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(14, 41, 1, 2);

  // Little buzzing bees
  ctx.fillStyle = "#ffee58";
  ctx.fillRect(7, 28, 2, 2);
  ctx.fillRect(18, 36, 2, 2);
  ctx.fillStyle = "#212121";
  ctx.fillRect(8, 29, 1, 1);
  ctx.fillRect(19, 37, 1, 1);

  return c;
}

function artTempleKoiPond() {
  const c = mkC(36, 30), ctx = c.getContext("2d");
  // Outer carved stone basin rim
  ctx.fillStyle = "#5c6b73";
  ctx.beginPath();
  ctx.ellipse(18, 15, 17, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark stone inner ledge
  ctx.fillStyle = "#3a4750";
  ctx.beginPath();
  ctx.ellipse(18, 16, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Clear serene blue temple water
  ctx.fillStyle = "#29b6f6";
  ctx.beginPath();
  ctx.ellipse(18, 15, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Deeper water depth gradient
  ctx.fillStyle = "#0288d1";
  ctx.beginPath();
  ctx.ellipse(18, 16, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swimming golden & red koi fish silhouettes under water
  // Koi 1 (Golden-white)
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.ellipse(14, 14, 5, 2.2, Math.PI * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(13, 13, 2, 2);
  // Red patch
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(15, 14, 2, 1);

  // Koi 2 (Red-orange)
  ctx.fillStyle = "#f4511e";
  ctx.beginPath();
  ctx.ellipse(22, 17, 4.5, 2, -Math.PI * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(23, 16, 2, 1);

  // Floating green lotus pads
  ctx.fillStyle = "#43a047";
  ctx.beginPath();
  ctx.ellipse(9, 12, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(25, 12, 3.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Moss on stone rim
  ctx.fillStyle = "#689f38";
  ctx.fillRect(5, 18, 4, 2);
  ctx.fillRect(27, 8, 3, 2);

  // Water ripple highlight
  ctx.strokeStyle = "#e1f5fe";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(18, 14, 8, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();

  return c;
}

function artChrysanthemumRock() {
  const c = mkC(28, 26), ctx = c.getContext("2d");
  // Granite boulder
  ctx.fillStyle = "#546e7a";
  ctx.beginPath();
  ctx.ellipse(14, 18, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#37474f";
  ctx.beginPath();
  ctx.ellipse(14, 20, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snow cap on boulder top
  ctx.fillStyle = "#eceff1";
  ctx.beginPath();
  ctx.ellipse(14, 14, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(13, 13, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark green foliage leaves in rock crevices
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(8, 12, 3, 4);
  ctx.fillRect(15, 11, 4, 4);
  ctx.fillRect(20, 13, 3, 3);

  // Blooming bright gold Snow Chrysanthemum flowers
  // Flower 1
  ctx.fillStyle = "#ffd600";
  ctx.beginPath();
  ctx.arc(10, 11, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6f00";
  ctx.fillRect(9, 10, 2, 2); // Center eye

  // Flower 2
  ctx.fillStyle = "#ffea00";
  ctx.beginPath();
  ctx.arc(17, 9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f57f17";
  ctx.fillRect(16, 8, 2, 2);

  // Flower 3
  ctx.fillStyle = "#ffd600";
  ctx.beginPath();
  ctx.arc(22, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6f00";
  ctx.fillRect(21, 11, 2, 2);

  return c;
}

function artRiverStone() {
  const c = mkC(28, 22), ctx = c.getContext("2d");
  // Shallow river water base
  ctx.fillStyle = "#4fc3f7";
  ctx.beginPath();
  ctx.ellipse(14, 15, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water ripple lines
  ctx.strokeStyle = "#e1f5fe";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(14, 15, 11, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  // Bottom flat river stone
  ctx.fillStyle = "#546e7a";
  ctx.beginPath();
  ctx.ellipse(13, 14, 10, 5, -Math.PI * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#37474f";
  ctx.beginPath();
  ctx.ellipse(13, 15, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top tilted river stone
  ctx.fillStyle = "#78909c";
  ctx.beginPath();
  ctx.ellipse(15, 10, 7.5, 4, Math.PI * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b0bec5";
  ctx.beginPath();
  ctx.ellipse(14, 9, 5, 2.5, Math.PI * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Water moss
  ctx.fillStyle = "#33691e";
  ctx.fillRect(7, 13, 3, 2);
  ctx.fillRect(18, 12, 3, 2);

  // Tiny water foam dots
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(4, 15, 1, 1);
  ctx.fillRect(23, 14, 1, 1);

  return c;
}

function artGeodeRock() {
  const c = mkC(28, 26), ctx = c.getContext("2d");
  // Outer rough volcanic boulder crust
  ctx.fillStyle = "#424242";
  ctx.beginPath();
  ctx.ellipse(14, 15, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#212121";
  ctx.beginPath();
  ctx.ellipse(14, 17, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mineral rind layer
  ctx.fillStyle = "#616161";
  ctx.beginPath();
  ctx.ellipse(14, 13, 9, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crystal cavity opening (purple glowing amethyst)
  ctx.fillStyle = "#7b1fa2";
  ctx.beginPath();
  ctx.ellipse(14, 13, 6.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brilliant crystalline amethyst spikes
  ctx.fillStyle = "#ba68c8";
  ctx.fillRect(11, 11, 2, 3);
  ctx.fillRect(15, 12, 3, 2);
  ctx.fillRect(13, 14, 2, 2);

  // Sparkling highlights inside geode
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12, 11, 1, 1);
  ctx.fillRect(16, 12, 1, 1);
  ctx.fillRect(14, 14, 1, 1);

  // Small crystal fragments around base
  ctx.fillStyle = "#ab47bc";
  ctx.fillRect(6, 18, 2, 2);
  ctx.fillRect(20, 17, 2, 2);

  return c;
}

function artOwlTree() {
  const c = mkC(46, 54), ctx = c.getContext("2d");
  // Ancient oak trunk
  ctx.fillStyle = "#4a3525";
  ctx.fillRect(19, 26, 9, 26);
  ctx.fillStyle = "#332215";
  ctx.fillRect(16, 42, 15, 10);

  // Deep green forest canopy
  ctx.fillStyle = "#1b4d2e";
  ctx.beginPath();
  ctx.arc(23, 19, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2d6a4f";
  ctx.beginPath();
  ctx.arc(21, 15, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#40916c";
  ctx.beginPath();
  ctx.arc(24, 12, 12, 0, Math.PI * 2);
  ctx.fill();

  // Natural hollow cavity in branch
  ctx.fillStyle = "#1e140d";
  ctx.beginPath();
  ctx.ellipse(23, 30, 4.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wise owl perched in the hollow
  // Body (warm brown)
  ctx.fillStyle = "#8d6e63";
  ctx.beginPath();
  ctx.ellipse(23, 31, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly plumage (cream)
  ctx.fillStyle = "#d7ccc8";
  ctx.beginPath();
  ctx.ellipse(23, 32, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Large round glowing yellow eyes
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.arc(21.5, 29, 1.8, 0, Math.PI * 2);
  ctx.arc(24.5, 29, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Black pupils
  ctx.fillStyle = "#212121";
  ctx.beginPath();
  ctx.arc(21.5, 29, 0.9, 0, Math.PI * 2);
  ctx.arc(24.5, 29, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Small orange beak
  ctx.fillStyle = "#ff8f00";
  ctx.fillRect(22.5, 30, 1, 1.5);

  // Moss on trunk base
  ctx.fillStyle = "#557a3e";
  ctx.fillRect(17, 46, 3, 3);
  ctx.fillRect(27, 48, 3, 2);

  return c;
}

