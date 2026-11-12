'use strict';
// Gambar bangunan & properti buatan kode (3) — isi: lihat docs/CODEMAP.md
function artArmWrestleTable() {
  const c = mkC(26, 22), ctx = c.getContext("2d");
  // Heavy round wooden tabletop with reinforced iron rim
  ctx.fillStyle = "#5a341a";
  ctx.fillRect(3, 7, 20, 6);
  ctx.fillStyle = "#3d2210";
  ctx.fillRect(3, 12, 20, 2);
  // Heavy center pillar and base
  ctx.fillStyle = "#2c170a";
  ctx.fillRect(10, 13, 6, 7);
  ctx.fillRect(7, 19, 12, 2);
  // Red leather elbow pads
  ctx.fillStyle = "#a82e2e";
  ctx.fillRect(5, 5, 4, 3);
  ctx.fillRect(17, 5, 4, 3);
  // Metal edge studs
  ctx.fillStyle = "#d0d8e0";
  ctx.fillRect(3, 8, 1, 1);
  ctx.fillRect(22, 8, 1, 1);
  // Chalk dust & grip markings
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(12, 6, 2, 2);
  return c;
}

function artKnifeTarget() {
  const c = mkC(26, 28), ctx = c.getContext("2d");
  // Wall mount post / plank
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(11, 2, 4, 24);

  // Round oak barrel lid target
  ctx.fillStyle = "#6d4c41";
  ctx.beginPath();
  ctx.arc(13, 14, 11, 0, Math.PI * 2);
  ctx.fill();

  // Iron rim band
  ctx.strokeStyle = "#37474f";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(13, 14, 10.5, 0, Math.PI * 2);
  ctx.stroke();

  // Outer ring (white chalk)
  ctx.strokeStyle = "#d7ccc8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(13, 14, 7.5, 0, Math.PI * 2);
  ctx.stroke();

  // Middle ring (red paint)
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(13, 14, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Center bullseye (gold / white)
  ctx.fillStyle = "#fff9c4";
  ctx.beginPath();
  ctx.arc(13, 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Embedded daggers stuck in wood
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(6, 9, 4, 1);
  ctx.fillStyle = "#c62828";
  ctx.fillRect(4, 9, 2, 1); // Handle

  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(16, 17, 4, 1);
  ctx.fillStyle = "#212121";
  ctx.fillRect(19, 17, 2, 1); // Handle

  return c;
}

function artCanalPier() {
  const c = mkC(28, 26), ctx = c.getContext("2d");
  // Wooden canal pier platform
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(4, 10, 20, 8);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(4, 16, 20, 3);

  // Pilings into water
  ctx.fillStyle = "#271c19";
  ctx.fillRect(5, 18, 3, 7);
  ctx.fillRect(20, 18, 3, 7);

  // Small race start flag pole
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(6, 2, 2, 10);
  // Triangle flag (Red and yellow)
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.moveTo(8, 2); ctx.lineTo(15, 5); ctx.lineTo(8, 8); ctx.closePath();
  ctx.fill();

  // Floating toy boats in canal water
  // Red boat
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(10, 18, 5, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12, 16, 1, 2);

  // Green boat
  ctx.fillStyle = "#388e3c";
  ctx.fillRect(17, 20, 5, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(19, 18, 1, 2);

  // Water ripple lines
  ctx.strokeStyle = "#4fc3f7";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, 22); ctx.lineTo(9, 22);
  ctx.moveTo(15, 24); ctx.lineTo(26, 24);
  ctx.stroke();

  return c;
}

function artWeatherVane() {
  const c = mkC(24, 38), ctx = c.getContext("2d");
  // Wooden mount pole
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(11, 14, 2, 24);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(10, 32, 4, 6);

  // Brass central sphere mount
  ctx.fillStyle = "#ffca28";
  ctx.beginPath();
  ctx.arc(12, 14, 3, 0, Math.PI * 2);
  ctx.fill();

  // 4 Compass arms (U, T, S, B)
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(4, 13, 16, 2); // Horizontal W-E
  ctx.fillRect(11, 7, 2, 14); // Vertical N-S

  // Cardinal letters / markings
  ctx.fillStyle = "#fff8e1";
  ctx.fillRect(4, 12, 1, 1);
  ctx.fillRect(19, 12, 1, 1);
  ctx.fillRect(11, 6, 2, 1);

  // Rotating brass rooster vane on top
  ctx.fillStyle = "#ffb300";
  // Rooster body
  ctx.beginPath();
  ctx.ellipse(12, 4, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Comb on head
  ctx.fillStyle = "#e53935";
  ctx.fillRect(14, 1, 2, 2);
  // Tail feathers
  ctx.fillStyle = "#ffa000";
  ctx.beginPath();
  ctx.moveTo(9, 4); ctx.lineTo(6, 1); ctx.lineTo(8, 6); ctx.closePath();
  ctx.fill();
  // Beak
  ctx.fillStyle = "#ffeb3b";
  ctx.fillRect(16, 4, 2, 1);

  return c;
}

function artClockworkTower() {
  const c = mkC(32, 54), ctx = c.getContext("2d");
  // Stone tower base and pillars
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(8, 20, 16, 32);
  ctx.fillStyle = "#90a4ae";
  ctx.fillRect(6, 44, 20, 8);
  ctx.fillRect(8, 50, 16, 2);

  // Arched glass inspection window
  ctx.fillStyle = "#37474f";
  ctx.fillRect(11, 28, 10, 14);
  // Brass gears visible inside window
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.arc(14, 33, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffa000";
  ctx.beginPath();
  ctx.arc(18, 37, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Glass gleam
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.moveTo(11, 40); ctx.lineTo(19, 28); ctx.lineTo(21, 28); ctx.lineTo(13, 40); ctx.closePath();
  ctx.fill();

  // Clock face upper section
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(7, 10, 18, 12);
  // Dial rim (bronze/brass)
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.arc(16, 16, 6, 0, Math.PI * 2);
  ctx.fill();
  // Dial face (cream white)
  ctx.fillStyle = "#fffde7";
  ctx.beginPath();
  ctx.arc(16, 16, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // Clock hands
  ctx.fillStyle = "#263238";
  ctx.fillRect(16, 13, 1, 3);
  ctx.fillRect(16, 16, 3, 1);

  // Copper pointed roof spire
  ctx.fillStyle = "#00897b";
  ctx.beginPath();
  ctx.moveTo(16, 1); ctx.lineTo(25, 10); ctx.lineTo(7, 10); ctx.closePath();
  ctx.fill();
  // Spire pinnacle ball
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(15, 0, 2, 2);

  return c;
}

function artHighStriker() {
  const c = mkC(26, 52), ctx = c.getContext("2d");
  // Heavy wooden base platform
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(2, 42, 22, 9);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(2, 48, 22, 3);

  // Spring strike pad
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(6, 40, 7, 3);
  ctx.fillStyle = "#ff5252";
  ctx.fillRect(7, 39, 5, 1);

  // Large sledgehammer leaning against base
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(17, 32, 2, 14); // Handle
  ctx.fillStyle = "#455a64";
  ctx.fillRect(15, 30, 6, 4); // Iron head

  // Tower vertical guide post
  ctx.fillStyle = "#795548";
  ctx.fillRect(7, 6, 5, 34);
  // Color scale markers (Red, Yellow, Green)
  ctx.fillStyle = "#43a047";
  ctx.fillRect(8, 7, 3, 8); // Top green
  ctx.fillStyle = "#fdd835";
  ctx.fillRect(8, 16, 3, 10); // Mid yellow
  ctx.fillStyle = "#e53935";
  ctx.fillRect(8, 27, 3, 12); // Low red

  // Center slider wire & slug
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(9, 6, 1, 34);
  ctx.fillStyle = "#37474f";
  ctx.fillRect(8, 36, 3, 3); // Slug at bottom

  // Top brass gong bell
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.arc(9.5, 4, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8e1";
  ctx.fillRect(9, 2, 2, 2);

  return c;
}

function artViolinStand() {
  const c = mkC(26, 22), ctx = c.getContext("2d");
  // Open violin hard case
  ctx.fillStyle = "#2c1d11";
  ctx.fillRect(3, 7, 20, 11);
  ctx.fillStyle = "#1b1109";
  ctx.fillRect(3, 15, 20, 3);

  // Red velvet interior lining
  ctx.fillStyle = "#b71c1c";
  ctx.fillRect(4, 8, 18, 9);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(5, 9, 16, 7);

  // Sheet music page
  ctx.fillStyle = "#fffde7";
  ctx.fillRect(5, 10, 6, 5);
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(6, 11, 4, 1);
  ctx.fillRect(6, 13, 4, 1);

  // Violin body inside case
  ctx.fillStyle = "#ff8f00";
  ctx.beginPath();
  ctx.ellipse(15, 12, 3.5, 2.2, Math.PI * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e65100";
  ctx.fillRect(17, 11, 3, 1); // Fingerboard neck

  // Small coin tip cup beside case
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.arc(22, 16, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(21, 15, 2, 1); // Coin shine

  // Dried red rose beside case
  ctx.fillStyle = "#c62828";
  ctx.fillRect(1, 14, 2, 2);
  ctx.fillStyle = "#33691e";
  ctx.fillRect(2, 16, 1, 2);

  return c;
}

function artBirdHouse() {
  const c = mkC(22, 34), ctx = c.getContext("2d");
  // Wooden mounting post
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(10, 16, 2, 18);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(9, 28, 4, 6);

  // Birdhouse main box
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(6, 8, 10, 9);
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(6, 14, 10, 3);

  // Entrance hole
  ctx.fillStyle = "#271a13";
  ctx.beginPath();
  ctx.arc(11, 11, 2, 0, Math.PI * 2);
  ctx.fill();

  // Perch peg
  ctx.fillStyle = "#bcaaa4";
  ctx.fillRect(10, 14, 2, 2);

  // Thatched straw peaked roof
  ctx.fillStyle = "#d7ccc8";
  ctx.beginPath();
  ctx.moveTo(11, 3); ctx.lineTo(18, 9); ctx.lineTo(4, 9); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a1887f";
  ctx.fillRect(5, 8, 12, 1);

  // Feeding seed tray hanging below
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(5, 17, 12, 2);
  // Yellow seeds on tray
  ctx.fillStyle = "#fff59d";
  ctx.fillRect(7, 16, 8, 1);

  // Little brown sparrow perched on top roof
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.arc(15, 4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(16, 4, 1.5, 1); // Beak

  return c;
}

