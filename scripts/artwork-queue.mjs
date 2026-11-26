import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const catalogDirectory = new URL("../assets/aircrafts/", import.meta.url);
const artwork = JSON.parse(readFileSync(new URL("artwork.json", catalogDirectory), "utf8"));
const types = JSON.parse(readFileSync(new URL("aircraft-types.json", catalogDirectory), "utf8"));

const styleReferences = {
  airliner: "a320neo-sas",
  "business-jet": "bombardier-global-7500-neutral",
  "fixed-wing": "a320neo-sas",
  "general-aviation": "a320neo-sas",
  helicopter: "aw101-sar-queen-norwegian-rescue",
};

const assetPath = (path) => fileURLToPath(new URL(path, catalogDirectory));

const queue = Object.entries(artwork.illustrations)
  .filter(([, illustration]) => illustration.status === "planned")
  .map(([id, illustration]) => {
    const type = types[illustration.icaoType];
    const category = type?.category ?? illustration.category;
    const output = assetPath(illustration.path);
    const style = artwork.illustrations[styleReferences[type?.role] ?? styleReferences[category]];
    const geometry = artwork.illustrations[illustration.referenceIllustration];

    let action = "generate";
    if (existsSync(output)) {
      action = "review";
    } else if (geometry && (geometry.status !== "ready" || !existsSync(assetPath(geometry.path)))) {
      action = "wait-for-reference";
    }

    return {
      id,
      action,
      icaoType: illustration.icaoType,
      aircraft: illustration.aircraft ?? (type && `${type.manufacturer} ${type.model}`),
      category,
      role: type?.role,
      livery: illustration.livery,
      output,
      styleReference: assetPath(style.path),
      geometryReference: geometry && assetPath(geometry.path),
      liveryReference: illustration.reference,
      airframes: Object.entries(artwork.airframes)
        .filter(([, airframe]) => airframe.illustration === id)
        .map(([hex, airframe]) => ({ hex, registration: airframe.registration })),
    };
  });

process.stdout.write(JSON.stringify(queue, null, 2) + "\n");
