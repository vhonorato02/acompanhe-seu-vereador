import { describe, expect, it } from "vitest";
import { temasDe } from "@/lib/data/temas";

// False positives found in the 05/11/2026 production snapshot.
describe("assuntos: falsos positivos do corpus real", () => {
  it("'posterior' não é poste de iluminação", () => {
    expect(temasDe("a realização de estudos técnicos e a posterior adoção de providências")).not.toContain("iluminacao");
    expect(temasDe("troca de lâmpada no poste da Rua X")).toContain("iluminacao");
  });

  it("'aguardar' não é água", () => {
    expect(temasDe("munícipes que necessitam aguardar o ônibus na região")).not.toContain("agua-esgoto-drenagem");
    expect(temasDe("vazamento de água na Rua X")).toContain("agua-esgoto-drenagem");
  });

  it("sobrenome Matos não é mato", () => {
    expect(temasDe("tapa buraco na Rua Geraldino de Oliveira Matos")).not.toContain("limpeza-e-meio-ambiente");
    expect(temasDe("roçada do mato alto no terreno")).toContain("limpeza-e-meio-ambiente");
  });

  it("Petrobras e garrafa pet não são animais", () => {
    expect(temasDe("convênio com a Petrobras")).not.toContain("animais");
    expect(temasDe("coleta de garrafas pet para reciclagem")).not.toContain("animais");
    expect(temasDe("Institui o programa Farmácia Pet Solidária")).toContain("animais");
  });

  it("medição de obra não é saúde", () => {
    expect(temasDe("não apresentou os relatórios de medição e execução contratual")).not.toContain("saude");
    expect(temasDe("falta de médicos na UBS")).toContain("saude");
  });

  it("igreja Quadrangular não é esporte", () => {
    expect(temasDe("em frente à Igreja do Evangelho Quadrangular")).not.toContain("esporte-lazer-cultura");
    expect(temasDe("reforma da quadra de esportes")).toContain("esporte-lazer-cultura");
  });

  it("consulta pública não é saúde", () => {
    expect(temasDe("realização de consulta pública sobre o plano diretor")).not.toContain("saude");
    expect(temasDe("demora para agendar consultas na UBS")).toContain("saude");
  });
});
