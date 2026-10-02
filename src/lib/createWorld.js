import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { createJourneyArchitecture } from "./createJourneyArchitecture.js";
import { createCastleExterior } from "./createCastleExterior.js";
import { createHighlands } from "./createHighlands.js";
import { createGoldenSnitch } from "./createGoldenSnitch.js";
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
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
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
  const camera = new THREE.PerspectiveCamera(48, 1, 0.15, 1300);
  scene.fog = new THREE.FogExp2("#253d46", 0.012);
  const pointer = new THREE.Vector2();
  const cameraTarget = new THREE.Vector3();
  const interiorFog = new THREE.Color("#162226");
  const skyUniforms = {
    top: { value: new THREE.Color("#081723") },
    bottom: { value: new THREE.Color("#526671") },
    warmth: { value: new THREE.Color("#ead7ac") },
    daylight: { value: 1 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1100, 32, 20),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader:
        "varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader: `
        uniform vec3 top;
        uniform vec3 bottom;
        uniform vec3 warmth;
        uniform float daylight;
        varying vec3 vPosition;
        float hashSky(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noiseSky(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(hashSky(i),hashSky(i+vec2(1,0)),f.x),
            mix(hashSky(i+vec2(0,1)),hashSky(i+vec2(1,1)),f.x),f.y);
        }
        void main() {
          vec3 direction=normalize(vPosition);
          float h = clamp((direction.y + 0.10) * 3.4, 0.0, 1.0);
          vec3 color=mix(bottom, top, pow(h, 0.7));
          vec2 p=direction.xz/(max(direction.y,0.)+.3)*2.4;
          float cloud=noiseSky(p)*.55+noiseSky(p*2.07+4.)*.27+noiseSky(p*4.17)*.13+noiseSky(p*8.31)*.05;
          float cover=smoothstep(.38,.75,cloud)*smoothstep(-.03,.16,direction.y);
          color=mix(color, mix(top*.72,bottom*1.1,cloud), cover*.64);
          float glow=pow(max(0.,dot(direction,normalize(vec3(-250,118,-500)))),28.);
          color+=warmth*glow*.34*daylight;
          gl_FragColor = vec4(color, 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  );
  scene.add(sky);
  const hemisphere = new THREE.HemisphereLight("#b5ccd5", "#29363a", 1.4);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight("#bed8f0", 2.8);
  sun.position.set(-175, 155, -180);
  sun.target.position.set(5, 15, -59);
  scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.camera.left = -145;
  sun.shadow.camera.right = 145;
  sun.shadow.camera.top = 130;
  sun.shadow.camera.bottom = -130;
  sun.shadow.camera.far = 430;
  sun.shadow.normalBias = 0.075;
  sun.shadow.bias = -0.00015;
  sun.shadow.radius = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#96b2bf", 0.48);
  fill.position.set(85, 60, 90);
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
      float snowCover = snowNoise(vSnowPosition * .18) * .65
        + snowNoise(vSnowPosition * .48) * .25 + snowNoise(vSnowPosition * 1.1) * .1;
      diffuseColor.a *= smoothstep(.28, .72, snowCover);
      if (diffuseColor.a < .025) discard;
      diffuseColor.rgb *= .88 + snowCover * .12;
    `,
    );
  };
  const castle = createCastleExterior({
    materials: { stone, trim, roof, glass, shadow, snow },
    batchGroup,
    mobile,
  });
  scene.add(castle);
  const highlands = createHighlands({ makeTexture, random, mobile });
  scene.add(highlands.root);
  const snitch = createGoldenSnitch({ scene, batchGroup });

  const lake = new Reflector(new THREE.PlaneGeometry(1000, 1000), {
    color: "#486470",
    textureWidth: mobile ? 384 : 768,
    textureHeight: mobile ? 384 : 768,
    multisample: 0,
    clipBias: 0.003,
  });
  lake.rotation.x = -Math.PI / 2;
  lake.position.y = -26.5;
  scene.add(lake);
  lake.material.uniforms.waveTime = { value: 0 };
  lake.material.uniforms.deepWater = { value: new THREE.Color("#3b4e47") };
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
  lakeTint.position.y = -26.48;
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
  const orb = new THREE.Mesh(new THREE.SphereGeometry(9, 40, 28), orbMaterial);
  orb.position.set(-250, 118, -500);
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
  halo.scale.set(165, 165, 1);
  scene.add(halo);
  const starPositions = new Float32Array(420 * 3);
  for (let i = 0; i < 420; i++) {
    const a = random() * Math.PI * 2,
      y = random() * 0.8 + 0.1,
      r = Math.sqrt(1 - y * y);
    starPositions.set(
      [Math.cos(a) * r * 950, y * 950, Math.sin(a) * r * 950],
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
      size: 0.8,
      transparent: true,
      opacity: 0.8,
      fog: false,
      depthWrite: false,
    }),
  );
  scene.add(stars);

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
      top: "#657d87",
      bottom: "#d5caae",
      fog: "#a6b2af",
      sun: "#ffe3ad",
      ambient: 0.48,
      direct: 4.5,
      exposure: 1.05,
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
  const occlusion = composer ? new GTAOPass(scene, camera, 800, 600) : null;
  if (occlusion) {
    occlusion.blendIntensity = 0.82;
    occlusion.updateGtaoMaterial({
      radius: 4,
      thickness: 1.8,
      distanceFallOff: 0.75,
      samples: 12,
    });
    occlusion.updatePdMaterial({ samples: 8, radius: 4 });
    // Alpha-tested foliage, mist and reflectors must not become opaque
    // cards in the normal/depth pass. Their shading remains in the color pass.
    const exclusions = [sky, lake, lakeTint, snitch.root];
    scene.traverse((object) => {
      if (
        object.isSprite ||
        object.isPoints ||
        object.isLine ||
        (object.isMesh &&
          (object.material?.alphaTest > 0 || object.material?.transparent))
      )
        exclusions.push(object);
    });
    const renderAO = occlusion.render.bind(occlusion);
    occlusion.render = (...args) => {
      const saved = exclusions.map((object) => object.visible);
      exclusions.forEach((object) => {
        object.visible = false;
      });
      try {
        renderAO(...args);
      } finally {
        exclusions.forEach((object, i) => {
          object.visible = saved[i];
        });
      }
    };
  }
  if (composer) {
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(occlusion);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  function update(next) {
    state = { ...next };
    const p = palette[state.light] || palette.night;
    skyUniforms.top.value.set(p.top);
    skyUniforms.bottom.value.set(p.bottom);
    skyUniforms.warmth.value.set(p.orb);
    skyUniforms.daylight.value = state.light === "night" ? 0.08 : 1;
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
    fill.intensity =
      state.light === "day" ? 0.48 : state.light === "night" ? 0.13 : 0.3;
    renderer.toneMappingExposure = p.exposure;
    lake.material.uniforms.deepWater.value.set(
      state.light === "day"
        ? "#3b4e47"
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
    orb.position.y =
      state.light === "dusk" || state.light === "dawn" ? 65 : 118;
    halo.position.copy(orb.position);
    snow.visible = state.season === "winter";
    roof.roughness = state.season === "rain" ? 0.4 : 0.7;
    glass.color
      .set(state.light === "day" ? "#45534f" : "#ffac4d")
      .multiplyScalar(state.light === "day" ? 0.8 : 1.25);
    glass.emissiveIntensity = state.light === "day" ? 0.035 : 1.2;
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
    occlusion?.setSize(Math.round(width * 0.75), Math.round(height * 0.75));
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
        1 +
        Math.max(0, 0.84 / camera.aspect - 1) *
          (1 - THREE.MathUtils.smoothstep(sceneProgress, 0, 0.23));
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
    [castle, lake, lakeTint, orb, halo, stars].forEach((object) => {
      object.visible = outdoors;
    });
    orb.visible = halo.visible = outdoors;
    stars.visible = outdoors;
    highlands.update({
      light: state.light,
      season: state.season,
      time: elapsed,
      outdoors,
      camera,
    });
    if (occlusion)
      occlusion.gtaoMaterial.uniforms.radius.value = THREE.MathUtils.lerp(
        4,
        0.85,
        blend,
      );
    particles.visible =
      outdoors && state.season !== "rain" && !state.reducedMotion;
    rain.visible = outdoors && state.season === "rain" && !state.reducedMotion;
    scene.fog.color.set(palette[state.light].fog).lerp(interiorFog, blend);
    const aerial = THREE.MathUtils.smoothstep(camera.position.y, 18, 100);
    scene.fog.density = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(
        state.season === "rain" ? 0.0065 : 0.0035,
        state.season === "rain" ? 0.0021 : 0.00095,
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
    snitch.update({
      camera,
      time: elapsed,
      delta,
      progress: sceneProgress,
      reducedMotion: state.reducedMotion,
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
        textures = new Set([glowTexture, flakeTexture, moonTexture]);
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
