'use strict';
// Gelembung emosi NPC buatan kode (!, ?, hati, air mata, marah, keringat, zzz) + tekstur kecil pendukung (rantai, roti). Selalu berbatas waktu.
const NPC_EMO_PAL = { r: '#d8342a', p: '#ffb0a8', b: '#2f78d8', w: '#e8f6ff', z: '#6a5aa8', g: '#8a8a98' };
const NPC_EMO = {
  '!': ['...rrr...', '...rrr...', '...rrr...', '...rrr...', '....r....', '....r....', '.........', '...rrr...', '...rrr...'],
  '?': ['..bbbbb..', '.bb...bb.', '.bb...bb.', '......bb.', '....bbb..', '...bb....', '...bb....', '.........', '...bb....'],
  heart: ['.rr...rr.', 'rrrr.rrrr', 'rpprrrrrr', 'rrrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'],
  tear: ['....b....', '....b....', '...bbb...', '...bbb...', '..bbwbb..', '..bbbbb..', '..bbbbb..', '...bbb...', '.........'],
  anger: ['..r...r..', '..r...r..', 'rrrrrrrrr', '..r...r..', '..r...r..', 'rrrrrrrrr', '..r...r..', '..r...r..', '.........'],
  sweat: ['.....b...', '....bbb..', '...bwbb..', '...bbbb..', '.b.......', 'bbb......', 'bwb......', 'bbb......', '.b.......'],
  zzz: ['zzzzzz...', '....z....', '...z.....', '..z......', '.zzzzz.zz', '.......z.', '......z..', '.....zzz.', '.........'],
};
NPC_EMO.tears = NPC_EMO.tear; NPC_EMO.love = NPC_EMO.heart; NPC_EMO.sleep = NPC_EMO.zzz; NPC_EMO.surprise = NPC_EMO['!']; NPC_EMO.ask = NPC_EMO['?'];
function npcPixTex(sc, key, rows, pal, ox = 0, oy = 0, W, H) {
  if (sc.textures.exists(key)) return key;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  rows.forEach((r, j) => {
    for (let i = 0; i < r.length; i++) if (r[i] !== '.') { x.fillStyle = pal[r[i]]; x.fillRect(ox + i, oy + j, 1, 1); }
  });
  sc.textures.addCanvas(key, c); return key;
}
/* gelembung putih berbingkai 13x13 + ekor, ikon 9x9 di dalam */
function npcEmoTex(sc, kind) {
  const key = 'emo_' + kind; if (sc.textures.exists(key)) return key;
  const c = document.createElement('canvas'); c.width = 13; c.height = 16; const x = c.getContext('2d');
  x.fillStyle = '#3a2a20'; x.fillRect(1, 0, 11, 13); x.fillRect(0, 1, 13, 11); x.fillRect(5, 13, 3, 2); x.fillRect(6, 15, 1, 1);
  x.fillStyle = '#ffffff'; x.fillRect(2, 1, 9, 11); x.fillRect(1, 2, 11, 9); x.fillRect(6, 13, 1, 1);
  NPC_EMO[kind].forEach((r, j) => {
    for (let i = 0; i < r.length; i++) if (r[i] !== '.') { x.fillStyle = NPC_EMO_PAL[r[i]]; x.fillRect(2 + i, 2 + j, 1, 1); }
  });
  sc.textures.addCanvas(key, c); return key;
}
function npcExtraTex(sc) {
  npcPixTex(sc, 'npc_chain', ['gg.gg.gg.gg.gg.gg', 'g.g.g.g.g.g.g.g.g'], { g: '#9a9aa8' }, 0, 1, 17, 4);
  npcPixTex(sc, 'npc_bread', ['..bbbb..', '.bhhbbb.', 'bhbbbbbb', 'bbbbbbdd', '.dddddd.'], { b: '#c8863a', h: '#f0c070', d: '#7a4a20' }, 0, 0, 8, 5);
}
World.prototype._npcEmoteTxt = World.prototype.npcEmote; /* emoji teks lama dari brain.js */
Object.assign(World.prototype, {
  /* kind: '!' '?' heart tear anger sweat zzz (selain itu = emoji teks lama). secs dibatasi 0.3..8 detik. */
  npcEmote(o, kind, secs = 1.6) {
    if (!o) return;
    if (!NPC_EMO[kind]) return this._npcEmoteTxt(o, kind, secs);
    const s = o.spr; if (!s || !s.active) return;
    if (!o.bub) { o.bub = this.add.image(s.x, s.y, npcEmoTex(this, kind)).setOrigin(.5, 1).setDepth(1.96e5).setVisible(false); }
    o.bub.setTexture(npcEmoTex(this, kind)); o.bubT = Math.max(.3, Math.min(8, secs)); o.bubAge = 0; o.bub.setVisible(true);
  },
  npcEmoteClear(o) { if (o && o.bub) { o.bub.setVisible(false); o.bubT = 0; } },
  npcBubbleTick(o, dt) {
    if (!o.bub) return;
    const s = o.spr;
    if (!s || !s.active || !s.visible || o.away) { o.bub.setVisible(false); o.bubT = 0; return; }
    if (!(o.bubT > 0)) { if (o.bub.visible) o.bub.setVisible(false); return; }
    o.bubT -= dt; o.bubAge += dt;
    if (o.bubT <= 0) { o.bub.setVisible(false); return; }
    const sc = o.baseSc || 1, F = NPC_FR[o.ch], top = F ? F.top : 6, pop = Math.min(1, o.bubAge * 7), k = pop < 1 ? .4 + pop * .75 : 1.0;
    const dead = o.act && (o.act.name === 'die' || o.act.name === 'fall' || o.act.name === 'captive' || o.act.name === 'mourn');
    const headY = s.y - (dead ? 16 : (s.height - top)) * sc - 2;
    o.bub.setPosition(Math.round(s.x), Math.round(headY - 2 + Math.sin(o.bubAge * 5) * 1)).setScale(k).setAlpha(o.bubT < .3 ? o.bubT / .3 : 1);
  },
});
