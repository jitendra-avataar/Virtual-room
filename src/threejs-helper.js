import * as THREE from "three";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const mod = () => {
  initThree: () => {
    // canvas
    const canvas = document.querySelector("canvas.webgl");
    // scene
    const scene = new THREE.Scene();
    //lights
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

    // camera
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
  };
  loadObject: () => {};
  initGui: () => {};
  addGuiProperty: (guiProperty, guiValue) => {};
  handleWindowResize: () => {};
  dragControlHandler: () => {};
  animation: () => {};
  removeGuiProperty: () => {};
  raycasterHelper: () => {};
};
export default mod;
