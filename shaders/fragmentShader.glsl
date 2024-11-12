varying vec2 vUv;
varying float vElevation;
uniform float uColorChange;
uniform float uOpacity;
uniform float uMorphProgress;

vec4 getShapeColors(float index, float elevation) {
    if(index == 0.0) {
        return mix(
            vec4(0.85, 0.55, 0.60, 1.0),     // Vibrant coral
            vec4(0.88,0.62, 0.65, 1.0 ),      // Light coral
            elevation
        );
    } 
    else if(index == 1.0) {
        return mix(
            vec4(0.3, 0.7, 0.9, 1.0),      // Sky blue
            vec4(0.4, 0.8, 1.0, 1.0),      // Light blue
            elevation
        );
    }
    else if(index == 2.0) {
        return mix(
            vec4(0.8, 0.3, 0.9, 1.0),      // Rich purple
            vec4(0.9, 0.5, 1.0, 1.0),      // Light purple
            elevation
        );
    }
    else if(index == 3.0) {
        return mix(
            vec4(0.9, 0.7, 0.2, 1.0),      // Golden yellow
            vec4(1.0, 0.8, 0.3, 1.0),      // Light gold
            elevation
        );
    }
    else if(index == 4.0) {
        return mix(
            vec4(0.2, 0.8, 0.5, 1.0),      // Emerald green
            vec4(0.3, 0.9, 0.6, 1.0),      // Light emerald
            elevation
        );
    }
    else if(index == 5.0) {
        return mix(
            vec4(0.7, 0.2, 0.3, 1.0),     // Deep red
            vec4(0.9, 0.3, 0.4, 1.0),     // Light red
            elevation
        );
    }
    else if(index == 6.0) {
        return mix(
            vec4(0.2, 0.2, 0.6, 1.0),     // Deep indigo
            vec4(0.4, 0.4, 0.8, 1.0),     // Light indigo
            elevation
        );
    }
    else if(index == 7.0) {
        return mix(
            vec4(0.6, 0.4, 0.1, 1.0),     // Deep gold
            vec4(0.8, 0.6, 0.2, 1.0),     // Light gold
            elevation
        );
    }
    else if(index == 8.0) {
        return mix(
            vec4(0.3, 0.6, 0.7, 1.0),     // Deep cyan
            vec4(0.5, 0.8, 0.9, 1.0),     // Light cyan
            elevation
        );
    }
    else if(index == 9.0) {
        return mix(
            vec4(0.5, 0.2, 0.5, 1.0),     // Deep magenta
            vec4(0.7, 0.3, 0.7, 1.0),     // Light magenta
            elevation
        );
    }
    else if(index == 10.0) {
        return mix(
            vec4(0.2, 0.4, 0.3, 1.0),     // Deep sage
            vec4(0.4, 0.6, 0.5, 1.0),     // Light sage
            elevation
        );
    }
    else if(index == 11.0) {
        return mix(
            vec4(0.7, 0.4, 0.5, 1.0),     // Deep rose
            vec4(0.9, 0.6, 0.7, 1.0),     // Light rose
            elevation
        );
    }
    else if(index == 12.0) {
        return mix(
            vec4(0.3, 0.3, 0.7, 1.0),     // Deep lavender
            vec4(0.5, 0.5, 0.9, 1.0),     // Light lavender
            elevation
        );
    }
    else {
        return mix(
            vec4(0.4, 0.7, 0.6, 1.0),     // Deep aqua
            vec4(0.6, 0.9, 0.8, 1.0),     // Light aqua
            elevation
        );
    }
}

void main() {
    float shapeIndex = floor(mod(uMorphProgress, 15.0));
    float nextIndex = floor(mod(shapeIndex + 1.0, 15.0));
    float morphFactor = fract(uMorphProgress);
    
    // Get colors for current and next shape
    vec4 currentColor = getShapeColors(shapeIndex, vElevation);
    vec4 nextColor = getShapeColors(nextIndex, vElevation);
    
    // Smoothly interpolate between colors
    vec4 baseColor = mix(currentColor, nextColor, morphFactor);
    
    // Add subtle foam highlight
    float foamIntensity = smoothstep(0.05, 0.15, vElevation);
    vec4 foam = vec4(1.0, 1.0, 1.0, 0.5); // Reduced foam intensity
    
    vec4 finalColor = mix(baseColor, foam, foamIntensity * 0.3); // Reduced foam mix
    finalColor.a *= uOpacity;
    
    gl_FragColor = finalColor;
}