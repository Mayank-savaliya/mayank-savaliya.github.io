import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { createJourneyArchitecture } from "./createJourneyArchitecture.js";
import { journeyPose } from "./journey.js";
import { interiorBlend } from "./entrance.js";
import {
  createPhysicalMaterials,
  projectSurfaceUVs,
} from "./physicalMaterials.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createFloorReflection } from "./createFloorReflection.js";

// An original procedural scene: every stone, spire and tree is geometry.
// Static architecture is batched by material to keep the draw-call count small.
function seededRandom(seed = 1701) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function makeTexture(draw, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d"), size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function batchGroup(group) {
  group.updateMatrixWorld(true);
  const batches = new Map();
  const inverse = group.matrixWorld.clone().invert();
  const originalGeometries = new Set();
  const preserved = [];
  group.traverse((child) => {
    if (child.isSprite || child.isLight) {
      preserved.push([child, inverse.clone().multiply(child.matrixWorld)]);
      return;
    }
    if (!child.isMesh || Array.isArray(child.material)) return;
    const geometry = (
      child.geometry.index
        ? child.geometry.toNonIndexed()
        : child.geometry.clone()
    ).applyMatrix4(inverse.clone().multiply(child.matrixWorld));
    projectSurfaceUVs(
      geometry,
      child.material,
      group.userData.textureScale || 1,
    );
    const list = batches.get(child.material) || [];
    list.push(geometry);
    batches.set(child.material, list);
    originalGeometries.add(child.geometry);
  });
  group.clear();
  for (const [object, matrix] of preserved) {
    matrix.decompose(object.position, object.quaternion, object.scale);
    group.add(object);
  }
  for (const [material, geometries] of batches) {
    const geometry = mergeGeometries(
      geometries.map((g) => (g.index ? g.toNonIndexed() : g)),
    );
    if (geometry) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow =
        !material.isMeshBasicMaterial &&
        !(material.transmission > 0) &&
        !material.userData.noShadow;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    geometries.forEach((g) => g.dispose());
  }
  originalGeometries.forEach((g) => g.dispose());
}

function archShape(width, height) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height * 0.64);
  shape.quadraticCurveTo(width / 2, height * 0.87, 0, height);
  shape.quadraticCurveTo(-width / 2, height * 0.87, -width / 2, height * 0.64);
  shape.closePath();
  return shape;
}

function createCastle(materials) {
  const root = new THREE.Group();
  root.userData.textureScale = 3;
  const { stone, trim, roof, glass, shadow, snow } = materials;
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const glassGeometry = new THREE.ShapeGeometry(archShape(0.24, 0.62));
  const frameGeometry = new THREE.ShapeGeometry(archShape(0.34, 0.74));
  function mesh(geometry, material, x = 0, y = 0, z = 0, parent = root) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  }
  function box(x, y, z, w, h, d, material = stone, parent = root) {
    const object = mesh(boxGeometry, material, x, y, z, parent);
    object.scale.set(w, h, d);
    return object;
  }
  function windowAt(x, y, z, rotation = 0, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotation;
    group.scale.setScalar(scale);
    root.add(group);
    mesh(frameGeometry, shadow, 0, -0.05, 0, group);
    mesh(glassGeometry, glass, 0, 0, 0.014, group);
    box(0, 0.28, 0.028, 0.023, 0.56, 0.02, trim, group);
    box(0, 0.29, 0.029, 0.235, 0.023, 0.02, trim, group);
  }
  function tower(x, z, radius, height, roofHeight, base = 0, windows = true) {
    mesh(
      new THREE.CylinderGeometry(radius, radius * 1.055, height, 48),
      stone,
      x,
      base + height / 2,
      z,
    );
    [0.15, height * 0.45, height - 0.22, height].forEach((level) =>
      mesh(
        new THREE.CylinderGeometry(radius * 1.07, radius * 1.09, 0.12, 48),
        trim,
        x,
        base + level,
        z,
      ),
    );
    const cone = mesh(
      new THREE.ConeGeometry(radius * 1.17, roofHeight, 48, 12),
      roof,
      x,
      base + height + roofHeight / 2 + 0.05,
      z,
    );
    const cap = mesh(
      cone.geometry,
      snow,
      x,
      base + height + roofHeight / 2 + 0.085,
      z,
    );
    cap.scale.set(1.018, 1, 1.018);
    // Slate courses, carved corbels, and dormers break up the perfect cones.
    for (let course = 0.12; course < roofHeight - 0.1; course += 0.2) {
      const r = radius * 1.17 * (1 - course / roofHeight);
      mesh(
        new THREE.CylinderGeometry(r, r + 0.016, 0.025, 48),
        roof,
        x,
        base + height + course,
        z,
      );
    }
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      const corbel = box(
        x + Math.sin(a) * radius * 1.03,
        base + height - 0.28,
        z + Math.cos(a) * radius * 1.03,
        0.1,
        0.3,
        0.16,
        trim,
      );
      corbel.rotation.y = a;
    }
    if (radius > 0.6) {
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + 0.4;
        windowAt(
          x + Math.sin(a) * radius * 0.94,
          base + height + 0.32,
          z + Math.cos(a) * radius * 0.94,
          a,
          0.8,
        );
      }
    }
    mesh(
      new THREE.CylinderGeometry(0.02, 0.035, 0.58, 5),
      trim,
      x,
      base + height + roofHeight + 0.22,
      z,
    );
    mesh(
      new THREE.SphereGeometry(0.06, 6, 4),
      trim,
      x,
      base + height + roofHeight + 0.44,
      z,
    );
    if (windows) {
      for (let level = 1.15; level < height - 0.8; level += 1.3) {
        for (let i = 0; i < 7; i++) {
          const angle = (i * Math.PI * 2) / 7;
          windowAt(
            x + Math.sin(angle) * (radius + 0.025),
            base + level,
            z + Math.cos(angle) * (radius + 0.025),
            angle,
            radius < 0.5 ? 0.65 : 1,
          );
        }
      }
    }
  }
  function pitchedRoof(x, y, z, width, depth, height) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(0, height);
    shape.lineTo(width / 2, 0);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      steps: 1,
    });
    mesh(geometry, roof, x, y, z - depth / 2);
    const cover = mesh(geometry, snow, x, y + 0.045, z - depth / 2);
    cover.scale.set(1.02, 1, 1.005);
    box(x, y + height, z, 0.09, 0.09, depth + 0.2, trim);
  }

  // Great Hall, its stone buttresses, lancet windows, and steep slate roof.
  box(0, 1.85, 1.6, 3.3, 3.7, 5.5);
  pitchedRoof(0, 3.7, 1.6, 3.65, 5.8, 2.3);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const z = -0.75 + i * 0.9;
      box(side * 1.77, 1.6, z, 0.25, 3.4, 0.2, trim);
      box(side * 1.96, 0.62, z, 0.28, 1.24, 0.3, stone);
      const shoulder = box(side * 1.87, 1.39, z, 0.22, 0.55, 0.28, trim);
      shoulder.rotation.z = side * 0.27;
      box(side * 1.77, 3.12, z, 0.33, 0.15, 0.3, trim);
      mesh(new THREE.ConeGeometry(0.16, 0.65, 8), roof, side * 1.77, 3.65, z);
      if (i < 5)
        windowAt(side * 1.674, 1.3, z + 0.4, (side * Math.PI) / 2, 1.85);
    }
  }
  for (const x of [-0.9, 0, 0.9]) windowAt(x, 1.75, 4.369, 0, 1.75);
  // Traceried rose window and a deep-set entrance in the gabled end.
  const rose = mesh(
    new THREE.TorusGeometry(0.44, 0.055, 8, 40),
    trim,
    0,
    4.24,
    4.52,
  );
  mesh(new THREE.CircleGeometry(0.39, 40), glass, 0, 4.24, 4.5);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const spoke = box(
      Math.sin(a) * 0.2,
      4.24 + Math.cos(a) * 0.2,
      4.54,
      0.027,
      0.39,
      0.025,
      trim,
    );
    spoke.rotation.z = -a;
  }
  for (const side of [-1, 1]) {
    for (let bay = 0; bay < 6; bay++) {
      const z = -0.55 + bay * 0.91;
      box(side * 1.7, 3.68, z, 0.3, 0.18, 0.21, trim);
    }
  }
  // The central keep and astronomy spires establish the familiar silhouette.
  tower(-1.9, -1.3, 1.17, 8.8, 3.5);
  tower(2.3, -2.2, 0.95, 7.2, 3.4);
  tower(-3.6, 1.1, 0.67, 5.9, 2.7);
  tower(3.05, 1.8, 0.72, 5.3, 2.7);
  tower(-1.9, -1.3, 0.44, 2.2, 1.75, 9.7, false);
  // Smaller turrets sit around the main roof line.
  [
    [-1.6, 4.25],
    [1.6, 4.25],
    [-1.6, -0.95],
    [1.6, -0.95],
  ].forEach(([x, z]) => tower(x, z, 0.33, 3.95, 1.5, 0, false));
  box(0.4, 2, -3.3, 5.8, 4, 2.4);
  pitchedRoof(0.4, 4, -3.3, 6.1, 2.65, 1.8);
  for (let x = -1.9; x <= 2.9; x += 0.8) {
    windowAt(x, 1.0, -2.075, 0, 1.1);
    windowAt(x, 2.65, -2.075, 0, 1);
    windowAt(x, 1.0, -4.525, Math.PI, 1.1);
    windowAt(x, 2.65, -4.525, Math.PI, 1);
  }
  tower(-3.25, -3.1, 0.51, 5.8, 2.5);
  tower(3.7, -3.15, 0.48, 5.15, 2.6);
  box(4.1, 1.65, -0.55, 2, 3.3, 3.0);
  pitchedRoof(4.1, 3.3, -0.55, 2.2, 3.2, 1.9);
  tower(5.0, 0.9, 0.43, 3.8, 2.0);
  // A cloister and low parapet enclose the courtyard.
  box(-3.1, 0.62, 3.2, 1.1, 1.25, 3.8);
  box(-0.1, 0.58, 5.0, 7.0, 1.15, 0.4, trim);
  for (let x = -3.4; x < 3.4; x += 0.42)
    box(x, 1.28, 5.0, 0.23, 0.4, 0.43, trim);
  box(-0.1, 1.53, 5.0, 7.0, 0.06, 0.45, snow);
  tower(-3.6, 4.9, 0.45, 2.3, 1.8, 0, false);
  tower(3.4, 4.9, 0.45, 2.3, 1.8, 0, false);
  // A real, open-arched viaduct projects off the cliff into the distance.
  for (let i = 0; i < 7; i++) {
    const span = 1.55,
      r = 0.57,
      h = 3.4,
      opening = 2.75;
    const arch = new THREE.Shape();
    arch.moveTo(-span / 2, h);
    arch.lineTo(span / 2, h);
    arch.lineTo(span / 2, 0);
    arch.lineTo(r, 0);
    arch.lineTo(r, opening - r);
    arch.absarc(0, opening - r, r, 0, Math.PI, false);
    arch.lineTo(-r, 0);
    arch.lineTo(-span / 2, 0);
    arch.closePath();
    mesh(
      new THREE.ExtrudeGeometry(arch, {
        depth: 0.78,
        bevelEnabled: false,
        curveSegments: 10,
      }),
      stone,
      5 + i * span,
      -2.3,
      -2.2,
    );
  }
  box(9.6, 1.2, -1.8, 10.7, 0.25, 1.05, trim);
  box(9.6, 1.43, -2.28, 10.7, 0.4, 0.12, stone);
  box(9.6, 1.43, -1.31, 10.7, 0.4, 0.12, stone);
  box(9.6, 1.65, -1.8, 10.7, 0.055, 1.05, snow);
  batchGroup(root);
  return root;
}

function createTrees(random, leaf, bark, snow, count, region) {
  const trees = new THREE.Group();
  const needles = makeTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < 3200; i++) {
      const y = random() * size;
      const width = (1 - y / size) * size * 0.43;
      const x = size / 2 + (random() - 0.5) * width * 2;
      const shade = 110 + Math.floor(random() * 100);
      ctx.strokeStyle = `rgba(${shade},${shade},${shade},.9)`;
      ctx.lineWidth = 1 + random();
      ctx.beginPath();
      ctx.moveTo(x, size - y);
      ctx.lineTo(x + (x - size / 2) * 0.12, size - y + 8 + random() * 10);
      ctx.stroke();
    }
  }, 256);
  // Alpha-tested sprays give the conifers irregular, light-catching silhouettes.
  const foliage = leaf.clone();
  foliage.map = needles;
  const dust = foliage.clone();
  dust.color.set("#b8c4c0");
  dust.userData.seasonalSnow = true;
  const sprayGeometry = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < count; i++) {
    const x = region.x + (random() - 0.5) * region.w;
    const z = region.z + (random() - 0.5) * region.d;
    const height = region.h * (0.65 + random() * 0.65);
    const y = region.y ?? -3.1;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.11, height, 9),
      bark,
    );
    trunk.position.set(x, y + height / 2, z);
    trees.add(trunk);
    for (let tier = 0; tier < 9; tier++) {
      const fraction = tier / 9,
        radius = height * (0.24 - fraction * 0.21);
      for (let branch = 0; branch < 7; branch++) {
        const angle = (branch * Math.PI * 2) / 7 + tier * 1.7 + random() * 0.25;
        const spray = new THREE.Mesh(sprayGeometry, foliage);
        spray.position.set(
          x + Math.sin(angle) * radius * 0.5,
          y + height * (0.2 + fraction * 0.77),
          z + Math.cos(angle) * radius * 0.5,
        );
        spray.rotation.set(
          0.12 + random() * 0.34,
          angle,
          (random() - 0.5) * 0.45,
        );
        spray.scale.set(radius * 1.6, height * 0.26, 1);
        trees.add(spray);
        if ((branch + tier) % 3 === 0) {
          const patch = spray.clone();
          patch.material = dust;
          patch.position.y += 0.025;
          patch.scale.multiplyScalar(0.74);
          trees.add(patch);
        }
      }
    }
  }
  batchGroup(trees);
  return trees;
}

export function createWorld(host, initial) {
  const random = seededRandom();
  let state = { ...initial };
  let disposed = false,
    frame = 0,
    dirty = true,
    visible = true;
  let assetsReady = false,
    readySent = false,
    resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = (_url, loaded, total) => {
    if (!disposed) initial.onProgress?.(loaded / total);
  };
  loadingManager.onLoad = () => {
    assetsReady = true;
    dirty = true;
  };
  const mobile = window.innerWidth < 780;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !mobile,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.2 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.transmissionResolutionScale = mobile ? 0.4 : 0.6;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0d1419");
  const camera = new THREE.PerspectiveCamera(48, 1, 0.15, 600);
  scene.fog = new THREE.FogExp2("#253d46", 0.012);
  const pointer = new THREE.Vector2();
  const cameraTarget = new THREE.Vector3();
  const interiorFog = new THREE.Color("#162226");
  const skyUniforms = {
    top: { value: new THREE.Color("#081723") },
    bottom: { value: new THREE.Color("#526671") },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(450, 24, 16),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader:
        "varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader: `
        uniform vec3 top;
        uniform vec3 bottom;
        varying vec3 vPosition;
        void main() {
          float h = clamp((normalize(vPosition).y + 0.07) * 1.8, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottom, top, pow(h, 0.7)), 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  );
  scene.add(sky);
  const hemisphere = new THREE.HemisphereLight("#b5ccd5", "#29363a", 1.4);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight("#bed8f0", 2.8);
  sun.position.set(-28, 42, 15);
  sun.target.position.set(0, 9, -20);
  scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.camera.left = -44;
  sun.shadow.camera.right = 44;
  sun.shadow.camera.top = 44;
  sun.shadow.camera.bottom = -44;
  sun.shadow.camera.far = 130;
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00015;
  sun.shadow.radius = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#718698", 0.18);
  fill.position.set(20, 10, -15);
  scene.add(fill);

  const physical = createPhysicalMaterials(
    renderer,
    () => {
      dirty = true;
    },
    loadingManager,
  );
  const { stone, trim, roof } = physical;
  const glass = new THREE.MeshStandardMaterial({
    color: "#ae9771",
    emissive: "#ffae53",
    emissiveIntensity: 1.4,
    roughness: 0.22,
    side: THREE.DoubleSide,
  });
  const shadow = new THREE.MeshStandardMaterial({
    color: "#1a292a",
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const snow = new THREE.MeshStandardMaterial({
    color: "#e0e7e3",
    normalMap: roof.normalMap,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.92,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  snow.userData.textureSize = 3;
  snow.userData.noShadow = true;
  snow.onBeforeCompile = (shader) => {
    shader.vertexShader = "varying vec3 vSnowPosition;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvSnowPosition = position;",
    );
    shader.fragmentShader =
      `
      varying vec3 vSnowPosition;
      float snowHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float snowNoise(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
        return mix(mix(mix(snowHash(i), snowHash(i+vec3(1,0,0)), f.x),
          mix(snowHash(i+vec3(0,1,0)), snowHash(i+vec3(1,1,0)), f.x), f.y),
          mix(mix(snowHash(i+vec3(0,0,1)), snowHash(i+vec3(1,0,1)), f.x),
          mix(snowHash(i+vec3(0,1,1)), snowHash(i+vec3(1,1,1)), f.x), f.y), f.z);
      }
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <alphatest_fragment>",
      `
      #include <alphatest_fragment>
      float snowCover = snowNoise(vSnowPosition * 2.5) * .65
        + snowNoise(vSnowPosition * 6.3) * .25 + snowNoise(vSnowPosition * 15.) * .1;
      diffuseColor.a *= smoothstep(.28, .72, snowCover);
      if (diffuseColor.a < .025) discard;
      diffuseColor.rgb *= .88 + snowCover * .12;
    `,
    );
  };
  const rock = new THREE.MeshStandardMaterial({
    color: "#4c5650",
    roughness: 1,
    map: stone.map,
    normalMap: stone.normalMap,
    normalScale: new THREE.Vector2(1.8, 1.8),
  });
  const moss = new THREE.MeshStandardMaterial({
    color: "#53604c",
    roughness: 1,
  });
  const leaf = new THREE.MeshStandardMaterial({
    color: "#203d34",
    roughness: 1,
    side: THREE.DoubleSide,
    alphaTest: 0.4,
  });
  const bark = new THREE.MeshStandardMaterial({
    color: "#344139",
    roughness: 1,
  });
  const castle = createCastle({ stone, trim, roof, glass, shadow, snow });
  const island = new THREE.Group();
  island.name = "Distant castle keep";
  // The distant keep sits beside the walkable hall, clear of its route.
  island.position.set(35, 0.3, -54);
  island.scale.setScalar(3);
  scene.add(island);
  island.add(castle);
  // Irregular strata create a cliff, rather than a flat pedestal.
  const cliffGeometry = new THREE.CylinderGeometry(6.6, 8.2, 6.5, 31, 8);
  const cliffPositions = cliffGeometry.attributes.position;
  for (let i = 0; i < cliffPositions.count; i++) {
    const x = cliffPositions.getX(i),
      z = cliffPositions.getZ(i),
      y = cliffPositions.getY(i);
    const factor =
      1 + 0.1 * Math.sin(x * 1.8 + z * 0.7 + y) + 0.065 * Math.cos(z * 2 - y);
    cliffPositions.setXYZ(
      i,
      x * factor,
      y + 0.22 * Math.sin(x * 1.2 + z),
      z * factor * 0.88,
    );
  }
  cliffGeometry.computeVertexNormals();
  const cliff = new THREE.Mesh(cliffGeometry, rock);
  cliff.position.set(0.4, -3.18, 0.1);
  cliff.castShadow = true;
  cliff.receiveShadow = true;
  island.add(cliff);
  const grounds = new THREE.Mesh(
    new THREE.CylinderGeometry(6.55, 6.8, 0.34, 13),
    moss,
  );
  grounds.position.set(0.4, -0.1, 0.1);
  grounds.scale.z = 0.88;
  grounds.receiveShadow = true;
  island.add(grounds);
  for (let i = 0; i < 25; i++) {
    const angle = random() * Math.PI * 2;
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), rock);
    boulder.position.set(
      Math.cos(angle) * (5.6 + random() * 1.6),
      -1.5 - random() * 3.5,
      Math.sin(angle) * 5.5,
    );
    boulder.scale.set(1 + random(), 1.4 + random() * 2.1, 0.7 + random());
    boulder.rotation.set(random(), random(), random());
    island.add(boulder);
  }
  // Misty Scottish ridges, separated in depth for real camera parallax.
  const mountains = new THREE.Group();
  scene.add(mountains);
  for (let layer = 0; layer < 3; layer++) {
    const geometry = new THREE.PlaneGeometry(650, 70, 180, 28);
    geometry.rotateX(-Math.PI / 2);
    const vertices = geometry.attributes.position;
    const colors = [];
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i),
        z = vertices.getZ(i);
      const ridge = Math.pow(
        Math.abs(
          Math.sin(x * 0.031 + layer * 1.7) + 0.34 * Math.sin(x * 0.081 + 0.6),
        ),
        1.5,
      );
      const contour = Math.max(0, 1 - Math.pow(Math.abs(z) / 35, 1.4));
      const detail =
        Math.sin(x * 0.24 + z * 0.15) * 0.48 +
        Math.sin(x * 0.57 - z * 0.3) * 0.17;
      const y = (ridge * (8 + layer * 1.5) + 2) * contour + detail - 4;
      vertices.setY(i, y);
      const color = new THREE.Color("#435951").lerp(
        new THREE.Color("#6a7470"),
        Math.max(0, y) / 25,
      );
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const mountain = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    );
    mountain.position.set(layer * 13, -1, -210 - layer * 26);
    mountains.add(mountain);
  }
  const northGrove = createTrees(random, leaf, bark, snow, 40, {
    x: 28,
    z: -18,
    w: 24,
    d: 12,
    h: 5,
  });
  scene.add(northGrove);
  const westGrove = createTrees(random, leaf, bark, snow, 18, {
    x: -17,
    z: -13,
    w: 13,
    d: 16,
    h: 5,
  });
  scene.add(westGrove);
  const foregroundTrees = createTrees(random, leaf, bark, snow, 11, {
    x: 25,
    z: 14,
    w: 15,
    d: 6,
    h: 9,
  });
  scene.add(foregroundTrees);

  const lake = new Reflector(new THREE.PlaneGeometry(1000, 1000), {
    color: "#486470",
    textureWidth: mobile ? 384 : 768,
    textureHeight: mobile ? 384 : 768,
    multisample: 0,
    clipBias: 0.003,
  });
  lake.rotation.x = -Math.PI / 2;
  lake.position.y = -3.75;
  scene.add(lake);
  lake.material.uniforms.waveTime = { value: 0 };
  lake.material.uniforms.deepWater = { value: new THREE.Color("#345f68") };
  lake.material.vertexShader =
    "varying vec3 lakeWorld;\n" + lake.material.vertexShader;
  lake.material.vertexShader = lake.material.vertexShader.replace(
    "void main() {",
    "void main() { lakeWorld = (modelMatrix * vec4(position, 1.)).xyz;",
  );
  lake.material.fragmentShader = lake.material.fragmentShader
    .replace(
      "void main() {",
      "uniform float waveTime;\nuniform vec3 deepWater;\nvarying vec3 lakeWorld;\nvoid main() {",
    )
    .replace(
      "texture2DProj( tDiffuse, vUv )",
      "texture2DProj( tDiffuse, vUv + vec4(sin(vUv.y * 160.0 + waveTime * 0.4) * 0.002 * vUv.w, cos(vUv.x * 110.0 + waveTime * 0.3) * 0.001 * vUv.w, 0.0, 0.0) )",
    )
    .replace(
      "gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );",
      `float angle = 1. - abs(normalize(cameraPosition - lakeWorld).y);
       float fresnel = .02 + .98 * pow(angle, 5.);
       vec3 reflected = blendOverlay(base.rgb, color);
       gl_FragColor = vec4(mix(deepWater, reflected, .08 + fresnel * .84), 1.);`,
    );
  const lakeTint = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshBasicMaterial({
      color: "#1e3942",
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  lakeTint.rotation.x = -Math.PI / 2;
  lakeTint.position.y = -3.73;
  scene.add(lakeTint);
  const floorReflection = createFloorReflection(
    scene,
    physical.floor.normalMap,
    mobile,
  );
  // Never recursively render two planar reflectors into one another.
  const reflectors = [lake, floorReflection.mirror];
  reflectors.forEach((mirror) => {
    const renderReflection = mirror.onBeforeRender;
    mirror.onBeforeRender = function (...args) {
      const others = reflectors.filter((object) => object !== mirror);
      const visibility = others.map((object) => object.visible);
      others.forEach((object) => {
        object.visible = false;
      });
      renderReflection.apply(this, args);
      others.forEach((object, index) => {
        object.visible = visibility[index];
      });
    };
  });

  const glowTexture = makeTexture((ctx, size) => {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.08, "#ffffffbb");
    gradient.addColorStop(0.35, "#ffffff20");
    gradient.addColorStop(1, "#ffffff00");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
  const moonTexture = makeTexture((ctx, size) => {
    ctx.fillStyle = "#dcdacb";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 110; i++) {
      const x = random() * size,
        y = random() * size,
        radius = 2 + random() * 18;
      const crater = ctx.createRadialGradient(
        x - radius * 0.2,
        y - radius * 0.2,
        0,
        x,
        y,
        radius,
      );
      crater.addColorStop(0, "#727b792b");
      crater.addColorStop(0.8, "#969d9822");
      crater.addColorStop(1, "#e6e3cf00");
      ctx.fillStyle = crater;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const orbMaterial = new THREE.MeshBasicMaterial({
    color: "#f1e7c1",
    map: moonTexture,
    fog: false,
  });
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 40, 28),
    orbMaterial,
  );
  orb.position.set(-7, 14, -48);
  scene.add(orb);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: "#e1d5a9",
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  );
  halo.position.copy(orb.position);
  halo.scale.set(23, 23, 1);
  scene.add(halo);
  const starPositions = new Float32Array(420 * 3);
  for (let i = 0; i < 420; i++) {
    const a = random() * Math.PI * 2,
      y = random() * 0.8 + 0.1,
      r = Math.sqrt(1 - y * y);
    starPositions.set(
      [Math.cos(a) * r * 140, y * 140, Math.sin(a) * r * 140],
      i * 3,
    );
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3),
  );
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: "#e9e5cd",
      size: 0.24,
      transparent: true,
      opacity: 0.8,
      fog: false,
      depthWrite: false,
    }),
  );
  scene.add(stars);

  const fogTexture = makeTexture((ctx, size) => {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "#ffffff25");
    gradient.addColorStop(0.45, "#ffffff16");
    gradient.addColorStop(1, "#ffffff00");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
  const fogMaterial = new THREE.SpriteMaterial({
    map: fogTexture,
    color: "#adcbcc",
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const mists = [];
  for (let i = 0; i < 7; i++) {
    const mist = new THREE.Sprite(fogMaterial);
    mist.position.set(-16 + i * 8, -1.5 + random() * 2, 1 + random() * 15);
    mist.scale.set(30, 6, 1);
    scene.add(mist);
    mists.push(mist);
  }

  const particleCount = mobile ? 450 : 1000;
  const flakeTexture = makeTexture((ctx, size) => {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "#ffffffff");
    gradient.addColorStop(0.38, "#fffffff0");
    gradient.addColorStop(0.7, "#ffffff88");
    gradient.addColorStop(1, "#ffffff00");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }, 64);
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++)
    positions.set(
      [(random() - 0.5) * 75, random() * 45 - 3, (random() - 0.5) * 65],
      i * 3,
    );
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  const particleMaterial = new THREE.PointsMaterial({
    color: "#e5edf0",
    size: 0.13,
    map: glowTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  const rainPositions = new Float32Array(particleCount * 6);
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(rainPositions, 3),
  );
  const rainMaterial = new THREE.LineBasicMaterial({
    color: "#c0d3de",
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
  });
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  scene.add(rain);

  const palette = {
    night: {
      top: "#07121e",
      bottom: "#445e68",
      fog: "#2e4852",
      sun: "#b4cddd",
      ambient: 0.32,
      direct: 2.6,
      exposure: 1.08,
      orb: "#eee5c7",
    },
    day: {
      top: "#729db1",
      bottom: "#d9d9ba",
      fog: "#a5b8b3",
      sun: "#ffe8be",
      ambient: 0.6,
      direct: 3.5,
      exposure: 1.18,
      orb: "#fff1c5",
    },
    dawn: {
      top: "#647f95",
      bottom: "#d1ae94",
      fog: "#788b8e",
      sun: "#ffceb0",
      ambient: 0.42,
      direct: 2.9,
      exposure: 1.15,
      orb: "#ffe5bb",
    },
    dusk: {
      top: "#334c68",
      bottom: "#be997f",
      fog: "#6c7d80",
      sun: "#ffcc90",
      ambient: 0.38,
      direct: 3.1,
      exposure: 1.1,
      orb: "#ffd195",
    },
  };

  const journey = createJourneyArchitecture({
    scene,
    materials: { stone, trim, roof, glass, shadow },
    random,
    makeTexture,
    batchGroup,
    glowTexture,
    physical,
    loadingManager,
    invalidate: () => {
      dirty = true;
    },
  });
  const composer = mobile ? null : new EffectComposer(renderer);
  const bloom = composer
    ? new UnrealBloomPass(new THREE.Vector2(800, 600), 0.12, 0.35, 1.5)
    : null;
  if (composer) {
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  function update(next) {
    state = { ...next };
    const p = palette[state.light] || palette.night;
    skyUniforms.top.value.set(p.top);
    skyUniforms.bottom.value.set(p.bottom);
    scene.fog.color.set(p.fog);
    scene.fog.density =
      state.season === "rain"
        ? 0.014
        : state.season === "winter"
          ? 0.012
          : 0.009;
    sun.color.set(p.sun);
    sun.intensity = p.direct;
    hemisphere.intensity = p.ambient;
    renderer.toneMappingExposure = p.exposure;
    lake.material.uniforms.deepWater.value.set(
      state.light === "day"
        ? "#345f68"
        : state.light === "night"
          ? "#101f2c"
          : "#294750",
    );
    orbMaterial.color.set(p.orb);
    halo.material.color.set(p.orb);
    halo.material.opacity = state.light === "day" ? 0.55 : 0.33;
    const orbMap = state.light === "night" ? moonTexture : null;
    if (orbMaterial.map !== orbMap) {
      orbMaterial.map = orbMap;
      orbMaterial.needsUpdate = true;
    }
    stars.material.opacity =
      state.light === "night" ? 0.8 : state.light === "day" ? 0 : 0.13;
    orb.position.y = state.light === "dusk" || state.light === "dawn" ? 6 : 14;
    halo.position.copy(orb.position);
    snow.visible = state.season === "winter";
    [northGrove, westGrove, foregroundTrees].forEach((grove) =>
      grove.traverse((object) => {
        if (object.material?.userData.seasonalSnow)
          object.visible = state.season === "winter";
      }),
    );
    leaf.color.set(state.season === "summer" ? "#365742" : "#243c35");
    moss.color.set(
      state.season === "winter"
        ? "#acbdb2"
        : state.season === "summer"
          ? "#617352"
          : "#43594a",
    );
    roof.roughness = state.season === "rain" ? 0.4 : 0.7;
    glass.color
      .set(state.light === "day" ? "#84774e" : "#ffac4d")
      .multiplyScalar(state.light === "day" ? 0.8 : 1.25);
    glass.emissiveIntensity = state.light === "day" ? 0.15 : 1.4;
    fogMaterial.opacity = state.season === "summer" ? 0.18 : 0.5;
    rain.visible = state.season === "rain" && !state.reducedMotion;
    particles.visible = state.season !== "rain" && !state.reducedMotion;
    particleMaterial.color.set(
      state.season === "summer" ? "#f5d48c" : "#f0f5f5",
    );
    particleMaterial.map =
      state.season === "summer" ? glowTexture : flakeTexture;
    particleMaterial.size = state.season === "summer" ? 0.24 : 0.19;
    particleMaterial.opacity = state.season === "summer" ? 0.7 : 0.9;
    particleGeometry.setDrawRange(
      0,
      state.season === "summer" ? Math.floor(particleCount / 8) : particleCount,
    );
    lake.material.uniforms.color.value.set(
      state.light === "day" ? "#708e95" : "#455e6b",
    );
    lakeTint.material.opacity = state.light === "day" ? 0.32 : 0.45;
    dirty = true;
  }

  function resize() {
    const width = host.clientWidth,
      height = host.clientHeight;
    renderer.setSize(width, height, false);
    composer?.setSize(width, height);
    camera.aspect = width / height;
    camera.fov = width < 780 ? 58 : 48;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const onPointer = (event) => {
    if (!state.reducedMotion && event.pointerType !== "touch")
      pointer.set(
        (event.clientX / innerWidth - 0.5) * 2,
        (event.clientY / innerHeight - 0.5) * 2,
      );
  };
  const onScroll = () => {
    dirty = true;
  };
  const onVisibility = () => {
    visible = !document.hidden;
    if (!visible) journey.pauseMedia();
    dirty = true;
  };
  const onLost = (event) => {
    event.preventDefault();
    journey.pauseMedia();
    visible = false;
    host.parentElement.classList.remove("world--ready");
  };
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  let last = 0,
    elapsed = 0,
    lastProgress = -1,
    firstFrame = true;
  const desiredPosition = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();
  function draw(time) {
    if (disposed) return;
    frame = requestAnimationFrame(draw);
    if (!visible || time - last < (mobile ? 1000 / 30 : 1000 / 45)) return;
    const delta = Math.min((time - last) / 1000 || 0.016, 0.05);
    last = time;
    const progress = state.route?.current.progress || 0;
    if (progress !== lastProgress) dirty = true;
    if (state.reducedMotion && !dirty) return;
    if (!state.reducedMotion) elapsed += delta;
    const sceneProgress = state.reducedMotion ? Math.round(progress) : progress;
    const pose = journeyPose(sceneProgress, state.reducedMotion);
    const isSmall = window.innerWidth < 780;
    const px = state.reducedMotion ? 0 : pointer.x,
      py = state.reducedMotion ? 0 : pointer.y;
    desiredPosition.fromArray(pose.camera);
    desiredLook.fromArray(pose.look);
    if (isSmall && sceneProgress < 0.23) {
      const pullback =
        1 + 0.28 * (1 - THREE.MathUtils.smoothstep(sceneProgress, 0, 0.23));
      desiredPosition
        .sub(desiredLook)
        .multiplyScalar(pullback)
        .add(desiredLook);
    }
    desiredPosition.x += px * 0.22;
    desiredPosition.y -= py * 0.12;
    const ease =
      state.reducedMotion || firstFrame ? 1 : 1 - Math.exp(-delta * 7);
    camera.position.lerp(desiredPosition, ease);
    cameraTarget.lerp(desiredLook, ease);
    camera.lookAt(cameraTarget);
    sky.position.copy(camera.position);
    const blend = interiorBlend(camera.position.z);
    const outdoors = camera.position.z > -18;
    sky.visible = outdoors;
    scene.environment =
      blend < 0.5 ? physical.environment.outdoor : physical.environment.indoor;
    const outdoorIntensity =
      state.light === "day" ? 0.55 : state.light === "night" ? 0.1 : 0.22;
    scene.environmentIntensity = THREE.MathUtils.lerp(
      outdoorIntensity,
      0.6,
      blend,
    );
    floorReflection.update(sceneProgress, camera, state.season);
    sun.intensity = palette[state.light].direct * (1 - blend * 0.78);
    hemisphere.intensity = palette[state.light].ambient * (1 - blend * 0.55);
    [
      island,
      mountains,
      northGrove,
      westGrove,
      foregroundTrees,
      lake,
      lakeTint,
      orb,
      halo,
      stars,
      ...mists,
    ].forEach((object) => {
      object.visible = outdoors;
    });
    // Celestial billboards sit on the horizon of the ground-level view;
    // they must not appear as objects resting on roofs in the aerial shot.
    orb.visible = halo.visible = outdoors && camera.position.y < 50;
    stars.visible = outdoors && camera.position.y < 65;
    particles.visible =
      outdoors && state.season !== "rain" && !state.reducedMotion;
    rain.visible = outdoors && state.season === "rain" && !state.reducedMotion;
    scene.fog.color.set(palette[state.light].fog).lerp(interiorFog, blend);
    const aerial = THREE.MathUtils.smoothstep(camera.position.y, 18, 100);
    scene.fog.density = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(
        state.season === "rain" ? 0.0065 : 0.0035,
        state.season === "rain" ? 0.0025 : 0.0012,
        aerial,
      ),
      0.014,
      blend,
    );
    journey.update({
      progress: sceneProgress,
      pose,
      camera,
      time: elapsed,
      delta,
      reducedMotion: state.reducedMotion,
      light: state.light,
      season: state.season,
      exploring: state.route?.current.exploring,
    });
    host.dataset.journey = progress.toFixed(3);
    firstFrame = false;
    lastProgress = progress;
    lake.material.uniforms.waveTime.value = elapsed;
    if (!state.reducedMotion) {
      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        positions[index + 1] -=
          delta *
          (state.season === "rain"
            ? 16
            : state.season === "winter"
              ? 0.75 + (i % 7) * 0.12
              : -0.14);
        positions[index] +=
          delta *
          (state.season === "rain" ? -1.6 : Math.sin(elapsed * 0.5 + i) * 0.14);
        if (positions[index + 1] < -4) positions[index + 1] = 39;
        if (positions[index + 1] > 42) positions[index + 1] = -3;
        if (positions[index] < -39) positions[index] = 39;
        if (state.season === "rain") {
          rainPositions.set(
            [
              positions[index],
              positions[index + 1],
              positions[index + 2],
              positions[index] + 0.075,
              positions[index + 1] + 0.7,
              positions[index + 2],
            ],
            i * 6,
          );
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;
      if (rain.visible) rainGeometry.attributes.position.needsUpdate = true;
      mists.forEach((mist, index) => {
        mist.position.x += Math.sin(elapsed * 0.07 + index) * delta * 0.13;
      });
    }
    if (composer) composer.render(delta);
    else renderer.render(scene, camera);
    // Reveal only after decoded textures and the HDR probe have actually
    // appeared in a rendered frame, rather than after geometry creation.
    if (assetsReady && !readySent) {
      readySent = true;
      resolveReady();
    }
    dirty = false;
  }
  // Start at the final camera location; never fly in from the origin.
  camera.position.fromArray(
    journeyPose(state.route?.current.progress || 0).camera,
  );
  update(initial);
  resize();
  frame = requestAnimationFrame(draw);

  return {
    ready,
    update,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      const geometries = new Set(),
        materials = new Set(),
        textures = new Set([
          glowTexture,
          fogTexture,
          flakeTexture,
          moonTexture,
        ]);
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        for (const value of Object.values(m))
          if (value?.isTexture) textures.add(value);
        m.dispose();
      });
      textures.forEach((t) => t.dispose());
      lake.getRenderTarget().dispose();
      floorReflection.dispose();
      journey.dispose();
      physical.dispose();
      composer?.passes.forEach((pass) => pass.dispose?.());
      composer?.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
