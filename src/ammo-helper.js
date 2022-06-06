import * as Ammo from "ammo.js";

const mod = () => {
  let collisionConfiguration,
    dispatcher,
    broadphase,
    solver,
    physicsWorld,
    gravityConstant = -9.8,
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

    physicsWorld.setGravity(ammo.btVector3(0, gravityConstant, 0));
    transformAux = ammo.btTransform();
    tempBtVec3 = ammo.btVector3(0, 0, 0);
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

    scene.add(object);

    physicsWorld.addRigidBody(body);
    return body;
  }

  function createConvexHullPhysicsShape(coords) {
    const shape = new Ammo.btConvexHullShape();

    for (let i = 0, il = coords.length; i < il; i += 3) {
      tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2]);
      const lastOne = i >= il - 3;
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
    new ammo.btRigidBody(rbInfo);
  }

  return {
    initAmmo,
    initPhysics,
    createRigidbody,
    createConvexHullPhysicsShape,
    addGround,
  };
};
const AmmoHelper = mod();
export default AmmoHelper;
