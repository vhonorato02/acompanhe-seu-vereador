import type { Metadata } from "next";
import Link from "next/link";
import { NAO_E_BAIRRO, VARIANTES_BAIRRO } from "@/lib/content/bairros";
import { MIN_BAIRRO, percent } from "@/lib/data/analise";
import { derivados } from "@/lib/data/enriquecer";
import { DESTINOS } from "@/lib/data/extrair";
import { dataset } from "@/lib/data/load";
import { panorama } from "@/lib/data/painel";
import { TEMAS } from "@/lib/data/temas";
import { dataColeta, n } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Metodologia",
  description:
    "Origem dos dados na API da Câmara de Pindamonhangaba, regras de contagem, separação de leitura automática e limitações conhecidas.",
  alternates: { canonical: "/metodologia" },
};

export default function Metodologia() {
  const d = dataset();
  const pa = panorama();
  const semVereador = d.proposicoes.filter((p) => p.autoresVereadores.length === 0).length;
  const classificados = pa.pedidos.filter((r) => derivados(r).temas.length > 0).length;
  const comBairro = d.proposicoes.filter((r) => derivados(r).bairros.length > 0).length;
  const citacoes = pa.bairros.reduce((a, b) => a + b.n, 0);
  const modo =
    d.execucao.modo === "completo"
      ? "coleta completa a partir do início"
      : d.execucao.modo === "incremental"
        ? "coleta incremental (registros novos e revisão de 45 dias anteriores)"
        : "amostra reduzida de desenvolvimento";

  return (
    <div className="prosa">
      <h1>Metodologia</h1>
      <p className="lede">
        Origem dos dados na Câmara Municipal de {SITE.cidade}, regras de contagem e funcionamento da classificação automática, para que cada
        número exibido no {SITE.nome} possa ser auditado de ponta a ponta.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#fonte">1. Origem dos dados e API</a></li>
          <li><a href="#periodo">2. Período e datas</a></li>
          <li><a href="#camadas">3. Três camadas de informação</a></li>
          <li><a href="#contagem">4. Regras de contagem</a></li>
          <li><a href="#derivados">5. Classificação automática</a></li>
          <li><a href="#privacidade">6. Proteção de dados (LGPD)</a></li>
          <li><a href="#limites">7. Limites conhecidos</a></li>
        </ul>
      </nav>

      <h2 id="fonte">1. Origem dos dados e API oficial</h2>
      <p>
        Todos os documentos provêm da <a href={d.fonte.url}>{d.fonte.nome}</a>. Termos declarados pela fonte: {d.fonte.termos}
      </p>
      <p>
        <strong>Última coleta publicada:</strong> {dataColeta(d.execucao.coletadoEm)} ({modo}
        {d.execucao.requisicoes > 0 ? `, ${n(d.execucao.requisicoes)} requisições à API` : ""}).
      </p>
      <div className="acordeoes">
        <details className="acordeao" open>
          <summary>Como funciona a coleta na API e a validação antes da publicação</summary>
          <div className="acordeao-corpo">
            <p>
              <strong>O que é a API e o token de acesso:</strong> a Câmara mantém uma API (Interface de Programação de Aplicações) que entrega
              registros públicos em formato estruturado para leitura automatizada. Para autenticação nesse serviço oficial, o coletor usa uma
              chave institucional chamada <em>token de cidadão</em>, mantida apenas em variável secreta no ambiente de publicação.
            </p>
            <p>
              <strong>Frequência incremental e rechecagem mensal:</strong> uma rotina automatizada verifica novidades a cada ~12 horas,
              revisitando os últimos 45 dias para captar edições de ementa. A cada 30 dias ocorre uma coleta integral para refletir eventuais
              exclusões ou retificações antigas na fonte.
            </p>
            <p>
              <strong>Travas de integridade:</strong> o coletor aguarda intervalo mínimo de 1 segundo entre requisições e aborta imediatamente
              caso a API altere sua estrutura, exiba bloqueio automatizado ou apresente redução abrupta superior a 10% nos registros. Quando
              qualquer trava é acionada, a publicação anterior íntegra permanece no ar.
            </p>
          </div>
        </details>
      </div>

      <h2 id="periodo">2. Período coberto e critérios de data</h2>
      <p>
        <strong>Recorte atual:</strong> {d.escopo.descricao}, reunindo proposições e normas publicadas desde{" "}
        {d.escopo.inicio.split("-").reverse().join("/")} ou numeradas a partir de 2025.
      </p>
      <p>
        Ao filtrar pelo campo <strong>Ano</strong> (por exemplo, <code>2026</code>), considera-se o ano presente no número oficial do documento
        (como <em>Requerimento 2398/2026</em>). Os gráficos <strong>Por mês</strong>, por sua vez, agrupam pela data de publicação registrada no
        sistema da Câmara, o que explica eventuais variações em viradas de ano.
      </p>

      <h2 id="camadas">3. Três camadas de informação</h2>
      <ol className="passos">
        <li>
          <strong>Fato oficial da fonte:</strong> tipo, número, título, data, autoria, ementa e endereço oficial mantêm o conteúdo publicado
          pela Câmara, com conversão apenas de entidades HTML residuais (como <code>&amp;quot;</code>) e ajuste de caixa alta para leitura.
        </li>
        <li>
          <strong>Contagem verificável:</strong> cada total exibido em painéis, cartões ou barras usa a mesma função de filtro da lista de
          destino, garantindo correspondência exata entre o número e os itens abertos ao clicar.
        </li>
        <li>
          <strong>Classificação derivada do texto:</strong> assunto, bairro citado, destinatário e vínculo projeto-lei são inferidos a partir da
          ementa por regras públicas abertas e vêm sempre identificados como leitura automática.
        </li>
      </ol>

      <h2 id="contagem">4. Regras de contagem e ausência de ranking</h2>
      <ul>
        <li>
          <strong>Coautoria contada para cada signatário ativo:</strong> quando dois ou mais vereadores assinam o mesmo documento, ele integra a
          lista de cada autor em exercício. A soma dos totais individuais supera o total de documentos únicos do Legislativo.
        </li>
        <li>
          <strong>Apelidos parlamentares reconciliados:</strong> nomes anteriores ou variações oficiais (como <em>Norbertinho</em> /{" "}
          <em>Norberto Moraes</em>) apontam para o mesmo perfil para preservar o histórico completo do mandato.
        </li>
        <li>
          <strong>Iniciativas fora dos perfis individuais:</strong> nesta coleta, {n(semVereador)} proposições têm autoria do Poder Executivo,
          de comissões, da Mesa Diretora ou de suplentes fora de exercício, permanecendo visíveis nas listas gerais.
        </li>
        <li>
          <strong>Sem ranking nem nota:</strong> volume documental não mede qualidade legislativa. Indicações rotineiras e projetos de lei têm
          naturezas distintas, e quem ocupa a presidência da Casa exerce atribuições regimentais próprias.
        </li>
      </ul>

      <h2 id="derivados">5. Regras da classificação automática</h2>

      <h3 id="temas">Assuntos dos pedidos</h3>
      <p>
        Listas públicas de expressões regulares são aplicadas às ementas dos <strong>Pedidos</strong> após normalização de acentos e maiúsculas.
        Um pedido pode corresponder a mais de um assunto (ex.: luminária de LED em via pública entra em <em>Iluminação</em> e{" "}
        <em>Ruas e asfalto</em>) ou permanecer sem categoria. Nesta coleta, <strong>{percent(classificados, pa.pedidos.length)}%</strong> dos{" "}
        {n(pa.pedidos.length)} pedidos foram classificados em ao menos um assunto.
      </p>
      <div className="acordeoes">
        <details className="acordeao">
          <summary>Ver as 12 categorias de assunto e falsos positivos bloqueados</summary>
          <div className="acordeao-corpo">
            <p>
              As expressões evitam coincidências falsas observadas na base real: <em>“posteriormente”</em> não aciona <em>poste</em>,{" "}
              <em>“aguardar”</em> não entra em <em>água</em>, o sobrenome <em>“Matos”</em> não vira <em>mato</em>, <em>“garrafa PET”</em> é
              isolada de <em>Animais</em>, <em>“medição”</em> não entra em <em>Saúde</em> e menções nominais ao vereador{" "}
              <em>“Professor Everton”</em> não inflam <em>Educação</em>.
            </p>
            <ul>
              {TEMAS.map((t) => (
                <li key={t.slug}>
                  <strong>{t.nome}:</strong> {t.descricao}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>

      <h3 id="bairros">Bairros citados no texto</h3>
      <p>
        Como o campo técnico de bairro vem vazio na API, o portal identifica menções explícitas na ementa (como <em>“no bairro Araretama”</em>{" "}
        ou <em>“distrito de Moreira César”</em>), totalizando {n(comBairro)} proposições identificadas nesta coleta. O catálogo exibe localidades
        com ao menos <strong>{MIN_BAIRRO} ocorrências</strong> ({n(pa.bairros.length)} bairros e {n(citacoes)} citações); nos perfis individuais,
        o limite mínimo é de 2 citações. Citar um bairro indica menção no texto do pedido, não execução de obra.
      </p>
      <div className="acordeoes">
        <details className="acordeao">
          <summary>Ver variantes de grafia agrupadas e termos descartados</summary>
          <div className="acordeao-corpo">
            <ul className="small">
              {VARIANTES_BAIRRO.map((g) => (
                <li key={g.nome}>
                  <strong>{g.nome}:</strong> {g.variantes.join(", ")}
                </li>
              ))}
            </ul>
            <p className="small soft">
              Expressões genéricas após “bairro” ({NAO_E_BAIRRO.join(", ")}) são descartadas automaticamente. Loteamentos distintos com nomes
              próximos permanecem separados salvo confirmação local. Para sugerir ajuste, acesse <Link href="/correcoes">Correções</Link>.
            </p>
          </div>
        </details>
      </div>

      <h3 id="destinos">Destinatários dos pedidos</h3>
      <p>
        O vocativo inicial dos primeiros 160 caracteres da ementa identifica o órgão acionado (como <em>“Ao Executivo Municipal”</em> ou{" "}
        <em>“À Sabesp”</em>), com todas as <strong>Indicações</strong> atribuídas por definição à Prefeitura. Categorias ativas:{" "}
        {DESTINOS.map((x) => x.nome).join(", ")}, além de “Outros”.
      </p>

      <h3 id="leis">Vínculo entre projeto de lei e norma publicada</h3>
      <p>
        Sempre que a ementa de uma norma publicada menciona o projeto original (ex.: <em>“Projeto de Lei nº 148/2026”</em>), os dois registros
        são associados e a norma passa a constar no perfil dos signatários do projeto ({n(pa.viraram.length)} normas vinculadas nesta coleta).
        Por ausência de menção frequente em leis do Executivo e pela presença de projetos em tramitação no total apresentado, esse número
        representa apenas um mínimo observável.
      </p>

      <h2 id="privacidade">6. Proteção de dados pessoais (LGPD)</h2>
      <p>
        Quando uma ementa de requerimento expõe nome civil ligado a saúde, vulnerabilidade ou menoridade, o registro oficial (número, data,
        autoria e link da Câmara) é mantido intacto, mas o texto exibido no site e nos arquivos abertos é substituído por nota neutra de
        privacidade. Consulte o procedimento completo em <Link href="/privacidade">Política de privacidade</Link>.
      </p>

      <h2 id="limites">7. Limites conhecidos</h2>
      <ul>
        <li><strong>Votações nominais, presença e tramitação:</strong> não constam na API de Dados Abertos da Câmara.</li>
        <li><strong>Vereadores fora de exercício:</strong> o cadastro da API lista apenas parlamentares ativos na data da coleta.</li>
        <li><strong>Exclusões raras na origem:</strong> atualizam na coleta completa executada mensalmente.</li>
        <li><strong>Íntegra dos documentos:</strong> mantida exclusivamente no site oficial da Câmara, acessível via link externo em cada item.</li>
      </ul>

      {d.execucao.avisos.length > 0 && (
        <>
          <h2 id="avisos">Avisos técnicos da última coleta</h2>
          <ul>
            {d.execucao.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </>
      )}

      <p>
        Para conferir os arquivos brutos, acesse <Link href="/dados">Dados abertos</Link>; para apontar falhas na leitura automática, consulte{" "}
        <Link href="/correcoes">Correções</Link>.
      </p>
    </div>
  );
}
