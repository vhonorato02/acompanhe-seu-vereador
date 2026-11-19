import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { dataLonga } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Regras de utilização do ${SITE.nome}, reutilização dos dados abertos, fotos oficiais e compromisso de neutralidade eleitoral.`,
  alternates: { canonical: "/termos" },
};

export default function Termos() {
  return (
    <div className="prosa">
      <h1>Termos de uso</h1>
      <p className="lede">
        O {SITE.nome} é uma ferramenta gratuita, informativa e estritamente apartidária. Ele organiza dados públicos da Câmara
        Municipal para facilitar o acompanhamento cidadão, mas nunca substitui o documento oficial — que é sempre o que tem valor legal.
      </p>

      <div className="exemplo">
        <p>
          <strong>Em português direto:</strong> você é livre para consultar, compartilhar links e baixar os dados abertos para
          estudos, reportagens ou novos projetos, desde que cite a fonte, não adultere os números nem use a marca do Observatório em
          campanha eleitoral. E lembre: antes de fazer uma cobrança pública formal com base em um número, clique no item e confira o
          documento oficial na Câmara.
        </p>
      </div>

      <p className="nota">Vigentes desde {dataLonga(SITE.vigenciaPoliticas)}. Ao navegar no portal, você concorda com estas condições.</p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#quem">1. Quem mantém</a></li>
          <li><a href="#escopo">2. O que é e o que não é</a></li>
          <li><a href="#responsabilidade">3. Responsabilidade e conferência</a></li>
          <li><a href="#reuso">4. Uso dos dados abertos</a></li>
          <li><a href="#terceiros">5. Fotos, marcas e código</a></li>
          <li><a href="#eleitoral">6. Neutralidade eleitoral</a></li>
          <li><a href="#foro">7. Lei e foro</a></li>
        </ul>
      </nav>

      <h2 id="quem">1. Quem oferece o portal</h2>
      <p>
        Este serviço é mantido pelo <strong>{SITE.razaoSocial}</strong>, associação civil sem fins lucrativos e apartidária, inscrita no
        CNPJ sob o nº {SITE.cnpj}, com sede na {SITE.endereco}. Para dúvidas ou notificações sobre estes termos, escreva para{" "}
        <Contato assunto="Termos de uso" />.
      </p>

      <h2 id="escopo">2. O que o portal é — e o que ele faz questão de NÃO ser</h2>
      <ul>
        <li>
          <strong>Não é o site oficial da Câmara:</strong> o Observatório Social é independente. A Câmara Municipal de {SITE.cidade} não
          administra, não revisa e não endossa estas páginas. Os processos integrais, a tramitação e as votações oficiais permanecem em{" "}
          <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
        </li>
        <li>
          <strong>Mostra volume documental, nunca qualidade ou “nota”:</strong> contagens ajudam a encontrar assuntos e documentos, mas
          não medem o valor de um mandato. Não há ranking, selo nem recomendação de voto.
        </li>
        <li>
          <strong>Classificações automáticas podem errar:</strong> temas, bairros e destinatários são lidos do texto oficial por regras
          públicas (<Link href="/metodologia">Metodologia</Link>) porque a Câmara ainda não entrega esses campos preenchidos na sua{" "}
          <em>API de Dados Abertos</em> (o balcão eletrônico oficial de dados). Sempre sinalizamos quando uma leitura é automática.
        </li>
        <li>
          <strong>Retrato periódico da coleta:</strong> o site atualiza automaticamente cerca de duas vezes por dia e mostra a data da
          última coleta. Correções feitas pela Câmara aparecem após a atualização seguinte.
        </li>
      </ul>

      <h2 id="responsabilidade">3. Responsabilidade e dever de conferir a fonte</h2>
      <p>
        O Observatório aplica checagens automatizadas antes de publicar e recebe avisos de correção com resposta em até 15 dias (
        <Link href="/correcoes">Correções</Link>). Ainda assim, o portal é disponibilizado “no estado em que se encontra”, sem garantia de
        disponibilidade ininterrupta ou ausência total de imprecisões herdadas da fonte oficial ou de leituras automáticas do texto.
      </p>
      <p>
        Antes de publicar matéria jornalística, petição, denúncia ou afirmação pública atribuída a algum vereador,{" "}
        <strong>confira sempre o documento original no link oficial</strong> que acompanha cada item. Na extensão permitida pela
        legislação brasileira, o Observatório não se responsabiliza por decisões tomadas exclusivamente a partir de contagens resumidas
        sem conferência do ato oficial, nem pelo conteúdo mantido em sites externos ligados a partir daqui.
      </p>

      <h2 id="reuso">4. Reutilização dos dados abertos</h2>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="r-pode">
          <h3 id="r-pode">O que você PODE fazer</h3>
          <ul>
            <li>Baixar os arquivos CSV e JSON em <Link href="/dados">Dados abertos</Link> para pesquisa, jornalismo, aulas ou projetos cívicos e comerciais lícitos.</li>
            <li>Citar a origem com data da coleta: <em>“Câmara Municipal de {SITE.cidade}, organizado por {SITE.nome} ({SITE.organizacao})”</em>.</li>
            <li>Auditar nossas contas diretamente no código aberto ou nas tabelas brutas.</li>
          </ul>
        </section>
        <section className="quadro-card" aria-labelledby="r-nao">
          <h3 id="r-nao">O que você NÃO PODE fazer</h3>
          <ul>
            <li>Alterar números ou editar recortes fora de contexto apresentando sua análise como se fosse publicação do Observatório.</li>
            <li>Sobrecarregar o portal raspando milhares de páginas HTML com robôs (use os arquivos completos de <Link href="/dados">Dados abertos</Link>).</li>
            <li>Reutilizar nomes de cidadãos citados em ementas sem observar a <Link href="/privacidade">LGPD</Link>.</li>
          </ul>
        </section>
      </div>

      <h2 id="terceiros">5. Fotos oficiais, marcas e código aberto</h2>
      <ul>
        <li>
          <strong>Documentos e fotos da Câmara:</strong> títulos, ementas e retratos oficiais dos vereadores vêm da API de Dados Abertos
          da Câmara Municipal de {SITE.cidade} e continuam sob responsabilidade dela. Os retratos oficiais são exibidos{" "}
          <strong>em suas cores originais com o mesmo enquadramento circular uniforme</strong> para todos os vereadores em exercício,
          apenas para identificação cívica clara e sem destaque visual para ninguém; qualquer gabinete pode solicitar a atualização da
          foto oficial ou sua substituição por iniciais neutras enviando e-mail ao Observatório.
        </li>
        <li>
          <strong>Marcas do Observatório Social:</strong> o nome, o emblema e o logotipo do Observatório Social do Brasil pertencem à rede
          OSB e à unidade local. Não os utilize para sugerir apoio, parceria, aval institucional ou autoria inexistente.
        </li>
        <li>
          <strong>Código-fonte aberto:</strong> o programa que gera o portal está sob licença MIT em{" "}
          <a href={SITE.repositorio}>{SITE.repositorio.replace("https://", "")}</a>. A licença livre do código não se estende às marcas do
          Observatório.
        </li>
      </ul>

      <h2 id="eleitoral">6. Neutralidade cívica e período eleitoral (Lei nº 9.504/1997)</h2>
      <p>
        O portal trata todos os parlamentares de forma rigorosamente igual: ordem alfabética, mesmo layout, mesmas informações e nenhuma
        cor de partido. Não fazemos propaganda política, não pedimos voto, não aceitamos patrocínio nem anúncios comerciais e não
        impulsionamos nem alteramos o comportamento do site em período eleitoral (Lei nº 9.504/1997). É proibido usar o nome, o logotipo
        ou páginas do Observatório como peça de campanha ou impulsionamento pago; qualquer pessoa ou candidatura que reproduzir capturas
        ou gráficos responde integralmente pelo cumprimento da legislação eleitoral.
      </p>

      <h2 id="foro">7. Atualizações, lei aplicável e foro</h2>
      <p>
        Estes termos podem ser revisados para acompanhar melhorias do portal ou exigências legais; a versão vigente e sua data ficam
        sempre visíveis nesta página, com histórico público no repositório. Aplica-se a legislação brasileira, ficando eleito o foro da
        Comarca de Pindamonhangaba-SP para resolver eventuais controvérsias, ressalvado o direito do consumidor ou titular de dados de
        acionar o foro de seu domicílio quando garantido por lei.
      </p>
    </div>
  );
}
