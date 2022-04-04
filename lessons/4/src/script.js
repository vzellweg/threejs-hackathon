import "./style.css";
import * as THREE from "three";

const sizes = {
    width: 800,
    height: 600,
};
const scene = new THREE.Scene();

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "purple" });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height); // 45 more natural
camera.position.z = 3;
camera.position.x = 1;
// camera.position.y = 1;
scene.add(camera);

// Renderer
const canvas = document.querySelector(".webgl");
console.log(canvas);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
