import test from "node:test";
import assert from "node:assert/strict";
import {
  seasonForDate,
  lightForDate,
  resolveAtmosphere,
} from "./atmosphere.js";

test("all twelve months are covered, including July and November", () => {
  assert.deepEqual(
    Array.from({ length: 12 }, (_, month) =>
      seasonForDate(new Date(2026, month, 15)),
    ),
    [
      "winter",
      "winter",
      "summer",
      "summer",
      "summer",
      "summer",
      "rain",
      "rain",
      "rain",
      "rain",
      "winter",
      "winter",
    ],
  );
});
test("season changes at local calendar boundaries", () => {
  assert.equal(seasonForDate(new Date(2026, 9, 31, 23, 59)), "rain");
  assert.equal(seasonForDate(new Date(2026, 10, 1)), "winter");
  assert.equal(seasonForDate(new Date(2027, 1, 28, 23, 59)), "winter");
  assert.equal(seasonForDate(new Date(2027, 2, 1)), "summer");
});
test("lighting follows local dawn, day, dusk and night boundaries", () => {
  const at = (hour, minute = 0) =>
    lightForDate(new Date(2026, 5, 3, hour, minute));
  assert.equal(at(5, 59), "night");
  assert.equal(at(6), "dawn");
  assert.equal(at(7, 59), "dawn");
  assert.equal(at(8), "day");
  assert.equal(at(16, 59), "day");
  assert.equal(at(17), "dusk");
  assert.equal(at(18, 59), "dusk");
  assert.equal(at(19), "night");
  assert.equal(at(0), "night");
});
test("preview overrides are independent and invalid values fall back to local time", () => {
  const date = new Date(2026, 9, 1, 23);
  assert.deepEqual(resolveAtmosphere(date), { light: "night", season: "rain" });
  assert.deepEqual(resolveAtmosphere(date, { light: "day" }), {
    light: "day",
    season: "rain",
  });
  assert.deepEqual(resolveAtmosphere(date, { season: "winter" }), {
    light: "night",
    season: "winter",
  });
  assert.deepEqual(
    resolveAtmosphere(date, { light: "auto", season: "invalid" }),
    { light: "night", season: "rain" },
  );
});
