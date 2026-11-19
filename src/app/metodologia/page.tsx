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
    "De onde vêm os dados do portal, o que é a API da Câmara, como cada contagem é feita e quais são os limites das classificações automáticas.",
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
      ? "coleta completa do zero"
      : d.execucao.modo === "incremental"
        ? "coleta incremental (busca páginas novas mais uma margem de segurança de 45 dias para trás)"
        : "amostra de desenvolvimento, usada apenas em testes locais";

  return (
    <div className="prosa">
      <h1>Metodologia: como cada número nasce</h1>
      <p className="lede">
        Transparência também significa mostrar a cozinha do sistema. Aqui está, sem economês de TI, de onde o {SITE.nome} busca os
        documentos, como cada conta é conferida e onde existem limites que um computador ainda não resolve sozinho.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#fonte">De onde vêm (API)</a></li>
          <li><a href="#periodo">Período e datas</a></li>
          <li><a href="#camadas">Três camadas da informação</a></li>
          <li><a href="#contagem">Regras de contagem</a></li>
          <li><a href="#derivados">Leitura automática do texto</a></li>
          <li><a href="#privacidade">Privacidade (LGPD)</a></li>
          <li><a href="#limites">Limites conhecidos</a></li>
        </ul>
      </nav>

      <h2 id="fonte">1. De onde vêm os dados (e o que é API)</h2>
      <p>
        Todos os registros vêm diretamente da <a href={d.fonte.url}>{d.fonte.nome}</a>. Termos declarados pela fonte: {d.fonte.termos}
      </p>
      <div className="exemplo">
        <p>
          <strong>O que é uma API, em português direto?</strong> <em>API</em> (Interface de Programação de Aplicações) é um canal
          eletrônico oficial mantido pela própria Câmara para que programas de computador leiam os dados públicos em formato
          organizado, sem depender de ninguém abrir página por página e copiar tabelas na mão. Para usar esse canal com
          responsabilidade, a Câmara fornece uma chave de identificação chamada <strong>token de cidadão</strong>, guardada em
          segredo no servidor de publicação.
        </p>
      </div>
      <p>
        <strong>Última coleta publicada:</strong> {dataColeta(d.execucao.coletadoEm)} ({modo}
        {d.execucao.requisicoes > 0 ? `, ${n(d.execucao.requisicoes)} consultas feitas à API` : ""}).
      </p>
      <ul>
        <li>
          <strong>Frequência de atualização:</strong> o sistema verifica a fonte automaticamente e atualiza o portal cerca de duas
          vezes por dia (a cada ~12 horas). Entre uma coleta e outra, o site exibe a fotografia exata da última coleta, com a data
          sempre visível no rodapé.
        </li>
        <li>
          <strong>Coleta diária × coleta mensal:</strong> no dia a dia usamos <em>coleta incremental</em> (busca o que entrou de novo e
          reconfere os últimos 45 dias caso alguma ementa tenha sido editada). A cada 30 dias fazemos uma{" "}
          <em>coleta completa do zero</em>, que permite perceber quando a própria Câmara corrigiu ou retirou um documento antigo.
        </li>
        <li>
          <strong>Respeito à Câmara e proteção contra erros:</strong> o coletor se identifica com nome do projeto e e-mail do
          Observatório, espera pelo menos 1 segundo entre cada consulta e trava imediatamente se a Câmara responder vazio, mudar o
          formato dos campos, exibir verificação anti-robô ou devolver um corte brusco superior a 10% no volume de registros.{" "}
          <strong>Se qualquer trava disparar, a publicação nova é cancelada:</strong> você continua vendo a última edição íntegra no ar
          e um alerta automático avisa os responsáveis.
        </li>
      </ul>

      <h2 id="periodo">2. Período e diferença entre “ano do número” e “mês de publicação”</h2>
      <p>
        <strong>Recorte atual:</strong> {d.escopo.descricao}, reunindo proposições e normas publicadas a partir de{" "}
        {d.escopo.inicio.split("-").reverse().join("/")} ou cujo número oficial já comece em 2025.
      </p>
      <div className="exemplo">
        <p>
          <strong>Por que o filtro por ano pode diferir do gráfico mês a mês?</strong> Quando você filtra pelo campo{" "}
          <strong>Ano</strong> (por exemplo, <code>2026</code>), o portal olha o ano escrito no número oficial do documento
          (<em>Requerimento nº 2398/<strong>2026</strong></em>). Já os gráficos <strong>Mês a mês</strong> usam a data exata em que a
          Câmara publicou o registro no sistema. Em viradas de ano, um pedido numerado nos últimos dias de dezembro pode aparecer no
          sistema no início de janeiro — ambas as referências estão corretas para a sua pergunta.
        </p>
      </div>

      <h2 id="camadas">3. As três camadas da informação (nunca misturadas)</h2>
      <p>
        Para que ninguém confunda dado oficial com leitura automática do computador, todo conteúdo do portal pertence a uma destas três
        camadas:
      </p>
      <ol className="passos">
        <li>
          <strong>Fato oficial da fonte:</strong> título, número, data, nome dos autores, ementa (resumo) e link oficial chegam
          exatamente como a Câmara publicou. Fazemos apenas duas limpezas visuais de leitura, sem trocar uma única palavra:
          convertemos códigos HTML residuais como <code>&amp;quot;</code> em aspas normais e transformamos textos inteiros em CAIXA
          ALTA em frases normais (mantendo a versão original a um clique no site da Câmara).
        </li>
        <li>
          <strong>Contagem exata (“número = lista”):</strong> todo número clicável do site — num cartão de vereador, numa barra de
          assunto ou numa coluna mensal — é calculado exatamente pela mesma função de busca da página para onde ele aponta. Antes de
          cada publicação, testes automáticos conferem se o número escrito na tela bate um a um com a lista que se abre ao clicar.
        </li>
        <li>
          <strong>Classificação automática (derivada):</strong> assunto do pedido, bairro citado, destinatário e vínculo entre projeto
          e lei não vêm prontos na API da Câmara. São deduzidos pelo código a partir do texto oficial da ementa, usando regras
          públicas e abertas à crítica. Como qualquer leitura automática de texto pode errar, ela aparece sempre acompanhada do aviso{" "}
          <em>Classificação automática</em> ou equivalente.
        </li>
      </ol>

      <h2 id="contagem">4. Como contamos (e por que NÃO fazemos ranking)</h2>
      <ul>
        <li>
          <strong>Coautoria conta para cada autor em exercício:</strong> a Câmara registra múltiplos autores separados por ponto e
          vírgula (“;”). Se um projeto tem a assinatura de três vereadores, ele entra no perfil de cada um dos três. Por isso, somar os
          totais individuais dos perfis sempre dá um número maior que o total único de documentos da Câmara — isso é matemático e
          esperado.
        </li>
        <li>
          <strong>Mudança de nome parlamentar:</strong> um dicionário aberto no código reconcilia apelidos e nomes anteriores já usados
          na legislatura (por exemplo, <em>Norbertinho</em> com <em>Norberto Moraes</em>, ou variações antigas de <em>Felipinho César</em>),
          para que ninguém “perca” documentos antigos por ter atualizado a grafia oficial.
        </li>
        <li>
          <strong>Autores que não são vereadores em exercício:</strong> proposições apresentadas pelo Poder Executivo (prefeito), por
          Comissões, pela Mesa Diretora ou por suplentes que já deixaram o mandato continuam pesquisáveis nas listas gerais, mas não
          ganham perfil individual aqui. Nesta coleta, {n(semVereador)} proposições não têm nenhum dos {d.vereadores.length}{" "}
          vereadores em exercício como autor.
        </li>
        <li>
          <strong>Quantidade não é qualidade:</strong> não publicamos ranking, nota, selo ou rótulo de “mais produtivo”. Indicações de
          manutenção são rápidas e numerosas; projetos de lei exigem estudo e tramitação longa. Além disso, quem preside a Câmara conduz
          as sessões e cumpre papel regimental distinto dos demais parlamentares.
        </li>
      </ul>

      <h2 id="derivados">5. Regras públicas da leitura automática do texto</h2>

      <h3 id="temas">Assuntos dos pedidos</h3>
      <p>
        Aplicamos listas públicas de palavras-chave sobre os <strong>Pedidos</strong> (indicações, requerimentos e indicações de
        projeto de lei). Antes de comparar, o sistema remove acentos e padroniza maiúsculas. Um mesmo pedido pode entrar em mais de um
        assunto (ex.: lâmpada de LED na rua entra em <em>Iluminação</em> e <em>Ruas e asfalto</em>) ou ficar sem assunto quando trata de
        tema muito específico. Nesta coleta, <strong>{percent(classificados, pa.pedidos.length)}%</strong> dos {n(pa.pedidos.length)}{" "}
        pedidos receberam ao menos um assunto.
      </p>
      <p>
        As regras passam por revisão contínua contra falsos positivos encontrados nos dados reais: por exemplo, a palavra{" "}
        <em>“posteriormente”</em> não conta como <em>poste</em>, <em>“aguardar”</em> não conta como <em>água</em>, o sobrenome{" "}
        <em>“Matos”</em> não vira <em>mato</em>, <em>“garrafa PET”</em> não entra em <em>Animais</em>, <em>“medição”</em> não entra em{" "}
        <em>Saúde</em> e referências nominais ao vereador <em>“Professor Everton”</em> não inflam o tema <em>Educação</em>.
      </p>
      <ul>
        {TEMAS.map((t) => (
          <li key={t.slug}>
            <strong>{t.nome}:</strong> {t.descricao}
          </li>
        ))}
      </ul>

      <h3 id="bairros">Bairros citados no texto</h3>
      <p>
        A Câmara possui um campo técnico de bairros na API, mas ele vem vazio nos registros públicos. Para responder à pergunta{" "}
        <em>“o que pediram para o meu bairro?”</em>, o portal lê o texto da ementa procurando expressões como{" "}
        <em>“no bairro Araretama”</em>, <em>“Bairro do São Benedito”</em>, <em>“nos bairros Pasin e Mantiqueira”</em> ou{" "}
        <em>“distrito de Moreira César”</em>, encerrando a leitura ao encontrar vírgula, ponto, nome de rua ou conectivos como{" "}
        <em>“localizado”</em> e <em>“próximo”</em>.
      </p>
      <p>
        Nesta coleta, {n(comBairro)} proposições citam ao menos um bairro identificado pelo texto. Para evitar que erros isolados de
        digitação poluam o índice geral, o catálogo público lista apenas bairros com pelo menos <strong>{MIN_BAIRRO} citações</strong>{" "}
        ({n(pa.bairros.length)} bairros e {n(citacoes)} citações somadas). Nos perfis individuais, o mínimo cai para 2 citações.
        Pedidos que trazem apenas o nome da rua sem citar o bairro não entram nessa conta — e citar um bairro significa apenas que o
        lugar foi mencionado no pedido, não que a obra foi executada.
      </p>
      <p>Grafias comprovadamente equivalentes do mesmo bairro são somadas (acentos e maiúsculas já são ignorados):</p>
      <ul className="small">
        {VARIANTES_BAIRRO.map((g) => (
          <li key={g.nome}>
            <strong>{g.nome}:</strong> {g.variantes.join(", ")}
          </li>
        ))}
      </ul>
      <p className="small soft">
        Termos genéricos que às vezes aparecem logo após a palavra “bairro” sem dar um nome real ({NAO_E_BAIRRO.join(", ")}, “zona
        leste”) são descartados automaticamente. Já lugares com nomes próximos que podem ser regiões diferentes (como “Andrade” e
        “Residencial Andrade”, ou “Ipê” e “Ipê I”) permanecem separados até confirmação da comunidade local. Viu uma grafia que deveria
        ser unida ou separada? <Link href="/correcoes">Avise o Observatório</Link>.
      </p>

      <h3 id="destinos">A quem se pede</h3>
      <p>
        Para descobrir quem foi acionado pelo vereador, o código lê os primeiros 160 caracteres da ementa — onde costuma estar o
        vocativo inicial (<em>“Ao Executivo Municipal…”</em>, <em>“À Sabesp…”</em>). Toda <strong>Indicação</strong> é contada como
        endereçada à <strong>Prefeitura</strong> por regra regimental. Órgãos e concessionárias reconhecidos hoje:{" "}
        {DESTINOS.map((x) => x.nome).join(", ")}; os demais ficam agrupados em “Outros”.
      </p>

      <h3 id="leis">Do projeto à lei (e por que a taxa é sempre um mínimo)</h3>
      <p>
        A API da Câmara não traz um código ligando automaticamente cada lei publicada ao projeto de lei que lhe deu origem. Quando a
        ementa da lei traz essa referência no texto — por exemplo, <em>“(Projeto de Lei nº 148/2026, de autoria do Vereador…)”</em> —,
        o portal conecta os dois registros e exibe a lei no perfil de quem assinou aquele projeto.
      </p>
      <p>
        Nesta coleta, <strong>{n(pa.viraram.length)} normas</strong> foram vinculadas a um projeto desta legislatura. Leis de
        iniciativa do Poder Executivo raramente citam o número do projeto em sua ementa oficial, e projetos ainda em discussão somam no
        total apresentado — portanto, esse número mostra um <strong>piso mínimo observável</strong>, nunca um “aproveitamento total”.
      </p>

      <h2 id="privacidade">6. Cuidados com dados pessoais (LGPD) na coleta</h2>
      <p>
        Embora as ementas venham de uma fonte oficial pública, requerimentos individuais por vezes mencionam nomes completos de
        cidadãos em situações delicadas de saúde, vulnerabilidade ou menoridade. Nessas situações identificadas preventivamente (ou por
        solicitação do titular), o Observatório mantém o número, a data, a autoria parlamentar e o link oficial da Câmara, mas
        substitui a ementa exibida no site e nos arquivos abertos por uma nota neutra de proteção à privacidade. Entenda todos os
        direitos em <Link href="/privacidade">Política de privacidade</Link>.
      </p>

      <h2 id="limites">7. Limites conhecidos do conjunto de dados</h2>
      <ul>
        <li>
          <strong>Sem votações nominais, presença ou andamento:</strong> essas informações ainda não são publicadas na API de Dados
          Abertos da Câmara; só um pedido futuro de abertura de dados poderá trazê-las sem trabalho manual.
        </li>
        <li>
          <strong>Apenas vereadores em exercício hoje:</strong> a lista oficial fornecida pela API não inclui histórico de suplentes que
          assumiram temporariamente no início do mandato.
        </li>
        <li>
          <strong>Atraso de até 1 mês para exclusões raras na fonte:</strong> registros muito antigos apagados ou corrigidos pela Câmara
          aparecem na próxima coleta completa mensal (a cada 30 dias).
        </li>
        <li>
          <strong>Sem texto integral copiado:</strong> este portal mostra resumo e metadados; a íntegra de cada documento permanece no
          site oficial da Câmara, acessível pelo link de cada item.
        </li>
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
        Encontrou qualquer divergência ou falso positivo? Veja <Link href="/correcoes">como avisar em poucos cliques</Link>. Se quiser
        conferir os números no seu próprio computador, <Link href="/dados">baixe os arquivos em Dados abertos</Link> ou leia{" "}
        <Link href="/como-funciona">Como funciona a Câmara</Link>.
      </p>
    </div>
  );
}
