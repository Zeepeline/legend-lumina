'use strict';
// Visual Map Editor (In-Game WYSIWYG) untuk menata pohon, bangunan, dan objek secara visual langsung di browser.
// Saklar: ?edit=1 di URL, tombol [🛠️ Edit] di layar, atau tekan F2.

const MAP_EDITOR_CATEGORIES = {
  '🌲 Pohon': ['treeA', 'treeB', 'treeAd', 'treeBd', 'treeSn', 'treeSw', 'bigtree', 'apple1', 'apple2', 'stump'],
  '🌿 Semak & Bunga': ['bushG1', 'bushG2', 'bushW', 'flowers', 'pebbles', 'mush'],
  '🏠 Bangunan': ['houseA', 'houseB', 'houseC', 'well', 'inn', 'shrine', 'gatehouse', 'cwall'],
  '📦 Properti & Alam': ['lamp', 'lampPost', 'bench', 'benchWood', 'barrel', 'crate', 'cart', 'fence', 'sign', 'board', 'rock', 'campfire', 'dummy']
};

class MapEditor {
  constructor() {
    this.active = false;
    this.selectedType = null;
    this.selectedObj = null;
    this.dragTarget = null;
    this.snap = 8;
    this.panel = null;
    this.ghost = null;
    this.curCat = '🌲 Pohon';
    this.history = [];
    this.init();
  }

  init() {
    // Cek parameter URL ?edit=1
    const urlOn = typeof location !== 'undefined' && /[?&]edit=1\b/.test(location.search);
    if (urlOn) {
      window.addEventListener('load', () => setTimeout(() => this.toggle(true), 800));
    }
    // Shortcut F2 untuk toggle editor
    window.addEventListener('keydown', e => {
      if (e.key === 'F2') { e.preventDefault(); this.toggle(); }
      if (this.active && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault(); this.deleteSelected();
      }
      if (this.active && (e.key === 'Escape')) {
        this.selectedType = null; this.clearSelection();
      }
    });
    this.createFloatingButton();
  }

  createFloatingButton() {
    const btn = document.createElement('div');
    btn.id = 'mapEditorBtn';
    btn.innerHTML = '🛠️ Edit';
    btn.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:9999;background:rgba(20,24,30,0.88);' +
      'color:#f0e2b0;border:1px solid #c9a46e;border-radius:6px;padding:6px 12px;font:bold 12px sans-serif;' +
      'cursor:pointer;user-select:none;box-shadow:0 2px 8px rgba(0,0,0,0.4);';
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);
  }

  toggle(forceState) {
    this.active = forceState !== undefined ? forceState : !this.active;
    const btn = document.getElementById('mapEditorBtn');
    if (btn) btn.style.background = this.active ? '#a84224' : 'rgba(20,24,30,0.88)';
    if (this.active) {
      this.openPanel();
      this.hookScene();
      popWorld(G.scene?.pl?.x || 0, (G.scene?.pl?.y || 0) - 30, 'Mode Editor Aktif (F2)', 'gold');
    } else {
      this.closePanel();
      this.unhookScene();
    }
  }

  openPanel() {
    if (this.panel) this.panel.remove();
    const p = document.createElement('div');
    this.panel = p;
    p.id = 'mapEditorPanel';
    p.style.cssText = 'position:fixed;top:10px;left:10px;width:340px;max-height:85vh;z-index:9998;' +
      'background:rgba(18,22,28,0.95);color:#e8e0d0;border:1px solid #b58b4c;border-radius:8px;' +
      'font:12px sans-serif;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.6);' +
      'user-select:none;overflow:hidden;';

    // Header Panel
    const head = document.createElement('div');
    head.style.cssText = 'padding:8px 12px;background:#242c38;border-bottom:1px solid #4a5464;' +
      'display:flex;justify-content:space-between;align-items:center;font-weight:bold;color:#f8d488;';
    head.innerHTML = `<span>🛠️ Editor Visual Peta (${G.scene?.M?.id || 'world'})</span>`;
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'cursor:pointer;padding:2px 6px;color:#aaa;font-size:14px;';
    closeBtn.onclick = () => this.toggle(false);
    head.appendChild(closeBtn);
    p.appendChild(head);

    // Tab Kategori
    const tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;background:#181e26;border-bottom:1px solid #333d4d;overflow-x:auto;';
    for (const cat in MAP_EDITOR_CATEGORIES) {
      const t = document.createElement('div');
      t.textContent = cat;
      const isSel = this.curCat === cat;
      t.style.cssText = `padding:6px 10px;cursor:pointer;font-size:11px;white-space:nowrap;` +
        `border-bottom:2px solid ${isSel ? '#e6b054' : 'transparent'};color:${isSel ? '#fff' : '#8f9aa8'};`;
      t.onclick = () => { this.curCat = cat; this.renderPalette(); this.updateTabs(tabs); };
      tabs.appendChild(t);
    }
    this.tabsEl = tabs;
    p.appendChild(tabs);

    // Wadah Palet Objek
    const pal = document.createElement('div');
    pal.id = 'mapEditorPalette';
    pal.style.cssText = 'padding:10px;display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;' +
      'max-height:220px;overflow-y:auto;background:#12161c;';
    p.appendChild(pal);
    this.paletteEl = pal;
    this.renderPalette();

    // Bar Status & Kontrol
    const ctrl = document.createElement('div');
    ctrl.style.cssText = 'padding:8px 12px;background:#1a202a;border-top:1px solid #333d4d;font-size:11px;';
    ctrl.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span id="medCoord">Posisi: -</span>
        <span>Snap: <b id="medSnap" style="cursor:pointer;color:#e6b054">${this.snap}px</b></span>
      </div>
      <div style="display:flex;gap:6px;">
        <button id="medBtnSelect"
          style="flex:1;padding:4px;cursor:pointer;background:#323e50;color:#fff;border:1px solid #506075;border-radius:4px;">✋ Geser</button>
        <button id="medBtnDel"
          style="flex:1;padding:4px;cursor:pointer;background:#632620;color:#fff;border:1px solid #94382f;border-radius:4px;">🗑️ Hapus</button>
        <button id="medBtnExport"
          style="flex:1;padding:4px;cursor:pointer;background:#2d5830;color:#fff;border:1px solid #4a8a4f;border-radius:4px;">📋 Salin</button>
      </div>
    `;
    p.appendChild(ctrl);
    document.body.appendChild(p);

    // Event listener tombol kontrol
    ctrl.querySelector('#medSnap').onclick = () => {
      this.snap = this.snap === 0 ? 8 : this.snap === 8 ? 16 : this.snap === 16 ? 32 : 0;
      ctrl.querySelector('#medSnap').textContent = this.snap ? `${this.snap}px` : 'Bebas';
    };
    ctrl.querySelector('#medBtnSelect').onclick = () => { this.selectedType = null; this.renderPalette(); };
    ctrl.querySelector('#medBtnDel').onclick = () => this.deleteSelected();
    ctrl.querySelector('#medBtnExport').onclick = () => this.exportObjs();
  }

  updateTabs(tabs) {
    Array.from(tabs.children).forEach(t => {
      const isSel = t.textContent === this.curCat;
      t.style.borderBottom = `2px solid ${isSel ? '#e6b054' : 'transparent'}`;
      t.style.color = isSel ? '#fff' : '#8f9aa8';
    });
  }

  renderPalette() {
    if (!this.paletteEl) return;
    this.paletteEl.innerHTML = '';
    const items = MAP_EDITOR_CATEGORIES[this.curCat] || [];
    for (const key of items) {
      const d = OBJ[key]; if (!d) continue;
      const it = document.createElement('div');
      const isSel = this.selectedType === key;
      it.style.cssText = `padding:6px;border-radius:4px;cursor:pointer;text-align:center;background:${isSel ? '#4a3b1d' : '#1e2530'};` +
        `border:1px solid ${isSel ? '#f0c050' : '#2d3745'};color:${isSel ? '#fff' : '#c0c8d4'};`;
      it.innerHTML = `<div style="font-weight:bold;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${key}</div>` +
        `<small style="color:#7f8c9b;font-size:9px;">${d.col ? `${d.col[0]}×${d.col[1]}` : 'dekor'}</small>`;
      it.onclick = () => {
        this.selectedType = this.selectedType === key ? null : key;
        this.clearSelection();
        this.renderPalette();
      };
      this.paletteEl.appendChild(it);
    }
  }

  closePanel() {
    if (this.panel) { this.panel.remove(); this.panel = null; }
    if (this.ghost) { this.ghost.destroy(); this.ghost = null; }
  }

  hookScene() {
    const sc = G.scene; if (!sc || !sc.input) return;
    this.ptrDown = p => this.onPointerDown(p);
    this.ptrMove = p => this.onPointerMove(p);
    this.ptrUp = p => this.onPointerUp(p);
    sc.input.on('pointerdown', this.ptrDown);
    sc.input.on('pointermove', this.ptrMove);
    sc.input.on('pointerup', this.ptrUp);
  }

  unhookScene() {
    const sc = G.scene; if (!sc || !sc.input) return;
    if (this.ptrDown) sc.input.off('pointerdown', this.ptrDown);
    if (this.ptrMove) sc.input.off('pointermove', this.ptrMove);
    if (this.ptrUp) sc.input.off('pointerup', this.ptrUp);
    this.clearSelection();
  }

  snapVal(v) { return this.snap > 0 ? Math.round(v / this.snap) * this.snap : Math.round(v); }

  onPointerMove(p) {
    if (!this.active) return;
    const wx = this.snapVal(p.worldX), wy = this.snapVal(p.worldY);
    const coordEl = document.getElementById('medCoord');
    if (coordEl) coordEl.textContent = `X: ${wx}, Y: ${wy}`;

    // Update posisi Ghost Sprite penempatan
    if (this.selectedType) {
      const sc = G.scene, d = OBJ[this.selectedType];
      if (d) {
        if (!this.ghost || this.ghost.texture.key !== d.key) {
          if (this.ghost) this.ghost.destroy();
          this.ghost = sc.add.sprite(wx, wy, d.key).setOrigin(0.5, 1).setAlpha(0.65).setDepth(1e6);
        }
        this.ghost.setPosition(wx, wy);
      }
    } else if (this.ghost) {
      this.ghost.destroy(); this.ghost = null;
    }

    // Drag objek yang dipilih
    if (this.dragTarget) {
      this.dragTarget.sprite.setPosition(wx, wy);
      this.dragTarget.sprite.setDepth(wy);
      this.dragTarget.data[1] = wx;
      this.dragTarget.data[2] = wy;
    }
  }

  onPointerDown(p) {
    if (!this.active || p.button === 2) return; // klik kanan diabaikan
    const wx = this.snapVal(p.worldX), wy = this.snapVal(p.worldY);

    // Mode 1: Menaruh Objek Baru dari Palet
    if (this.selectedType) {
      this.placeObj(this.selectedType, wx, wy);
      return;
    }

    // Mode 2: Memilih / Menggeser Objek yang ada di tanah
    const found = this.findObjAt(wx, wy);
    if (found) {
      this.selectObj(found);
      this.dragTarget = found;
    } else {
      this.clearSelection();
    }
  }

  onPointerUp() {
    if (this.dragTarget) {
      sfx('tap');
      this.saveLocal();
      this.dragTarget = null;
    }
  }

  placeObj(type, x, y) {
    const sc = G.scene; if (!sc || !sc.M) return;
    const entry = [type, x, y];
    const spr = sc.spawnObj(entry);
    sc.M.objs = sc.M.objs || [];
    sc.M.objs.push(entry);
    sfx('blip');
    this.saveLocal();
    popWorld(x, y - 20, `+ ${type}`, 'heal');
  }

  findObjAt(x, y) {
    const sc = G.scene; if (!sc || !sc.M || !sc.M.objs) return null;
    // Cari objek dari tumpukan teratas (urutan terbalik)
    for (let i = sc.M.objs.length - 1; i >= 0; i--) {
      const o = sc.M.objs[i];
      const ox = o[1], oy = o[2], d = OBJ[o[0]];
      const w = (d && d.col ? d.col[0] : 32) || 32;
      const h = (d && d.col ? d.col[1] : 32) || 32;
      if (Math.abs(x - ox) <= w / 2 + 8 && y >= oy - h - 12 && y <= oy + 8) {
        // Cari sprite di display list
        const spr = sc.children.list.find(s => s.x === ox && s.y === oy && s.type === 'Sprite');
        return { data: o, sprite: spr || { x: ox, y: oy, setPosition(a, b) { this.x = a; this.y = b; }, destroy() {} } };
      }
    }
    return null;
  }

  selectObj(target) {
    this.clearSelection();
    this.selectedObj = target;
    if (target.sprite.setTint) target.sprite.setTint(0xffea60);
    const coordEl = document.getElementById('medCoord');
    if (coordEl) coordEl.textContent = `Pilih: ${target.data[0]} (${target.data[1]}, ${target.data[2]})`;
  }

  clearSelection() {
    if (this.selectedObj && this.selectedObj.sprite.clearTint) {
      this.selectedObj.sprite.clearTint();
    }
    this.selectedObj = null;
  }

  deleteSelected() {
    if (!this.selectedObj) return;
    const sc = G.scene, o = this.selectedObj.data;
    if (sc && sc.M && sc.M.objs) {
      const idx = sc.M.objs.indexOf(o);
      if (idx >= 0) sc.M.objs.splice(idx, 1);
    }
    if (this.selectedObj.sprite) this.selectedObj.sprite.destroy();
    sfx('buzz');
    popWorld(o[1], o[2] - 20, `- ${o[0]} Dihapus`, 'crit');
    this.selectedObj = null;
    this.saveLocal();
  }

  saveLocal() {
    const sc = G.scene; if (!sc || !sc.M) return;
    try {
      localStorage.setItem(`lumina_custom_objs_${sc.M.id}`, JSON.stringify(sc.M.objs));
    } catch (_) {}
  }

  exportObjs() {
    const sc = G.scene; if (!sc || !sc.M) return;
    const list = sc.M.objs || [];
    const json = JSON.stringify(list, null, 2);
    // Salin ke clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        const msg = `✅ Susunan ${list.length} objek peta '${sc.M.id}' BERHASIL DISALIN!\n\n` +
          'Anda bisa langsung menempelkannya (paste) ke file peta atau ke chat.';
        alert(msg);
      }).catch(() => prompt('Salin kode objek ini:', json));
    } else {
      prompt('Salin kode objek ini:', json);
    }
  }
}

// Inisialisasi global MapEditor
const mapEditor = new MapEditor();

// Auto-restore susunan kustom dari localStorage jika pemain pernah mengeditnya
(function restoreCustomObjs() {
  const init0 = World.prototype.initObjects;
  if (init0) {
    World.prototype.initObjects = function() {
      try {
        const saved = localStorage.getItem(`lumina_custom_objs_${this.M.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length) this.M.objs = parsed;
        }
      } catch (_) {}
      return init0.apply(this, arguments);
    };
  }
})();
