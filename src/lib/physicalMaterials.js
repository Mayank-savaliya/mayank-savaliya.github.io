import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

// Scanned CC0 surfaces. Color is sRGB; normals and packed AO/roughness are data.
export function createPhysicalMaterials(renderer, invalidate, loadingManager) {
  const textures = new Set();
  let disposed = false;
  const loader = new THREE.TextureLoader(loadingManager);
  const base = `${import.meta.env.BASE_URL}materials/`;
  function texture(name, color = false) {
    const map = loader.load(base + name, () => {
      if (disposed) map.dispose();
      else invalidate();
    });
    map.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.add(map);
    return map;
  }
  function surface(name, size, options = {}) {
    const arm = texture(`${name}-arm.jpg`);
    const material = new THREE.MeshPhysicalMaterial({
      map: texture(`${name}-color.jpg`, true),
      normalMap: texture(`${name}-normal.jpg`),
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: arm,
      aoMap: arm,
      aoMapIntensity: 0.65,
      roughness: 1,
      metalness: 0,
      ...options,
    });
    material.userData.textureSize = size;
    return material;
  }
  const stone = surface("stone", 2, { color: "#c8c1b5" });
  const roof = surface("slate", 3, { color: "#68747e", roughness: 0.88 });
  const floor = surface("floor", 2.3, {
    color: "#c4beb0",
    roughness: 0.66,
    clearcoat: 0.12,
    clearcoatRoughness: 0.35,
  });
  const trim = stone.clone();
  trim.color.set("#b6b0a0");
  trim.userData.textureSize = 1.5;
  // Real transmission through glass, including subtle spectral separation.
  const crystal = new THREE.MeshPhysicalMaterial({
    color: "#f6e9ce",
    roughness: 0.1,
    metalness: 0,
    transmission: 0.92,
    thickness: 0.12,
    ior: 1.5,
    dispersion: 0.12,
    attenuationColor: "#d7dcca",
    attenuationDistance: 6,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  let skyTarget;
  const environment = { outdoor: null, indoor: null };
  new HDRLoader(loadingManager).load(base + "cloudy-sky.hdr", (hdr) => {
    if (disposed) {
      hdr.dispose();
      return;
    }
    skyTarget = pmrem.fromEquirectangular(hdr);
    environment.outdoor = skyTarget.texture;
    hdr.dispose();
    invalidate();
  });
  // An HDR light probe with the same long hall and warm sconces as the rooms.
  // It provides indirect light and roughness-filtered metal/glass reflections.
  const probe = new THREE.Scene();
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(16, 15, 40),
    new THREE.MeshBasicMaterial({ color: "#131b22", side: THREE.BackSide }),
  );
  probe.add(shell);
  for (const side of [-1, 1]) {
    for (const z of [-14, -6, 2, 10]) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 1.3),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#ffc177").multiplyScalar(5),
        }),
      );
      panel.position.set(side * 7.8, -1, z);
      panel.rotation.y = (-side * Math.PI) / 2;
      probe.add(panel);
      const window = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 5),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#97bace").multiplyScalar(1.8),
        }),
      );
      window.position.set(side * 7.9, 2.4, z - 3);
      window.rotation.y = (-side * Math.PI) / 2;
      probe.add(window);
    }
  }
  const hallTarget = pmrem.fromScene(probe, 0.04, 0.1, 60);
  environment.indoor = hallTarget.texture;
  probe.traverse((object) => {
    object.geometry?.dispose();
    object.material?.dispose();
  });
  return {
    stone,
    trim,
    roof,
    floor,
    crystal,
    environment,
    dispose() {
      disposed = true;
      textures.forEach((map) => map.dispose());
      skyTarget?.dispose();
      hallTarget.dispose();
      pmrem.dispose();
    },
  };
}

// Bake metre-scale planar UVs into each face before batching. This avoids
// stretching a single masonry image across an entire wall or buttress.
export function projectSurfaceUVs(geometry, material, scale = 1) {
  const size = material.userData.textureSize;
  if (!size || !geometry.attributes.uv) return;
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  for (let face = 0; face < position.count; face += 3) {
    const nx = Math.abs(
      normal.getX(face) + normal.getX(face + 1) + normal.getX(face + 2),
    );
    const ny = Math.abs(
      normal.getY(face) + normal.getY(face + 1) + normal.getY(face + 2),
    );
    const nz = Math.abs(
      normal.getZ(face) + normal.getZ(face + 1) + normal.getZ(face + 2),
    );
    for (let i = face; i < face + 3; i++) {
      const x = (position.getX(i) * scale) / size;
      const y = (position.getY(i) * scale) / size;
      const z = (position.getZ(i) * scale) / size;
      uv.setXY(
        i,
        ny >= nx && ny >= nz ? x : nx > nz ? z : x,
        ny >= nx && ny >= nz ? z : y,
      );
    }
  }
}
