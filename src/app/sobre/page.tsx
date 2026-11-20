import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Propósito institucional do ${SITE.nome}, mantido pelo ${SITE.organizacao}, instalação no celular e créditos de fontes.`,
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return (
    <div className="prosa">
      <h1>Sobre o {SITE.nome}</h1>
      <p className="lede">
        O {SITE.nome} é uma iniciativa cívica e gratuita do <strong>{SITE.organizacao}</strong> que organiza em formato acessível os atos
        legislativos apresentados na Câmara Municipal de {SITE.cidade}, com ligação direta ao documento oficial de cada registro.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#quem">Mantenedor e finalidade</a></li>
          <li><a href="#principios">Princípios editoriais</a></li>
          <li><a href="#nao-e-camara">Independência institucional</a></li>
          <li><a href="#instalar">Uso como aplicativo</a></li>
          <li><a href="#privacidade">Privacidade e termos</a></li>
          <li><a href="#creditos">Fontes, marca e código</a></li>
        </ul>
      </nav>

      <h2 id="quem">Quem mantém e por quê</h2>
      <p>
        O Observatório Social do Brasil – {SITE.cidade} (CNPJ {SITE.cnpj}) é uma associação civil sem fins lucrativos e apartidária, vinculada
        à <a href={SITE.osb.rede}>rede Observatório Social do Brasil</a> e dedicada a {SITE.missao}. Mais ações da entidade ficam em{" "}
        <a href={SITE.osb.site}>{SITE.osb.site.replace("https://", "")}</a>.
      </p>
      <p>
        Em vez de planilhas ou painéis atualizados manualmente uma vez por mês, o portal coleta automaticamente a API pública da Câmara duas
        vezes ao dia e permite responder diretamente pelo navegador:
      </p>
      <ul>
        <li>quais pedidos foram apresentados para determinado bairro (<Link href="/bairros">Bairros</Link>);</li>
        <li>quais projetos de cada mandato deram origem a leis (<Link href="/vereadores">Vereadores</Link>);</li>
        <li>como dois ou três parlamentares atuam lado a lado na mesma escala (<Link href="/comparar">Comparar</Link>);</li>
        <li>qual o documento oficial correspondente e os arquivos completos (<Link href="/dados">Dados abertos</Link>).</li>
      </ul>

      <h2 id="principios">Seis princípios do projeto</h2>
      <ol className="passos">
        <li>
          <strong>Apartidarismo:</strong> ordem exclusivamente alfabética para os vereadores, sem ranking, notas individuais ou cores
          partidárias.
        </li>
        <li>
          <strong>Totais verificáveis:</strong> todo número exibido conduz exatamente à lista de documentos que o compõe.
        </li>
        <li>
          <strong>Contexto quantitativo:</strong> volume de pedidos não mede qualidade legislativa nem produtividade parlamentar.
        </li>
        <li>
          <strong>Separação de camadas:</strong> registros oficiais da Câmara ficam separados de classificações automáticas por texto.
        </li>
        <li>
          <strong>Limites explícitos:</strong> informações ausentes na API oficial, como votações nominais e presença em plenário, são
          informadas claramente em <Link href="/como-funciona">Como funciona</Link>.
        </li>
        <li>
          <strong>Direito à revisão:</strong> qualquer interessado pode apontar erros ou pedir proteção de dados pessoais em{" "}
          <Link href="/correcoes">Correções</Link>, com resposta em até 15 dias.
        </li>
      </ol>

      <h2 id="nao-e-camara">Independência institucional</h2>
      <p>
        Este não é o site oficial da Câmara Municipal de {SITE.cidade}. Os processos completos e a validade jurídica permanecem em{" "}
        <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>.
      </p>

      <h2 id="instalar">Instalação como aplicativo no celular</h2>
      <p>
        O site adota o padrão <em>PWA (Aplicativo Web Progressivo)</em> e pode ser adicionado à tela inicial pelo botão{" "}
        <strong>Menu / Mais</strong> ou diretamente pelo navegador, sem depender de lojas de aplicativos:
      </p>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="pwa-android">
          <h3 id="pwa-android">No Android (Chrome ou Edge)</h3>
          <p>
            Abra o menu do portal (<strong>Mais</strong>) ou o menu do navegador e escolha <strong>“Instalar aplicativo”</strong> ou{" "}
            <strong>“Adicionar à tela inicial”</strong>.
          </p>
        </section>
        <section className="quadro-card" aria-labelledby="pwa-iphone">
          <h3 id="pwa-iphone">No iPhone (Safari)</h3>
          <p>
            Toque em <strong>Compartilhar</strong> na barra inferior do Safari e selecione <strong>“Adicionar à Tela de Início”</strong>.
          </p>
        </section>
      </div>
      <p className="small soft">
        Para evitar a exibição de contagens defasadas em caso de queda de sinal, apenas os recursos visuais ficam em cache local; ao abrir
        sem conexão, uma tela de aviso solicita o restabelecimento da internet.
      </p>

      <h2 id="privacidade">Privacidade, aparência e termos</h2>
      <p>
        O portal não cria contas, não usa cookies nem salva histórico de buscas. Pelo menu <strong>Aparência</strong>, você escolhe livremente
        entre os modos <strong>Automático</strong>, <strong>Claro</strong> ou <strong>Escuro</strong>. Consulte os documentos completos em{" "}
        <Link href="/privacidade">Política de privacidade</Link>, <Link href="/termos">Termos de uso</Link> e{" "}
        <Link href="/metodologia">Metodologia</Link>.
      </p>

      <h2 id="creditos">Créditos de dados, imagens, fonte tipográfica e código</h2>
      <ul>
        <li>
          <strong>Retratos oficiais:</strong> publicados pela Câmara Municipal de {SITE.cidade}, exibidos em suas cores originais e em círculos
          uniformes para todos os parlamentares.
        </li>
        <li>
          <strong>Dados legislativos:</strong> extraídos da{" "}
          <a href="https://www.pindamonhangaba.sp.leg.br/dadosabertos">API de Dados Abertos</a> da Câmara Municipal de {SITE.cidade}.
        </li>
        <li>
          <strong>Identidade visual:</strong> marca institucional e paleta verde do {SITE.organizacao}.
        </li>
        <li>
          <strong>Tipografia:</strong> utiliza a fonte padrão do próprio sistema operacional (San Francisco, Segoe ou Roboto), evitando
          solicitações externas de fontes na rede.
        </li>
        <li>
          <strong>Código aberto:</strong> licença MIT disponível em{" "}
          <a href={SITE.repositorio}>{SITE.repositorio.replace("https://", "")}</a>.
        </li>
      </ul>
    </div>
  );
}
