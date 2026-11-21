# NPC_ANIM — animasi NPC (jalan, napas, aksi cerita)

Kemampuan animasi saja; isi cerita/dialog ditulis terpisah dan memanggil API ini. Aturan identitas: `ANIMATION_RULES.md`.

## Berkas
- `src/gfx/npc_rig.js` — rig piksel: dari potret 32x32 (atau karakter kode) dibangun pose lewat potong/geser/cermin kanvas. Pita kepala/badan/kaki dideteksi otomatis dari baris piksel buram (`rigBands`). Warna/siluet = milik gambar asli. Tubuh tergeletak = putaran tepat 90 derajat (`rigLie`).
- `src/npc/npc_acts.js` — tabel aksi `NPC_ACTS` + durasi bawaan `NPC_ACT_DUR`.
- `src/npc/npc_anim.js` — mesin (`npcAct`, `npcActEnd`, napas, kait `npcBrain`/`updNpc`/`talkNpc`).
- `src/npc/npc_emote.js` — gelembung emosi kode (`npcEmote`). `src/npc/npc_demo.js` — `npcDemo()`.
- `tools/gen_npc_mila.py` — memotong `assets/raw/npc_mila/mila_sheet1.png` -> `assets/img/npc/mila_sheet.png` (28 frame 32x32, semua sisi menghadap KANAN; `flipX = (dir==='left')`).

## Frame pada tekstur `ch_<ch>`
`down0..3 up0..3 side0..3` (tetap, kompatibel), pose `w_a w_b w_p crouch stretch kneel kneel2 pray lean0 lean1 hurt stagger lie`, per arah `br<down|up|side>` (napas) & `nod<...>`.
Mila tambah: `side4`, `offer0..3` (memegang roti) dan jalan asli dari lembar. Daftar frame jalan: `npcWalkFrames(ch, dir)` (`NPC_FR[ch]`).

## API (di scene: `__game.sc.`)
- `npcAct(o, act, opts)` -> objek aksi / null. `act`: `idle talk wary cheer panic mourn pray hurt fall die captive offer walk`.
  opts umum: `dur` (detik), `hold:true` (tanpa batas), `then:'act'` + `thenOpts` (lanjut), `face:{x,y}`. Khusus: `from:{x,y}` (panic/hurt/fall), `hide:true` (panic: sembunyi di akhir), `to:{x,y}`/`spd` (walk), `item`/`emote` (offer), `side:'left|right'` (fall/die), `emote:false` (captive).
- `npcActEnd(o)` — hentikan & bersihkan (tint, overlay, bayangan, skala), otak NPC lanjut. `npcActName(o)`, `npcFind(idOrCh)`.
- `npcActMany(listOrFn, act, opts)` — banyak NPC; `opts.stagger` = jeda acak maks (detik).
- `npcEmote(o, kind, secs)` — `'!' '?' heart tear anger sweat zzz`; selain itu emoji teks lama. secs dibatasi 0.3..8.
- `npcHide(o)` / `npcShow(o)`; `await npcTalkWhile(o, say(...))` — NPC mengangguk selama dialog.
- `npcDemo(chs?, acts?)` / `npcDemoClear()` — barisan uji visual di dekat pemain.

Aksi menetap (`die`, `fall`, `captive`) tetap sampai `npcActEnd`. Selain itu berbatas waktu (lihat `NPC_ACT_DUR`).

## Perilaku otomatis
- Jalan: anim `<ch>_<arah>` memakai `npcWalkFrames`; diam: napas (`br<arah>`) tiap 2.6 dtk.
- `talkNpc` menyalakan `talk` selama dialog (tak menimpa die/mourn/captive); selalu dibersihkan di `finally`.
- Selama `o.act` aktif otak NPC (`npcBrain`) berhenti; gonggongan/reaksi ditahan. NPC `STORY_NPC` tidak diubah (radius/aturan `NPC_RULES.md`).
- Scene restart: `this.npcs` dibuat ulang, tak ada timer/tween yang bocor.

## Contoh konsol
```js
const sc = __game.sc, o = sc.npcs.find(n => n.ch === 'girl');
sc.npcAct(o, 'mourn');                 // berlutut menunduk + air mata
sc.npcAct(o, 'die', { from: sc.pl });  // jatuh lalu tergeletak (menetap)
sc.npcActEnd(o);                       // bangun/kembali rutin
sc.npcActMany(n => !n.story, 'panic', { from: sc.pl, hide: true, stagger: .6 });
```
## Batas
Potret tunggal menghadap depan di semua arah (pose samping/atas hanya geser kaki); lengan tidak digambar ulang. Hanya Mila punya jalan 4 arah asli.
