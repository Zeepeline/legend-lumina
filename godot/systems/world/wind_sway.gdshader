shader_type canvas_item;

uniform float sway_speed : hint_range(0.2, 5.0) = 1.6;
uniform float sway_pixels : hint_range(0.0, 6.0) = 1.6;
uniform float phase_offset : hint_range(0.0, 6.28) = 0.0;
uniform int biome_tint = 0;

void vertex() {
	float crown = clamp((-VERTEX.y - 7.0) / 22.0, 0.0, 1.0);
	float wave = sin(TIME * sway_speed + phase_offset) * sway_pixels * 0.42 * crown;
	VERTEX.x += wave;
}

void fragment() {
	vec4 c = COLOR;
	if (c.a > 0.5) {
		bool is_leaf = (c.g > c.r + 0.015) && (c.g >= c.b);
		bool is_fruit = (c.r > c.g + 0.12) && (c.r > c.b + 0.08);
		if (biome_tint == 1 && is_leaf) {
			c.rgb = vec3(c.r * 0.72, c.g * 0.80, c.b * 0.86);
		} else if (biome_tint == 2 && is_leaf) {
			float lum = clamp(((c.r + c.g + c.b) / 3.0 - 0.36) / 0.32, 0.0, 1.0);
			c.rgb = mix(vec3(0.50, 0.59, 0.70), vec3(0.97, 0.99, 1.0), lum);
		} else if (biome_tint == 3 && is_leaf) {
			c.rgb = vec3(c.r * 0.78, c.g * 0.78, c.b * 0.58);
		} else if (biome_tint == 4 && is_fruit) {
			c.rgb = vec3(clamp(c.r * 1.15, 0.85, 1.0), clamp(c.g * 1.65 + 0.20, 0.45, 0.78), c.b * 0.35);
		}
	}
	COLOR = c;
}
