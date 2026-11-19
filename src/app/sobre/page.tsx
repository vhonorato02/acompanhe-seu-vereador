import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Quem mantém o ${SITE.nome}, por que o portal existe, como instalar no celular e de onde vêm os dados e as fotos.`,
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return (
    <div className="prosa">
      <h1>Sobre o {SITE.nome}</h1>
      <p className="lede">
        O {SITE.nome} é um projeto cívico e gratuito do <strong>{SITE.organizacao}</strong> para que qualquer morador de {SITE.cidade}{" "}
        consiga acompanhar, direto do celular e em linguagem clara, o que os vereadores apresentam na Câmara Municipal — sempre com um
        clique até o documento oficial.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#quem">Quem faz e por quê</a></li>
          <li><a href="#principios">Nossos 6 compromissos</a></li>
          <li><a href="#nao-e-camara">Independência</a></li>
          <li><a href="#instalar">Colocar no celular</a></li>
          <li><a href="#privacidade">Privacidade e termos</a></li>
          <li><a href="#creditos">Fotos, dados, letras e código</a></li>
        </ul>
      </nav>

      <h2 id="quem">Quem faz e por que o portal existe</h2>
      <p>
        O Observatório Social do Brasil – {SITE.cidade} (CNPJ {SITE.cnpj}) é uma associação civil sem fins lucrativos e apartidária,
        integrante da <a href={SITE.osb.rede}>rede Observatório Social do Brasil</a>, formada por cidadãos voluntários que buscam{" "}
        {SITE.missao}. Conheça nossas outras ações em{" "}
        <a href={SITE.osb.site}>{SITE.osb.site.replace("https://", "")}</a>.
      </p>
      <p>
        Durante anos, acompanhar a produção legislativa exigia baixar relatórios manuais e montar painéis uma vez por mês (como um antigo
        painel em Power BI). Esse trabalho ficava defasado rápido e era difícil de abrir no celular. O portal resolve isso de forma
        aberta: duas vezes por dia, ele consulta automaticamente os dados públicos da Câmara e responde a perguntas simples do dia a
        dia, como:
      </p>
      <ul>
        <li><em>“O que foi pedido recentemente para o meu bairro?”</em> — respondido em <Link href="/bairros">Bairros</Link>.</li>
        <li><em>“Quais projetos de determinado vereador viraram lei?”</em> — visível no perfil em <Link href="/vereadores">Vereadores</Link>.</li>
        <li><em>“Dois vereadores tratam de assuntos parecidos?”</em> — visível na mesma escala em <Link href="/comparar">Comparar</Link>.</li>
        <li><em>“Onde está o documento original para citar em reportagem ou trabalho?”</em> — no link oficial de cada item e em <Link href="/dados">Dados abertos</Link>.</li>
      </ul>

      <h2 id="principios">Nossos 6 compromissos inegociáveis</h2>
      <ol className="passos">
        <li>
          <strong>Apartidarismo absoluto:</strong> sem ranking, nota, medalha, “vereador mais atuante” ou cor de partido. A lista de
          parlamentares segue sempre a ordem alfabética.
        </li>
        <li>
          <strong>Todo número abre a lista que o compõe:</strong> nenhum total aparece solto ou arredondado no chute. Se você lê
          “180 projetos” ou “45 pedidos”, tocar no número abre exatamente aqueles registros.
        </li>
        <li>
          <strong>Quantidade nunca significa qualidade:</strong> um pedido simples de manutenção na rua pode ser apresentado dezenas de
          vezes; uma lei municipal complexa pode levar meses de estudo. Os números servem para orientar a leitura, nunca para dar nota.
        </li>
        <li>
          <strong>Fato oficial separado de leitura automática:</strong> título, data e ementa vêm da Câmara. Quando o computador
          classifica por assunto, bairro ou destinatário pelo texto, isso vem sempre rotulado como{" "}
          <em>classificação automática</em>.
        </li>
        <li>
          <strong>Honestidade sobre o que falta:</strong> o que a Câmara não publica de forma estruturada (como votação nominal ou
          presença em plenário) fica declarado como limite em <Link href="/como-funciona">Como funciona</Link>, sem preenchimentos
          inventados.
        </li>
        <li>
          <strong>Direito à correção e à privacidade:</strong> qualquer pessoa pode apontar erro ou pedir proteção de dados pessoais
          em <Link href="/correcoes">Correções</Link>, com histórico aberto e compromisso de resposta em até 15 dias.
        </li>
      </ol>

      <h2 id="nao-e-camara">Independência: este não é o site oficial da Câmara</h2>
      <p>
        Os documentos oficiais originais, a tramitação completa e as votações pertencem ao portal da Câmara Municipal de {SITE.cidade}:{" "}
        <a href="https://www.pindamonhangaba.sp.leg.br">pindamonhangaba.sp.leg.br</a>. A Câmara não administra, não revisa e não
        endossa este portal independente mantido pelo Observatório Social.
      </p>

      <h2 id="instalar">Como colocar na tela inicial do celular</h2>
      <p>
        O portal funciona como um aplicativo leve direto do navegador (tecnologia conhecida como <em>PWA — Aplicativo Web Progressivo</em>),
        sem precisar baixar nada em loja da Apple ou do Google e quase sem gastar memória:
      </p>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="pwa-android">
          <h3 id="pwa-android">No Android (Chrome ou Edge)</h3>
          <p>
            Toque nos três pontinhos (<strong>⋮</strong>) no canto superior direito do navegador e escolha{" "}
            <strong>“Instalar aplicativo”</strong> ou <strong>“Adicionar à tela inicial”</strong>.
          </p>
        </section>
        <section className="quadro-card" aria-labelledby="pwa-iphone">
          <h3 id="pwa-iphone">No iPhone (Safari)</h3>
          <p>
            Abra o endereço no Safari, toque no botão <strong>Compartilhar</strong> (o quadrado com seta para cima) e toque em{" "}
            <strong>“Adicionar à Tela de Início”</strong>.
          </p>
        </section>
      </div>
      <p className="small soft">
        <strong>Por que precisa de internet para ver os números?</strong> De propósito, o atalho no celular não guarda cópias antigas das
        proposições. Se você estiver sem sinal, aparece apenas uma tela avisando que está sem conexão — assim ninguém corre o risco de
        confiar em um número desatualizado.
      </p>

      <h2 id="privacidade">Privacidade, termos e canal aberto</h2>
      <p>
        O portal não cria conta de usuário, não instala cookies de rastreamento e não salva o que você pesquisou. Leia como cuidamos de
        dados pessoais citados em ementas na <Link href="/privacidade">Política de privacidade</Link>, confira as regras de reutilização
        nos <Link href="/termos">Termos de uso</Link> ou entenda todos os cálculos na <Link href="/metodologia">Metodologia</Link>.
      </p>

      <h2 id="creditos">De onde vêm fotos, dados, letras e código</h2>
      <ul>
        <li>
          <strong>Fotos dos vereadores:</strong> retratos oficiais publicados pela Câmara Municipal de {SITE.cidade}, exibidos em suas
          cores originais e com o mesmo enquadramento circular uniforme para todos os parlamentares, sem destacar ninguém visualmente.
          Crédito: Câmara Municipal de {SITE.cidade}.
        </li>
        <li>
          <strong>Dados:</strong> obtidos da{" "}
          <a href="https://www.pindamonhangaba.sp.leg.br/dadosabertos">API de Dados Abertos</a> da Câmara Municipal de {SITE.cidade} —
          um canal eletrônico oficial que entrega registros públicos em formato organizado para programas de computador. Ao reutilizar
          nossas tabelas (<Link href="/dados">Dados abertos</Link>), cite a fonte oficial e a data da coleta.
        </li>
        <li>
          <strong>Marca:</strong> logotipo e emblema do {SITE.organizacao}. O portal nunca usa o brasão da Câmara nem da Prefeitura.
        </li>
        <li>
          <strong>Letras (tipografia):</strong> usamos a própria fonte nativa instalada no seu aparelho (San Francisco no iPhone, Segoe
          no Windows, Roboto no Android). Nenhuma letra é baixada da internet, o que protege sua privacidade e deixa a abertura mais
          rápida no celular.
        </li>
        <li>
          <strong>Código aberto:</strong> todo o funcionamento do portal é público e auditável sob licença MIT em{" "}
          <a href={SITE.repositorio}>{SITE.repositorio.replace("https://", "")}</a>.
        </li>
      </ul>
    </div>
  );
}
