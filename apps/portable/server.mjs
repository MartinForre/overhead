import { createServer } from "node:http";
import { isIPv4 } from "node:net";
import { createNearbyFeed } from "../adsb/nearby-feed.mjs";
import { createFlightReference } from "../adsb/flight-reference.mjs";
import { mapLibreAssets } from "../maplibre-assets.mjs";
import { createSettingsApi } from "../settings/settings-api.mjs";

const lan = Deno.args.includes("--lan");
const managed = Deno.args.includes("--managed");
const hostname = lan ? "0.0.0.0" : "127.0.0.1";
const portArg = Deno.args.indexOf("--port");
const port = portArg === -1 ? 8000 : Number(Deno.args[portArg + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535 || (managed && lan)) {
  throw new Error("Invalid bind options. Managed instances listen on loopback.");
}
const host = `127.0.0.1:${port}`;
const displayUrl = `http://${host}/display/`;
const build = managed ? JSON.parse(await Deno.readTextFile(
  new URL("../../dist/pi/build-info.json", import.meta.url),
)) : null;
if (managed && (!Number.isSafeInteger(build.number) || build.number < 1)) {
  throw new Error("Invalid embedded build number.");
}
let writable = !managed;
const pendingWrites = new Set();
const mimeTypes = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json",
  png: "image/png",
  webmanifest: "application/manifest+json",
};
const roots = {
  display: new URL("../display/", import.meta.url),
  companion: new URL("../companion/", import.meta.url),
  shared: new URL("../shared/", import.meta.url),
  aircrafts: new URL("../../assets/aircrafts/", import.meta.url),
  dividers: new URL("../../assets/dividers/", import.meta.url),
};
const staticPath = /^\/(display|companion|shared|aircrafts|dividers)\/((?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(html|css|js|json|png|webmanifest))$/;
const flightReference = createFlightReference();
const nearbyFeed = createNearbyFeed({ peekDestination: flightReference.peekDestination });
const settingsApi = createSettingsApi("overhead.config.json");

const server = createServer(async (request, response) => {
  const requestHost = request.headers.host ?? "";
  const localHost = requestHost === host || requestHost === `localhost:${port}`;
  const [address, requestPort] = requestHost.split(":");
  const lanHost = lan && requestPort === String(port) && requestHost === `${address}:${port}` && isIPv4(address);
  if (!managed && !localHost && !lanHost) {
    response.writeHead(403).end();
    return;
  }

  const pathname = request.url.split("?", 1)[0];
  if (managed && pathname.startsWith("/__overhead/")) {
    const isControl = requestHost === host && request.method === "POST" &&
      request.headers["x-overhead-control"] === "1" && !request.headers.origin;
    if (!isControl || !["/__overhead/activate", "/__overhead/quiesce"].includes(pathname)) {
      response.writeHead(404).end();
      return;
    }
    writable = pathname === "/__overhead/activate";
    if (!writable) await Promise.allSettled(pendingWrites);
    response.writeHead(204).end();
    return;
  }
  if (managed && pathname === "/healthz" && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    }).end(JSON.stringify(build));
    return;
  }

  const isWrite = managed && !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (isWrite && !writable) {
    response.writeHead(503, { "Content-Type": "application/json", "Retry-After": "3" });
    response.end(JSON.stringify({ error: "Overhead is updating. Try again in a moment." }));
    return;
  }
  const operation = mapLibreAssets(request, response, () =>
    settingsApi(request, response, () => nearbyFeed(request, response, () =>
      flightReference(request, response, () => serveFile(request, response)))));
  if (isWrite) pendingWrites.add(operation);
  try {
    await operation;
  } catch (error) {
    console.error(error);
    if (!response.headersSent) response.writeHead(500);
    response.end();
  } finally {
    if (isWrite) pendingWrites.delete(operation);
  }
});

server.on("error", (error) => {
  console.error(`Could not start Overhead at ${displayUrl} (${error.message})`);
  Deno.exitCode = 1;
});
server.listen(port, hostname, () => {
  if (managed) {
    console.log(`Overhead build ${build.number} is listening at ${displayUrl}`);
    return;
  }
  console.log(`Overhead is running. Add ${displayUrl} to your Chrome tab rotation.`);
  if (lan) console.log(`Open http://<this computer's IPv4 address>:${port}/companion/ from another device on the network.`);
  console.log("Keep this window open while the display is in use.");
});

async function serveFile(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let [pathname] = request.url.split("?");
  if (pathname === "/" || pathname === "/display" || pathname === "/companion") {
    response.writeHead(302, { Location: pathname === "/" ? "/display/" : `${pathname}/` }).end();
    return;
  }
  if (pathname === "/display/" || pathname === "/companion/") pathname += "index.html";

  const match = staticPath.exec(pathname);
  if (!match) {
    response.writeHead(404).end();
    return;
  }
  const [, directory, filename, extension] = match;

  let body;
  try {
    body = await Deno.readFile(new URL(filename, roots[directory]));
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
    response.writeHead(404).end();
    return;
  }
  if (managed && extension === "html") {
    const html = new TextDecoder().decode(body);
    body = new TextEncoder().encode(html.replace(
      "<head>", `<head><meta name="overhead-build" content="${build.number}">`,
    ));
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[extension],
    "Content-Length": body.length,
    "Cache-Control": "no-cache",
  });
  response.end(request.method === "HEAD" ? undefined : body);
}
