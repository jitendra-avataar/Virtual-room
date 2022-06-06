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

let splide,
  gui = new dat.GUI(),
  objectsToAdd = ["monkey", "monkey"],
  room,
  modelBoxHelpers = [],
  modelCenters = [];

const properties = {
  addObject: addScene,
};
ThreeHelper.initThree();
CannonHelper.initWorld();
CannonHelper.addGroundBody();

const world = CannonHelper.getWorld();
const scene = ThreeHelper.getScene();
const camera = ThreeHelper.getCamera();
const renderer = ThreeHelper.getRenderer();
const clock = ThreeHelper.getClock();
const cannonDebugger = new CannonDebugger(scene, world);
const groundMaterial = CannonHelper.getGroundMaterial();
const modelDragGroups = [],
  models = [],
  modelBodies = [];
let data = { nodes: {}, materials: {} };

ThreeHelper.loadObject("room.glb")
  .then((gltf) => {
    scene.add(gltf.scene);
    room = gltf.scene;
  })
  .catch((err) => {
    console.error(err);
  });
function addScene() {
  splide = new Splide(".splide").mount();
  const el = document.querySelector(".splide");
  el.style.display = "block";

  splide.on("click", (evt) => {
    let shapes = [];

    ThreeHelper.loadObject(`${objectsToAdd[evt.index]}.glb`)
      .then((gltf) => {
        let monkeyMesh, monkeyCollisionMesh;
        gltf.scene.traverse((child) => {
          console.log(child.name);
          if (child.name === "Suzanne") {
            monkeyMesh = child;
          } else if (child.name.startsWith("physics")) {
            monkeyCollisionMesh = child;
            shapes.push(createConvexPolyhedron(monkeyCollisionMesh.geometry));
          }
          // if (child.isMesh && !(child.name.match("Arrow") || child.name.match("Number"))) {
          //   shapes.push(createConvexPolyhedron(child.geometry));
          // }
        });
        // const object = gltf.scene;
        const object = monkeyMesh;
        // shapes.push(createConvexPolyhedron(monkeyMesh.geometry));
        let objectBox = ThreeHelper.getBox(object);
        modelCenters.push(objectBox.getCenter(ThreeHelper.getVector3(0, 0, 0)));
        room.attach(object);

        const transparentBox = ThreeHelper.addTransparentBox(ThreeHelper.getDimesions(object));
        scene.add(transparentBox);

        const modelBoxHelper = ThreeHelper.getBoxHelper(transparentBox);
        modelBoxHelpers.push(modelBoxHelper);
        scene.add(modelBoxHelper);

        const body = new CANNON.Body({ mass: 1, position: { x: 0, y: 2, z: 0 }, material: groundMaterial });
        console.log("shape", shapes);
        for (let i = 0; i < shapes.length; i++) {
          console.log("adding shape");
          body.addShape(shapes[i]);
        }
        world.addBody(body);

        // const body = CannonHelper.addBody(1, groundMaterial, ThreeHelper.getDimesions(object), { x: 0, y: 2, z: 0 });

        body.fixedRotation = true;
        body.updateMassProperties();
        modelBodies.push(body);
        modelDragGroups.push(transparentBox);
        models.push(object);

        ThreeHelper.getDragObject().push(transparentBox);
      })
      .catch((err) => {
        console.error(err);
      });

    splide.destroy();
    el.style.display = "none";
  });
}

// window.addEventListener("pointerdown", (event) => {
//   const raycaster = ThreeHelper.raycasterHelper(event.clientX, event.clientY, window.innerWidth, window.innerHeight);

//   const hits = raycaster.intersectObjects(objects, true);
//   if (hits && hits[0]) {
// let parent = hits[0].object.parent;
// while (parent.type !== "Group") {
//   parent = parent.parent;
// }
//     ThreeHelper.addDragGroup(parent);
//   }
// });
let lastCoords = null;
const dragControl = ThreeHelper.getDragControl();
dragControl.addEventListener("drag", (event) => {
  if (room) {
    if (lastCoords == null) {
      lastCoords = event.object.position;
    }
    if (ThreeHelper.getBox(room).containsBox(ThreeHelper.getBox(event.object))) {
      for (let i = 0; i < modelDragGroups.length; i++) {
        if (event.object.uuid === modelDragGroups[i].uuid) {
          modelBodies[i].position.copy(event.object.position);
          lastCoords = event.object.position;
        }
      }
    } else {
      event.object.position.set(...lastCoords);
    }
  }
});

let oldElapsedTime = 0;
const loop = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;
  // world.step(1 / 60, deltaTime, 3);
  world.fixedStep();
  renderer.render(scene, camera);

  for (let i = 0; i < models.length; i++) {
    // modelDragGroups[i].position.copy({ ...modelBodies[i].position });
    models[i].position.copy({ y: modelBodies[i].position.y, x: modelBodies[i].position.x - modelCenters[i].x, z: modelBodies[i].position.z - modelCenters[i].z });
    modelDragGroups[i].position.copy({ ...models[i].position, y: models[i].position.y + modelCenters[i].y });

    // models[i].quaternion.copy(models[i].quaternion);
    // modelDragGroups[i].quaternion.copy(models[i].quaternion);

    // modelDragGroups[i].scale.copy(models[i].scale);
    modelBoxHelpers[i].update();
  }
  cannonDebugger.update();

  window.requestAnimationFrame(loop);
};
loop();

gui.add(properties, "addObject");

window.addEventListener("dblclick", (evt) => {
  const mouse = {};
  mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
  const rayCaster = ThreeHelper.raycasterHelper(evt.clientX, evt.clientY, window.innerWidth, window.innerHeight);
  const hits = rayCaster.intersectObjects(models);

  gui.folders.forEach((item) => {
    item.destroy(item);
  });
  if (hits && hits[0]) {
    let parent = hits[0].object.parent;
    while (parent.type !== "Group") {
      parent = parent.parent;
    }
    const objectFolder = gui.addFolder(parent.uuid.slice(0, 6));
    // objectFolder.addFolder("color").addColor(parent.material, "color");
    let rotationFolder = objectFolder.addFolder("rotation");
    rotationFolder.add(parent.rotation, "x", 0, 2 * Math.PI, 0.01);
    rotationFolder.add(parent.rotation, "y", 0, 2 * Math.PI, 0.01);
    rotationFolder.add(parent.rotation, "z", 0, 2 * Math.PI, 0.01);

    let scaleFolder = objectFolder.addFolder("scale");
    scaleFolder.add(parent.scale, "x", 0, 5, 0.1);
    scaleFolder.add(parent.scale, "y", 0, 5, 0.1);
    scaleFolder.add(parent.scale, "z", 0, 5, 0.1);
  }
});
function getPolyhedronShape(obj) {
  const convexHull = new ConvexHull().setFromObject(obj);
  const faces = convexHull.faces;
  const cannonFaces = [];
  const vertices = [];
  const normals = [];
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    let cannonFace = [];
    let edge = face.edge;
    do {
      let point = edge.head().point;
      let vec3 = new CANNON.Vec3(point.x, point.y, point.z);
      vertices.push(vec3);
      cannonFace.push(vertices.indexOf(vec3));
      edge = edge.next;
    } while (edge !== face.edge);
    cannonFaces.push(cannonFace);
  }
  return new CANNON.ConvexPolyhedron({ vertices: vertices, faces: cannonFaces });
}

function createFromIndexed(mesh) {
  let geometry = mesh.geometry;
  geometry.deleteAttribute("normal");
  //if not planning on putting textures on the mesh, you can delete the uv mapping for better vertice merging
  geometry.deleteAttribute("uv");
  geometry = BufferGeometryUtils.mergeVertices(geometry);
  mesh.geometry = geometry;
  let position = geometry.attributes.position.array;
  let geomFaces = geometry.index.array;
  const points = [];
  const faces = [];
  for (var i = 0; i < position.length; i += 3) {
    points.push(new CANNON.Vec3(position[i], position[i + 1], position[i + 2]));
  }
  for (var i = 0; i < geomFaces.length; i += 3) {
    faces.push([geomFaces[i], geomFaces[i + 1], geomFaces[i + 2]]);
  }
  return new CANNON.ConvexPolyhedron(points, faces);
}
function createConvexPolyhedron(geometry) {
  if (!geometry.vertices) {
    geometry = new Geometry().fromBufferGeometry(geometry);
    geometry.mergeVertices();
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
  }
  const points = geometry.vertices.map(function (v) {
    return new CANNON.Vec3(v.x, v.y, v.z);
  });
  const faces = geometry.faces.map(function (f) {
    return [f.a, f.b, f.c];
  });

  console.log(faces, "facesss", points);

  return new CANNON.ConvexPolyhedron({ vertices: points, faces });
}
