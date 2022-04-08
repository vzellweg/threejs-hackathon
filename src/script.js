import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
// Canvas
const canvas = document.querySelector("canvas.webgl");
// Scene
const scene = new THREE.Scene();

/**
 * TextureLoader
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
    "textures/environmentMaps/0/px.jpg",
    "textures/environmentMaps/0/nx.jpg",
    "textures/environmentMaps/0/py.jpg",
    "textures/environmentMaps/0/ny.jpg",
    "textures/environmentMaps/0/pz.jpg",
    "textures/environmentMaps/0/nz.jpg",
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

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), shinyMaterial);
sphere.position.x = -1.5;

const cubes = [];
const cubeFormat = {
    size: 0.75,
    margin: 0.1,
    rate: 0.2,
};
gui.add(cubeFormat, "rate", -2, 2, 0.001);
for (let i = 0; i < 3; i++) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(cubeFormat.size, cubeFormat.size, cubeFormat.size), material);
    cube.position.y += i * (cubeFormat.size + cubeFormat.margin);
    cubes.push(cube);
}
console.log(cubes);

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 32, 64), material);
torus.position.x = 1.5;

const planeMaterial = new THREE.MeshStandardMaterial({ wireframe: true });
const plane = new THREE.Mesh(new THREE.PlaneGeometry(50, 50, 50, 50), planeMaterial);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, ...cubes, torus, plane);

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
camera.position.y = 1.5;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

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

    if (intersects.length > 0) {
        console.log(`intersected: ${intersects[0].object}`);
        // Animate selected object
        gsap.timeline()
            .to(intersects[0].object.position, { duration: 0.3, z: -1 })
            .to(intersects[0].object.position, { duration: 0.5, z: 0, ease: "back" });
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

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    // TODO: make changing spin rate not cause cubes to jump
    cubes.forEach((cube, i) => (cube.rotation.y = cubeFormat.rate * elapsedTime * (i % 2 ? -1 : 1)));
    sphere.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    // TODO: Update lights
    pointLight.position.set(Math.sin(elapsedTime), Math.cos(elapsedTime), pointLight.position.z);
    // change
    // Use sin/cos to point lights in circular direction
    // Clicking different cube causes different lights to animate

    // Update controls
    controls.update();

    raycaster.setFromCamera(pointer, camera);

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
