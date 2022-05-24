import "./style.css";
import "@splidejs/splide/css";
import Splide from "@splidejs/splide";
import ThreeHelper from "./threejs-helper";
import * as dat from "lil-gui";
import CannonHelper from "./cannonjs-helper";
import CannonDebugger from "cannon-es-debugger";

let splide,
  gui = new dat.GUI(),
  objectsToAdd = ["sofa", "bed", "Table", "Light"],
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
    ThreeHelper.loadObject(`${objectsToAdd[evt.index]}.glb`)
      .then((gltf) => {
        const object = gltf.scene;
        let objectBox = ThreeHelper.getBox(object);
        modelCenters.push(objectBox.getCenter(ThreeHelper.getVector3(0, 0, 0)));
        room.attach(object);

        const transparentBox = ThreeHelper.addTransparentBox(ThreeHelper.getDimesions(object));
        scene.add(transparentBox);

        // const modelBoxHelper = ThreeHelper.getBoxHelper(object);
        // modelBoxHelpers.push(modelBoxHelper);
        // scene.add(modelBoxHelper);

        const body = CannonHelper.addBody(1, groundMaterial, ThreeHelper.getDimesions(object), { x: 0, y: 2, z: 0 });

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
const dragControl = ThreeHelper.getDragControl();
dragControl.addEventListener("drag", (event) => {
  for (let i = 0; i < modelDragGroups.length; i++) {
    if (event.object.uuid === modelDragGroups[i].uuid) {
      modelBodies[i].position.copy(event.object.position);
    }
  }
});

let oldElapsedTime = 0;
const loop = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;
  world.step(1 / 60, deltaTime, 3);
  renderer.render(scene, camera);

  for (let i = 0; i < models.length; i++) {
    modelDragGroups[i].position.copy({ ...modelBodies[i].position });
    models[i].position.copy({ y: modelDragGroups[i].position.y - modelCenters[i].y, x: modelDragGroups[i].position.x - modelCenters[i].x, z: modelDragGroups[i].position.z - modelCenters[i].z });
    models[i].quaternion.copy(models[i].quaternion);
    modelDragGroups[i].quaternion.copy(models[i].quaternion);
    modelDragGroups[i].scale.copy(models[i].scale);
  }
  // cannonDebugger.update();

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

    let positionFolder = objectFolder.addFolder("position");
    positionFolder.add(parent.position, "x", 0, 5, 0.1);
    positionFolder.add(parent.position, "z", 0, 5, 0.1);

    let scaleFolder = objectFolder.addFolder("scale");
    scaleFolder.add(parent.scale, "x", 0, 5, 0.1);
    scaleFolder.add(parent.scale, "y", 0, 5, 0.1);
    scaleFolder.add(parent.scale, "z", 0, 5, 0.1);
  }
});
