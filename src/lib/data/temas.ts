import { normalizar } from "./derive";

/**
 * Rule-based themes. Derived information: a proposition can match several themes or
 * none. The rules are public (methodology page) so anyone can check them.
 */
export interface Tema {
  slug: string;
  nome: string;
  descricao: string;
  termos: RegExp;
}

export const TEMAS: Tema[] = [
  {
    slug: "ruas-e-asfalto",
    nome: "Ruas e asfalto",
    descricao: "Pavimentação, buracos, recape, cascalho, calçadas e estradas rurais.",
    termos: /\b(afundament\w*|asfalt\w*|pavimenta\w*|recape\w*|tapa.?buraco\w*|buraco\w*|cascalh\w*|patrolament\w*|calcament\w*|calcada\w*|guia\w? e sarjeta\w*|sarjet\w*|estrada\w*|meio.?fio|operacao tapa|nivelament\w*|terraplenage\w*)\b/,
  },
  {
    slug: "iluminacao",
    nome: "Iluminação",
    descricao: "Lâmpadas, postes e iluminação pública.",
    termos: /\b(ilumina\w*|lampada\w*|poste(?:s|amento)?|luminaria\w*|reator\w*|led)\b/,
  },
  {
    slug: "limpeza-e-meio-ambiente",
    nome: "Limpeza e meio ambiente",
    descricao: "Roçada, poda, capina, limpeza, lixo, entulho, árvores e áreas verdes.",
    termos: /\b(meio ambiente|ambienta\w*|ecologic\w*|lixeira\w*|reciclage\w*|rocad\w*|roca\w*|poda\w*|capina\w*|mato|matagal\w*|limpeza\w*|entulho\w*|lixo\w*|coleta de lixo|varricao|corte de arvore\w*|supressao de arvore\w*|arvore\w*)\b/,
  },
  {
    slug: "agua-esgoto-drenagem",
    nome: "Água, esgoto e drenagem",
    descricao: "Sabesp, vazamentos, esgoto, galerias, bueiros e alagamentos.",
    termos: /\b(sabesp|esgoto\w*|vazament\w*|aguas?|pluvia\w*|drenage\w*|bueiro\w*|galeria\w*|bocas? de lobo|alagament\w*|enchente\w*|enxurrada\w*|saneamento|corrego\w*|canalizacao)\b/,
  },
  {
    slug: "transito-e-transporte",
    nome: "Trânsito e transporte",
    descricao: "Sinalização, lombadas, semáforos, ônibus e mobilidade.",
    termos: /\b(faixa elevada|transito|sinaliza\w*|lombada\w*|redutor\w* de velocidade|semaforo\w*|faixa de pedest\w*|onibus|transporte\w*|ponto\w* de onibus|abrigo\w*|estacionament\w*|mobilidade|ciclovia\w*|viva pinda|placa\w*)\b/,
  },
  {
    slug: "saude",
    nome: "Saúde",
    descricao: "UBS, hospitais, médicos, remédios e vacinas.",
    termos: /\b(saude|ubs|hospita\w*|medic(?!ao|oes)\w*|remedio\w*|vacina\w*|posto de saude|pronto.?socorro|upa|samu|consultas?(?! publica)|exame\w*|dengue|enfermag\w*)\b/,
  },
  {
    slug: "educacao",
    nome: "Educação",
    descricao: "Escolas, creches e professores.",
    termos: /\b(escola\w*|creche\w*|educa\w*|ensino|aluno\w*|professor(?:a|es|as)?\b(?! (?:everton|felipe))|merenda|cmei|emef|emeief|ee )\b/,
  },
  {
    slug: "esporte-lazer-cultura",
    nome: "Esporte, lazer e cultura",
    descricao: "Praças, quadras, parques, eventos e cultura.",
    termos: /\b(parque infantil|centro comunitari\w*|centro de convivencia|praca\w*|quadras?|campo de futebol|esport\w*|lazer|parquinho\w*|playground|academia ao ar livre|cultur\w*|evento\w*|festa\w*|biblioteca\w*|teatro)\b/,
  },
  {
    slug: "assistencia-social",
    nome: "Assistência social",
    descricao: "Idosos, pessoas com deficiência, CRAS e programas sociais.",
    termos: /\b(idos\w*|deficien\w*|pcd|autis\w*|tea\b|cras|creas|assistencia social|vulnerab\w*|morador\w* de rua|situacao de rua|cesta\w* basica\w*|acessibilidade)\b/,
  },
  {
    slug: "seguranca",
    nome: "Segurança",
    descricao: "Guarda municipal, polícia, câmeras e ronda.",
    termos: /\b(seguranca|guarda municipal|policia\w*|ronda\w*|camera\w*|monitorament\w*|videomonitorament\w*|vandalismo|furto\w*|roubo\w*)\b/,
  },
  {
    slug: "animais",
    nome: "Animais",
    descricao: "Castração, abandono, zoonoses e bem-estar animal.",
    termos: /\b(anima\w*|cao|caes|cachorro\w*|gato\w*|castracao\w*|zoonose\w*|(?<!garrafas? )pets?|cavalo\w*|equino\w*|veterinari\w*)\b/,
  },
  {
    slug: "homenagens",
    nome: "Homenagens",
    descricao: "Moções de aplauso, títulos, medalhas, datas comemorativas e nomes de ruas.",
    termos: /\b(aplauso\w*|congratula\w*|homenage\w*|titulo de cidada\w*|cidadao pindamonhangabense|medalha\w*|comenda\w*|denomina\w*|da nome|dia municipal|semana municipal|pesar|voto\w* de)\b/,
  },
];

export function temasDe(texto: string): string[] {
  const t = normalizar(texto);
  return TEMAS.filter((tema) => tema.termos.test(t)).map((tema) => tema.slug);
}

export function tema(slug: string): Tema | undefined {
  return TEMAS.find((t) => t.slug === slug);
}
