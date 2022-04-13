
varying vec2 vUv;

// Simple vertex shader for using shadertoy shaders as materials
// https://discourse.world/h/2019/01/17/Advanced-Three.js:shader-materials-and-post-processing
void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}