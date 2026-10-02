import * as THREE from "three";
import { createProjectWindows } from "./createProjectWindows.js";
import { createCastleEntrance } from "./createCastleEntrance.js";
import { interiorBlend } from "./entrance.js";

// Walkable scenery, built locally from geometry. The centre of every room
// stays clear so the camera follows an actual connected route.
export function createJourneyArchitecture({
  scene,
  materials,
  random,
  makeTexture,
  batchGroup,
  glowTexture,
  physical,
  invalidate,
  loadingManager,
}) {
  const projectWindows = createProjectWindows(invalidate, loadingManager);
  const { stone, trim, roof, glass, shadow } = materials;
  const brass = new THREE.MeshStandardMaterial({
    color: "#b39560",
    roughness: 0.43,
    metalness: 0.65,
  });
  const iron = new THREE.MeshStandardMaterial({
    color: "#253537",
    roughness: 0.55,
    metalness: 0.65,
  });
  const wood = new THREE.MeshStandardMaterial({
    color: "#4a3025",
    roughness: 0.83,
  });
  const paper = new THREE.MeshStandardMaterial({
    color: "#ddcba4",
    roughness: 1,
  });
  const insideStone = stone.clone();
  insideStone.color.set("#b5aa92");
  insideStone.userData.textureSize = 2;
  const vault = insideStone.clone();
  vault.color.set("#79766c");
  vault.side = THREE.DoubleSide;
  const flame = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#ffd298").multiplyScalar(3.5),
  });
  const blueGlass = physical.crystal.clone();
  blueGlass.color.set("#c1d0ce");
  blueGlass.roughness = 0.28;
  blueGlass.transmission = 0.75;
  const bookColors = [
    "#634c36",
    "#384e49",
    "#633d36",
    "#354755",
    "#8b7958",
    "#575745",
  ].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const outside = new THREE.Group();
  const rooms = [];
  const glows = [];
  const lampPositions = [];
  scene.add(outside);

  function mesh(parent, geometry, material, x, y, z) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = !material.isMeshBasicMaterial;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(parent, x, y, z, width, height, depth, material = stone) {
    const object = mesh(parent, cube, material, x, y, z);
    object.scale.set(width, height, depth);
    return object;
  }
  function cylinder(parent, x, y, z, radius, height, material, top = radius) {
    return mesh(
      parent,
      new THREE.CylinderGeometry(top, radius, height, 40),
      material,
      x,
      y,
      z,
    );
  }
  function glow(parent, x, y, z, size = 1.4, opacity = 0.36) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: "#ffbf66",
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    sprite.position.set(x, y, z);
    sprite.scale.setScalar(size);
    parent.add(sprite);
    glows.push(sprite);
    return sprite;
  }
  function arch(
    parent,
    x,
    y,
    z,
    width,
    height,
    thickness = 0.22,
    material = trim,
  ) {
    const curve = new THREE.CurvePath();
    const half = width / 2;
    curve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-half, 0, 0),
        new THREE.Vector3(-half, height * 0.57, 0),
      ),
    );
    curve.add(
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(-half, height * 0.57, 0),
        new THREE.Vector3(-half, height * 0.84, 0),
        new THREE.Vector3(-half * 0.3, height * 0.94, 0),
        new THREE.Vector3(0, height, 0),
      ),
    );
    curve.add(
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, height, 0),
        new THREE.Vector3(half * 0.3, height * 0.94, 0),
        new THREE.Vector3(half, height * 0.84, 0),
        new THREE.Vector3(half, height * 0.57, 0),
      ),
    );
    curve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(half, height * 0.57, 0),
        new THREE.Vector3(half, 0, 0),
      ),
    );
    return mesh(
      parent,
      new THREE.TubeGeometry(curve, 44, thickness, 6, false),
      material,
      x,
      y,
      z,
    );
  }
  function windowShape(width, height) {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height * 0.57);
    s.quadraticCurveTo(width / 2, height * 0.85, 0, height);
    s.quadraticCurveTo(-width / 2, height * 0.85, -width / 2, height * 0.57);
    s.closePath();
    return s;
  }
  function lamp(parent, x, z, height = 3.7, floorY = 0) {
    lampPositions.push(new THREE.Vector3(x, floorY + height + 0.2, z));
    cylinder(parent, x, floorY + 0.12, z, 0.28, 0.24, iron);
    cylinder(parent, x, floorY + height / 2, z, 0.065, height, iron, 0.055);
    cylinder(parent, x, floorY + height - 0.18, z, 0.25, 0.13, brass);
    box(
      parent,
      x,
      floorY + height + 0.2,
      z,
      0.36,
      0.61,
      0.36,
      physical.crystal,
    ).castShadow = false;
    const flameCore = mesh(
      parent,
      new THREE.SphereGeometry(0.07, 10, 10),
      flame,
      x,
      floorY + height + 0.17,
      z,
    );
    flameCore.scale.y = 2.1;
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        box(
          parent,
          x + a * 0.22,
          floorY + height + 0.2,
          z + b * 0.22,
          0.035,
          0.74,
          0.035,
          iron,
        );
    mesh(
      parent,
      new THREE.ConeGeometry(0.42, 0.35, 4),
      iron,
      x,
      floorY + height + 0.67,
      z,
    ).rotation.y = Math.PI / 4;
    cylinder(parent, x, floorY + height + 0.89, z, 0.055, 0.16, brass);
    glow(parent, x, floorY + height + 0.2, z, 1.3, 0.2);
  }

  const paving = physical.floor.clone();
  paving.color.set("#c2c2b8");
  paving.roughness = 0.85;
  const entrance = createCastleEntrance({
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
  });

  function wallWindow(parent, side, z, projectIndex, height = 4.1) {
    const frame = new THREE.Group();
    frame.position.set(side * 7.86, 2, z);
    frame.rotation.y = (-side * Math.PI) / 2;
    parent.add(frame);
    projectWindows.mount(frame, projectIndex, box, brass, wood);
    arch(frame, 0, 0, 0.1, 4.15, height + 0.35, 0.11, trim);
    arch(frame, 0, 0, 0.15, 3.98, height + 0.2, 0.025, brass);
  }
  function table(parent, x, z, wide = 2.7, deep = 4) {
    box(parent, x, 1.22, z, wide, 0.18, deep, wood);
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        box(
          parent,
          x + a * (wide / 2 - 0.2),
          0.6,
          z + b * (deep / 2 - 0.2),
          0.17,
          1.2,
          0.17,
          wood,
        );
    for (let i = 0; i < 5; i++) {
      const book = box(
        parent,
        x + (random() - 0.5) * wide * 0.6,
        1.38 + i * 0.13,
        z + 0.7,
        0.7 + random() * 0.3,
        0.12,
        0.8,
        bookColors[i],
      );
      book.rotation.y = random() * 0.3;
    }
    const page = box(parent, x, 1.33, z - 0.6, 1.25, 0.025, 1.7, paper);
    page.rotation.y = -0.16;
  }
  const pictureMaps = [];
  for (let i = 0; i < 4; i++) {
    pictureMaps.push(
      makeTexture((ctx, size) => {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(
          0,
          ["#263d3b", "#3e3945", "#403d2f", "#233a45"][i],
        );
        gradient.addColorStop(1, "#111c21");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = "#bba173";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(size / 2, size * 0.4, size * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#d8c395";
        ctx.textAlign = "center";
        ctx.font = `${size * 0.23}px Georgia`;
        ctx.fillText(["I", "II", "III", "IV"][i], size / 2, size * 0.48);
        ctx.font = `${size * 0.075}px Georgia`;
        ctx.fillText(["2020", "2020", "2023", "2026"][i], size / 2, size * 0.8);
        for (let p = 0; p < 28; p++) {
          ctx.fillStyle = "#d8c39577";
          ctx.fillRect(random() * size, random() * size, 1, 1);
        }
      }),
    );
  }

  for (let room = 0; room < 5; room++) {
    const group = new THREE.Group();
    group.name = `Castle room ${room + 1}`;
    scene.add(group);
    rooms.push(group);
    const centre = -16 - room * 32;
    const floorMaterial = physical.floor.clone();
    const floor = mesh(
      group,
      new THREE.PlaneGeometry(16, 32),
      floorMaterial,
      0,
      0.02,
      centre,
    );
    floor.rotation.x = -Math.PI / 2;
    box(group, 0, -0.22, centre, 16, 0.4, 32, insideStone);
    for (const side of [-1, 1]) {
      if (room === 3)
        box(group, side * 8.2, 4, centre, 0.6, 8, 32, insideStone);
      else {
        const wall = new THREE.Shape();
        wall.moveTo(-16, 0);
        wall.lineTo(16, 0);
        wall.lineTo(16, 8);
        wall.lineTo(-16, 8);
        wall.closePath();
        for (const offset of [-14.4, -6.4, 1.6, 9.6]) {
          const points = windowShape(2.2, 4.1)
            .getPoints(18)
            .map((p) => new THREE.Vector2(p.x - side * offset, p.y + 2));
          wall.holes.push(new THREE.Path(points));
        }
        const masonry = mesh(
          group,
          new THREE.ExtrudeGeometry(wall, {
            depth: 0.6,
            bevelEnabled: false,
            curveSegments: 16,
          }),
          insideStone,
          side * 7.9,
          0,
          centre,
        );
        masonry.rotation.y = (side * Math.PI) / 2;
      }
      box(group, side * 7.95, 0.28, centre, 0.25, 0.56, 32, trim);
      box(group, side * 7.95, 7.1, centre, 0.3, 0.28, 32, trim);
      for (const offset of [-11, -3, 5, 13]) {
        const z = centre + offset;
        cylinder(group, side * 7.45, 3.3, z, 0.35, 6.6, trim, 0.28);
        box(group, side * 7.45, 0.18, z, 0.85, 0.36, 0.85, trim);
        box(group, side * 7.45, 6.6, z, 0.85, 0.35, 0.85, trim);
        for (const dx of [-0.17, 0.17])
          cylinder(group, side * 7.28 + dx, 3.3, z - 0.2, 0.075, 6.5, trim);
        for (const y of [0.38, 6.3, 6.8])
          cylinder(group, side * 7.45, y, z, 0.4, 0.09, trim);
        if (room !== 3)
          wallWindow(
            group,
            side,
            z - 3.4,
            ([-11, -3, 5, 13].indexOf(offset) + (side > 0 ? 2 : 0)) % 4,
          );
        lamp(group, side * 6.9, z, 2.9);
      }
    }
    const ceiling = mesh(
      group,
      new THREE.CylinderGeometry(8, 8, 32, 28, 1, true, Math.PI / 2, Math.PI),
      vault,
      0,
      6.5,
      centre,
    );
    ceiling.rotation.x = Math.PI / 2;
    for (const offset of [-11, -3, 5, 13]) {
      arch(group, 0, 0, centre + offset, 14.9, 13.8, 0.18, trim);
      arch(group, 0, 0, centre + offset + 0.27, 14.9, 13.8, 0.065, brass);
    }
    arch(group, 0, 0, centre - 16, 9, 10.6, 0.34, trim);
    for (const side of [-1, 1])
      box(group, side * 6.5, 4, centre - 16, 3, 8, 0.6, insideStone);

    if (room === 0) {
      cylinder(group, -3.5, 0.65, centre - 2, 1.4, 1.3, stone);
      cylinder(group, -3.5, 1.35, centre - 2, 1.55, 0.18, brass);
      for (const side of [-1, 1]) {
        const banner = box(
          group,
          side * 5.4,
          7.4,
          centre + 5,
          1.6,
          4.3,
          0.05,
          bookColors[side < 0 ? 1 : 2],
        );
        box(
          group,
          banner.position.x,
          9.65,
          banner.position.z,
          2,
          0.08,
          0.08,
          brass,
        );
        mesh(
          group,
          new THREE.TorusGeometry(0.34, 0.024, 6, 24),
          brass,
          banner.position.x,
          7.8,
          banner.position.z + 0.05,
        );
      }
    }
    if (room === 1) {
      for (const side of [-1, 1])
        for (let p = 0; p < 4; p++) {
          const frame = new THREE.Group();
          group.add(frame);
          frame.position.set(side * 7.7, 6.2, centre - 10 + p * 6);
          frame.scale.setScalar(0.45);
          frame.rotation.y = (-side * Math.PI) / 2;
          box(frame, 0, 1.5, 0, 2.5, 3.6, 0.18, brass);
          box(frame, 0, 1.5, 0.11, 2.28, 3.38, 0.05, wood);
          mesh(
            frame,
            new THREE.PlaneGeometry(2.08, 3.16),
            new THREE.MeshBasicMaterial({ map: pictureMaps[p] }),
            0,
            1.5,
            0.15,
          );
        }
    }
    if (room === 2)
      for (const side of [-1, 1]) {
        table(group, side * 4.1, centre - 2, 2.8, 9);
        box(group, side * 4.1, 0.58, centre + 5, 2.8, 0.2, 0.8, wood);
        for (let p = 0; p < 5; p++) {
          const leaf = box(
            group,
            side * 7.5,
            3.8 + (p % 2) * 1.4,
            centre - 9 + p * 4.3,
            0.07,
            2,
            1.4,
            paper,
          );
          for (let line = 0; line < 6; line++)
            box(
              group,
              side * 7.45,
              leaf.position.y - 0.6 + line * 0.23,
              leaf.position.z,
              0.09,
              0.025,
              0.95,
              shadow,
            );
        }
      }
    if (room === 3) {
      for (const side of [-1, 1])
        for (let stack = 0; stack < 5; stack++) {
          const z = centre - 11 + stack * 5.6;
          box(group, side * 7.15, 4.55, z, 1.25, 9.1, 4.9, wood);
          for (let shelf = 0; shelf < 8; shelf++) {
            const y = 0.45 + shelf * 1.08;
            box(group, side * 6.48, y, z, 0.13, 0.09, 4.85, brass);
            for (let b = 0; b < 17; b++) {
              const height = 0.52 + random() * 0.41;
              box(
                group,
                side * 6.41,
                y + height / 2 + 0.05,
                z - 2.2 + b * 0.265,
                0.46,
                height,
                0.2,
                bookColors[Math.floor(random() * bookColors.length)],
              );
            }
          }
        }
      table(group, -3.4, centre - 1, 2.4, 2.4);
      for (const x of [5.55, 6.3])
        box(group, x, 3.6, centre - 3, 0.1, 7.2, 0.13, brass).rotation.x =
          -0.09;
      for (let rung = 0; rung < 15; rung++)
        box(group, 5.93, 0.4 + rung * 0.45, centre - 3, 0.8, 0.07, 0.11, brass);
    }
    if (room === 4) {
      box(group, 0, 7, centre - 16.6, 16, 14, 0.5, insideStone);
      for (const x of [-4.6, 0, 4.6]) {
        mesh(
          group,
          new THREE.ShapeGeometry(windowShape(3.1, 8)),
          blueGlass,
          x,
          1.7,
          centre - 12,
        );
        arch(group, x, 1.7, centre - 11.9, 3.35, 8.2, 0.16, trim);
        for (const dx of [-0.55, 0.55])
          box(group, x + dx, 5.1, centre - 11.85, 0.055, 6.6, 0.06, brass);
      }
      for (const side of [-1, 1])
        for (const z of [centre - 5, centre + 5]) {
          cylinder(group, side * 5.2, 1.2, z, 0.18, 2.4, wood);
          box(group, side * 5.2, 2.35, z, 2, 0.16, 0.16, wood);
        }
      table(group, -4.1, centre, 2.3, 3);
    }
    // Batch stone, shelves, books, and furniture independently in each room.
    batchGroup(group);
  }
  batchGroup(outside);

  const magic = new THREE.Group();
  magic.position.set(-3.5, 3.5, -18);
  scene.add(magic);
  for (let i = 0; i < 3; i++) {
    const ring = mesh(
      magic,
      new THREE.TorusGeometry(1.1 + i * 0.15, 0.022, 6, 48),
      brass,
      0,
      0,
      0,
    );
    ring.rotation.set(i * 0.72, i * 1.02, i * 0.4);
  }
  mesh(
    magic,
    new THREE.IcosahedronGeometry(0.6, 1),
    new THREE.MeshBasicMaterial({ color: "#d6c394", wireframe: true }),
    0,
    0,
    0,
  );
  glow(magic, 0, 0, 0, 2.4, 0.16);
  const book = new THREE.Group();
  book.position.set(-3.4, 2.05, -113);
  book.rotation.y = -0.3;
  scene.add(book);
  for (const side of [-1, 1]) {
    const page = box(book, side * 0.58, 0, 0, 1.15, 0.13, 1.55, paper);
    page.rotation.z = -side * 0.14;
    const cover = box(
      book,
      side * 0.59,
      -0.08,
      0,
      1.22,
      0.045,
      1.63,
      bookColors[1],
    );
    cover.rotation.z = -side * 0.14;
  }
  glow(book, 0, 0.3, 0, 2, 0.1);

  const owl = new THREE.Group();
  owl.position.set(5.2, 2.5, -149);
  scene.add(owl);
  const feathers = new THREE.MeshStandardMaterial({
    color: "#c9c4b2",
    roughness: 1,
  });
  const owlBody = mesh(
    owl,
    new THREE.SphereGeometry(0.45, 16, 12),
    feathers,
    0,
    0.43,
    0,
  );
  owlBody.scale.set(0.8, 1.25, 0.7);
  mesh(owl, new THREE.SphereGeometry(0.34, 16, 12), feathers, 0, 0.93, 0.06);
  for (const x of [-0.13, 0.13]) {
    mesh(owl, new THREE.SphereGeometry(0.1, 12, 8), brass, x, 0.98, 0.32);
    mesh(owl, new THREE.SphereGeometry(0.045, 8, 6), shadow, x, 0.98, 0.4);
  }
  mesh(
    owl,
    new THREE.ConeGeometry(0.065, 0.16, 6),
    brass,
    0,
    0.86,
    0.38,
  ).rotation.x = -Math.PI / 2;

  const roomLight = new THREE.PointLight("#ffcd92", 50, 27, 2);
  scene.add(roomLight);
  const roomFill = new THREE.PointLight("#809faf", 25, 32, 2);
  scene.add(roomFill);
  const lamps = Array.from({ length: innerWidth < 780 ? 4 : 6 }, () => {
    const light = new THREE.PointLight("#ffd29a", 32, 12, 2);
    scene.add(light);
    return light;
  });
  const keyLight = new THREE.SpotLight("#b6d0e0", 230, 32, 0.77, 0.7, 2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(
    innerWidth < 780 ? 512 : 1024,
    innerWidth < 780 ? 512 : 1024,
  );
  keyLight.shadow.normalBias = 0.025;
  keyLight.shadow.bias = -0.00015;
  keyLight.shadow.radius = 3;
  scene.add(keyLight, keyLight.target);
  let lastLampRegion = "";

  return {
    outside,
    rooms,
    pauseMedia: () => projectWindows.pause(),
    dispose: () => projectWindows.dispose(),
    update({
      progress,
      camera,
      time,
      reducedMotion,
      light,
      season,
      exploring,
    }) {
      projectWindows.update({ progress, reducedMotion, exploring });
      const blend = interiorBlend(camera.position.z);
      const inside = camera.position.z < 0;
      // Exterior remains in place behind us until it is out of view. The
      // first two rooms are already visible through the open entrance.
      outside.visible = camera.position.z > -22;
      entrance.update({ time, reducedMotion, season, camera });
      const roomIndex = Math.max(0, Math.ceil(progress) - 1);
      rooms.forEach((room, i) => {
        // Keep the full vista ahead: revealing rooms only at their chapter
        // boundary previously left a sky-shaped hole at the end of the hall.
        room.visible = i >= roomIndex - 1;
      });
      magic.visible = roomIndex < 2;
      book.visible = progress > 2 && roomIndex > 1;
      owl.visible = progress > 3 && roomIndex > 2;
      paving.roughness = season === "rain" ? 0.38 : 0.86;
      blueGlass.color.set(light === "day" ? "#dce3cf" : "#a5c0cd");
      const lampRegion = `${inside}-${Math.round(camera.position.z / 5)}`;
      if (lastLampRegion !== lampRegion) {
        const nearest = lampPositions.sort(
          (a, b) =>
            a.distanceToSquared(camera.position) -
            b.distanceToSquared(camera.position),
        );
        lamps.forEach((lamp, i) =>
          lamp.position.copy(nearest[i] || nearest[0]),
        );
        lastLampRegion = lampRegion;
      }
      lamps.forEach((lamp) => {
        lamp.intensity = inside ? 52 : light === "day" ? 12 : 70;
      });
      keyLight.position.set(
        inside ? -5.7 : -3,
        camera.position.y + 3,
        camera.position.z - 4,
      );
      keyLight.target.position.set(
        camera.position.x,
        camera.position.y - 1.2,
        camera.position.z - 10,
      );
      keyLight.intensity = inside ? 280 : light === "day" ? 110 : 210;
      roomLight.position.set(camera.position.x - 2.2, 6, camera.position.z - 9);
      roomFill.position.set(3.8, 5.5, camera.position.z - 19);
      roomLight.intensity = 22 + blend * 43;
      roomLight.position.z = Math.min(-6, roomLight.position.z);
      roomFill.intensity = 10 + blend * 10;
      roomFill.position.z = Math.min(-15, roomFill.position.z);
      if (!reducedMotion) {
        magic.rotation.y = time * 0.19;
        magic.position.y = 3.5 + Math.sin(time) * 0.12;
        book.position.y = 2.05 + Math.sin(time * 0.7) * 0.08;
        book.rotation.z = Math.sin(time * 0.4) * 0.04;
        owl.rotation.y = Math.sin(time * 0.23) * 0.22;
      }
    },
  };
}
