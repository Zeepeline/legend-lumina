shader_type canvas_item;

uniform float sway_speed : hint_range(0.2, 5.0) = 1.6;
uniform float sway_pixels : hint_range(0.0, 6.0) = 1.8;
uniform float phase_offset : hint_range(0.0, 6.28) = 0.0;

void vertex() {
	float crown = clamp(1.0 - (UV.y - 0.15) / 0.58, 0.0, 1.0);
	float wave = sin(TIME * sway_speed + phase_offset) * sway_pixels * crown;
	VERTEX.x += wave;
}
