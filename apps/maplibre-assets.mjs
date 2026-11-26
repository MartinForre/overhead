import { readFile } from "node:fs/promises";

const directory = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const assets = {
  "/maplibre/maplibre-gl.js": ["maplibre-gl.js", "text/javascript"],
  "/maplibre/LICENSE.txt": ["LICENSE.txt", "text/plain"],
};

export async function mapLibreAssets(request, response, next) {
  const path = request.url.split("?", 1)[0];
  if (!Object.hasOwn(assets, path)) return next();
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  const [name, type] = assets[path];
  try {
    const body = await readFile(new URL(name, directory));
    response.writeHead(200, {
      "Content-Type": type + "; charset=utf-8",
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
    }).end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500).end();
  }
}
