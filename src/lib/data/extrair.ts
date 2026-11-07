import { NAO_E_BAIRRO, VARIANTES_BAIRRO } from "../content/bairros";
import { normalizar, slugify } from "./derive";

/*
 * Neighbourhoods named in the summary text ("no Bairro Araretama", "nos bairros Pasin e
 * Mantiqueira", "distrito de Moreira César"). Derived information: the Câmara does not
 * classify records by neighbourhood.
 */
const GATILHO = /\b(bairros?|distrito\s+de)\b/giu;
const ARTIGO = new Set(["de", "do", "da", "dos", "das"]);
/** Words that end a place name (compared without accents, in lower case). */
const FIM = new Set([
  "a", "o", "as", "os", "ao", "aos", "na", "no", "nas", "nos", "em", "entre", "proximo", "proxima", "onde", "que", "para",
  "pelo", "pela", "com", "sendo", "junto", "perto", "atras", "frente", "conforme", "ate", "pois", "visando", "devido",
  "tendo", "sentido", "altura", "rua", "avenida", "av", "estrada", "travessa", "praca", "regiao", "area", "rodovia",
  "referido", "referida", "citado", "citada", "mesmo", "mesma", "inteiro", "todo", "toda", "localizado", "localizada",
  "localizados", "localizadas", "situado", "situada", "solicitando", "solicito", "sobre", "conhecido", "conhecida",
  "questao", "cujo", "cuja", "seja", "sejam", "e", "ou", "x", "se", "nao", "apos", "visto", "pois",
]);
/** Words after which the next word belongs to the name even in lower case ("Santa luzia"). */
const PREFIXO = new Set([
  "santa", "santo", "sao", "vila", "jardim", "parque", "alto", "cidade", "residencial", "nova", "novo", "boa", "bela",
  "bom", "campo", "portal", "terra", "chacara", "chacaras", "loteamento", "conjunto", "recanto", "nossa", "senhora",
]);
const ROMANO = /^(?:i{1,3}|iv|v|vi{1,3})$/i;
const MAX_PALAVRAS = 6;

const PARA_CANONICO = new Map<string, string>(
  VARIANTES_BAIRRO.flatMap((g) => [g.nome, ...g.variantes].map((v) => [slugify(v), g.nome] as const)),
);
const BLOQUEADOS = new Set(NAO_E_BAIRRO.map(slugify));

const maiuscula = (p: string) => /^[\p{Lu}\d]/u.test(p) || ROMANO.test(p);

function caudaMinuscula(cauda: readonly string[]): boolean {
  return cauda.length > 0 && cauda.length <= 3 && cauda.every((w) => ARTIGO.has(normalizar(w)) || !FIM.has(normalizar(w)));
}

/** Reads one place name from the start of `trecho`; returns null when no name starts there. */
function lerNome(trecho: string, permitirArtigo = true): string | null {
  const palavras = trecho.trim().split(/\s+/).filter(Boolean);
  const nome: string[] = [];
  let i = 0;
  let aposArtigo = false;
  if (permitirArtigo && palavras[0] && ARTIGO.has(normalizar(palavras[0]))) {
    i = 1;
    aposArtigo = true;
  }
  for (; i < palavras.length && nome.length < MAX_PALAVRAS; i++) {
    const p = (palavras[i] ?? "").replace(/^["“'(]+|["”')]+$/g, "");
    const n = normalizar(p);
    if (!p) break;
    if (nome.length === 0) {
      if (FIM.has(n) || ARTIGO.has(n)) break;
      if (!maiuscula(p) && !aposArtigo) break;
      nome.push(p);
      continue;
    }
    if (ARTIGO.has(n)) {
      // A particle belongs to the name only when a capitalised word follows ("Parque das Nações").
      const prox = palavras[i + 1];
      if (prox && maiuscula(prox) && !FIM.has(normalizar(prox))) {
        nome.push(n);
        continue;
      }
      if (caudaMinuscula(palavras.slice(i))) {
        nome.push(...palavras.slice(i));
        break;
      }
      break;
    }
    if (FIM.has(n)) break;
    const anterior = normalizar(nome[nome.length - 1] ?? "");
    if (maiuscula(p) || PREFIXO.has(anterior)) {
      nome.push(p);
      continue;
    }
    // "Bairro Ouro verde.", "Bairro Terra dos ipês 2.": a short lower-case tail that ends the clause.
    if (caudaMinuscula(palavras.slice(i))) nome.push(...palavras.slice(i));
    break;
  }
  return nome.length > 0 ? nome.join(" ") : null;
}

function canonico(nome: string): string {
  const titulo = nome
    .replace(/^(?:Loteamento|Bairro)\s+/i, "")
    .replace(/\s+([1-5])$/, (_, d: string) => ` ${["I", "II", "III", "IV", "V"][Number(d) - 1]}`)
    .split(/\s+/)
    .map((p, i) => {
      const b = p.toLocaleLowerCase("pt-BR");
      if (i > 0 && ["de", "do", "da", "dos", "das", "e"].includes(b)) return b;
      if (ROMANO.test(p)) return p.toUpperCase();
      if (/^[A-Z]{2,5}$/.test(p)) return p; // acronyms such as CDHU
      return b.charAt(0).toLocaleUpperCase("pt-BR") + b.slice(1);
    })
    .join(" ");
  return PARA_CANONICO.get(slugify(titulo)) ?? titulo;
}

export function bairrosDe(texto: string): string[] {
  const achados = new Map<string, string>();
  const guardar = (bruto: string | null, prefixo: string) => {
    if (!bruto) return;
    const nome = canonico(`${prefixo}${bruto}`);
    const slug = slugify(nome);
    if (slug.length < 3 || BLOQUEADOS.has(slug) || /^(?:zona|regiao)(?:-|$)/.test(slug)) return;
    achados.set(slug, nome);
  };
  for (const m of texto.matchAll(GATILHO)) {
    const gatilho = normalizar(m[1] ?? "");
    const inicio = (m.index ?? 0) + m[0].length;
    // The name ends at the end of the sentence, a bracket, a slash or a dash.
    const resto = texto.slice(inicio).replace(/Nossa Sra\.?/gi, "Nossa Senhora").split(/[.;:!?()\n/–—]\s|[;:()\n/–—]|\.$/)[0] ?? "";
    if (gatilho.startsWith("distrito")) {
      guardar(lerNome(resto.split(",")[0] ?? "", false), "Distrito de ");
    } else if (gatilho === "bairros") {
      // "nos bairros Feital, Vista Alegre e Terra Nova": one name per item, stop at the first non-name.
      for (const [n, item] of resto.split(/,\s*|\s+e\s+/).entries()) {
        const nome = lerNome(item, n === 0);
        if (!nome) break;
        guardar(nome, "");
      }
    } else {
      const trecho = (resto.split(",")[0] ?? "").replace(/\bResidencial e Comercial\b/gi, "Residencial_e_Comercial");
      // "Morumbi I e Morumbi II": two places joined by "e".
      for (const parte of trecho.split(/\s+e\s+(?=[\p{Lu}])/u)) {
        const nome = lerNome(parte);
        if (!nome) break;
        guardar(nome.replace(/_/g, " "), "");
      }
    }
  }
  return [...achados.values()];
}

/** Who a request is addressed to, from the opening words of the summary. Derived. */
export const DESTINOS = [
  { slug: "prefeitura", nome: "Prefeitura", re: /\b(executivo|prefeit\w*|secretari\w*|departament\w*|administracao municipal|municipalidade)\b/ },
  { slug: "edp", nome: "EDP (energia)", re: /\bedp\b|bandeirante energia|energia eletrica/ },
  { slug: "sabesp", nome: "Sabesp (água e esgoto)", re: /\bsabesp\b|companhia de saneamento/ },
  { slug: "der", nome: "DER (rodovias estaduais)", re: /\bder\b|departamento de estradas de rodagem/ },
  { slug: "onibus", nome: "Viva Pinda (ônibus)", re: /viva pinda/ },
  { slug: "mesa", nome: "Mesa Diretora da Câmara", re: /mesa diretora/ },
  { slug: "estado-uniao", nome: "Governo do Estado ou federal", re: /\b(governador|governo do estado|deputad\w*|ministr\w*|presidente da republica|vice-presidente da republica|senador\w*|secretaria estadual|estado de sao paulo)\b/ },
] as const;

export type Destino = (typeof DESTINOS)[number]["slug"] | "outros";

export function destinoDe(ementa: string, tipo = ""): Destino {
  // Only the opening of the text names the addressee.
  const inicio = normalizar(ementa.slice(0, 160));
  const especificos = DESTINOS.filter((d) => d.slug !== "prefeitura");
  for (const d of especificos) if (d.re.test(inicio)) return d.slug;
  // An indicação is, by definition, a suggestion to the Executive.
  if (DESTINOS[0].re.test(inicio) || /^indico\b/.test(inicio) || tipo.startsWith("Indicacoes")) return "prefeitura";
  return "outros";
}

/** "(Projeto de Lei n° 148/2026, de autoria …)" in a law's summary -> the bill it came from. */
export function projetoDeOrigem(ementa: string): { tipo: string; numero: number; ano: number } | null {
  const m =
    /projeto de (lei complementar|lei|decreto legislativo|resolucao|emenda a lei organica)\s*n?\s*[.º°o]*\s*([\d.]+)\s*\/\s*(\d{4})/.exec(
      normalizar(ementa),
    );
  if (!m?.[1] || !m[2] || !m[3]) return null;
  const tipo = {
    "lei complementar": "Projetos-de-Lei-Complementar",
    lei: "Projetos-de-Lei-Ordinaria",
    "decreto legislativo": "Projetos-de-Decreto-Legislativo",
    resolucao: "Projetos-de-Resolucao",
    "emenda a lei organica": "Propostas-de-Emenda-a-Lei-Organica",
  }[m[1]];
  if (!tipo) return null;
  return { tipo, numero: Number(m[2].replace(/\./g, "")), ano: Number(m[3]) };
}

/** Four groups for part-to-whole charts. Colour slots are fixed per group. */
export const GRUPOS = [
  { slug: "pedidos", nome: "Pedidos", descricao: "Indicações e requerimentos", tipos: ["Indicacoes", "Requerimentos", "Indicacoes-de-Projetos-de-Lei"] },
  { slug: "projetos", nome: "Projetos de lei", descricao: "Projetos, emendas e vetos", tipos: ["Projetos-de-Lei-Ordinaria", "Projetos-de-Lei-Complementar", "Projetos-de-Lei-de-Iniciativa-Popular", "Propostas-de-Emenda-a-Lei-Organica", "Emendas", "Vetos"] },
  { slug: "homenagens", nome: "Homenagens", descricao: "Moções e decretos legislativos", tipos: ["Mocoes", "Projetos-de-Decreto-Legislativo"] },
  { slug: "camara", nome: "Funcionamento da Câmara", descricao: "Resoluções, relatórios e representações", tipos: ["Projetos-de-Resolucao", "Relatorio-Final---Comissao-de-Assuntos-Relevantes", "Representacao-ao-Conselho-de-Etica-e-Decoro-Parlamentar"] },
] as const;

export type Grupo = (typeof GRUPOS)[number]["slug"];

export function grupoDe(tipo: string): Grupo {
  return GRUPOS.find((g) => (g.tipos as readonly string[]).includes(tipo))?.slug ?? "camara";
}
