import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARIO } from "@/lib/content/glossario";
import { dataset } from "@/lib/data/load";
import { hrefLista } from "@/lib/data/query";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Competências dos vereadores e da Prefeitura em Pindamonhangaba, glossário de termos legislativos e técnicos e tipos de proposição.",
  alternates: { canonical: "/como-funciona" },
};

export default function ComoFunciona() {
  const d = dataset();
  const existe = new Set(d.tipos.map((t) => t.contract));
  return (
    <div className="prosa">
      <h1>Como funciona a Câmara e este portal</h1>
      <p className="lede">
        Este guia explica o que compete aos {d.vereadores.length} vereadores e à Prefeitura em {SITE.cidade}, traduz termos legislativos e
        técnicos (como ementa e API) e mostra o que ainda não consta nos dados públicos da Câmara.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#papel">Câmara e Prefeitura</a></li>
          <li><a href="#dicionario">Glossário (inclui API e ementa)</a></li>
          <li><a href="#tipos">Tipos de proposição</a></li>
          <li><a href="#caminho">Por que predominam os pedidos</a></li>
          <li><a href="#limites">Dados ainda ausentes na fonte</a></li>
        </ul>
      </nav>

      <h2 id="papel">O que faz um vereador e o que cabe à Prefeitura</h2>
      <p>
        A Câmara Municipal de {SITE.cidade} conta com {d.vereadores.length} vereadores na legislatura 2025–2028. As sessões ordinárias
        ocorrem às terças-feiras, a partir das 17h, com acesso aberto ao público no plenário e transmissão pelos canais oficiais. A{" "}
        <strong>Mesa Diretora</strong> (presidência, vice-presidências e secretarias) define a pauta das votações e responde pela gestão
        interna da Casa.
      </p>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="q-camara">
          <h3 id="q-camara">Câmara Municipal (Vereadores)</h3>
          <ul>
            <li><strong>Legisla sobre o município:</strong> debate e vota leis locais, o orçamento anual e regras tributárias da cidade.</li>
            <li><strong>Fiscaliza o Executivo:</strong> requer informações oficiais, analisa contratos públicos e julga as contas do prefeito.</li>
            <li><strong>Encaminha demandas locais:</strong> formaliza pedidos de manutenção, saúde, mobilidade e iluminação aos órgãos competentes.</li>
          </ul>
        </section>
        <section className="quadro-card" aria-labelledby="q-prefeitura">
          <h3 id="q-prefeitura">Prefeitura (Prefeito e Secretarias)</h3>
          <ul>
            <li><strong>Executa obras e serviços:</strong> gerencia as equipes de pavimentação, iluminação, limpeza, postos de saúde e escolas municipais.</li>
            <li><strong>Administra o orçamento:</strong> arrecada tributos, contrata fornecedores e define a ordem de execução das despesas aprovadas.</li>
            <li><strong>Tem iniciativa exclusiva em cargos e despesas:</strong> somente o prefeito propõe leis sobre remuneração de servidores e estrutura administrativa.</li>
          </ul>
        </section>
      </div>

      <h2 id="dicionario">Glossário de termos legislativos e técnicos</h2>
      <p>Definições objetivas para termos jurídicos e de tecnologia exibidos nas listas e fichas do portal:</p>
      <div className="acordeoes">
        <details className="acordeao" open>
          <summary>Proposição e ementa</summary>
          <div className="acordeao-corpo">
            <p>
              <strong>Proposição</strong> é todo documento formal protocolado na Câmara (requerimento, indicação, moção, emenda ou projeto de
              lei).
            </p>
            <p>
              <strong>Ementa</strong> é o resumo oficial que abre o documento e antecipa seu conteúdo, como{" "}
              <em>“Solicita operação tapa-buraco no bairro Araretama”</em>.
            </p>
          </div>
        </details>
        <details className="acordeao">
          <summary>Coautoria, tramitação, sanção, veto e norma</summary>
          <div className="acordeao-corpo">
            <p>
              <strong>Coautoria:</strong> assinatura conjunta de mais de um vereador na mesma proposição. O registro entra na contagem de cada
              signatário, sempre sinalizado no item.
            </p>
            <p>
              <strong>Tramitação:</strong> percurso do projeto pelas comissões técnicas até a votação em plenário.
            </p>
            <p>
              <strong>Sanção e veto:</strong> ao aprovar um projeto de lei, a Câmara o envia ao prefeito, que pode sancioná-lo (promulgando a lei)
              ou vetá-lo no todo ou em parte, devolvendo a matéria para nova decisão do plenário.
            </p>
            <p>
              <strong>Norma:</strong> texto legal já publicado e em vigor (lei ordinária, lei complementar, decreto legislativo ou resolução).
            </p>
          </div>
        </details>
        <details className="acordeao">
          <summary>API de Dados Abertos</summary>
          <div className="acordeao-corpo">
            <p>
              <strong>API</strong> (Interface de Programação de Aplicações) é o canal eletrônico mantido pela própria Câmara Municipal para
              entregar os registros públicos em formato estruturado diretamente a programas de computador, sem transcrição manual de páginas. É
              a partir dessa API oficial que o portal atualiza sua base de dados. Saiba mais em <Link href="/metodologia">Metodologia</Link> ou
              acesse os arquivos em <Link href="/dados">Dados abertos</Link>.
            </p>
          </div>
        </details>
      </div>

      <h2 id="tipos">Tipos de proposição desta legislatura</h2>
      <div className="nota">
        <p>
          As sínteses abaixo facilitam a leitura cidadã. As atribuições formais seguem o Regimento Interno da Câmara Municipal e a Lei Orgânica
          de {SITE.cidade}.
        </p>
      </div>
      <div className="acordeoes">
        {GLOSSARIO.filter((g) => existe.has(g.contract)).map((g, idx) => (
          <details key={g.contract} id={g.contract} className="acordeao" open={idx < 2}>
            <summary>{`${d.tipos.find((t) => t.contract === g.contract)?.titulo ?? g.contract}: ${g.curto}`}</summary>
            <div className="acordeao-corpo">
              <p>{g.explicacao}</p>
              <p>
                <Link href={hrefLista("/proposicoes", { tipo: g.contract })}>Abrir proposições deste tipo</Link>
              </p>
            </div>
          </details>
        ))}
      </div>

      <h2 id="caminho">Por que predominam requerimentos e indicações</h2>
      <div className="exemplo">
        <p>
          Pedidos rotineiros de manutenção urbana e solicitações de informação ocorrem diariamente e acumulam grande volume estatístico. Já
          projetos de lei demandam estudo técnico, análise orçamentária e deliberação em plenário. Por essa razão, quantidade absoluta de
          proposições não mede relevância nem qualidade parlamentar.
        </p>
      </div>

      <h2 id="limites">Dados ainda ausentes na fonte oficial</h2>
      <p>
        Quando uma informação não é fornecida pela API de Dados Abertos da Câmara, o portal aponta a lacuna em vez de substituí-la por
        estimativas:
      </p>
      <ul>
        <li>
          <strong>Votos nominais individuais:</strong> a API legislativa não publica como cada vereador votou em cada sessão.
        </li>
        <li>
          <strong>Frequência em plenário:</strong> listas de presença aparecem apenas nas atas em PDF do site oficial da Câmara, fora dos
          dados estruturados.
        </li>
        <li>
          <strong>Situação atual da tramitação:</strong> pareceres recentes e despacho em comissões devem ser conferidos diretamente no link
          oficial que acompanha cada registro.
        </li>
      </ul>

      <p>
        Veja as regras detalhadas de contagem em <Link href="/metodologia">Metodologia</Link> ou explore a{" "}
        <Link href="/proposicoes">lista completa de proposições</Link>.
      </p>
    </div>
  );
}
