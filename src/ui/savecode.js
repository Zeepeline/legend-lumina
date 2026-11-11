'use strict';
// Kode save: ekspor/impor progres sebagai teks (pindah perangkat / cadangan)
const CODE_TAG = 'LUMINA1:';
function saveCode() { return CODE_TAG + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function readCode(t) {
  t = (t || '').replace(/\s+/g, ''); if (!t.startsWith(CODE_TAG)) return null;
  try { const o = JSON.parse(decodeURIComponent(escape(atob(t.slice(CODE_TAG.length))))); return o && o.lv ? o : null; } catch (_) { return null; }
}
// mode 'out': tampilkan kode untuk disalin. mode 'in': tempel kode, kembalikan true jika berhasil dimuat ke localStorage.
function codeDialog(mode) {
  return new Promise(res => {
    G.lock++; const prev = UIH;
    const w = win('menu codew', `<div class="mh">${mode === 'out' ? 'Ekspor Save' : 'Impor Save'}</div>
      <div class="mf" style="margin:2px 0 4px">${mode === 'out' ? 'Salin kode ini dan simpan di tempat aman (catatan, chat ke diri sendiri). Tempel di menu Impor di perangkat lain.' : 'Tempel kode save di bawah. Progres sekarang akan diganti.'}</div>
      <textarea spellcheck="false" ${mode === 'out' ? 'readonly' : 'placeholder="LUMINA1:..."'}></textarea>
      <div class="cbtn"><span class="opt sel" data-a="ok">${mode === 'out' ? 'Salin' : 'Muat'}</span><span class="opt" data-a="x">Tutup</span></div>`);
    Object.assign(w.style, { left: '12px', right: '12px', top: '24px' });
    const ta = w.querySelector('textarea'); if (mode === 'out') ta.value = saveCode();
    ta.addEventListener('keydown', e => e.stopPropagation()); ta.addEventListener('keyup', e => e.stopPropagation());
    const msg = w.querySelector('.mf');
    const done = v => { w.remove(); UIH = prev; G.lock--; res(v); };
    const act = async a => {
      if (a === 'x') return done(false);
      if (mode === 'out') { ta.select(); try { await navigator.clipboard.writeText(ta.value); msg.textContent = 'Tersalin! Simpan kode ini baik-baik.'; } catch (_) { try { document.execCommand('copy'); msg.textContent = 'Tersalin!'; } catch (__) { msg.textContent = 'Tahan teks lalu pilih Salin.'; } } sfx('ok'); return; }
      const o = readCode(ta.value); if (!o) { sfx('buzz'); msg.textContent = 'Kode tidak valid. Pastikan disalin lengkap, diawali LUMINA1:'; return; }
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(o)); } catch (_) { }
      sfx('save'); done(true);
    };
    w.querySelectorAll('[data-a]').forEach(b => b.addEventListener('pointerdown', ev => { ev.stopPropagation(); act(b.dataset.a); }));
    UIH = k => { if (k === 'b' || k === 'menu' || k === 'back') done(false); };
    if (mode === 'in') setTimeout(() => ta.focus(), 50);
  });
}
