uniform float uTime;
attribute float group;
varying float vGroup;
varying float vOpacity;


void main() {
    vGroup = group;
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    // Create pulsing opacity based on time
    vOpacity = 0.4 + 0.3 * sin(uTime * 0.1);
}