async function sessionRequest(method: "POST" | "DELETE") {
  const response = await fetch("/api/session", {
    method,
    credentials: "same-origin",
  });
  const payload = (await response.json()) as {
    error?: string;
    data?: { authenticated: boolean };
  };
  if (!response.ok) {
    throw new Error(payload.error ?? "Your session could not be updated.");
  }
  return payload.data;
}

export const createApiSession = () => sessionRequest("POST");
export const clearApiSession = () => sessionRequest("DELETE");
