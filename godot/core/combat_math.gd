class_name CombatMath
extends RefCounted

const COMBO_MULT: Array[float] = [1.0, 1.25, 1.85]
const COMBO_KB: Array[float] = [1.0, 1.3, 2.1]
const STAMINA_ROLL: float = 14.0
const STAMINA_SPIN: float = 20.0
const MP_FIREBALL: int = 8
const STAMINA_REGEN_DELAY: float = 0.35
const STAMINA_REGEN_PER_SEC: float = 28.0
const FLASK_HEAL_RATIO: float = 0.45
const RELAXED_STAMINA_MULT: float = 0.5
const RELAXED_DAMAGE_MULT: float = 0.65


static func combo_multiplier(combo_step: int) -> float:
	var idx: int = clampi(combo_step - 1, 0, COMBO_MULT.size() - 1)
	return COMBO_MULT[idx]


static func combo_knockback_multiplier(combo_step: int) -> float:
	var idx: int = clampi(combo_step - 1, 0, COMBO_KB.size() - 1)
	return COMBO_KB[idx]


static func compute_damage(
	atk: int,
	target_def: int,
	combo_step: int,
	weapon_mult: float,
	crit_chance: float,
	rng: RandomNumberGenerator
) -> Dictionary:
	var c_mult: float = combo_multiplier(combo_step)
	var raw: float = float(atk) * weapon_mult * c_mult - float(target_def) * 0.5
	var variance: float = 1.0 + rng.randf_range(-0.08, 0.08)
	var is_crit: bool = rng.randf() < clampf(crit_chance, 0.0, 1.0)
	var crit_mult: float = 1.5 if is_crit else 1.0
	var amount: int = maxi(1, roundi(raw * variance * crit_mult))
	return {
		"amount": amount,
		"is_crit": is_crit,
	}


static func compute_charge_damage(
	atk: int,
	target_def: int,
	weapon_mult: float,
	rng: RandomNumberGenerator
) -> Dictionary:
	var raw: float = float(atk) * weapon_mult * 2.1 - float(target_def) * 0.45
	var variance: float = 1.0 + rng.randf_range(-0.06, 0.06)
	var is_crit: bool = rng.randf() < 0.22
	var crit_mult: float = 1.5 if is_crit else 1.0
	return {
		"amount": maxi(1, roundi(raw * variance * crit_mult)),
		"is_crit": is_crit,
	}


static func compute_magic_damage(
	mag: int,
	target_def: int,
	power: float,
	rng: RandomNumberGenerator
) -> int:
	var raw: float = float(mag) * power - float(target_def) * 0.35
	var variance: float = 1.0 + rng.randf_range(-0.06, 0.06)
	return maxi(2, roundi(raw * variance))


static func compute_enemy_damage(
	enemy_atk: int,
	player_def: int,
	relaxed_mode: bool,
	rng: RandomNumberGenerator
) -> int:
	var raw: float = float(enemy_atk) - float(player_def) * 0.5
	var variance: float = 1.0 + rng.randf_range(-0.06, 0.06)
	var diff_mult: float = RELAXED_DAMAGE_MULT if relaxed_mode else 1.0
	return maxi(1, roundi(raw * variance * diff_mult))


static func stamina_cost(base_cost: float, relaxed_mode: bool) -> float:
	var mult: float = RELAXED_STAMINA_MULT if relaxed_mode else 1.0
	return maxf(1.0, float(roundi(base_cost * mult)))


static func compute_flask_heal(max_hp: int) -> int:
	return maxi(1, roundi(float(max_hp) * FLASK_HEAL_RATIO))


static func exp_to_next_level(level: int) -> int:
	var lv: int = maxi(1, level)
	return 20 + (lv - 1) * 15 + (lv - 1) * (lv - 1) * 4


static func apply_exp(level: int, current_exp: int, gained_exp: int) -> Dictionary:
	var lv: int = maxi(1, level)
	var xp: int = maxi(0, current_exp) + maxi(0, gained_exp)
	var levels_gained: int = 0
	var needed: int = exp_to_next_level(lv)
	while xp >= needed:
		xp -= needed
		lv += 1
		levels_gained += 1
		needed = exp_to_next_level(lv)
	return {
		"level": lv,
		"exp": xp,
		"levels_gained": levels_gained,
	}
