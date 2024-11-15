uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

void main() {
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
