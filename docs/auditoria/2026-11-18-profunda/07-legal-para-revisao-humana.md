# 07 — Blindagem Legal para Revisão Humana (M7 e Missão B/C)

> **Aviso (R14):** Este documento mapeia riscos técnicos e jurídicos com base no código e no tráfego observado em 18/11/2026. **Não constitui parecer jurídico.** Os itens marcados para decisão ou revisão devem ser conferidos por advogado(a) / DPO antes de o Observatório assumir compromissos definitivos.

---

## 1. LGPD (Lei 13.709/2018) e Normas da ANPD

### 1.1 Inventário real de tratamento de dados

| Ativo / Fluxo | Dados tratados | Titulares | Finalidade | Base legal invocada no portal | Onde fica / Operador | Risco / Estado |
|---|---|---|---|---|---|---|
| Cadastro de vereadores (`vereadores.json`) | Nome parlamentar, partido, cargo na Mesa, foto oficial, link institucional | 11 vereadores em exercício (agentes públicos) | Controle social do mandato | LGPD art. 7º, §§ 3º, 4º e 7º; LAI (Lei 12.527/2011) | Vercel (EUA/POP `gru1`) e VPS `zewithane` (Caddy/Docker) | Baixo; confirmar direito de cópia das fotos (§3) |
| Proposições e normas (`proposicoes.json`, `normas.json`) | Título, data, autoria, ementa, link oficial | Vereadores, servidores eventualmente citados e cidadãos citados em moções/requerimentos | Transparência legislativa | LGPD art. 7º, §§ 3º, 4º e 7º e art. 7º, IX (legítimo interesse) | Vercel e VPS `zewithane` | **3 requerimentos com dados sensíveis de saúde de cidadãos identificados na varredura e omitidos preventivamente em `src/lib/content/omissoes.ts`** (`ACH-01`) `[OBSERVADO]` |
| Logs técnicos de acesso HTTP | Endereço IP, data/hora, URL pedida, User-Agent | Visitantes do portal | Segurança, prevenção a abuso e disponibilidade | Legítimo interesse / segurança (art. 7º, IX) e Marco Civil (art. 15) | Vercel Inc. (transferência internacional, art. 33) e servidor Caddy na VPS | `/privacidade` atualizada em `18/11/2026` para citar expressamente ambos os ambientes `[OBSERVADO]` |
| Formulário de erro e contato | E-mail enviado pelo titular (`mailto:`) ou issue pública GitHub | Cidadãos / titulares | Correção de dados e atendimento LGPD | Cumprimento de obrigação legal (art. 18) | Caixa `pindamonhangaba@osbrasil.org.br` / GitHub Inc. | Canal sem GitHub funciona por e-mail; prazo de 15 dias declarado em `/privacidade` e `/correcoes` (`ACH-09`), aguardando confirmação do OSB `[DECLARADO]` |

### 1.2 Varredura de dados pessoais e sensíveis nos 17.545 registros reais (`[OBSERVADO]`)

Varredura executada sobre `proposicoes.json` (`17.545`) e `normas.json` (`409`) da coleta de `18/11/2026`:
- **CPFs:** `0` registros (os 3 matches numéricos de 11 dígitos são números de Processo SEI no padrão `139.xxx.xxx-xx`). `[OBSERVADO]`
- **E-mails e RGs:** `0` registros. `[OBSERVADO]`
- **Telefones:** `14` ocorrências, **todas** idênticas: `(12) 3644-5600` (telefone institucional da Prefeitura em indicações de placas *"PROIBIDO JOGAR LIXO - SUJEITO A MULTA"*). Nenhum telefone particular. `[OBSERVADO]`
- **Dados sensíveis de saúde (art. 5º, II, LGPD) + pessoa natural identificável:** **3 requerimentos encontrados e omitidos preventivamente** em `src/lib/content/omissoes.ts` (chaves `Requerimentos:130774`, `Requerimentos:132682` e `Requerimentos:134695`), que expunham nome completo de paciente, patologia rara, dieta especial/vulnerabilidade financeira da família ou número de prontuário médico. O texto exibido e exportado passa a ser `TEXTO_OMITIDO`, preservando autoria pública, contagens (`número = lista`) e o link oficial da Câmara. `[OBSERVADO]`
- **Risco residual:** novas proposições protocoladas na Câmara podem voltar a citar pacientes ou cidadãos comuns em futuras coletas automáticas (2x/dia). A sentinela adicionada a `scripts/auditar-heuristicas.ts` detecta esses padrões sob demanda, mas **não bloqueia** o build de produção automaticamente (bloquear derrubaria a atualização inteira do portal). Recomenda-se rodar `npm run auditar:heuristicas` periodicamente.

### 1.3 Cookies, armazenamento local e rastreadores (`[OBSERVADO]`)

- **Cookies HTTP / JavaScript:** **zero**. Nenhum `Set-Cookie`, nenhum pixel, nenhum Google Analytics, nenhuma fonte externa (`--font` usa fontes locais do sistema). `[OBSERVADO]`
- **Service Worker (`public/sw.js`):** armazena apenas arquivos estáticos com hash (`/_next/static/`), ícones, marca e `/offline`. Nenhum dado pessoal ou busca é persistido no navegador. `[OBSERVADO]`
- **Conclusão técnica:** não cabe banner de consentimento de cookies (evita poluição e "dark pattern" onde não há rastreamento). `[OBSERVADO]`

---

## 2. Direito Eleitoral (Lei 9.504/1997), Apartidarismo e Risco de Dano Moral

- **Neutralidade técnica verificada:** ordem estritamente alfabética pelo nome parlamentar; zero cores de partido; fotos todas em escala de cinza com mesmo tratamento; ausência total de ranking, nota, selo ou destaque; termos de uso com seção explícita de neutralidade em período eleitoral (`/termos` §6). `[OBSERVADO]`
- **Cuidado humano em ano eleitoral (para revisão jurídica):** embora o portal em si não faça propaganda nem peça votos, em período eleitoral (pré-campanha e campanha municipal), impulsionamento pago de links do portal, recortes fora de contexto por candidatos ou republicação de dados derivados (bairros/temas) podem gerar questionamento na Justiça Eleitoral se vinculados a pedido de voto ou ataque pessoal. Manter a regra de o portal **não aceitar patrocínio nem impulsionamento pago**.
- **Risco de difamação / erro sobre pessoa pública:** mitigado pela exibição fiel da ementa oficial com link direto para a fonte, rotulação explícita de dados derivados ("Classificação automática pelo texto") e criação do prazo claro de **15 dias** também na página `/correcoes` (`ACH-09`).

---

## 3. Propriedade Intelectual e Termos da Fonte Oficial

- **Código-fonte:** licença MIT (`LICENSE`), `© Observatório Social do Brasil – Pindamonhangaba`. `[OBSERVADO]`
- **Tipografia e ícones:** fontes nativas do sistema operacional; ícones SVG próprios minimalistas em `src/components/Icon.tsx`; sem dependência de bibliotecas de ícones pagas ou fontes baixadas. `[OBSERVADO]`
- **Fotos oficiais dos vereadores (atenção jurídica):** hoje `scripts/collect.ts` **copia** os retratos publicados pela Câmara para `/public/fotos/` no build (para evitar hotlinking lento/bloqueado por anti-robô no navegador do cidadão e permitir otimização `next/image` com crédito explícito *"Fotos oficiais da Câmara Municipal"*). Embora sejam retratos institucionais de agentes públicos no exercício do mandato publicados em API oficial de dados abertos, **recomenda-se revisão jurídica humana** confirmando que a cópia local em escala de cinza para finalidade cívica não fere política da Câmara (ou, caso haja oposição formal da Câmara, alternar para monograma com iniciais até liberação escrita). `[DECLARADO]`
- **API de Dados Abertos da Câmara (`/dadosabertos`):** os termos declarados pela fonte autorizam *"acesso livre para qualquer finalidade, respeitada a legislação"*, exigindo respeito à proteção anti-robô (`Bot Verification`), o que o coletor respeita integralmente (token de cidadão legítimo, `User-Agent` honesto, ≥ 1 s entre requisições, parada imediata diante de desafio). `[OBSERVADO]`

---

## 4. Termos da Hospedagem (Vercel Hobby) e Zona Cinzenta — Plano B Pronto

- **Constatado (`[OBSERVADO]`):** a documentação oficial da Vercel restringe o plano **Hobby** a uso *"personal, non-commercial use"* (embora esclareça que pedir doações não configura uso comercial, exige que **nenhum colaborador/desenvolvedor seja remunerado** e veda uso institucional/organizacional fora do uso pessoal). O portal pertence a uma associação civil sem fins lucrativos (OSB Pindamonhangaba), configurando **zona cinzenta contratual** nos termos da Vercel Hobby.
- **Saídas para decisão do dono:**
  1. **Caminho 1:** consultar formalmente o suporte da Vercel sobre elegibilidade sem fins lucrativos / open-source (código MIT público) ou usar a conta pessoal voluntária do mantenedor enquanto voluntário não remunerado.
  2. **Caminho 2 (Plano B já operacional e gratuito):** tornar a **VPS (`vereador.zewithane.vps.brz.dev.br`, ou subdomínio institucional apontado para ela)** o endereço canônico, coletando via GitHub Actions na API `/jsonweb/` (a ser testado com o token em `source-probe` apenas se o dono optar por sair da Vercel) e servindo direto da VPS no Brasil (latência medida hoje: `0,136s` na VPS vs `0,257s` na Vercel!).

---

## 5. Missão C — Análise de Endereço Definitivo Gratuito (Conferido em 18/11/2026)

Verificação direta em `rdap.registro.br` e HTTPS na data de `18/11/2026` (`[OBSERVADO]`):

| Opção | Custo | Prazo | Risco de perda | Credibilidade cívica | Situação observada em 18/11/2026 |
|---|---|---|---|---|---|
| **A. Subdomínio oficial do Observatório** (ex.: `vereadores.pindamonhangaba.sistemaosb.com.br` ou `pindamonhangaba.osbrasil.org.br/...` / subdomínio sob `osbrasil.org.br`) | **R$ 0** | Dias a semanas (depende do OSB Nacional / suporte `sistemaosb.com.br` criar CNAME) | Baixo enquanto durar a parceria; DNS sob controle da rede OSB | **Máxima** (institucional e apartidário) | Os dois domínios-raiz existem e não há subdomínio do portal ainda. `[OBSERVADO]` |
| **B. Manter `acompanhe-seu-vereador.vercel.app`** (removendo imediatamente `camara-a-vista.vercel.app`) | **R$ 0** | **Imediato** | Baixo técnico, mas preso à conta/termos do plano Hobby da Vercel | Média (URL de plataforma técnica, porém limpa e sem parecer oficial da Câmara) | No ar, indexado e com canonical/PWA já estabelecidos. `[OBSERVADO]` |
| **E. Domínio `.org.br` próprio do OSB Pindamonhangaba** (`acompanheseuvereador.org.br`, `vereadorespinda.org.br`, `osbpinda.org.br`) | **~R$ 40/ano** (fora da regra R$ 0) | 1 dia (requer CNPJ do OSB) | Mínimo e independente de plataforma | **Máxima** | Todos retornaram `HTTP 404` no RDAP do `registro.br` em 18/11/2026 (disponíveis). Só aplicável se o Observatório decidir custear. `[OBSERVADO]` |

*(Opções `eu.org` e `is-a.dev` descartadas por imprevisibilidade de aprovação e risco de bloqueio/suspensão).*

**Recomendação ao dono:**
1. **Agora (custo zero, zero quebra):** manter **`acompanhe-seu-vereador.vercel.app`** como endereço de lançamento `1.0.0`, **remover `camara-a-vista.vercel.app`** (e o projeto abandonado `osb-pinda-camara-1s2026`), pois trocar para outro `*.vercel.app` (como `vereadores-pinda.vercel.app`, também livre em 18/11) não resolve a dependência da Vercel nem aumenta credibilidade e quebraria instalações PWA e links já existentes.
2. **Em paralelo (já):** enviar o pedido abaixo à coordenação/TI do OSB Nacional para obter a **Opção A** (subdomínio institucional gratuito). Quando aprovado, executa-se a troca atômica com redirecionamento 301 de `acompanhe-seu-vereador.vercel.app` para o subdomínio oficial.

### Mensagem pronta para o dono enviar ao OSB Nacional (Opção A)

> *Assunto: Solicitação de subdomínio gratuito para portal cívico do OSB Pindamonhangaba*
>
> *Olá, equipe do Observatório Social do Brasil,*
>
> *O OSB Pindamonhangaba desenvolveu o portal aberto e apartidário **Acompanhe seu Vereador**, que organiza as proposições e leis da Câmara Municipal de Pindamonhangaba desde 2025 com ligação direta aos documentos oficiais (hoje em `https://acompanhe-seu-vereador.vercel.app`).*
>
> *Para dar identidade institucional definitiva ao portal sem custo de registro de domínio, gostaríamos de solicitar a criação de um apontamento DNS (`CNAME`) para um subdomínio oficial da rede — por exemplo **`vereadores.pindamonhangaba.osbrasil.org.br`** ou **`vereadores-pinda.sistemaosb.com.br`** — apontando para o servidor do projeto (com HTTPS automático).*
>
> *O projeto não possui fins lucrativos, não exibe anúncios, tem código aberto sob licença MIT e já conta com política de privacidade (LGPD) e termos de uso específicos. Agradecemos o retorno sobre a disponibilidade e os dados de apontamento necessários.*

---

## 6. Lista Consolidada para Decisão e Revisão Humana (Dono / Jurídico / OSB)

1. **Remoção imediata de aliases Vercel (🔑 Dono):** autorizar remover `camara-a-vista.vercel.app` do projeto `acompanhe-seu-vereador` e excluir/pausar `osb-pinda-camara-1s2026` (podemos rodar em 1 comando via Vercel CLI já autenticado, ou clicar no painel).
2. **Uso formal de marca, CNPJ, endereço e caixa de e-mail (🔑 OSB):** confirmar por escrito que o OSB Pindamonhangaba autoriza a exibição de nome, logotipo, CNPJ `30.197.903/0001-75`, endereço e que a caixa `pindamonhangaba@osbrasil.org.br` é monitorada para responder em até **15 dias** pedidos LGPD e avisos de correção.
3. **Revisão jurídica de `/termos`, `/privacidade` e fotos oficiais (⚖️ Advogado/DPO):** validar o prazo de 15 dias, os textos das omissões preventivas (`omissoes.ts`), a referência à infraestrutura Vercel + servidor no Brasil e a republicação em escala de cinza das fotos oficiais da Câmara.
4. **Escolha de endereço e hospedagem canônica (🔑 Dono):** aprovar manter `acompanhe-seu-vereador.vercel.app` no lançamento `1.0.0` enquanto solicita o subdomínio ao OSB Nacional (Opção A), ou decidir migrar o canônico para a VPS se quiser sair do risco contratual do plano Hobby da Vercel.
5. **Deploy hook opcional (`VERCEL_DEPLOY_HOOK_URL`):** criar na Vercel para eliminar os 2 commits automáticos diários (`chore(data): scheduled refresh`) na `main`.
6. **Teste físico e leitor de tela:** testar instalação PWA e navegação em aparelho Android/iPhone real com TalkBack/VoiceOver.
7. **Vocabulário de bairros ambíguos:** confirmar com morador/equipe local se `"Andrade"` = `"Residencial Andrade"` e `"Ipê"` = `"Ipê I"` antes de unir em `src/lib/content/bairros.ts`.
