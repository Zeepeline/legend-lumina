'use strict';
// H3a: Sistem Asal-Usul (4 Ras x 4 Kelas) & Penskalaan Silang Atribut ala Dimraeth
const ORIGIN_RACES = {
  manusia: {
    id: 'manusia', n: 'Manusia Lumina', ic: '☀', col: '#ffd25a',
    d: 'Seimbang & adaptif. Memperkuat ATK, MAG, & HP seiring level, +3% Crit.',
    perk: '+25% EXP · +1 ATK & MAG tiap 4 Lv',
    bonus: (st, lv, attr) => {
      const k = 1 + Math.floor(lv / 4);
      st.atk += k; st.mag += k; st.maxhp += 6;
      st.crit = (st.crit || 0) + .03;
    }
  },
  rimba: {
    id: 'rimba', n: 'Penjaga Rimba', ic: '🌿', col: '#6ee07a',
    d: 'Lincah di hutan & rawa. 40% AGI menambah ATK & kecepatan gerak.',
    perk: 'Silang: 40% AGI → +ATK · +6% Spd · +15 STA',
    bonus: (st, lv, attr) => {
      st.atk += Math.round((attr.agi || 0) * .4);
      st.spd = Math.round((st.spd + .06) * 100) / 100;
      st.maxsta = (st.maxsta || 100) + 15;
      st.crit = (st.crit || 0) + .04;
    }
  },
  aurel: {
    id: 'aurel', n: 'Darah Aurel', ic: '✨', col: '#9ae6ff',
    d: 'Pewaris sihir kuno. 40% STR ikut menambah MAG & aliran mana.',
    perk: 'Silang: 40% STR → +MAG · +6 MP · +1 Regen',
    bonus: (st, lv, attr) => {
      st.mag += Math.round((attr.str || 0) * .4) + 3;
      st.maxmp += 6;
      st.regen = (st.regen || 0) + 1;
    }
  },
  baja: {
    id: 'baja', n: 'Baja Pegunungan', ic: '🛡', col: '#d8b08a',
    d: 'Kokoh bagai batu karang. 35% VIT ikut menjadi kekuatan serangan.',
    perk: 'Silang: 35% VIT → +ATK · +2 DEF · +14 HP',
    bonus: (st, lv, attr) => {
      st.atk += Math.round((attr.vit || 0) * .35);
      st.def += 2;
      st.maxhp += 14;
    }
  }
};

const ORIGIN_CLASSES = {
  pendekar: {
    id: 'pendekar', n: 'Pendekar', ic: '⚔',
    d: 'Ahli kombo pedang & tebasan berat.',
    perk: '+2 ATK · +8 HP · +3% Crit',
    apply: st => { st.atk += 2; st.maxhp += 8; st.crit = (st.crit || 0) + .03; }
  },
  pemburu: {
    id: 'pemburu', n: 'Pemburu', ic: '🏹',
    d: 'Penembak jitu busur & penghindar gesit.',
    perk: '+8% Crit · +5% Spd · +12 STA',
    apply: st => { st.crit = (st.crit || 0) + .08; st.spd = Math.round((st.spd + .05) * 100) / 100; st.maxsta = (st.maxsta || 100) + 12; }
  },
  penyihir: {
    id: 'penyihir', n: 'Penyihir', ic: '🔮',
    d: 'Pengendali mantra elemen & reservoir mana.',
    perk: '+4 MAG · +8 MP · +1 Regen MP',
    apply: st => { st.mag += 4; st.maxmp += 8; st.regen = (st.regen || 0) + 1; }
  },
  pengelana: {
    id: 'pengelana', n: 'Pengelana', ic: '🧭',
    d: 'Tangguh melintasi rawa, tebing & gua gelap.',
    perk: '+1 DEF · +20 STA · +10 HP · +4% Spd',
    apply: st => { st.def += 1; st.maxsta = (st.maxsta || 100) + 20; st.maxhp += 10; st.spd = Math.round((st.spd + .04) * 100) / 100; }
  }
};

function getOriginData() {
  const o = (typeof S !== 'undefined' && S && S.origin) || { cls: 'pendekar', race: 'manusia' };
  const race = ORIGIN_RACES[o.race] || ORIGIN_RACES.manusia;
  const cls = ORIGIN_CLASSES[o.cls] || ORIGIN_CLASSES.pendekar;
  return { race, cls, title: `${cls.n} ${race.n}` };
}

(() => {
  const stat0 = stat;
  stat = function () { // eslint-disable-line no-global-assign
    const st = stat0.apply(this, arguments);
    if (typeof S === 'undefined' || !S) return st;
    const { race, cls } = getOriginData();
    const attr = S.attr || { str: 0, int: 0, vit: 0, agi: 0 };
    race.bonus(st, S.lv || 1, attr);
    cls.apply(st);
    return st;
  };
})();
