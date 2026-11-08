import type { Dataset, Vereador } from "../data/types";
import { SITE } from "../site";

/**
 * Schema.org descriptions for search engines and AI answer engines. Facts only: who publishes
 * the portal, what the open data is and who each councillor is. No ratings, no party colours,
 * nothing that ranks one councillor over another.
 */

type Ld = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#organizacao`;
const CAMARA = {
  "@type": "GovernmentOrganization",
  name: "Câmara Municipal de Pindamonhangaba",
  url: "https://www.pindamonhangaba.sp.leg.br",
} as const;
const CIDADE = {
  "@type": "City",
  name: "Pindamonhangaba",
  containedInPlace: { "@type": "State", name: "São Paulo" },
} as const;

export function organizacaoLd(): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": ORG_ID,
    name: SITE.organizacao,
    legalName: SITE.razaoSocial,
    taxID: SITE.cnpj,
    url: SITE.osb.site,
    logo: `${SITE.url}/marca/logo-osb.png`,
    email: SITE.contatoEmail,
    description: `Associação civil apartidária que busca ${SITE.missao}.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua Deputado Claro César, 44, sobreloja",
      addressLocality: "Pindamonhangaba",
      addressRegion: "SP",
      postalCode: "12400-220",
      addressCountry: "BR",
    },
    areaServed: CIDADE,
    sameAs: [SITE.osb.instagram, SITE.osb.facebook, SITE.osb.youtube],
    parentOrganization: { "@type": "NGO", name: "Observatório Social do Brasil", url: SITE.osb.rede },
  };
}

export function websiteLd(): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#site`,
    name: `${SITE.nome} — ${SITE.cidade}`,
    url: SITE.url,
    description: SITE.lema,
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
    about: CAMARA,
  };
}

export function datasetLd(d: Dataset): Ld {
  const arquivo = (nome: string, formato: string) => ({
    "@type": "DataDownload",
    encodingFormat: formato,
    contentUrl: `${SITE.url}/dados/${nome}`,
  });
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Proposições, normas e vereadores da Câmara Municipal de Pindamonhangaba",
    description: `${d.escopo.descricao}. Coletado da API de dados abertos da Câmara, com o link para o documento oficial de cada registro.`,
    url: `${SITE.url}/dados`,
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    license: `${SITE.url}/termos`,
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isBasedOn: d.fonte.url,
    spatialCoverage: CIDADE,
    temporalCoverage: `${d.escopo.inicio}/..`,
    dateModified: d.execucao.coletadoEm,
    variableMeasured: ["tipo", "número", "ano", "data de publicação", "autoria", "ementa", "link oficial"],
    distribution: [
      arquivo("proposicoes.csv", "text/csv"),
      arquivo("proposicoes.json", "application/json"),
      arquivo("normas.csv", "text/csv"),
      arquivo("normas.json", "application/json"),
      arquivo("vereadores.json", "application/json"),
    ],
  };
}

export function vereadorLd(v: Vereador): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: v.nome,
    jobTitle: v.funcao && v.funcao !== "Vereador" ? `Vereador (${v.funcao} da Mesa Diretora)` : "Vereador",
    url: `${SITE.url}/vereadores/${v.slug}`,
    ...(v.foto ? { image: `${SITE.url}${v.foto}` } : {}),
    sameAs: [v.link],
    worksFor: CAMARA,
    workLocation: CIDADE,
  };
}

/** Serialises for an inline <script>: "<" is escaped so no text can close the tag. */
export function serializarLd(ld: Ld | Ld[]): string {
  return JSON.stringify(ld).replace(/</g, "\\u003c");
}
