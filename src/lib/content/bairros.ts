/**
 * Versioned vocabulary for neighbourhoods found in summary text (derived information).
 * Only spelling variants of the same name are merged here; places that may be
 * different (for example "Ipê" and "Ipê I") stay apart until someone confirms them.
 * Accents and case are already ignored by the slug, so "Santa Cecilia" needs no entry.
 * Shown on the methodology page so anyone can check it.
 */
export const VARIANTES_BAIRRO: ReadonlyArray<{ nome: string; variantes: readonly string[] }> = [
  { nome: "Shangrilá", variantes: ["Shangri-lá", "Shangri-la", "Shangrila", "Shangri Lá", "Shangri"] },
  { nome: "Bom Sucesso", variantes: ["Bonsucesso"] },
  { nome: "Jardim Eloyna", variantes: ["Jardim Eloina", "Jardim Eloína", "Jardim Heloyna"] },
  { nome: "Massaim", variantes: ["Massain", "Maçaim"] },
  { nome: "Jardim Rezende", variantes: ["Jardim Resende"] },
  { nome: "Laerte Assumpção", variantes: ["Laerte Assunção"] },
  { nome: "Alto do Cardoso", variantes: ["Alto Cardoso"] },
  { nome: "Alto Tabaú", variantes: ["Alto do Tabaú"] },
  { nome: "Vitória Park", variantes: ["Vitória Parque"] },
  { nome: "Chácara da Galega", variantes: ["Chácara Galega", "Chácaras Galega", "Galega"] },
  { nome: "Ipê II", variantes: ["Ipê 2"] },
  { nome: "Terra dos Ipês II", variantes: ["Terra dos Ipê II"] },
  { nome: "Ipê I", variantes: ["Ipê 1"] },
  { nome: "Marieta Azeredo", variantes: ["Marieta Aparecida Azeredo"] },
  // "Bairro Moreira César" in a request refers to the district.
  { nome: "Distrito de Moreira César", variantes: ["Moreira César", "Distrito de Moreira"] },
];

/** Words that follow "bairro" but are not a place name on their own. */
export const NAO_E_BAIRRO: readonly string[] = [
  "Residencial", "Loteamento", "Jardim", "Vila", "Parque", "Santa", "São", "Conjunto", "Bairro", "Bairros",
  "Pindamonhangaba", "Município", "Cidade", "Outras", "Outros", "Região", "Zona",
];
