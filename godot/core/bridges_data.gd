class_name BridgesData
extends RefCounted
## DIBUAT OTOMATIS oleh tools/seam_ground.py — jangan disunting tangan.
## Jembatan kayu per wilayah (koordinat lokal, piksel). BenuaWorld menghapus petak air (tabrakan) di bawahnya.

const LIST: Dictionary = {
	&"lake": [Rect2i(832, 536, 48, 144)],
	&"forest": [Rect2i(384, 488, 48, 160)],
	&"river": [Rect2i(64, 488, 48, 128), Rect2i(400, 536, 48, 144), Rect2i(1208, 608, 160, 48), Rect2i(1376, 616, 48, 160)],
	&"swamp": [Rect2i(208, 456, 48, 128)],
	&"snow": [Rect2i(664, 832, 192, 48)],
	&"meadow": [Rect2i(584, 464, 192, 48), Rect2i(936, 792, 48, 144)],
}
