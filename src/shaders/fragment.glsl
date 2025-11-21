varying vec2 vUv;
varying float vGroup;
varying vec3 vColor;
varying float vScale;
uniform float uTime;
uniform float uSize;

void main() {

    //circluar mask 
    vec2 center = vec2(0.5, 0.5);
    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - 0.5);
    float alpha = 0.05 / distanceToCenter - 0.1;

    float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = step(0.5, strength);
    strength = 1.0 - strength * 2.0;
    strength = pow(strength, uSize);

    // strength = strength * 0.4;

      // PULSE EFFECT FOR FEATURED CINEMAS
    // Detect if this is a featured cinema (large scale)
    bool isFeatured = vScale > 1.4; // Featured cinemas have scale 1.5-3.0

    if(vScale >= 3.0) {
        // Create pulsing effect
        float pulse = sin(uTime * 4.0) * 0.3 + 0.7; // Oscillates between 0.4 and 1.0
        strength *= pulse;

        // Optional: Add color enhancement for featured cinemas
        // You can uncomment this for extra glow effect
        // strength += pulse * 0.2;
    }

    // vec3 color = getGroupColor(vGroup);
    // vec3 color = vec3(1.0, 1.0, 1.0);

// vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(vec3(strength * vColor), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}