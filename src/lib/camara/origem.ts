/** Strict host and protocol allowlist for URLs received from the official Câmara API. */
const HOSTS_OFICIAIS = new Set(["www.pindamonhangaba.sp.leg.br", "pindamonhangaba.sp.leg.br"]);

export function origemDaCamara(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (
      u.protocol !== "https:" ||
      !HOSTS_OFICIAIS.has(u.hostname) ||
      u.port !== "" ||
      u.username !== "" ||
      u.password !== ""
    ) return null;
    return u;
  } catch {
    return null;
  }
}
