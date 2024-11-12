uniform float uTime;
uniform float uMorphProgress;
varying vec2 vUv;
varying float vElevation;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); 
  vec3 Pi1 = Pi0 + vec3(1.0); 
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); 
  vec3 Pf1 = Pf0 - vec3(1.0); 
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

float sphereShape(vec3 pos) {
    return length(pos) * 0.3;
}

float torusShape(vec3 pos) {
    vec2 q = vec2(length(pos.xz) - 2.0, pos.y);
    return length(q) * 0.2;
}

float boxShape(vec3 pos) {
    vec3 q = abs(pos) - vec3(1.0);
    return length(max(q, 0.0)) * 0.3;
}

// Helper function for more detailed noise
float detailNoise(vec3 pos, float scale) {
    return cnoise(pos * scale) * (1.0 / scale);
}

// Layered noise for more detail
float fbm(vec3 pos) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 4; i++) {
        value += amplitude * cnoise(pos * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// More detailed organic shape variations
float organicShape1(vec3 pos) {
    // Flower petals
    float angle = atan(pos.z, pos.x);
    float radius = length(pos.xz);
    float petals = sin(angle * 6.0) * 0.5 + 0.5;
    return (petals * smoothstep(0.0, 1.0, radius)) * 0.3;
}

float organicShape2(vec3 pos) {
    // Rippling squares
    vec3 p = pos * 1.2;
    float squares = max(abs(p.x), abs(p.z));
    float ripple = sin(squares * 4.0 - uTime) * 0.5;
    return ripple * 0.25;
}

float organicShape3(vec3 pos) {
    // Star burst
    float angle = atan(pos.z, pos.x);
    float radius = length(pos.xz);
    float star = sin(angle * 5.0 + uTime) * 0.5 + cos(radius * 3.0);
    return star * 0.3;
}

float organicShape4(vec3 pos) {
    // Spiral arms
    float angle = atan(pos.z, pos.x);
    float radius = length(pos.xz);
    float spiral = sin(angle * 3.0 + radius * 5.0 + uTime) * 
                  smoothstep(0.0, 1.0, radius);
    return spiral * 0.3;
}

float organicShape5(vec3 pos) {
    // Concentric rings
    float radius = length(pos.xz);
    float rings = sin(radius * 8.0 - uTime) * 
                 smoothstep(0.0, 1.0, radius);
    return rings * 0.25;
}

float organicShape6(vec3 pos) {
    // Diamond pattern
    vec2 p = pos.xz;
    float pattern = abs(p.x) + abs(p.y);
    float diamonds = sin(pattern * 5.0 - uTime) * 0.5;
    return diamonds * 0.3;
}

float organicShape7(vec3 pos) {
    // Hexagonal grid
    vec2 p = pos.xz;
    float hexagons = 0.0;
    for(int i = 0; i < 3; i++) {
        vec2 grid = p * float(i + 1) * 3.0;
        hexagons += sin(grid.x + sin(grid.y + uTime)) * 
                   sin(grid.y + cos(grid.x + uTime));
    }
    return hexagons * 0.25;
}

float organicShape8(vec3 pos) {
    // Mandala pattern
    float angle = atan(pos.z, pos.x);
    float radius = length(pos.xz);
    float mandala = 0.0;
    for(int i = 0; i < 8; i++) {
        float n = float(i);
        mandala += sin(angle * 8.0 + n * 3.14159 / 4.0) * 
                  sin(radius * 4.0 - uTime + n);
    }
    return mandala * 0.25;
}

float organicShape9(vec3 pos) {
    // Celtic knot
    vec2 p = pos.xz;
    float pattern = sin(p.x * 4.0 + uTime) * sin(p.y * 4.0) +
                   sin(p.x * 3.0 - uTime) * sin(p.y * 3.0);
    return pattern * 0.3;
}

float organicShape10(vec3 pos) {
    // Geometric maze
    vec2 p = pos.xz * 3.0;
    float maze = step(sin(p.x + uTime), cos(p.y)) * 
                step(sin(p.y - uTime), cos(p.x));
    return maze * 0.4;
}

float organicShape11(vec3 pos) {
    // Fractal triangles
    vec2 p = pos.xz;
    float pattern = 0.0;
    for(int i = 1; i <= 4; i++) {
        float scale = float(i) * 2.0;
        pattern += abs(sin(p.x * scale + uTime) + 
                      sin(p.y * scale + uTime));
    }
    return pattern * 0.2;
}

float organicShape12(vec3 pos) {
    // Water drop
    float drop = length(pos) - 1.0;
    float ripple = sin(length(pos) * 8.0 - uTime * 2.0) * 0.1;
    return (drop + ripple) * 0.3;
}

float organicShape13(vec3 pos) {
    // Rose petal
    float petal = length(pos) - 1.0;
    float curl = sin(atan(pos.z, pos.x) * 3.0 + pos.y * 2.0 + uTime);
    return (petal + curl * 0.2) * 0.3;
}

float organicShape14(vec3 pos) {
    // Northern lights
    float lights = 0.0;
    vec3 p = pos;
    for(int i = 1; i <= 3; i++) {
        p.y += sin(p.x * 2.0 + uTime * 0.3) * 0.2;
        lights += smoothstep(0.0, 1.0, fbm(p * float(i)));
    }
    return lights * 0.3;
}

float organicShape15(vec3 pos) {
    // Moonlight reflection
    vec3 p = pos * 1.3;
    float reflection = smoothstep(-1.0, 1.0, sin(p.x + uTime) * sin(p.z - uTime));
    return (reflection * fbm(pos)) * 0.3;
}

void main() {
    vUv = uv;              
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Base noise elevation (original shape)
    float noiseElevation = cnoise(position * 0.9 + uTime * 0.5) * 0.3;
    
    // Calculate different shape influences
    float shapeIndex = mod(floor(uMorphProgress * 15.0), 15.0); // 15 different shapes
    float morphFactor = fract(uMorphProgress * 15.0);
    
    float currentShape = 0.0;
    float nextShape = 0.0;
    
    // Define shape sequence
    if(shapeIndex == 0.0) {
        currentShape = noiseElevation;
        nextShape = organicShape1(position);
    } else if(shapeIndex == 1.0) {
        currentShape = organicShape1(position);
        nextShape = organicShape2(position);
    } else if(shapeIndex == 2.0) {
        currentShape = organicShape2(position);
        nextShape = organicShape3(position);
    } else if(shapeIndex == 3.0) {
        currentShape = organicShape3(position);
        nextShape = organicShape4(position);
    } else if(shapeIndex == 4.0) {
        currentShape = organicShape4(position);
        nextShape = organicShape5(position);
    } else if(shapeIndex == 5.0) {
        currentShape = organicShape5(position);
        nextShape = organicShape6(position);
    } else if(shapeIndex == 6.0) {
        currentShape = organicShape6(position);
        nextShape = organicShape7(position);
    } else if(shapeIndex == 7.0) {
        currentShape = organicShape7(position);
        nextShape = organicShape8(position);
    } else if(shapeIndex == 8.0) {
        currentShape = organicShape8(position);
        nextShape = organicShape9(position);
    } else if(shapeIndex == 9.0) {
        currentShape = organicShape9(position);
        nextShape = organicShape10(position);
    } else if(shapeIndex == 10.0) {
        currentShape = organicShape10(position);
        nextShape = organicShape11(position);
    } else if(shapeIndex == 11.0) {
        currentShape = organicShape11(position);
        nextShape = organicShape12(position);
    } else if(shapeIndex == 12.0) {
        currentShape = organicShape12(position);
        nextShape = organicShape13(position);
    } else if(shapeIndex == 13.0) {
        currentShape = organicShape13(position);
        nextShape = organicShape14(position);
    } else if(shapeIndex == 14.0) {
        currentShape = organicShape14(position);
        nextShape = organicShape15(position);
    } else if(shapeIndex == 15.0) {
        currentShape = organicShape15(position);
        nextShape = noiseElevation;
    }
    
    // Interpolate between shapes
    float elevation = mix(currentShape, nextShape, morphFactor);
    
    // Reduce overall elevation to prevent excessive deformation
    elevation *= 0.8;
    vElevation = elevation;
    
    // Enhance front-facing visibility
    vec3 deformation = normal * elevation;
    deformation.z *= 0.6; // Further reduce depth deformation
    deformation.xy *= 1.2; // Enhance horizontal and vertical movement
    
    modelPosition.xyz += deformation;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
}