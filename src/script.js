import ThreeHelper from "./threejs-helper";
import AmmoHelper from "./ammo-helper";
import GUI from "lil-gui";

let scene, camera, renderer, groundObject, helperBox, clock;
let groundDimension = { x: 5, y: 0.5, z: 5 },
  rigidBodies = [],
  transformAux1,
  physicsWorld;

const gui = new GUI();
let properties = {
  addObject: addObject,
};
async function init() {
  initGraphics();
  await initPhysics();
  loop();
}

function initGraphics() {
  ThreeHelper.initThree();
  scene = ThreeHelper.getScene();
  camera = ThreeHelper.getCamera();
  renderer = ThreeHelper.getRenderer();
  clock = ThreeHelper.getClock();

  groundObject = ThreeHelper.addTransparentBox({ x: 5, y: 0.4, z: 5 });
  helperBox = ThreeHelper.getBoxHelper(groundObject);
  scene.add(helperBox);
  scene.add(groundObject);
}

async function initPhysics() {
  await AmmoHelper.initAmmo();
  physicsWorld = AmmoHelper.initPhysics();
  transformAux1 = AmmoHelper.getTransformAux();

  AmmoHelper.createRigidbody(groundObject, AmmoHelper.getBoxShaper(groundDimension.x, groundDimension.y, groundDimension.z), 0);
}

function loop() {
  const deltaTime = clock.getDelta();
  updatePhysics(deltaTime);
  helperBox.update();
  requestAnimationFrame(loop);
  renderer.render(scene, camera);
}

function addObject() {
  let pos = { x: 0, y: 0, z: 0 };
  let scale = { x: 100, y: 2, z: 100 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  //threeJS Section
  let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({ color: 0xa0afa4 }));

  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);

  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;

  scene.add(blockPlane);

  //Ammojs Section
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  let motionState = new Ammo.btDefaultMotionState(transform);

  let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
  colShape.setMargin(0.05);

  let localInertia = new Ammo.btVector3(0, 0, 0);
  colShape.calculateLocalInertia(mass, localInertia);

  let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
  let body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(4);
  body.setRollingFriction(10);

  physicsWorld.addRigidBody(body);
  const object = ThreeHelper.addTransparentBox(1, 1, 1);
  object.position.set(0, 2, 0);
  const boxHelper = ThreeHelper.getBoxHelper(object);

  AmmoHelper.createRigidbody(object, AmmoHelper.getBoxShaper(1, 1, 1), 5);
  rigidBodies.push(object);
  scene.add(object);
  scene.add(boxHelper);
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10);
  for (let i = 0; i < rigidBodies.length; i++) {
    const objThree = rigidBodies[i];
    const objPhys = objThree.userData.physicsBody;
    const ms = objPhys.getMotionState();

    if (ms) {
      ms.getWorldTransform(transformAux1);
      const p = transformAux1.getOrigin();
      const q = transformAux1.getRotation();

      console.log(p.x(), p.y(), p.z());

      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      objThree.userData.collided = false;
    }
  }
}
init();

gui.add(properties, "addObject");
