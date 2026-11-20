export type TemaModo = "system" | "light" | "dark";

export const CHAVE_TEMA = "asv-tema";
export const COR_TEMA_CLARO = "#f6f7f3";
export const COR_TEMA_ESCURO = "#0b0e0a";

/** Reads the explicit theme override from localStorage without throwing when storage is restricted. */
export function lerTema(): TemaModo {
  try {
    const salvo = window.localStorage.getItem(CHAVE_TEMA);
    if (salvo === "light" || salvo === "dark") return salvo;
  } catch (erro) {
    void erro;
  }
  return "system";
}

/** Reports whether the operating system / browser currently prefers dark mode. */
export function sistemaEscuro(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Updates <meta name="color-scheme"> and a single manual <meta name="theme-color"> override in <head>. */
export function sincronizarMetaTema(modo: TemaModo): void {
  const metaEsquema = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (metaEsquema) {
    metaEsquema.content = modo === "system" ? "light dark" : modo;
  }

  const existente = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-tema-manual="1"]');
  if (modo === "system") {
    existente?.remove();
    return;
  }

  const cor = modo === "dark" ? COR_TEMA_ESCURO : COR_TEMA_CLARO;
  if (existente) {
    existente.content = cor;
    return;
  }

  const nova = document.createElement("meta");
  nova.name = "theme-color";
  nova.dataset.temaManual = "1";
  nova.content = cor;
  document.head.appendChild(nova);
}

/** Applies the theme immediately to DOM metadata and persists only explicit overrides ("light" | "dark"). */
export function definirTema(modo: TemaModo): void {
  sincronizarMetaTema(modo);
  try {
    if (modo === "system") {
      window.localStorage.removeItem(CHAVE_TEMA);
    } else {
      window.localStorage.setItem(CHAVE_TEMA, modo);
    }
  } catch (erro) {
    void erro;
  }
}
