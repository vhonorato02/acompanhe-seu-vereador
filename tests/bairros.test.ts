import { describe, expect, it } from "vitest";
import { porBairro } from "@/lib/data/analise";
import { bairrosDe } from "@/lib/data/extrair";
import { contar } from "@/lib/data/query";
import type { Registro } from "@/lib/data/types";

// Phrasings copied from real ementas in the 05/11/2026 production snapshot.
describe("bairros citados na ementa (informação derivada)", () => {
  it("reconhece 'Bairro' com maiúscula, que era ignorado", () => {
    expect(bairrosDe("solicitando estudos e providências para limpeza da área do parque localizado na Rua Papa João XXIII, no Bairro Alto do Cardoso.")).toEqual(["Alto do Cardoso"]);
    expect(bairrosDe("A colocação de um novo portão e cobertura no campo do Bairro Cidade Nova.")).toEqual(["Cidade Nova"]);
  });

  it("pula o artigo depois de 'bairro' e aceita nome em minúsculas", () => {
    expect(bairrosDe("Ao Executivo Municipal solicito poda das árvores na Praça Dr. Emilio Ribas, no Bairro do São Benedito.")).toEqual(["São Benedito"]);
    expect(bairrosDe("implantação do asfalta na Travessa Domingos Cesário Quirino, Bairro das campinas.")).toEqual(["Campinas"]);
    expect(bairrosDe("reparos da calçada em torno de toda a Praça Getúlio Vargas no bairro Santa luzia.")).toEqual(["Santa Luzia"]);
  });

  it("para no fim do nome do lugar", () => {
    expect(bairrosDe("no bairro Residencial das Américas/Araretama.")).toEqual(["Residencial das Américas"]);
    expect(bairrosDe("Rua José Portes,no bairro Residencial e Comercial Portal dos Eucaliptos, localizado no Distrito de Moreira César.")).toEqual([
      "Residencial e Comercial Portal dos Eucaliptos",
      "Distrito de Moreira César",
    ]);
    expect(bairrosDe("Rua Inácio Ribeiro Aguiar, bairro Bosque.")).toEqual(["Bosque"]);
    expect(bairrosDe("no bairro CDHU. Sendo no primeiro terreno da avenida")).toEqual(["CDHU"]);
  });

  it("separa listas de bairros", () => {
    expect(bairrosDe("Implementação de uma linha direta para os bairros Pasin e Mantiqueira.")).toEqual(["Pasin", "Mantiqueira"]);
    expect(bairrosDe("nos bairros Feital, Vista Alegre e Terra Nova.")).toEqual(["Feital", "Vista Alegre", "Terra Nova"]);
    expect(bairrosDe("nos bairros Morumbi I e Morumbi II")).toEqual(["Morumbi I", "Morumbi II"]);
  });

  it("ignora 'bairro' sem nome de lugar depois", () => {
    expect(bairrosDe("atendendo aos moradores do bairro, que reclamam")).toEqual([]);
    expect(bairrosDe("melhorias no referido bairro em questão")).toEqual([]);
    expect(bairrosDe("no bairro onde moram")).toEqual([]);
    expect(bairrosDe("Pede melhorias na cidade.")).toEqual([]);
  });

  it("unifica grafias diferentes do mesmo bairro", () => {
    expect(bairrosDe("no bairro Shangri-lá")).toEqual(["Shangrilá"]);
    expect(bairrosDe("no bairro Shangrila")).toEqual(["Shangrilá"]);
    expect(bairrosDe("no Bairro Bonsucesso")).toEqual(["Bom Sucesso"]);
    expect(bairrosDe("no bairro Alto Cardoso")).toEqual(["Alto do Cardoso"]);
    expect(bairrosDe("no bairro Jardim Eloina")).toEqual(["Jardim Eloyna"]);
    expect(bairrosDe("no Loteamento Jardim Imperial no Bairro Campo Alegre.")).toEqual(["Campo Alegre"]);
    expect(bairrosDe("bairro Moreira César")).toEqual(["Distrito de Moreira César"]);
  });

  it("mantém o distrito com o prefixo", () => {
    expect(bairrosDe("no distrito de Moreira César. A população pede")).toEqual(["Distrito de Moreira César"]);
  });

  it("não repete o mesmo bairro citado duas vezes", () => {
    expect(bairrosDe("no bairro Araretama e de novo no Bairro Araretama")).toEqual(["Araretama"]);
  });
});

describe("nome exibido do bairro", () => {
  let seq = 0;
  const reg = (ementa: string): Registro => {
    seq++;
    return {
      id: String(seq), tipo: "Indicacoes", titulo: `INDICAÇÃO N.º ${seq}/2026`, numero: seq, ano: 2026, ementa,
      autoria: "", autores: [], autoresVereadores: [], data: "2026-03-10 10:00:00", link: `https://x/${seq}`,
    };
  };

  it("usa a grafia mais frequente e o número bate com a lista", () => {
    const regs = [reg("no bairro Santa Cecilia"), reg("no bairro Santa Cecília"), reg("no bairro Santa Cecília")];
    const [b] = porBairro(regs, {}, 1);
    expect(b).toMatchObject({ slug: "santa-cecilia", nome: "Santa Cecília", n: 3 });
    expect(b?.n).toBe(contar(regs, b!.filtro));
  });
});

describe("ruído encontrado no corpus de 05/11/2026", () => {
  it("aceita o fim do nome em minúsculas", () => {
    expect(bairrosDe("Ribeirão, no bairro Ouro verde.")).toEqual(["Ouro Verde"]);
    expect(bairrosDe("Mello, no Bairro Quadra coberta.")).toEqual(["Quadra Coberta"]);
    expect(bairrosDe("No Bairro Terra dos ipês 2.")).toEqual(["Terra dos Ipês II"]);
    expect(bairrosDe("no Bairro Liberdade, Distrito de Moreira césar.")).toEqual(["Liberdade", "Distrito de Moreira César"]);
  });

  it("não trata cidade, município ou zona como bairro", () => {
    expect(bairrosDe("Saúde dos bairros de Pindamonhangaba e dá outras providências.")).toEqual([]);
    expect(bairrosDe("ruas dos bairros do município, as quais")).toEqual([]);
    expect(bairrosDe("dos bairros da zona leste da cidade.")).toEqual([]);
  });

  it("não para em verbo depois do nome", () => {
    expect(bairrosDe("no bairro Araretama solicitando a limpeza")).toEqual(["Araretama"]);
  });
});
