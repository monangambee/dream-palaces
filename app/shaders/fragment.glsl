varying vec2 vUv;
varying float vGroup;
varying vec3 vColor;
varying float vScale;
uniform float uTime;
uniform float uSize;
uniform sampler2D uTexture;
uniform sampler2D uGoldenTexture;

void main() {

    // Check if this is a featured cinema (based on scale)
    // Featured cinemas have scales from 5.0 to 8.8 (Math.max(5.0, baseScale + 1.0))
    // Non-featured cinemas have scales from 0.7 to 7.8 (baseScale)
    // Using threshold of 4.5 to distinguish between them
    bool isFeatured = vScale > 5.0;
    
    // Select texture based on featured status
    vec4 particleTexture;
    if (isFeatured) {
        particleTexture = texture2D(uGoldenTexture, gl_PointCoord);
    } else {
        particleTexture = texture2D(uTexture, gl_PointCoord);
    }
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

    // if(vScale >= 1.0) {
    //     // Create pulsing effect
    //     float pulse = sin(uTime * 4.0) * 0.3 + 0.7; // Oscillates between 0.4 and 1.0
    //     strength *= pulse;

    //     // Optional: Add color enhancement for featured cinemas
    //     // You can uncomment this for extra glow effect
    //     // strength += pulse * 0.2;
    // }

    // Apply color tint to the particle texture
    // Featured cinemas will be yellow (vColor = [1.0, 0.84, 0.0])
    // Regular cinemas will be white (vColor = [1.0, 1.0, 1.0])
    vec3 tintedColor = particleTexture.rgb;
    gl_FragColor = vec4(particleTexture);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}