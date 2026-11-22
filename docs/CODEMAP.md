# CODEMAP (dibuat otomatis oleh `node tools/codemap.js`, JANGAN diedit manual)

Cari nama di sini (`grep -n "namaFungsi" docs/CODEMAP.md`), lalu buka file:baris itu saja.
Format: `nama` baris. Urutan file = urutan muat di index.html.

## src/core/util.js (26 baris)
_Konstanta layar & util kecil_
`IS_TOUCH` 7 · `LAYOUT_FULL` 8 · `VW` 10 · `VH` 15 · `rnd` 19 · `ri` 20 · `pick` 21 · `clamp` 22 · `sleep` 23 · `$` 24 · `SCREEN` 25

## src/core/audio.js (271 baris)
_Audio chiptune WebAudio: musik (TRACKS) & efek suara (sfx)_
`AU_FILES` 4 · `AU` 18 · `NI` 19 · `nf()` 20 · `parseSeq()` 21 · `bossBass` 22 · `TRACKS` 23 · `auInit()` 45 · `tone()` 58 · `sweep()` 59 · `noise()` 60 · `_AUDIO_POOL` 61 · `BGM_BASE_VOL` 63 · `_bgmDuck` 64 · `routeTag()` 66 · `tagVolFor()` 70 · `tagSetVol()` 74 · `tagGetVol()` 75 · `setWeatherDuck()` 76 · `_rain` 78 · `rainSound()` 79 · `setBgmDuck()` 94 · `stopAudioTag()` 98 · `playBGM()` 105 · `SFX_FILES` 165 · `_SFX_BUFFERS` 176 · `loadSfxBuffers()` 178 · `playBufferSfx()` 190 · `_lastSfx` 208 · `sfx()` 209

## src/core/input.js (335 baris)
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

## src/art/characters.js (105 baris)
_Karakter manusia (peta piksel + mod + palet di CHARS)_
`CH_BODY` 4 · `CH_LEGS` 9 · `chMods()` 14 · `chLegs()` 39 · `CH_FW` 49 · `artChar()` 50 · `CHARS` 73

## src/art/arka_body_code.js (365 baris)
_Karakter Arka Murni Berbasis Kode (Full Code Modular Rigging)_
`ARKA_BODY` 6 · `_drawPixelList()` 307 · `arkaDrawHead()` 320 · `arkaDrawTorso()` 326 · `arkaDrawLegs()` 332 · `arkaDrawArms()` 338 · `arkaDrawFist()` 344 · `arkaDrawIdle()` 354

## src/art/monsters.js (63 baris)
_Monster (peta piksel di MON)_
`MON` 4 · `artMon` 27 · `artWisp()` 62

## src/art/monsters2.js (72 baris)
_Monster versi garang: bentuk baru (mata menyala, taring, tanduk, duri) + pencahayaan otomatis. Menimpa MON lama, kunci palet tetap sama agar varian warna jalan._
`mixHex()` 40 · `shadeMon()` 41 · `monFrame2()` 57

## src/art/items.js (223 baris)
_Ikon item & senjata_
`SWORD` 3 · `artSword()` 4 · `artSpear()` 9 · `artAxe()` 10 · `artBow()` 11 · `artArrow()` 12 · `artCoin()` 13 · `artPotion()` 18 · `artHeart()` 19 · `artShard()` 20 · `ICON_MAP` 22 · `ICONS_DEF` 49 · `iconFallback()` 109 · `artIcon()` 115

## src/art/fx.js (141 baris)
_Efek: tebasan, api, proyektil, cahaya, bayangan_
`artSlash()` 4 · `artFire()` 21 · `artSpore()` 31 · `artDot()` 32 · `artSmoke()` 33 · `artSpark()` 34 · `artButterfly()` 35 · `artShadow()` 40 · `artBone()` 41 · `artSeed()` 42 · `artRockShot()` 43 · `artBrazier()` 44 · `artIceGate()` 45 · `artIceBolt()` 46 · `artWarp()` 47 · `artStele()` 48 · `artBoat()` 49 · `artRelief()` 50 · `artSealDoor()` 51 · `artGatehouse()` 52 · `artCityWall()` 61 · `artAcademy()` 62 · `artRoot()` 73 · `artLight()` 76 · `artRain()` 77 · `artRainBg()` 87 · `artShadowSoft()` 97 · `artFog()` 111 · `artRipple()` 112 · `artSprout()` 113 · `shadowCanvas()` 115 · `artLightP()` 123 · `artCanopyOverhang()` 124

## src/art/interior.js (63 baris)
_Lantai & perabot interior_
`FURN` 4 · `drawFurn()` 5 · `genRoom()` 15 · `artMusicBox()` 29

## src/art/story_props.js (337 baris)
_Gambar properti & bangunan cerita baru (Prolog & Bab 1): Makam Mila, Gubuk Reyot, Sarang Pemburu Liar, dll._
`artMilaGrave()` 5 · `artRuinedShack()` 38 · `artSlaverCage()` 103 · `artPrisonerWagon()` 141 · `artSlaverTent()` 178 · `artSlaverBarricade()` 216 · `artReflectionSpring()` 242 · `artBurntRuin()` 265 · `artMudTracks()` 293 · `artDroppedTorch()` 312 · `artClothScrap()` 327

## src/world/objects.js (371 baris)
_Definisi objek dunia (tekstur, tabrakan, bayangan) & wadah MAPS_
`OBJ` 7 · `MAPS` 370

## src/world/spawn/spawn_1.js (392 baris)
_Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World_
`OBJ_SPAWN` 3 · obj `verdant_bush` 5 · obj `verdant_bush_small` 6 · obj `bushy` 7 · obj `bushv` 8 · obj `lampPost` 10 · obj `gpt_city_lamp` 18 · obj `shrine` 26 · obj `cavemouth` 29 · obj `sign` 32 · obj `forge` 42 · obj `pebbles` 63 · obj `telescope` 71 · obj `altar` 79 · obj `fieldoven` 87 · obj `dripstone` 95 · obj `frostflower` 103 · obj `totem` 111 · obj `pigeons` 119 · obj `teatable` 152 · obj `lotuspad` 160 · obj `dockboat` 168 · obj `coffeeshrub` 223 · obj `coffeekettle` 231 · obj `orchidrock` 239 · obj `canaryperch` 247 · obj `woodlandshrine` 255 · obj `bellows` 263 · obj `ringbooth` 271 · obj `archerytarget` 279 · obj `lakelighthouse` 287 · obj `streetdrum` 295 · obj `dummy` 303 · obj `pot` 311 · obj `well` 321 · obj `apple1` 336 · obj `bench` 341 · obj `bell` 357 · obj `campfire` 365 · obj `alchemytable` 382

## src/world/spawn/spawn_2.js (394 baris)
_Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World_
obj `brokenbridge` 4 · obj `board` 42 · obj `bombbarrel` 51 · obj `bramble` 81 · obj `minestone` 84 · obj `village_vault` 114 · obj `mirror_memory` 124 · obj `fame_board` 134 · obj `bounty_board` 143 · obj `deadtree` 152 · obj `rune_pillar` 180 · obj `fountain` 192 · obj `windmill` 204 · obj `treeA` 211 · obj `treeRedwood` 220 · obj `tree_redwood` 228 · obj `goblin_torch` 231 · obj `goblin_cauldron` 234 · obj `cryst` 243 · obj `lamp` 246 · obj `viewpoint` 254 · obj `lumina_shard` 288 · obj `scenicbench` 310 · obj `mailbox` 328 · obj `gatehouse` 338 · obj `ctower` 346 · obj `city_bridge` 349 · obj `gpt_city_banner` 352 · obj `gpt_city_banner_sm` 356 · obj `gpt_city_board` 360 · obj `mila_grave` 370 · obj `reflection_spring` 374 · obj `slaver_cage` 378

## src/world/ground.js (398 baris)
_Generator tanah, tabrakan grid, penyebar pohon_
`riverY()` 4 · `SD_PAD` 7 · `makeSD()` 8 · `pondE()` 38 · `GROUND` 39 · `blendW()` 51 · `BLEND_W` 57 · `WILD_G` 58 · `edgeSegs()` 59 · `edgeBlend()` 89 · `TILE_CACHE` 111 · `getTileData()` 112 · `genGround()` 123 · `blockRects()` 331 · `openSides()` 347 · `borderTrees()` 360 · `ringObjects()` 377 · `mapObjects()` 382 · `mapWalls()` 386

## src/world/grass.js (50 baris)
_RUMPUT — SATU SUMBER untuk seluruh dunia. Ganti tekstur rumput cukup di sini (atau ganti file PNG-nya):_
`GRASS` 8 · `grassTiles()` 15 · `grassSS` 21 · `grassTex()` 22 · `grassPass()` 27 · `grassCanvas()` 45

## src/world/grass_edge.js (153 baris)
_TEPI RUMPUT BERPETAK (autotile 47 bentuk) — percobaan, hanya untuk peta di GRASS_EDGE.maps._
`GRASS_EDGE` 7 · `GRASS_EDGE_MAP` 9 · `DIRT_S` 19 · `SAND_S` 20 · `WATER_S` 21 · `edgeClass()` 24 · `isGreen` 32 · `edgeClean()` 34 · `edgeTiles()` 47 · `grassEdgeData()` 60 · `grassEdgeCanvas()` 110

## src/world/water.js (89 baris)
_Bentuk air alami: elips `ponds` digabung halus (smooth union) jadi alur sungai menyambung,_
`WATER_WIDEN` 6 · `pondsBase()` 7 · `WGLOB` 25 · `waterGlobal()` 26 · `pondsAll()` 40 · `pondsNear()` 49 · `waterE()` 52 · `mapDoors()` 69 · `waterGXY()` 70 · `WATER_MOVABLE` 73 · `waterRelocate()` 74

## src/world/scatter_iso.js (103 baris)
_Penempatan pohon & vegetasi isometrik 2.5D: Variable-Radius Poisson-Disc, fBm Groves situasional, dan Asymmetric South Clearance._
`SCATTER_FOREST_RX` 3 · `SCATTER_TREE_RX` 4 · `scatterGroveNoise()` 6 · `scatterClearBase()` 10 · `scatterSouthClear()` 37 · `scatterPoissonOk()` 45 · `scatter()` 70

## src/world/maps/village.js (140 baris)
_Peta: Desa Lumina (Tata Letak Presisi Meniru Referensi Asli)_


## src/world/maps/forest.js (107 baris)
_Peta: Hutan Lumina (3 mini-boss, kuil, Raja Goblin)_


## src/world/maps/meadow.js (93 baris)
_Peta: Padang Angin_


## src/world/maps/cave.js (37 baris)
_Peta: Gua Batu (gelap, teka-teki batu, Golem Purba)_


## src/world/maps/swamp.js (188 baris)
_Peta: Rawa Senja (bab 2, Morgath)_


## src/world/maps/snow.js (59 baris)
_Peta: Puncak Beku (bab 3, obor kuno & Naga Es Kryos)_


## src/world/maps/lake.js (51 baris)
_Peta: Danau Cermin (bab 4, lentera kuno, perahu ke Kuil Penjaga Cahaya, jalan ke Kota Lumina tertutup longsor)_


## src/world/maps/city.js (201 baris)
_Peta: Jalan Raya Lama + Kota Lumina "Kota Seribu Lentera" (gerbang, pasar, akademi, kota bawah). Desain: docs/BENUA_LUMINA.md_
`houseRow` 4 · `lampRow` 5 · `cityLines` 6 · `citizens` 14

## src/world/maps/wild.js (194 baris)
_Peta: zona alam luas — Hutan Dalam (+ Reruntuhan Aurel) di barat Hutan Lumina, Jalur Sungai dari Hutan Lumina ke Rawa Senja_
`ruinRing` 5 · `deepwoodPaths` 15 · `deepwoodPonds` 27 · `snailSwarm` 28

## src/world/maps/interiors.js (71 baris)
_Interior: penginapan, rumah pohon, rumah Lina_
`makeRoom()` 4

## src/ui/widgets.js (261 baris)
_UI DOM: dialog (say/talk), menu (choose/ask), banner, angka melayang, HUD_
`UIH` 6 · `G` 7 · `win()` 8 · `fadeTo()` 9 · `shake()` 10 · `DLG_LOG` 15 · `say()` 16 · `talk()` 51 · `choose()` 55 · `ask()` 91 · `BANNER_QUEUE` 100 · `BANNER_BUSY` 101 · `processBannerQueue()` 102 · `banner()` 115 · `POPS` 124 · `popWorld()` 125 · `updPops()` 133 · `HUD` 136 · `buildHud()` 137 · `updHud()` 151 · `hudPeaceT` 223 · `updHudFade()` 224 · `showHud()` 239 · `bossBar()` 244 · `autoSaveIcon()` 260

## src/ui/spellbar.js (54 baris)
_Bilah 5 slot jurus dengan cooldown (T327)_
`SPELLBAR` 3 · `buildSpellbar()` 4 · `updSpellbar()` 12

## src/core/state.js (186 baris)
_Status pemain (S), simpan/muat, rumus stat_
`SAVE_BASE` 6 · `slotKey` 7 · `SAVE_SLOT` 8 · `SAVE_KEY` 9 · `setSlot()` 10 · `slotInfo()` 12 · `DIRV` 27 · `S` 28 · `OPT_KEY` 30 · `DIFF` 33 · `GAME_VERSION` 35 · `OPT` 36 · `saveOpt()` 38 · `applyOpt()` 39 · `newState()` 47 · `eqv()` 64 · `UPG` 70 · `itemName` 71 · `BUFF` 73 · `buffOn` 78 · `stat()` 79 · `need()` 116 · `has` 117 · `addItem()` 118 · `hasSave()` 127 · `saveGame()` 128 · `readSaveRaw()` 139 · `loadSave()` 143

## src/data/items.js (277 baris)
_Data item & resep tempa_
`ITEMS` 4 · `ICON_OF` 189 · `COOK` 215 · `RECIPES` 223 · `SETS` 231 · `activeSets()` 266

## src/data/enemies.js (67 baris)
_Data musuh & proyektil_
`ENEMY` 5 · `PROJ` 63 · `BOSS_AI` 64 · `BEAST` 65

## src/data/bestiary_text.js (161 baris)
_Teks bestiari per musuh (id = kunci ENEMY): habitat & tips melawan. Dipasang ke layar Bestiari oleh sesi besar._
`BESTIARY_TEXT` 3

## src/data/quests.js (66 baris)
_Teks misi, tujuan misi, jurus, pencapaian_
`STAGE_TXT` 4 · `STAGE_GOAL` 11 · `SKILLS` 18 · `ACH` 23

## src/data/lore.js (4 baris)
_Jurnal & catatan lore (di-reset dari 0, siap untuk skenario cerita baru)_
`LORE` 3

## src/systems/daynight.js (25 baris)
_Jam & siang-malam_
`nightAmt()` 4 · `isNight()` 11 · `gameHours()` 12 · `lerpCol()` 13 · `_clk` 17 · `updClock()` 18

## src/systems/achievements.js (70 baris)
_Cek pencapaian & kabar progres 50% / 90% (T265)_
`totalKills()` 3 · `toastAch()` 5 · `achProgCheck()` 15 · `achCheck()` 61

## src/gfx/bake.js (51 baris)
_Panggang bayangan objek ke tekstur tanah_
`SHC` 3 · `bakeGround()` 4 · `SHB` 25 · `shadowIndex()` 26

## src/gfx/textures.js (230 baris)
_Muat gambar & daftarkan semua tekstur/animasi ke Phaser_
`ICONS_CACHE` 4 · `ICONS` 5 · `IMGEL` 15 · `IMG_LIST` 17 · `imgSubdir()` 42 · `loadImgs()` 62 · `addStrip()` 76 · `darkTree()` 81 · `NPC_W` 83 · `regPortrait()` 84 · `regChar()` 90 · `buildTextures()` 109

## src/gfx/npc_rig.js (140 baris)
_Rig piksel NPC: dari 1 potret (atau lembar Mila) dibangun pose jalan/napas/berlutut/jatuh lewat potong-geser-cermin kanvas (tanpa warna baru)_
`NPC_FR` 4 · `NPC_RIG_DIRS` 5 · `rigCv()` 6 · `rigCrop()` 7 · `rigBands()` 9 · `rigCompose()` 33 · `rigLie()` 48 · `rigPoses()` 59 · `rigPerDir()` 69 · `rigFrames()` 71 · `npcWalkFrames()` 83 · `regNpcRig()` 85 · `rigAppend()` 132

## src/world/ground_verdant.js (325 baris)
_Tanah Verdant (Padang, Hutan, Hutan Dalam, Desa) gaya Senja Emas (G001 - G024)._
`VERDANT` 4 · `VBAY` 5 · `VDECO` 6 · `MEADOW_FLOWERS` 12 · `V_TILES` 17 · `CLUTTER_PADANG` 23 · `CLUTTER_FOREST` 29 · `CLUTTER_DEEPWOOD` 36 · `ISLANDS_PADANG` 43 · `ISLANDS_FOREST` 44 · `ISLANDS_DEEPWOOD` 45 · `WATER_DECO_PADANG` 46 · `WATER_DECO_FOREST` 47 · `VT_MAP` 58 · `verdantTiles()` 59 · `vModW` 77 · `vDirtN` 79 · `vDirtT` 80 · `verdantPix()` 83 · `verdantDeco()` 94 · `VBASE` 178 · `verdantBase()` 179 · `VWC` 211 · `verdantWater()` 215 · `VBANK` 228 · `verdantBank()` 235 · `regVerdantTex()` 253 · `verdantReflect()` 262 · `verdantEdgePix()` 291 · `bridgeWoodPix()` 305

## src/world/interior_sheet.js (91 baris)
_Interior gaya lembar pemilik (assets/raw/interior/sheet_interior.png → tools/gen_interior.py → assets/img/int_*.png)._
`INT_SIZE` 5 · `INT_FLAT` 14 · `INT_RUG` 16 · `intDims()` 17 · `rug9()` 18 · `genRoomSheet()` 30 · `_genRoom0` 80 · `sheetWalls()` 83 · `regIntTex()` 90

## src/scene/world.js (396 baris)
_Scene utama Phaser: membangun peta, update per frame, kamera. Metode lain ditambahkan lewat file mixin (Object.assign(World.prototype, ...))._
`.constructor()` 5 · `.create()` 6 · `.makeActiveFx()` 100 · `.dropActiveFx()` 113 · `.wall()` 114 · `.shadow()` 115 · `.spawnObj()` 116 · `.spawnChest()` 134 · `.spawnCrystal()` 141 · `.spawnBarrier()` 149 · `.spawnMochi()` 156 · `.spawnNpc()` 160 · `.face()` 171 · `.spawnCritter()` 172 · `.spawnFly()` 177 · `.spawnEnemy()` 182 · `.camShake()` 212 · `.update()` 213 · `.puff()` 311 · `.camStep()` 312 · `.pump()` 361 · `.front()` 370 · `.actionA()` 371 · `.sparkle()` 381 · `.checkZones()` 385

## src/systems/scene_nav.js (12 baris)
_Navigasi scene: pindah peta (goto, memuat ulang scene) & penjaga awal cerita (guardStop). Mode benua membungkus goto (benua_scene.js)._
`.goto()` 4 · `.guardStop()` 10

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

## src/systems/ambient.js (353 baris)
_Suasana alam: hewan kecil yang bereaksi ke pemain, kunang-kunang, ikan melompat, bayangan awan, berkas cahaya, kabut, suara latar, tanaman yang bisa dipungut._
`ENV` 4 · `artCritters()` 18 · `.spawnAmbient()` 38 · `.addBird()` 69 · `.addFly()` 76 · `.addCrit()` 83 · `.updAmbient()` 91 · `.ambOff()` 212 · `.ripple()` 213 · `.spawnRainEmitters()` 227 · `.rainSplash()` 243 · `.updRainFx()` 251 · `artQuestArrow()` 334 · `.updQuestGuide()` 341

## src/systems/status.js (125 baris)
_Efek status: racun/terbakar/dingin pada pemain, terbakar/beku pada musuh_
`STATUS` 5 · `.inflict()` 12 · `.cure()` 23 · `.speedMul()` 24 · `.updStatus()` 29 · `.enemyStatus()` 60 · `.poisonEnemy()` 101 · `.burnEnemy()` 102 · `.freezeEnemy()` 103 · `updStatusHud()` 110

## src/systems/prolog.js (8 baris)
_Sistem Prolog & Skenario Awal: dinetralkan untuk sandbox bebas eksplorasi tanpa dialog otomatis._
`.spawnProlog()` 4 · `.prologWashFace()` 5 · `.prologArriveVillage()` 6

## src/systems/travel.js (32 baris)
_Teleport: patung batu di tiap wilayah. Sentuh untuk mengaktifkan, lalu pindah instan ke patung lain yang aktif._
`WARPS` 3 · `.spawnWarp()` 9 · `.useWarp()` 15

## src/ai/enemies.js (394 baris)
_AI musuh biasa (hop, fly, shoot, turret, lunge, walk, charge, ghost, golem)_
`.updEnemy()` 4 · `.charAnim()` 387

## src/ai/unstuck.js (61 baris)
_Aturan Lepas-Sangkut Musuh Saat Mengejar (T468) — referensi: Hades_


## src/ai/elite_brute.js (106 baris)
_AI untuk musuh Brute Elite (Goblin Brute Elite, dsb)_
`.updEliteBrute()` 4

## src/ai/samurai.js (130 baris)
_AI Ronin Siber (Pendekar Pedang Pengembara): mobilitas lincah, tebasan sabit, shadow blink & multi-dash_
`.updSamurai()` 4

## src/ai/bosses.js (130 baris)
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

## src/systems/story.js (140 baris)
_Sistem cerita baru & transisi (skenario cerita lama di-reset dari 0)_
`.spawnCh4()` 4 · `.spawnCh5()` 5 · `.spawnIceGate()` 6 · `.updDragon()` 7 · `.ch5Enter()` 8 · `.readLore()` 9 · `.touchBarrier()` 14 · `.takeMochi()` 17 · `.useCrystal()` 21 · `.openChest()` 28 · `interactRunePillar()` 87

## src/npc/npcs.js (199 baris)
_Gerak NPC & hewan serta sapaan otomatis (barking dialog)_
`NPC_BARKS` 3 · `BARK_NODES` 58 · `popBark()` 59 · `updBarks()` 70 · `.updNpc()` 85 · `.updCritter()` 175

## src/npc/brain.js (197 baris)
_"Otak" NPC: setiap NPC punya rutinitas sesuai perannya (bekerja, berkeliling, mengobrol, duduk, berpatroli), pulang saat malam._
`NPC_ROLE` 4 · `STORY_NPC` 11 · `NPC_SCALES` 13 · `WORK` 21 · `SEATS` 35 · `SOCIAL` 36 · `IDLE_ICON` 37 · `.npcBrainInit()` 40 · `.npcEmote()` 58 · `.npcPickGoal()` 59 · `.npcWalkAnim()` 101 · `.npcBrain()` 112 · `.npcActStart()` 162 · `.npcActTick()` 167

## src/npc/crowd.js (232 baris)
_Sistem Warga Latar Ringan (Ambient Crowd) — ala Stoneshard / Assassin's Creed._
`CROWD_POOL` 5 · `.spawnCrowd()` 8 · `.updCrowd()` 62 · `.clearCrowd()` 153 · `.initCrowd()` 163 · `_initPolishCrowd` 185 · `_dropActiveFxCrowd` 192 · `_updAmbP` 225

## src/systems/qol.js (255 baris)
_Kenyamanan (gelombang 1 docs/arsip/PROGRES_FITUR.md): ikon interaksi (#851–852), jeda otomatis (#877), bilah HP musuh (#904),_
`.updInteractHint()` 6 · `.updEnemyBars()` 42 · `.retryBoss()` 79 · `levelUpDetail()` 85 · `.setTimeout()` 91 · `TIPS` 116 · `showTip()` 127 · `.updTips()` 146 · `.updPeaceHud()` 156 · `.updMinimap()` 161 · `.swapWeapon()` 195 · `.updStamina()` 206 · `.tryClimb()` 223 · `applyPadOpt()` 251

## src/systems/feel.js (312 baris)
_Rasa bertarung (gelombang 3): ancang-ancang (#1), kombo (#2), musuh elit (#4),_
`ELITE_RATE` 4 · `DODGERS` 5 · `LEVEL_WILAYAH` 6 · `markOver()` 7 · `dangerEdge()` 13 · `.makeElite()` 19 · `.updFeel()` 44 · `.dangerFrom()` 164 · `.hurtAnim()` 171 · `.hasLineOfSight()` 173 · `_spawnEnemy` 189 · `_killEnemy` 209 · `_feelCr` 240

## src/systems/sound.js (129 baris)
_Suara gelombang 4: lagu per wilayah (#86), musik dinamis (#87), desa malam (#911),_
`bgmFor()` 33 · `_bgmFadeInt` 43 · `swapBGM()` 44 · `sfxAt()` 77 · `_stepLeft` 86 · `stepSound()` 87 · `segD()` 102 · `.groundAt()` 104 · `.updSound()` 114

## src/systems/craft.js (283 baris)
_Gelombang 5: poin atribut (#16), kerajinan (#26), bom & alat lempar (#29, #407),_
`CRAFT` 38 · `ATTR` 59 · `attrInit()` 60 · `_statBase` 66 · `openAttr()` 72 · `canCraft` 84 · `openCraft()` 85 · `openToolSlots()` 116 · `updToolBtns()` 126 · `.useSlot()` 135 · `.useTool()` 140

## src/systems/explore.js (204 baris)
_Gelombang 6: kabut peta (#61), rahasia (#63), peta harta (#66), lubang galian (#665),_
`FOG_N` 4 · `WILD` 5 · `ROLE_ICON` 8 · `hash32()` 9 · `seeded()` 10 · `fogOf()` 12 · `fogSeen()` 17 · `drawFog()` 18 · `.updFog()` 25 · `.freeSpot()` 32 · `.initSecrets()` 50 · `.initTreasure()` 67 · `.digTreasure()` 72 · `.openSecret()` 78 · `.giveTreasureMap()` 89 · `.updSecrets()` 105 · `.blastAt()` 112 · `openMapNew()` 115 · `.draw()` 157

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

## src/systems/stream.js (89 baris)
_Gelombang B: tanah per chunk (streaming). Hanya potongan di sekitar layar yang dibuat, sisanya dibuat_
`GT` 5 · `GTC` 6 · `GOV` 7 · `gtKey()` 8 · `groundOverview()` 9 · `gLayer()` 16 · `.initGround()` 18 · `.gFillView()` 28 · `.gNeed()` 30 · `.gEnsure()` 40 · `.updGround()` 57 · `.cleanGroundCache()` 77

## src/systems/openworld.js (52 baris)
_Dunia terbuka Tahap 1: wilayah tetangga digambar menempel di tepi wilayah aktif (tanah + objek),_
`OW_BAND` 5 · `.initOpen()` 7 · `.owSeamless()` 37 · `.updCross()` 38

## src/systems/regions.js (96 baris)
_Dunia satu peta (langkah 1): wilayah di sekitar Arka berjalan BERSAMAAN sebagai scene World pasif_
`REG_LOAD` 6 · `REG` 7 · `regSeq` 8 · `regionsOn()` 9 · `wposOf()` 10 · `relXY()` 11 · `removeRegions()` 12 · `.initPassive()` 15 · `.updPassive()` 21 · `.updRegions()` 38 · `.addRegion()` 52 · `.regBounds()` 59 · `.owHandoff()` 65 · `_hurtRegion` 87 · `_gotoRegion` 94

## src/systems/groundlayer.js (51 baris)
_Lapisan tanah bersama (scene 'GL', selalu paling bawah): tanah SEMUA wilayah luar ruang yang dimuat + hutan pengisi celah,_
`glOn()` 24 · `.glScene()` 26 · `.syncCams()` 32

## src/systems/wilds.js (98 baris)
_Hutan lebat pengisi celah kosong antarwilayah (dunia terbuka): tidak ada lagi area hitam. Digambar di lapisan tanah_
`WILD_MARGIN` 5 · `WILD_RECTS` 6 · `outdoorRects()` 7 · `inRegion()` 11 · `wildRects()` 12 · `wildTreeKeys()` 38

## src/systems/benua.js (113 baris)
_MODE BENUA (dunia satu peta, tahap 1): semua wilayah luar ruang dibangun SEKALIGUS dalam satu scene `World` berkoordinat_
`BENUA` 7 · `OBJ_CELL` 16 · `isOutdoorRegion()` 17 · `regionAt()` 18 · `shiftDeep()` 23 · `BENUA_SHIFT` 35 · `BFIELD` 37 · `benuaField()` 38 · `regionClone()` 45 · `buildBenua()` 50 · `benuaData()` 93 · `benuaLocalize()` 100 · `benuaTarget()` 105

## src/systems/benua_scene.js (161 baris)
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

## src/systems/reflect.js (60 baris)
_Pantulan Karakter di Air (T460) — referensi: RPG klasik / Sea of Stars_


## src/systems/tree_shadows.js (67 baris)
_Bayangan Daun Bergoyang & Proyeksi Miring Dinamis (T448, T552) — referensi: Cobo #18, Stardew_


## src/systems/sprout_deco.js (95 baris)
_SEMAK, BATU & HIASAN GAYA SPROUT LANDS — untuk peta di GRASS_EDGE.maps (world/grass_edge.js)._
`SPROUT_DECO` 7 · `SPROUT_OBJ` 20 · `sproutArt()` 27 · `sproutDecoFor()` 36 · `_mapObjectsSprout` 68 · `sproutRegionAt()` 86

## src/systems/water_fx.js (86 baris)
_EFEK AIR HIDUP gaya Sprout — riak melingkar, kilau matahari, buih ombak yang menyapu pasir._
`WATER_FX` 5 · `waterFxTex()` 6 · `waterFxCell()` 31 · `waterFxSpawn()` 37 · `waterFxStep()` 61

## src/systems/shore_waves.js (85 baris)
_OMBAK PANTAI — lapisan air tipis naik ke pasir, ujungnya berbuih putih, lalu surut meninggalkan pasir basah._
`SHORE` 5 · `shoreAtlas()` 8 · `shoreCells()` 39 · `shoreStep()` 51

## src/systems/aimassist.js (48 baris)
_Sistem Aim Assist untuk Layar Sentuh / Mobile (T481)_


## src/systems/combat_fx.js (393 baris)
_Rasa tempur ala Dimraeth: bidik bantu, langkah maju saat menebas, busur tebasan, kilat & percikan saat kena, debu berguling._
`CFX` 4 · `ARC_TINT` 5 · `arcTint()` 6 · `.arcTex()` 11 · `.slashFx()` 28 · `.nearFoe()` 79 · `.hitFx()` 89 · `.updChargeFx()` 134 · `.clearChargeFx()` 150 · `.spinFx()` 156 · `.enemyWindFx()` 178 · `.enemySlashFx()` 185 · `.enemySmashFx()` 195 · `.enemyRingFx()` 209 · `.rollFx()` 214 · `.updLowHp()` 235

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

## src/npc/dialog.js (95 baris)
_Percakapan NPC fungsional & interaksi bersih (bebas dari dialog skenario cerita lama)_
`.npcHasQuest()` 4 · `.talkNpc()` 7 · `.shop()` 36 · `.smithy()` 59 · `.innTalk()` 80

## src/npc/city_events.js (207 baris)
_Event & aktivitas Kota Lumina: Gelanggang Tarung (Arena), Pasar Malam, Ekspedisi Kurir, Balai Lelang_
`.talkArenaMaster()` 4 · `.startCityArena()` 41 · `.talkNightMerchant()` 108 · `.talkCourier()` 122 · `.talkAuctioneer()` 156

## src/npc/npc_emote.js (61 baris)
_Gelembung emosi NPC buatan kode (!, ?, hati, air mata, marah, keringat, zzz) + tekstur kecil pendukung (rantai, roti). Selalu berbatas waktu._
`NPC_EMO_PAL` 3 · `NPC_EMO` 4 · `npcPixTex()` 14 · `npcEmoTex()` 23 · `npcExtraTex()` 33 · `.npcEmote()` 40 · `.npcEmoteClear()` 47 · `.npcBubbleTick()` 48

## src/npc/npc_acts.js (138 baris)
_Tabel aksi animasi NPC (talk, wary, cheer, panic, mourn, pray, hurt, fall/die, captive, offer, walk). Dipanggil mesin di npc_anim.js._
`NPC_ACT_DUR` 4 · `NPC_DSET` 7 · `npcPose()` 8 · `npcDirTo()` 13 · `npcStep()` 18 · `npcLook()` 21 · `npcSide()` 22 · `NPC_ACTS` 23

## src/npc/npc_anim.js (86 baris)
_Mesin animasi NPC: npcAct/npcActEnd, napas saat diam, kait ke otak NPC (brain.js), updNpc & talkNpc. Dokumen: docs/NPC_ANIM.md_
`.npcFind()` 5 · `.npcActName()` 6 · `.npcAct()` 8 · `.npcActMany()` 22 · `.npcActEnd()` 30 · `.npcActClean()` 38 · `.npcActUpd()` 48 · `.npcIdleVisual()` 56 · `.npcHide()` 62 · `.npcShow()` 63 · `.npcTalkWhile()` 65 · `_npcBrainA` 70 · `_updNpcA` 72 · `_talkNpcA` 80

## src/npc/npc_demo.js (29 baris)
_Pembantu uji visual animasi NPC (konsol): __game.sc.npcDemo() menaruh barisan NPC di dekat pemain, tiap NPC memainkan satu aksi; npcDemoClear() menghapus._
`NPC_DEMO_ACTS` 3 · `NPC_DEMO_CH` 4 · `.npcDemo()` 7 · `.npcDemoClear()` 20

## src/ui/shop.js (383 baris)
_Menu beli, jual, tempa_
`icon` 4 · `ownedEq` 5 · `buyMenu()` 6 · `buybackMenu()` 86 · `sellMenu()` 124 · `forgeMenu()` 236 · `cookMenu()` 258 · `upgCost()` 323 · `upgradeMenu()` 324

## src/ui/socket.js (76 baris)
_Menu Pasang Permata (#23)_
`socketMenu()` 3

## src/ui/bag.js (307 baris)
_Tas (inventaris) & buku misi_
`BAG_TABS` 4 · `BAG_SORT` 5 · `BAG_SEARCH` 6 · `saveBagPrefs()` 7 · `loadBagPrefs()` 12 · `openBag()` 19 · `openQuests()` 262

## src/ui/map.js (42 baris)
_Layar peta & navigasi tujuan misi_
`MINI` 4 · `WORLD` 5 · `buildMini()` 6 · `routeNext()` 23 · `questTarget()` 28 · `openMap()` 35

## src/ui/menus.js (395 baris)
_Menu utama, jurus, bestiari, pencapaian_
`subMenu()` 4 · `mainMenu()` 11 · `openSettings()` 56 · `openSkills()` 96 · `enemyThumb()` 108 · `openBestiary()` 109 · `openFishLog()` 117 · `openAch()` 118 · `openDlgLog()` 124 · `chooseSlot()` 131 · `openDebugMenu()` 155 · `openPhotoMode()` 213 · `TALENT_DEFS` 281 · `getTalentPoints()` 308 · `openTalentTree()` 318

## src/ui/savecode.js (49 baris)
_Kode save: ekspor/impor progres sebagai teks (pindah perangkat / cadangan)_
`CODE_TAG` 3 · `saveCode()` 4 · `readCode()` 5 · `codeDialog()` 10

## src/ui/title.js (58 baris)
_Layar judul_
`titleScreen()` 4

## src/ui/map_editor.js (357 baris)
_Visual Map Editor (In-Game WYSIWYG) untuk menata pohon, bangunan, dan objek secara visual langsung di browser._
`MAP_EDITOR_CATEGORIES` 5 · `mapEditor` 339

## src/world/layout.js (120 baris)
_Tata letak dunia terbuka (Tahap 1): posisi relatif wilayah tetangga dihitung dari pasangan pintu keluar_
`exitSide()` 5 · `OPP` 6 · `WORLD_POS` 10 · `PERALIHAN` 15 · `SIDE_OF` 16 · `plEnemies()` 18 · `NEIGH` 75

## src/world/organic.js (51 baris)
_Refactor desain dunia (docs/WORLD_REFACTOR.md) tahap A, B, F-otomatis: jalan TANAH dibelokkan (ujung tetap),_
`ORG_SKIP` 5 · `ORG_FILL` 6 · `orgPlanned()` 7 · `orgCurve()` 9

## src/world/cliffs.js (180 baris)
_T442, T445 & Elevated Border Cliffs:_


## src/systems/waterflow.js (155 baris)
_Animasi air mengalir: garis riak terang tipis bergerak searah aliran sungai (hulu → hilir = urutan elips `ponds`,_
`FLOW_MAX` 4 · `waterFlowAt()` 6 · `flowTex()` 28 · `foamTex()` 35 · `isShorelineAt()` 42 · `.updFlow()` 53 · `_updFlow0` 147

## src/systems/atmos.js (364 baris)
_Suasana cahaya & kabut (wilayah aktif saja):_
`ATMOS_POOL` 7 · `fogSheetTex()` 8 · `moteTex()` 19 · `godrayTex()` 25 · `cloudShadowTex()` 40 · `biomeMoteProfile()` 95 · `.updAmbientMotes()` 118 · `.updCritters()` 181 · `.updWindGust()` 222 · `.updGodRays()` 250 · `.updBanners()` 277 · `.updAtmos()` 290

## src/systems/sunbeams.js (38 baris)
_T450: Sinar matahari pagi di hutan (jam 6-9 di forest/deepwood)_


## src/systems/cloudshadow.js (79 baris)
_T447: Bayangan awan berjalan_


## src/gfx/gptassets.js (103 baris)
_Aset buatan pemilik (GPT) yang menggantikan tampilan lama. Gambar disiapkan oleh tools/prep_gpt_assets.py_
`GPT_SWAP` 4 · `GPT_LOOK` 13 · `applyGptSwap()` 26

## src/gfx/style_unify.js (35 baris)
_Penyeragaman gaya: PATOKAN = pohon treeA / treeAd / treeSn (hijau alami, garis luar halus) + set Verdant yang senada._
`styleLeafPalette()` 21 · `styleRecolor()` 27

## src/gfx/code_palette.js (112 baris)
_T439: Selaraskan warna objek KODE ke palet treeA / Verdant_


## src/gfx/gptmonsters.js (165 baris)
_Sprite monster dari lembar GPT pemilik (dibersihkan oleh tools/gpt_monsters.py → assets/img/mon_<key>.png, strip 2 frame)._
`GPT_MON` 5 · `GPT_MON_NEW` 7 · `applyGptMonsters()` 9

## src/gfx/hero_arka.js (82 baris)
_Sprite sheet lengkap Arka dari ChatGPT (assets/raw/hero/arka_sheet1..6.png → tools/gen_hero.py → assets/img/hero_arka.png)._
`HERO_FW` 5 · `HERO_ROW` 6 · `regHeroArka()` 13 · `setHeroSkin()` 25 · `heroFrame()` 29

## src/gfx/enemy_sheets.js (69 baris)
_Lembar musuh baru dari ChatGPT (assets/raw/enemy/<id>.png → tools/gen_enemy.py → assets/img/esh_<id>.png)._
`ESH` 5 · `regEnemySheets()` 19 · `eshFrame()` 41

## src/systems/juice.js (330 baris)
_"Juice" v1.45: lapisan partikel & animasi tambahan di atas sistem yang ada (tanpa mengubah logika tempur)._
`JX_MAT` 9 · `jxMat()` 14 · `jxTextures()` 15 · `JX_CFG` 33 · `.jx()` 45 · `.jxLevelUp()` 69 · `.jxWind()` 76 · `.jxGhost()` 86 · `.jxShots()` 91 · `.jxTele()` 108 · `.jxNodePop()` 121 · `.jxSwoosh()` 127 · `.jxCrater()` 136 · `.jxDustRing()` 146 · `.jxPostureBreak()` 155 · `.jxAura()` 166 · `.jxTick()` 184

## src/systems/arka_anims.js (30 baris)
_Memakai pl._emote (dibaca heroFrame, gfx/hero_arka.js). Selalu berbatas waktu `t` agar tak pernah menyangkut._
`arkaPose()` 3

## src/art/sword_art.js (29 baris)
_Aset genggaman pedang Arka (dibuat kode, palet sama dengan senjata lama): pedang beresolusi lebih halus + kepalan menggenggam._
`SWORD_HD_MAP` 5 · `SWORD_HD_PAL` 11 · `SWORD_PIVOT` 15 · `swordOriginX()` 16 · `artSwordHD()` 17 · `artFistGrip()` 18 · `regSwordArt()` 22

## src/systems/sword_hand.js (119 baris)
_Pedang terkunci & DIGENGGAM di tangan Arka. Sprite serangan Arka (hero_arka.png, frame 48×40, kaki di (24,39)) digambar TANPA pedang;_
`HERO_HAND` 9 · `SWORD_CARRY` 15 · `CARRY_HAND` 16 · `HC_R` 17 · `handAnchor()` 19 · `.heroHand()` 38 · `.sheathPose()` 44 · `.sheathSword()` 52 · `.swordRest()` 65 · `.gripFist()` 71 · `.swordToHand()` 78 · `.swordToHand0()` 79 · `.swordCarry()` 92

## src/systems/sword_swing.js (46 baris)
_Ayunan pedang Arka: ancang-ancang (tarik ke belakang) → ayun cepat melewati sasaran → pantulan → pulih, tetap di tangan sampai selesai._
`.swingSword()` 5

## src/systems/sword_bake.js (60 baris)
_Pedang Arka yang DIGAMBAR PER FRAME (assets/img/hero/hero_swl{0,1}.png ← tools/gen_sword_layer.py). Pedang + kepalan sudah menempel di tangan_
`SWL_FW` 6 · `SWL_ROWS` 7 · `SWL_HAND` 9 · `regSwordLayer()` 11 · `_bakeStd` 22 · `.bakeOn()` 24 · `.bakeSheath()` 26 · `.swordBake()` 34 · `.swordToHand()` 58

## src/systems/grade.js (125 baris)
_Sistem Rona Wilayah & Transisi Antar Wilayah Halus (v1.52.0 - ala 36 Bioma Cobo Makes Games / Mytheria)_
`ID_M` 8 · `BIOME_GRADE` 11 · `biomeBaseMatrix()` 24 · `lerpMatrix()` 30 · `TRANS_BAND` 37 · `calcTargetGrade()` 38 · `applyGradeFX()` 87

## src/systems/isoview.js (94 baris)
_TAMPILAN ISOMETRIK untuk game utama (tahap 1). Saklar: ?iso=1 (diingat di localStorage 'lumina_iso'), matikan: ?iso=0._
`ISO_VIEW` 11 · `ISO_ZOOM` 19 · `ISO_FLATD` 20 · `isoActive()` 21 · `isoScenes()` 22

## src/main.js (44 baris)
_Mulai game Phaser_
`game` 20
