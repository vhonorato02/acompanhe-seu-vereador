import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { SITE, URL_REPORTAR_ERRO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Correções",
  description: `Canal para apontar divergências nos dados, ajustes em classificações automáticas, troca de retrato oficial ou pedidos de LGPD no ${SITE.nome}.`,
  alternates: { canonical: "/correcoes" },
};

const CORRECOES = `${SITE.repositorio}/issues?q=label%3Acorre%C3%A7%C3%A3o`;

export default function Correcoes() {
  return (
    <div className="prosa">
      <h1>Comunicar erro ou pedir revisão</h1>
      <p className="lede">
        Em bases com dezenas de milhares de atos públicos, classificações automáticas de texto, grafias de bairros ou registros da origem
        podem exigir ajuste. O Observatório analisa pedidos de revisão e solicitações de privacidade com resposta em até 15 dias corridos.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#tipos">Situações atendidas</a></li>
          <li><a href="#como-avisar">Canais de atendimento</a></li>
          <li><a href="#modelo">Informações recomendadas</a></li>
          <li><a href="#depois">Fluxo e prazo de resposta</a></li>
        </ul>
      </nav>

      <h2 id="tipos">1. Situações que podem ser reportadas</h2>
      <ul>
        <li>
          <strong>Classificação automática do portal:</strong> pedido enquadrado em assunto inadequado, bairro listado com grafias duplicadas,
          projeto sancionado ainda sem vínculo com a lei correspondente ou retrato oficial desatualizado de gabinete.
        </li>
        <li>
          <strong>Divergência no registro original da Câmara:</strong> data, autoria ou ementa publicada com erro na fonte legislativa.
        </li>
        <li>
          <strong>Solicitações de privacidade (LGPD):</strong> omissão de ementas que exponham cidadãos comuns em situações sensíveis de saúde
          ou vulnerabilidade (<Link href="/privacidade#direitos">Política de privacidade</Link>). Nesses casos, utilize exclusivamente o canal de
          e-mail institucional para evitar exposição pública dos dados.
        </li>
      </ul>

      <h2 id="como-avisar">2. Canais disponíveis</h2>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="c-email">
          <h3 id="c-email">E-mail institucional (qualquer assunto)</h3>
          <p>
            Caminho indicado para moradores, gabinetes e requerimentos formais de privacidade:{" "}
            <Contato assunto="Erro ou revisão no portal" />.
          </p>
          <p className="small soft">Não exige conta em plataformas externas e garante atendimento reservado para dados pessoais.</p>
        </section>
        <section className="quadro-card" aria-labelledby="c-github">
          <h3 id="c-github">Registro público no GitHub (questões técnicas)</h3>
          <p>
            <a href={URL_REPORTAR_ERRO}>Abrir chamado no repositório público</a> para relatar falhas de código, layout ou regras automáticas de
            leitura.
          </p>
          <p className="small soft">Exige conta gratuita no GitHub e publica a mensagem abertamente para auditoria comunitária.</p>
        </section>
      </div>

      <h2 id="modelo">3. O que enviar para acelerar a conferência</h2>
      <ul>
        <li>Endereço (URL) da página onde a informação aparece;</li>
        <li>Descrição objetiva da divergência observada;</li>
        <li>Link do documento oficial no site da Câmara Municipal, sempre que disponível.</li>
      </ul>
      <div className="exemplo">
        <p>
          <strong>Modelo de mensagem:</strong>{" "}
          <em>
            “Na página /bairros/andrade, proposições do Residencial Andrade aparecem separadas por grafia diferente. Link do documento na
            Câmara: https://pindamonhangaba.sp.leg.br/…”
          </em>
        </p>
      </div>

      <h2 id="depois">4. Como o pedido é tratado (até 15 dias)</h2>
      <ol className="passos">
        <li>
          <strong>Análise e retorno em até 15 dias corridos:</strong> a equipe confronta a solicitação diretamente com a fonte oficial da Câmara e
          responde pelo mesmo canal de envio.
        </li>
        <li>
          <strong>Erro atribuído ao código do portal:</strong> a regra é corrigida, coberta por teste automatizado contra reincidência e publicada
          na atualização seguinte.
        </li>
        <li>
          <strong>Erro na base da Câmara Municipal:</strong> por fidelidade à fonte, não alteramos documentos oficiais unilateralmente.
          Encaminhamos o apontamento à Câmara e registramos a ocorrência; em pedidos de LGPD, informamos também como solicitar ajuste na origem.
        </li>
        <li>
          <strong>Transparência de correções:</strong> ajustes técnicos e metodológicos são documentados em{" "}
          <a href={CORRECOES}>chamados de correção no GitHub</a> e na página de <Link href="/metodologia">Metodologia</Link>, preservando o
          sigilo de titulares que solicitaram omissão.
        </li>
      </ol>
    </div>
  );
}
