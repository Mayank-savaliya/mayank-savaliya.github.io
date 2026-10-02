import * as THREE from "three";

// A modelled prop, not a sprite: engraved gold, articulated metal feathers,
// and frame-rate-independent flight relative to the visitor's camera.
export function createGoldenSnitch({ scene, batchGroup }) {
  const root = new THREE.Group();
  root.name = "Golden Snitch";
  scene.add(root);
  const body = new THREE.Group();
  body.name = "Engraved golden body";
  root.add(body);
  const gold = new THREE.MeshPhysicalMaterial({
    color: "#e8b64b",
    metalness: 1,
    roughness: 0.22,
    clearcoat: 0.32,
    clearcoatRoughness: 0.18,
    envMapIntensity: 2.4,
  });
  const raisedGold = gold.clone();
  raisedGold.color.set("#f3cf73");
  raisedGold.roughness = 0.27;
  const engraving = gold.clone();
  engraving.color.set("#715020");
  engraving.roughness = 0.39;
  const featherGold = gold.clone();
  featherGold.color.set("#e5cf96");
  featherGold.roughness = 0.31;
  featherGold.side = THREE.DoubleSide;
  const ribGold = gold.clone();
  ribGold.color.set("#bfa567");
  ribGold.roughness = 0.24;
  const radius = 0.115;
  body.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), gold));

  function wire(parent, points, thickness, material, segments = 50) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, segments, thickness, 5, false),
      material,
    );
    parent.add(mesh);
    return mesh;
  }
  // Interlocking, offset spiral filigree follows the actual spherical surface.
  // Thin dark seams beside the raised bands make engraving catch grazing light.
  for (let band = 0; band < 7; band++) {
    const points = [],
      shadow = [];
    for (let i = 0; i <= 68; i++) {
      const t = i / 68,
        latitude = -1.15 + t * 2.28;
      const longitude =
        (band * Math.PI * 2) / 7 + t * 1.25 + Math.sin(t * Math.PI * 2) * 0.36;
      const r = radius + 0.0017;
      points.push([
        Math.cos(latitude) * Math.cos(longitude) * r,
        Math.sin(latitude) * r,
        Math.cos(latitude) * Math.sin(longitude) * r,
      ]);
      shadow.push([
        Math.cos(latitude) * Math.cos(longitude + 0.055) * r,
        Math.sin(latitude) * r,
        Math.cos(latitude) * Math.sin(longitude + 0.055) * r,
      ]);
    }
    wire(body, points, 0.0023, raisedGold, 68);
    wire(body, shadow, 0.00115, engraving, 68);
  }
  for (const y of [-0.044, 0.03]) {
    const points = [];
    const r = Math.sqrt(radius * radius - y * y) + 0.0015;
    for (let i = 0; i <= 70; i++) {
      const a = (i / 70) * Math.PI * 2;
      points.push([
        Math.cos(a) * r,
        y + Math.sin(a * 3) * 0.003,
        Math.sin(a) * r,
      ]);
    }
    wire(body, points, 0.0022, raisedGold, 70);
  }
  for (const side of [-1, 1]) {
    const joint = new THREE.Mesh(
      new THREE.TorusGeometry(0.023, 0.0045, 8, 24),
      raisedGold,
    );
    joint.position.set(side * radius * 0.91, 0.043, 0);
    joint.rotation.y = Math.PI / 2;
    body.add(joint);
  }
  batchGroup(body);

  const prototype = new THREE.Group();
  const span = 0.59;
  const leading = (u) => [
    u * span,
    0.027 + Math.sin(u * Math.PI * 0.67) * 0.103,
    -Math.sin(u * Math.PI) * 0.027,
  ];
  const trailing = (u) => {
    const p = leading(u);
    return [
      p[0] - 0.052 * Math.sin(u * Math.PI),
      p[1] - Math.pow(Math.sin(u * Math.PI), 0.7) * 0.155 - 0.008,
      p[2] + 0.024 * Math.sin(u * Math.PI),
    ];
  };
  const leadingPoints = Array.from({ length: 30 }, (_, i) => leading(i / 29));
  wire(prototype, leadingPoints, 0.0027, raisedGold, 42);
  for (let i = 0; i < 36; i++) {
    const a = i / 36,
      b = (i + 0.83) / 36;
    const topA = leading(a),
      topB = leading(b),
      bottomA = trailing(a),
      bottomB = trailing(b);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [...topA, ...bottomA, ...topB, ...topB, ...bottomA, ...bottomB],
        3,
      ),
    );
    geometry.computeVertexNormals();
    prototype.add(new THREE.Mesh(geometry, featherGold));
    wire(
      prototype,
      [topA, [bottomA[0] + 0.009, (topA[1] + bottomA[1]) / 2, 0.008], bottomA],
      0.0009,
      ribGold,
      5,
    );
  }
  batchGroup(prototype);
  const wings = [-1, 1].map((side) => {
    const hinge = new THREE.Group();
    hinge.name = side < 0 ? "Snitch left wing" : "Snitch right wing";
    hinge.position.set(side * radius * 0.93, 0.043, 0);
    hinge.scale.x = side;
    hinge.add(prototype.clone(true));
    root.add(hinge);
    // Two faint subframe exposures retain a fast flutter on 30 Hz phones
    // without turning the wingbeat into a slow, aliased paddle motion.
    const ghosts = [0.35, 0.7].map((fraction, index) => {
      const g = hinge.clone(true);
      g.name = `Snitch wing exposure ${side}:${index}`;
      g.traverse((object) => {
        if (!object.isMesh) return;
        object.material = object.material.clone();
        object.material.transparent = true;
        object.material.opacity = index ? 0.055 : 0.09;
        object.material.depthWrite = false;
        object.castShadow = false;
      });
      root.add(g);
      return { group: g, fraction };
    });
    return { hinge, ghosts, side };
  });
  // No magical emission: highlights come from the scene's sky / hall HDR
  // probe and actual lights, changing from cool daylight to warm sconces.
  const local = new THREE.Vector3(),
    flightOffset = new THREE.Vector3();
  const orientation = new THREE.Quaternion(),
    bankRotation = new THREE.Quaternion();
  const euler = new THREE.Euler();
  let previousProgress,
    speed = 0,
    initialized = false;
  let lastTime = 0;
  return {
    root,
    update({ camera, time, delta, progress, reducedMotion, exploring }) {
      const rate =
        previousProgress === undefined
          ? 0
          : THREE.MathUtils.clamp(
              (progress - previousProgress) / Math.max(delta, 0.001),
              -1.5,
              1.5,
            );
      previousProgress = progress;
      const easing = 1 - Math.exp(-delta * 4.8);
      speed = THREE.MathUtils.lerp(speed, rate, easing);
      const t = reducedMotion ? 0 : time;
      const forward = THREE.MathUtils.clamp(speed * 2.8, -1, 1);
      // Incommensurate frequencies produce a repeatable, apparently random
      // orbit. A smaller, faster loop is layered over its lazy oval path.
      const swirl = Math.sin(t * 0.87) * 0.17 + Math.sin(t * 1.73 + 1.1) * 0.07;
      const flutter =
        Math.cos(t * 1.19 + 0.7) * 0.11 + Math.sin(t * 2.33) * 0.035;
      const depth = 6.6 + forward * 1.25 + Math.sin(t * 0.57) * 0.62;
      const halfHeight =
        Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * depth;
      const halfWidth = halfHeight * camera.aspect;
      const small = camera.aspect < 0.85;
      const scale = small ? 0.72 : 1;
      root.scale.setScalar(scale);
      const wingClearance =
        ((radius + span + 0.045) * scale) / halfWidth + 0.045;
      const x = THREE.MathUtils.clamp(
        (exploring ? 0.3 : small ? 0.51 : 0.63) + swirl * (small ? 0.58 : 1),
        -1 + wingClearance,
        1 - wingClearance,
      );
      const y = (exploring ? 0.08 : small ? 0.22 : 0.12) + flutter;
      local.set(x * halfWidth, y * halfHeight, -depth);
      if (!initialized || reducedMotion) flightOffset.copy(local);
      else flightOffset.lerp(local, 1 - Math.exp(-delta * 6.5));
      // Integrate the orbit in camera space. A fast descent or a map jump
      // must not strand the Snitch behind the camera or clip a wing through it.
      root.position
        .copy(flightOffset)
        .applyQuaternion(camera.quaternion)
        .add(camera.position);
      // Bank into turns, pitch into a dart, then yaw back towards the visitor
      // on reverse scrolling. Wing hinges operate in the body frame.
      euler.set(
        -0.1 + Math.cos(t * 1.19) * 0.12 + forward * 0.16,
        Math.sin(t * 0.87) * 0.48 - forward * 0.65,
        -Math.cos(t * 0.87) * 0.15 - Math.cos(t * 1.73 + 1.1) * 0.1,
      );
      bankRotation.setFromEuler(euler);
      orientation.copy(camera.quaternion).multiply(bankRotation);
      root.quaternion.slerp(
        orientation,
        !initialized || reducedMotion ? 1 : 1 - Math.exp(-delta * 9),
      );
      const beat = 18.5 + Math.abs(speed) * 1.8;
      // Integrate phase instead of multiplying an ever-changing frequency
      // by time; changing scroll speed must never snap the wings.
      const dt = Math.max(0, time - lastTime);
      root.userData.wingPhase =
        (root.userData.wingPhase || 0) + dt * Math.PI * 2 * beat;
      const phase = root.userData.wingPhase;
      wings.forEach(({ hinge, ghosts, side }) => {
        function articulate(g, p) {
          g.rotation.z = side * (0.17 + Math.sin(p) * 0.72);
          g.rotation.x = -0.2 + Math.sin(p - 0.58) * 0.34;
          g.rotation.y = side * (0.06 + Math.cos(p - 0.3) * 0.13);
        }
        articulate(hinge, reducedMotion ? 0.42 : phase);
        ghosts.forEach(({ group, fraction }) => {
          group.visible = !reducedMotion;
          articulate(
            group,
            phase - fraction * Math.PI * 2 * beat * Math.min(delta, 1 / 30),
          );
        });
      });
      root.userData.flight = { speed, forward, depth, reducedMotion };
      lastTime = time;
      initialized = true;
    },
  };
}
