import type { ServerType } from "@hono/node-server";

const DRAIN_TIMEOUT_MS = 5_000;

export function closeHttpServer(server: ServerType): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if ("closeAllConnections" in server) server.closeAllConnections();
    }, DRAIN_TIMEOUT_MS);
    timer.unref();
    server.close((error) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    });
  });
}
