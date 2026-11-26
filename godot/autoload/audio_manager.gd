class_name AudioService
extends Node

static var ref: AudioService = null

const SFX_POOL_SIZE: int = 14
const DEFAULT_FADE: float = 0.8
const SAMPLE_RATE: int = 22050

const BGM_VILLAGE: AudioStreamMP3 = preload("res://assets/audio/music/bgm_village.mp3")
const BGM_EXPLORATION: AudioStreamMP3 = preload("res://assets/audio/music/bgm_exploration.mp3")
const BGM_BATTLE: AudioStreamMP3 = preload("res://assets/audio/music/bgm_battle.mp3")
const BGM_BOSS: AudioStreamMP3 = preload("res://assets/audio/music/bgm_boss.mp3")

const SFX_SWING_LIGHT: AudioStream = preload("res://assets/audio/sfx/swing_light.wav")
const SFX_SLASH_SLICE: AudioStream = preload("res://assets/audio/sfx/slash_slice.ogg")
const SFX_SWING_HEAVY: AudioStream = preload("res://assets/audio/sfx/swing_heavy.wav")
const SFX_SLASH_CHOP: AudioStream = preload("res://assets/audio/sfx/slash_chop.ogg")
const SFX_HIT_PUNCH_MED: AudioStream = preload("res://assets/audio/sfx/hit_punch_med.ogg")
const SFX_HIT_DEEP: AudioStream = preload("res://assets/audio/sfx/hit_deep.wav")
const SFX_HIT_HEAVY: AudioStream = preload("res://assets/audio/sfx/hit_heavy.wav")
const SFX_HIT_METAL: AudioStream = preload("res://assets/audio/sfx/hit_metal.ogg")
const SFX_HIT_PUNCH_HEAVY: AudioStream = preload("res://assets/audio/sfx/hit_punch_heavy.ogg")

var _music_a: AudioStreamPlayer = AudioStreamPlayer.new()
var _music_b: AudioStreamPlayer = AudioStreamPlayer.new()
var _active: AudioStreamPlayer = null
var _music_tween: Tween = null
var _music_stack: Array[Dictionary] = []
var _sfx_pool: Array[AudioStreamPlayer] = []
var _sfx_next: int = 0
var _sfx_bank: Dictionary = {}
var _current_region_bgm: AudioStream = BGM_VILLAGE
var _boss_bgm_active: bool = false


func _enter_tree() -> void:
	ref = self


func _exit_tree() -> void:
	_kill_tween()
	_music_stack.clear()
	_current_region_bgm = null
	for p: AudioStreamPlayer in [_music_a, _music_b]:
		if p != null:
			p.stop()
			p.stream = null
	for p: AudioStreamPlayer in _sfx_pool:
		if p != null:
			p.stop()
			p.stream = null
	_sfx_bank.clear()


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for p: AudioStreamPlayer in [_music_a, _music_b]:
		p.bus = &"Music"
		p.volume_db = -80.0
		add_child(p)
	_active = _music_a
	for _i: int in SFX_POOL_SIZE:
		var p: AudioStreamPlayer = AudioStreamPlayer.new()
		p.bus = &"SFX"
		add_child(p)
		_sfx_pool.append(p)
	_build_synth_bank()
	if GameStateStore.ref != null:
		set_bus_volume(&"Music", GameStateStore.ref.music_volume)
		set_bus_volume(&"SFX", GameStateStore.ref.sfx_volume)
	if EventsBus.ref != null:
		EventsBus.ref.map_changed.connect(_on_map_changed)
		EventsBus.ref.boss_hp_changed.connect(_on_boss_hp_changed)


func _build_synth_bank() -> void:
	_sfx_bank[&"swing"] = _make_randomizer_multi([SFX_SWING_LIGHT, SFX_SLASH_SLICE], 1.07)
	_sfx_bank[&"swing_heavy"] = _make_randomizer_multi([SFX_SWING_HEAVY, SFX_SLASH_CHOP], 1.05)
	_sfx_bank[&"hit"] = _make_randomizer_multi([SFX_HIT_PUNCH_MED, SFX_HIT_DEEP], 1.06)
	_sfx_bank[&"crit"] = _make_randomizer_multi([SFX_HIT_HEAVY, SFX_HIT_METAL, SFX_HIT_PUNCH_HEAVY], 1.04)
	_sfx_bank[&"roll"] = _make_randomizer(_synth_tone(240.0, 120.0, 0.12, 0.28, true), 1.08)
	_sfx_bank[&"heal"] = _make_randomizer(_synth_tone(440.0, 760.0, 0.24, 0.35, false), 1.03)
	_sfx_bank[&"ui_click"] = _make_randomizer(_synth_tone(640.0, 780.0, 0.05, 0.25, false), 1.04)
	_sfx_bank[&"talk"] = _make_randomizer(_synth_tone(320.0, 380.0, 0.04, 0.18, false), 1.10)
	_sfx_bank[&"level_up"] = _make_randomizer(_synth_tone(523.0, 988.0, 0.35, 0.40, false), 1.0)
	_sfx_bank[&"fireball"] = _make_randomizer(_synth_tone(620.0, 210.0, 0.18, 0.38, true), 1.06)
	_sfx_bank[&"spin"] = _make_randomizer_multi([SFX_SWING_HEAVY, SFX_SLASH_CHOP], 1.06)
	_sfx_bank[&"chest"] = _make_randomizer(_synth_tone(587.0, 880.0, 0.22, 0.36, false), 1.02)
	_sfx_bank[&"coin"] = _make_randomizer(_synth_tone(920.0, 1320.0, 0.10, 0.28, false), 1.03)
	_sfx_bank[&"boss_roar"] = _make_randomizer(_synth_tone(140.0, 62.0, 0.38, 0.50, true), 1.03)


func _make_randomizer(stream: AudioStream, pitch_spread: float) -> AudioStreamRandomizer:
	var rnd: AudioStreamRandomizer = AudioStreamRandomizer.new()
	rnd.add_stream(0, stream)
	rnd.random_pitch = pitch_spread
	rnd.random_volume_offset_db = 1.5
	return rnd


func _make_randomizer_multi(streams: Array[AudioStream], pitch_spread: float) -> AudioStreamRandomizer:
	var rnd: AudioStreamRandomizer = AudioStreamRandomizer.new()
	for i: int in streams.size():
		rnd.add_stream(i, streams[i])
	rnd.random_pitch = pitch_spread
	rnd.random_volume_offset_db = 1.2
	return rnd


func region_bgm_for_map(map_path: String) -> AudioStream:
	var base: String = map_path.get_file().get_basename()
	if base == "arena":
		return BGM_BATTLE
	if base in ["village", "home", "inn", "elderhome", "linahome", "kgate", "kpasar", "kpermukiman", "kakademi", "kbawah", "kinn", "arsip"]:
		return BGM_VILLAGE
	return BGM_EXPLORATION


func _on_map_changed(map_path: String, _spawn_id: StringName) -> void:
	_boss_bgm_active = false
	_current_region_bgm = region_bgm_for_map(map_path)
	play_music(_current_region_bgm, DEFAULT_FADE)


func _on_boss_hp_changed(_boss_name: String, cur_hp: int, _cap_hp: int, active: bool) -> void:
	var want_boss: bool = active and cur_hp > 0
	if want_boss == _boss_bgm_active:
		return
	_boss_bgm_active = want_boss
	if _boss_bgm_active:
		play_music(BGM_BOSS, 0.45)
	else:
		play_music(_current_region_bgm, 0.8)


func _synth_tone(
	freq_start: float,
	freq_end: float,
	duration_sec: float,
	amp: float,
	add_noise: bool
) -> AudioStreamWAV:
	var count: int = maxi(1, int(SAMPLE_RATE * duration_sec))
	var bytes: PackedByteArray = PackedByteArray()
	bytes.resize(count * 2)
	var phase: float = 0.0
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = int(freq_start * 13.0 + freq_end)
	for i: int in count:
		var t: float = float(i) / float(count)
		var freq: float = lerpf(freq_start, freq_end, t)
		phase += TAU * freq / float(SAMPLE_RATE)
		var env: float = (1.0 - t) * (1.0 - t)
		var sample_val: float = sin(phase) * 0.7
		if add_noise:
			sample_val += rng.randf_range(-0.45, 0.45)
		var pcm: int = clampi(int(sample_val * env * amp * 32767.0), -32767, 32767)
		bytes[i * 2] = pcm & 0xFF
		bytes[i * 2 + 1] = (pcm >> 8) & 0xFF
	var wav: AudioStreamWAV = AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = SAMPLE_RATE
	wav.stereo = false
	wav.data = bytes
	return wav


func play_music(stream: AudioStream, fade: float = DEFAULT_FADE, from_position: float = 0.0) -> void:
	if stream == null:
		stop_music(fade)
		return
	if _active.playing and _active.stream == stream:
		return
	var incoming: AudioStreamPlayer = _music_b if _active == _music_a else _music_a
	var outgoing: AudioStreamPlayer = _active
	incoming.stream = stream
	incoming.volume_db = -80.0
	if AudioServer.get_driver_name() != "Dummy":
		incoming.play(from_position)
	_active = incoming
	_crossfade(outgoing, incoming, fade)


func stop_music(fade: float = DEFAULT_FADE) -> void:
	_kill_tween()
	_music_tween = create_tween()
	_music_tween.tween_property(_active, "volume_db", -80.0, fade)
	_music_tween.tween_callback(_active.stop)


func push_music(stream: AudioStream, fade: float = 0.3) -> void:
	_music_stack.push_back({
		"stream": _active.stream,
		"position": _active.get_playback_position() if _active.playing else 0.0,
	})
	play_music(stream, fade)


func pop_music(fade: float = DEFAULT_FADE) -> void:
	if _music_stack.is_empty():
		return
	var prev: Dictionary = _music_stack.pop_back()
	var prev_stream: AudioStream = prev.get("stream", null)
	var prev_pos: float = float(prev.get("position", 0.0))
	play_music(prev_stream, fade, prev_pos)


func _crossfade(outgoing: AudioStreamPlayer, incoming: AudioStreamPlayer, fade: float) -> void:
	_kill_tween()
	_music_tween = create_tween().set_parallel(true)
	_music_tween.tween_property(incoming, "volume_db", 0.0, fade)
	if outgoing.playing:
		_music_tween.tween_property(outgoing, "volume_db", -80.0, fade)
	_music_tween.chain().tween_callback(outgoing.stop)


func _kill_tween() -> void:
	if _music_tween != null and _music_tween.is_valid():
		_music_tween.kill()


func play_sfx(stream: AudioStream, bus: StringName = &"SFX", volume_db: float = 0.0) -> void:
	if stream == null or _sfx_pool.is_empty():
		return
	var p: AudioStreamPlayer = _sfx_pool[_sfx_next]
	_sfx_next = (_sfx_next + 1) % _sfx_pool.size()
	p.stop()
	p.stream = stream
	p.bus = bus
	p.volume_db = volume_db
	if AudioServer.get_driver_name() != "Dummy":
		p.play()


func play_sfx_id(sfx_id: StringName, bus: StringName = &"SFX", volume_db: float = -6.0) -> void:
	if _sfx_bank.has(sfx_id):
		var stream: AudioStream = _sfx_bank[sfx_id]
		play_sfx(stream, bus, volume_db)


func play_ui(stream: AudioStream) -> void:
	play_sfx(stream, &"UI")


func play_ui_id(sfx_id: StringName) -> void:
	play_sfx_id(sfx_id, &"UI", -8.0)


func set_bus_volume(bus_name: StringName, linear: float) -> void:
	var idx: int = AudioServer.get_bus_index(bus_name)
	if idx == -1:
		push_warning("AudioService: bus '%s' not found" % bus_name)
		return
	var clamped: float = clampf(linear, 0.0, 1.0)
	AudioServer.set_bus_mute(idx, clamped <= 0.0)
	AudioServer.set_bus_volume_db(idx, linear_to_db(maxf(clamped, 0.0001)))
