import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Continuous, deterministic terrain — no flat oval plinth beneath the school.
function hash(x, z) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise(x, z) {
  const ix = Math.floor(x),
    iz = Math.floor(z);
  let u = x - ix,
    v = z - iz;
  u = u * u * (3 - 2 * u);
  v = v * v * (3 - 2 * v);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), u),
    THREE.MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), u),
    v,
  );
}
function fbm(x, z) {
  return (
    noise(x, z) * 0.55 +
    noise(x * 2.07 + 13, z * 2.07) * 0.26 +
    noise(x * 4.13, z * 4.13 + 8) * 0.13 +
    noise(x * 8.21, z * 8.21) * 0.06
  );
}

export function createHighlands({ makeTexture, random, mobile }) {
  const root = new THREE.Group();
  root.name = "Highland cliffs, lake gorge and forests";
  const rockMap = makeTexture((ctx, size) => {
    const pixels = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const p = (y * size + x) * 4;
        const v = fbm(x / 48, y / 32);
        const seam = Math.pow(
          Math.abs(Math.sin(y * 0.15 + noise(x / 34, y / 48) * 3)),
          18,
        );
        const c = 140 + v * 65 - seam * 18 + (hash(x, y) - 0.5) * 24;
        pixels.data.set([c * 0.96, c, c * 0.93, 255], p);
      }
    }
    ctx.putImageData(pixels, 0, 0);
  }, 256);
  rockMap.wrapS = rockMap.wrapT = THREE.RepeatWrapping;
  const terrainMaterial = new THREE.MeshStandardMaterial({
    map: rockMap,
    bumpMap: rockMap,
    bumpScale: 0.28,
    roughness: 0.98,
    vertexColors: true,
  });
  const stone = new THREE.Color("#737969"),
    grass = new THREE.Color("#546748");
  const lowerRock = new THREE.Color("#444f4b"),
    paleRock = new THREE.Color("#a3a18a");
  const terrainGeometries = [];

  function finish(geometry, name) {
    geometry.computeVertexNormals();
    const p = geometry.attributes.position,
      n = geometry.attributes.normal;
    const colors = [],
      uvs = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const mottling = fbm(x * 0.12, z * 0.12 + y * 0.065);
      const c = stone.clone().lerp(lowerRock, (1 - mottling) * 0.6);
      c.lerp(grass, THREE.MathUtils.smoothstep(n.getY(i), 0.3, 0.9) * 0.88);
      c.lerp(paleRock, THREE.MathUtils.smoothstep(y, 70, 160) * 0.72);
      c.multiplyScalar(0.77 + mottling * 0.43);
      colors.push(c.r, c.g, c.b);
      const vertical = Math.abs(n.getY(i)) < 0.55;
      uvs.push(
        (Math.abs(n.getX(i)) > 0.7 ? z : x) / 13,
        (vertical ? y : z) / 13,
      );
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    terrainGeometries.push({ geometry, colors: new Float32Array(colors) });
    const mesh = new THREE.Mesh(geometry, terrainMaterial);
    mesh.name = name;
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  }
  function peninsula(cx, cz, rx, rz, top, base, name) {
    const segments = mobile ? 144 : 224,
      rings = 16;
    const vertices = [],
      indices = [];
    function outline(a) {
      return (
        1 +
        Math.sin(a * 3 + 0.3) * 0.095 +
        Math.cos(a * 7 + 0.7) * 0.042 +
        Math.sin(a * 13) * 0.023 +
        Math.sin(a * 23 - 0.4) * 0.013
      );
    }
    // Continuous surface, flat only where the walking garden and rooms stand.
    for (let row = 0; row <= rings; row++) {
      const f = row / rings;
      for (let j = 0; j <= segments; j++) {
        const a = (j / segments) * Math.PI * 2,
          edge = outline(a);
        const x = cx + Math.cos(a) * rx * f * edge;
        const z = cz + Math.sin(a) * rz * f * edge;
        const bank = THREE.MathUtils.smoothstep(f, 0.58, 0.97);
        const y = top + bank * (fbm(x * 0.065, z * 0.065) * 7 - 2.8);
        vertices.push(x, y, z);
      }
    }
    // Rock strata flare irregularly into the water, rather than a smooth
    // cylinder. Shared angular coordinates keep the plateau watertight.
    for (let row = 1; row <= 14; row++) {
      const t = row / 14;
      for (let j = 0; j <= segments; j++) {
        const a = (j / segments) * Math.PI * 2,
          edge = outline(a);
        const fold =
          Math.sin(a * 19 + t * 1.7) * 0.027 + Math.cos(a * 31 - t * 3) * 0.009;
        const radius =
          edge +
          t * 0.09 +
          Math.sin(t * 27 + a * 4) * 0.012 +
          fold * Math.sin(t * Math.PI);
        const x = cx + Math.cos(a) * rx * radius,
          z = cz + Math.sin(a) * rz * radius;
        const lipY =
          top +
          (fbm(
            (cx + Math.cos(a) * rx * edge) * 0.065,
            (cz + Math.sin(a) * rz * edge) * 0.065,
          ) *
            7 -
            2.8);
        const y = THREE.MathUtils.lerp(lipY, base, t);
        vertices.push(x, y, z);
      }
    }
    for (let row = 0; row < rings + 14; row++) {
      for (let j = 0; j < segments; j++) {
        const a = row * (segments + 1) + j,
          b = a + segments + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setIndex(indices);
    return finish(geometry, name);
  }
  peninsula(
    1,
    -60,
    72,
    132,
    -2.54,
    -36,
    "School headland and fractured cliff face",
  );
  peninsula(160, -107, 42, 66, 0.7, -38, "Woodland bridge landing");
  peninsula(-42, -71, 37, 53, 9.9, -34, "Elevated western castle promontory");

  // Angular outcrops break the cliff into weathered buttresses, with
  // local fractures and talus at the foot of the rock face.
  for (let i = 0; i < (mobile ? 44 : 72); i++) {
    const a = i * 2.39996;
    const edge =
      1 + Math.sin(a * 3 + 0.3) * 0.095 + Math.cos(a * 7 + 0.7) * 0.042;
    const cx = 1 + Math.cos(a) * 72 * edge,
      cz = -60 + Math.sin(a) * 132 * edge;
    const g = new THREE.DodecahedronGeometry(1, 1);
    const p = g.attributes.position;
    const sx = 3 + random() * 4,
      sy = 8 + random() * 9,
      sz = 3 + random() * 5;
    for (let j = 0; j < p.count; j++) {
      const x = p.getX(j),
        y = p.getY(j),
        z = p.getZ(j);
      const fracture = 1 + noise(x * 6 + i, z * 5 + y * 4) * 0.27;
      p.setXYZ(j, cx + x * sx * fracture, -19 + y * sy, cz + z * sz * fracture);
    }
    finish(g, "Fractured cliff outcrop");
  }

  // Real 3D hills wrap around the lake, so camera descent has parallax.
  // Each bank is sampled from the same function used to plant its trees.
  const banks = [];
  function bank(name, cx, cz, width, depth, height, seed) {
    const nx = mobile ? 76 : 112,
      nz = mobile ? 52 : 76;
    const geometry = new THREE.PlaneGeometry(width, depth, nx, nz);
    geometry.rotateX(-Math.PI / 2);
    function elevation(x, z) {
      const xx = (x - cx) / (width * 0.5),
        zz = (z - cz) / (depth * 0.5);
      const edge =
        Math.pow(Math.max(0, 1 - xx * xx), 0.85) *
        Math.pow(Math.max(0, 1 - zz * zz), 0.9);
      const saddle =
        seed === 5 || seed === 26
          ? 0.38 + 0.62 * THREE.MathUtils.smoothstep(Math.abs(x - 65), 45, 265)
          : 1;
      const ridge = (0.45 + fbm(x * 0.011 + seed, z * 0.011) * 0.9) * saddle;
      const gullies = Math.abs(noise(x * 0.047 + seed, z * 0.025) - 0.5) * 17;
      return (
        -31 + edge * (height * ridge + gullies + fbm(x * 0.16, z * 0.16) * 4)
      );
    }
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx,
        z = pos.getZ(i) + cz;
      pos.setXYZ(i, x, elevation(x, z), z);
    }
    finish(geometry, name);
    banks.push({ cx, cz, width, depth, elevation });
  }
  bank("Western wooded shore", -157, -71, 138, 333, 91, 12);
  bank("Eastern ravine ridge", 230, -91, 171, 355, 134, 34);
  bank("Northern mountain range", 0, -337, 620, 240, 151, 5);
  bank("Distant highland peaks", -60, -499, 890, 249, 213, 26);

  // One terrain draw call, including the cliff outcrops. Keep the merged
  // color buffer so winter changes affect the geometry actually rendered.
  const pieces = terrainGeometries.map(({ geometry }) =>
    geometry.index ? geometry.toNonIndexed() : geometry.clone(),
  );
  const terrain = mergeGeometries(pieces);
  pieces.forEach((g) => g.dispose());
  terrainGeometries.forEach(({ geometry }) => geometry.dispose());
  terrainGeometries.length = 0;
  terrainGeometries.push({
    geometry: terrain,
    colors: new Float32Array(terrain.attributes.color.array),
  });
  root.clear();
  const terrainMesh = new THREE.Mesh(terrain, terrainMaterial);
  terrainMesh.name = "Fractured headland and surrounding mountain banks";
  terrainMesh.castShadow = terrainMesh.receiveShadow = true;
  root.add(terrainMesh);

  const needles = makeTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = "#b4b49d";
    ctx.lineWidth = size * 0.012;
    ctx.beginPath();
    ctx.moveTo(size / 2, size);
    ctx.lineTo(size / 2, 0);
    ctx.stroke();
    for (let i = 0; i < 8700; i++) {
      const t = random();
      const tier = (t * 13) % 1;
      const envelope = (0.025 + t * 0.4) * (1 - tier * 0.71);
      const x = size * (0.5 + (random() - 0.5) * envelope * 2);
      const y = size * (0.035 + t * 0.89);
      const green = 100 + Math.floor(random() * 85);
      ctx.strokeStyle = `rgba(${green * 0.87},${green},${green * 0.8},.95)`;
      ctx.lineWidth = 1.1 + random() * 2.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (x - size / 2) * 0.16, y + 3 + random() * 7);
      ctx.stroke();
    }
  }, 256);
  const foliage = new THREE.MeshStandardMaterial({
    map: needles,
    color: "#a7b598",
    roughness: 0.97,
    side: THREE.DoubleSide,
    alphaTest: 0.48,
  });
  const cards = [];
  for (let tier = 0; tier < 8; tier++) {
    const fraction = tier / 8;
    for (let branch = 0; branch < 5; branch++) {
      const angle = branch * Math.PI * 0.4 + tier * 1.73;
      const r = 0.24 * (1 - fraction);
      const card = new THREE.PlaneGeometry(0.54 * (1 - fraction) + 0.07, 0.26);
      card.rotateX(0.24 + (tier % 3) * 0.11);
      card.rotateY(angle);
      card.translate(
        Math.sin(angle) * r,
        0.2 + tier * 0.104,
        Math.cos(angle) * r,
      );
      cards.push(card);
    }
  }
  const treeGeometry = mergeGeometries(cards);
  cards.forEach((g) => g.dispose());
  const treeCount = mobile ? 1350 : 2700;
  const trees = new THREE.InstancedMesh(treeGeometry, foliage, treeCount);
  trees.name = "Irregular conifer forest";
  trees.castShadow = trees.receiveShadow = true;
  const trunkGeometry = new THREE.CylinderGeometry(0.002, 0.018, 1, 7);
  trunkGeometry.translate(0, 0.5, 0);
  const trunks = new THREE.InstancedMesh(
    trunkGeometry,
    new THREE.MeshStandardMaterial({ color: "#4a4d3d", roughness: 1 }),
    treeCount,
  );
  trunks.name = "Conifer trunks";
  trunks.instanceMatrix = trees.instanceMatrix;
  trunks.castShadow = trunks.receiveShadow = true;
  const dummy = new THREE.Object3D(),
    color = new THREE.Color();
  let treeIndex = 0;
  function plant(x, y, z, height) {
    if (treeIndex >= treeCount) return;
    dummy.position.set(x, y, z);
    dummy.rotation.set(
      (random() - 0.5) * 0.08,
      random() * Math.PI,
      (random() - 0.5) * 0.07,
    );
    dummy.scale.set(height * (0.48 + random() * 0.13), height, height * 0.56);
    dummy.updateMatrix();
    trees.setMatrixAt(treeIndex, dummy.matrix);
    color.setHSL(
      0.23 + random() * 0.07,
      0.12 + random() * 0.2,
      0.24 + random() * 0.23,
    );
    trees.setColorAt(treeIndex++, color);
  }
  for (let i = 0; i < treeCount * 1.2 && treeIndex < treeCount * 0.72; i++) {
    const b = banks[i % 3];
    const x = b.cx + (random() - 0.5) * b.width * 0.91,
      z = b.cz + (random() - 0.5) * b.depth * 0.88;
    const y = b.elevation(x, z);
    if (y < -22 || y > 95) continue;
    plant(x, y - 0.25, z, 5.8 + random() * 9);
  }
  // Woodland beyond the bridge, plus vegetation on the campus banks.
  for (let i = 0; i < treeCount * 0.16; i++) {
    const a = random() * Math.PI * 2,
      r = 0.35 + random() * 0.5;
    const x = 162 + Math.cos(a) * 36 * r,
      z = -109 + Math.sin(a) * 58 * r;
    if (Math.abs(z + 83) < 6 && x < 142) continue;
    plant(x, 0.5, z, 5 + random() * 9);
  }
  for (let i = 0; i < treeCount * 0.16; i++) {
    const a = random() * Math.PI * 2;
    const x = Math.cos(a) * (58 + random() * 8),
      z = -60 + Math.sin(a) * (111 + random() * 11);
    if ((z > -3 && Math.abs(x) < 27) || (x > 30 && z > -105 && z < -61))
      continue;
    const onCape = ((x + 42) / 37) ** 2 + ((z + 71) / 53) ** 2 < 0.95;
    plant(x, onCape ? 9.9 : -2.2, z, 4.5 + random() * 5.5);
  }
  trees.count = treeIndex;
  trees.instanceMatrix.needsUpdate = true;
  trees.instanceColor.needsUpdate = true;
  root.add(trees);
  trunks.count = treeIndex;
  root.add(trunks);

  // Low, noisy banks of mist are a local layer around the cliffs, rather
  // than a uniform veil over all of the architecture.
  const mistMap = makeTexture((ctx, size) => {
    const pixels = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x / size) * 2 - 1,
          dy = (y / size) * 2 - 1;
        const falloff = Math.pow(Math.max(0, 1 - dx * dx - dy * dy), 1.6);
        const vapor = fbm(x / 23, y / 34);
        const p = (y * size + x) * 4;
        pixels.data.set([255, 255, 255, falloff * vapor * 200], p);
      }
    }
    ctx.putImageData(pixels, 0, 0);
  }, 256);
  const mistMaterial = new THREE.SpriteMaterial({
    map: mistMap,
    color: "#d0d8c9",
    opacity: 0.47,
    transparent: true,
    depthWrite: false,
  });
  const valleyMist = mistMaterial.clone();
  const wisps = [];
  for (let i = 0; i < (mobile ? 16 : 28); i++) {
    const sprite = new THREE.Sprite(i < 7 ? valleyMist : mistMaterial);
    const a = i * 2.39996,
      radius = 82 + random() * 100;
    sprite.position.set(
      Math.cos(a) * radius + 16,
      -13 + random() * 18,
      -65 + Math.sin(a) * radius,
    );
    sprite.scale.set(70 + random() * 85, 10 + random() * 17, 1);
    if (i < 7) {
      sprite.position.set(-45 + i * 20, -5 + random() * 9, 20 + random() * 82);
      sprite.scale.set(100 + random() * 58, 36 + random() * 32, 1);
    }
    sprite.userData.origin = sprite.position.clone();
    wisps.push(sprite);
    root.add(sprite);
  }
  let previousSeason;
  return {
    root,
    update({ light, season, time, outdoors, camera }) {
      root.visible = outdoors;
      if (!outdoors) return;
      mistMaterial.color.set(
        light === "night" ? "#7a9caf" : light === "day" ? "#dddccd" : "#d9c6b2",
      );
      mistMaterial.opacity =
        season === "summer" ? 0.24 : season === "rain" ? 0.45 : 0.38;
      valleyMist.color.copy(mistMaterial.color);
      valleyMist.opacity =
        (season === "summer" ? 0.63 : 0.8) *
        THREE.MathUtils.smoothstep(camera.position.y, 12, 75);
      wisps.forEach((w, i) => {
        w.position.x =
          w.userData.origin.x + Math.sin(time * 0.021 + i * 0.6) * 8;
        w.position.z = w.userData.origin.z + Math.cos(time * 0.015 + i) * 5;
      });
      if (season !== previousSeason) {
        foliage.color.set(season === "winter" ? "#c5cec5" : "#a7b598");
        for (const { geometry, colors } of terrainGeometries) {
          const output = geometry.attributes.color,
            n = geometry.attributes.normal;
          for (let i = 0; i < output.count; i++) {
            const coverage =
              season === "winter"
                ? THREE.MathUtils.smoothstep(n.getY(i), 0.57, 0.95) * 0.74
                : 0;
            output.setXYZ(
              i,
              THREE.MathUtils.lerp(colors[i * 3], 0.74, coverage),
              THREE.MathUtils.lerp(colors[i * 3 + 1], 0.8, coverage),
              THREE.MathUtils.lerp(colors[i * 3 + 2], 0.79, coverage),
            );
          }
          output.needsUpdate = true;
        }
        previousSeason = season;
      }
    },
  };
}
