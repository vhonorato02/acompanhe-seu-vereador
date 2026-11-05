import { describe, expect, it } from "vitest";
import { csv } from "@/lib/data/csv";

describe("CSV de dados legislativos", () => {
  it("usa UTF-8 com BOM, separador ponto e vírgula e CRLF", () => {
    expect(csv([["autor", "ementa"], ["Ana", "Rua; praça"]])).toBe("\ufeffautor;ementa\r\nAna;\"Rua; praça\"\r\n");
  });

  it("faz escape de aspas e quebras sem perder o conteúdo", () => {
    expect(csv([['Diz "oi"', "linha 1\nlinha 2"]])).toBe('\ufeff"Diz ""oi""";"linha 1\nlinha 2"\r\n');
  });

  it.each(["=SUM(1,1)", "+cmd", "-2+3", "@SUM(A1:A2)", " \t=HYPERLINK(\"https://x\")", "\ufeff=1+1"])(
    "neutraliza texto de fonte externa que inicia fórmula: %s",
    (entrada) => {
      expect(csv([[entrada]])).toBe(csv([["'" + entrada]]));
    },
  );

  it("não altera números negativos legítimos", () => {
    expect(csv([[-5, 2026]])).toBe("\ufeff-5;2026\r\n");
  });
});
