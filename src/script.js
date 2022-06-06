import "./style.css";
import "@splidejs/splide/css";
import Splide from "@splidejs/splide";
import ThreeHelper from "./threejs-helper";
import * as dat from "lil-gui";
import CannonHelper from "./cannonjs-helper";
import CannonDebugger from "cannon-es-debugger";
import * as THREE from "three";
import * as CANNON from "cannon-es";

import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull";
import { QuickHull } from "./quick-hull";
import { Geometry } from "three/examples/jsm/deprecated/Geometry";
import AmmoHelper from "./ammo-helper";

let splide,
  gui = new dat.GUI(),
  objectsToAdd = ["monkey", "monkey"],
  groundDimension = { sx: 40, sy: 1, sz: 40 },
  collisionMargin = 0.05,
  pos = new THREE.Vector3(),
  quat = new THREE.Quaternion(),
  models = [],
  rigidBodies = [];

const properties = {
  addObject: addScene,
};

ThreeHelper.initThree();

const scene = ThreeHelper.getScene();
const camera = ThreeHelper.getCamera();
const renderer = ThreeHelper.getRenderer();
const clock = ThreeHelper.getClock();

AmmoHelper.initAmmo().then((ammo) => {
  AmmoHelper.initPhysics();

  const groundShape = new ammo.btBoxShape(new ammo.btVector3(groundDimension.sx * 0.5, groundDimension.sy * 0.5, groundDimension * 0.5));
  groundShape.setMargin(collisionMargin);
  pos.set(0, -0.5, 0);
  quat.set(0, 0, 0, 1);
  AmmoHelper.addGround(groundShape, groundDimension, pos, quat);
  ThreeHelper.loadObject("room.glb")
    .then((gltf) => {
      scene.add(gltf.scene);
      room = gltf.scene;
    })
    .catch((err) => {
      console.error(err);
    });
});

function addScene() {
  let shapes = [];
  ThreeHelper.loadObject(`${objectsToAdd[evt.index]}.glb`)
    .then((gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh && !(child.name.match("Arrow") || child.name.match("Number"))) {
          shapes.push(createConvexPolyhedron(child.geometry));
        }
      });
      models.push(gltf.scene);
    })
    .catch((err) => {
      console.error(err);
    });
}

const loop = () => {
  const deltaTime = clock.getDelta();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
};
loop();
