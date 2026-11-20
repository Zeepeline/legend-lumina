'use strict';
// TAMPILAN ISOMETRIK untuk game utama (tahap 1). Saklar: ?iso=1 (diingat di localStorage 'lumina_iso'), matikan: ?iso=0.
// Logika, fisika, tembok, NPC, misi, simpanan TIDAK berubah (tetap top-down); hanya tampilan diproyeksikan 2:1:
//   layar = pusat + zoom·(x − y, (x + y) / 2) relatif pusat kamera.
// • Kamera World (luar ruang) & GL: matriks proyeksi; worldView = kotak dunia yang terlihat → cull/stream/ambient tetap benar.
// • Objek tegak (depth > −5e5; lapisan tanah game ≤ −8e5): selama render diputar −45° & diskala (0,707; 1,414) → tampil berdiri; kedalaman + x.
// • Objek layar (scrollFactor 0): posisi & bentuk dikompensasi penuh → tidak ikut miring.
// • Arah gerak: masukan layar → arah dunia (Input.vec). Kamera tanpa batas peta (pandangan belah ketupat).
// Ruang dalam (gambar ruangan pemilik), judul, gua bergambar ruangan: tetap top-down.
// Sisa pekerjaan & catatan: docs/HANDOFF_ISO.md.
const ISO_VIEW = (() => {
  try {
    // Mode isometrik hanya aktif jika eksplisit diminta via URL (?iso=1)
    if (typeof location !== 'undefined' && /[?&]iso=1\b/.test(location.search)) return true;
    if (typeof localStorage !== 'undefined') localStorage.removeItem('lumina_iso');
    return false;
  } catch (_) { return false; }
})();
const ISO_ZOOM = .88; // kamera lebih tajam di isometrik (menghindari burik akibat downscale 0.72×)
const ISO_FLATD = -5e5, ISO_R = -Math.PI / 4, ISO_SX = Math.SQRT1_2, ISO_SY = Math.SQRT2;
function isoActive() { const A = G.scene; return ISO_VIEW && !!(A && A.M && !A.M.indoor && !G.title && A.M.ground !== 'room'); }
function isoScenes(game) { return game.scene.scenes.filter(s => s.sys.isActive() && s.cameras && (s instanceof World || s.sys.settings.key === 'GL')); }
if (ISO_VIEW && typeof Phaser !== 'undefined') {
  // kamera: matriks proyeksi + pandangan dunia belah ketupat
  const C = Phaser.Cameras.Scene2D.Camera.prototype, pre0 = C.preRender;
  C.preRender = function () {
    pre0.call(this);
    if (!this.isoOn) return;
    const z = this.zoomX * ISO_ZOOM, ox = this.width * this.originX, oy = this.height * this.originY;
    this.matrix.setTransform(z, .5 * z, -z, .5 * z, Math.round(this.x + ox), Math.round(this.y + oy)); this.matrix.translate(-ox, -oy);
    const mx = this.scrollX + this.width / 2, my = this.scrollY + this.height / 2, h = (this.width / 4 + this.height / 2) / z;
    this.worldView.setTo(mx - h, my - h, 2 * h, 2 * h);
  };
  // arah masukan: layar → dunia (kecepatan gerak di layar seragam 1:1 tanpa distorsi 2:1)
  const vec0 = Input.vec;
  Input.screenVec = vec0;
  Input.vec = () => {
    const v = vec0(); if (!isoActive() || (!v.x && !v.y)) return v;
    return { x: .5 * v.x + v.y, y: v.y - .5 * v.x };
  };
  // kamera tanpa batas peta saat isometrik (batas persegi memotong pandangan belah ketupat)
  const cam0 = World.prototype.camStep;
  World.prototype.camStep = function () {
    if (!isoActive()) return cam0.apply(this, arguments);
    const B = this.camB; this.camB = { x0: -1e6, y0: -1e6, x1: 1e6, y1: 1e6 };
    try { return cam0.apply(this, arguments); } finally { this.camB = B; }
  };
  // kompensasi objek selama render (dipulihkan langsung setelah scene dirender)
  const COMP = [];
  const after = () => {
    for (let i = 0; i < COMP.length; i += 6) {
      const o = COMP[i]; o.x = COMP[i + 1]; o.y = COMP[i + 2]; o.rotation = COMP[i + 3]; o.scaleX = COMP[i + 4]; o.scaleY = COMP[i + 5];
    }
    COMP.length = 0;
  };
  const CM = Phaser.Cameras.Scene2D.CameraManager.prototype, cmRender0 = CM.render;
  CM.render = function (renderer, displayList) {
    const s = this.scene;
    const isIso = isoActive() && (s instanceof World || (s.sys && s.sys.settings.key === 'GL'));
    if (!isIso) return cmRender0.call(this, renderer, displayList);
    after();
    const cam = this.main; if (cam) cam.isoOn = true;
    const ox = cam ? cam.width * cam.originX : 0, oy = cam ? cam.height * cam.originY : 0;
    for (const o of displayList.getChildren()) {
      if (!o.visible || o.isoFlat || o.rotation === undefined || o.type === 'ParticleEmitter') continue;
      const sf0 = o.scrollFactorX === 0;
      if (!sf0 && (o.depth <= ISO_FLATD || o.type === 'Graphics' || o.displayWidth > 420 || o.displayHeight > 420)) continue;
      COMP.push(o, o.x, o.y, o.rotation, o.scaleX, o.scaleY);
      if (sf0) {
        const k = 1 / ISO_ZOOM, u = (o.x - ox) * k, v = (o.y - oy) * k;
        o.x = ox + .5 * u + v; o.y = oy - .5 * u + v;
        o.rotation += ISO_R; o.scaleX *= ISO_SX * k; o.scaleY *= ISO_SY * k;
      } else {
        if (o.depth !== o._isoD) o._isoB = o.depth;
        const nd = Math.abs(o._isoB - o.y) < 600 ? o._isoB + o.x : o._isoB;
        if (o.depth !== nd) o.depth = nd; o._isoD = o.depth;
        o.rotation += ISO_R; o.scaleX *= ISO_SX; o.scaleY *= ISO_SY;
      }
    }
    try {
      return cmRender0.call(this, renderer, displayList);
    } finally {
      after();
    }
  };
  const hook = () => {
    if (typeof game === 'undefined' || !game || !game.events) return setTimeout(hook, 50);
    game.events.on('pause', after); game.events.on('hidden', after);
    window.addEventListener('blur', after);
    document.addEventListener('visibilitychange', () => { if (document.hidden) after(); });
  };
  hook();
}
