class_name StoryManager
extends Control
## Pengelola alur cerita & cutscene Legenda Lumina (Prolog: Terdampar di Tepi Sungai -> Mata Air Refleksi -> Tiba di Desa Lumina).

static var ref: StoryManager = null

var _busy: bool = false
var _name_modal: PanelContainer = null
var _name_input: LineEdit = null
var _name_confirmed: bool = false
var _spring_node: Area2D = null
var _wood_nodes: Array[Area2D] = []
var _mila_node: Node2D = null


func _enter_tree() -> void:
	ref = self


func _ready() -> void:
	name = "StoryManager"
	process_mode = Node.PROCESS_MODE_ALWAYS
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_build_name_modal()
	if EventsBus.ref != null:
		EventsBus.ref.map_changed.connect(_on_map_changed)


func start_prolog() -> void:
	if _busy or GameStateStore.ref == null or SceneService.ref == null:
		return
	_busy = true
	var gs: GameStateStore = GameStateStore.ref
	gs.story_stage = 0
	gs.skin_id = &"mc2_slave"
	gs.hp = maxi(25, int(float(gs.total_max_hp()) * 0.35))
	gs.stamina = 35.0
	gs.world_hour = 6.2
	if EventsBus.ref != null:
		EventsBus.ref.skin_changed.emit(gs.skin_id)
		EventsBus.ref.time_of_day_changed.emit(gs.world_hour)
		EventsBus.ref.player_stats_changed.emit()

	await SceneService.ref.change_map("res://maps/river.tscn", &"default", true)
	_spawn_reflection_spring()

	await play_narration([
		"Dingin... suara arus sungai yang deras memenuhi telingamu.",
		"Kau terdampar sendirian di bebatuan tepi sungai. Pakaianmu koyak, dan bekas belenggu masih memerah di pergelangan tangan.",
		"Kepalamu berdenyut hebat. Kau bahkan tidak bisa mengingat namamu sendiri...",
		"Di dekat sini ada Mata Air Refleksi yang jernih. Dekati dan tekan [E] untuk membasuh luka dan menenangkan diri.",
	], "")

	gs.story_stage = 1
	if EventsBus.ref != null:
		EventsBus.ref.notification_requested.emit("Prolog: Dekati Mata Air Refleksi [E] di dekatmu")
	_busy = false


func _on_map_changed(map_path: String, _spawn: StringName) -> void:
	var gs: GameStateStore = GameStateStore.ref
	if gs == null:
		return
	var rid: StringName = WorldLayout.id_from_path(map_path)
	if rid == &"river" and gs.story_stage == 1:
		call_deferred(&"_spawn_reflection_spring")
	elif rid == &"village" and gs.story_stage == 2 and not _busy:
		call_deferred(&"_play_village_arrival")
	elif rid == &"village" and gs.story_stage == 4:
		call_deferred(&"_spawn_ch1a_firewood")
	elif rid == &"village" and gs.story_stage == 5:
		call_deferred(&"_spawn_ch1a_mila")


func _spawn_reflection_spring() -> void:
	if SceneService.ref == null:
		return
	var pl: Node2D = SceneService.ref.get_current_player()
	if pl == null or not is_instance_valid(pl):
		return
	if _spring_node != null and is_instance_valid(_spring_node):
		_spring_node.queue_free()

	var parent_node: Node = pl.get_parent()
	if parent_node == null:
		return

	var spring: Interactable = Interactable.new()
	spring.name = "ReflectionSpring"
	spring.position = pl.position + Vector2(56.0, -18.0)
	spring.collision_layer = 64
	spring.collision_mask = 0
	spring.prompt_key = "Mata Air Refleksi [E]"

	var cs: CollisionShape2D = CollisionShape2D.new()
	var sh: CircleShape2D = CircleShape2D.new()
	sh.radius = 24.0
	cs.shape = sh
	spring.add_child(cs)

	var pool: Polygon2D = Polygon2D.new()
	pool.color = Color(0.45, 0.85, 0.98, 0.72)
	pool.polygon = PackedVector2Array([
		Vector2(-14, 0), Vector2(-10, -8), Vector2(0, -10), Vector2(10, -8),
		Vector2(14, 0), Vector2(10, 8), Vector2(0, 10), Vector2(-10, 8),
	])
	spring.add_child(pool)

	var glint: Polygon2D = Polygon2D.new()
	glint.color = Color(0.92, 0.98, 1.0, 0.88)
	glint.polygon = PackedVector2Array([
		Vector2(-5, -3), Vector2(4, -3), Vector2(2, -1), Vector2(-6, -1),
	])
	spring.add_child(glint)

	spring.interacted.connect(_on_spring_interacted)
	parent_node.add_child(spring)
	_spring_node = spring


func _on_spring_interacted(_actor: Node) -> void:
	if _busy or GameStateStore.ref == null:
		return
	var gs: GameStateStore = GameStateStore.ref
	if gs.story_stage != 1:
		return
	_busy = true
	await play_narration([
		"Air pegunungan yang jernih memantulkan wajahmu yang penuh lumpur dan lelah.",
		"Saat kau membasuh wajah, sebuah bisikan samar dari masa lalu bergema di kepalamu...",
	], "")

	var chosen_name: String = await prompt_player_name()
	gs.player_name = chosen_name
	gs.hp = mini(gs.total_max_hp(), gs.hp + 40)
	gs.stamina = gs.max_stamina
	gs.story_stage = 2
	if EventsBus.ref != null:
		EventsBus.ref.player_stats_changed.emit()

	await play_narration([
		"Ya... namaku %s." % chosen_name,
		"Aku masih hidup, dan aku tidak akan kembali menjadi budak siapa pun.",
		"Di kejauhan arah barat tampak kepulan asap cerobong rumah. Mungkin ada desa di sana...",
	], chosen_name)

	if _spring_node != null and is_instance_valid(_spring_node):
		_spring_node.queue_free()
		_spring_node = null
	if EventsBus.ref != null:
		EventsBus.ref.notification_requested.emit("Prolog: Menuju Desa Lumina (ke barat melewati Hutan)")
	_busy = false


func _play_village_arrival() -> void:
	if _busy or GameStateStore.ref == null:
		return
	_busy = true
	var gs: GameStateStore = GameStateStore.ref
	await play_narration([
		"Kepulan asap itu berasal dari sebuah desa kecil yang tenang — Desa Lumina.",
		"Beberapa warga melirik curiga melihat pakaianmu yang compang-camping dan bekas luka di pergelangan tanganmu.",
		"Temui Tetua Bram di dekat sumur pusat desa untuk meminta izin berteduh.",
	], gs.player_name)
	gs.story_stage = 3
	if EventsBus.ref != null:
		EventsBus.ref.notification_requested.emit("Prolog selesai! Temui Tetua Bram di dekat sumur desa.")
	_busy = false


func try_handle_npc_interaction(npc_name_key: String, _npc: Node) -> bool:
	if _busy or GameStateStore.ref == null:
		return false
	var gs: GameStateStore = GameStateStore.ref
	if npc_name_key == "npc_elder_name":
		if gs.story_stage == 3:
			call_deferred(&"_play_ch1a_bram_intro")
			return true
		if gs.story_stage == 4:
			call_deferred(&"_play_ch1a_bram_wood_check")
			return true
	return false


func _play_ch1a_bram_intro() -> void:
	if _busy or GameStateStore.ref == null:
		return
	_busy = true
	var gs: GameStateStore = GameStateStore.ref
	await play_narration([
		"Hmm... wajah baru. Pakaianmu koyak, dan bekas rantai di pergelangan tanganmu itu bukan luka biasa.",
		"Desa Lumina ini desa kecil yang damai, anak muda. Kami tidak ingin masalah... tapi aku juga tak tega mengusir orang yang hampir mati di sungai.",
		"Ada gubuk kayu kosong di sisi desa yang boleh kau pakai berteduh. Tapi di sini tidak ada yang gratis.",
		"Bantu warga dulu: kumpulkan 3 ikat kayu bakar di sekitar pinggiran Desa Lumina, lalu bawa kembali padaku.",
	], "Tetua Bram")
	gs.flags["ch1a_wood_count"] = 0
	gs.flags["ch1a_wood_taken"] = []
	gs.story_stage = 4
	_spawn_ch1a_firewood()
	if EventsBus.ref != null:
		EventsBus.ref.notification_requested.emit("Bab 1A: Kumpulkan 3 ikat kayu bakar di pinggiran Desa Lumina (0/3)")
	_busy = false


func _spawn_ch1a_firewood() -> void:
	if SceneService.ref == null or GameStateStore.ref == null:
		return
	var pl: Node2D = SceneService.ref.get_current_player()
	if pl == null or not is_instance_valid(pl):
		return
	var parent_node: Node = pl.get_parent()
	if parent_node == null:
		return
	for wn: Area2D in _wood_nodes:
		if is_instance_valid(wn):
			wn.queue_free()
	_wood_nodes.clear()

	var taken: Array = GameStateStore.ref.flags.get("ch1a_wood_taken", []) as Array
	var spots: Array[Vector2] = [
		Vector2(240.0, 220.0),
		Vector2(760.0, 260.0),
		Vector2(690.0, 560.0),
	]
	for i: int in spots.size():
		if taken.has(i):
			continue
		var bundle: Interactable = Interactable.new()
		bundle.name = "FirewoodBundle_%d" % i
		bundle.position = spots[i]
		bundle.collision_layer = 64
		bundle.collision_mask = 0
		bundle.prompt_key = "Ambil Kayu Bakar [E]"

		var cs: CollisionShape2D = CollisionShape2D.new()
		var sh: CircleShape2D = CircleShape2D.new()
		sh.radius = 22.0
		cs.shape = sh
		bundle.add_child(cs)

		# Visual ikatan kayu bakar sederhana & jelas terlihat
		for log_y: float in [-4.0, 0.0, 4.0]:
			var log_poly: Polygon2D = Polygon2D.new()
			log_poly.color = Color(0.46, 0.28, 0.14, 1.0) if log_y != 0.0 else Color(0.56, 0.35, 0.18, 1.0)
			log_poly.polygon = PackedVector2Array([
				Vector2(-10, log_y - 2), Vector2(10, log_y - 2),
				Vector2(10, log_y + 2), Vector2(-10, log_y + 2),
			])
			bundle.add_child(log_poly)
		var rope: Polygon2D = Polygon2D.new()
		rope.color = Color(0.86, 0.72, 0.38, 1.0)
		rope.polygon = PackedVector2Array([
			Vector2(-2, -6), Vector2(2, -6), Vector2(2, 6), Vector2(-2, 6),
		])
		bundle.add_child(rope)

		var idx: int = i
		bundle.interacted.connect(func(_actor: Node) -> void: _on_wood_collected(idx, bundle))
		parent_node.add_child(bundle)
		_wood_nodes.append(bundle)


func _on_wood_collected(idx: int, node: Area2D) -> void:
	if _busy or GameStateStore.ref == null:
		return
	var gs: GameStateStore = GameStateStore.ref
	var taken: Array = gs.flags.get("ch1a_wood_taken", []) as Array
	if taken.has(idx):
		return
	taken.append(idx)
	gs.flags["ch1a_wood_taken"] = taken
	var count: int = taken.size()
	gs.flags["ch1a_wood_count"] = count
	if AudioService.ref != null:
		AudioService.ref.play_sfx_id(&"pickup")
	if is_instance_valid(node):
		node.queue_free()
	if EventsBus.ref != null:
		if count >= 3:
			EventsBus.ref.notification_requested.emit("Kayu bakar terkumpul (3/3)! Kembalilah menemui Tetua Bram.")
		else:
			EventsBus.ref.notification_requested.emit("Kayu bakar terkumpul (%d/3)" % count)


func _play_ch1a_bram_wood_check() -> void:
	if _busy or GameStateStore.ref == null:
		return
	_busy = true
	var gs: GameStateStore = GameStateStore.ref
	var count: int = int(gs.flags.get("ch1a_wood_count", 0))
	if count < 3:
		await play_narration([
			"Baru %d ikat kayu bakar? Kumpulkan 3 ikat di pinggiran desa dulu, baru kembali padaku." % count,
		], "Tetua Bram")
		_busy = false
		return

	await play_narration([
		"Bagus... tanganmu memang terbiasa bekerja keras, %s." % gs.player_name,
		"Gubuk di sisi desa sekarang boleh kau tempati. Ambil juga pakaian desa bersih ini—jangan terus memakai kain budak yang sobek itu.",
		"Warga di sini ramah kalau kau sudah mau membaur. Istirahatlah dulu... oh, sepertinya si kecil Mila sedang mencarimu di dekat sini.",
	], "Tetua Bram")

	gs.skin_id = &"mc2"
	gs.story_stage = 5
	if AudioService.ref != null:
		AudioService.ref.play_sfx_id(&"level_up")
	if EventsBus.ref != null:
		EventsBus.ref.skin_changed.emit(gs.skin_id)
		EventsBus.ref.notification_requested.emit("Pakaian desa dipakai! Temui Mila di dekat sumur desa.")
	_spawn_ch1a_mila()
	_busy = false


func _spawn_ch1a_mila() -> void:
	if SceneService.ref == null:
		return
	var pl: Node2D = SceneService.ref.get_current_player()
	if pl == null or not is_instance_valid(pl):
		return
	var parent_node: Node = pl.get_parent()
	if parent_node == null:
		return
	if _mila_node != null and is_instance_valid(_mila_node):
		_mila_node.queue_free()

	var mila: Node2D = Node2D.new()
	mila.name = "StoryMila"
	mila.position = pl.position + Vector2(44.0, 22.0)

	var spr: Sprite2D = Sprite2D.new()
	var tex: Texture2D = ResourceLoader.load("res://assets/art/npc/npc_mc_girl.png") as Texture2D
	spr.texture = tex
	spr.region_enabled = true
	spr.region_rect = Rect2(0, 168, 64, 56) # idle_down frame 0
	spr.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	spr.scale = Vector2(0.84, 0.84)
	spr.offset = Vector2(0.0, -24.0)
	mila.add_child(spr)

	var lbl: Label = Label.new()
	lbl.text = "Mila"
	lbl.position = Vector2(-12.0, -40.0)
	lbl.add_theme_color_override("font_color", Color(0.98, 0.94, 0.86))
	lbl.add_theme_color_override("font_shadow_color", Color(0.024, 0.004, 0.02, 1.0))
	lbl.add_theme_constant_override("shadow_offset_x", 1)
	lbl.add_theme_constant_override("shadow_offset_y", 1)
	mila.add_child(lbl)

	var ia: Interactable = Interactable.new()
	ia.collision_layer = 64
	ia.collision_mask = 0
	ia.prompt_key = "Bicara dengan Mila [E]"
	var cs: CollisionShape2D = CollisionShape2D.new()
	var sh: CircleShape2D = CircleShape2D.new()
	sh.radius = 24.0
	cs.shape = sh
	ia.add_child(cs)
	ia.interacted.connect(_on_mila_interacted)
	mila.add_child(ia)

	parent_node.add_child(mila)
	_mila_node = mila


func _on_mila_interacted(_actor: Node) -> void:
	if _busy or GameStateStore.ref == null:
		return
	var gs: GameStateStore = GameStateStore.ref
	if gs.story_stage != 5:
		return
	_busy = true
	await play_narration([
		"Halo, Kakak %s! Aku Mila!" % gs.player_name,
		"Kakak kelihatan jauh lebih segar pakai baju baru! Tadi aku lihat Kakak kerja keras bawa kayu bakar sendirian.",
		"Ini, aku bawakan roti hangat sisa dari penginapan. Makan ya, Kak! Gubuk Kakak juga sudah aku bantu sapu sedikit tadi.",
		"Kalau sudah malam, istirahat saja di desa. Aku senang akhirnya punya kakak di sini!",
	], "Mila")
	gs.hp = gs.total_max_hp()
	gs.stamina = gs.max_stamina
	gs.flags["ch1a_mila_met"] = true
	gs.story_stage = 6
	if AudioService.ref != null:
		AudioService.ref.play_sfx_id(&"heal")
	if EventsBus.ref != null:
		EventsBus.ref.player_stats_changed.emit()
		EventsBus.ref.notification_requested.emit("Bab 1A selesai! HP & Stamina pulih penuh berkat roti hangat Mila.")
	_busy = false


func play_narration(lines: Array[String], speaker: String = "") -> void:
	if EventsBus.ref == null or lines.is_empty():
		return
	var dlg: DialogueData = DialogueData.new()
	dlg.speaker_key = speaker
	dlg.line_keys = PackedStringArray(lines)
	EventsBus.ref.dialogue_requested.emit(dlg)
	await EventsBus.ref.dialogue_finished


func prompt_player_name() -> String:
	_name_confirmed = false
	_name_input.text = GameStateStore.ref.player_name if GameStateStore.ref != null else "Arka"
	_name_modal.visible = true
	mouse_filter = Control.MOUSE_FILTER_STOP
	get_tree().paused = true
	_name_input.grab_focus()
	_name_input.select_all()

	while not _name_confirmed:
		await get_tree().process_frame

	var result: String = _name_input.text.strip_edges()
	if result.is_empty():
		result = "Arka"
	_name_modal.visible = false
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	get_tree().paused = false
	return result


func _build_name_modal() -> void:
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = Color(0.08, 0.09, 0.13, 0.96)
	sb.set_border_width_all(2)
	sb.border_color = Color(0.95, 0.80, 0.36, 0.95)
	sb.set_corner_radius_all(6)
	sb.set_content_margin_all(10)

	var center: CenterContainer = CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(center)

	_name_modal = PanelContainer.new()
	_name_modal.visible = false
	_name_modal.add_theme_stylebox_override("panel", sb)
	_name_modal.custom_minimum_size = Vector2(220.0, 88.0)
	center.add_child(_name_modal)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	_name_modal.add_child(vbox)

	var title: Label = Label.new()
	title.text = "Siapa namamu?"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.theme_type_variation = &"HeadLabel"
	vbox.add_child(title)

	_name_input = LineEdit.new()
	_name_input.text = "Arka"
	_name_input.max_length = 16
	_name_input.alignment = HORIZONTAL_ALIGNMENT_CENTER
	_name_input.text_submitted.connect(func(_t: String) -> void: _name_confirmed = true)
	vbox.add_child(_name_input)

	var ok_btn: Button = Button.new()
	ok_btn.text = "Konfirmasi"
	ok_btn.pressed.connect(func() -> void: _name_confirmed = true)
	vbox.add_child(ok_btn)
