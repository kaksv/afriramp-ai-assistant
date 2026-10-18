const REQUEST_TIMEOUT_MS = 30_000;
const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, code = "api_error") {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

function getApiUrl() {
  if (!API_URL) {
    throw new ApiError(
      "The assistant API is not configured. Add VITE_API_URL to your environment and restart Vite.",
      "not_configured",
    );
  }

  return API_URL;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      "The API returned an unreadable response. Please try again.",
      "invalid_json",
    );
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );
  const forwardAbort = () => controller.abort();

  if (options.signal?.aborted) {
    controller.abort();
  } else {
    options.signal?.addEventListener("abort", forwardAbort, { once: true });
  }

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (controller.signal.aborted && !options.signal?.aborted) {
      throw new ApiError(
        "The assistant took too long to respond. Please try again.",
        "timeout",
      );
    }
    if (options.signal?.aborted) {
      throw error;
    }
    throw new ApiError(
      "Could not reach the AfriRamp API. Check your connection and try again.",
      "network",
    );
  } finally {
    window.clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", forwardAbort);
  }
}

export async function sendChatMessage(message) {
  const response = await fetchWithTimeout(`${getApiUrl()}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new ApiError(
      `The assistant could not answer right now (HTTP ${response.status}). Please try again.`,
      "http",
    );
  }

  const data = await readJson(response);
  if (
    !data ||
    typeof data.reply !== "string" ||
    data.reply.trim().length === 0
  ) {
    throw new ApiError(
      "The API response did not include an assistant reply. Please try again.",
      "invalid_reply",
    );
  }

  return data.reply.trim();
}

export async function checkApiHealth({ signal } = {}) {
  const response = await fetchWithTimeout(getApiUrl(), { signal });

  if (!response.ok) {
    throw new ApiError(
      `The API health check failed (HTTP ${response.status}).`,
      "health_http",
    );
  }

  const data = await readJson(response);
  if (!data || data.status !== "online") {
    throw new ApiError(
      "The API responded, but its health status is not online.",
      "health_status",
    );
  }

  return {
    service: typeof data.service === "string" ? data.service : "API",
  };
}
