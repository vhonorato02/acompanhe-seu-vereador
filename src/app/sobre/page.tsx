import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre e privacidade",
  description: `Quem mantém o ${SITE.nome}, seus princípios, o que o portal faz com dados pessoais e de onde vêm fotos e textos.`,
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return (
    <div className="prosa">
      <h1>Sobre o {SITE.nome}</h1>
      <p className="soft" style={{ fontSize: "var(--step-1)" }}>
        O {SITE.nome} é um projeto independente do {SITE.organizacao} para que qualquer pessoa possa ver, em poucos toques, o que
        os vereadores da cidade apresentaram na Câmara, e conferir cada número no documento oficial.
      </p>

      <h2>Princípios</h2>
      <ul>
        <li><strong>Apartidário.</strong> Sem ranking, nota, selo ou “melhor e pior”. Vereadores em ordem alfabética, sem cores de partido.</li>
        <li><strong>Com fonte.</strong> Todo número leva à lista que o compõe, e todo item leva ao documento oficial.</li>
        <li><strong>Com contexto.</strong> Quantidade não é qualidade; explicamos o que cada tipo de proposição significa.</li>
        <li><strong>Sem invenção.</strong> O que a fonte não publica aparece como lacuna, não como estimativa. Classificações automáticas são marcadas como tal.</li>
        <li><strong>Corrigível.</strong> Erros podem ser apontados por qualquer pessoa, e as correções ficam registradas. <Link href="/correcoes">Como avisar</Link>.</li>
      </ul>

      <h2>Este não é o site da Câmara</h2>
      <p>
        Os documentos oficiais, a tramitação e as votações estão no site da Câmara Municipal de Pindamonhangaba:{" "}
        <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>. A Câmara não revisa nem endossa este portal.
      </p>

      <h2 id="privacidade">Privacidade</h2>
      <ul>
        <li>O portal não usa cookies, não tem login, não coleta dados de quem visita e não usa ferramentas de rastreamento ou anúncios.</li>
        <li>
          A hospedagem (Vercel) registra dados técnicos de acesso, como endereço IP, para segurança e funcionamento, conforme a
          política dela. O Observatório não usa esses registros para identificar visitantes.
        </li>
        <li>
          A busca é processada no servidor e não é guardada pelo portal.
        </li>
        <li>
          Os dados exibidos são de interesse público: atos de agentes públicos no exercício do mandato, publicados pela própria
          Câmara (Lei de Acesso à Informação, Lei 12.527/2011). Ementas podem citar nomes de cidadãos (por exemplo, em homenagens).
          O portal mostra apenas título, ementa, autoria e data, como publicados, e não republica o texto integral dos documentos.
        </li>
        <li>
          Se você é citado em uma ementa e tem uma preocupação, <Link href="/correcoes">fale com o Observatório</Link>; o texto
          original continua sendo responsabilidade da Câmara.
        </li>
      </ul>

      <h2 id="creditos">Fotos, textos e código</h2>
      <ul>
        <li>
          <strong>Fotos dos vereadores:</strong> retratos oficiais publicados pela Câmara Municipal de Pindamonhangaba, usados sem
          edição (apenas enquadradas para caber na tela), para identificar cada parlamentar. Crédito: Câmara Municipal de Pindamonhangaba.
        </li>
        <li><strong>Dados:</strong> Câmara Municipal de Pindamonhangaba, API de Dados Abertos. Cite a fonte ao reutilizar.</li>
        <li><strong>Marca e ícones:</strong> desenhados para o portal, sem uso de brasão ou logotipo oficial.</li>
        <li><strong>Fontes tipográficas:</strong> Bricolage Grotesque e Atkinson Hyperlegible Next, licença SIL Open Font License.</li>
        <li>
          <strong>Código:</strong> aberto, licença MIT, em <a href={SITE.repositorio}>{SITE.repositorio.replace("https://", "")}</a>.
        </li>
      </ul>
    </div>
  );
}
