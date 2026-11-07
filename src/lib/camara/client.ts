import { USER_AGENT_COLETOR } from "../site";

export const API_URL = "https://www.pindamonhangaba.sp.leg.br/jsonweb/web-aplicativo.php";
export const USER_AGENT = USER_AGENT_COLETOR;

export class ColetaError extends Error {
  constructor(
    message: string,
    readonly kind: "vazio" | "bloqueio" | "http" | "formato" | "rede" | "plausibilidade",
  ) {
    super(message);
    this.name = "ColetaError";
  }
}

type FetchLike = (url: string, init: { headers: Record<string, string>; signal: AbortSignal }) => Promise<{
  status: number;
  text(): Promise<string>;
  headers?: { get(name: string): string | null };
}>;

/** Longest wait accepted from a Retry-After header. */
const MAX_RETRY_AFTER_MS = 60_000;

/** Seconds or HTTP date, as in RFC 9110; capped. Null when absent or unreadable. */
function esperaRetryAfter(valor: string | null | undefined, agora = Date.now()): number | null {
  if (!valor) return null;
  const s = Number(valor);
  const ms = Number.isFinite(s) ? s * 1000 : Date.parse(valor) - agora;
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.min(ms, MAX_RETRY_AFTER_MS);
}

export interface ClientOptions {
  token: string;
  /** Minimum interval between requests, in ms. The project rule is at least 1 s. */
  intervaloMs?: number;
  fetchImpl?: FetchLike;
  sleep?: (ms: number) => Promise<void>;
  timeoutMs?: number;
}

/** Sequential, rate-limited client. Never logs the token. */
export class CamaraClient {
  private ultimo = 0;
  requisicoes = 0;
  private readonly intervaloMs: number;
  private readonly fetchImpl: FetchLike;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly timeoutMs: number;

  constructor(private readonly opts: ClientOptions) {
    this.intervaloMs = Math.max(1000, opts.intervaloMs ?? 1100);
    this.fetchImpl = opts.fetchImpl ?? ((url, init) => fetch(url, init));
    this.sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.timeoutMs = opts.timeoutMs ?? 40_000;
  }

  async get(call: string, params: Record<string, string | number> = {}): Promise<unknown> {
    const espera = this.ultimo + this.intervaloMs - Date.now();
    if (espera > 0) await this.sleep(espera);
    const qs = new URLSearchParams({ keysoft: this.opts.token, call });
    for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
    const descricao = `${call}${Object.entries(params).map(([k, v]) => ` ${k}=${v}`).join("")}`;

    let ultimoErro: unknown;
    let esperaPedida: number | null = null;
    for (let tentativa = 1; tentativa <= 3; tentativa++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        this.requisicoes++;
        const res = await this.fetchImpl(`${API_URL}?${qs.toString()}`, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          signal: controller.signal,
        });
        this.ultimo = Date.now();
        const body = await res.text();
        if (/Bot Verification|lsrecap/i.test(body)) {
          throw new ColetaError(`Desafio anti-robô em ${descricao}; coleta interrompida.`, "bloqueio");
        }
        if (res.status === 429) {
          // Rate limited: wait what the server asks for (capped) before trying again.
          esperaPedida = esperaRetryAfter(res.headers?.get("retry-after")) ?? 30_000;
          throw new ColetaError(`HTTP 429 em ${descricao}`, "http");
        }
        if (res.status >= 500) throw new ColetaError(`HTTP ${res.status} em ${descricao}`, "http");
        if (res.status !== 200) {
          throw new ColetaError(`HTTP ${res.status} em ${descricao}`, "http");
        }
        // The API answers 200 with an empty body when the token is missing or invalid.
        if (body.trim() === "") throw new ColetaError(`Resposta vazia em ${descricao} (token inválido?)`, "vazio");
        try {
          return JSON.parse(body) as unknown;
        } catch {
          throw new ColetaError(`Resposta não é JSON em ${descricao}`, "formato");
        }
      } catch (e) {
        this.ultimo = Date.now();
        ultimoErro = e;
        const repetivel =
          !(e instanceof ColetaError) || (e.kind === "http" && /HTTP (5\d\d|429)/.test(e.message));
        if (!repetivel || tentativa === 3) break;
        const backoff = 2000 * 2 ** (tentativa - 1) + Math.floor(Math.random() * 500);
        await this.sleep(esperaPedida ?? backoff);
        esperaPedida = null;
      } finally {
        clearTimeout(timer);
      }
    }
    if (ultimoErro instanceof ColetaError) throw ultimoErro;
    // Network errors may contain the request URL (and therefore the token). Never echo the raw error.
    const motivo = ultimoErro instanceof Error ? ultimoErro.name : "erro desconhecido";
    throw new ColetaError(`Falha de rede em ${descricao} (${motivo})`, "rede");
  }
}
