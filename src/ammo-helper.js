import * as Ammo from "ammo.js";

const mod = () => {
  let collisionConfiguration,
    dispatcher,
    broadphase,
    solver,
    physicsWorld,
    gravityConstant = 9.8,
    tempBtVec3,
    transformAux,
    ammo;

  function initAmmo() {
    return new Promise((resolve, reject) => {
      Ammo().then((AmmoLib) => {
        ammo = AmmoLib;
        resolve(ammo);
      });
    });
  }

  function initPhysics() {
    collisionConfiguration = new ammo.btDefaultCollisionConfiguration();
    dispatcher = new ammo.btCollisionDispatcher(collisionConfiguration);
    broadphase = new ammo.btDbvtBroadphase();
    solver = new ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);

    physicsWorld.setGravity(new ammo.btVector3(0, -gravityConstant, 0));
    transformAux = new ammo.btTransform();
    tempBtVec3 = new ammo.btVector3(0, 0, 0);
    // initDebug();
    return physicsWorld;
  }
  function createRigidbody(object, physicsShape, mass, pos, quat, vel, angVel) {
    if (pos) {
      object.position.copy(pos);
    } else {
      pos = object.position;
    }
    if (quat) {
      object.quaternion.copy(quat);
    } else {
      quat = object.quaternion;
    }

    const transform = new ammo.transform();
    transform.setIdentity();
    transform.setOrigin(new ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new ammo.btQuaternion(quat.x, quat.y, quat.z));

    const motionState = new ammo.btDefaultMotionState(transform);

    const localInertia = new ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new ammo.btRigidBody(rbInfo);

    body.setFriction(0.5);
    if (vel) {
      body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
    }

    if (angVel) {
      body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
    }

    object.userData.physicsBody = body;
    object.userData.collided = false;
    if (mass > 0) {
      console.log("setting activation state");
      body.setActivationState(4);
    }
    physicsWorld.addRigidBody(body);
    return body;
  }

  function createConvexHullPhysicsShape(vertexes) {
    const shape = new ammo.btConvexHullShape();

    for (let i = 0, il = vertexes.length; i < il; i++) {
      tempBtVec3_1.setValue();
      const lastOne = i >= il;
      shape.addPoint(tempBtVec3_1, lastOne);
    }

    return shape;
  }
  function addGround(shape, dimension, pos, quat) {
    const transform = new ammo.transform();
    transform.setIdentity();
    transform.setOrigin(new ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new ammo.btQuaternion(quat.x, quat.y, quat.z));

    const motionState = new ammo.btDefaultMotionState(transform);

    const localInertia = new ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(0, localInertia);

    const rbInfo = new ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
    const body = new ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(body);
  }

  return {
    initAmmo,
    initPhysics,
    createRigidbody,
    createConvexHullPhysicsShape,
    addGround,
    initDebug,
    createConvexHullPhysicsShape,
    getTransformAux: () => transformAux,
    getBoxShaper: (sx, sy, sz) => new ammo.btBoxShape(new ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)),
  };
};
const AmmoHelper = mod();
export default AmmoHelper;
