const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});
const numero = new Intl.NumberFormat("pt-BR");
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_LONGOS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** API dates have no offset; they are local time in Pindamonhangaba. */
export function dataPublicacao(data: string): string {
  const [d] = data.split(" ");
  if (!d) return data;
  const [a, m, dia] = d.split("-");
  return `${dia}/${m}/${a}`;
}

/** "2026-10-23 16:21:42" -> "23 out 2026" */
export function dataCurta(data: string): string {
  const [a, m, d] = data.slice(0, 10).split("-");
  return `${Number(d)} ${MESES[Number(m) - 1] ?? m} ${a}`;
}

/** "2026-10-23" -> "Quinta, 23 de outubro" */
export function diaPorExtenso(dia: string): string {
  const dt = new Date(`${dia}T12:00:00Z`);
  const semana = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(dt);
  const [, m, d] = dia.split("-");
  const s = `${semana.replace("-feira", "")}, ${Number(d)} de ${MESES_LONGOS[Number(m) - 1]}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function nomeMes(m: number, longo = false): string {
  return (longo ? MESES_LONGOS : MESES)[m - 1] ?? String(m);
}

export function dataColeta(iso: string): string {
  return dataHora.format(new Date(iso));
}

export function n(x: number): string {
  return numero.format(x);
}

export function plural(x: number, um: string, varios: string): string {
  return `${n(x)} ${x === 1 ? um : varios}`;
}

/** "8 de novembro de 2026" from an ISO day. */
export function dataLonga(dia: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${dia}T12:00:00Z`));
}
