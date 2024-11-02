varying vec2 vUv;
varying float vElevation;
uniform float uColorChange;
uniform float uOpacity;

void main() {
    // Base colors (darker pink with subtle foam)
    vec4 c1 = vec4(0.85, 0.55, 0.60, 1.0);  // Much darker pink
    vec4 c2 = vec4(0.88, 0.62, 0.65, 1.0);  // Darker pink
    vec4 c3 = vec4(0.75, 0.42, 0.48, 1.0);  // Even darker pink (no white tint)
    vec4 c4 = vec4(0.78, 0.45, 0.50, 1.0);  // Dark pink (no white tint)

    // Add foam highlight for elevated areas (moderate intensity)
    float foamIntensity = smoothstep(0.05, 0.15, vElevation);
    vec4 foam = vec4(1.0, 1.0, 1.0, 1.0);
    
    float v = smoothstep(-.14, .14, vElevation);
    vec4 colorred = mix(c1, c2, v);
    vec4 colorlight = mix(c3, c4, v);
    vec4 baseColor = mix(colorred, colorlight, uColorChange);
    
    // Mix in the foam with slightly increased intensity
    vec4 finalColor = mix(baseColor, foam, foamIntensity * 0.5);  // Increased from 0.4 to 0.5
    finalColor.a *= uOpacity;
    gl_FragColor = finalColor;
}