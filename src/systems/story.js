'use strict';
// Segel kuil, Mochi hilang, kristal, peti harta
Object.assign(World.prototype, {
  async touchBarrier() {
    const n = S.inv.seal || 0;
    if (S.stage < 2) return talk(null, ['Dinding cahaya ungu menutup jalan ke kuil. Ada tiga lubang berbentuk kepingan di tengahnya.']);
    if (n < 3) return talk(null, [`Segel ini butuh 3 Pecahan Segel. Kamu punya ${n}/3.`, 'Pemimpin monster di hutan menyimpannya: perkemahan goblin (timur), kebun jamur (barat daya), sarang ular (tenggara).']);
    G.lock++; addItem('seal', -3); S.flags.seal_open = 1; S.stage = 3; updHud();
    sfx('heal'); this.cameras.main.flash(500, 220, 200, 255); this.sparkle(this.barrier.s.x, this.barrier.s.y - 20, 'dot', 30);
    this.tweens.add({ targets: this.barrier.s, alpha: 0, scaleY: 1.6, duration: 700, onComplete: () => this.barrier.s.destroy() });
    this.walls.remove(this.barrier.w, true, true);
    await sleep(800); banner('Segel terbuka!', 'KUIL KRISTAL', true, 1800); await sleep(1500);
    await say('Ketiga pecahan menyatu dan segel pecah. Hawa jahat terasa dari dalam kuil...'); G.lock--; saveGame(this);
  },
  async takeMochi() {
    G.lock++; sfx('ok'); this.mochi.destroy(); this.inter = this.inter.filter(i => !(i.x === this.M.mochi.x && i.y === this.M.mochi.y));
    S.side.mochi = 2; addItem('mochi'); updHud(); await say('Meong~! Kamu menemukan Mochi, kucing putih Lina. Ia langsung meringkuk di tasmu.'); G.lock--;
  },
  async useCrystal() {
    if (S.stage >= 5) return talk(null, ['Kristal Lumina bersinar hangat. Rasanya tenang sekali di sini.']);
    if (S.stage < 4) return talk(null, ['Kristalnya redup dan dingin. Ada sesuatu yang menyerap cahayanya...']);
    G.lock++; sfx('heal'); this.crystal.setTexture('crystal_lit').play('crystal_lit');
    this.cameras.main.flash(600, 200, 240, 255); this.sparkle(this.crystal.x, this.crystal.y - 16, 'dot', 26);
    const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp; S.stage = 5; updHud();
    await sleep(700); banner('Kristal Lumina pulih!', 'MISI SELESAI', true, 2000); await sleep(1800);
    await say('Cahaya kristal memulihkan seluruh tenagamu. Saatnya pulang dan melapor ke Tetua Bram.');
    G.lock--; saveGame(this);
  },
  async openChest(c, spr) {
    if (S.flags[c.id]) return talk(null, ['Petinya sudah kosong.']);
    if (c.lock) { if (!has('key')) return talk(null, ['Peti ini terkunci rapat. Lubang kuncinya berkarat... mungkin ada kunci tua di suatu tempat.']); addItem('key', -1); await say('Kunci Tua berputar... KLIK! Peti terbuka.'); }
    S.flags[c.id] = true; spr.setTexture('chesto'); sfx('chest'); G.lock++;
    this.sparkle(c.x, c.y - 10, 'doto', 12); await sleep(300);
    const G2 = { iron: ['isword', 1], ether2: ['ether', 2], ether3: ['ether', 3], potion2: ['potion', 2], potion3: ['potion', 3], hipotion2: ['hipotion', 2], ring: ['ring', 1], shield: ['cshield', 1], key: ['key', 1], mring: ['mring', 1] }[c.item];
    let msg;
    if (c.item.startsWith('gold')) { const n = +c.item.slice(4); S.gold += n; msg = `Dapat ${n} G!`; }
    else { addItem(G2[0], G2[1]); const it = ITEMS[G2[0]]; msg = `Dapat ${it.n}${G2[1] > 1 ? ' x' + G2[1] : ''}!` + (it.k === 'wpn' || it.k === 'arm' || it.k === 'acc' ? ' Pasang lewat TAS.' : ''); }
    updHud(); await say(msg); G.lock--;
  },
});
