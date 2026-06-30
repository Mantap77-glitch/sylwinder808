const API_BASE_URL = process.env.BACKEND_API_URL;

type ServerApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
  headers?: HeadersInit;
};

export class BackendApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.detail = detail;
  }
}

function buildApiUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error("BACKEND_API_URL belum diset di .env");
  }

  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanBaseUrl}/${cleanPath}`;
}

function getBackendMessage(result: unknown, fallback: string) {
  if (result && typeof result === "object") {
    const data = result as {
      error?: unknown;
      message?: unknown;
      errors?: unknown;
    };

    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;

    if (Array.isArray(data.errors) && typeof data.errors[0] === "string") {
      return data.errors[0];
    }
  }

  return fallback;
}

export async function serverApi<T>(
  path: string,
  options: ServerApiOptions = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (!isFormData && options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildApiUrl(path), {
    method: options.method ?? "GET",
    headers,
    body: isFormData
      ? (options.body as BodyInit)
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  /**
   * API temanmu saat ini banyak return HTTP 200 meskipun gagal.
   * Jadi selain response.ok, kita juga wajib cek success === false.
   */
  if (!response.ok || result?.success === false) {
    throw new BackendApiError(
      getBackendMessage(result, "Request ke backend gagal."),
      response.status,
      result
    );
  }

  return result as T;
}