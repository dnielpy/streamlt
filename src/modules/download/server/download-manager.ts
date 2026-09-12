const REQUEST_TIMEOUT_MS = 10_000;
const STREAMLT_ENDPOINT = "/api/integrations/streamlt/downloads";

type DownloadManagerErrorPayload = {
  error?: {
    message?: string;
  };
};

export type QueuedDownload = {
  id: string;
  fileName: string;
  status: string;
};

export class DownloadManagerError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
    this.name = "DownloadManagerError";
  }
}

function validateBaseUrl(value: string | undefined, variableName: string) {
  const configured = value?.trim();
  if (!configured) throw new DownloadManagerError(`${variableName} is not configured.`, 503);

  try {
    const url = new URL(configured);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
      throw new Error();
    }
    return url.toString().replace(/\/+$/, "");
  } catch {
    throw new DownloadManagerError(`${variableName} must be a valid HTTP or HTTPS URL.`, 503);
  }
}

function getApiConfig() {
  const apiUrl = validateBaseUrl(process.env.DOWNLOAD_MANAGER_API_URL, "DOWNLOAD_MANAGER_API_URL");
  const apiKey = process.env.DOWNLOAD_MANAGER_API_KEY?.trim();
  if (!apiKey) throw new DownloadManagerError("DOWNLOAD_MANAGER_API_KEY is not configured.", 503);
  return { apiUrl, apiKey };
}

export function getDownloadManagerPublicUrl() {
  const value = process.env.DOWNLOAD_MANAGER_PUBLIC_URL || process.env.DOWNLOAD_MANAGER_API_URL;

  try {
    return validateBaseUrl(value, "DOWNLOAD_MANAGER_PUBLIC_URL");
  } catch {
    return null;
  }
}

async function getResponseMessage(response: Response) {
  try {
    const payload = (await response.json()) as DownloadManagerErrorPayload;
    return payload.error?.message || `Download Manager returned HTTP ${response.status}.`;
  } catch {
    return `Download Manager returned HTTP ${response.status}.`;
  }
}

export async function queueProfileDownload(url: unknown, destinationPath: string) {
  const { apiUrl, apiKey } = getApiConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiUrl}${STREAMLT_ENDPOINT}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ url, destinationPath }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new DownloadManagerError(await getResponseMessage(response), response.status);
    }

    const payload = (await response.json()) as { download?: Partial<QueuedDownload> };
    if (
      !payload.download ||
      typeof payload.download.id !== "string" ||
      typeof payload.download.fileName !== "string" ||
      typeof payload.download.status !== "string"
    ) {
      throw new DownloadManagerError("Download Manager returned an invalid response.");
    }

    return {
      id: payload.download.id,
      fileName: payload.download.fileName,
      status: payload.download.status,
    };
  } catch (error) {
    if (error instanceof DownloadManagerError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new DownloadManagerError("Download Manager did not respond in time.");
    }
    throw new DownloadManagerError("Unable to connect to Download Manager.");
  } finally {
    clearTimeout(timeout);
  }
}
