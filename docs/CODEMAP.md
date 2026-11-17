# CODEMAP (dibuat otomatis oleh `node tools/codemap.js`, JANGAN diedit manual)

Cari nama di sini (`grep -n "namaFungsi" docs/CODEMAP.md`), lalu buka file:baris itu saja.
Format: `nama` baris. Urutan file = urutan muat di index.html.

## src/core/util.js (26 baris)
_Konstanta layar & util kecil_
`IS_TOUCH` 7 · `LAYOUT_FULL` 8 · `VW` 10 · `VH` 15 · `rnd` 19 · `ri` 20 · `pick` 21 · `clamp` 22 · `sleep` 23 · `$` 24 · `SCREEN` 25

## src/core/audio.js (265 baris)
_Audio chiptune WebAudio: musik (TRACKS) & efek suara (sfx)_
`AU_FILES` 4 · `AU` 18 · `NI` 19 · `nf()` 20 · `parseSeq()` 21 · `bossBass` 22 · `TRACKS` 23 · `auInit()` 45 · `tone()` 58 · `sweep()` 59 · `noise()` 60 · `_AUDIO_POOL` 61 · `BGM_BASE_VOL` 63 · `_bgmDuck` 64 · `routeTag()` 66 · `tagVolFor()` 70 · `tagSetVol()` 74 · `tagGetVol()` 75 · `setWeatherDuck()` 76 · `_rain` 78 · `rainSound()` 79 · `setBgmDuck()` 94 · `stopAudioTag()` 98 · `playBGM()` 105 · `SFX_FILES` 159 · `_SFX_BUFFERS` 170 · `loadSfxBuffers()` 172 · `playBufferSfx()` 184 · `_lastSfx` 202 · `sfx()` 203

## src/core/input.js (333 baris)
_Input keyboard, joystick, tombol sentuh, dan layout layar_
`Input` 5 · `press()` 6 · `KEYMAP` 7 · `ISDIR` 15 · `ATK_HOLD_MS` 16 · `_atkDownT` 17 · `enableTouch()` 62 · `JOY_DEAD` 65 · `UISCALE` 229 · `PAD_STATE` 231 · `pollGamepad()` 232 · `layout()` 292

## src/art/base.js (75 baris)
_Dasar gambar: kanvas, warna, aturan gaya (toneC, garis tepi berwarna), renderMap_
`OUT` 6 · `mk()` 7 · `_rgb` 8 · `h2r()` 9 · `r2h()` 10 · `shade()` 11 · `mix()` 12 · `hash()` 13 · `vnoise()` 14 · `fr` 20 · `px` 21 · `ellF()` 22 · `rgb2hsl()` 30 · `hsl2hex()` 31 · `_tone` 32 · `hueToward()` 33 · `toneC()` 34 · `outline()` 41 · `flipC()` 54 · `mkC()` 57 · `strip()` 58 · `SHADEK` 62 · `renderMap()` 63

## src/art/nature/nature_1.js (389 baris)
_Gambar alam buatan kode (1) — isi: lihat docs/CODEMAP.md_
`LEAF` 3 · `LEAF_F` 4 · `BARK` 5 · `foliage()` 7 · `trunk()` 38 · `root()` 49 · `artBigTree()` 60 · `artFruitTree()` 102 · `artRoundTree()` 116 · `artPine()` 124 · `artBush()` 146 · `artRock()` 159 · `artLog()` 160 · `artStump()` 161 · `artMushDeco()` 162 · `artHay()` 163 · `artStalag()` 164 · `artCrystals()` 165 · `artBones()` 171 · `artBramble()` 172 · `artPebbles()` 184 · `artBloom()` 196 · `artCaveMouth()` 212 · `artFrostFlower()` 228 · `artPigeonsSpot()` 258 · `artLotusPondSpot()` 293 · `artCoffeeShrub()` 325 · `artOrchidRock()` 358

## src/art/nature/nature_2.js (372 baris)
_Gambar alam buatan kode (2) — isi: lihat docs/CODEMAP.md_
`artCanaryPerch()` 3 · `artWoodlandShrine()` 31 · `artIceHole()` 72 · `artWishTree()` 110 · `artIceChasm()` 170 · `artStoneCairn()` 211 · `artMeadowWillow()` 261 · `artHollowMangrove()` 310

## src/art/nature/nature_3.js (392 baris)
_Gambar alam buatan kode (3) — isi: lihat docs/CODEMAP.md_
`artClimberLedge()` 3 · `artHoneyTree()` 48 · `artTempleKoiPond()` 103 · `artChrysanthemumRock()` 173 · `artRiverStone()` 230 · `artGeodeRock()` 278 · `artOwlTree()` 323

## src/art/nature/nature_4.js (57 baris)
_Gambar alam buatan kode (4) — isi: lihat docs/CODEMAP.md_
`artFossilBed()` 3

## src/art/nature/dock.js (28 baris)
_Dermaga papan berlentera & perahu kayu (gaya tepi air Verdant; referensi pemilik: kolam bertepi batu + dermaga + perahu)._
`artDock()` 4 · `artBoat()` 18

## src/art/buildings/buildings_1.js (389 baris)
_Gambar bangunan & properti buatan kode (1) — isi: lihat docs/CODEMAP.md_
`artHouse()` 3 · `artFountain()` 81 · `artWell()` 106 · `artStall()` 118 · `artBoard()` 134 · `artCampfire()` 147 · `artBench()` 162 · `artBarrel()` 163 · `artCrate()` 164 · `artSign()` 165 · `artFence()` 166 · `artLamp()` 167 · `artShrine()` 169 · `artCrystal()` 178 · `artChest()` 193 · `artWindmill()` 199 · `artBlades()` 207 · `artPond()` 217 · `artBarrier()` 218 · `artAnvil()` 219 · `artForge()` 220 · `artGate()` 221 · `artBoulder()` 222 · `artPlate()` 223 · `artBell()` 224 · `artDummy()` 242 · `artTelescope()` 265 · `artShrineAltar()` 289 · `artFieldOven()` 325 · `artDripStalactite()` 353

## src/art/buildings/buildings_2.js (400 baris)
_Gambar bangunan & properti buatan kode (2) — isi: lihat docs/CODEMAP.md_
`artSwampTotem()` 3 · `artTeaTable()` 50 · `artDockBoat()` 81 · `artCoffeeKettle()` 112 · `artStreetDrum()` 143 · `artBellows()` 174 · `artRingBooth()` 207 · `artArcheryTarget()` 258 · `artLakeLighthouse()` 294 · `artCraftTable()` 342 · `artPaperBoat()` 375

## src/art/buildings/buildings_3.js (373 baris)
_Gambar bangunan & properti buatan kode (3) — isi: lihat docs/CODEMAP.md_
`artArmWrestleTable()` 3 · `artKnifeTarget()` 28 · `artCanalPier()` 80 · `artWeatherVane()` 126 · `artClockworkTower()` 172 · `artHighStriker()` 229 · `artViolinStand()` 277 · `artBirdHouse()` 323

## src/art/buildings/buildings_4.js (392 baris)
_Gambar bangunan & properti buatan kode (4) — isi: lihat docs/CODEMAP.md_
`artWoodenLoom()` 3 · `artPottersWheel()` 43 · `artCheeseBarrel()` 86 · `artStonePestle()` 137 · `artBirdBath()` 183 · `artSkewerCamp()` 229 · `artStreetGaslamp()` 289 · `artBarberChair()` 336

## src/art/buildings/buildings_5.js (119 baris)
_Gambar bangunan & properti buatan kode (5) — isi: lihat docs/CODEMAP.md_
`artGrainSifter()` 3 · `artCobblerBench()` 28 · `artPuppeteerStage()` 51 · `artSundial()` 90

## src/art/characters.js (104 baris)
_Karakter manusia (peta piksel + mod + palet di CHARS)_
`CH_BODY` 4 · `CH_LEGS` 9 · `chMods()` 14 · `chLegs()` 39 · `CH_FW` 49 · `artChar()` 50 · `CHARS` 73

## src/art/monsters.js (63 baris)
_Monster (peta piksel di MON)_
`MON` 4 · `artMon` 27 · `artWisp()` 62

## src/art/monsters2.js (72 baris)
_Monster versi garang: bentuk baru (mata menyala, taring, tanduk, duri) + pencahayaan otomatis. Menimpa MON lama, kunci palet tetap sama agar varian warna jalan._
`mixHex()` 40 · `shadeMon()` 41 · `monFrame2()` 57

## src/art/items.js (223 baris)
_Ikon item & senjata_
`SWORD` 3 · `artSword()` 4 · `artSpear()` 9 · `artAxe()` 10 · `artBow()` 11 · `artArrow()` 12 · `artCoin()` 13 · `artPotion()` 18 · `artHeart()` 19 · `artShard()` 20 · `ICON_MAP` 22 · `ICONS_DEF` 49 · `iconFallback()` 109 · `artIcon()` 115

## src/art/fx.js (148 baris)
_Efek: tebasan, api, proyektil, cahaya, bayangan_
`artSlash()` 4 · `artFire()` 21 · `artSpore()` 31 · `artDot()` 32 · `artSmoke()` 33 · `artSpark()` 34 · `artButterfly()` 35 · `artShadow()` 40 · `artBone()` 41 · `artSeed()` 42 · `artRockShot()` 43 · `artBrazier()` 44 · `artIceGate()` 45 · `artIceBolt()` 46 · `artWarp()` 47 · `artStele()` 48 · `artBoat()` 49 · `artRelief()` 50 · `artSealDoor()` 51 · `artGatehouse()` 52 · `artCityWall()` 61 · `artAcademy()` 62 · `artRoot()` 73 · `artLight()` 76 · `artRain()` 77 · `artRainBg()` 87 · `artShadowSoft()` 97 · `artFog()` 118 · `artRipple()` 119 · `artSprout()` 120 · `shadowCanvas()` 122 · `artLightP()` 130 · `artCanopyOverhang()` 131

## src/art/interior.js (62 baris)
_Lantai & perabot interior_
`FURN` 4 · `drawFurn()` 5 · `genRoom()` 15 · `artMusicBox()` 28

## src/world/objects.js (372 baris)
_Definisi objek dunia (tekstur, tabrakan, bayangan) & wadah MAPS_
`OBJ` 7 · `MAPS` 371

## src/world/spawn/spawn_1.js (362 baris)
_Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World_
`OBJ_SPAWN` 3 · obj `shrine` 5 · obj `cavemouth` 8 · obj `sign` 11 · obj `forge` 21 · obj `pebbles` 31 · obj `telescope` 39 · obj `altar` 47 · obj `fieldoven` 55 · obj `dripstone` 63 · obj `frostflower` 71 · obj `totem` 79 · obj `pigeons` 87 · obj `teatable` 95 · obj `lotuspad` 103 · obj `dockboat` 111 · obj `coffeeshrub` 166 · obj `coffeekettle` 174 · obj `orchidrock` 182 · obj `canaryperch` 190 · obj `woodlandshrine` 198 · obj `bellows` 206 · obj `ringbooth` 214 · obj `archerytarget` 222 · obj `lakelighthouse` 230 · obj `streetdrum` 238 · obj `dummy` 246 · obj `pot` 254 · obj `well` 264 · obj `apple1` 279 · obj `bench` 284 · obj `bell` 300 · obj `campfire` 308 · obj `alchemytable` 325 · obj `scenicbench` 334 · obj `mailbox` 352

## src/world/spawn/spawn_2.js (326 baris)
_Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World_
obj `bridge_wood` 4 · obj `bridge_wood_long` 7 · obj `brokenbridge` 10 · obj `board` 48 · obj `bombbarrel` 57 · obj `bramble` 87 · obj `minestone` 90 · obj `village_vault` 120 · obj `mirror_memory` 130 · obj `fame_board` 140 · obj `bounty_board` 149 · obj `deadtree` 158 · obj `rune_pillar` 186 · obj `fountain` 198 · obj `windmill` 210 · obj `treeA` 217 · obj `treeRedwood` 225 · obj `tree_redwood` 232 · obj `goblin_torch` 235 · obj `goblin_cauldron` 238 · obj `cryst` 247 · obj `lamp` 250 · obj `viewpoint` 253 · obj `lumina_shard` 287 · obj `gatehouse` 309

## src/world/ground.js (386 baris)
_Generator tanah, tabrakan grid, penyebar pohon_
`riverY()` 4 · `SD_PAD` 7 · `makeSD()` 8 · `pondE()` 28 · `GROUND` 29 · `blendW()` 41 · `BLEND_W` 47 · `WILD_G` 48 · `edgeSegs()` 49 · `edgeBlend()` 79 · `TILE_CACHE` 100 · `getTileData()` 101 · `genGround()` 112 · `blockRects()` 261 · `scatter()` 277 · `openSides()` 335 · `borderTrees()` 348 · `ringObjects()` 365 · `mapObjects()` 370 · `mapWalls()` 374

## src/world/water.js (89 baris)
_Bentuk air alami: elips `ponds` digabung halus (smooth union) jadi alur sungai menyambung,_
`WATER_WIDEN` 6 · `pondsBase()` 7 · `WGLOB` 25 · `waterGlobal()` 26 · `pondsAll()` 40 · `pondsNear()` 49 · `waterE()` 52 · `mapDoors()` 69 · `waterGXY()` 70 · `WATER_MOVABLE` 73 · `waterRelocate()` 74

## src/world/maps/village.js (127 baris)
_Peta: Desa Lumina (Tata Letak Presisi Meniru Referensi Asli)_


## src/world/maps/forest.js (110 baris)
_Peta: Hutan Lumina (3 mini-boss, kuil, Raja Goblin)_


## src/world/maps/meadow.js (95 baris)
_Peta: Padang Angin_


## src/world/maps/cave.js (37 baris)
_Peta: Gua Batu (gelap, teka-teki batu, Golem Purba)_


## src/world/maps/swamp.js (60 baris)
_Peta: Rawa Senja (bab 2, Morgath)_


## src/world/maps/snow.js (57 baris)
_Peta: Puncak Beku (bab 3, obor kuno & Naga Es Kryos)_


## src/world/maps/lake.js (59 baris)
_Peta: Danau Cermin (bab 4, lentera kuno, perahu ke Kuil Penjaga Cahaya, jalan ke Kota Lumina tertutup longsor)_


## src/world/maps/city.js (201 baris)
_Peta: Jalan Raya Lama + Kota Lumina "Kota Seribu Lentera" (gerbang, pasar, akademi, kota bawah). Desain: docs/BENUA_LUMINA.md_
`houseRow` 4 · `lampRow` 5 · `cityLines` 6 · `citizens` 14

## src/world/maps/wild.js (189 baris)
_Peta: zona alam luas — Hutan Dalam (+ Reruntuhan Aurel) di barat Hutan Lumina, Jalur Sungai dari Hutan Lumina ke Rawa Senja_
`ruinRing` 5 · `deepwoodPaths` 15 · `deepwoodPonds` 21 · `snailSwarm` 22

## src/world/maps/interiors.js (70 baris)
_Interior: penginapan, rumah pohon, rumah Lina_
`makeRoom()` 4

## src/ui/widgets.js (251 baris)
_UI DOM: dialog (say/talk), menu (choose/ask), banner, angka melayang, HUD_
`UIH` 6 · `G` 7 · `win()` 8 · `fadeTo()` 9 · `shake()` 10 · `DLG_LOG` 15 · `say()` 16 · `talk()` 41 · `choose()` 45 · `ask()` 81 · `BANNER_QUEUE` 90 · `BANNER_BUSY` 91 · `processBannerQueue()` 92 · `banner()` 105 · `POPS` 114 · `popWorld()` 115 · `updPops()` 123 · `HUD` 126 · `buildHud()` 127 · `updHud()` 141 · `hudPeaceT` 213 · `updHudFade()` 214 · `showHud()` 229 · `bossBar()` 234 · `autoSaveIcon()` 250

## src/ui/spellbar.js (54 baris)
_Bilah 5 slot jurus dengan cooldown (T327)_
`SPELLBAR` 3 · `buildSpellbar()` 4 · `updSpellbar()` 12

## src/core/state.js (164 baris)
_Status pemain (S), simpan/muat, rumus stat_
`SAVE_BASE` 6 · `slotKey` 7 · `SAVE_SLOT` 8 · `SAVE_KEY` 9 · `setSlot()` 10 · `slotInfo()` 12 · `DIRV` 27 · `S` 28 · `OPT_KEY` 30 · `DIFF` 33 · `GAME_VERSION` 35 · `OPT` 36 · `saveOpt()` 37 · `applyOpt()` 38 · `newState()` 46 · `eqv()` 47 · `UPG` 53 · `itemName` 54 · `BUFF` 56 · `buffOn` 61 · `stat()` 62 · `need()` 99 · `has` 100 · `addItem()` 101 · `hasSave()` 110 · `saveGame()` 111 · `readSaveRaw()` 122 · `loadSave()` 126

## src/data/items.js (274 baris)
_Data item & resep tempa_
`ITEMS` 4 · `ICON_OF` 186 · `COOK` 212 · `RECIPES` 220 · `SETS` 228 · `activeSets()` 263

## src/data/enemies.js (55 baris)
_Data musuh & proyektil_
`ENEMY` 5 · `PROJ` 52 · `BOSS_AI` 53 · `BEAST` 54

## src/data/bestiary_text.js (161 baris)
_Teks bestiari per musuh (id = kunci ENEMY): habitat & tips melawan. Dipasang ke layar Bestiari oleh sesi besar._
`BESTIARY_TEXT` 3

## src/data/quests.js (89 baris)
_Teks misi, tujuan misi, jurus, pencapaian_
`STAGE_TXT` 3 · `STAGE_GOAL` 33 · `SKILLS` 41 · `ACH` 46

## src/data/lore.js (65 baris)
_Jurnal: catatan lore (LORE), misteri jangka panjang (MYSTERY), penyelidikan jangka menengah (midGoal). Lihat docs/GAME_DESIGN.md_
`LORE` 4 · `MYSTERY` 37 · `midGoal()` 49 · `learn()` 58

## src/systems/daynight.js (25 baris)
_Jam & siang-malam_
`nightAmt()` 4 · `isNight()` 11 · `gameHours()` 12 · `lerpCol()` 13 · `_clk` 17 · `updClock()` 18

## src/systems/achievements.js (70 baris)
_Cek pencapaian & kabar progres 50% / 90% (T265)_
`totalKills()` 3 · `toastAch()` 5 · `achProgCheck()` 15 · `achCheck()` 61

## src/gfx/bake.js (50 baris)
_Panggang bayangan objek ke tekstur tanah_
`SHC` 3 · `bakeGround()` 4 · `SHB` 25 · `shadowIndex()` 26

## src/gfx/textures.js (195 baris)
_Muat gambar & daftarkan semua tekstur/animasi ke Phaser_
`ICONS` 4 · `IMG_LIST` 6 · `imgSubdir()` 23 · `loadImgs()` 42 · `addStrip()` 56 · `darkTree()` 61 · `NPC_W` 63 · `regPortrait()` 64 · `regChar()` 69 · `buildTextures()` 86

## src/world/ground_verdant.js (274 baris)
_Tanah Verdant (Padang, Hutan, Hutan Dalam, Desa) gaya Senja Emas (G001 - G024)._
`VERDANT` 4 · `VBAY` 5 · `VDECO` 6 · `V_TILES` 9 · `CLUTTER_PADANG` 15 · `CLUTTER_FOREST` 21 · `CLUTTER_DEEPWOOD` 28 · `ISLANDS_PADANG` 35 · `ISLANDS_FOREST` 36 · `ISLANDS_DEEPWOOD` 37 · `WATER_DECO_PADANG` 38 · `WATER_DECO_FOREST` 39 · `VT_MAP` 50 · `verdantTiles()` 51 · `vModW` 68 · `vDirtN` 70 · `vDirtT` 71 · `verdantPix()` 74 · `verdantDeco()` 89 · `VBASE` 153 · `verdantBase()` 154 · `VWC` 172 · `verdantWater()` 173 · `VSTONE` 186 · `vCobble()` 187 · `verdantBank()` 197 · `regVerdantTex()` 210 · `verdantReflect()` 219 · `verdantScallop()` 248 · `verdantEdgePix()` 263

## src/world/interior_sheet.js (89 baris)
_Interior gaya lembar pemilik (assets/raw/interior/sheet_interior.png → tools/gen_interior.py → assets/img/int_*.png)._
`INT_SIZE` 5 · `INT_FLAT` 14 · `INT_RUG` 16 · `intDims()` 17 · `rug9()` 18 · `genRoomSheet()` 30 · `_genRoom0` 78 · `sheetWalls()` 81 · `regIntTex()` 88

## src/scene/world.js (400 baris)
_Scene utama Phaser: membangun peta, update per frame, kamera. Metode lain ditambahkan lewat file mixin (Object.assign(World.prototype, ...))._
`.constructor()` 5 · `.create()` 6 · `.makeActiveFx()` 100 · `.dropActiveFx()` 113 · `.wall()` 114 · `.shadow()` 115 · `.spawnObj()` 116 · `.spawnChest()` 134 · `.spawnCrystal()` 141 · `.spawnBarrier()` 149 · `.spawnMochi()` 156 · `.spawnNpc()` 160 · `.face()` 171 · `.spawnCritter()` 172 · `.spawnFly()` 177 · `.spawnEnemy()` 182 · `.camShake()` 212 · `.update()` 213 · `.puff()` 314 · `.camStep()` 315 · `.pump()` 364 · `.front()` 373 · `.actionA()` 374 · `.sparkle()` 384 · `.checkZones()` 388

## src/systems/scene_nav.js (14 baris)
_Navigasi scene: pindah peta (goto, memuat ulang scene) & penjaga awal cerita (guardStop). Mode benua membungkus goto (benua_scene.js)._
`.goto()` 4 · `.guardStop()` 9

## src/systems/combat.js (400 baris)
_pts: titik kena [jarak dari pemain, radius]; mul: pengali damage; kb: pengali dorongan_
`WEAPON_STYLE` 3 · `.attack()` 10 · `.shootArrow()` 78 · `.aimAngle()` 91 · `.magic()` 100 · `.drink()` 114 · `.useItem()` 120 · `.hitStop()` 129 · `.hitEnemy()` 134 · `.killEnemy()` 185 · `.drop()` 262 · `.updPicks()` 273 · `.gainExp()` 292 · `.hurtPlayer()` 308 · `.eShoot()` 327 · `.shockwave()` 337 · `.updShots()` 370 · `.defeat()` 387

## src/systems/skills.js (54 baris)
_Jurus: dash, tebasan putar, nova es_
`.updSkills()` 4 · `.spin()` 18 · `.dash()` 37 · `.nova()` 44

## src/systems/spell_fx.js (218 baris)
_Efek visual sihir: lingkar rune, proyektil, ledakan, dan aura (T318-T322)_
`RUNE_COL` 3 · `.runeCircle()` 11 · `.spellFx()` 32

## src/systems/learn.js (71 baris)
_Sistem belajar jurus: dipelajari dari guru (NPC), lalu makin mahir dengan dipakai (tingkat I–III)._
`JURUS` 4 · `MASTERY` 13 · `tierOf` 14 · `learned` 15 · `useJurus()` 16 · `canTeach` 20 · `.learnTalk()` 23 · `.castSpell()` 38

## src/systems/ambient.js (341 baris)
_Suasana alam: hewan kecil yang bereaksi ke pemain, kunang-kunang, ikan melompat, bayangan awan, berkas cahaya, kabut, suara latar, tanaman yang bisa dipungut._
`ENV` 4 · `artCritters()` 18 · `.spawnAmbient()` 38 · `.addBird()` 70 · `.addFly()` 77 · `.addCrit()` 84 · `.updAmbient()` 92 · `.ambOff()` 213 · `.ripple()` 214 · `.spawnRainEmitters()` 228 · `.rainSplash()` 240 · `.updRainFx()` 248 · `artQuestArrow()` 322 · `.updQuestGuide()` 329

## src/systems/status.js (125 baris)
_Efek status: racun/terbakar/dingin pada pemain, terbakar/beku pada musuh_
`STATUS` 5 · `.inflict()` 12 · `.cure()` 23 · `.speedMul()` 24 · `.updStatus()` 29 · `.enemyStatus()` 60 · `.poisonEnemy()` 101 · `.burnEnemy()` 102 · `.freezeEnemy()` 103 · `updStatusHud()` 110

## src/systems/chapter3.js (133 baris)
_Bab 3: obor kuno, gerbang es, Naga Es Kryos (AI 'dboss')_
`.spawnTorches()` 4 · `.spawnCaveTorches()` 13 · `.lightTorch()` 57 · `.spawnIceGate()` 84 · `.openIceGate()` 88 · `.updDragon()` 94

## src/systems/chapter4.js (140 baris)
_Bab 4 "Bisikan di Bawah Akar" (investigasi, tanpa boss) + Desa Kincir + prasasti lore. Lihat docs/GAME_DESIGN.md & docs/BENUA_LUMINA.md_
`.spawnCh4()` 5 · `.spawnPatok()` 21 · `.readLore()` 22 · `.treeVision()` 27 · `.lightLantern()` 39 · `.useBoat()` 54 · `.openSealDoor()` 59 · `.findPatok()` 70 · `.storyTalk()` 76

## src/systems/chapter5.js (86 baris)
_Bab 5 "Kota Seribu Lentera" (perjalanan & kota, tanpa boss): longsor, Jalan Raya Lama, Kota Lumina, Kota Bawah, Arsip Akademi_
`ARSIP` 4 · `.spawnCh5()` 6 · `.ch5Enter()` 15 · `.clearSlide()` 18 · `.arsipRead()` 34 · `.ch5Talk()` 40

## src/systems/travel.js (32 baris)
_Teleport: patung batu di tiap wilayah. Sentuh untuk mengaktifkan, lalu pindah instan ke patung lain yang aktif._
`WARPS` 3 · `.spawnWarp()` 9 · `.useWarp()` 15

## src/ai/enemies.js (393 baris)
_AI musuh biasa (hop, fly, shoot, turret, lunge, walk, charge, ghost, golem)_
`.updEnemy()` 4 · `.charAnim()` 386

## src/ai/unstuck.js (61 baris)
_Aturan Lepas-Sangkut Musuh Saat Mengejar (T468) — referensi: Hades_


## src/ai/elite_brute.js (96 baris)
_AI untuk musuh Brute Elite (Goblin Brute Elite, dsb)_
`.updEliteBrute()` 4

## src/ai/bosses.js (125 baris)
_AI boss & alur pertarungan boss_
`.summon()` 4 · `.triggerPhase2()` 9 · `.updBoss()` 19 · `.updQueen()` 47 · `.updSnake()` 60 · `.updWitch()` 72 · `.startBoss()` 89 · `.bossDown()` 108

## src/systems/life/core.js (374 baris)
_Objek interaktif dunia: core — isi: lihat docs/CODEMAP.md_
`.enterRoom()` 4 · `.fishIceHole()` 9 · `.fish()` 111 · `.spawnGarden()` 152 · `.plotState()` 161 · `.updGarden()` 162 · `.tendPlot()` 163 · `.spawnPuzzle()` 173 · `.updBoulder()` 181 · `.checkPlate()` 194 · `.updPet()` 201 · `.petDig()` 225 · `.bountyBoard()` 230 · `.feedAnimal()` 270 · `.waterFloral()` 291

## src/systems/life/harvest_1.js (364 baris)
_Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md_
`.harvestHoneyTree()` 4 · `.stackStoneCairn()` 74 · `.harvestIceChasm()` 174 · `.harvestFossilBed()` 231 · `.harvestCrystalGeode()` 297

## src/systems/life/harvest_2.js (392 baris)
_Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md_
`.harvestRiverStone()` 4 · `.harvestSnowChrysanthemum()` 69 · `.roastHarvest()` 173 · `.harvestCaveStalactite()` 217 · `.harvestFrostFlower()` 262 · `.harvestCoffeeShrub()` 310 · `.brewCharcoalCoffee()` 333

## src/systems/life/harvest_3.js (31 baris)
_Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md_
`.harvestRiverOrchid()` 4

## src/systems/life/interact_1.js (342 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactClimberLedge()` 4 · `.interactMangroveHollow()` 91 · `.interactMeadowWillow()` 178 · `.interactWishingTree()` 237

## src/systems/life/interact_2.js (339 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactBarberChair()` 4 · `.interactStreetGaslamp()` 96 · `.interactSkewerCamp()` 179 · `.interactBirdBath()` 253

## src/systems/life/interact_3.js (383 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactStonePestle()` 4 · `.interactCheeseBarrel()` 79 · `.interactPottersWheel()` 146 · `.interactWoodenLoom()` 214 · `.interactBirdHouse()` 289

## src/systems/life/interact_4.js (334 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactStreetViolin()` 4 · `.interactWiseOwl()` 103 · `.interactClockworkTower()` 183 · `.interactTempleKoiPond()` 249

## src/systems/life/interact_5.js (401 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactWeatherVane()` 4 · `.interactWishingBoat()` 99 · `.interactCampfire()` 211 · `.interactFountain()` 277 · `.ringVillageBell()` 343

## src/systems/life/interact_6.js (365 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.feedPond()` 4 · `.lookThroughTelescope()` 134 · `.talkPriestElian()` 201 · `.interactShrineAltar()` 208 · `.interactSwampTotem()` 296

## src/systems/life/interact_7.js (360 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.feedCityPigeons()` 4 · `.interactTeaTable()` 60 · `.interactLotusPond()` 110 · `.interactLakeBoat()` 170 · `.whistleToCanary()` 246 · `.interactWoodlandShrine()` 296

## src/systems/life/interact_8.js (84 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactLighthouse()` 4

## src/systems/life/minigame_1.js (360 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playHighStriker()` 4 · `.playAntiqueMusicBox()` 165 · `.playCanalBoatRace()` 242

## src/systems/life/minigame_2.js (309 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playKnifeToss()` 4 · `.playArmWrestling()` 168

## src/systems/life/minigame_3.js (319 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.startChickenRace()` 4 · `.playTavernDice()` 112 · `.strikeDummy()` 222

## src/systems/life/minigame_4.js (396 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playStoneSkipping()` 4 · `.playStreetDrum()` 134 · `.pumpBlacksmithBellows()` 228 · `.playRingToss()` 300

## src/systems/life/minigame_5.js (126 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playArcheryChallenge()` 4

## src/systems/story.js (149 baris)
_Segel kuil, Mochi hilang, kristal, peti harta_
`.touchBarrier()` 4 · `.takeMochi()` 20 · `.useCrystal()` 24 · `.openChest()` 37 · `interactRunePillar()` 96

## src/npc/npcs.js (135 baris)
_Gerak NPC & hewan serta sapaan otomatis (barking dialog)_
`NPC_BARKS` 3 · `BARK_NODES` 58 · `popBark()` 59 · `updBarks()` 70 · `.updNpc()` 85 · `.updCritter()` 111

## src/npc/brain.js (135 baris)
_"Otak" NPC: setiap NPC punya rutinitas sesuai perannya (bekerja, berkeliling, mengobrol, duduk, berpatroli), pulang saat malam._
`NPC_ROLE` 4 · `STORY_NPC` 11 · `WORK` 13 · `SEATS` 27 · `SOCIAL` 28 · `IDLE_ICON` 29 · `.npcBrainInit()` 32 · `.npcEmote()` 44 · `.npcPickGoal()` 45 · `.npcWalkAnim()` 87 · `.npcBrain()` 88 · `.npcActStart()` 110 · `.npcActTick()` 115

## src/npc/crowd.js (217 baris)
_Sistem Warga Latar Ringan (Ambient Crowd) — ala Stoneshard / Assassin's Creed._
`CROWD_POOL` 5 · `.spawnCrowd()` 8 · `.updCrowd()` 60 · `.clearCrowd()` 138 · `.initCrowd()` 148 · `_initPolishCrowd` 170 · `_dropActiveFxCrowd` 177 · `_updAmbP` 210

## src/systems/qol.js (241 baris)
_Kenyamanan (gelombang 1 docs/arsip/PROGRES_FITUR.md): ikon interaksi (#851–852), jeda otomatis (#877), bilah HP musuh (#904),_
`.updInteractHint()` 6 · `.updEnemyBars()` 42 · `.retryBoss()` 68 · `levelUpDetail()` 74 · `.setTimeout()` 80 · `TIPS` 102 · `showTip()` 113 · `.updTips()` 132 · `.updPeaceHud()` 142 · `.updMinimap()` 147 · `.swapWeapon()` 181 · `.updStamina()` 192 · `.tryClimb()` 209 · `applyPadOpt()` 237

## src/systems/feel.js (267 baris)
_Rasa bertarung (gelombang 3): ancang-ancang (#1), kombo (#2), musuh elit (#4),_
`ELITE_RATE` 4 · `DODGERS` 5 · `LEVEL_WILAYAH` 6 · `markOver()` 7 · `dangerEdge()` 13 · `.makeElite()` 19 · `.updFeel()` 44 · `.dangerFrom()` 164 · `.hurtAnim()` 171 · `.hasLineOfSight()` 173 · `_spawnEnemy` 189 · `_killEnemy` 209 · `_feelCr` 240

## src/systems/sound.js (129 baris)
_Suara gelombang 4: lagu per wilayah (#86), musik dinamis (#87), desa malam (#911),_
`bgmFor()` 33 · `_bgmFadeInt` 43 · `swapBGM()` 44 · `sfxAt()` 77 · `_stepLeft` 86 · `stepSound()` 87 · `segD()` 102 · `.groundAt()` 104 · `.updSound()` 114

## src/systems/craft.js (283 baris)
_Gelombang 5: poin atribut (#16), kerajinan (#26), bom & alat lempar (#29, #407),_
`CRAFT` 38 · `ATTR` 59 · `attrInit()` 60 · `_statBase` 66 · `openAttr()` 72 · `canCraft` 84 · `openCraft()` 85 · `openToolSlots()` 116 · `updToolBtns()` 126 · `.useSlot()` 135 · `.useTool()` 140

## src/systems/explore.js (200 baris)
_Gelombang 6: kabut peta (#61), rahasia (#63), peta harta (#66), lubang galian (#665),_
`FOG_N` 4 · `WILD` 5 · `ROLE_ICON` 8 · `hash32()` 9 · `seeded()` 10 · `fogOf()` 12 · `fogSeen()` 13 · `drawFog()` 14 · `.updFog()` 21 · `.freeSpot()` 28 · `.initSecrets()` 46 · `.initTreasure()` 63 · `.digTreasure()` 68 · `.openSecret()` 74 · `.giveTreasureMap()` 85 · `.updSecrets()` 101 · `.blastAt()` 108 · `openMapNew()` 111 · `.draw()` 153

## src/systems/home.js (313 baris)
_Gelombang 7: Rumah Arka (#46), peti penyimpanan (#32), perluasan (#492), tata perabot bebas (#493),_
`HOME_PRICE` 4 · `FCAT` 5 · `ROOM_IN` 19 · `homeInit()` 21 · `furnTex()` 31 · `.spawnHome()` 37 · `.placeFurnSprite()` 76 · `.removeFurnSprite()` 83 · `.useFurn()` 84 · `.useTrophyShelf()` 112 · `.homeMenu()` 148 · `.chooseHomeStyle()` 172 · `.pickCatalog()` 197 · `.pickPlaced()` 206 · `.startCarry()` 210 · `.furnOk()` 214 · `.updCarry()` 226 · `.carryKey()` 232 · `openBox()` 303

## src/world/interior_layouts.js (94 baris)
_Interior = gambar ruangan pemilik apa adanya (assets/img/int_room1..3.png, skala sama dengan perabot lembar → rasio & bentuk identik)._
`INT_ROOMS` 5 · `_genRoomSheet0` 37 · `_homeInit0` 58

## src/systems/arrival.js (29 baris)
_Zona Aman Saat Tiba di Wilayah (T467) — referensi: Dark Souls_


## src/systems/ranch.js (119 baris)
_Gelombang 8: peternakan (#47), kandang ayam (#514), kandang sapi (#515), kasih sayang hewan (#519),_
`SEEDS` 16 · `STOCK` 22 · `RANCH_MAX` 27 · `farmInit()` 28 · `today` 29 · `rnTextures()` 31 · `.spawnRanch()` 41 · `.spawnStock()` 56 · `.updRanch()` 62 · `.tendStock()` 75 · `.ranchMenu()` 90 · `plotHours()` 109

## src/systems/fishing.js (165 baris)
_Gelombang 9: mancing tarik-ulur (#51, #571), ikan per jam (#572) & cuaca (#573), ukuran & rekor (#575),_
`FISH` 21 · `inHours` 34 · `fishPool()` 35 · `pickFish()` 39 · `logFish()` 40 · `tugGame()` 42 · `fishClue()` 109 · `openFishLogNew()` 126 · `artTank()` 140 · `_furnTex` 141 · `_useFurn` 143 · `_pfs` 161 · `_rfs` 163

## src/systems/season.js (60 baris)
_Gelombang 10: kalender (#701), nama hari (#702), libur toko (#703), jam toko (#704),_
`DAYS` 4 · `SEASONS` 5 · `SEASON_DAYS` 11 · `dayName` 12 · `seasonIdx` 13 · `season` 14 · `dateTxt` 15 · `_updClock` 17 · `_plotHours` 20 · `_logFish` 23 · `shopShut()` 26 · `wrapShops()` 32 · `sleepToMorning()` 38 · `.spawnSeason()` 40 · `.updSeason()` 55

## src/systems/polish.js (237 baris)
_Gelombang 11: hemat baterai (#99), tangkis (#3), kelemahan elemen (#5), kunci target (#6),_
`ELEM` 5 · `WEAK` 6 · `ELEM_COL` 7 · `_hitEnemy` 8 · `_updShots` 46 · `_eShoot` 49 · `_nova` 66 · `_useTool` 68 · `PARRY_WIN` 71 · `_attack` 72 · `_hurtPlayer` 74 · `.initLock()` 117 · `.setLock()` 122 · `.cycleLock()` 123 · `.updLock()` 124 · `_aim` 131 · `RARE_N` 134 · `rarity()` 135 · `TOAST` 137 · `toastItem()` 138 · `_addItem` 145 · `applyFont()` 148 · `applyLite()` 149 · `applyScreenFilter()` 152 · `RARITY_BEAM_COL` 184 · `_drop0` 185 · `_updPicks0` 221 · `.initPolish()` 235

## src/systems/economy/economy_1.js (399 baris)
_Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (1) — isi: lihat docs/CODEMAP.md_
`TITLES` 5 · `checkTitles()` 22 · `BOARD_POOL` 36 · `getBoardQuests()` 48 · `openNoticeBoard()` 57 · `MERCHANT_SCHEDULE` 140 · `isMerchantHere()` 148 · `getMerchantStock()` 155 · `talkKangKembara()` 159 · `openRecipeBook()` 188 · `openStatsAndTitles()` 237 · `DAILY_FEATS_DEF` 317 · `getDailyFeats()` 325 · `openDailyFeats()` 334

## src/systems/economy/economy_2.js (408 baris)
_Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (2) — isi: lihat docs/CODEMAP.md_
`MAIL_LIST` 3 · `openMailbox()` 31 · `CODEX_FLORA` 92 · `CODEX_FAUNA` 93 · `CODEX_BUGS` 94 · `CODEX_MINERAL` 95 · `openEncyclopedia()` 97 · `ALCHEMY_FORMULAS` 164 · `openAlchemyTable()` 171 · `openVillageVault()` 248 · `openHallOfFame()` 316 · `MEMORY_BOSSES` 362 · `openMemoryTrials()` 368

## src/systems/economy/economy_3.js (151 baris)
_Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (3) — isi: lihat docs/CODEMAP.md_
`startRematchBattle()` 3 · `BARTER_DEALS` 56 · `CITY_BOUNTIES` 99 · `openCityBounties()` 114

## src/systems/perf.js (57 baris)
_Gelombang A (performa): culling objek di luar layar, entitas jauh "tidur", pengecekan berkala._
`CULL_PAD` 4 · `.initCull()` 7 · `.updCull()` 22 · `_updEnemyP` 38 · `_updFeelP` 43 · `_updNpcP` 46 · `_updCritP` 52 · `_updHintP` 55

## src/systems/stream.js (66 baris)
_Gelombang B: tanah per chunk (streaming). Hanya potongan di sekitar layar yang dibuat, sisanya dibuat_
`GT` 5 · `GTC` 6 · `GOV` 7 · `gtKey()` 8 · `groundOverview()` 9 · `gLayer()` 16 · `.initGround()` 18 · `.gFillView()` 28 · `.gNeed()` 30 · `.gEnsure()` 38 · `.updGround()` 51

## src/systems/openworld.js (55 baris)
_Dunia terbuka Tahap 1: wilayah tetangga digambar menempel di tepi wilayah aktif (tanah + objek),_
`OW_BAND` 5 · `.initOpen()` 7 · `.owSeamless()` 37 · `.updCross()` 38

## src/systems/regions.js (96 baris)
_Dunia satu peta (langkah 1): wilayah di sekitar Arka berjalan BERSAMAAN sebagai scene World pasif_
`REG_LOAD` 6 · `REG` 7 · `regSeq` 8 · `regionsOn()` 9 · `wposOf()` 10 · `relXY()` 11 · `removeRegions()` 12 · `.initPassive()` 15 · `.updPassive()` 21 · `.updRegions()` 38 · `.addRegion()` 52 · `.regBounds()` 59 · `.owHandoff()` 65 · `_hurtRegion` 87 · `_gotoRegion` 94

## src/systems/groundlayer.js (51 baris)
_Lapisan tanah bersama (scene 'GL', selalu paling bawah): tanah SEMUA wilayah luar ruang yang dimuat + hutan pengisi celah,_
`glOn()` 24 · `.glScene()` 26 · `.syncCams()` 32

## src/systems/wilds.js (97 baris)
_Hutan lebat pengisi celah kosong antarwilayah (dunia terbuka): tidak ada lagi area hitam. Digambar di lapisan tanah_
`WILD_MARGIN` 5 · `WILD_RECTS` 6 · `outdoorRects()` 7 · `inRegion()` 11 · `wildRects()` 12 · `wildTreeKeys()` 38

## src/systems/benua.js (113 baris)
_MODE BENUA (dunia satu peta, tahap 1): semua wilayah luar ruang dibangun SEKALIGUS dalam satu scene `World` berkoordinat_
`BENUA` 7 · `OBJ_CELL` 16 · `isOutdoorRegion()` 17 · `regionAt()` 18 · `shiftDeep()` 23 · `BENUA_SHIFT` 35 · `BFIELD` 37 · `benuaField()` 38 · `regionClone()` 45 · `buildBenua()` 50 · `benuaData()` 93 · `benuaLocalize()` 100 · `benuaTarget()` 105

## src/systems/benua_scene.js (165 baris)
_Mode Benua di scene World: pembangunan peta gabungan, pelacakan wilayah tempat Arka berada, teleport tanpa memuat ulang._
`KEMBARA_POS` 20 · `.initBenua()` 25 · `.withRegion()` 39 · `.spawnRegionFx()` 44 · `.streamObjs()` 69 · `.benuaAmbient()` 88 · `.benuaWeather()` 98 · `.updBenua()` 107

## src/systems/biometint.js (62 baris)
_Warna Langit/Cahaya Ikut Bioma (T457)_


## src/systems/benua_unload.js (49 baris)
_Mode benua: buang petak objek yang jauh dari Arka (memori). Mencatat semua yang dibuat spawnObj per petak lalu menghancurkannya._
`UNLOAD_FAR` 3 · `.unloadFar()` 20

## src/systems/cull.js (63 baris)
_Optimalisasi Kamera Culling (T487)_


## src/systems/souls.js (122 baris)
_Pertarungan Souls-lite "menantang tapi adil" (arah Dimraeth, docs/GAME_DESIGN.md bag. Pertarungan):_
`SOUL` 7 · `flaskOf()` 8 · `soulCost()` 15 · `refillFlask()` 16 · `.updLost()` 90 · `soulHudOn` 111 · `soulHudWrap()` 112 · `.updHud()` 120

## src/systems/heavy.js (89 baris)
_Serangan Berat (Heavy Attack) (T482)_


## src/systems/spellbooks.js (197 baris)
_T503: Varian Lepas Mantra (Quick-Cast vs Charged Spell >= 0,35 dtk) & T504: Buku Mantra (Spellbooks)_
`SPELLBOOK_INFO` 3 · `.spawnChargeCircle()` 163 · `.spawnEmber()` 174 · `.updEmbers()` 179

## src/systems/archetype.js (81 baris)
_T505: Archetype Gabungan 2 Aliran Jurus (Hybrid Class Bonus ala Dimraeth)_
`ARCHETYPES` 3 · `getArchetype()` 23

## src/systems/stronghold.js (197 baris)
_T506: Fasilitas Markas Rumah Arka (Stronghold) & T507: Ikatan Sekutu & Perbekalan Pagi_
`STRONGHOLD_STATIONS` 22 · `STRONGHOLD_ALCHEMY` 27 · `ALLY_BONDS` 32 · `shInit()` 38 · `activeAllies()` 42 · `.openStrongholdMenu()` 83 · `.useStrongholdStation()` 120 · `.claimAllyBox()` 175

## src/systems/slain.js (232 baris)
_Paket A (T469, T484, T485, T486) & Paket B Gelombang 18 (T528–T531: Spell Wheel, Relik, Sekutu Tempur, Ujian Bayangan)_
`.updLostArrow()` 163 · `.cycleSpell()` 178 · `.summonCompanion()` 188 · `.updCompanion()` 197 · `.startShadowTrial()` 218

## src/systems/gelombang20.js (233 baris)
_Gelombang 20 (T553–T562): 10 Trik Lanjutan Suasana & Mekanik ala Cobo / Mytheria_


## src/systems/apple_trees.js (142 baris)
_Sistem Pohon Apel Siklus Berbuah & Tanpa Buah (8 Frame Wind Sway)_
`isAppleTreeFruiting()` 6 · `setupAppleTree()` 21

## src/systems/reflect.js (55 baris)
_Pantulan Karakter di Air (T460) — referensi: RPG klasik / Sea of Stars_


## src/systems/tree_shadows.js (67 baris)
_Bayangan Daun Bergoyang & Proyeksi Miring Dinamis (T448, T552) — referensi: Cobo #18, Stardew_


## src/systems/aimassist.js (48 baris)
_Sistem Aim Assist untuk Layar Sentuh / Mobile (T481)_


## src/systems/combat_fx.js (397 baris)
_Rasa tempur ala Dimraeth: bidik bantu, langkah maju saat menebas, busur tebasan, kilat & percikan saat kena, debu berguling._
`CFX` 4 · `ARC_TINT` 5 · `arcTint()` 6 · `.arcTex()` 11 · `.slashFx()` 28 · `.nearFoe()` 87 · `.hitFx()` 97 · `.updChargeFx()` 141 · `.clearChargeFx()` 156 · `.spinFx()` 161 · `.enemyWindFx()` 182 · `.enemySlashFx()` 189 · `.enemySmashFx()` 199 · `.enemyRingFx()` 213 · `.rollFx()` 218 · `.updLowHp()` 239

## src/systems/movement.js (346 baris)
_Gelombang 16 (T508–T517): Gerakan & Posisi (Movement & Positioning) ala Dimraeth_


## src/ai/choreo.js (311 baris)
_Gelombang 17 (T518–T527): Koreografi Musuh, Bos & Taktik Pertemuan ala Dimraeth_


## src/ui/worldmap_art.js (67 baris)
_Gambar ringkas berwarna tiap wilayah untuk Peta Benua (1 piksel = WOV_K piksel dunia):_
`WOV_K` 4 · `WOV_TREE` 5 · `WOV_BUSH` 6 · `WOV_ROCK` 7 · `WOV_BLD` 8 · `wovRGB()` 9 · `worldOverview()` 10

## src/ui/worldmap.js (318 baris)
_Peta benua Lumina (overlay utuh semua wilayah dengan drag & zoom)_
`openWorldMap()` 3

## src/npc/dialog.js (473 baris)
_Percakapan NPC, toko, bengkel, penginapan_
`.npcHasQuest()` 4 · `.talkNpc()` 9 · `.offerPet()` 168 · `.shop()` 172 · `.smithy()` 217 · `.innTalk()` 262 · `.talkArenaMaster()` 273 · `.startCityArena()` 310 · `.talkNightMerchant()` 374 · `.talkCourier()` 388 · `.talkAuctioneer()` 422

## src/ui/shop.js (383 baris)
_Menu beli, jual, tempa_
`icon` 4 · `ownedEq` 5 · `buyMenu()` 6 · `buybackMenu()` 86 · `sellMenu()` 124 · `forgeMenu()` 236 · `cookMenu()` 258 · `upgCost()` 323 · `upgradeMenu()` 324

## src/ui/socket.js (76 baris)
_Menu Pasang Permata (#23)_
`socketMenu()` 3

## src/ui/bag.js (307 baris)
_Tas (inventaris) & buku misi_
`BAG_TABS` 4 · `BAG_SORT` 5 · `BAG_SEARCH` 6 · `saveBagPrefs()` 7 · `loadBagPrefs()` 12 · `openBag()` 19 · `openQuests()` 262

## src/ui/map.js (43 baris)
_Layar peta & navigasi tujuan misi_
`MINI` 4 · `WORLD` 5 · `buildMini()` 6 · `routeNext()` 23 · `questTarget()` 28 · `openMap()` 36

## src/ui/menus.js (395 baris)
_Menu utama, jurus, bestiari, pencapaian_
`subMenu()` 4 · `mainMenu()` 11 · `openSettings()` 56 · `openSkills()` 96 · `enemyThumb()` 108 · `openBestiary()` 109 · `openFishLog()` 117 · `openAch()` 118 · `openDlgLog()` 124 · `chooseSlot()` 131 · `openDebugMenu()` 155 · `openPhotoMode()` 213 · `TALENT_DEFS` 281 · `getTalentPoints()` 308 · `openTalentTree()` 318

## src/ui/savecode.js (49 baris)
_Kode save: ekspor/impor progres sebagai teks (pindah perangkat / cadangan)_
`CODE_TAG` 3 · `saveCode()` 4 · `readCode()` 5 · `codeDialog()` 10

## src/ui/title.js (41 baris)
_Layar judul_
`titleScreen()` 4

## src/world/layout.js (133 baris)
_Tata letak dunia terbuka (Tahap 1): posisi relatif wilayah tetangga dihitung dari pasangan pintu keluar_
`exitSide()` 5 · `OPP` 6 · `WORLD_POS` 10 · `PERALIHAN` 15 · `SIDE_OF` 32 · `plEnemies()` 34 · `NEIGH` 88

## src/world/organic.js (51 baris)
_Refactor desain dunia (docs/WORLD_REFACTOR.md) tahap A, B, F-otomatis: jalan TANAH dibelokkan (ujung tetap),_
`ORG_SKIP` 5 · `ORG_FILL` 6 · `orgPlanned()` 7 · `orgCurve()` 9

## src/world/cliffs.js (180 baris)
_T442, T445 & Elevated Border Cliffs:_


## src/systems/waterflow.js (101 baris)
_Animasi air mengalir: garis riak terang tipis bergerak searah aliran sungai (hulu → hilir = urutan elips `ponds`,_
`FLOW_MAX` 4 · `waterFlowAt()` 6 · `flowTex()` 25 · `foamTex()` 32 · `isShorelineAt()` 39 · `.updFlow()` 51 · `_updFlow0` 93

## src/systems/atmos.js (129 baris)
_Suasana cahaya & kabut (wilayah aktif saja):_
`ATMOS_POOL` 7 · `fogSheetTex()` 8 · `moteTex()` 19 · `.updAmbientMotes()` 26 · `.updAtmos()` 74

## src/systems/sunbeams.js (74 baris)
_T450: Sinar matahari pagi di hutan (jam 6-9 di forest/deepwood)_


## src/systems/cloudshadow.js (79 baris)
_T447: Bayangan awan berjalan_


## src/gfx/gptassets.js (87 baris)
_Aset buatan pemilik (GPT) yang menggantikan tampilan lama. Gambar disiapkan oleh tools/prep_gpt_assets.py_
`GPT_SWAP` 4 · `GPT_LOOK` 13 · `applyGptSwap()` 26

## src/gfx/style_unify.js (35 baris)
_Penyeragaman gaya: PATOKAN = pohon treeA / treeAd / treeSn (hijau alami, garis luar halus) + set Verdant yang senada._
`styleLeafPalette()` 21 · `styleRecolor()` 27

## src/gfx/code_palette.js (111 baris)
_T439: Selaraskan warna objek KODE ke palet treeA / Verdant_


## src/gfx/gptmonsters.js (165 baris)
_Sprite monster dari lembar GPT pemilik (dibersihkan oleh tools/gpt_monsters.py → assets/img/mon_<key>.png, strip 2 frame)._
`GPT_MON` 5 · `GPT_MON_NEW` 7 · `applyGptMonsters()` 9

## src/gfx/hero_arka.js (73 baris)
_Sprite sheet lengkap Arka dari ChatGPT (assets/raw/hero/arka_sheet1..6.png → tools/gen_hero.py → assets/img/hero_arka.png)._
`HERO_FW` 5 · `HERO_ROW` 6 · `regHeroArka()` 13 · `heroFrame()` 22

## src/gfx/enemy_sheets.js (58 baris)
_Lembar musuh baru dari ChatGPT (assets/raw/enemy/<id>.png → tools/gen_enemy.py → assets/img/esh_<id>.png)._
`ESH` 5 · `regEnemySheets()` 10 · `eshFrame()` 31

## src/systems/juice.js (315 baris)
_"Juice" v1.45: lapisan partikel & animasi tambahan di atas sistem yang ada (tanpa mengubah logika tempur)._
`JX_MAT` 9 · `jxMat()` 14 · `jxTextures()` 15 · `JX_CFG` 33 · `.jx()` 45 · `.jxLevelUp()` 69 · `.jxWind()` 76 · `.jxGhost()` 86 · `.jxShots()` 91 · `.jxTele()` 108 · `.jxNodePop()` 121 · `.jxSwoosh()` 127 · `.jxCrater()` 136 · `.jxDustRing()` 146 · `.jxPostureBreak()` 155 · `.jxAura()` 166 · `.jxTick()` 184

## src/systems/grade.js (53 baris)
_Rona warna "sore keemasan" ala screenshot Dimraeth pemilik (v1.47.0): seluruh layar luar-ruang digeser ke kuning-zaitun hangat,_
`GRADE_OFF` 6 · `GRADE_M` 7 · `isGoldenHour()` 8 · `gradeOn()` 12 · `gradeCam()` 15

## src/main.js (39 baris)
_Mulai game Phaser_
`game` 20
