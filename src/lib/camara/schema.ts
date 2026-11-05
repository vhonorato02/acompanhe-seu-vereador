import { z } from "zod";
import { origemDaCamara } from "./origem";

// Shapes observed in the Câmara open-data API (SoftCam) on 24/10/2026.
// Unknown extra fields are tolerated but reported, so a format change is noticed.

const urlOficial = z.string().url().refine((url) => origemDaCamara(url) !== null, "Link externo à origem oficial");

export const vereadorApi = z.object({
  nome: z.string().min(1),
  partido: z.string(),
  funcao: z.string(),
  imagem: z.string(),
  link: urlOficial,
});

export const tipoApi = z.object({
  contract: z.string().min(1),
  titulo: z.string().min(1),
  link: z.string(),
});

export const proposicaoApi = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  titulo: z.string().min(1),
  ementa: z.string(),
  autoria: z.string(),
  link: urlOficial,
});

export const vereadoresResponse = z.array(vereadorApi);
export const tiposResponse = z.array(tipoApi);
export const proposicoesResponse = z.array(proposicaoApi);

export type VereadorApi = z.infer<typeof vereadorApi>;
export type TipoApi = z.infer<typeof tipoApi>;
export type ProposicaoApi = z.infer<typeof proposicaoApi>;

export const KNOWN_KEYS: Record<string, readonly string[]> = {
  vereador: Object.keys(vereadorApi.shape),
  tipo: Object.keys(tipoApi.shape),
  proposicao: Object.keys(proposicaoApi.shape),
};

/** Returns keys present in raw records that the schema does not know about. */
export function unknownKeys(kind: keyof typeof KNOWN_KEYS, raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const known = new Set(KNOWN_KEYS[kind]);
  const extra = new Set<string>();
  for (const item of raw) {
    if (item && typeof item === "object") {
      for (const k of Object.keys(item)) if (!known.has(k)) extra.add(k);
    }
  }
  return [...extra].sort();
}
