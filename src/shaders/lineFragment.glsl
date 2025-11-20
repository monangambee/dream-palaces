varying float vGroup;
varying float vOpacity;
varying vec3 vColor;

vec3 getGroupColor(float group) {
    // 12 distinct colors for each group
    if (group < 1.0) return vec3(1.0, 0.0, 0.0); // Red
    if (group < 2.0) return vec3(0.0, 1.0, 0.0); // Green
    if (group < 3.0) return vec3(0.0, 0.0, 1.0); // Blue
    if (group < 4.0) return vec3(1.0, 1.0, 0.0); // Yellow
    if (group < 5.0) return vec3(1.0, 0.0, 1.0); // Magenta
    if (group < 6.0) return vec3(0.0, 1.0, 1.0); // Cyan
    if (group < 7.0) return vec3(1.0, 0.5, 0.0); // Orange
    if (group < 8.0) return vec3(0.5, 0.0, 1.0); // Purple
    if (group < 9.0) return vec3(0.0, 0.5, 0.0); // Dark Green
    if (group < 10.0) return vec3(1.0, 0.0, 0.5); // Pink
    if (group < 11.0) return vec3(0.5, 1.0, 0.0); // Lime
    return vec3(1.0, 1.0, 1.0); // White
}

void main() {
    vec3 color = getGroupColor(vGroup);

    // color = color * vColor;

    gl_FragColor = vec4(0.3, 0.25, 0.46, 0.2);
    // gl_FragColor = vec4(vColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment> // Make lines fully opaque and visible
}