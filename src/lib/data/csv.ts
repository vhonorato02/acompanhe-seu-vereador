/** UTF-8 / semicolon CSV for Brazilian spreadsheets, with formula-injection protection. */
export function csv(linhas: ReadonlyArray<ReadonlyArray<string | number | null>>): string {
  const celula = (valor: string | number | null): string => {
    let texto = valor === null ? "" : String(valor);
    // Text from a public API must never become an executable spreadsheet formula.
    if (typeof valor === "string" && /^[\u0000-\u0020\u007f\u00a0\u2000-\u200f\u2028\u2029\u2060\ufeff]*[=+\-@]/u.test(texto)) {
      texto = `'${texto}`;
    }
    return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  return "\ufeff" + linhas.map((linha) => linha.map(celula).join(";")).join("\r\n") + "\r\n";
}
