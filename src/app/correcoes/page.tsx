import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { SITE, URL_REPORTAR_ERRO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Correções",
  description: `Como avisar sobre um erro de dado, classificação, bairro, foto ou pedido de privacidade no ${SITE.nome}.`,
  alternates: { canonical: "/correcoes" },
};

const CORRECOES = `${SITE.repositorio}/issues?q=label%3Acorre%C3%A7%C3%A3o`;

export default function Correcoes() {
  return (
    <div className="prosa">
      <h1>Viu um erro ou quer pedir revisão? Avise.</h1>
      <p className="lede">
        Quem trabalha com mais de dezessete mil documentos públicos sabe que falhas acontecem: uma palavra pode enganar a leitura
        automática, um nome de bairro pode aparecer duplicado, um gabinete pode atualizar a foto oficial ou a própria Câmara pode
        retificar um texto. Cada aviso ajuda a deixar o portal mais preciso para toda a cidade.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#tipos">O que você pode avisar</a></li>
          <li><a href="#como-avisar">Dois caminhos simples</a></li>
          <li><a href="#modelo">O que escrever (com exemplo)</a></li>
          <li><a href="#depois">O que acontece depois (15 dias)</a></li>
        </ul>
      </nav>

      <h2 id="tipos">1. Que tipo de situação você encontrou?</h2>
      <ul>
        <li>
          <strong>Erro de leitura automática (portal):</strong> por exemplo, um pedido que entrou no assunto errado, um bairro escrito de
          duas formas separadas (<em>“Jardim Resende”</em> e <em>“Jardim Rezende”</em>), um projeto já sancionado que não apareceu ligado
          à lei ou uma foto oficial desatualizada de gabinete.
        </li>
        <li>
          <strong>Erro no texto original (Câmara):</strong> quando a data, a autoria ou o título publicado pela própria Câmara Municipal
          trouxer algum equívoco na fonte oficial.
        </li>
        <li>
          <strong>Pedido envolvendo dados pessoais ou privacidade (LGPD):</strong> caso você ou um familiar tenha o nome citado numa
          ementa delicada e queira solicitar omissão conforme a <Link href="/privacidade#direitos">Política de privacidade</Link>.{" "}
          <strong>Neste caso, use apenas o e-mail abaixo</strong> — nunca envie dados pessoais em avisos públicos.
        </li>
      </ul>

      <h2 id="como-avisar">2. Dois caminhos simples (sem precisar entender de tecnologia)</h2>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="c-email">
          <h3 id="c-email">Por e-mail (para qualquer pessoa)</h3>
          <p>
            É o caminho mais rápido e não exige cadastro nenhum. Escreva diretamente para o Observatório Social de {SITE.cidade} em{" "}
            <Contato assunto="Erro ou revisão no portal" />.
          </p>
          <p className="small soft">
            Obrigatório para pedidos de privacidade (LGPD), remoção de dados sensíveis de terceiros ou solicitação de troca de retrato de
            gabinete.
          </p>
        </section>
        <section className="quadro-card" aria-labelledby="c-github">
          <h3 id="c-github">Pelo formulário público do GitHub</h3>
          <p>
            <a href={URL_REPORTAR_ERRO}>Abrir um aviso estruturado no GitHub</a>. <em>GitHub</em> é o site público onde o código-fonte
            e o registro técnico de melhorias do projeto ficam abertos para qualquer auditor conferir.
          </p>
          <p className="small soft">
            Requer conta gratuita no GitHub e torna sua mensagem visível publicamente na internet — use só para erros técnicos ou de dados
            sem informações pessoais.
          </p>
        </section>
      </div>

      <h2 id="modelo">3. O que ajuda a conferir rápido (com exemplo pronto)</h2>
      <p>Você não precisa usar linguagem técnica. Se conseguir incluir estes três itens, resolvemos muito mais depressa:</p>
      <ul>
        <li>O endereço (link) da página do portal onde você viu o problema;</li>
        <li>O que está aparecendo agora e o que deveria aparecer;</li>
        <li>Se tiver, o link do documento oficial no site da Câmara Municipal mostrando o dado correto.</li>
      </ul>
      <div className="exemplo">
        <p>
          <strong>Exemplo de mensagem pronta para copiar:</strong>
        </p>
        <p>
          <em>
            “Olá, equipe do Observatório. Na página /bairros/andrade aparecem pedidos do Residencial Andrade misturados com outro
            loteamento (ou separados por engano). Segue o link da proposição na Câmara: https://pindamonhangaba.sp.leg.br/…”
          </em>
        </p>
      </div>

      <h2 id="depois">4. O que acontece depois do envio (prazo de até 15 dias)</h2>
      <ol className="passos">
        <li>
          <strong>Conferência e resposta em até 15 dias:</strong> o Observatório confere a mensagem diretamente no documento oficial da
          Câmara e responde pelo mesmo canal em até 15 dias corridos.
        </li>
        <li>
          <strong>Quando o erro é do portal:</strong> corrigimos a regra no código-fonte e escrevemos um teste automático para garantir que
          o mesmo erro nunca mais volte. A melhoria entra no ar já na atualização seguinte (duas vezes ao dia).
        </li>
        <li>
          <strong>Quando o erro está na Câmara:</strong> como o portal não inventa nem adultera documentos oficiais, encaminhamos o aviso à
          Câmara Municipal e deixamos o registro anotado. Se for questão de privacidade (LGPD), explicamos também como protocolar na
          própria Câmara, pois aqui ocultamos apenas a cópia deste portal.
        </li>
        <li>
          <strong>Nada é varrido para baixo do tapete:</strong> correções técnicas e de metodologia ficam registradas na{" "}
          <a href={CORRECOES}>lista pública de correções</a> e na página de <Link href="/metodologia">Metodologia</Link>, sempre sem
          expor dados pessoais de quem pediu sigilo.
        </li>
      </ol>
    </div>
  );
}
