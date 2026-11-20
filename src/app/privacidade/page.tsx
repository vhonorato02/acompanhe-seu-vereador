import type { Metadata } from "next";
import Link from "next/link";
import { Contato } from "@/components/Contato";
import { TEXTO_OMITIDO } from "@/lib/content/omissoes";
import { dataLonga } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Práticas de transparência e proteção de dados pessoais no ${SITE.nome} conforme a LGPD (Lei nº 13.709/2018).`,
  alternates: { canonical: "/privacidade" },
};

export default function Privacidade() {
  return (
    <div className="prosa">
      <h1>Política de privacidade</h1>
      <p className="lede">
        Regras de privacidade e tratamento de dados pessoais no {SITE.nome}, alinhadas à Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº
        13.709/2018).
      </p>

      <div className="exemplo">
        <p>
          <strong>Resumo prático:</strong> o portal não utiliza cookies, ferramentas de rastreamento, perfis de usuário ou histórico de buscas.
          Os atos exibidos vêm de registros oficiais públicos da Câmara Municipal; quando uma ementa expõe dado pessoal sensível de cidadão
          comum, omitimos o resumo local e respondemos solicitações de revisão em até <strong>15 dias</strong> via{" "}
          <Contato assunto="Privacidade" />.
        </p>
      </div>

      <p className="nota">
        Vigente desde {dataLonga(SITE.vigenciaPoliticas)}. Complementa a{" "}
        <a href={SITE.osb.privacidade}>política de privacidade institucional do Observatório Social de {SITE.cidade}</a>.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#controlador">1. Controlador e Encarregado</a></li>
          <li><a href="#visitantes">2. Dados de navegação</a></li>
          <li><a href="#publicados">3. Dados públicos exibidos</a></li>
          <li><a href="#direitos">4. Direitos do titular (LGPD)</a></li>
          <li><a href="#seguranca">5. Segurança técnica</a></li>
          <li><a href="#mudancas">6. Alterações</a></li>
        </ul>
      </nav>

      <h2 id="controlador">1. Responsável pelo tratamento (Controlador e Encarregado)</h2>
      <p>
        Para os fins da LGPD, o <strong>controlador</strong> (art. 5º, VI) é o <strong>{SITE.razaoSocial}</strong>, associação civil sem fins
        lucrativos e apartidária, CNPJ {SITE.cnpj}, com sede na {SITE.endereco}.
      </p>
      <p>
        O canal do <strong>Encarregado pelo tratamento de dados (DPO, art. 41)</strong> para dúvidas e requerimentos de titulares é{" "}
        <Contato assunto="LGPD - pedido de titular" />.
      </p>

      <h2 id="visitantes">2. O que ocorre durante a navegação</h2>
      <ul>
        <li>
          <strong>Sem cadastro, cookies ou rastreadores:</strong> não existem contas de acesso, anúncios, pixels de redes sociais nem serviços
          externos de telemetria como Google Analytics.
        </li>
        <li>
          <strong>Preferência visual local (sem cookies):</strong> por padrão, o tema claro ou escuro acompanha a configuração do seu sistema.
          Caso escolha manualmente <em>Claro</em> ou <em>Escuro</em> no menu <strong>Aparência</strong>, apenas essa escolha visual (<code>light</code>{" "}
          ou <code>dark</code>) permanece salva localmente no <code>localStorage</code> do seu navegador, sem envio ao servidor nem associação
          pessoal, sendo apagada ao retornar para <em>Automático</em>.
        </li>
        <li>
          <strong>Pesquisas sem histórico gravado:</strong> os termos digitados na busca consultam os documentos apenas durante a requisição e não
          ficam armazenados em banco de dados.
        </li>
        <li>
          <strong>Armazenamento ao instalar o atalho (PWA):</strong> o navegador armazena apenas estilos e ícones estáticos; nenhuma consulta ou
          lista pessoal fica retida no dispositivo.
        </li>
        <li>
          <strong>Registros técnicos de hospedagem (Vercel Inc.):</strong> como provedora de infraestrutura (operadora), a Vercel registra
          metadados operacionais automáticos de rede (IP de origem, data, rota e navegador) para segurança e mitigação de ataques, sujeitos à
          política da operadora e a eventuais transferências internacionais amparadas por cláusulas contratuais (LGPD, art. 33). O Observatório
          não utiliza esses logs para identificar visitantes.
        </li>
        <li>
          <strong>Links externos:</strong> ao abrir documentos oficiais da Câmara ou perfis em plataformas terceiras, aplicam-se as políticas dos
          respectivos sites.
        </li>
      </ul>

      <h2 id="publicados">3. Dados públicos provenientes da Câmara Municipal</h2>
      <p>
        O conjunto de dados reproduz exclusivamente registros públicos da{" "}
        <a href="https://www.pindamonhangaba.sp.leg.br/dadosabertos">API de Dados Abertos</a> da Câmara Municipal de {SITE.cidade}:
      </p>
      <ul>
        <li>
          <strong>Vereadores em exercício:</strong> nome parlamentar, legenda, função na Mesa Diretora, retrato oficial e produções do mandato.
        </li>
        <li>
          <strong>Proposições e normas:</strong> tipo, número, ano, publicação, autoria, ementa oficial e link para a fonte (sem cópia integral de
          anexos ou processos).
        </li>
      </ul>
      <div className="exemplo">
        <p>
          <strong>Bases legais e limites:</strong> o tratamento ampara-se nos dados públicos já disponibilizados pelo Legislativo com respeito à
          boa-fé e ao interesse público (LGPD, art. 7º, §§ 3º, 4º e 7º), na Lei de Acesso à Informação (Lei nº 12.527/2011) e no legítimo
          interesse de controle social (art. 7º, IX).
        </p>
        <p>
          <strong>Ausência de perfilamento (art. 20) e proteção de sensíveis e menores (arts. 5º II, 11 e 14):</strong> leituras automáticas de
          tema, bairro e destino limitam-se ao texto dos atos públicos, sem cruzamento cadastral nem avaliação comportamental de pessoas.
          Ementas que exponham condições de saúde, vulnerabilidade ou identificação de crianças e adolescentes recebem omissão preventiva no site
          e nas tabelas abertas.
        </p>
      </div>
      <p>
        Os mesmos arquivos constam em <Link href="/dados">Dados abertos</Link>. Alterações ou remoções na Câmara são refletidas nas re-coletas
        seguintes.
      </p>

      <h2 id="direitos">4. Direitos do titular (art. 18 da LGPD)</h2>
      <p>
        Para confirmar a presença de dados, solicitar retificação (<Link href="/correcoes">Correções</Link>) ou requerer omissão de ementa em
        situações previstas em lei, escreva gratuitamente para <Contato assunto="LGPD - pedido de titular" /> informando a página ou número do
        ato. Podemos solicitar verificação simples de identidade para prevenir pedidos indevidos de terceiros e respondemos em até{" "}
        <strong>15 dias corridos</strong>.
      </p>
      <p>
        Quando deferida a omissão, mantêm-se tipo, número, data, autoria parlamentar e link da Câmara (sem alterar as contagens do mandato),
        substituindo a ementa exibida no site e nos arquivos CSV/JSON pela nota neutra: <em>“{TEXTO_OMITIDO}”</em>. Atos funcionais de agentes
        públicos no exercício do mandato permanecem públicos.
      </p>
      <p>
        <strong>Escopo sobre o registro oficial:</strong> a omissão abrange apenas a cópia mantida pelo Observatório; alterações no arquivo de
        origem devem ser requeridas diretamente à Câmara Municipal. Nunca envie dados pessoais em chamados públicos do GitHub. Caso discorde do
        atendimento recebido, é possível acionar a <a href="https://www.gov.br/anpd">Autoridade Nacional de Proteção de Dados (ANPD)</a>.
      </p>

      <h2 id="seguranca">5. Segurança da informação</h2>
      <p>
        Todo tráfego utiliza conexão criptografada via <strong>HTTPS</strong> com cabeçalhos de proteção no servidor, sem armazenamento de
        senhas ou bancos de contas de usuários. O código permanece integralmente auditável e coberto por testes automatizados, aceitando relatos
        reservados conforme a <a href={`${SITE.repositorio}/security/policy`}>política de segurança do repositório</a>.
      </p>

      <h2 id="mudancas">6. Alterações nesta política</h2>
      <p>
        Atualizações passam a valer com a data de vigência exibida no topo e registro público no histórico do código. Consulte também os{" "}
        <Link href="/termos">Termos de uso</Link>.
      </p>
    </div>
  );
}
