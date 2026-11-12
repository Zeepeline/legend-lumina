'use strict';
// Gambar bangunan & properti buatan kode (4) — isi: lihat docs/CODEMAP.md
function artWoodenLoom() {
  const c = mkC(26, 26), ctx = c.getContext("2d");
  // Upright wooden loom frame
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(3, 4, 3, 20);
  ctx.fillRect(20, 4, 3, 20);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(2, 22, 22, 3);
  ctx.fillRect(4, 5, 18, 2);

  // Warp yarn roller beam on top
  ctx.fillStyle = "#fff8e1";
  ctx.fillRect(6, 7, 14, 2);

  // Vertical yarn threads (white / cream)
  ctx.fillStyle = "#fafafa";
  for (let x = 7; x <= 18; x += 2) {
    ctx.fillRect(x, 9, 1, 10);
  }

  // Woven cloth section (red and cream pattern)
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(6, 15, 14, 5);
  ctx.fillStyle = "#fff9c4";
  ctx.fillRect(6, 17, 14, 1);

  // Wooden reed comb / shuttle bar in middle
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(5, 13, 16, 2);
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(15, 12, 3, 1); // Flying shuttle bobbin

  // Foot treadle pedals below
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(9, 21, 3, 2);
  ctx.fillRect(14, 21, 3, 2);

  return c;
}

function artPottersWheel() {
  const c = mkC(26, 26), ctx = c.getContext("2d");
  // Workbench low frame
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(2, 14, 22, 10);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(2, 20, 22, 4);

  // Rotating round pottery wheel disk
  ctx.fillStyle = "#8d6e63";
  ctx.beginPath();
  ctx.ellipse(13, 13, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#bcaaa4";
  ctx.beginPath();
  ctx.ellipse(13, 12, 7.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spinning red terracotta clay mound
  ctx.fillStyle = "#d84315";
  ctx.beginPath();
  ctx.ellipse(13, 10, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8a65";
  ctx.fillRect(12, 6, 2, 4); // Vase neck being pulled up

  // Small water sponge bowl beside wheel
  ctx.fillStyle = "#455a64";
  ctx.beginPath();
  ctx.arc(4, 15, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4fc3f7";
  ctx.fillRect(3, 14, 2, 2);

  // Finished little clay vases drying beside wheel
  ctx.fillStyle = "#bf360c";
  ctx.fillRect(21, 10, 3, 5);
  ctx.fillStyle = "#d84315";
  ctx.fillRect(22, 8, 1, 2);

  return c;
}

function artCheeseBarrel() {
  const c = mkC(24, 26), ctx = c.getContext("2d");
  // Oak aging barrel body
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(4, 9, 16, 15);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(4, 21, 16, 3);

  // Black iron barrel hoops
  ctx.fillStyle = "#263238";
  ctx.fillRect(3, 11, 18, 2);
  ctx.fillRect(3, 19, 18, 2);

  // White cheesecloth drape on side
  ctx.fillStyle = "#eceff1";
  ctx.beginPath();
  ctx.moveTo(3, 8); ctx.lineTo(7, 8); ctx.lineTo(5, 17); ctx.closePath();
  ctx.fill();

  // Golden wheel of cheese on top
  ctx.fillStyle = "#ffca28";
  ctx.beginPath();
  ctx.ellipse(12, 7, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.ellipse(12, 6, 5.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red wax coating rind on edge
  ctx.strokeStyle = "#d32f2f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(12, 7, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Small cheese wedge cut out
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.moveTo(12, 6); ctx.lineTo(16, 4.5); ctx.lineTo(15, 8); ctx.closePath();
  ctx.fill();

  // Cheese knife handle
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(17, 3, 4, 1.5);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(19, 2, 2, 3);

  return c;
}

function artStonePestle() {
  const c = mkC(24, 24), ctx = c.getContext("2d");
  // Small wooden worktable
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(2, 12, 20, 10);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(2, 18, 20, 4);

  // Granite mortar bowl
  ctx.fillStyle = "#546e7a";
  ctx.beginPath();
  ctx.arc(11, 11, 6, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#37474f";
  ctx.beginPath();
  ctx.ellipse(11, 11, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crushed green herb paste inside mortar
  ctx.fillStyle = "#43a047";
  ctx.fillRect(8, 11, 6, 2);
  ctx.fillStyle = "#81c784";
  ctx.fillRect(9, 11, 4, 1);

  // Stone pestle standing tilted inside bowl
  ctx.fillStyle = "#78909c";
  ctx.beginPath();
  ctx.moveTo(10, 12); ctx.lineTo(15, 4); ctx.lineTo(17, 5); ctx.lineTo(12, 13); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(15, 4, 2, 2); // Handle top

  // Small white ceramic salve jar on side
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(18, 9, 4, 5);
  ctx.fillStyle = "#795548";
  ctx.fillRect(19, 8, 2, 1); // Cork stopper

  // Dried herb leaves on table
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(3, 11, 3, 2);
  ctx.fillRect(4, 10, 2, 1);

  return c;
}

function artBirdBath() {
  const c = mkC(24, 28), ctx = c.getContext("2d");
  // Marble pedestal base
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(8, 22, 8, 4);
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(6, 25, 12, 2);

  // Pillar column with leaf relief
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(10, 11, 4, 11);
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(10, 14, 4, 1);
  ctx.fillRect(10, 18, 4, 1);

  // Shallow marble basin bowl
  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(12, 11, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Clear serene water inside basin
  ctx.fillStyle = "#4fc3f7";
  ctx.beginPath();
  ctx.ellipse(12, 10.5, 8.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Little floating lily pad
  ctx.fillStyle = "#66bb6a";
  ctx.beginPath();
  ctx.ellipse(8, 10.5, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Yellow canary bird perched on edge
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.arc(17, 8, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(19, 8, 1.5, 1); // Beak
  ctx.fillStyle = "#ffa000";
  ctx.fillRect(15, 9, 2, 2); // Tail

  return c;
}

function artSkewerCamp() {
  const c = mkC(26, 26), ctx = c.getContext("2d");
  // Stone hearth ring
  ctx.fillStyle = "#455a64";
  ctx.beginPath();
  ctx.ellipse(13, 17, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#263238";
  ctx.beginPath();
  ctx.ellipse(13, 18, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing charcoal embers in center
  ctx.fillStyle = "#bf360c";
  ctx.beginPath();
  ctx.ellipse(13, 17, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff5722";
  ctx.fillRect(11, 16, 4, 2);
  ctx.fillStyle = "#ffeb3b";
  ctx.fillRect(12, 17, 2, 1);

  // Forked branch skewer holder stakes
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(4, 9, 2, 11);
  ctx.fillRect(20, 9, 2, 11);

  // Horizontal cinnamon skewer stick across
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(3, 11, 20, 2);

  // 3 Roasted red apples with golden honey glaze on skewer
  // Apple 1
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(8, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(7, 10, 2, 2); // Honey glaze shine

  // Apple 2
  ctx.fillStyle = "#c62828";
  ctx.beginPath();
  ctx.arc(13, 12, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(12, 10, 2, 2);

  // Apple 3
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(18, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(17, 10, 2, 2);

  return c;
}

function artStreetGaslamp() {
  const c = mkC(22, 44), ctx = c.getContext("2d");
  // Wrought iron base
  ctx.fillStyle = "#263238";
  ctx.fillRect(8, 38, 6, 6);
  ctx.fillStyle = "#102027";
  ctx.fillRect(7, 41, 8, 3);

  // Tall iron post
  ctx.fillStyle = "#37474f";
  ctx.fillRect(10, 14, 2, 24);

  // Brass valve knob on post
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(8, 26, 2, 2);

  // Ornamental bracket curves
  ctx.fillStyle = "#263238";
  ctx.fillRect(7, 13, 8, 2);
  ctx.fillRect(8, 11, 6, 2);

  // Four-sided glass lamp housing
  ctx.fillStyle = "#455a64";
  ctx.fillRect(6, 4, 10, 8);
  // Clear glowing warm glass
  ctx.fillStyle = "#fff9c4";
  ctx.fillRect(7, 5, 8, 6);

  // Bright warm orange-gold gas flame inside
  ctx.fillStyle = "#ff9800";
  ctx.beginPath();
  ctx.ellipse(11, 8, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffff55";
  ctx.fillRect(10.5, 7, 1, 2);

  // Pointed copper cap roof
  ctx.fillStyle = "#00695c";
  ctx.beginPath();
  ctx.moveTo(11, 0); ctx.lineTo(17, 4); ctx.lineTo(5, 4); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(10, 0, 2, 1); // Pinnacle finial

  return c;
}

function artBarberChair() {
  const c = mkC(26, 32), ctx = c.getContext("2d");
  // Heavy cast iron base and hydraulic pedal
  ctx.fillStyle = "#37474f";
  ctx.fillRect(8, 26, 8, 4);
  ctx.fillStyle = "#263238";
  ctx.fillRect(6, 29, 12, 2);

  // Hydraulic chrome pillar
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(11, 20, 3, 6);

  // Red leather padded seat and armrests
  ctx.fillStyle = "#b71c1c";
  ctx.fillRect(7, 16, 11, 5);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(8, 16, 9, 3);

  // High backrest and headrest
  ctx.fillStyle = "#b71c1c";
  ctx.fillRect(8, 8, 9, 8);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(9, 9, 7, 6);
  // Headrest pillow
  ctx.fillStyle = "#c62828";
  ctx.fillRect(9, 5, 7, 3);

  // Polished chrome armrests
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(5, 14, 2, 6);
  ctx.fillRect(18, 14, 2, 6);

  // Barber pole cylinder beside chair (red, white, blue spirals)
  ctx.fillStyle = "#37474f";
  ctx.fillRect(21, 6, 3, 20);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(22, 8, 2, 16);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(22, 10, 2, 3);
  ctx.fillRect(22, 18, 2, 3);
  ctx.fillStyle = "#1976d2";
  ctx.fillRect(22, 14, 2, 3);
  // Brass ball finial on top of pole
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(21, 5, 3, 2);

  // Mirror frame on small side table
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(1, 10, 4, 14);
  ctx.fillStyle = "#81d4fa";
  ctx.fillRect(2, 11, 2, 8); // Glass gleam

  return c;
}

// Ayakan tepung gandum kayu tradisional (24x20)
