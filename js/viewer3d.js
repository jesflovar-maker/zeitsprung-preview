/* ZEITSPRUNG V2 — viewer3d.js
   Three.js viewer for the Steinerne Brücke master GLB, loaded via native ES modules
   from CDN (no bundler / no npm available in this environment).
   Master asset (read-only source): 03_ASSETS/Steinerne_Bruecke/3D_GLB/ — copied here as a
   standalone deployment asset for this frozen demo share (assets/3d/).

   Controls implemented: ORBIT (default free orbit via OrbitControls),
   RESET, FRONT, 3/4, TOP camera presets.
   EXPLODE/ASSEMBLE toggle is intentionally NOT implemented — the loader could not
   be visually verified to produce a clean assembled state in this environment
   (no browser tooling available to confirm), so per instructions it is omitted
   rather than faked. See final report for details. */

/* Resolved via the <script type="importmap"> in index.html — required because the
   three.js example modules (GLTFLoader, OrbitControls) import the bare specifier
   "three" internally, which native ES modules cannot resolve without an import map. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const GLB_PATH = "./assets/3d/STEINERNE_BRUECKE_EXPLODED_MASTER_v1.glb";

export function initViewer3D({ mount, onLoadStart, onLoadProgress, onLoadDone, onLoadError }) {
  let renderer, scene, camera, controls, modelRoot;
  let frameId = null;
  let bboxCenter = new THREE.Vector3();
  let bboxRadius = 10;
  let ready = false;

  function setup() {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 5000);
    camera.position.set(20, 14, 28);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xfff2df, 0x0a0a0c, 1.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffe9c9, 1.4);
    key.position.set(30, 40, 20);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb4ff, 0.5);
    rim.position.set(-30, 10, -20);
    scene.add(rim);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 400;

    window.addEventListener("resize", onResize);
  }

  function onResize() {
    if (!renderer || !camera) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    frameId = requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function frameCameraToBBox() {
    const box = new THREE.Box3().setFromObject(modelRoot);
    const size = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(bboxCenter);
    bboxRadius = Math.max(size.x, size.y, size.z) * 0.65 || 10;
    controls.target.copy(bboxCenter);
  }

  function setCameraPreset(preset) {
    if (!modelRoot) return;
    const r = bboxRadius * 1.9;
    const c = bboxCenter;
    let pos;
    switch (preset) {
      case "front":
        pos = new THREE.Vector3(c.x, c.y + bboxRadius * 0.15, c.z + r);
        break;
      case "threequarter":
        pos = new THREE.Vector3(c.x + r * 0.75, c.y + r * 0.45, c.z + r * 0.75);
        break;
      case "top":
        pos = new THREE.Vector3(c.x + 0.001, c.y + r * 1.4, c.z + 0.001);
        break;
      case "reset":
      default:
        pos = new THREE.Vector3(c.x + r * 0.8, c.y + r * 0.55, c.z + r * 0.95);
        break;
    }
    camera.position.copy(pos);
    controls.target.copy(c);
    camera.updateProjectionMatrix();
    controls.update();
  }

  function load() {
    setup();
    animate();
    if (onLoadStart) onLoadStart();

    const loader = new GLTFLoader();
    loader.load(
      GLB_PATH,
      (gltf) => {
        modelRoot = gltf.scene;
        scene.add(modelRoot);
        frameCameraToBBox();
        setCameraPreset("reset");
        ready = true;
        if (onLoadDone) onLoadDone({ nodeCount: countNodes(modelRoot) });
      },
      (xhr) => {
        if (onLoadProgress && xhr.total) {
          onLoadProgress(xhr.loaded / xhr.total);
        }
      },
      (err) => {
        if (onLoadError) onLoadError(err);
      }
    );
  }

  function countNodes(root) {
    let n = 0;
    root.traverse(() => { n++; });
    return n;
  }

  function dispose() {
    if (frameId) cancelAnimationFrame(frameId);
    window.removeEventListener("resize", onResize);
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
  }

  return {
    load,
    setCameraPreset,
    dispose,
    isReady: () => ready
  };
}
