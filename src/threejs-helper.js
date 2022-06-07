import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "three/examples/jsm/controls/DragControls";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const mod = () => {
  let scene,
    camera,
    renderer,
    gui,
    orbitControl,
    dragControl,
    dragObjects = [],
    raycaster,
    loader,
    clock;
  const initThree = () => {
    console.log("Init three.js scence,camera,lights,renderer");
    // canvas
    const canvas = document.querySelector("canvas.webgl");
    // scene
    scene = new THREE.Scene();
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
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);
    camera.position.set(0, 3, 3);
    scene.add(camera);
    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    console.log("size", sizes);
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    initControls();
    initLoader();
  };
  const initDracoLoader = () => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/gltf/");
    dracoLoader.preload();
    return dracoLoader;
  };
  const initLoader = () => {
    const dracoLoader = initDracoLoader();
    loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
  };
  const loadObject = (path) => {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          resolve(gltf);
        },
        (progress) => {
          // console.log(progress);
        },
        (err) => {
          console.log(err);
          reject(err);
        }
      );
    });
  };

  const handleWindowResize = () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  const initControls = () => {
    orbitControl = new OrbitControls(camera, renderer.domElement);
    dragControl = new DragControls(dragObjects, camera, renderer.domElement);
    dragControl.addEventListener("dragstart", dragControlHandlers.start);
    dragControl.addEventListener("dragend", dragControlHandlers.end);
  };

  const raycasterHelper = (clientX, clientY, maxWidth, maxHeight) => {
    const mouse = { x: (clientX / maxWidth) * 2 - 1, y: -(clientY / maxHeight) * 2 + 1 };
    raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    return raycaster;
  };

  const dragControlHandlers = {
    start: () => {
      orbitControl.enabled = false;
    },
    end: () => {
      orbitControl.enabled = true;
    },
    dragging: (event) => {},
  };
  function isBoxIntersecting(box1, box2) {
    return box1.containsBox(box2);
  }

  const getDimesions = (mesh) => {
    const box = getBox(mesh);
    return box.getSize(new THREE.Vector3());
  };
  const getBox = (mesh) => {
    return new THREE.Box3().setFromObject(mesh);
  };

  const addDragGroup = (group) => {
    const draggableObjects = dragControl.getObjects();
    draggableObjects.length = 0;
    dragControl.transformGroup = true;
    draggableObjects.push(group);
  };

  const getBoxHelper = (object) => {
    return new THREE.BoxHelper(object, 0x00ffff);
  };

  const addTransparentBox = (dimension) => {
    return new THREE.Mesh(new THREE.BoxGeometry(dimension.x, dimension.y, dimension.z), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
  };

  return {
    isBoxIntersecting,
    initThree,
    loadObject,
    handleWindowResize,
    raycasterHelper,
    getDimesions,

    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => renderer,
    getClock: () => new THREE.Clock(),
    getDragObject: () => dragObjects,
    addDragGroup,
    getBox,
    getBoxHelper,
    addTransparentBox,
    getVector3: (x, y, z) => new THREE.Vector3(x, y, z),
    getDragControlHandlers: () => dragControlHandlers,
    getDragControl: () => dragControl,
    getMatrix4: () => new THREE.Matrix4(),
  };
};
const ThreeHelper = mod();
export default ThreeHelper;
