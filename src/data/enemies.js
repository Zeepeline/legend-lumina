'use strict';
// Data musuh & proyektil
// ---------------- MONSTER ----------------
// ai: hop | fly | shoot | turret | lunge | walk | charge | ghost | golem | boss | qboss | sboss | gboss
const ENEMY = {
  slime: { name: 'Slime', tex: 'slime_hd', hp: 24, atk: 6, def: 1, spd: 40, exp: 4, gold: [1, 3], r: 9, ai: 'hop', scale: 0.46, drop: ['jelly', .5] },
  gold_slime: { name: 'Slime Emas', tex: 'slime_hd', hp: 25, atk: 0, def: 12, spd: 130, exp: 100, gold: [150, 250], r: 9, ai: 'flee', scale: 0.46, drop: ['amethyst_gem', 0.8] },
  mimic: { name: 'Peti Mimic', tex: 'ch_goblin', hp: 60, atk: 15, def: 6, spd: 85, exp: 45, gold: [60, 100], r: 8, ai: 'lunge', ch: 1, drop: ['amethyst_gem', 0.6] },
  slimeb: { name: 'Slime Biru', tex: 'slime_hd', hp: 32, atk: 9, def: 2, spd: 44, exp: 8, gold: [2, 5], r: 10, ai: 'hop', scale: 0.52, drop: ['jelly', .6] },
  slimer: { name: 'Slime Merah', tex: 'slimer', hp: 36, atk: 13, def: 3, spd: 50, exp: 13, gold: [3, 7], r: 7, ai: 'hop', drop: ['jelly', .6] },
  slimei: { name: 'Slime Es', tex: 'slimei', hp: 50, atk: 17, def: 6, spd: 46, exp: 22, gold: [5, 10], r: 7, ai: 'hop', drop: ['shard', .35], fx: ['chill', 3, .5] },
  bat: { name: 'Kelelawar', tex: 'bat', hp: 9, atk: 7, def: 0, spd: 56, exp: 5, gold: [1, 4], r: 6, ai: 'fly', fly: 1 },
  batc: { name: 'Kelelawar Gua', tex: 'batc', hp: 24, atk: 15, def: 3, spd: 66, exp: 16, gold: [3, 7], r: 6, ai: 'fly', fly: 1, drop: ['shard', .15], fx: ['chill', 2, .2] },
  bee: { name: 'Tawon', tex: 'bee', hp: 11, atk: 9, def: 0, spd: 74, exp: 8, gold: [1, 4], r: 5, ai: 'fly', fly: 1, drop: ['sting', .5], fx: ['poison', 4, .35] },
  shroom: { name: 'Jamur Racun', tex: 'shroom', hp: 20, atk: 8, def: 2, spd: 20, exp: 9, gold: [3, 6], r: 7, ai: 'shoot', proj: 'spore', drop: ['spore', .5] },
  plant: { name: 'Bunga Pemakan', tex: 'plant', hp: 36, atk: 12, def: 3, spd: 0, exp: 15, gold: [4, 8], r: 7, ai: 'turret', proj: 'seed', drop: ['spore', .4] },
  skel: { name: 'Tengkorak', tex: 'ch_skel', hp: 54, atk: 17, def: 6, spd: 38, exp: 30, gold: [6, 12], r: 7, ai: 'shoot', proj: 'bone', ch: 1, drop: ['bone', .6] },
  goblin: { name: 'Goblin', tex: 'goblin_hd', hp: 34, atk: 12, def: 4, spd: 50, exp: 16, gold: [5, 10], r: 7, ai: 'lunge', scale: 0.46 },
  wolf: { name: 'Serigala', tex: 'wolf_hd', hp: 34, atk: 11, def: 2, spd: 66, exp: 14, gold: [3, 7], r: 9, ai: 'lunge', side: 1, drop: ['pelt', .55] },
  snake: { name: 'Ular', tex: 'snake', hp: 20, atk: 10, def: 2, spd: 34, exp: 10, gold: [2, 5], r: 6, ai: 'walk', side: 1, drop: ['scale', .55], fx: ['poison', 5, .4] },
  boar: { name: 'Babi Hutan', tex: 'boar', hp: 50, atk: 15, def: 4, spd: 40, exp: 22, gold: [5, 9], r: 9, ai: 'charge', side: 1, drop: ['tusk', .55] },
  ghost: { name: 'Hantu', tex: 'ghost', hp: 42, atk: 16, def: 3, spd: 40, exp: 28, gold: [6, 11], r: 7, ai: 'ghost', fly: 1, drop: ['ecto', .55] },
  golem: { name: 'Golem', tex: 'golem', hp: 95, atk: 22, def: 10, spd: 24, exp: 46, gold: [10, 18], r: 10, ai: 'golem', drop: ['ore', .7] },
  gchief: { name: 'Kepala Goblin', tex: 'ch_gchief', hp: 120, atk: 14, def: 5, spd: 46, exp: 45, gold: [30, 30], r: 9, ai: 'boss', ch: 1, scale: 1.4, adds: ['goblin', 'goblin'] },
  squeen: { name: 'Ratu Jamur', tex: 'squeen', hp: 130, atk: 13, def: 4, spd: 18, exp: 48, gold: [30, 30], r: 11, ai: 'qboss', scale: 1.9, adds: ['shroom', 'shroom'] },
  gsnake: { name: 'Ular Raksasa', tex: 'snake', hp: 140, atk: 15, def: 5, spd: 56, exp: 50, gold: [35, 35], r: 10, ai: 'sboss', scale: 2.3, side: 1, fx: ['poison', 5, .5] },
  gking: { name: 'Raja Goblin', tex: 'ch_gking', hp: 300, atk: 17, def: 7, spd: 36, exp: 150, gold: [100, 100], r: 12, ai: 'boss', ch: 1, scale: 1.8, phase2: 1, adds: ['slimeb', 'goblin', 'slimeb'] },
  frog: { name: 'Katak Rawa', tex: 'frog', hp: 62, atk: 20, def: 7, spd: 54, exp: 34, gold: [6, 12], r: 8, ai: 'hop', drop: ['scale', .4] },
  wisp: { name: 'Wisp', tex: 'wisp', hp: 40, atk: 19, def: 4, spd: 58, exp: 30, gold: [5, 10], r: 6, ai: 'ghost', fly: 1, drop: ['ecto', .5], fx: ['chill', 3, .4] },
  slimep: { name: 'Slime Racun', tex: 'slimep', hp: 72, atk: 22, def: 8, spd: 48, exp: 38, gold: [6, 12], r: 7, ai: 'hop', drop: ['jelly', .7], fx: ['poison', 6, .6] },
  witch: { name: 'Morgath', tex: 'ch_witch', hp: 560, atk: 28, def: 12, spd: 40, exp: 420, gold: [250, 250], r: 10, ai: 'wboss', ch: 1, scale: 1.5, adds: ['wisp', 'wisp', 'slimep'] },
  golemk: { name: 'Golem Purba', tex: 'golem', hp: 460, atk: 26, def: 12, spd: 26, exp: 240, gold: [150, 150], r: 14, ai: 'gboss', scale: 2.1, adds: ['batc', 'batc', 'slimei'] },
  wolfs: { name: 'Serigala Salju', tex: 'wolfs', hp: 92, atk: 27, def: 9, spd: 72, exp: 44, gold: [7, 13], r: 8, ai: 'lunge', side: 1, drop: ['pelt', .6], fx: ['chill', 3, .45] },
  slimef: { name: 'Slime Api', tex: 'slimef', hp: 96, atk: 26, def: 9, spd: 50, exp: 42, gold: [7, 13], r: 7, ai: 'hop', drop: ['jelly', .7], fx: ['burn', 3, .5] },
  salam: { name: 'Salamander', tex: 'salam', hp: 84, atk: 26, def: 8, spd: 40, exp: 40, gold: [7, 12], r: 6, ai: 'walk', side: 1, drop: ['scale', .6], fx: ['burn', 4, .5] },
  golemi: { name: 'Golem Es', tex: 'golemi', hp: 190, atk: 32, def: 16, spd: 26, exp: 80, gold: [14, 24], r: 10, ai: 'golem', drop: ['shard', .6], fx: ['chill', 3, .6] },
  kryos: { name: 'Naga Es Kryos', tex: 'snakei', hp: 980, atk: 36, def: 16, spd: 62, exp: 800, gold: [400, 400], r: 13, ai: 'dboss', scale: 2.8, side: 1, fx: ['chill', 3, .7], adds: ['wolfs', 'golemi', 'wolfs'] },
  // Buronan Monster Langka Kota Lumina (#241)
  bounty_wolf: { name: 'Taring Perak', tex: 'wolfs', hp: 320, atk: 28, def: 10, spd: 88, exp: 280, gold: [180, 220], r: 10, ai: 'lunge', side: 1, scale: 1.4, drop: ['pelt', 1], isBounty: true },
  bounty_frog: { name: 'Raja Rawa Toksin', tex: 'frog', hp: 380, atk: 26, def: 12, spd: 58, exp: 320, gold: [220, 260], r: 11, ai: 'hop', scale: 1.6, drop: ['scale', 1], fx: ['poison', 6, .7], isBounty: true },
  bounty_gargoyle: { name: 'Gargoyle Merah', tex: 'batc', hp: 360, atk: 30, def: 14, spd: 76, exp: 350, gold: [250, 300], r: 10, ai: 'fly', fly: 1, scale: 1.5, drop: ['shard', 1], fx: ['burn', 4, .6], isBounty: true },
  // Raja Slime Membelah Diri (#197)
  king_slime: { name: 'Raja Slime Mahkota', tex: 'slime', hp: 130, atk: 11, def: 4, spd: 46, exp: 60, gold: [45, 80], r: 12, ai: 'hop', scale: 1.65, drop: ['amethyst_gem', .4] },
  // Skuad Taktis Goblin: Pemanah & Dukun (#181 & #183)
  goblin_archer: { name: 'Goblin Pemanah', tex: 'goblin_archer_hd', scale: 0.46, hp: 28, atk: 9, def: 2, spd: 50, exp: 20, gold: [5, 10], r: 7, ai: 'shoot', proj: 'arrow', drop: ['sarrow', .5] },
  goblin_shaman: { name: 'Dukun Goblin', tex: 'ch_goblin', hp: 42, atk: 8, def: 4, spd: 42, exp: 35, gold: [8, 16], r: 8, ai: 'shaman', ch: 1, drop: ['herb', .7] },
};
const PROJ = { spore: { key: 'spore', spd: 72, fx: ['poison', 4, .5] }, seed: { key: 'seed', spd: 84 }, bone: { key: 'bone', spd: 96, spin: 1 }, rock: { key: 'rockshot', spd: 110, spin: 1 }, venom: { key: 'venom', spd: 96, fx: ['poison', 5, .6] }, ice: { key: 'icebolt', spd: 112, fx: ['chill', 3, .7] }, arrow: { key: 'spore', spd: 90 } };
const BOSS_AI = ['boss', 'gboss', 'qboss', 'sboss', 'wboss', 'dboss'];
const BEAST = Object.keys(ENEMY).filter(k => !BOSS_AI.includes(ENEMY[k].ai));
