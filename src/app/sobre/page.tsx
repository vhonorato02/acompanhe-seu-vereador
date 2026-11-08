import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Quem mantém o ${SITE.nome}, seus princípios e de onde vêm dados, fotos e textos.`,
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return (
    <div className="prosa">
      <h1>Sobre o {SITE.nome}</h1>
      <p className="lede">
        O {SITE.nome} é um projeto do {SITE.organizacao} para que qualquer pessoa possa ver, em poucos toques, o que os
        vereadores da cidade apresentaram na Câmara, e conferir cada número no documento oficial.
      </p>
      <p>
        O Observatório é uma associação civil sem fins lucrativos e apartidária, parte da{" "}
        <a href={SITE.osb.rede}>rede Observatório Social do Brasil</a>, formada por voluntários que buscam {SITE.missao}. O portal
        substitui o antigo painel do projeto, que era atualizado à mão uma vez por mês: agora a coleta é automática, cerca de duas
        vezes por dia. Conheça o trabalho do Observatório em <a href={SITE.osb.site}>{SITE.osb.site.replace("https://", "")}</a>.
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

      <h2 id="instalar">No celular</h2>
      <p>
        Você pode adicionar o portal à tela inicial pelo menu do navegador. No iPhone, abra no Safari e procure
        “Adicionar à Tela de Início” no menu de compartilhamento. No Android, procure “Instalar aplicativo” ou
        “Adicionar à tela inicial”. As opções variam conforme o navegador.
      </p>
      <p>
        É preciso estar conectado à internet para consultar o portal. Confira a data da coleta na página:
        os dados são atualizados duas vezes ao dia, e a última coleta válida continua disponível se uma atualização falhar.
      </p>

      <h2 id="privacidade">Privacidade e termos</h2>
      <p>
        O portal não tem cadastro, cookies nem rastreadores. Como os dados pessoais são tratados, inclusive os de pessoas citadas em
        ementas, está na <Link href="/privacidade">política de privacidade</Link>. As condições de uso e de reutilização dos dados
        estão nos <Link href="/termos">termos de uso</Link>.
      </p>

      <h2 id="creditos">Fotos, textos e código</h2>
      <ul>
        <li>
          <strong>Fotos dos vereadores:</strong> retratos oficiais publicados pela Câmara Municipal de Pindamonhangaba, exibidos em
          preto e branco e enquadrados em círculo, iguais para todos, para identificar cada parlamentar sem destacar ninguém. Crédito: Câmara Municipal de Pindamonhangaba.
        </li>
        <li><strong>Dados:</strong> Câmara Municipal de Pindamonhangaba, API de Dados Abertos. Cite a fonte ao reutilizar.</li>
        <li><strong>Marca:</strong> logotipo e emblema do {SITE.organizacao}. O portal não usa brasão nem logotipo da Câmara ou da Prefeitura.</li>
        <li><strong>Tipografia:</strong> a fonte do próprio aparelho (San Francisco no iPhone, Segoe no Windows, Roboto no Android); nada é baixado de terceiros.</li>
        <li>
          <strong>Código:</strong> aberto, licença MIT, em <a href={SITE.repositorio}>{SITE.repositorio.replace("https://", "")}</a>.
        </li>
      </ul>
    </div>
  );
}
