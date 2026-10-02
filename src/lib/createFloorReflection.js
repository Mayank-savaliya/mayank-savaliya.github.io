import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { entrance } from "./entrance.js";

export function createFloorReflection(scene, normalMap, mobile) {
  const mirror = new Reflector(new THREE.PlaneGeometry(16, 96), {
    color: "#a5aca9",
    textureWidth: mobile ? 256 : 640,
    textureHeight: mobile ? 256 : 640,
    multisample: 0,
    clipBias: 0.004,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = 0.038;
  mirror.renderOrder = 3;
  mirror.material.transparent = true;
  mirror.material.depthWrite = false;
  mirror.material.uniforms.floorNormal = { value: normalMap };
  mirror.material.uniforms.wetness = { value: 0.18 };
  mirror.material.vertexShader =
    "varying vec3 floorWorld;\n" + mirror.material.vertexShader;
  mirror.material.vertexShader = mirror.material.vertexShader.replace(
    "void main() {",
    "void main() { floorWorld = (modelMatrix * vec4(position, 1.)).xyz;",
  );
  mirror.material.fragmentShader =
    `
    uniform sampler2D floorNormal;
    uniform float wetness;
    varying vec3 floorWorld;
  ` + mirror.material.fragmentShader;
  mirror.material.fragmentShader = mirror.material.fragmentShader.replace(
    "vec4 base = texture2DProj( tDiffuse, vUv );",
    `
      vec2 n = texture2D(floorNormal, floorWorld.xz / 2.3).xy * 2. - 1.;
      vec2 uv = vUv.xy / vUv.w + n * .002;
      vec4 base = texture2D(tDiffuse, uv) * .4;
      base += texture2D(tDiffuse, uv + vec2(.002, .001)) * .15;
      base += texture2D(tDiffuse, uv - vec2(.002, .001)) * .15;
      base += texture2D(tDiffuse, uv + vec2(-.001, .002)) * .15;
      base += texture2D(tDiffuse, uv - vec2(-.001, .002)) * .15;
    `,
  );
  mirror.material.fragmentShader = mirror.material.fragmentShader.replace(
    "gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );",
    `
      float facing = abs(normalize(cameraPosition - floorWorld).y);
      float fresnel = .04 + .96 * pow(1. - facing, 5.);
      gl_FragColor = vec4(base.rgb, wetness * (.2 + fresnel * .8));
    `,
  );
  scene.add(mirror);
  return {
    mirror,
    update(progress, camera, season) {
      const inside = camera.position.z < entrance.stairTopZ;
      mirror.visible = inside || season === "rain";
      mirror.scale.x = inside ? 1 : 0.5;
      mirror.position.y = (inside ? 0 : entrance.gardenY) + 0.055;
      mirror.scale.z = inside ? 1 : 0.54;
      mirror.position.z = inside ? Math.min(-48, camera.position.z - 22) : 38.3;
      mirror.material.uniforms.wetness.value = inside ? 0.34 : 0.72;
    },
    dispose() {
      mirror.getRenderTarget().dispose();
    },
  };
}
