export interface KotauthConfig {
  baseUrl: string;
  tenantSlug: string;
  apiKey: string;
}

export interface ApiResponse<T> {
  data: T[];
  meta: { total: number; offset: number; limit: number };
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
}

export class KotauthApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
  ) {
    super(problem.detail);
    this.name = "KotauthApiError";
  }
}

export class KotauthClient {
  private readonly base: string;
  private readonly headers: Record<string, string>;

  constructor(private readonly config: KotauthConfig) {
    this.base = `${config.baseUrl.replace(/\/+$/, "")}/t/${config.tenantSlug}/api/v1`;
    this.headers = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.base}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") url.searchParams.set(k, v);
      }
    }
    return this.request("GET", url);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request("POST", new URL(`${this.base}${path}`), body);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request("PUT", new URL(`${this.base}${path}`), body);
  }

  async del(path: string): Promise<void> {
    const url = new URL(`${this.base}${path}`);
    const res = await fetch(url, { method: "DELETE", headers: this.headers });
    if (!res.ok) {
      const problem = (await res.json()) as ProblemDetail;
      throw new KotauthApiError(res.status, problem);
    }
  }

  private async request<T>(method: string, url: URL, body?: unknown): Promise<T> {
    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const problem = (await res.json()) as ProblemDetail;
      throw new KotauthApiError(res.status, problem);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
}

export function createClientFromEnv(): KotauthClient {
  const baseUrl = process.env.KOTAUTH_BASE_URL;
  const tenantSlug = process.env.KOTAUTH_TENANT_SLUG;
  const apiKey = process.env.KOTAUTH_API_KEY;

  if (!baseUrl) throw new Error("KOTAUTH_BASE_URL is required");
  if (!tenantSlug) throw new Error("KOTAUTH_TENANT_SLUG is required");
  if (!apiKey) throw new Error("KOTAUTH_API_KEY is required");

  return new KotauthClient({ baseUrl, tenantSlug, apiKey });
}
