import { z } from "zod";

const apiUrl = "/api/server";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  init: RequestInit = {},
): Promise<z.infer<Schema>> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof Blob) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const body = await response.text();
  let payload: unknown;

  try {
    payload = body ? JSON.parse(body) : null;
  } catch {
    if (!response.ok) {
      throw new ApiError(
        response.statusText || "The server could not complete the request.",
        response.status,
      );
    }
    throw new ApiError("The server returned an invalid response.", response.status);
  }

  if (!response.ok) {
    const errorSchema = z.object({
      error: z.string().optional(),
      details: z.unknown().optional(),
    });
    const result = errorSchema.safeParse(payload);
    throw new ApiError(
      result.success && result.data.error
        ? result.data.error
        : response.statusText || "The server could not complete the request.",
      response.status,
      result.success ? result.data.details : undefined,
    );
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError(
      "The server response did not match the expected format.",
      response.status,
      result.error.flatten(),
    );
  }
  return result.data;
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}
