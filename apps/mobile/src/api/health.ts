import { apiUrl } from "../config/api";

type HealthResponse = { status: "ok"; database: "pglite" | "postgres" };

export async function checkBackend(): Promise<HealthResponse> {
  const response = await fetch(`${apiUrl}/v1/health`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok)
    throw new Error(`Backend returned HTTP ${response.status}.`);
  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("status" in result) ||
    result.status !== "ok" ||
    !("database" in result) ||
    (result.database !== "pglite" && result.database !== "postgres")
  )
    throw new Error("Unexpected backend response.");
  return { status: result.status, database: result.database };
}
