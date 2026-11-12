# CODEMAP (dibuat otomatis oleh `node tools/codemap.js`, JANGAN diedit manual)

Cari nama di sini (`grep -n "namaFungsi" docs/CODEMAP.md`), lalu buka file:baris itu saja.
Format: `nama` baris. Urutan file = urutan muat di index.html.

## src/core/util.js (15 baris)
_Konstanta layar & util kecil_
`VW` 6 · `VH` 7 · `rnd` 8 · `ri` 9 · `pick` 10 · `clamp` 11 · `sleep` 12 · `$` 13 · `SCREEN` 14

## src/core/audio.js (106 baris)
_Audio chiptune WebAudio: musik (TRACKS) & efek suara (sfx)_
`AU` 4 · `NI` 5 · `nf()` 6 · `parseSeq()` 7 · `bossBass` 8 · `TRACKS` 9 · `auInit()` 31 · `tone()` 42 · `sweep()` 43 · `noise()` 44 · `playBGM()` 45 · `_lastSfx` 55 · `sfx()` 56

## src/core/input.js (152 baris)
_Input keyboard, joystick, tombol sentuh, dan layout layar_
`Input` 5 · `press()` 6 · `KEYMAP` 7 · `ISDIR` 8 · `enableTouch()` 23 · `UISCALE` 60 · `PAD_STATE` 62 · `pollGamepad()` 63 · `layout()` 123

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

## src/art/items.js (155 baris)
_Ikon item & senjata_
`SWORD` 3 · `artSword()` 4 · `artSpear()` 9 · `artAxe()` 10 · `artBow()` 11 · `artArrow()` 12 · `artCoin()` 13 · `artPotion()` 18 · `artHeart()` 19 · `ICON_MAP` 21 · `ICONS_DEF` 48 · `iconFallback()` 107 · `artIcon()` 113

## src/art/fx.js (106 baris)
_Efek: tebasan, api, proyektil, cahaya, bayangan_
`artSlash()` 4 · `artFire()` 21 · `artSpore()` 31 · `artDot()` 32 · `artSmoke()` 33 · `artSpark()` 34 · `artButterfly()` 35 · `artShadow()` 40 · `artBone()` 41 · `artSeed()` 42 · `artRockShot()` 43 · `artBrazier()` 44 · `artIceGate()` 45 · `artIceBolt()` 46 · `artWarp()` 47 · `artStele()` 48 · `artBoat()` 49 · `artRelief()` 50 · `artSealDoor()` 51 · `artGatehouse()` 52 · `artCityWall()` 61 · `artAcademy()` 62 · `artRoot()` 73 · `artLight()` 76 · `artGlider()` 77 · `artRain()` 90 · `artShadowSoft()` 92 · `artFog()` 93 · `artRipple()` 94 · `artSprout()` 95 · `shadowCanvas()` 97 · `artLightP()` 105

## src/art/interior.js (62 baris)
_Lantai & perabot interior_
`FURN` 4 · `drawFurn()` 5 · `genRoom()` 15 · `artMusicBox()` 28

## src/world/objects.js (152 baris)
_Definisi objek dunia (tekstur, tabrakan, bayangan) & wadah MAPS_
`OBJ` 7 · `MAPS` 151

## src/world/spawn/spawn_1.js (398 baris)
_Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World_
`OBJ_SPAWN` 3 · obj `shrine` 5 · obj `cavemouth` 8 · obj `sign` 11 · obj `forge` 14 · obj `pebbles` 18 · obj `telescope` 26 · obj `altar` 34 · obj `fieldoven` 42 · obj `dripstone` 50 · obj `frostflower` 58 · obj `totem` 66 · obj `pigeons` 74 · obj `teatable` 82 · obj `lotuspad` 90 · obj `dockboat` 98 · obj `coffeeshrub` 153 · obj `coffeekettle` 161 · obj `orchidrock` 169 · obj `canaryperch` 177 · obj `woodlandshrine` 185 · obj `bellows` 193 · obj `ringbooth` 201 · obj `archerytarget` 209 · obj `lakelighthouse` 217 · obj `streetdrum` 225 · obj `dummy` 233 · obj `pot` 241 · obj `well` 251 · obj `apple1` 266 · obj `bench` 327 · obj `bell` 343 · obj `campfire` 351 · obj `alchemytable` 361 · obj `scenicbench` 370 · obj `mailbox` 388

## src/world/spawn/spawn_2.js (272 baris)
_Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World_
obj `brokenbridge` 4 · obj `board` 42 · obj `bombbarrel` 51 · obj `bramble` 81 · obj `minestone` 84 · obj `village_vault` 113 · obj `mirror_memory` 123 · obj `fame_board` 133 · obj `bounty_board` 142 · obj `deadtree` 151 · obj `rune_pillar` 179 · obj `fountain` 191 · obj `windmill` 200 · obj `cryst` 203 · obj `lamp` 206 · obj `viewpoint` 209 · obj `lumina_shard` 243

## src/world/ground.js (277 baris)
_Generator tanah, tabrakan grid, penyebar pohon_
`riverY()` 4 · `SD_PAD` 7 · `makeSD()` 8 · `pondE()` 27 · `GROUND` 28 · `BLEND_W` 40 · `WILD_G` 41 · `edgeSegs()` 42 · `edgeBlend()` 71 · `genGround()` 90 · `blockRects()` 178 · `scatter()` 194 · `openSides()` 227 · `borderTrees()` 240 · `ringObjects()` 256 · `mapObjects()` 261 · `mapWalls()` 265

## src/world/maps/village.js (78 baris)
_Peta: Desa Lumina_


## src/world/maps/forest.js (58 baris)
_Peta: Hutan Lumina (3 mini-boss, kuil, Raja Goblin)_


## src/world/maps/meadow.js (60 baris)
_Peta: Padang Angin_


## src/world/maps/cave.js (30 baris)
_Peta: Gua Batu (gelap, teka-teki batu, Golem Purba)_


## src/world/maps/swamp.js (23 baris)
_Peta: Rawa Senja (bab 2, Morgath)_


## src/world/maps/snow.js (29 baris)
_Peta: Puncak Beku (bab 3, obor kuno & Naga Es Kryos)_


## src/world/maps/lake.js (26 baris)
_Peta: Danau Cermin (bab 4, lentera kuno, perahu ke Kuil Penjaga Cahaya, jalan ke Kota Lumina tertutup longsor)_


## src/world/maps/city.js (114 baris)
_Peta: Jalan Raya Lama + Kota Lumina "Kota Seribu Lentera" (gerbang, pasar, akademi, kota bawah). Desain: docs/BENUA_LUMINA.md_
`houseRow` 4 · `lampRow` 5 · `cityLines` 6 · `citizens` 14

## src/world/maps/wild.js (60 baris)
_Peta: zona alam luas — Hutan Dalam (+ Reruntuhan Aurel) di barat Hutan Lumina, Jalur Sungai dari Hutan Lumina ke Rawa Senja_
`ruinRing` 4

## src/world/maps/interiors.js (60 baris)
_Interior: penginapan, rumah pohon, rumah Lina_
`makeRoom()` 4

## src/ui/widgets.js (132 baris)
_UI DOM: dialog (say/talk), menu (choose/ask), banner, angka melayang, HUD_
`UIH` 6 · `G` 7 · `win()` 8 · `fadeTo()` 9 · `shake()` 10 · `DLG_LOG` 15 · `say()` 16 · `talk()` 36 · `choose()` 40 · `ask()` 76 · `banner()` 82 · `POPS` 88 · `popWorld()` 89 · `updPops()` 93 · `HUD` 96 · `buildHud()` 97 · `updHud()` 106 · `showHud()` 127 · `bossBar()` 128 · `autoSaveIcon()` 131

## src/core/state.js (136 baris)
_Status pemain (S), simpan/muat, rumus stat_
`SAVE_BASE` 6 · `slotKey` 7 · `SAVE_SLOT` 8 · `SAVE_KEY` 9 · `setSlot()` 10 · `slotInfo()` 12 · `DIRV` 13 · `S` 14 · `OPT_KEY` 16 · `DIFF` 18 · `GAME_VERSION` 19 · `OPT` 20 · `saveOpt()` 21 · `applyOpt()` 22 · `newState()` 23 · `eqv()` 24 · `UPG` 30 · `itemName` 31 · `BUFF` 33 · `buffOn` 34 · `stat()` 35 · `need()` 71 · `has` 72 · `addItem()` 73 · `hasSave()` 82 · `saveGame()` 83 · `readSaveRaw()` 94 · `loadSave()` 98

## src/data/items.js (270 baris)
_Data item & resep tempa_
`ITEMS` 4 · `ICON_OF` 182 · `COOK` 208 · `RECIPES` 216 · `SETS` 224 · `activeSets()` 259

## src/data/enemies.js (51 baris)
_Data musuh & proyektil_
`ENEMY` 5 · `PROJ` 48 · `BOSS_AI` 49 · `BEAST` 50

## src/data/quests.js (24 baris)
_Teks misi, tujuan misi, jurus, pencapaian_
`STAGE_TXT` 3 · `STAGE_GOAL` 4 · `SKILLS` 5 · `ACH` 6

## src/data/lore.js (65 baris)
_Jurnal: catatan lore (LORE), misteri jangka panjang (MYSTERY), penyelidikan jangka menengah (midGoal). Lihat docs/GAME_DESIGN.md_
`LORE` 4 · `MYSTERY` 37 · `midGoal()` 49 · `learn()` 58

## src/systems/daynight.js (10 baris)
_Jam & siang-malam_
`nightAmt()` 4 · `isNight()` 5 · `gameHours()` 6 · `lerpCol()` 7 · `_clk` 8 · `updClock()` 9

## src/systems/achievements.js (10 baris)
_Cek pencapaian_
`totalKills()` 3 · `achCheck()` 4

## src/gfx/bake.js (28 baris)
_Panggang bayangan objek ke tekstur tanah_
`SHC` 3 · `bakeGround()` 4 · `SHB` 15 · `shadowIndex()` 16

## src/gfx/textures.js (93 baris)
_Muat gambar & daftarkan semua tekstur/animasi ke Phaser_
`ICONS` 4 · `IMG_LIST` 6 · `loadImgs()` 12 · `addStrip()` 13 · `darkTree()` 14 · `NPC_W` 16 · `regPortrait()` 17 · `regChar()` 22 · `buildTextures()` 23

## src/scene/world.js (400 baris)
_Scene utama Phaser: membangun peta, update per frame, kamera. Metode lain ditambahkan lewat file mixin (Object.assign(World.prototype, ...))._
`.constructor()` 5 · `.create()` 6 · `.makeActiveFx()` 99 · `.dropActiveFx()` 112 · `.wall()` 113 · `.shadow()` 114 · `.spawnObj()` 115 · `.spawnChest()` 133 · `.spawnCrystal()` 140 · `.spawnBarrier()` 148 · `.spawnMochi()` 155 · `.spawnNpc()` 159 · `.face()` 170 · `.spawnCritter()` 171 · `.spawnFly()` 176 · `.spawnEnemy()` 181 · `.camShake()` 207 · `.update()` 208 · `.puff()` 307 · `.camStep()` 308 · `.pump()` 355 · `.front()` 364 · `.actionA()` 365 · `.sparkle()` 375 · `.checkZones()` 379 · `.guardStop()` 390 · `.goto()` 394

## src/systems/combat.js (329 baris)
_Pertarungan: serangan, sihir, ramuan, damage, drop, EXP, proyektil, kalah_
`WEAPON_STYLE` 4 · `.attack()` 12 · `.shootArrow()` 89 · `.aimAngle()` 102 · `.magic()` 111 · `.drink()` 124 · `.useItem()` 130 · `.hitStop()` 139 · `.hitEnemy()` 144 · `.killEnemy()` 171 · `.drop()` 237 · `.updPicks()` 243 · `.gainExp()` 265 · `.hurtPlayer()` 277 · `.eShoot()` 287 · `.shockwave()` 295 · `.updShots()` 302 · `.defeat()` 316

## src/systems/skills.js (36 baris)
_Jurus: dash, tebasan putar, nova es_
`.updSkills()` 4 · `.spin()` 12 · `.dash()` 20 · `.nova()` 26

## src/systems/learn.js (58 baris)
_Sistem belajar jurus: dipelajari dari guru (NPC), lalu makin mahir dengan dipakai (tingkat I–III)._
`JURUS` 4 · `MASTERY` 13 · `tierOf` 14 · `learned` 15 · `useJurus()` 16 · `canTeach` 20 · `.learnTalk()` 23 · `.castSpell()` 38

## src/systems/ambient.js (216 baris)
_Suasana alam: hewan kecil yang bereaksi ke pemain, kunang-kunang, ikan melompat, bayangan awan, berkas cahaya, kabut, suara latar, tanaman yang bisa dipungut._
`ENV` 4 · `artCritters()` 18 · `.spawnAmbient()` 38 · `.addBird()` 70 · `.addFly()` 71 · `.addCrit()` 72 · `.updAmbient()` 73 · `.ambOff()` 193 · `.ripple()` 194 · `artQuestArrow()` 197 · `.updQuestGuide()` 204

## src/systems/status.js (67 baris)
_Efek status: racun/terbakar/dingin pada pemain, terbakar/beku pada musuh_
`STATUS` 5 · `.inflict()` 12 · `.cure()` 21 · `.speedMul()` 22 · `.updStatus()` 27 · `.enemyStatus()` 40 · `.burnEnemy()` 56 · `.freezeEnemy()` 57 · `updStatusHud()` 60

## src/systems/chapter3.js (107 baris)
_Bab 3: obor kuno, gerbang es, Naga Es Kryos (AI 'dboss')_
`.spawnTorches()` 4 · `.spawnCaveTorches()` 13 · `.lightTorch()` 57 · `.spawnIceGate()` 74 · `.openIceGate()` 78 · `.updDragon()` 84

## src/systems/chapter4.js (140 baris)
_Bab 4 "Bisikan di Bawah Akar" (investigasi, tanpa boss) + Desa Kincir + prasasti lore. Lihat docs/GAME_DESIGN.md & docs/BENUA_LUMINA.md_
`.spawnCh4()` 5 · `.spawnPatok()` 21 · `.readLore()` 22 · `.treeVision()` 27 · `.lightLantern()` 39 · `.useBoat()` 54 · `.openSealDoor()` 59 · `.findPatok()` 70 · `.storyTalk()` 76

## src/systems/chapter5.js (81 baris)
_Bab 5 "Kota Seribu Lentera" (perjalanan & kota, tanpa boss): longsor, Jalan Raya Lama, Kota Lumina, Kota Bawah, Arsip Akademi_
`ARSIP` 4 · `.spawnCh5()` 6 · `.clearSlide()` 14 · `.arsipRead()` 29 · `.ch5Talk()` 35

## src/systems/travel.js (29 baris)
_Teleport: patung batu di tiap wilayah. Sentuh untuk mengaktifkan, lalu pindah instan ke patung lain yang aktif._
`WARPS` 3 · `.spawnWarp()` 6 · `.useWarp()` 12

## src/ai/enemies.js (214 baris)
_AI musuh biasa (hop, fly, shoot, turret, lunge, walk, charge, ghost, golem)_
`.updEnemy()` 4 · `.charAnim()` 207

## src/ai/bosses.js (109 baris)
_AI boss & alur pertarungan boss_
`.summon()` 4 · `.updBoss()` 9 · `.updQueen()` 39 · `.updSnake()` 51 · `.updWitch()` 62 · `.startBoss()` 78 · `.bossDown()` 92

## src/systems/life/core.js (374 baris)
_Objek interaktif dunia: core — isi: lihat docs/CODEMAP.md_
`.enterRoom()` 4 · `.fishIceHole()` 9 · `.fish()` 111 · `.spawnGarden()` 152 · `.plotState()` 161 · `.updGarden()` 162 · `.tendPlot()` 163 · `.spawnPuzzle()` 173 · `.updBoulder()` 181 · `.checkPlate()` 194 · `.updPet()` 201 · `.petDig()` 225 · `.bountyBoard()` 230 · `.feedAnimal()` 270 · `.waterFloral()` 291

## src/systems/life/harvest_1.js (364 baris)
_Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md_
`.harvestHoneyTree()` 4 · `.stackStoneCairn()` 74 · `.harvestIceChasm()` 174 · `.harvestFossilBed()` 231 · `.harvestCrystalGeode()` 297

## src/systems/life/harvest_2.js (392 baris)
_Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md_
`.harvestRiverStone()` 4 · `.harvestSnowChrysanthemum()` 69 · `.roastHarvest()` 173 · `.harvestCaveStalactite()` 217 · `.harvestFrostFlower()` 262 · `.harvestCoffeeShrub()` 310 · `.brewCharcoalCoffee()` 333

## src/systems/life/harvest_3.js (27 baris)
_Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md_
`.harvestRiverOrchid()` 4

## src/systems/life/interact_1.js (342 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactClimberLedge()` 4 · `.interactMangroveHollow()` 91 · `.interactMeadowWillow()` 178 · `.interactWishingTree()` 237

## src/systems/life/interact_2.js (338 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactBarberChair()` 4 · `.interactStreetGaslamp()` 96 · `.interactSkewerCamp()` 178 · `.interactBirdBath()` 252

## src/systems/life/interact_3.js (383 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactStonePestle()` 4 · `.interactCheeseBarrel()` 79 · `.interactPottersWheel()` 146 · `.interactWoodenLoom()` 214 · `.interactBirdHouse()` 289

## src/systems/life/interact_4.js (333 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactStreetViolin()` 4 · `.interactWiseOwl()` 103 · `.interactClockworkTower()` 182 · `.interactTempleKoiPond()` 248

## src/systems/life/interact_5.js (387 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactWeatherVane()` 4 · `.interactWishingBoat()` 97 · `.interactCampfire()` 209 · `.interactFountain()` 275 · `.ringVillageBell()` 329

## src/systems/life/interact_6.js (365 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.feedPond()` 4 · `.lookThroughTelescope()` 134 · `.talkPriestElian()` 201 · `.interactShrineAltar()` 208 · `.interactSwampTotem()` 296

## src/systems/life/interact_7.js (360 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.feedCityPigeons()` 4 · `.interactTeaTable()` 60 · `.interactLotusPond()` 110 · `.interactLakeBoat()` 170 · `.whistleToCanary()` 246 · `.interactWoodlandShrine()` 296

## src/systems/life/interact_8.js (69 baris)
_Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md_
`.interactLighthouse()` 4

## src/systems/life/minigame_1.js (359 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playHighStriker()` 4 · `.playAntiqueMusicBox()` 165 · `.playCanalBoatRace()` 242

## src/systems/life/minigame_2.js (309 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playKnifeToss()` 4 · `.playArmWrestling()` 168

## src/systems/life/minigame_3.js (303 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.startChickenRace()` 4 · `.playTavernDice()` 112 · `.strikeDummy()` 206

## src/systems/life/minigame_4.js (396 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playStoneSkipping()` 4 · `.playStreetDrum()` 134 · `.pumpBlacksmithBellows()` 228 · `.playRingToss()` 300

## src/systems/life/minigame_5.js (106 baris)
_Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md_
`.playArcheryChallenge()` 4

## src/systems/story.js (131 baris)
_Segel kuil, Mochi hilang, kristal, peti harta_
`.touchBarrier()` 4 · `.takeMochi()` 15 · `.useCrystal()` 19 · `.openChest()` 32 · `interactRunePillar()` 82

## src/npc/npcs.js (74 baris)
_Gerak NPC & hewan serta sapaan otomatis (barking dialog)_
`NPC_BARKS` 3 · `BARK_NODES` 15 · `popBark()` 16 · `updBarks()` 27 · `.updNpc()` 42 · `.updCritter()` 59

## src/npc/brain.js (111 baris)
_"Otak" NPC: setiap NPC punya rutinitas sesuai perannya (bekerja, berkeliling, mengobrol, duduk, berpatroli), pulang saat malam._
`NPC_ROLE` 4 · `STORY_NPC` 11 · `WORK` 13 · `SEATS` 27 · `SOCIAL` 28 · `IDLE_ICON` 29 · `.npcBrainInit()` 32 · `.npcEmote()` 44 · `.npcPickGoal()` 45 · `.npcWalkAnim()` 66 · `.npcBrain()` 67 · `.npcActStart()` 89 · `.npcActTick()` 94

## src/systems/qol.js (192 baris)
_Kenyamanan (gelombang 1 docs/arsip/PROGRES_FITUR.md): ikon interaksi (#851–852), jeda otomatis (#877), bilah HP musuh (#904),_
`.updInteractHint()` 6 · `.updEnemyBars()` 23 · `.retryBoss()` 33 · `levelUpDetail()` 39 · `.setTimeout()` 45 · `TIPS` 58 · `showTip()` 69 · `.updTips()` 75 · `.updMinimap()` 84 · `.swapWeapon()` 108 · `.updStamina()` 119 · `.tryClimb()` 130 · `.tryGlide()` 156 · `.stopGlide()` 182 · `applyPadOpt()` 188

## src/systems/feel.js (64 baris)
_Rasa bertarung (gelombang 3): ancang-ancang (#1), kombo (#2), musuh elit (#4),_
`ELITE_RATE` 4 · `DODGERS` 5 · `markOver()` 6 · `dangerEdge()` 12 · `.makeElite()` 18 · `.updFeel()` 26 · `.dangerFrom()` 56 · `.hurtAnim()` 62

## src/systems/sound.js (98 baris)
_Suara gelombang 4: lagu per wilayah (#86), musik dinamis (#87), desa malam (#911),_
`bgmFor()` 33 · `swapBGM()` 43 · `sfxAt()` 51 · `stepSound()` 60 · `segD()` 71 · `.groundAt()` 73 · `.updSound()` 83

## src/systems/craft.js (265 baris)
_Gelombang 5: poin atribut (#16), kerajinan (#26), bom & alat lempar (#29, #407),_
`CRAFT` 23 · `ATTR` 41 · `attrInit()` 42 · `_statBase` 48 · `openAttr()` 54 · `canCraft` 66 · `openCraft()` 67 · `openToolSlots()` 98 · `updToolBtns()` 108 · `.useSlot()` 117 · `.useTool()` 122

## src/systems/explore.js (192 baris)
_Gelombang 6: kabut peta (#61), rahasia (#63), peta harta (#66), lubang galian (#665),_
`FOG_N` 4 · `WILD` 5 · `ROLE_ICON` 8 · `hash32()` 9 · `seeded()` 10 · `fogOf()` 12 · `fogSeen()` 13 · `drawFog()` 14 · `.updFog()` 21 · `.freeSpot()` 28 · `.initSecrets()` 46 · `.initTreasure()` 60 · `.digTreasure()` 64 · `.openSecret()` 70 · `.giveTreasureMap()` 81 · `.updSecrets()` 97 · `.blastAt()` 104 · `openMapNew()` 107 · `.draw()` 145

## src/systems/home.js (310 baris)
_Gelombang 7: Rumah Arka (#46), peti penyimpanan (#32), perluasan (#492), tata perabot bebas (#493),_
`HOME_PRICE` 4 · `FCAT` 5 · `ROOM_IN` 19 · `homeInit()` 21 · `furnTex()` 31 · `.spawnHome()` 37 · `.placeFurnSprite()` 75 · `.removeFurnSprite()` 82 · `.useFurn()` 83 · `.useTrophyShelf()` 111 · `.homeMenu()` 147 · `.chooseHomeStyle()` 171 · `.pickCatalog()` 196 · `.pickPlaced()` 205 · `.startCarry()` 209 · `.furnOk()` 213 · `.updCarry()` 223 · `.carryKey()` 229 · `openBox()` 300

## src/systems/ranch.js (119 baris)
_Gelombang 8: peternakan (#47), kandang ayam (#514), kandang sapi (#515), kasih sayang hewan (#519),_
`SEEDS` 16 · `STOCK` 22 · `RANCH_MAX` 27 · `farmInit()` 28 · `today` 29 · `rnTextures()` 31 · `.spawnRanch()` 41 · `.spawnStock()` 56 · `.updRanch()` 62 · `.tendStock()` 75 · `.ranchMenu()` 90 · `plotHours()` 109

## src/systems/fishing.js (133 baris)
_Gelombang 9: mancing tarik-ulur (#51, #571), ikan per jam (#572) & cuaca (#573), ukuran & rekor (#575),_
`FISH` 21 · `inHours` 34 · `fishPool()` 35 · `pickFish()` 39 · `logFish()` 40 · `tugGame()` 42 · `openFishLogNew()` 94 · `artTank()` 108 · `_furnTex` 109 · `_useFurn` 111 · `_pfs` 129 · `_rfs` 131

## src/systems/season.js (60 baris)
_Gelombang 10: kalender (#701), nama hari (#702), libur toko (#703), jam toko (#704),_
`DAYS` 4 · `SEASONS` 5 · `SEASON_DAYS` 11 · `dayName` 12 · `seasonIdx` 13 · `season` 14 · `dateTxt` 15 · `_updClock` 17 · `_plotHours` 20 · `_logFish` 23 · `shopShut()` 26 · `wrapShops()` 32 · `sleepToMorning()` 38 · `.spawnSeason()` 40 · `.updSeason()` 55

## src/systems/polish.js (118 baris)
_Gelombang 11: hemat baterai (#99), tangkis (#3), kelemahan elemen (#5), kunci target (#6),_
`ELEM` 5 · `WEAK` 6 · `ELEM_COL` 7 · `_hitEnemy` 8 · `_updShots` 19 · `_nova` 22 · `_useTool` 24 · `PARRY_WIN` 27 · `_attack` 28 · `_hurtPlayer` 30 · `.initLock()` 50 · `.setLock()` 55 · `.cycleLock()` 56 · `.updLock()` 57 · `_aim` 64 · `RARE_N` 67 · `rarity()` 68 · `TOAST` 70 · `toastItem()` 71 · `_addItem` 78 · `applyFont()` 81 · `applyLite()` 82 · `applyScreenFilter()` 85 · `.initPolish()` 116

## src/systems/economy/economy_1.js (399 baris)
_Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (1) — isi: lihat docs/CODEMAP.md_
`TITLES` 5 · `checkTitles()` 22 · `BOARD_POOL` 36 · `getBoardQuests()` 48 · `openNoticeBoard()` 57 · `MERCHANT_SCHEDULE` 140 · `isMerchantHere()` 148 · `getMerchantStock()` 155 · `talkKangKembara()` 159 · `openRecipeBook()` 188 · `openStatsAndTitles()` 237 · `DAILY_FEATS_DEF` 317 · `getDailyFeats()` 325 · `openDailyFeats()` 334

## src/systems/economy/economy_2.js (384 baris)
_Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (2) — isi: lihat docs/CODEMAP.md_
`MAIL_LIST` 3 · `openMailbox()` 11 · `CODEX_FLORA` 72 · `CODEX_FAUNA` 73 · `CODEX_BUGS` 74 · `CODEX_MINERAL` 75 · `openEncyclopedia()` 77 · `ALCHEMY_FORMULAS` 144 · `openAlchemyTable()` 151 · `openVillageVault()` 228 · `openHallOfFame()` 296 · `MEMORY_BOSSES` 342 · `openMemoryTrials()` 348

## src/systems/economy/economy_3.js (138 baris)
_Ekonomi: papan permintaan, pedagang, gelar, statistik, resep, surat, kodeks (3) — isi: lihat docs/CODEMAP.md_
`startRematchBattle()` 3 · `BARTER_DEALS` 52 · `CITY_BOUNTIES` 95 · `openCityBounties()` 101

## src/systems/perf.js (57 baris)
_Gelombang A (performa): culling objek di luar layar, entitas jauh "tidur", pengecekan berkala._
`CULL_PAD` 4 · `.initCull()` 7 · `.updCull()` 22 · `_updEnemyP` 38 · `_updFeelP` 43 · `_updNpcP` 46 · `_updCritP` 52 · `_updHintP` 55

## src/systems/stream.js (65 baris)
_Gelombang B: tanah per chunk (streaming). Hanya potongan di sekitar layar yang dibuat, sisanya dibuat_
`GT` 5 · `GTC` 6 · `GOV` 7 · `gtKey()` 8 · `groundOverview()` 9 · `gLayer()` 16 · `.initGround()` 18 · `.gFillView()` 27 · `.gNeed()` 29 · `.gEnsure()` 37 · `.updGround()` 50

## src/systems/openworld.js (53 baris)
_Dunia terbuka Tahap 1: wilayah tetangga digambar menempel di tepi wilayah aktif (tanah + objek),_
`OW_BAND` 5 · `.initOpen()` 7 · `.owSeamless()` 35 · `.updCross()` 36

## src/systems/regions.js (94 baris)
_Dunia satu peta (langkah 1): wilayah di sekitar Arka berjalan BERSAMAAN sebagai scene World pasif_
`REG_LOAD` 6 · `REG` 7 · `regSeq` 8 · `regionsOn()` 9 · `wposOf()` 10 · `relXY()` 11 · `removeRegions()` 12 · `.initPassive()` 15 · `.updPassive()` 21 · `.updRegions()` 37 · `.addRegion()` 50 · `.regBounds()` 57 · `.owHandoff()` 63 · `_hurtRegion` 85 · `_gotoRegion` 92

## src/systems/groundlayer.js (49 baris)
_Lapisan tanah bersama (scene 'GL', selalu paling bawah): tanah SEMUA wilayah luar ruang yang dimuat + hutan pengisi celah,_
`glOn()` 24 · `.glScene()` 26 · `.syncCams()` 32

## src/systems/wilds.js (97 baris)
_Hutan lebat pengisi celah kosong antarwilayah (dunia terbuka): tidak ada lagi area hitam. Digambar di lapisan tanah_
`WILD_MARGIN` 5 · `WILD_RECTS` 6 · `outdoorRects()` 7 · `inRegion()` 11 · `wildRects()` 12 · `wildTreeKeys()` 38

## src/npc/dialog.js (473 baris)
_Percakapan NPC, toko, bengkel, penginapan_
`.npcHasQuest()` 4 · `.talkNpc()` 9 · `.offerPet()` 168 · `.shop()` 172 · `.smithy()` 217 · `.innTalk()` 262 · `.talkArenaMaster()` 273 · `.startCityArena()` 310 · `.talkNightMerchant()` 374 · `.talkCourier()` 388 · `.talkAuctioneer()` 422

## src/ui/shop.js (407 baris)
_Menu beli, jual, tempa_
`icon` 4 · `ownedEq` 5 · `buyMenu()` 6 · `buybackMenu()` 62 · `sellMenu()` 97 · `forgeMenu()` 199 · `cookMenu()` 215 · `upgCost()` 274 · `upgradeMenu()` 275 · `socketMenu()` 335

## src/ui/bag.js (261 baris)
_Tas (inventaris) & buku misi_
`BAG_TABS` 4 · `BAG_SORT` 5 · `BAG_SEARCH` 6 · `openBag()` 7 · `openQuests()` 224

## src/ui/map.js (37 baris)
_Layar peta & navigasi tujuan misi_
`MINI` 4 · `WORLD` 5 · `buildMini()` 6 · `routeNext()` 23 · `questTarget()` 28 · `openMap()` 36

## src/ui/menus.js (376 baris)
_Menu utama, jurus, bestiari, pencapaian_
`subMenu()` 4 · `mainMenu()` 11 · `openSettings()` 56 · `openSkills()` 93 · `enemyThumb()` 105 · `openBestiary()` 106 · `openFishLog()` 114 · `openAch()` 115 · `openDlgLog()` 121 · `chooseSlot()` 128 · `openDebugMenu()` 137 · `openPhotoMode()` 194 · `TALENT_DEFS` 262 · `getTalentPoints()` 289 · `openTalentTree()` 299

## src/ui/savecode.js (34 baris)
_Kode save: ekspor/impor progres sebagai teks (pindah perangkat / cadangan)_
`CODE_TAG` 3 · `saveCode()` 4 · `readCode()` 5 · `codeDialog()` 10

## src/ui/title.js (34 baris)
_Layar judul_
`titleScreen()` 4

## src/world/layout.js (114 baris)
_Tata letak dunia terbuka (Tahap 1): posisi relatif wilayah tetangga dihitung dari pasangan pintu keluar_
`exitSide()` 5 · `OPP` 6 · `WORLD_POS` 10 · `PERALIHAN` 15 · `SIDE_OF` 20 · `plEnemies()` 22 · `NEIGH` 69

## src/gfx/gptassets.js (13 baris)
_Aset buatan pemilik (GPT) yang menggantikan tampilan lama. Gambar disiapkan oleh tools/prep_gpt_assets.py_
`GPT_SWAP` 4 · `GPT_LOOK` 5 · `applyGptSwap()` 10

## src/main.js (27 baris)
_Mulai game Phaser_
`game` 15
