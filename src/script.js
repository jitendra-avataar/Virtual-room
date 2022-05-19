import "./style.css";
import * as THREE from "three";
import CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import "@splidejs/splide/css";
import Splide from "@splidejs/splide";
import CannonDebugger from "cannon-es-debugger";

import * as dat from "lil-gui";
let properties = {
  addObject: showMiniScene,
};
/**
 * Debug
 */
const gui = new dat.GUI();
gui.add(properties, "addObject");
let objectToUpdate = [];
let houseBox = null;
let room = null;
let data = { nodes: {}, materials: {} };
let isDragging = false;
// Initiating physics world
const world = new CANNON.World();
world.gravity.set(0, -9.8, 0);

const groundMaterial = new CANNON.Material("ground");
const ground_ground = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
  friction: 1,
  restitution: 0,
});
world.addContactMaterial(ground_ground);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/gltf/");
dracoLoader.preload();
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
let roomBody = null;
let isColliding = false;

gltfLoader.load(
  "room.glb",
  function (gltf) {
    room = gltf.scene;
    houseBox = new THREE.Box3().setFromObject(gltf.scene);
    var boundingBoxHelperObject = new THREE.BoxHelper(gltf.scene);
    // const dimension = houseBox.getSize(new THREE.Vector3());
    // const boxShape = new CANNON.Box(new CANNON.Vec3(dimension.x * 0.5, dimension.y * 0.5, dimension.z * 0.5));
    // roomBody = new CANNON.Body({ mass: 2, shape: boxShape, position: new CANNON.Vec3(0, 3, 0), isTrigger: true });
    // world.add(roomBody);
    if (gltf.scene) {
      gltf.scene.traverse((obj) => {
        if (obj.name) {
          data.nodes[obj.name] = obj;
        }
        if (obj.material && !data.materials[obj.material.name]) {
          data.materials[obj.material.name] = obj.material;
        }
      });
    }
    console.log("data", data);
    // const walls = data.nodes.Floor;
    // const wallBox = new THREE.Box3().setFromObject(walls);
    // var wallBoundingBox = new THREE.BoxHelper(walls);
    // scene.add(wallBoundingBox);
    // const wallDimensions = wallBox.getSize(new THREE.Vector3());
    // console.log("walls", walls, wallDimensions);
    // const wallShape = new CANNON.Box(new CANNON.Vec3(wallDimensions.x * 0.5, wallDimensions.y * 0.5, wallDimensions.z * 0.5));
    // const wallBody = new CANNON.Body({ mass: 1, shape: wallShape, isTrigger: true });
    // world.add(wallBody);
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0);
    // scene.add(boundingBoxHelperObject);

    // wallBody.addEventListener("collide", (evt) => {
    //   isColliding = true;
    // });
  },
  function (progress) {
    // console.log(progress);
  },
  function (error) {
    console.error(error);
  }
);

/**
 * Test sphere
//  */
// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//   })
// );

// // creating body for three js sphere
// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(0, 3, 0),
//   shape: sphereShape,
// });
// world.addBody(sphereBody);

// sphere.castShadow = true;
// sphere.position.y = 0.5;
// scene.add(sphere);

/**
 * Floor
 */
// const floor = new THREE.Mesh(
//   new THREE.PlaneGeometry(10, 10),
//   new THREE.MeshStandardMaterial({
//     color: "#777777",
//     metalness: 0.3,
//     roughness: 0.4,
//   })
// );
// floor.rotateX(Math.PI * -0.5);
// floor.receiveShadow = true;

const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
  material: groundMaterial,
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
world.addBody(groundBody);
// scene.add(floor);
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);
camera.position.set(0, 3, 3);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
const objects = [];
const dragControls = new DragControls(objects, camera, renderer.domElement);

dragControls.addEventListener("dragstart", function (event) {
  orbitControls.enabled = false;
  // event.object.material.opacity = 0.33;
  renderer.render(scene, camera);
  // isDragging = true;
  console.log("dragStart");
});

dragControls.addEventListener("dragend", function (event) {
  orbitControls.enabled = true;
  // event.object.material.opacity = 1;
  console.log("evtn", event);
  //   dragControls.enabled = true;
  isColliding = false;
  isDragging = false;
  console.log("dragEnd");
});
let lastCoords = null;
dragControls.addEventListener("drag", (evt) => {
  isDragging = true;
  if (lastCoords == null) {
    lastCoords = evt.object.position;
  }

  if (houseBox.containsBox(new THREE.Box3().setFromObject(evt.object))) {
    lastCoords = evt.object.position;
    for (let item of objectToUpdate) {
      if (item.object.uuid === evt.object.uuid) {
        item.body.position.copy({ ...evt.object.position });
        lastCoords = evt.object.position;
      }
    }
  } else {
    evt.object.position.set(...lastCoords);
  }
});

// let control = new TransformControls(camera, renderer.domElement);

// control.addEventListener("dragging-changed", function (event) {
//   orbitControls.enabled = !event.value;
//   console.log("evemt", event);
// });
// control.addEventListener("change", (evt) => {
//   console.log("evt", evt);
// });
// scene.add(control);

/**
 * Animate
 */

const clock = new THREE.Clock();
let oldElapsedTime = 0;
const cannonDebugger = new CannonDebugger(scene, world);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;
  world.step(1 / 60, deltaTime, 3);
  // Render
  renderer.render(scene, camera);
  for (let item of objectToUpdate) {
    item.object.position.copy(item.body.position);
    item.object.quaternion.copy(item.body.quaternion);
  }
  //   sphere.position.copy(sphereBody.position);
  // Call tick again on the next frame
  cannonDebugger.update();
  window.requestAnimationFrame(tick);
};

tick();

function addRandomObject() {
  let objVal = Math.floor(Math.random() * 2);
  let mesh = null;
  let box = null;
  switch (objVal) {
    case 0: {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({
          metalness: 0.3,
          roughness: 0.4,
        })
      );
      break;
    }
    case 1: {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
          metalness: 0.3,
          roughness: 0.4,
        })
      );
      break;
    }
    case 2: {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
          metalness: 0.3,
          roughness: 0.4,
        })
      );
      break;
    }
  }
  //   mesh.position.y = Math.random() * 0.5;
  //   mesh.position.x = Math.random() * 0.5 + 4;
  //   mesh.position.x = Math.random() * 0.5 + 4;
  mesh.position.set(0, 1, 0);

  box = new THREE.Box3().setFromObject(mesh);
  const myBoxHelper = new THREE.BoxHelper(mesh);
  const dimension = box.getSize(new THREE.Vector3());
  console.log("dimension", dimension);
  const boxShape = new CANNON.Box(new CANNON.Vec3(dimension.x * 0.5, dimension.y * 0.5, dimension.z * 0.5));
  const boxBody = new CANNON.Body({ mass: 1, shape: boxShape, position: new CANNON.Vec3(0, 1, 0), material: groundMaterial });
  // boxBody.sleepSpeedLimit = 1.0;
  // boxBody.angularDamping = 1;
  boxBody.fixedRotation = true;
  boxBody.updateMassProperties();
  // boxBody.collisionResponse = 0.01;
  world.addBody(boxBody);
  boxBody.addEventListener("collide", (evt) => {
    console.log(evt);
  });

  objects.push(mesh);
  // control.attach(mesh);
  objectToUpdate.push({ body: boxBody, object: mesh });
  mesh.castShadow = true;
  scene.add(mesh);
  // room.add(myBoxHelper);
}

let rayCaster = new THREE.Raycaster();
let mouse = {};

window.addEventListener("dblclick", (evt) => {
  mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
  rayCaster.setFromCamera(mouse, camera);
  const hits = rayCaster.intersectObjects(objects);
  // console.log("isDragging", isDragging);
  console.log(
    gui.folders.forEach((item) => {
      item.destroy(item);
    })
  );
  if (!isDragging)
    if (hits && hits[0]) {
      console.log("hits", hits[0].object.material.color);
      gui.addFolder(hits[0].object.uuid.slice(0, 6)).addFolder("color").addColor(hits[0].object.material, "color");
    }

  // else {
  //     addRandomObject(1);
  //   }
});
var axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

let splide = null;
let models = ["bed", "sofa"];
function showMiniScene() {
  splide = new Splide(".splide").mount();
  const el = document.querySelector(".splide");
  el.style.display = "block";
  splide.on("click", (evt) => {
    gltfLoader.load(`${models[evt.index]}.glb`, function (gltf) {
      let group = null;
      if (gltf.scene) {
        group = gltf.scene;
        scene.add(gltf.scene);

        const draggableObjects = dragControls.getObjects();
        draggableObjects.length = 0;

        dragControls.transformGroup = true;
        draggableObjects.push(group);
        const modelBox = new THREE.Box3().setFromObject(group);
        const myBoxHelper = new THREE.BoxHelper(group, 0x0000ff);

        const dimension = modelBox.getSize(new THREE.Vector3());
        console.log("dimension", dimension);
        const boxShape = new CANNON.Box(new CANNON.Vec3(dimension.x * 0.5, dimension.y * 0.5, dimension.z * 0.5));
        const boxBody = new CANNON.Body({ mass: 1, shape: boxShape, position: new CANNON.Vec3(0, 0, 0), material: groundMaterial });
        // // boxBody.sleepSpeedLimit = 1.0;
        // // boxBody.angularDamping = 1;
        boxBody.fixedRotation = true;
        boxBody.updateMassProperties();
        world.addBody(boxBody);
        // scene.add(group);
        // scene.add(group);
        // group.scale.set(0.88, 0.88, 0.88);
        // group.position.set(0, , 0);
        objectToUpdate.push({ body: boxBody, object: group });
      }
      splide.destroy();
      el.style.display = "none";
    });
  });
}
