import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Vector3 } from "three";
import { makeNoise4D } from "open-simplex-noise";
import testFragmentShader from "./shaders/shadertoy/silexars - Creation.glsl";
import testVertexShader from "./shaders/shadertoy/vertex.glsl";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
// Canvas
const canvas = document.querySelector("canvas.webgl");
// Scene
const scene = new THREE.Scene();

const debugVars = {
    sphereRadius: 0.6,
    noiseRate: 0.4,
    noiseAmount: 0.4,
    shaderRate: 0.1,
};
gui.add(debugVars, "sphereRadius", 0.2, 1);
gui.add(debugVars, "noiseRate", 0.01, 1);
gui.add(debugVars, "noiseAmount", 0.1, 1);
gui.add(debugVars, "shaderRate", 0.1, 1);
/**
 * TextureLoader
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
    "textures/environmentMaps/2/px.jpg",
    "textures/environmentMaps/2/nx.jpg",
    "textures/environmentMaps/2/py.jpg",
    "textures/environmentMaps/2/ny.jpg",
    "textures/environmentMaps/2/pz.jpg",
    "textures/environmentMaps/2/nz.jpg",
]);
scene.background = environmentMapTexture;
/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight();
ambientLight.color = new THREE.Color(0xffffff);
ambientLight.intensity = 0.5;
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
directionalLight.position.set(1, 0.25, 0);
// scene.add(directionalLight);

// Hemisphere light
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
scene.add(hemisphereLight);

// Point light
const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2);
pointLight.position.set(1, -0.5, 1);
scene.add(pointLight);

// Rect area light
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

// Spot light
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);

spotLight.target.position.x = -0.75;
scene.add(spotLight.target);

// Helpers
// const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
// scene.add(hemisphereLightHelper);

// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
// scene.add(directionalLightHelper);

// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
// scene.add(pointLightHelper);

// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);
// window.requestAnimationFrame(() => {
//     spotLightHelper.update();
// });

// const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
// scene.add(rectAreaLightHelper);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;
const shinyMaterial = new THREE.MeshPhysicalMaterial();
shinyMaterial.envMap = environmentMapTexture;
shinyMaterial.metalness = 1;
shinyMaterial.roughness = 0.12;
gui.add(shinyMaterial, "displacementScale", 0, 1, 0.0001);
gui.add(shinyMaterial, "aoMapIntensity", 0, 10, 0.0001);
// gui.add(material, "normalScale", 0, 1, 0.0001);

gui.add(shinyMaterial, "metalness", 0, 1, 0.01);
gui.add(shinyMaterial, "roughness", 0, 1, 0.01);

// shader material
const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() },
};
let shaderMaterial = new THREE.ShaderMaterial({
    fragmentShader: testFragmentShader,
    vertexShader: testVertexShader,
    side: THREE.DoubleSide,
    uniforms: uniforms,
});
// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), shinyMaterial);
sphere.position.set(1.5, 1.5, 0);

const cubes = [];
const cubeFormat = {
    size: 0.75,
    margin: 0.1,
    rate: 0.2,
};
gui.add(cubeFormat, "rate", -2, 2, 0.001);
for (let i = 0; i < 4; i++) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(cubeFormat.size, cubeFormat.size, cubeFormat.size), material);
    cube.position.y += i * (cubeFormat.size + cubeFormat.margin);
    cubes.push(cube);
}

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 32, 64), material);
torus.position.x = 1.5;

const planeMaterial = new THREE.MeshStandardMaterial({ wireframe: true });
const plane = new THREE.Mesh(new THREE.PlaneGeometry(25, 25, 25, 25), shaderMaterial);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -1;

scene.add(sphere, ...cubes, torus, plane);

/**
 * Models
 */

const gltfLoader = new GLTFLoader();
let modelObject = null;
gltfLoader.load("models/statue_cat/scene.gltf", (gltf) => {
    console.log(gltf);
    // gltf.scene.scale.set(0.05, 0.05, 0.05);
    gltf.scene.position.set(-1.5, 0.75, 0);

    // Apply Material to every Mesh imported from model
    gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material = shinyMaterial;
        }
    });
    modelObject = gltf.scene;
    scene.add(gltf.scene);
});

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 1;
camera.position.y = 2;
camera.position.z = 4;
// camera.lookAt();
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// Initially, point camera slightly above origin
controls.target = new THREE.Vector3(0, 1, 0);

/**
 * Raycaster
 */
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

const onPointerClick = (event) => {
    // Check object intersection
    // (Taken from: https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_cubes.html#L64)
    const intersects = raycaster.intersectObjects(scene.children, false);
    const cubePositions = cubes.map((cube) => cube.position);

    if (intersects.length > 0) {
        console.log(`intersected: ${intersects[0].object}`);
        // Animate selected object

        gsap.timeline()
            .to(intersects[0].object.position, { duration: 0.3, z: -1 })
            .to(intersects[0].object.position, { duration: 0.5, z: 0, ease: "back" });
        // if selected is a torus
        if (intersects[0].object.geometry.type.includes("Torus")) {
            gsap.timeline()
                .to(cubePositions, { duration: 0.3, z: -1, stagger: 0.2 })
                .to(cubePositions, { duration: 0.5, z: 0, ease: "back", stagger: 0.2 });
        }
    }
};

document.addEventListener("mousemove", onPointerMove);
document.addEventListener("mousedown", onPointerClick);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Init uniforms
uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
uniforms.iTime.value = 0;

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const noise = makeNoise4D(Date.now());

const applyNoise = (geometry, elapsedTime) => {
    const positionAttribute = geometry.getAttribute("position");
    const vertex = new THREE.Vector3();
    for (var i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        vertex
            .normalize()
            .multiplyScalar(debugVars.sphereRadius)
            .addScaledVector(
                vertex,
                debugVars.noiseAmount * noise(vertex.x, vertex.y, vertex.z, elapsedTime * debugVars.noiseRate)
            );
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    // geometry.computeVertexNormals();
    positionAttribute.needsUpdate = true;
};

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    // Update uniform tiem for shader
    uniforms.iTime.value = 1 + elapsedTime * debugVars.shaderRate;
    // Update objects
    cubes.forEach((cube, i) => (cube.rotation.y += cubeFormat.rate * deltaTime * (i % 2 ? -1 : 1)));
    sphere.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    if (modelObject) {
        modelObject.rotation.y = 0.15 * elapsedTime;
    }
    torus.rotation.x = 0.15 * elapsedTime;

    pointLight.position.set(Math.sin(elapsedTime), Math.cos(elapsedTime), pointLight.position.z);
    // change
    // Use sin/cos to point lights in circular direction
    // Clicking different cube causes different lights to animate

    // Apply noise to icosahedron vertices
    // Position Buffer Attribute https://stackoverflow.com/a/68131171
    // applyNoise(deformedSphereGeometry, elapsedTime);
    applyNoise(sphere.geometry, elapsedTime);

    // Update controls
    controls.update();

    raycaster.setFromCamera(pointer, camera);

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
