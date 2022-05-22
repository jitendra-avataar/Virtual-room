import CANNON from "cannon";

const mod = () => {
  let world, groundMaterial, groundGroundContact, gravity, groundBody;
  const initWorld = () => {
    world = new CANNON.World();
    world.gravity.set(0, -9.81, 0);
    groundMaterial = new CANNON.Material("ground");
    groundGroundContact = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
      friction: 1,
      restitution: 0,
    });
    world.addContactMaterial(groundGroundContact);
  };
  const addBody = (mass, material, dimension, position) => {
    const shape = new CANNON.Box(new CANNON.Vec3(dimension.x * 0.5, dimension.y * 0.5, dimension.z * 0.5));
    const body = new CANNON.Body({
      mass,
      shape,
      position,
      material,
    });
    world.add(body);
    return body;
  };
  const addGroundBody = () => {
    groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: groundMaterial,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);
  };
  return {
    initWorld,
    addGroundBody,
    addBody,
    getWorld: () => world,
    getGroundMaterial: () => groundMaterial,
  };
};

const CannonHelper = mod();
export default CannonHelper;
