import type { Metadata } from "next";
import Link from "next/link";
import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";
import { TEMAS } from "@/lib/data/temas";
import { DESTINOS } from "@/lib/data/extrair";
import { panorama } from "@/lib/data/painel";
import { percent } from "@/lib/data/analise";

export const metadata: Metadata = {
  title: "Metodologia",
  description: "De onde vêm os dados do portal, como são contados e quais são os limites.",
};

export default function Metodologia() {
  const d = dataset();
  const semVereador = d.proposicoes.filter((p) => p.autoresVereadores.length === 0).length;
  const pa = panorama();
  const classificados = pa.pedidos.filter((r) => TEMAS.some((t) => t.termos.test(r.ementa.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()))).length;
  const comBairro = pa.bairros.reduce((a, b) => a + b.n, 0);
  return (
    <div className="prosa">
      <h1>Metodologia</h1>

      <h2>De onde vêm os dados</h2>
      <p>
        Todos os dados vêm da <a href={d.fonte.url}>{d.fonte.nome}</a>, consultada com um token de cidadão. Termos da fonte:{" "}
        {d.fonte.termos}
      </p>
      <p>
        Última coleta: {dataColeta(d.execucao.coletadoEm)} ({d.execucao.modo === "completo" ? "coleta completa" : d.execucao.modo === "incremental" ? "coleta incremental: páginas novas mais uma margem de 45 dias das anteriores" : "amostra de desenvolvimento"}
        {d.execucao.requisicoes > 0 ? `, ${n(d.execucao.requisicoes)} consultas à API` : ""}). A atualização é feita a cada
        quinze dias pelo Observatório.
      </p>
      <p>
        O coletor se identifica, espera pelo menos 1 segundo entre consultas e para se a resposta vier vazia, em formato
        inesperado ou com queda brusca de volume. Nesses casos o site não é atualizado e continua mostrando a última coleta boa.
      </p>

      <h2>Período</h2>
      <p>
        {d.escopo.descricao}: proposições e normas publicadas desde {d.escopo.inicio.split("-").reverse().join("/")} ou numeradas
        a partir de 2025. O “ano” das tabelas é o do número oficial (por exemplo, Requerimento nº 2398/<strong>2026</strong>).
      </p>

      <h2>Como contamos</h2>
      <ul>
        <li>
          Cada número do portal é calculado com o mesmo filtro da lista para a qual ele aponta. Um teste automático garante que
          número e lista batem.
        </li>
        <li>
          <strong>Coautoria conta para cada coautor.</strong> A Câmara publica a autoria como uma lista separada por “;”. Um
          requerimento assinado por três vereadores aparece no perfil dos três. Por isso a soma dos perfis é maior que o total de
          proposições.
        </li>
        <li>
          O nome do autor é comparado com o nome parlamentar dos vereadores em exercício. Autores que não são vereadores em
          exercício (Poder Executivo, comissões, Mesa, suplentes que já saíram) aparecem nas listas, mas não têm perfil. Nesta
          coleta, {n(semVereador)} proposições não têm nenhum vereador em exercício entre os autores.
        </li>
        <li>Os totais são contagens dos registros coletados, não estimativas. Assuntos, bairros e destinatários são classificações derivadas do texto, sujeitas a erros e omissões.</li>
      </ul>

      <h2 id="normas">Autoria de leis e normas</h2>
      <p>
        A API não informa quem propôs cada lei. Quando a ementa traz a frase “de autoria do Vereador…”, o portal liga a norma ao
        perfil do vereador e marca a informação como <em>derivada</em>. Normas com outra redação, ou de autoria do Poder Executivo,
        não aparecem nos perfis.
      </p>

      <h2 id="derivados">Informações derivadas</h2>
      <p>
        Algumas informações não existem como campo na fonte e são calculadas pelo portal a partir do texto oficial. Elas aparecem
        sempre com a marca de informação derivada, e as regras estão abaixo para quem quiser conferir.
      </p>
      <h3 id="temas">Assuntos</h3>
      <p>
        Cada pedido é comparado com listas de palavras. Um pedido pode ter mais de um assunto ou nenhum. Nesta coleta,{" "}
        {percent(classificados, pa.pedidos.length)}% dos {n(pa.pedidos.length)} pedidos receberam pelo menos um assunto.
      </p>
      <ul>
        {TEMAS.map((t) => (
          <li key={t.slug}>
            <strong>{t.nome}:</strong> {t.descricao}
          </li>
        ))}
      </ul>
      <h3 id="bairros">Bairros</h3>
      <p>
        O portal procura expressões como “bairro Araretama” ou “distrito de Moreira César” na ementa. A Câmara tem um serviço de
        bairros na API, mas ele vem vazio. Bairros citados menos de três vezes não são listados, para reduzir erros de digitação.
        Pedidos que não escrevem a palavra “bairro” ficam de fora. Nesta coleta foram {n(pa.bairros.length)} bairros e {n(comBairro)}{" "}
        citações.
      </p>
      <h3 id="destinos">A quem se pede</h3>
      <p>
        Lido no início da ementa (“Ao Executivo Municipal…”, “à Sabesp…”). Indicações são, por definição, dirigidas à Prefeitura.
        Destinos reconhecidos: {DESTINOS.map((x) => x.nome).join(", ")}.
      </p>
      <h3 id="leis">Do projeto à lei</h3>
      <p>
        A ementa de muitas leis cita o projeto de origem, como “(Projeto de Lei nº 148/2026, de autoria do Vereador…)”. O portal liga a
        lei ao projeto com esse número. Leis que não citam o projeto não entram na contagem, então os números são um mínimo, não
        um total. Nesta coleta, {n(pa.viraram.length)} normas foram ligadas a um projeto.
      </p>

      <h2>Limites conhecidos</h2>
      <ul>
        <li>Sem votações, presença e tramitação: não estão na API de dados abertos.</li>
        <li>
          A API tem um serviço de bairros, mas ele vem vazio. A busca por bairro procura o nome no texto da ementa, e por isso pode
          deixar de fora pedidos que não escrevem o nome do bairro.
        </li>
        <li>A lista de vereadores da API traz só quem está em exercício hoje, sem histórico de suplências.</li>
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
        Encontrou um erro? <a href="https://github.com/vhonorato02/obs-vereador/issues/new?title=Erro%20nos%20dados">Avise aqui</a>.
        O código do portal é aberto. Veja também os <Link href="/dados">dados para download</Link>.
      </p>
    </div>
  );
}
