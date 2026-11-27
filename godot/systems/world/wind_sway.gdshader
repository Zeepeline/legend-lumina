shader_type canvas_item;

uniform float sway_speed : hint_range(0.2, 5.0) = 1.6;
uniform float sway_pixels : hint_range(0.0, 6.0) = 2.0;
uniform float phase_offset : hint_range(0.0, 6.28) = 0.0;

void vertex() {
	// Sway the upper canopy progressively; trunk stays anchored at VERTEX.y >= -12.0
	float crown = clamp((-VERTEX.y - 12.0) / 65.0, 0.0, 1.0);
	float wave = sin(TIME * sway_speed + phase_offset) * sway_pixels * crown;
	VERTEX.x += wave;
}

