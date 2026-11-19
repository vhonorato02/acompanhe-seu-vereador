import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { TEXTO_OMITIDO } from "@/lib/content/omissoes";
import { dataLonga } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como o ${SITE.organizacao} protege dados pessoais no ${SITE.nome} conforme a LGPD (Lei 13.709/2018), explicado em linguagem simples.`,
  alternates: { canonical: "/privacidade" },
};

export default function Privacidade() {
  return (
    <div className="prosa">
      <h1>Política de privacidade</h1>
      <p className="lede">
        Política de transparência e proteção de dados do {SITE.nome}, alinhada à Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº
        13.709/2018). Escrevemos cada item para que qualquer pessoa entenda seus direitos, mesmo sem formação jurídica ou técnica.
      </p>

      <div className="exemplo">
        <p>
          <strong>Em português direto (o essencial em 1 minuto):</strong> este portal <strong>não pede cadastro</strong>,{" "}
          <strong>não usa cookies</strong> nem ferramentas de rastreamento, e <strong>não guarda histórico do que você busca</strong>.
          Os nomes exibidos vêm de atos oficiais já públicos da Câmara Municipal. Mesmo assim, se uma ementa citar dados delicados de
          alguém (como questão de saúde de um cidadão comum), nós ocultamos o texto aqui e respondemos qualquer pedido de revisão em até{" "}
          <strong>15 dias</strong> pelo e-mail <Contato assunto="Privacidade" />.
        </p>
      </div>

      <p className="nota">
        Vigente desde {dataLonga(SITE.vigenciaPoliticas)}. Esta política trata especificamente do {SITE.nome} e complementa a{" "}
        <a href={SITE.osb.privacidade}>política de privacidade institucional do Observatório</a>.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#controlador">1. Quem responde</a></li>
          <li><a href="#visitantes">2. Quem visita</a></li>
          <li><a href="#publicados">3. Dados públicos exibidos</a></li>
          <li><a href="#direitos">4. Seus direitos (LGPD)</a></li>
          <li><a href="#seguranca">5. Segurança</a></li>
          <li><a href="#mudancas">6. Mudanças</a></li>
        </ul>
      </nav>

      <h2 id="controlador">1. Quem é o responsável (Controlador e Encarregado)</h2>
      <p>
        Na linguagem da LGPD, quem decide como e por que os dados são publicados chama-se <strong>controlador</strong> (art. 5º, VI).
        Neste portal, o controlador é o <strong>{SITE.razaoSocial}</strong>, associação civil sem fins lucrativos e apartidária, CNPJ{" "}
        {SITE.cnpj}, com sede na {SITE.endereco}.
      </p>
      <p>
        A pessoa/canal que recebe dúvidas e pedidos sobre dados pessoais — chamada pela lei de <strong>Encarregado (ou DPO)</strong>,
        art. 41 — responde pelo e-mail institucional <Contato assunto="LGPD - pedido de titular" />.
      </p>

      <h2 id="visitantes">2. O que acontece quando você visita o site</h2>
      <ul>
        <li>
          <strong>Zero cadastro e zero rastreadores:</strong> não existem contas, senhas, anúncios, pixels de redes sociais nem serviços
          externos como Google Analytics medindo por onde você navega.
        </li>
        <li>
          <strong>Sem cookies de acompanhamento:</strong> <em>cookies</em> são pequenos arquivos que sites costumam gravar no navegador
          para reconhecer você entre visitas. Este portal não grava cookies de usuário. As cores claro ou escuro seguem automaticamente a
          preferência já configurada no seu aparelho.
        </li>
        <li>
          <strong>O que você digita na busca não fica salvo:</strong> quando você usa a barra de pesquisa, o texto vai ao servidor apenas
          para localizar os documentos naquele segundo e não é gravado em nenhum banco de dados nosso. A palavra buscada fica apenas no
          endereço da barra do seu próprio navegador (como em qualquer link compartilhável).
        </li>
        <li>
          <strong>Se você instalar o atalho no celular:</strong> o navegador guarda apenas arquivos visuais de aparência (ícones, layout e
          a página de aviso “sem conexão”). Nenhuma informação pessoal ou lista de buscas fica gravada no aparelho; se quiser apagar
          tudo, basta desinstalar o atalho ou limpar os dados do site no navegador.
        </li>
        <li>
          <strong>Registros técnicos da empresa de hospedagem (Vercel Inc.):</strong> todo site na internet precisa de um provedor de
          servidores — chamado na LGPD de <strong>operador</strong>. A Vercel Inc. registra dados técnicos automáticos de conexão (como
          endereço IP de rede, data, página aberta e tipo de navegador) estritamente para manter o site no ar e bloquear ataques. Esses
          registros técnicos ficam sob política própria da Vercel e podem trafegar por servidores fora do Brasil, amparados pelas
          garantias contratuais do provedor (LGPD, art. 33). O Observatório não utiliza esses registros para identificar moradores e só
          recorreria a eles se precisasse investigar abuso ou ataque grave.
        </li>
        <li>
          <strong>Ao clicar em sites externos:</strong> quando você abre o documento oficial no site da Câmara, uma rede social do
          Observatório ou o GitHub, passam a valer as políticas próprias daqueles sites.
        </li>
      </ul>

      <h2 id="publicados">3. Dados públicos exibidos no portal</h2>
      <p>
        O portal reúne exclusivamente informações que a Câmara Municipal de {SITE.cidade} já torna públicas em sua{" "}
        <a href="https://www.pindamonhangaba.sp.leg.br/dadosabertos">API de Dados Abertos</a> (o canal eletrônico oficial do Poder
        Legislativo para programas de computador):
      </p>
      <ul>
        <li>
          <strong>Vereadores em exercício:</strong> nome parlamentar, partido, cargo na Mesa Diretora, retrato oficial e proposições
          apresentadas — dados estritamente vinculados ao exercício do mandato público.
        </li>
        <li>
          <strong>Proposições e normas:</strong> tipo, número, ano, data de publicação, autoria, ementa (o resumo oficial) e link para o
          documento original. Como ementas podem citar nomes de homenageados, ruas ou moradores citados em pedidos, o portal{" "}
          <strong>não republica o texto integral</strong> dos processos: exibe só o resumo e aponta para a fonte oficial.
        </li>
      </ul>
      <div className="exemplo">
        <p>
          <strong>Por que a lei permite (e limita) esse tratamento?</strong> O trabalho existe para viabilizar o controle social da
          atividade legislativa, missão do Observatório. Suas <strong>bases legais</strong> são o tratamento de dados já tornados
          públicos pelo poder público, respeitando boa-fé e interesse público (LGPD, art. 7º, §§ 3º, 4º e 7º), o direito constitucional
          de acesso à informação pública (Lei nº 12.527/2011 — LAI) e o legítimo interesse da sociedade na transparência cívica (LGPD,
          art. 7º, IX).
        </p>
        <p>
          <strong>Sem perfilamento de pessoas (art. 20) e cuidado com dados sensíveis e menores (arts. 5º II, 11 e 14):</strong> as
          classificações automáticas do portal (assunto, bairro, destinatário e origem em lei) leem exclusivamente o texto de atos
          legislativos públicos — nunca avaliam a vida pessoal de moradores nem formam “perfil” comportamental de ninguém (LGPD, art.
          20). Também não cruzamos esses dados com outras bases. Quando identificamos preventivamente dado sensível de saúde ou
          vulnerabilidade de cidadão comum, ou menção identificável a criança ou adolescente (LGPD, art. 14), o resumo é omitido no
          portal e nos downloads abertos.
        </p>
      </div>
      <p>
        Os mesmos registros públicos também ficam disponíveis em <Link href="/dados">Dados abertos</Link>. Quando a Câmara altera ou
        retira um documento na fonte, a atualização seguinte (ou a re-coleta mensal completa) reflete a mudança aqui.
      </p>

      <h2 id="direitos">4. Seus direitos pela LGPD e como pedir revisão</h2>
      <p>
        Qualquer pessoa pode exercer gratuitamente os direitos garantidos pelo <strong>art. 18 da LGPD</strong> enviando um e-mail
        simples para <Contato assunto="LGPD - pedido de titular" />:
      </p>
      <ul>
        <li>Confirmar se algum dado seu aparece nos registros publicados aqui;</li>
        <li>Corrigir informação incompleta, inexata ou desatualizada (saiba mais em <Link href="/correcoes">Correções</Link>);</li>
        <li>Solicitar oposição, anonimização ou ocultação de resumo desnecessário ou excessivo quando aplicável pela lei.</li>
      </ul>
      <p>
        <strong>Para quem foi citado em uma ementa</strong> (por exemplo, numa moção ou requerimento sobre questão pessoal ou de saúde):
        basta indicar a página ou o número do documento. Podemos pedir confirmação simples de identidade para proteger você contra pedidos
        de terceiros mal-intencionados e respondemos em até <strong>15 dias corridos</strong>.
      </p>
      <p>
        Quando uma omissão é aplicada (por pedido ou preventivamente pelo Observatório), o ato legislativo não é apagado nem altera as
        contagens parlamentares: mantêm-se tipo, número, data, autoria pública e o link para o documento na Câmara, mas o texto da ementa
        é substituído no site e nos arquivos CSV/JSON pela mensagem neutra: <em>“{TEXTO_OMITIDO}”</em>. Atos funcionais de agentes
        públicos no exercício do cargo permanecem visíveis pelo interesse público.
      </p>
      <p>
        <strong>Atenção sobre o documento original:</strong> este portal oculta apenas a própria cópia exibida aqui. Como o arquivo oficial
        nasce e continua publicado pela Câmara Municipal, pedidos para alterar ou restringir o registro original precisam ser protocolados
        também junto à própria Câmara. E nunca use os avisos públicos do GitHub para tratar de dados pessoais, pois tudo lá fica público.
        Se discordar de alguma decisão do Observatório, você pode recorrer à{" "}
        <a href="https://www.gov.br/anpd">Autoridade Nacional de Proteção de Dados (ANPD)</a>.
      </p>

      <h2 id="seguranca">5. Segurança</h2>
      <p>
        O portal trafega somente com conexão criptografada (<strong>HTTPS</strong> — o cadeado no navegador), aplica cabeçalhos modernos
        de proteção contra ataques comuns da web e <strong>não possui banco de dados de usuários nem senha administrativa</strong>, o que
        elimina o risco clássico de vazamento de senhas. Todo o código-fonte é aberto e verificado por testes automatizados antes de
        entrar no ar. Caso alguém encontre uma brecha técnica, pedimos que reporte em privado conforme a{" "}
        <a href={`${SITE.repositorio}/security/policy`}>política de segurança do repositório</a>.
      </p>

      <h2 id="mudancas">6. Mudanças nesta política</h2>
      <p>
        Sempre que esta política for atualizada, publicaremos aqui a nova redação com a data de vigência atualizada e registro aberto no
        histórico do código. Leia também os <Link href="/termos">Termos de uso</Link>.
      </p>
    </div>
  );
}
