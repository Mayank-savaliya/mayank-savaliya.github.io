import * as THREE from "three";
import { entrance } from "./entrance.js";

// The garden and the hall share a real, unobstructed doorway. Nothing in
// this set is swapped out while the camera walks through the threshold.
export function createCastleEntrance({
  scene,
  outside,
  mesh,
  box,
  cylinder,
  arch,
  windowShape,
  lamp,
  stone,
  trim,
  roof,
  brass,
  iron,
  wood,
  glass,
  paving,
  random,
  makeTexture,
  batchGroup,
}) {
  const { gardenY: ground, gateZ, stairBottomZ, stairTopZ, steps } = entrance;
  outside.name = "The gardens, twelve steps and open grand entrance";
  const plants = new THREE.Group();
  plants.name = "Garden foliage and butterflies";
  scene.add(plants);

  const lawnMap = makeTexture((ctx, size) => {
    ctx.fillStyle = "#637148";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 19000; i++) {
      ctx.strokeStyle = ["#788953", "#4f613b", "#82915b", "#56663c"][i % 4];
      const x = random() * size,
        y = random() * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + random() * 2 - 1, y - 1 - random() * 3);
      ctx.stroke();
    }
  }, 256);
  lawnMap.wrapS = lawnMap.wrapT = THREE.RepeatWrapping;
  const lawn = new THREE.MeshStandardMaterial({
    map: lawnMap,
    bumpMap: lawnMap,
    bumpScale: 0.018,
    color: "#92af6b",
    roughness: 0.97,
  });
  lawn.userData.textureSize = 3;
  const foliage = new THREE.MeshStandardMaterial({
    color: "#526d35",
    roughness: 0.87,
    side: THREE.DoubleSide,
  });
  const darkLeaf = foliage.clone();
  darkLeaf.color.set("#334e2c");
  darkLeaf.map = lawnMap;
  darkLeaf.bumpMap = lawnMap;
  darkLeaf.bumpScale = 0.035;
  const twig = new THREE.MeshStandardMaterial({
    color: "#625642",
    roughness: 1,
  });
  const frost = new THREE.MeshStandardMaterial({
    color: "#dfe6d9",
    roughness: 0.95,
  });
  const snowCaps = new THREE.Group();
  snowCaps.name = "Winter dusting on the garden borders";
  scene.add(snowCaps);
  const petalMaterials = ["#cfb7d8", "#f0e7c1", "#aa9ccc", "#deb5b3"].map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.78,
        side: THREE.DoubleSide,
      }),
  );
  const shrub = new THREE.SphereGeometry(1, 18, 12);
  const positions = shrub.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    const r = 1 + 0.09 * Math.sin(x * 17 + y * 13) * Math.cos(z * 15 - x * 9);
    positions.setXYZ(i, x * r, y * r, z * r);
  }
  shrub.computeVertexNormals();
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.12);
  leafShape.quadraticCurveTo(0.12, 0.025, 0, 0.18);
  leafShape.quadraticCurveTo(-0.09, 0.035, 0, -0.12);
  const leafGeometry = new THREE.ShapeGeometry(leafShape, 4);
  const leaves = new THREE.InstancedMesh(leafGeometry, foliage, 4200);
  leaves.castShadow = leaves.receiveShadow = true;
  plants.add(leaves);
  const dummy = new THREE.Object3D();
  let leafIndex = 0;
  function bush(x, y, z, rx, ry, rz, material = darkLeaf) {
    const crown = mesh(outside, shrub, material, x, y, z);
    crown.scale.set(rx, ry, rz);
    for (let i = 0; i < 46 && leafIndex < leaves.instanceMatrix.count; i++) {
      const theta = random() * Math.PI * 2,
        v = random() * 2 - 1;
      const radial = Math.sqrt(1 - v * v);
      dummy.position.set(
        x + Math.cos(theta) * radial * rx,
        y + v * ry,
        z + Math.sin(theta) * radial * rz,
      );
      dummy.rotation.set(random() * Math.PI, theta, random() * Math.PI);
      dummy.scale.setScalar(0.75 + random() * 0.8);
      dummy.updateMatrix();
      leaves.setMatrixAt(leafIndex, dummy.matrix);
      leaves.setColorAt(
        leafIndex++,
        new THREE.Color().setHSL(
          0.22 + random() * 0.07,
          0.3 + random() * 0.2,
          0.2 + random() * 0.13,
        ),
      );
    }
  }

  // Broad lawns enclose a paved central walk, with crossing paths and
  // planted parterres rather than railings along a narrow causeway.
  box(outside, 0, ground - 0.55, 31, 37, 1, 72, stone);
  box(outside, 0, ground - 0.06, 31, 36, 0.12, 72, lawn);
  box(outside, 0, ground + 0.018, 38, 8.6, 0.06, 52, paving);
  for (const z of [23, 33])
    box(outside, 0, ground + 0.015, z, 30, 0.055, 2.5, paving);
  for (const side of [-1, 1]) {
    box(outside, side * 4.43, ground + 0.1, 39, 0.24, 0.2, 54, trim);
    box(outside, side * 17.4, ground + 0.35, 32, 0.6, 0.7, 68, stone);
    for (const z of [17, 28, 37, 48, 59])
      lamp(outside, side * 4.85, z, 3.8, ground);
    for (const z of [17.5, 28, 37, 48, 58]) {
      box(outside, side * 8.5, ground + 0.08, z, 5.7, 0.16, 6.5, trim);
      box(outside, side * 8.5, ground + 0.17, z, 5.3, 0.16, 6.1, lawn);
      for (const x of [6.1, 10.9]) {
        bush(side * x, ground + 0.59, z, 0.48, 0.53, 2.8);
        const cap = mesh(snowCaps, shrub, frost, side * x, ground + 0.98, z);
        cap.scale.set(0.4, 0.09, 2.75);
      }
      for (const dz of [-2.7, 2.7])
        bush(side * 8.5, ground + 0.55, z + dz, 2, 0.48, 0.48);
      // Flower stems and small, imperfect petals read at walking distance.
      for (let f = 0; f < 17; f++) {
        const x = side * (6.8 + random() * 3.3),
          zz = z - 2 + random() * 4;
        const y = ground + 0.42 + random() * 0.44;
        const stem = mesh(
          outside,
          new THREE.CylinderGeometry(0.012, 0.018, y - ground, 5),
          foliage,
          x,
          (y + ground) / 2,
          zz,
        );
        stem.rotation.z = (random() - 0.5) * 0.18;
        for (let petal = 0; petal < 5; petal++) {
          const a = petal * Math.PI * 0.4;
          const flower = mesh(
            outside,
            shrub,
            petalMaterials[f % 4],
            x + Math.cos(a) * 0.075,
            y,
            zz + Math.sin(a) * 0.075,
          );
          flower.scale.set(0.105, 0.035, 0.065);
          flower.rotation.y = -a;
        }
      }
    }
    for (const z of [12, 24, 36, 51, 63]) {
      cylinder(outside, side * 13.4, ground + 1.5, z, 0.14, 3, twig, 0.1);
      for (let tier = 0; tier < 4; tier++)
        bush(
          side * 13.4,
          ground + 1.9 + tier * 0.68,
          z,
          1.15 - tier * 0.2,
          1.07,
          1.1 - tier * 0.19,
        );
    }
    // Small stone benches sit off the clear walking line.
    for (const z of [23, 33]) {
      box(outside, side * 13.1, ground + 0.75, z, 3.1, 0.18, 0.9, trim);
      for (const dx of [-1, 1])
        box(
          outside,
          side * 13.1 + dx,
          ground + 0.36,
          z,
          0.34,
          0.72,
          0.65,
          stone,
        );
    }

    // The outer iron gates open well before the camera reaches them.
    cylinder(outside, side * 5.7, ground + 3.8, gateZ, 0.85, 7.6, stone, 0.72);
    cylinder(outside, side * 5.7, ground + 7.7, gateZ, 1.03, 0.23, trim);
    mesh(
      outside,
      new THREE.ConeGeometry(1.12, 2.6, 36),
      roof,
      side * 5.7,
      ground + 9.1,
      gateZ,
    );
    for (const y of [0.3, 3.5, 7.4])
      cylinder(outside, side * 5.7, ground + y, gateZ, 0.94, 0.15, trim);
    for (const x of [8.5, 12.5, 16.5]) {
      box(outside, side * x, ground + 1.9, gateZ, 0.28, 3.8, 0.3, iron);
      for (const y of [0.6, 2.9])
        box(outside, side * x, ground + y, gateZ, 4, 0.08, 0.09, brass);
      for (let i = 0; i < 9; i++)
        box(
          outside,
          side * (x - 1.8 + i * 0.45),
          ground + 1.85,
          gateZ,
          0.04,
          3.7,
          0.04,
          iron,
        );
    }
  }
  leaves.count = leafIndex;
  leaves.instanceMatrix.needsUpdate = true;
  leaves.instanceColor.needsUpdate = true;
  const gates = [];
  for (const side of [-1, 1]) {
    const hinge = new THREE.Group();
    hinge.name = side < 0 ? "Left garden gate" : "Right garden gate";
    hinge.position.set(side * 4.6, ground, gateZ);
    scene.add(hinge);
    gates.push(hinge);
    for (let i = 0; i <= 12; i++) {
      const x = -side * i * 0.378,
        height = 5.4 + Math.sin(((i / 12) * Math.PI) / 2) * 0.85;
      box(hinge, x, height / 2, 0, 0.045, height, 0.065, iron);
      mesh(
        hinge,
        new THREE.ConeGeometry(0.095, 0.24, 4),
        brass,
        x,
        height + 0.1,
        0,
      );
    }
    for (const y of [0.4, 1.1, 4.4])
      box(hinge, -side * 2.27, y, 0, 4.56, 0.085, 0.1, brass);
    for (const x of [1.15, 2.3, 3.45])
      mesh(
        hinge,
        new THREE.TorusGeometry(0.42, 0.035, 5, 24),
        iron,
        -side * x,
        2.8,
        0,
      );
    batchGroup(hinge);
  }

  // Twelve shallow stone steps lead to a generous landing at hall level.
  const tread = (stairBottomZ - stairTopZ) / steps;
  const rise = -ground / steps;
  for (let i = 0; i < steps; i++) {
    const top = ground + (i + 1) * rise,
      z = stairBottomZ - (i + 0.5) * tread;
    box(outside, 0, (ground + top) / 2, z, 10.5, top - ground, tread, stone);
    box(outside, 0, top + 0.014, z + 0.025, 10.7, 0.035, tread + 0.05, trim);
    for (const side of [-1, 1]) {
      box(outside, side * 5.6, top + 0.4, z, 0.55, 0.8, tread, stone);
      box(outside, side * 5.6, top + 0.83, z, 0.7, 0.12, tread + 0.025, trim);
    }
  }
  box(outside, 0, -0.22, 2.5, 12, 0.44, 5, stone);
  box(outside, 0, 0.015, 2.5, 12, 0.04, 5, paving);
  for (const side of [-1, 1]) {
    lamp(outside, side * 6.25, 3.6, 4.2);
    cylinder(outside, side * 7.1, ground + 0.48, 13.2, 0.75, 0.96, trim);
    cylinder(outside, side * 7.1, ground + 1.25, 13.2, 0.9, 0.65, stone, 0.6);
    bush(side * 7.1, ground + 2, 13.2, 1, 0.95, 1);
  }

  // A notched facade, not a solid wall with a door painted onto it.
  const facade = new THREE.Shape();
  facade.moveTo(-17, -0.4);
  facade.lineTo(-4.8, -0.4);
  facade.lineTo(-4.8, 7);
  facade.bezierCurveTo(-4.8, 10, -1.5, 11.9, 0, 12.3);
  facade.bezierCurveTo(1.5, 11.9, 4.8, 10, 4.8, 7);
  facade.lineTo(4.8, -0.4);
  facade.lineTo(17, -0.4);
  facade.lineTo(17, 18.7);
  facade.lineTo(-17, 18.7);
  facade.closePath();
  mesh(
    outside,
    new THREE.ExtrudeGeometry(facade, {
      depth: 1.3,
      bevelEnabled: false,
      curveSegments: 32,
    }),
    stone,
    0,
    0,
    -1.3,
  );
  arch(outside, 0, 0, 0.3, 10.1, 12.75, 0.3, trim);
  arch(outside, 0, 0, 0.61, 9.55, 12.2, 0.075, brass);
  arch(outside, 0, 0, -1.2, 9.7, 12.35, 0.17, trim);
  const gable = new THREE.Shape();
  gable.moveTo(-8.6, 18.7);
  gable.lineTo(0, 25);
  gable.lineTo(8.6, 18.7);
  gable.closePath();
  mesh(
    outside,
    new THREE.ExtrudeGeometry(gable, { depth: 1.3, bevelEnabled: false }),
    stone,
    0,
    0,
    -1.3,
  );
  for (const side of [-1, 1]) {
    box(outside, side * 10.9, ground / 2, -0.65, 12.2, -ground, 1.3, stone);
    const pitch = box(outside, side * 4.4, 21.9, -15.5, 11, 0.22, 34, roof);
    pitch.rotation.z = -side * Math.atan2(6.3, 8.6);
  }
  box(outside, 0, 25.12, -15.5, 0.22, 0.18, 34.4, trim);
  // The larger school and its cliffs are built by createCastleExterior
  // and createHighlands. This group owns only the walkable entrance.
  for (const y of [13.7, 18.4]) box(outside, 0, y, 0.05, 34.8, 0.22, 1.4, trim);
  for (const side of [-1, 1]) {
    const x = side * 12.4;
    cylinder(outside, x, 8.7, -4.5, 2.9, 17.4, stone, 2.7);
    for (const y of [0.3, 6.4, 12.7, 17.5])
      cylinder(outside, x, y, -4.5, 3.07, 0.27, trim);
    mesh(
      outside,
      new THREE.ConeGeometry(3.3, 8.4, 48, 10),
      roof,
      x,
      21.8,
      -4.5,
    );
    for (let h = 0.2; h < 8.2; h += 0.32) {
      const r = 3.3 * (1 - h / 8.4);
      mesh(
        outside,
        new THREE.CylinderGeometry(r, r + 0.04, 0.06, 48),
        roof,
        x,
        17.6 + h,
        -4.5,
      );
    }
    for (const y of [3.4, 8.5, 13.5]) {
      mesh(
        outside,
        new THREE.ShapeGeometry(windowShape(0.85, 2.55)),
        glass,
        x,
        y,
        -1.55,
      );
      arch(outside, x, y, -1.47, 1.02, 2.72, 0.1, trim);
    }
    for (const xx of [6.3, 8.2, 16.5]) {
      box(outside, side * xx, 6.6, 0.6, 0.5, 13.2, 1.1, trim);
      box(outside, side * xx, 0.45, 0.9, 0.9, 0.9, 1.5, stone);
      mesh(
        outside,
        new THREE.ConeGeometry(0.37, 1.8, 8),
        roof,
        side * xx,
        14.1,
        0.6,
      );
    }

    // Tall carved oak leaves stand permanently open, inside the jambs.
    const door = new THREE.Group();
    door.name = side < 0 ? "Open left grand door" : "Open right grand door";
    door.position.set(side * 4.65, 0.05, -0.4);
    door.rotation.y = -side * 1.78;
    outside.add(door);
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-side * 4.57, 0);
    shape.lineTo(-side * 4.57, 11.78);
    shape.bezierCurveTo(-side * 2.8, 11.1, 0, 9.7, 0, 6.75);
    shape.closePath();
    mesh(
      door,
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.27,
        bevelEnabled: true,
        bevelSize: 0.04,
        bevelThickness: 0.04,
        bevelSegments: 2,
      }),
      wood,
      0,
      0,
      0,
    );
    for (const y of [1.9, 5.2, 8]) {
      const w = y > 7 ? 2.4 : 3.8,
        x = -side * 2.27;
      box(door, x, y, 0.29, w, 2.25, 0.11, iron);
      box(door, x, y, 0.36, w - 0.18, 2.03, 0.07, wood);
      for (const a of [-1, 1]) {
        box(door, x + a * (w / 2 - 0.07), y, 0.42, 0.04, 2.2, 0.055, brass);
        box(door, x, y + a * 1.05, 0.42, w, 0.04, 0.055, brass);
      }
    }
    for (const y of [0.5, 3.45, 6.6])
      box(door, -side * 1.8, y, 0.4, 3.6, 0.14, 0.075, iron);
    mesh(
      door,
      new THREE.TorusGeometry(0.24, 0.047, 8, 30),
      brass,
      -side * 3.75,
      3.5,
      0.48,
    );
  }
  // A rose window crowns the entrance, with a genuinely visible hall below.
  mesh(outside, new THREE.CircleGeometry(1.55, 48), glass, 0, 15.9, 0.12);
  mesh(outside, new THREE.TorusGeometry(1.68, 0.14, 8, 48), trim, 0, 15.9, 0.3);
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const spoke = box(
      outside,
      Math.sin(angle) * 0.8,
      15.9 + Math.cos(angle) * 0.8,
      0.35,
      0.055,
      1.55,
      0.09,
      trim,
    );
    spoke.rotation.z = -angle;
  }
  mesh(
    outside,
    new THREE.TorusGeometry(0.57, 0.07, 6, 32),
    trim,
    0,
    15.9,
    0.36,
  );

  // Detailed wing markings are original canvas artwork, shared by every
  // butterfly. Each has a different flight path and flapping phase.
  const wingMap = makeTexture((ctx, size) => {
    ctx.fillStyle = "#382b22";
    ctx.fillRect(0, 0, size, size);
    const gradient = ctx.createRadialGradient(
      size * 0.1,
      size * 0.5,
      0,
      size * 0.5,
      size * 0.5,
      size * 0.58,
    );
    gradient.addColorStop(0, "#f1d889");
    gradient.addColorStop(0.75, "#c98543");
    gradient.addColorStop(1, "#372921");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#44372ad0";
    ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(0, size * 0.52);
      ctx.quadraticCurveTo(size * 0.45, size * (i / 9), size, size * (i / 8));
      ctx.stroke();
      ctx.fillStyle = "#f8e5b7";
      ctx.beginPath();
      ctx.ellipse(
        size * 0.83,
        size * (0.08 + i * 0.102),
        4,
        6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }, 128);
  const wingMaterial = new THREE.MeshStandardMaterial({
    map: wingMap,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.bezierCurveTo(0.2, 0.58, 0.75, 0.68, 0.68, 0.19);
  wingShape.bezierCurveTo(0.64, -0.05, 0.5, -0.08, 0.3, -0.05);
  wingShape.bezierCurveTo(0.7, -0.52, 0.23, -0.65, 0.07, -0.24);
  wingShape.closePath();
  const wingGeometry = new THREE.ShapeGeometry(wingShape, 18);
  const uv = wingGeometry.attributes.uv;
  for (let i = 0; i < uv.count; i++)
    uv.setXY(i, uv.getX(i) / 0.73, (uv.getY(i) + 0.6) / 1.25);
  wingGeometry.rotateX(-Math.PI / 2);
  const butterflies = [];
  for (let i = 0; i < 14; i++) {
    const root = new THREE.Group();
    root.name = "Garden butterfly";
    root.scale.setScalar(0.3 + random() * 0.18);
    plants.add(root);
    const body = mesh(root, new THREE.SphereGeometry(1, 8, 6), twig, 0, 0, 0);
    body.scale.set(0.045, 0.05, 0.29);
    const wings = [-1, 1].map((side) => {
      const wing = mesh(root, wingGeometry, wingMaterial, 0, 0, 0);
      wing.scale.x = side;
      wing.castShadow = false;
      return { wing, side };
    });
    butterflies.push({
      root,
      wings,
      phase: random() * Math.PI * 2,
      x: (i % 2 ? -1 : 1) * (4.4 + random() * 2),
      z: 15 + random() * 22,
      rate: 0.6 + random() * 0.5,
    });
  }
  let lastSeason;
  return {
    gates,
    update({ time, reducedMotion, season, camera }) {
      plants.visible = outside.visible;
      snowCaps.visible = outside.visible && season === "winter";
      if (season !== lastSeason) {
        lawn.color.set(season === "winter" ? "#9ca984" : "#92af6b");
        paving.roughness = season === "rain" ? 0.38 : 0.86;
        lastSeason = season;
      }
      butterflies.forEach(({ root, wings, phase, x, z, rate }, i) => {
        root.visible =
          i < (season === "winter" ? 4 : season === "rain" ? 10 : 14);
        const t = reducedMotion ? phase : time * rate + phase;
        root.position.set(
          x + Math.sin(t) * 2.8,
          ground + 1.5 + Math.sin(t * 1.7) * 0.7,
          z + Math.cos(t * 0.73) * 2.1,
        );
        root.rotation.set(
          Math.sin(t * 1.7) * 0.17,
          Math.atan2(Math.cos(t) * 2.8, -Math.sin(t * 0.73) * 1.53),
          Math.sin(t * 0.8) * 0.14,
        );
        wings.forEach(({ wing, side }) => {
          wing.rotation.z =
            side *
            (0.3 +
              (reducedMotion
                ? 0.25
                : Math.sin(time * (15 + (i % 4)) + phase) * 0.95));
        });
      });
      gates.forEach((gate, i) => {
        gate.visible = outside.visible;
        // Both leaves are fully clear before the camera reaches the gate.
        const t = THREE.MathUtils.smoothstep(54 - camera.position.z, 0, 8);
        gate.rotation.y = (i === 0 ? 1 : -1) * t * 1.67;
      });
    },
  };
}
