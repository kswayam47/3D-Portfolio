varying vec2 vUv;
varying float vElevation;
uniform float uColorChange;
uniform float uOpacity;
uniform float uMorphProgress;

vec4 getShapeColors(float index, float elevation) {
    if(index == 0.0) {
        return mix(
            vec4(0.85, 0.55, 0.60, 1.0),     
            vec4(0.88,0.62, 0.65, 1.0 ),      
            elevation
        );
    } 
    else if(index == 1.0) {
        return mix(
            vec4(0.3, 0.7, 0.9, 1.0),      
            vec4(0.4, 0.8, 1.0, 1.0),      
            elevation
        );
    }
    else if(index == 2.0) {
        return mix(
            vec4(0.8, 0.3, 0.9, 1.0),      
            vec4(0.9, 0.5, 1.0, 1.0),      
            elevation
        );
    }
    else if(index == 3.0) {
        return mix(
            vec4(0.9, 0.7, 0.2, 1.0),      
            vec4(1.0, 0.8, 0.3, 1.0),      
            elevation
        );
    }
    else if(index == 4.0) {
        return mix(
            vec4(0.2, 0.8, 0.5, 1.0),      
            vec4(0.3, 0.9, 0.6, 1.0),    
            elevation
        );
    }
    else if(index == 5.0) {
        return mix(
            vec4(0.7, 0.2, 0.3, 1.0),     
            vec4(0.9, 0.3, 0.4, 1.0),     
            elevation
        );
    }
    else if(index == 6.0) {
        return mix(
            vec4(0.2, 0.2, 0.6, 1.0),     
            vec4(0.4, 0.4, 0.8, 1.0),     
            elevation
        );
    }
    else if(index == 7.0) {
        return mix(
            vec4(0.6, 0.4, 0.1, 1.0),    
            vec4(0.8, 0.6, 0.2, 1.0),    
            elevation
        );
    }
    else if(index == 8.0) {
        return mix(
            vec4(0.3, 0.6, 0.7, 1.0),     
            vec4(0.5, 0.8, 0.9, 1.0),     
            elevation
        );
    }
    else if(index == 9.0) {
        return mix(
            vec4(0.5, 0.2, 0.5, 1.0),     
            vec4(0.7, 0.3, 0.7, 1.0),     
            elevation
        );
    }
    else if(index == 10.0) {
        return mix(
            vec4(0.2, 0.4, 0.3, 1.0),     
            vec4(0.4, 0.6, 0.5, 1.0),    
            elevation
        );
    }
    else if(index == 11.0) {
        return mix(
            vec4(0.7, 0.4, 0.5, 1.0),    
            vec4(0.9, 0.6, 0.7, 1.0),     
            elevation
        );
    }
    else if(index == 12.0) {
        return mix(
            vec4(0.3, 0.3, 0.7, 1.0),     
            vec4(0.5, 0.5, 0.9, 1.0),     
            elevation
        );
    }
    else {
        return mix(
            vec4(0.4, 0.7, 0.6, 1.0),   
            vec4(0.6, 0.9, 0.8, 1.0),     
            elevation
        );
    }
}

void main() {
    float shapeIndex = floor(mod(uMorphProgress, 15.0));
    float nextIndex = floor(mod(shapeIndex + 1.0, 15.0));
    float morphFactor = fract(uMorphProgress);

    vec4 currentColor = getShapeColors(shapeIndex, vElevation);
    vec4 nextColor = getShapeColors(nextIndex, vElevation);
    

    vec4 baseColor = mix(currentColor, nextColor, morphFactor);
    
   
    float foamIntensity = smoothstep(0.05, 0.15, vElevation);
    vec4 foam = vec4(1.0, 1.0, 1.0, 0.5); 
    
    vec4 finalColor = mix(baseColor, foam, foamIntensity * 0.3); 
    finalColor.a *= uOpacity;
    
    gl_FragColor = finalColor;
}