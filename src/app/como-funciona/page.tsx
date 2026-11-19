import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARIO } from "@/lib/content/glossario";
import { dataset } from "@/lib/data/load";
import { hrefLista } from "@/lib/data/query";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Guia simples sobre o papel dos vereadores de Pindamonhangaba, os tipos de documento e termos como ementa e API de Dados Abertos.",
  alternates: { canonical: "/como-funciona" },
};

export default function ComoFunciona() {
  const d = dataset();
  const existe = new Set(d.tipos.map((t) => t.contract));
  return (
    <div className="prosa">
      <h1>Como funciona a Câmara e este portal</h1>
      <p className="lede">
        Quem mora em {SITE.cidade} nem sempre precisa conhecer o vocabulário jurídico para saber o que acontece no plenário.
        Aqui explicamos o que fazem os {d.vereadores.length} vereadores, o que significa cada pedido e como os registros oficiais
        chegam até você.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#papel">Vereador x Prefeito</a></li>
          <li><a href="#dicionario">Palavras traduzidas (inclui API)</a></li>
          <li><a href="#tipos">Tipos de proposição</a></li>
          <li><a href="#caminho">Por que há tantos pedidos</a></li>
          <li><a href="#limites">O que não aparece (ainda)</a></li>
        </ul>
      </nav>

      <h2 id="papel">O que faz um vereador (e o que cabe à Prefeitura)</h2>
      <p>
        A Câmara Municipal de {SITE.cidade} tem {d.vereadores.length} vereadores eleitos para a legislatura 2025–2028. As sessões
        ordinárias acontecem às terças-feiras, a partir das 17h, segundo a própria Câmara, e são abertas para quem quiser
        acompanhar no plenário ou pelas transmissões oficiais. A <strong>Mesa Diretora</strong> (presidente, vice-presidentes e
        secretários) organiza a pauta, conduz as reuniões e responde pela administração interna da Casa.
      </p>
      <p>
        Uma confusão muito comum é cobrar do vereador uma obra na rua como se ele mandasse na equipe de asfalto. Na cidade, as
        responsabilidades são divididas entre dois Poderes:
      </p>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="q-camara">
          <h3 id="q-camara">Câmara Municipal (Vereadores)</h3>
          <ul>
            <li><strong>Cria e vota leis municipais:</strong> regras da cidade, aprovação do orçamento anual e mudanças em tributos locais.</li>
            <li><strong>Fiscaliza a Prefeitura:</strong> pede documentos, questiona atrasos de obras, analisa contratos e julga as contas anuais do Executivo.</li>
            <li><strong>Encaminha demandas dos bairros:</strong> leva pedidos de limpeza, iluminação, saúde e trânsito até o prefeito e concessionárias.</li>
          </ul>
        </section>
        <section className="quadro-card" aria-labelledby="q-prefeitura">
          <h3 id="q-prefeitura">Prefeitura (Prefeito e Secretarias)</h3>
          <ul>
            <li><strong>Executa o trabalho diário:</strong> tapa buracos, troca lâmpadas, faz capina, mantém postos de saúde, creches, escolas e frota municipal.</li>
            <li><strong>Administra o dinheiro público:</strong> contrata serviços, paga fornecedores e decide prioridades dentro do orçamento aprovado.</li>
            <li><strong>Propõe projetos exclusivos:</strong> só o prefeito pode iniciar leis sobre salários, cargos e estrutura interna da Prefeitura.</li>
          </ul>
        </section>
      </div>

      <h2 id="dicionario">Palavras da Câmara e da internet traduzidas sem complicação</h2>
      <p>
        Os sistemas públicos usam nomes técnicos no dia a dia. Abaixo está o significado direto de cada termo que você encontra
        neste portal:
      </p>
      <ul className="verbetes">
        <li>
          <h3>Proposição</h3>
          <p>
            É o nome geral de qualquer documento formal apresentado na Câmara para pedir uma ação, cobrar informação, prestar uma
            homenagem ou propor uma lei. Um requerimento, uma indicação, uma moção e um projeto de lei são todos tipos de proposição.
          </p>
        </li>
        <li>
          <h3>Ementa</h3>
          <p>
            É o resumo curto que aparece logo no começo do documento oficial explicando do que ele trata — por exemplo,{" "}
            <em>“Solicita operação tapa-buraco no bairro Araretama”</em>. É essa ementa que você lê nas listas deste portal antes de
            clicar para abrir a íntegra no site da Câmara.
          </p>
        </li>
        <li>
          <h3>Coautoria</h3>
          <p>
            Acontece quando mais de um vereador assina junto a mesma proposição. Neste portal, se três parlamentares assinam o mesmo
            documento, ele aparece no perfil de cada um dos três — sempre avisando quando houve assinatura conjunta.
          </p>
        </li>
        <li>
          <h3>Tramitação, sanção e veto</h3>
          <p>
            <strong>Tramitação</strong> é o caminho que um projeto percorre entre comissões e debates antes da votação no plenário. Se
            aprovado pela Câmara, vai ao prefeito, que pode dar a <strong>sanção</strong> (concordar e assinar para virar lei) ou
            aplicar o <strong>veto</strong> (recusar parte ou todo o texto, devolvendo-o aos vereadores para decisão final).
          </p>
        </li>
        <li>
          <h3>Norma (lei, decreto legislativo ou resolução)</h3>
          <p>
            É a regra que já foi aprovada, publicada oficialmente e passou a valer — seja para toda a população (como uma lei
            ordinária ou complementar), seja para a organização interna da própria Câmara (resolução).
          </p>
        </li>
        <li>
          <h3>API de Dados Abertos (o “balcão eletrônico” oficial)</h3>
          <p>
            <strong>API</strong> é a sigla para <em>Interface de Programação de Aplicações</em>. Na prática, funciona como um{" "}
            <strong>balcão eletrônico automático</strong> oferecido pela própria Câmara Municipal para que programas de computador
            consultem os registros públicos diretamente, de forma padronizada e sem ninguém precisar copiar planilhas à mão. É dessa
            API oficial que este portal recolhe os dados todos os dias. Saiba todos os detalhes em{" "}
            <Link href="/metodologia">Metodologia</Link> ou baixe os arquivos em <Link href="/dados">Dados abertos</Link>.
          </p>
        </li>
      </ul>

      <h2 id="tipos">Cada tipo de proposição, explicado com exemplo</h2>
      <div className="nota">
        <p>
          <strong>Nota importante:</strong> estas explicações foram escritas em linguagem cotidiana pelo Observatório para ajudar na
          leitura. As definições jurídicas oficiais valem conforme o Regimento Interno da Câmara e a Lei Orgânica do Município de{" "}
          {SITE.cidade}.
        </p>
      </div>
      <ul className="verbetes">
        {GLOSSARIO.filter((g) => existe.has(g.contract)).map((g) => (
          <li key={g.contract} id={g.contract}>
            <h3>{d.tipos.find((t) => t.contract === g.contract)?.titulo}</h3>
            <p>{g.explicacao}</p>
            <p>
              <Link href={hrefLista("/proposicoes", { tipo: g.contract })}>Ver todas desta legislatura</Link>
            </p>
          </li>
        ))}
      </ul>

      <h2 id="caminho">Por que cerca de 9 em cada 10 documentos são pedidos, não projetos de lei</h2>
      <div className="exemplo">
        <p>
          <strong>Entenda sem prejuízo ao contexto:</strong> é natural que Indicações e Requerimentos apareçam em volume muito maior
          que Projetos de Lei. Tapar buracos, pedir informações de trânsito ou encaminhar reclamações de moradores acontece toda
          semana; já escrever uma lei nova exige estudo jurídico, análise de orçamento e várias votações.
        </p>
        <p>
          Por isso o Observatório repete em todo o site: <strong>quantidade não mede qualidade</strong>. Um único projeto de lei bem
          feito pode impactar a cidade por décadas, enquanto centenas de indicações podem refletir apenas pedidos operacionais
          repetidos.
        </p>
      </div>

      <h2 id="limites">O que este portal NÃO mostra (ainda) — e por quê</h2>
      <p>
        Por respeito à transparência, tudo o que a Câmara ainda não entrega de forma estruturada na API de Dados Abertos fica
        explicitamente marcado como limite do sistema — nunca preenchido com estimativas:
      </p>
      <ul>
        <li>
          <strong>Como cada vereador votou:</strong> os registros individuais de voto em plenário não são publicados pela API de
          dados abertos da Câmara nesta legislatura.
        </li>
        <li>
          <strong>Presença nas sessões:</strong> a lista de comparecimento também não entra na API; hoje ela aparece apenas nas atas
          das sessões publicadas em arquivos PDF no site oficial da Câmara.
        </li>
        <li>
          <strong>Andamento atual (tramitação):</strong> saber se um projeto está em comissão, parado ou pronto para votação depende
          da consulta direta ao documento no site oficial — por isso todo item listado aqui traz o link direto para a ficha da Câmara.
        </li>
      </ul>

      <p>
        Quer entender como o sistema conta cada item, identifica bairros e evita falsos positivos? Leia a{" "}
        <Link href="/metodologia">Metodologia completa</Link> ou comece a explorar as{" "}
        <Link href="/proposicoes">proposições desta legislatura</Link>.
      </p>
    </div>
  );
}
