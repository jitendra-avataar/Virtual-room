// import "./style.css";
// import "@splidejs/splide/css";
// import Splide from "@splidejs/splide";
// import ThreeHelper from "./threejs-helper";
// import * as dat from "lil-gui";
// import CannonHelper from "./cannonjs-helper";
// import CannonDebugger from "cannon-es-debugger";
// import * as THREE from "three";
// import * as CANNON from "cannon-es";

// import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
// import { ConvexHull } from "three/examples/jsm/math/ConvexHull";
// import { QuickHull } from "./quick-hull";
// import { Geometry } from "three/examples/jsm/deprecated/Geometry";
// import AmmoHelper from "./ammo-helper";

// let splide,
//   gui = new dat.GUI(),
//   objectsToAdd = ["monkey", "monkey"],
//   groundDimension = { sx: 40, sy: 1, sz: 40 },
//   collisionMargin = 0.05,
//   pos = new THREE.Vector3(),
//   quat = new THREE.Quaternion(),
//   models = [],
//   rigidBodies = [];
// const properties = {
//   addObject: addScene,
// };

// ThreeHelper.initThree();
// const scene = ThreeHelper.getScene();
// const camera = ThreeHelper.getCamera();
// const renderer = ThreeHelper.getRenderer();
// const clock = ThreeHelper.getClock();
// let tempBtVec3_1;

// AmmoHelper.initAmmo().then((ammo) => {
//   AmmoHelper.initPhysics();
//   AmmoHelper.initDebug(scene);

//   const groundShape = new ammo.btBoxShape(new ammo.btVector3(groundDimension.sx * 0.5, groundDimension.sy * 0.5, groundDimension * 0.5));
//   groundShape.setMargin(collisionMargin);
//   pos.set(0, -0.5, 0);
//   quat.set(0, 0, 0, 1);
//   AmmoHelper.addGround(groundShape, groundDimension, pos, quat);
//   ThreeHelper.loadObject("room.glb")
//     .then((gltf) => {
//       scene.add(gltf.scene);
//       console.log(gltf.scene.position);
//       // room = gltf.scene;
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });

// function addScene() {
//   let shapes = [];
//   ThreeHelper.loadObject(`sofa.glb`)
//     .then((gltf) => {
//       // gltf.scene.traverse((child) => {
//       //   if (child.isMesh && !(child.name.match("Arrow") || child.name.match("Number"))) {
//       //     shapes.push(createConvexPolyhedron(child.geometry));
//       //   }
//       // });
//       gltf.scene.position.set(0, 2, 0);

//       const shape = createConvexHullPhysicsShape(new ConvexHull().setFromObject(gltf.scene));
//       console.log("convex", shape);

//       AmmoHelper.createRigidbody(gltf.scene, shape, 5);
//       scene.add(gltf.scene);
//       models.push(gltf.scene);
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// }

// const loop = () => {
//   const deltaTime = clock.getDelta();
//   renderer.render(scene, camera);
//   window.requestAnimationFrame(loop);
// };
// loop();

// function createConvexHullPhysicsShape(vertexes) {
//   const shape = new Ammo.btConvexHullShape();

//   for (let i = 0, il = vertexes.length; i < il; i++) {
//     tempBtVec3_1.setValue();
//     const lastOne = i >= il;
//     shape.addPoint(tempBtVec3_1, lastOne);
//   }

//   return shape;
// }

// gui.add(properties, "addObject");
