import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { TEXTO_OMITIDO } from "@/lib/content/omissoes";
import { dataLonga } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como o ${SITE.organizacao} trata dados pessoais no ${SITE.nome}, conforme a LGPD (Lei 13.709/2018).`,
  alternates: { canonical: "/privacidade" },
};

export default function Privacidade() {
  return (
    <div className="prosa">
      <h1>Política de privacidade</h1>
      <p className="lede">
        Resumo: o portal não pede cadastro, não usa cookies nem rastreadores e não guarda o que você busca. Os dados exibidos são
        atos públicos da Câmara Municipal. Quem é citado pode pedir revisão pelo e-mail <Contato assunto="Privacidade" />.
      </p>
      <p className="nota">
        Vigente desde {dataLonga(SITE.vigenciaPoliticas)}. Esta política trata do {SITE.nome} e complementa a{" "}
        <a href={SITE.osb.privacidade}>política de privacidade institucional do Observatório</a>.
      </p>

      <h2 id="controlador">1. Quem é o responsável</h2>
      <p>
        O controlador dos dados pessoais tratados neste portal (Lei Geral de Proteção de Dados Pessoais, LGPD, art. 5º, VI) é o{" "}
        <strong>{SITE.razaoSocial}</strong>, associação civil sem fins lucrativos e apartidária, CNPJ {SITE.cnpj}, com sede na{" "}
        {SITE.endereco}.
      </p>
      <p>
        Canal de atendimento ao titular de dados e ao encarregado (art. 41): <Contato assunto="LGPD - pedido de titular" />.
      </p>

      <h2 id="visitantes">2. Quem visita o portal</h2>
      <ul>
        <li>
          <strong>Não coletamos dados de quem visita.</strong> Não há cadastro, login, formulário, cookies, pixels, ferramentas de
          estatística de terceiros ou anúncios.
        </li>
        <li>
          <strong>Busca:</strong> o que você digita é enviado ao servidor só para montar o resultado e não é armazenado pelo
          portal. O termo aparece no endereço da página, que fica no histórico do seu navegador.
        </li>
        <li>
          <strong>No seu aparelho:</strong> se você instalar o portal na tela inicial, o navegador guarda cópias de arquivos de
          aparência (ícones, estilos, a página “sem conexão”). Nenhum dado pessoal é guardado. Para apagar, remova o aplicativo ou
          limpe os dados do site no navegador. A preferência de tema segue a configuração do aparelho.
        </li>
        <li>
          <strong>Hospedagem:</strong> como em qualquer site, o provedor de hospedagem (Vercel Inc., que atua como operador)
          registra dados técnicos de cada acesso, como endereço IP, data, página pedida e navegador, para segurança, prevenção de
          abuso e funcionamento. Esses registros ficam com o provedor, pelo prazo da política dele, e podem ser processados fora do
          Brasil, com as garantias contratuais do provedor (LGPD, art. 33). O Observatório não usa esses registros para identificar
          visitantes e só os acessaria para investigar ataque ou mau uso.
        </li>
        <li>
          <strong>Links externos:</strong> ao abrir um documento no site da Câmara, uma rede social ou o GitHub, vale a política
          daquele site.
        </li>
      </ul>

      <h2 id="publicados">3. Dados publicados no portal</h2>
      <p>
        O portal reúne informações que a Câmara Municipal de Pindamonhangaba já publica na sua{" "}
        <a href="https://www.pindamonhangaba.sp.leg.br/dadosabertos">API de dados abertos</a>:
      </p>
      <ul>
        <li>
          <strong>Vereadores:</strong> nome parlamentar, partido, cargo na Mesa, foto oficial e as proposições que apresentaram.
          São dados ligados ao exercício de mandato público.
        </li>
        <li>
          <strong>Proposições e leis:</strong> tipo, número, data, autoria, ementa (o resumo oficial) e o link para o documento.
          Ementas podem citar outras pessoas, como homenageados, nomes de ruas ou servidores. O portal{" "}
          <strong>não republica o texto integral</strong> dos documentos.
        </li>
      </ul>
      <p>
        <strong>Finalidade:</strong> permitir o acompanhamento e o controle social da atividade legislativa, que é a missão do
        Observatório. <strong>Bases legais:</strong> tratamento de dados tornados públicos pela própria Câmara, respeitados a
        finalidade, a boa-fé e o interesse público que justificaram a publicação (LGPD, art. 7º, §§ 3º, 4º e 7º), o direito de
        acesso à informação pública (Lei 12.527/2011) e o legítimo interesse do Observatório e da sociedade na transparência (LGPD,
        art. 7º, IX). O portal não cria perfis de cidadãos, não cruza dados com outras fontes e não trata dados sensíveis.
      </p>
      <p>
        Os mesmos dados ficam disponíveis em <Link href="/dados">formato aberto</Link>. Eles são atualizados a cada coleta e
        mantidos enquanto o portal existir; quando a Câmara corrige ou retira um registro, a coleta seguinte reflete a mudança.
      </p>

      <h2 id="direitos">4. Seus direitos e como pedir</h2>
      <p>
        Qualquer pessoa pode pedir ao Observatório, pelo e-mail <Contato assunto="LGPD - pedido de titular" />, os direitos do
        art. 18 da LGPD: confirmar se tratamos dados seus, acessá-los, corrigir dados incompletos ou desatualizados, opor-se ao
        tratamento e pedir anonimização ou eliminação do que for desnecessário. Informe a página do portal e o que deseja. Podemos
        pedir confirmação de identidade antes de atender, e respondemos em até 15 dias.
      </p>
      <p>
        <strong>Pessoa citada em uma ementa</strong> (por exemplo, numa homenagem) pode pedir que o resumo deixe de aparecer neste
        portal. Atendido o pedido, o registro continua listado, com tipo, número, data, autoria e o link para o documento oficial,
        mas a ementa é substituída por: “{TEXTO_OMITIDO}” Isso vale para o site e para os dados abertos a partir da coleta
        seguinte. Atos de agentes públicos no exercício da função continuam visíveis, por serem de interesse público. O documento
        original é publicado e mantido pela Câmara: pedidos sobre ele devem ser feitos também a ela.
      </p>
      <p>
        Não use os avisos públicos do GitHub para pedidos que envolvam dados pessoais: eles ficam visíveis para todos. Se não
        ficar satisfeito com a resposta, você pode peticionar à Autoridade Nacional de Proteção de Dados (
        <a href="https://www.gov.br/anpd">gov.br/anpd</a>).
      </p>

      <h2 id="seguranca">5. Segurança</h2>
      <p>
        O portal é servido só por conexão segura (HTTPS), com cabeçalhos de segurança, sem banco de dados de usuários e sem área
        administrativa exposta. O código é aberto e verificado por testes automáticos a cada mudança. Falhas de segurança podem
        ser comunicadas de forma privada, como explicado na{" "}
        <a href={`${SITE.repositorio}/security/policy`}>política de segurança do repositório</a>.
      </p>

      <h2 id="mudancas">6. Mudanças nesta política</h2>
      <p>
        Mudanças são publicadas nesta página, com nova data de vigência, e ficam registradas no histórico público do código. Veja
        também os <Link href="/termos">termos de uso</Link>.
      </p>
    </div>
  );
}
