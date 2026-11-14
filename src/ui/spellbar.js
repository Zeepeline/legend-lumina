'use strict';
// Bilah 5 slot jurus dengan cooldown (T327)
let SPELLBAR = null;
function buildSpellbar() {
  if (SPELLBAR) SPELLBAR.remove();
  SPELLBAR = document.createElement('div');
  SPELLBAR.id = 'spellbar';
  UI.appendChild(SPELLBAR);
  updSpellbar();
}

function updSpellbar() {
  if (!SPELLBAR) return;
  if (G.title || G.lock) { SPELLBAR.style.display = 'none'; return; }
  const learnedIds = Object.keys(JURUS).filter(k => learned(k));
  if (!learnedIds.length) { SPELLBAR.style.display = 'none'; return; }
  SPELLBAR.style.display = 'flex';
  const slots = learnedIds.slice(0, 5);
  const sc = G.scene;
  const pl = sc?.pl;

  let html = '';
  for (const id of slots) {
    const J = JURUS[id];
    const isAct = (S.spell === id);
    const noMp = (J.kind === 'spell' && S.mp < (J.mp || 0));
    let cdPct = 0;
    if (id === 'dash' && sc?.dashCd > 0) cdPct = Math.max(0, Math.min(1, sc.dashCd / 0.85));
    else if (id === 'spin' && sc?.holdA > 0) cdPct = Math.max(0, Math.min(1, sc.holdA / 0.45));
    else if (J.kind === 'spell' && pl?.atkCd > 0) cdPct = Math.max(0, Math.min(1, pl.atkCd / 0.5));

    const cls = ['s-slot', isAct ? 'act' : '', noMp ? 'nomp' : ''].filter(Boolean).join(' ');
    const icon = { fire: '🔥', dash: '»', spin: '⚔', venom: '☣', nova: '❄', heal: '💚', holy: '✨' }[id] || '✦';
    html += `<div class="${cls}" data-id="${id}">
      <span class="s-ic">${icon}</span>
      ${J.mp ? `<span class="s-mp">${J.mp}</span>` : ''}
      ${cdPct > 0 ? `<div class="s-cd" style="--cd:${Math.round(cdPct * 360)}deg"></div>` : ''}
    </div>`;
  }
  SPELLBAR.innerHTML = html;
  SPELLBAR.querySelectorAll('.s-slot').forEach(el => {
    el.onpointerdown = e => {
      e.stopPropagation();
      const id = el.dataset.id;
      if (JURUS[id]?.kind === 'spell') {
        S.spell = id;
        sfx('ok');
        updSpellbar();
      }
    };
  });
}

