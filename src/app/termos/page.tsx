import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { dataLonga } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Condições de uso do ${SITE.nome} e dos seus dados abertos.`,
  alternates: { canonical: "/termos" },
};

export default function Termos() {
  return (
    <div className="prosa">
      <h1>Termos de uso</h1>
      <p className="lede">
        O {SITE.nome} é gratuito, informativo e apartidário. Ele organiza o que a Câmara Municipal publica e sempre aponta para o
        documento oficial, que é o que vale.
      </p>
      <p className="nota">Vigentes desde {dataLonga(SITE.vigenciaPoliticas)}. Ao usar o portal, você concorda com estes termos.</p>

      <h2>1. Quem oferece</h2>
      <p>
        O portal é mantido pelo {SITE.razaoSocial}, CNPJ {SITE.cnpj}, {SITE.endereco}. Contato:{" "}
        <Contato assunto="Termos de uso" />.
      </p>

      <h2>2. O que o portal é e o que não é</h2>
      <ul>
        <li>
          <strong>Não é o site oficial da Câmara</strong> e não fala em nome dela. A Câmara Municipal de Pindamonhangaba não revisa
          nem endossa o portal. Documentos, tramitação e votações oficiais estão em{" "}
          <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
        </li>
        <li>
          <strong>Mostra quantidade, não qualidade.</strong> Contagens de proposições não medem a qualidade ou a importância do
          trabalho de um vereador, e nada no portal é ranking, nota, recomendação de voto ou juízo sobre um mandato.
        </li>
        <li>
          <strong>Classificações automáticas</strong> (bairro, assunto, destinatário) são feitas por regras públicas, descritas na{" "}
          <Link href="/metodologia">metodologia</Link>, e aparecem marcadas como tal. Podem errar.
        </li>
        <li>
          <strong>Os dados podem ter atraso ou erro.</strong> A coleta é automática, cerca de duas vezes por dia; a data da última
          coleta aparece nas páginas. Se a Câmara corrigir um documento, a mudança aparece na coleta seguinte.
        </li>
      </ul>

      <h2>3. Responsabilidade</h2>
      <p>
        O Observatório trabalha para que as informações sejam fiéis à fonte e corrige o que for apontado (
        <Link href="/correcoes">como avisar</Link>). Mesmo assim, o portal é oferecido como está, sem garantia de que esteja
        sempre disponível, completo ou livre de erros. Antes de tomar uma decisão ou fazer uma afirmação pública com base nele,
        confira o documento oficial no link de cada item. Na extensão permitida pela lei, o Observatório não responde por decisões
        tomadas apenas com base no portal, nem pelo conteúdo dos documentos oficiais e dos sites externos para onde ele aponta.
      </p>

      <h2>4. Reutilização dos dados</h2>
      <ul>
        <li>
          Os <Link href="/dados">dados abertos</Link> (CSV e JSON) podem ser usados para qualquer finalidade lícita, inclusive
          comercial, desde que você cite a fonte: “Câmara Municipal de Pindamonhangaba, organizado por {SITE.nome} (
          {SITE.organizacao})”, com a data da coleta.
        </li>
        <li>
          Não apresente dados alterados, recortados de forma enganosa ou suas próprias análises como se fossem do portal ou do
          Observatório.
        </li>
        <li>
          Para baixar muitos dados, use os arquivos de dados abertos em vez de copiar página por página. Acessos automatizados em
          volume que prejudiquem o funcionamento podem ser bloqueados.
        </li>
        <li>
          O uso dos dados deve respeitar a LGPD: ementas podem citar pessoas, e quem reutiliza responde pelo próprio tratamento
          (veja a <Link href="/privacidade">política de privacidade</Link>).
        </li>
      </ul>

      <h2>5. Conteúdos de terceiros e marcas</h2>
      <ul>
        <li>
          Títulos, ementas e fotos oficiais dos vereadores são publicados pela Câmara Municipal de Pindamonhangaba e continuam sob
          responsabilidade dela.
        </li>
        <li>
          O nome e o logotipo do Observatório Social do Brasil são marcas da rede OSB e do Observatório local. Não os use para
          sugerir apoio, parceria ou autoria que não existam.
        </li>
        <li>
          O código-fonte é aberto, sob licença MIT, em{" "}
          <a href={SITE.repositorio}>{SITE.repositorio.replace("https://", "")}</a>. A licença do código não se estende às marcas.
        </li>
      </ul>

      <h2>6. Neutralidade, inclusive em período eleitoral</h2>
      <p>
        O portal trata todos os vereadores da mesma forma: ordem alfabética, mesmo layout, mesmas informações e nenhuma cor de
        partido. Ele não faz propaganda, não pede voto e não muda de comportamento em período eleitoral. Uso de capturas ou dados
        do portal em campanha é de responsabilidade de quem os usa e deve respeitar a legislação eleitoral.
      </p>

      <h2>7. Mudanças, lei e foro</h2>
      <p>
        Estes termos podem mudar; a versão vigente e a data ficam nesta página, e o histórico fica no código público. Aplica-se a
        lei brasileira. Fica eleito o foro da Comarca de Pindamonhangaba-SP, ressalvado o direito do consumidor de propor ação no
        seu domicílio.
      </p>
    </div>
  );
}
