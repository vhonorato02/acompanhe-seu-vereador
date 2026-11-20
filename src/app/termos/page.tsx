import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { dataLonga } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Condições de uso do ${SITE.nome}, reutilização de dados abertos, exibição de retratos oficiais e neutralidade eleitoral.`,
  alternates: { canonical: "/termos" },
};

export default function Termos() {
  return (
    <div className="prosa">
      <h1>Termos de uso</h1>
      <p className="lede">
        O {SITE.nome} disponibiliza gratuitamente os registros legislativos públicos da Câmara Municipal de {SITE.cidade} para fins de controle
        social e pesquisa. O portal não substitui o documento oficial na origem legislativa, único instrumento com eficácia jurídica.
      </p>

      <div className="exemplo">
        <p>
          <strong>Condição central de uso:</strong> links, gráficos e arquivos abertos podem ser consultados, compartilhados e reutilizados para
          pesquisa e jornalismo desde que a fonte oficial e a data da coleta sejam preservadas, sem adulteração estatística e sem vinculação da
          marca do Observatório a campanhas eleitorais. Antes de afirmações formais, confira sempre o link oficial na Câmara.
        </p>
      </div>

      <p className="nota">Vigentes desde {dataLonga(SITE.vigenciaPoliticas)}. O acesso contínuo ao portal implica ciência destas condições.</p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#quem">1. Identificação do mantenedor</a></li>
          <li><a href="#escopo">2. Natureza do serviço</a></li>
          <li><a href="#responsabilidade">3. Conferência na fonte</a></li>
          <li><a href="#reuso">4. Reutilização dos dados</a></li>
          <li><a href="#terceiros">5. Retratos, marcas e código</a></li>
          <li><a href="#eleitoral">6. Neutralidade eleitoral</a></li>
          <li><a href="#foro">7. Legislação e foro</a></li>
        </ul>
      </nav>

      <h2 id="quem">1. Quem mantém o portal</h2>
      <p>
        O serviço é operado pelo <strong>{SITE.razaoSocial}</strong>, associação civil sem fins lucrativos e apartidária, CNPJ {SITE.cnpj}, com
        sede na {SITE.endereco}. Comunicações formais devem ser encaminhadas para <Contato assunto="Termos de uso" />.
      </p>

      <h2 id="escopo">2. Natureza do serviço</h2>
      <ul>
        <li>
          <strong>Independência perante o Legislativo:</strong> a Câmara Municipal de {SITE.cidade} não coordena nem chancela o conteúdo aqui
          publicado. Os atos completos e tramitações vigentes constam em{" "}
          <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
        </li>
        <li>
          <strong>Sem ranking nem juízo de valor:</strong> os painéis exibem volumes documentais para orientar pesquisas temáticas, sem atribuição
          de notas, rankings ou recomendações de voto.
        </li>
        <li>
          <strong>Classificações automatizadas:</strong> categorias de assunto, bairro, destinatário e vínculo projeto-lei derivam de regras
          abertas (<Link href="/metodologia">Metodologia</Link>) sobre dados da API de Dados Abertos e trazem aviso visual em toda a interface.
        </li>
        <li>
          <strong>Atualização periódica:</strong> novas proposições são verificadas automaticamente a cada ~12 horas e exibem a data exata da
          última coleta.
        </li>
      </ul>

      <h2 id="responsabilidade">3. Responsabilidade e conferência na fonte</h2>
      <p>
        Embora testes automatizados validem as coletas antes de cada atualização e solicitações em <Link href="/correcoes">Correções</Link>{" "}
        recebam análise em até 15 dias, o portal é oferecido no estado técnico em que se encontra, sem garantia de disponibilidade ininterrupta
        ou isenção de equívocos herdados da origem.
      </p>
      <p>
        Para reportagens, petições ou pronunciamentos públicos, o usuário deve verificar o documento original no link oficial da Câmara. O
        Observatório não responde por conclusões baseadas exclusivamente em resumos sem conferência da peça original nem pelo conteúdo de
        páginas externas.
      </p>

      <h2 id="reuso">4. Reutilização dos dados abertos</h2>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="r-pode">
          <h3 id="r-pode">Usos autorizados</h3>
          <ul>
            <li>Baixar os conjuntos em CSV e JSON em <Link href="/dados">Dados abertos</Link> para pesquisa, jornalismo, educação ou projetos cívicos.</li>
            <li>Citar origem e data da coleta: <em>“Câmara Municipal de {SITE.cidade}, organizado por {SITE.nome} ({SITE.organizacao})”</em>.</li>
            <li>Auditar scripts e regras de contagem no repositório público do projeto.</li>
          </ul>
        </section>
        <section className="quadro-card" aria-labelledby="r-nao">
          <h3 id="r-nao">Condutas vedadas</h3>
          <ul>
            <li>Adulterar valores ou publicar recortes manipulados atribuindo-os ao Observatório Social.</li>
            <li>Realizar raspagem massiva sobre páginas HTML em vez de consumir diretamente os arquivos de <Link href="/dados">Dados abertos</Link>.</li>
            <li>Explorar nomes de particulares citados em ementas em desacordo com a <Link href="/privacidade">LGPD</Link>.</li>
          </ul>
        </section>
      </div>

      <h2 id="terceiros">5. Retratos oficiais, marcas e código-fonte</h2>
      <ul>
        <li>
          <strong>Documentos e retratos oficiais:</strong> pertencem à Câmara Municipal de {SITE.cidade}. As fotografias oficiais são exibidas em
          suas cores originais e no mesmo enquadramento circular uniforme para identificação cívica equânime dos vereadores em exercício;
          qualquer gabinete pode requerer a atualização da foto oficial ou substituição por iniciais neutras junto ao Observatório.
        </li>
        <li>
          <strong>Marcas institucionais:</strong> nome, emblema e logotipo pertencem ao Observatório Social do Brasil e à unidade de {SITE.cidade},
          sendo proibido utilizá-los para sugerir endosso ou parceria inexistente.
        </li>
        <li>
          <strong>Código-fonte:</strong> licenciado sob termos MIT em{" "}
          <a href={SITE.repositorio}>{SITE.repositorio.replace("https://", "")}</a>, sem extensão às marcas institucionais.
        </li>
      </ul>

      <h2 id="eleitoral">6. Neutralidade cívica e período eleitoral (Lei nº 9.504/1997)</h2>
      <p>
        Todos os parlamentares recebem tratamento idêntico: ordenação alfabética, mesma estrutura visual e ausência de cores partidárias. O portal
        não veicula anúncios, não recebe patrocínio comercial nem promove candidaturas, observando estritamente a Lei nº 9.504/1997. A reprodução
        de trechos por terceiros em material eleitoral é vedada quanto ao uso da marca do Observatório e ocorre sob inteira responsabilidade legal
        de quem a divulgar.
      </p>

      <h2 id="foro">7. Revisões, lei aplicável e foro</h2>
      <p>
        Alterações nestes termos entram em vigor mediante publicação atualizada nesta rota com nova data de vigência. Aplica-se a legislação
        brasileira, elegendo-se o foro da Comarca de Pindamonhangaba-SP, ressalvado o foro de domicílio do usuário quando assegurado por lei.
      </p>
    </div>
  );
}
