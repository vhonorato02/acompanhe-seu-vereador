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
  description: "De onde vêm os dados do portal, como são contados, o que é classificação automática e quais são os limites.",
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
      ? "coleta completa"
      : d.execucao.modo === "incremental"
        ? "coleta incremental: páginas novas mais uma margem de 45 dias das anteriores"
        : "amostra de desenvolvimento, não a coleta real";
  return (
    <div className="prosa">
      <h1>Metodologia</h1>
      <p className="soft" style={{ fontSize: "var(--step-1)" }}>
        Como o {SITE.nome} transforma os dados abertos da Câmara em números, e o que cada número quer e não quer dizer.
      </p>

      <h2>De onde vêm os dados</h2>
      <p>
        Todos os dados vêm da <a href={d.fonte.url}>{d.fonte.nome}</a>, consultada com um token de cidadão. Termos da fonte:{" "}
        {d.fonte.termos}
      </p>
      <p>
        Última coleta: {dataColeta(d.execucao.coletadoEm)} ({modo}
        {d.execucao.requisicoes > 0 ? `, ${n(d.execucao.requisicoes)} consultas à API` : ""}). Os dados são atualizados
        automaticamente duas vezes por dia, por volta das 6h e das 18h; entre uma coleta e outra, o portal mostra a fotografia da
        última coleta, com a data acima. Se uma coleta falhar, o site continua com a anterior e um aviso automático chega ao
        Observatório.
      </p>
      <p>
        O coletor se identifica, espera pelo menos 1 segundo entre consultas e para se a resposta vier vazia, em formato
        inesperado, com desafio anti-robô ou com queda brusca de volume. Nesses casos o site não é atualizado e continua mostrando a
        última coleta boa. A cada 30 dias a coleta é refeita do zero, para captar registros corrigidos ou retirados pela Câmara.
      </p>

      <h2>Período</h2>
      <p>
        {d.escopo.descricao}: proposições e normas publicadas desde {d.escopo.inicio.split("-").reverse().join("/")} ou numeradas
        a partir de 2025. O “ano” dos filtros é o do número oficial (por exemplo, Requerimento nº 2398/<strong>2026</strong>); os
        gráficos mês a mês usam a data em que a Câmara publicou o documento.
      </p>

      <h2>Três tipos de informação</h2>
      <ul>
        <li>
          <strong>Fato da fonte:</strong> título, número, data, autoria, ementa e link, como a Câmara publica. O portal só converte
          códigos como <code>&amp;quot;</code> em aspas e põe em minúsculas ementas escritas inteiras em maiúsculas.
        </li>
        <li>
          <strong>Contagem:</strong> quantos registros atendem a um filtro. Todo número do portal é calculado com o mesmo filtro da
          lista para a qual ele aponta, e um teste automático garante que número e lista batem.
        </li>
        <li>
          <strong>Classificação automática (derivada):</strong> assunto, bairro citado, destinatário do pedido e ligação entre
          projeto e lei. Não existem como campo na fonte; são calculados a partir do texto, com regras públicas listadas abaixo, e
          podem errar. Aparecem sempre com a marca <em>classificação automática</em> ou equivalente.
        </li>
      </ul>

      <h2>Como contamos</h2>
      <ul>
        <li>
          <strong>Coautoria conta para cada coautor.</strong> A Câmara publica a autoria como uma lista separada por “;”. Um
          requerimento assinado por três vereadores aparece no perfil dos três. Por isso a soma dos perfis é maior que o total de
          proposições.
        </li>
        <li>
          O nome do autor é comparado com o nome parlamentar dos vereadores em exercício (e com nomes antigos conhecidos). Autores
          que não são vereadores em exercício (Poder Executivo, comissões, Mesa, suplentes que já saíram) aparecem nas listas, mas
          não têm perfil. Nesta coleta, {n(semVereador)} proposições não têm nenhum vereador em exercício entre os autores.
        </li>
        <li>
          <strong>Quantidade não é qualidade.</strong> Não há ranking, nota ou “mais produtivo”. Um pedido pode ser repetido até ser
          atendido; um projeto de lei pode levar meses. O presidente conduz as sessões e tem papel diferente dos demais.
        </li>
      </ul>

      <h2 id="derivados">Classificações automáticas</h2>
      <h3 id="temas">Assuntos</h3>
      <p>
        Cada pedido é comparado com listas de palavras. Um pedido pode ter mais de um assunto ou nenhum. Nesta coleta,{" "}
        {percent(classificados, pa.pedidos.length)}% dos {n(pa.pedidos.length)} pedidos receberam pelo menos um assunto. As listas
        são revisadas contra falsos positivos encontrados nos dados (por exemplo, “posteriormente” não é poste, “aguardar” não é
        água, o sobrenome Matos não é mato).
      </p>
      <ul>
        {TEMAS.map((t) => (
          <li key={t.slug}>
            <strong>{t.nome}:</strong> {t.descricao}
          </li>
        ))}
      </ul>

      <h3 id="bairros">Bairros citados</h3>
      <p>
        A Câmara tem um serviço de bairros na API, mas ele vem vazio. O portal procura no texto da ementa expressões como “no
        bairro Araretama”, “Bairro do São Benedito”, “nos bairros Pasin e Mantiqueira” ou “distrito de Moreira César”, e lê o
        nome até o fim da frase, uma vírgula ou palavras como “localizado” e “próximo”. Citar um bairro não quer dizer que o
        pedido foi atendido, nem que outros bairros não foram atendidos.
      </p>
      <p>
        Nesta coleta, {n(comBairro)} proposições citam pelo menos um bairro. Só aparecem bairros citados pelo menos {MIN_BAIRRO}{" "}
        vezes ({n(pa.bairros.length)} bairros, {n(citacoes)} citações). Pedidos que dão só o nome da rua ficam de fora.
      </p>
      <p>Grafias diferentes do mesmo nome são somadas (acentos e maiúsculas já são ignorados):</p>
      <ul className="small">
        {VARIANTES_BAIRRO.map((g) => (
          <li key={g.nome}>
            <strong>{g.nome}</strong>: {g.variantes.join(", ")}
          </li>
        ))}
      </ul>
      <p className="small soft">
        Palavras que aparecem depois de “bairro” mas não nomeiam um lugar ({NAO_E_BAIRRO.join(", ")}, “zona leste”) são
        descartadas. Nomes parecidos que podem ser lugares diferentes (por exemplo, “Andrade” e “Residencial Andrade”) ficam
        separados até alguém confirmar. Se você conhece o bairro e viu um erro, <Link href="/correcoes">avise</Link>.
      </p>

      <h3 id="destinos">A quem se pede</h3>
      <p>
        Lido no início da ementa (“Ao Executivo Municipal…”, “à Sabesp…”). Indicações são, por definição, dirigidas à Prefeitura.
        Destinos reconhecidos: {DESTINOS.map((x) => x.nome).join(", ")}. O resto aparece como “Outros”.
      </p>

      <h3 id="leis">Do projeto à lei</h3>
      <p>
        A API não informa de que projeto veio cada lei. A ementa de muitas leis cita o projeto de origem, como “(Projeto de Lei nº
        148/2026, de autoria do Vereador…)”. O portal liga a lei ao projeto <em>com esse tipo, número e ano</em>, e é por essa
        ligação que a lei aparece no perfil dos autores do projeto. Leis que não citam o projeto não entram na contagem, então os
        números são um mínimo, não um total. As leis de iniciativa do Poder Executivo em geral não citam o projeto. Nesta coleta,{" "}
        {n(pa.viraram.length)} normas foram ligadas a um projeto desta legislatura.
      </p>

      <h2>Limites conhecidos</h2>
      <ul>
        <li>Sem votações, presença e tramitação: não estão na API de dados abertos.</li>
        <li>A lista de vereadores da API traz só quem está em exercício hoje, sem histórico de suplências.</li>
        <li>Registros apagados ou corrigidos pela Câmara só são percebidos na coleta completa mensal.</li>
        <li>O portal não republica o texto integral dos documentos. Cada item tem link para o documento oficial.</li>
      </ul>

      {d.execucao.avisos.length > 0 && (
        <>
          <h2>Avisos da última coleta</h2>
          <ul>
            {d.execucao.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </>
      )}

      <p>
        Encontrou um erro? Veja <Link href="/correcoes">como avisar</Link>. O código do portal é aberto, e os{" "}
        <Link href="/dados">dados estão para download</Link>.
      </p>
    </div>
  );
}
