import test from "node:test";
import assert from "node:assert/strict";
import { journeyPose, journeyProgress } from "./journey.js";
import { journeyStops, approachWaypoints } from "../data/journey.js";
import { entrance, entranceFloor, interiorBlend } from "./entrance.js";

const passages = Array.from({ length: 5 }, (_, i) => ({
  top: 1000 + i * 3000,
  height: 1200,
}));

test("camera advances in passages and rests while a chapter is read", () => {
  assert.equal(journeyProgress(0, 800, passages), 0);
  assert.equal(journeyProgress(504, 800, passages), 0);
  assert.equal(journeyProgress(1132, 800, passages), 0.5);
  assert.equal(journeyProgress(1760, 800, passages), 1);
  assert.equal(journeyProgress(3000, 800, passages), 1);
  assert.equal(journeyProgress(20000, 800, passages), 5);
});

test("reverse scrolling retraces the same continuous route", () => {
  const samples = [600, 1000, 1700, 3900, 6900, 13900];
  const forward = samples.map((y) => journeyProgress(y, 800, passages));
  const reverse = [...samples]
    .reverse()
    .map((y) => journeyProgress(y, 800, passages));
  assert.deepEqual(reverse, [...forward].reverse());
  for (const breakpoint of [
    ...approachWaypoints.slice(1).map((p) => p.at),
    2,
    3,
    4,
  ]) {
    const a = journeyPose(breakpoint - 0.00001),
      b = journeyPose(breakpoint + 0.00001);
    assert.ok(Math.hypot(...a.camera.map((n, i) => n - b.camera[i])) < 0.01);
  }
});

test("each destination lands in its room and reduced motion uses complete stops", () => {
  journeyStops.forEach((stop, i) => {
    assert.deepEqual(journeyPose(i).camera, stop.camera);
    assert.deepEqual(journeyPose(i).look, stop.look);
    assert.deepEqual(
      journeyPose(Math.min(i + 0.25, 5), true).camera,
      stop.camera,
    );
  });
  assert.deepEqual(journeyPose(-10).camera, journeyStops[0].camera);
  assert.deepEqual(journeyPose(20).camera, journeyStops[5].camera);
});

test("the camera stays inside the clear path from garden gate to owlery", () => {
  for (let p = 0.23; p <= 5; p += 0.002) {
    const pose = journeyPose(p);
    assert.ok(Math.abs(pose.camera[0]) < 4);
  }
});

test("the approach crosses gate, garden, steps and open doorway in order", () => {
  const crossed = [];
  let previous = journeyPose(0.23).camera[2];
  const thresholds = [
    entrance.gateZ,
    24,
    entrance.stairBottomZ,
    entrance.stairTopZ,
    entrance.doorZ,
  ];
  for (let p = 0.232; p <= 1; p += 0.002) {
    const [x, y, z] = journeyPose(p).camera;
    assert.ok(z <= previous, "forward scrolling cannot double back");
    assert.ok(Math.abs(y - entranceFloor(z) - entrance.eyeHeight) < 1e-9);
    thresholds.forEach((threshold) => {
      if (previous > threshold && z <= threshold) crossed.push(threshold);
    });
    if (z < 1.3 && z > -1.3)
      assert.ok(Math.abs(x) + 0.4 < entrance.doorHalfWidth);
    previous = z;
  }
  assert.deepEqual(crossed, thresholds);
});

test("stair ascent and threshold lighting join continuously to the hall", () => {
  assert.equal(entranceFloor(20), entrance.gardenY);
  assert.equal(entranceFloor(0), 0);
  assert.equal(interiorBlend(4), 0);
  assert.equal(interiorBlend(-9), 1);
  for (const z of [entrance.stairBottomZ, entrance.stairTopZ, 3, -8]) {
    assert.ok(
      Math.abs(entranceFloor(z - 0.0001) - entranceFloor(z + 0.0001)) < 0.001,
    );
    assert.ok(
      Math.abs(interiorBlend(z - 0.0001) - interiorBlend(z + 0.0001)) < 0.001,
    );
  }
});
