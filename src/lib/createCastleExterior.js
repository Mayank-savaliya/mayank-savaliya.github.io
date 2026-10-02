import * as THREE from "three";

// Original, walk-around geometry studied from the supplied castle reference.
// Metres are shared with the entrance and rooms: the centre aisle stays open.
export function createCastleExterior({ materials, batchGroup, mobile }) {
  const { stone, trim, roof, glass, shadow, snow } = materials;
  const root = new THREE.Group();
  root.name = "Hogwarts silhouette — halls, towers, quadrangles and bridge";
  const limestone = stone.clone();
  limestone.color.set("#ddd1b7");
  const weathered = stone.clone();
  weathered.color.set("#a49e89");
  const carving = trim.clone();
  carving.color.set("#cfc5a9");
  const timber = new THREE.MeshStandardMaterial({
    color: "#655442",
    roughness: 0.91,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: "#67786f",
    metalness: 0.45,
    roughness: 0.67,
  });
  const unlitGlass = new THREE.MeshStandardMaterial({
    color: "#253c3e",
    metalness: 0.22,
    roughness: 0.25,
    side: THREE.DoubleSide,
  });
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const segments = mobile ? 40 : 64;
  const landmarks = [];
  const up = new THREE.Vector3(0, 1, 0);

  function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    parent.add(item);
    return item;
  }
  function box(parent, x, y, z, w, h, d, material = limestone) {
    const item = mesh(parent, cube, material, x, y, z);
    item.scale.set(w, h, d);
    return item;
  }
  function cylinder(parent, x, y, z, r, height, material = limestone, top = r) {
    return mesh(
      parent,
      new THREE.CylinderGeometry(top, r, height, segments),
      material,
      x,
      y,
      z,
    );
  }
  function beam(parent, start, end, width, material = timber, depth = width) {
    const a = new THREE.Vector3(...start),
      b = new THREE.Vector3(...end);
    const delta = b.clone().sub(a);
    const item = box(
      parent,
      ...a.add(b).multiplyScalar(0.5),
      width,
      delta.length(),
      depth,
      material,
    );
    item.quaternion.setFromUnitVectors(up, delta.normalize());
    return item;
  }
  function group(name, x = 0, z = 0, rotation = 0) {
    const part = new THREE.Group();
    part.name = name;
    part.position.set(x, 0, z);
    part.rotation.y = rotation;
    root.add(part);
    landmarks.push({ name, x, z });
    return part;
  }
  function pointed(w, h, bottom = 0) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, bottom);
    s.lineTo(w / 2, bottom);
    s.lineTo(w / 2, bottom + h * 0.64);
    s.bezierCurveTo(
      w / 2,
      bottom + h * 0.81,
      w * 0.2,
      bottom + h * 0.96,
      0,
      bottom + h,
    );
    s.bezierCurveTo(
      -w * 0.2,
      bottom + h * 0.96,
      -w / 2,
      bottom + h * 0.81,
      -w / 2,
      bottom + h * 0.64,
    );
    s.closePath();
    return s;
  }
  const pane = new THREE.ShapeGeometry(pointed(1, 1), 12);
  const frameShape = pointed(1, 1);
  frameShape.holes.push(
    new THREE.Path(pointed(0.78, 0.85, 0.06).getPoints(12)),
  );
  const frame = new THREE.ExtrudeGeometry(frameShape, {
    depth: 0.13,
    bevelEnabled: false,
    curveSegments: 12,
  });
  function windowAt(
    parent,
    x,
    y,
    z,
    w = 1.1,
    h = 2.9,
    rotation = 0,
    divisions = 1,
  ) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotation;
    parent.add(g);
    mesh(g, pane, shadow).scale.set(w + 0.32, h + 0.28, 1);
    const lit = Math.sin(x * 12.31 + y * 5.18 + z * 3.41) > -0.22;
    mesh(g, pane, lit ? glass : unlitGlass, 0, 0.07, 0.035).scale.set(
      w * 0.81,
      h * 0.88,
      1,
    );
    mesh(g, frame, carving, 0, 0, 0.065).scale.set(w, h, 1);
    box(g, 0, -0.04, 0.16, w + 0.28, 0.17, 0.38, carving);
    for (let i = 1; i <= divisions; i++) {
      const xx = -w * 0.39 + (i / (divisions + 1)) * w * 0.78;
      box(g, xx, h * 0.37, 0.18, 0.06, h * 0.68, 0.075, carving);
    }
    box(g, 0, h * 0.43, 0.17, w * 0.8, 0.065, 0.08, carving);
    if (h > 4) {
      const rose = mesh(
        g,
        new THREE.TorusGeometry(w * 0.19, 0.065, 5, 16),
        carving,
        0,
        h * 0.74,
        0.2,
      );
      rose.scale.y = 1.4;
      box(g, 0, h * 0.61, 0.17, w * 0.74, 0.07, 0.08, carving);
    }
  }
  function finial(parent, x, y, z, scale = 1) {
    cylinder(
      parent,
      x,
      y + scale * 0.6,
      z,
      0.055 * scale,
      1.2 * scale,
      copper,
      0.025 * scale,
    );
    mesh(
      parent,
      new THREE.SphereGeometry(0.12 * scale, 8, 6),
      copper,
      x,
      y + scale * 0.84,
      z,
    );
  }
  function cone(parent, x, y, z, r, h, dormers = true) {
    // Slightly flared eaves and two different pitches avoid a perfect cone.
    const profile = [
      new THREE.Vector2(r * 1.055, 0),
      new THREE.Vector2(r, h * 0.035),
      new THREE.Vector2(r * 0.91, h * 0.13),
      new THREE.Vector2(r * 0.42, h * 0.63),
      new THREE.Vector2(r * 0.055, h * 0.965),
      new THREE.Vector2(0.02, h),
    ];
    const geometry = new THREE.LatheGeometry(profile, segments);
    mesh(parent, geometry, roof, x, y, z);
    const dust = mesh(parent, geometry, snow, x, y + 0.06, z);
    dust.scale.set(1.009, 1.002, 1.009);
    cylinder(parent, x, y - 0.1, z, r * 1.05, 0.24, carving);
    for (let level = 1; level < 11; level++) {
      const t = level / 12;
      const radius =
        t < 0.13 ? r * (1 - t * 0.69) : r * (0.91 - (t - 0.13) * 1.06);
      cylinder(parent, x, y + h * t, z, Math.max(0.05, radius), 0.055, roof);
    }
    if (dormers && r > 2.7) {
      for (let tier = 0; tier < (r > 7 ? 3 : 2); tier++) {
        const t = 0.19 + tier * 0.2;
        for (let i = 0; i < (tier ? 6 : 8); i++) {
          const a = (i * Math.PI * 2) / (tier ? 6 : 8) + tier * 0.25;
          const radius = r * (1 - t) * 0.97;
          const xx = x + Math.sin(a) * radius,
            zz = z + Math.cos(a) * radius;
          const dormer = new THREE.Group();
          dormer.position.set(xx, y + h * t, zz);
          dormer.rotation.y = a;
          parent.add(dormer);
          box(dormer, 0, 0.35, -0.15, 0.7, 1.3, 0.75, weathered);
          mesh(
            dormer,
            new THREE.ConeGeometry(0.6, 1.15, 4),
            roof,
            0,
            1.51,
            -0.1,
          ).rotation.y = Math.PI / 4;
          windowAt(dormer, 0, 0, 0.25, 0.47, 1.05);
        }
      }
    }
    finial(parent, x, y + h, z, r > 5 ? 1.65 : 0.9);
  }
  function turret(parent, x, z, r, h, roofHeight, base = 0, detailed = true) {
    cylinder(parent, x, base + h / 2, z, r * 1.045, h, limestone, r);
    for (const [yy, radius, thickness] of [
      [0.3, 1.08, 0.35],
      [h * 0.34, 1.035, 0.2],
      [h * 0.67, 1.035, 0.21],
      [h - 0.6, 1.11, 0.3],
      [h, 1.13, 0.45],
    ])
      cylinder(parent, x, base + yy, z, r * radius, thickness, carving);
    cone(parent, x, base + h + 0.16, z, r * 1.16, roofHeight, detailed);
    if (detailed) {
      const count = r > 5 ? 12 : 7;
      for (
        let level = 3.6;
        level < h - (r > 5 ? 6 : 3.5);
        level += r > 5 ? 5.5 : 5.3
      ) {
        for (let i = 0; i < count; i++) {
          const a = (i * Math.PI * 2) / count;
          const radius = r * (1.045 - (level / h) * 0.045) + 0.045;
          windowAt(
            parent,
            x + Math.sin(a) * radius,
            base + level,
            z + Math.cos(a) * radius,
            r > 5 ? 1.24 : 0.84,
            r > 5 ? 3.05 : 2.45,
            a,
          );
        }
      }
      for (let i = 0; i < (r > 5 ? 32 : 16); i++) {
        const a = (i * Math.PI * 2) / (r > 5 ? 32 : 16);
        const bracket = box(
          parent,
          x + Math.sin(a) * r * 1.04,
          base + h - 1.25,
          z + Math.cos(a) * r * 1.04,
          0.3,
          1.25,
          0.5,
          carving,
        );
        bracket.rotation.y = a;
      }
    }
  }
  function pitched(parent, x, y, z, width, depth, height) {
    const span = width / 2 + 0.55;
    for (const side of [-1, 1]) {
      const slope = box(
        parent,
        x + (side * span) / 2,
        y + height / 2,
        z,
        Math.hypot(span, height),
        0.21,
        depth + 1,
        roof,
      );
      slope.rotation.z = -side * Math.atan2(height, span);
      const dust = slope.clone();
      dust.material = snow;
      dust.position.y += 0.12;
      parent.add(dust);
      box(
        parent,
        x + side * span,
        y - 0.1,
        z,
        0.32,
        0.36,
        depth + 1.1,
        carving,
      );
    }
    const end = new THREE.Shape();
    end.moveTo(-width / 2, 0);
    end.lineTo(0, height - 0.1);
    end.lineTo(width / 2, 0);
    end.closePath();
    const gable = new THREE.ExtrudeGeometry(end, {
      depth: 0.48,
      bevelEnabled: false,
    });
    for (const side of [-1, 1]) {
      mesh(
        parent,
        gable,
        limestone,
        x,
        y - 0.03,
        z + (side * depth) / 2 - 0.24,
      );
      for (const direction of [-1, 1]) {
        beam(
          parent,
          [x + direction * span, y + 0.15, z + side * (depth / 2 + 0.04)],
          [x, y + height + 0.15, z + side * (depth / 2 + 0.04)],
          0.22,
          carving,
        );
      }
      finial(parent, x, y + height, z + side * (depth / 2 + 0.2), 1.2);
    }
    box(parent, x, y + height + 0.07, z, 0.23, 0.22, depth + 1.5, copper);
  }
  function hall(
    name,
    x,
    z,
    width,
    depth,
    height,
    roofHeight,
    rotation = 0,
    cathedral = false,
  ) {
    const g = group(name, x, z, rotation);
    box(g, 0, height / 2, 0, width, height, depth);
    box(g, 0, -1.4, 0, width + 1.2, 2.8, depth + 1.2, weathered);
    for (const yy of [0.5, height - 0.7, height])
      box(g, 0, yy, 0, width + 0.4, 0.3, depth + 0.4, carving);
    pitched(g, 0, height, 0, width, depth, roofHeight);
    const bays = Math.floor(depth / 4.7),
      gap = depth / bays;
    for (const side of [-1, 1]) {
      for (let i = 0; i <= bays; i++) {
        const zz = -depth / 2 + i * gap;
        box(
          g,
          side * (width / 2 + 0.36),
          height * 0.48,
          zz,
          0.82,
          height * 0.97,
          0.73,
          carving,
        );
        box(g, side * (width / 2 + 0.72), 3.2, zz, 1.4, 6.4, 1.12, weathered);
        box(
          g,
          side * (width / 2 + 0.49),
          height * 0.47,
          zz,
          1.15,
          0.28,
          1.1,
          carving,
        );
        if (cathedral) {
          turret(
            g,
            side * (width / 2 + 0.32),
            zz,
            0.43,
            1.8,
            2.15,
            height,
            false,
          );
          beam(
            g,
            [side * (width / 2 + 0.73), 7, zz],
            [side * (width / 2 + 2.25), 0.3, zz],
            0.6,
            weathered,
            0.78,
          );
        }
        if (i < bays) {
          const xx = side * (width / 2 + 0.04),
            az = zz + gap / 2;
          if (cathedral)
            windowAt(
              g,
              xx,
              6.1,
              az,
              2.5,
              height - 8.2,
              (side * Math.PI) / 2,
              2,
            );
          else
            for (let y = 2.5; y < height - 2; y += 5.1)
              windowAt(g, xx, y, az, 1.15, 3.05, (side * Math.PI) / 2);
        }
      }
    }
    for (const side of [-1, 1]) {
      for (const xx of [-width * 0.28, 0, width * 0.28])
        windowAt(
          g,
          xx,
          cathedral ? 5.8 : height * 0.48,
          side * (depth / 2 + 0.03),
          cathedral ? 2.2 : 1.2,
          cathedral ? height - 8 : 3.9,
          side < 0 ? Math.PI : 0,
          cathedral ? 2 : 1,
        );
      windowAt(
        g,
        0,
        height + 1.25,
        side * (depth / 2 + 0.3),
        width * 0.18,
        roofHeight * 0.54,
        side < 0 ? Math.PI : 0,
        2,
      );
    }
    return g;
  }

  // A dominant round staircase tower, with satellites which grow out of
  // the same masonry. Its crown is the highest point in the composition.
  const grandTower = group(
    "The grand staircase and clustered spires",
    -32,
    -75,
  );
  grandTower.position.y = 10;
  turret(grandTower, 0, 0, 9.5, 35, 40);
  for (const [x, z, r, h, rh, base] of [
    [-10, -2, 1.65, 22, 18, 30],
    [-5.8, -8.6, 1.9, 26, 18, 27],
    [3.8, -8.8, 1.5, 24, 14, 28],
    [-8.9, 6, 1.65, 25, 12, 0],
  ])
    turret(grandTower, x, z, r, h, rh, base);
  // Upper lancet arcade and blind arches beneath the projecting eaves.
  for (let i = 0; i < 28; i++) {
    const a = (i * Math.PI * 2) / 28;
    windowAt(
      grandTower,
      Math.sin(a) * 9.59,
      30.3,
      Math.cos(a) * 9.59,
      1.05,
      2.65,
      a,
    );
  }

  // Great Hall on the left, with an uninterrupted steep roof, tall
  // traceried windows, repeated buttresses and finely spaced pinnacles.
  hall("The Great Hall", -57, -65, 16.5, 44, 25, 14, 0, true).position.y = 10;
  for (const x of [-66.1, -47.9]) {
    const corner = group("Great Hall corner spire", x, -42.8);
    corner.position.y = 10;
    turret(corner, 0, 0, 1.45, 26.5, 8.5);
  }
  hall("West cloister", -42, -108, 12, 44, 19, 10).position.y = 6;
  hall("Central stone gallery", -18, -76, 12, 38, 27, 9);
  hall("South link gallery", -23, -14, 9, 24, 14, 5.8, Math.PI / 2);
  hall("North quadrangle range", -25, -118, 12, 34, 20, 8.5, Math.PI / 2);

  // The square bell tower supplies the contrasting roof shape seen in
  // the reference. A pair of tall lancets sits below each steep gable.
  const bell = group("The twin-spired bell tower", 25, -58);
  box(bell, 0, 21, 0, 12.5, 42, 13.5);
  for (const y of [0.4, 10.5, 27.7, 37.7, 42])
    box(bell, 0, y, 0, 13.3, 0.44, 14.3, carving);
  pitched(bell, 0, 42.2, 0, 13.7, 14.2, 18.5);
  windowAt(bell, 0, 44, 7.4, 2.7, 6.5, 0, 2);
  windowAt(bell, 0, 44, -7.4, 2.7, 6.5, Math.PI, 2);
  for (const x of [-6.3, 6.3]) {
    for (const z of [-6.8, 6.8]) {
      box(bell, x, 20.5, z, 1.05, 41, 1.12, carving);
      turret(bell, x, z, 1.18, 9.6, 9.2, 39.5, false);
    }
  }
  for (let face = 0; face < 4; face++) {
    const wall = new THREE.Group();
    wall.rotation.y = (face * Math.PI) / 2;
    bell.add(wall);
    const depth = face % 2 ? 6.31 : 6.81;
    for (const x of [-2.35, 2.35]) {
      for (const y of [4, 13.5, 23]) windowAt(wall, x, y, depth, 1.45, 5.2);
      windowAt(wall, x, 31.2, depth, 2.1, 6.1, 0, 2);
    }
  }
  hall("Eastern teaching wing", 28, -92, 14, 54, 24, 10.3);
  hall("Viaduct courtyard front", 34, -20, 10.5, 38, 15.3, 7, Math.PI / 2);
  hall("Far quadrangle east range", 19, -139, 15, 42, 18, 9.1);
  // The tight cluster to the right of the entrance echoes the stepped
  // roofline in the reference, rather than isolated, identical towers.
  const eastGate = group("Eastern gatehouse spire cluster", 50, -34);
  box(eastGate, 0, 10, 0, 10, 20, 13);
  pitched(eastGate, 0, 20, 0, 11, 14, 9);
  turret(eastGate, 1, -4.5, 3.1, 29, 15.5);
  turret(eastGate, 6, 2.5, 2.1, 26.5, 13.5);
  turret(eastGate, -5, 4.6, 1.45, 25, 11);
  const bridgeLink = group("Covered bridge approach", 42, -80, Math.PI / 2);
  box(bridgeLink, 0, 3.1, 0, 7.3, 6.2, 17.5);
  pitched(bridgeLink, 0, 6.2, 0, 7.8, 18, 5);

  for (const [x, z, r, h, rh] of [
    [51.5, -18, 3, 27.5, 13],
    [16.5, -19, 2.2, 22, 10],
    [36.5, -111, 3.3, 35, 13.5],
    [-44, -112, 2.7, 28, 11],
    [-28, -94, 3.6, 38, 14],
    [35, -144, 2.6, 26, 12],
  ])
    turret(group("Courtyard tower", x, z), 0, 0, r, h, rh);

  // Broken-up roof volumes enclose the real rooms. They are all above
  // the vaults, leaving the native-scroll camera aisle completely open.
  const corridor = group("Roofs above the connected portfolio rooms");
  for (const [z, length, eave, rise] of [
    [-46, 30, 12.8, 7.5],
    [-77, 31, 14, 8.8],
    [-108, 30, 13, 8],
    [-143, 39, 12.5, 9.8],
  ])
    pitched(corridor, 0, eave, z, 18.2, length, rise);
  // A real passage through the rear range: masonry only at its sides
  // and above eye level, never across the middle of the walkthrough.
  for (const side of [-1, 1])
    box(corridor, side * 14.2, 10.5, -164, 14, 21, 10);
  box(corridor, 0, 16.5, -164, 16, 9, 10);
  pitched(corridor, 0, 21.1, -164, 42.5, 10.3, 11.8);
  const owlery = group("Owlery crown", 0, -145);
  cylinder(owlery, 0, 20.5, 0, 5.1, 13, limestone);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    windowAt(owlery, Math.sin(a) * 5.13, 20.5, Math.cos(a) * 5.13, 1.15, 4, a);
  }
  cone(owlery, 0, 27.1, 0, 6.1, 17.5);

  // A covered timber bridge travels over an actual gorge. Open trusses
  // cast shadows onto the deck; tall masonry piers continue to the rock.
  const bridge = group(
    "Covered timber bridge over the eastern gorge",
    89,
    -80,
    -0.06,
  );
  const bridgeLength = 91,
    bridgeFloor = 6.4;
  box(bridge, 0, bridgeFloor - 0.45, 0, bridgeLength, 0.9, 6.8, weathered);
  for (let x = -bridgeLength / 2; x <= bridgeLength / 2; x += 6.5) {
    for (const side of [-1, 1]) {
      box(bridge, x, bridgeFloor + 3.3, side * 3.12, 0.36, 6.6, 0.4, timber);
      if (x < bridgeLength / 2 - 1) {
        beam(
          bridge,
          [x, bridgeFloor + 0.4, side * 3.12],
          [x + 6.5, bridgeFloor + 6.3, side * 3.12],
          0.23,
        );
        beam(
          bridge,
          [x, bridgeFloor + 6.3, side * 3.12],
          [x + 6.5, bridgeFloor + 0.4, side * 3.12],
          0.23,
        );
      }
    }
    if (Math.round((x + bridgeLength / 2) / 6.5) % 3 === 0) {
      box(bridge, x, -9.5, 0, 2.3, 31, 5.4, weathered);
      box(bridge, x, 5.2, 0, 3.5, 0.75, 7.3, carving);
      for (const direction of [-1, 1])
        beam(
          bridge,
          [x, -1.5, direction * 2.3],
          [x + direction * 6.5, 5.4, direction * 2.3],
          0.62,
          timber,
        );
    }
  }
  for (const side of [-1, 1]) {
    for (const y of [bridgeFloor + 0.9, bridgeFloor + 3.25, bridgeFloor + 6.55])
      box(bridge, 0, y, side * 3.12, bridgeLength + 0.6, 0.27, 0.34, timber);
    const slope = box(
      bridge,
      0,
      bridgeFloor + 7.4,
      side * 1.9,
      bridgeLength + 1.6,
      0.19,
      4.35,
      roof,
    );
    slope.rotation.x = side * Math.atan2(2.1, 3.8);
    const dust = slope.clone();
    dust.material = snow;
    dust.position.y += 0.1;
    bridge.add(dust);
  }
  box(bridge, 0, bridgeFloor + 8.45, 0, bridgeLength + 2, 0.21, 0.28, copper);
  turret(group("Bridge gatehouse", 135, -82.8), 0, 0, 3.2, 14.7, 8.5);

  // Cliff-side arcades support the terrace instead of a floating platform.
  const terrace = group("Stone terrace and cliff arcades", -42, -15);
  terrace.position.y = 9.8;
  const arch = new THREE.Shape();
  arch.moveTo(-2.3, 1.4);
  arch.lineTo(2.3, 1.4);
  arch.lineTo(2.3, -15);
  arch.lineTo(1.7, -15);
  arch.lineTo(1.7, -5.5);
  arch.absarc(0, -5.5, 1.7, 0, Math.PI, false);
  arch.lineTo(-1.7, -15);
  arch.lineTo(-2.3, -15);
  arch.closePath();
  const arcade = new THREE.ExtrudeGeometry(arch, {
    depth: 1.7,
    bevelEnabled: false,
    curveSegments: 16,
  });
  for (let x = -13.8; x <= 18.4; x += 4.6)
    mesh(terrace, arcade, weathered, x, -1.8, 0);
  box(terrace, 2.3, -0.15, -8, 37, 0.8, 20, carving);
  for (let x = -15; x < 20; x += 1.4)
    box(terrace, x, 1.25, 1.3, 0.23, 2.1, 0.25, carving);
  box(terrace, 2.1, 2.3, 1.3, 36.8, 0.24, 0.42, carving);

  // Greenhouses at the foot of the front terrace add a fine, low layer.
  const greenhouses = group("Terraced glasshouses", 51, 14, -0.1);
  const greenhouseGlass = new THREE.MeshStandardMaterial({
    color: "#b5b6a0",
    metalness: 0.15,
    roughness: 0.23,
  });
  for (let n = 0; n < 3; n++) {
    const x = n * 5.8;
    box(greenhouses, x, -1.6, 0, 5.2, 2.5, 13, weathered);
    for (const side of [-1, 1]) {
      const slope = box(
        greenhouses,
        x + side * 1.3,
        0.55,
        0,
        3.4,
        0.1,
        13,
        greenhouseGlass,
      );
      slope.rotation.z = -side * 0.69;
      for (let z = -6.5; z <= 6.5; z += 1.3)
        beam(
          greenhouses,
          [x + side * 2.6, -0.6, z],
          [x, 1.65, z],
          0.075,
          copper,
        );
      for (const y of [-0.45, 0.45, 1.4])
        box(
          greenhouses,
          x + side * (1.65 - y) * 1.14,
          y,
          0,
          0.065,
          0.075,
          13,
          copper,
        );
    }
  }

  root.userData.landmarks = landmarks;
  batchGroup(root);
  return root;
}
