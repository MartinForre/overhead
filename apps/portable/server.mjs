import { createServer } from "node:http";
import { createNearbyFeed } from "../adsb/nearby-feed.mjs";

const hostname = "127.0.0.1";
const port = 8000;
const host = `${hostname}:${port}`;
const displayUrl = `http://${host}/display/`;
const mimeTypes = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json",
  png: "image/png",
};
const roots = {
  display: new URL("../display/", import.meta.url),
  companion: new URL("../companion/", import.meta.url),
  aircrafts: new URL("../../assets/aircrafts/", import.meta.url),
};
const staticPath = /^\/(display|companion|aircrafts)\/((?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(html|css|js|json|png))$/;
const nearbyFeed = createNearbyFeed();

const server = createServer((request, response) => {
  if (request.headers.host !== host && request.headers.host !== `localhost:${port}`) {
    response.writeHead(403).end();
    return;
  }

  nearbyFeed(request, response, () => serveFile(request, response)).catch((error) => {
    console.error(error);
    if (!response.headersSent) response.writeHead(500);
    response.end();
  });
});

server.on("error", (error) => {
  console.error(`Could not start Overhead at ${displayUrl} (${error.message})`);
  Deno.exitCode = 1;
});
server.listen(port, hostname, () => {
  console.log(`Overhead is running. Add ${displayUrl} to your Chrome tab rotation.`);
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

  response.writeHead(200, {
    "Content-Type": mimeTypes[extension],
    "Content-Length": body.length,
    "Cache-Control": "no-cache",
  });
  response.end(request.method === "HEAD" ? undefined : body);
}
