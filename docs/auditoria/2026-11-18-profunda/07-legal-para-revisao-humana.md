# 07 — Blindagem Legal para Revisão Humana (M7 e Missão B/C)

> **Aviso (R14):** Este documento mapeia riscos técnicos e jurídicos com base no código e no tráfego observado em 18/11/2026. **Não constitui parecer jurídico.** Os itens marcados para decisão ou revisão devem ser conferidos por advogado(a) / DPO antes de o Observatório assumir compromissos definitivos.

---

## 1. LGPD (Lei 13.709/2018) e Normas da ANPD

### 1.1 Inventário real de tratamento de dados

| Ativo / Fluxo | Dados tratados | Titulares | Finalidade | Base legal invocada no portal | Onde fica / Operador | Risco / Estado |
|---|---|---|---|---|---|---|
| Cadastro de vereadores (`vereadores.json`) | Nome parlamentar, partido, cargo na Mesa, foto oficial, link institucional | 11 vereadores em exercício (agentes públicos) | Controle social do mandato | LGPD art. 7º, §§ 3º, 4º e 7º; LAI (Lei 12.527/2011) | Vercel Inc. (`https://acompanhe-seu-vereador.vercel.app`) | Baixo; política em `/termos` §5 prevê troca/iniciais mediante pedido `[OBSERVADO]` |
| Proposições e normas (`proposicoes.json`, `normas.json`) | Título, data, autoria, ementa, link oficial | Vereadores, servidores eventualmente citados e cidadãos citados em moções/requerimentos | Transparência legislativa | LGPD art. 7º, §§ 3º, 4º e 7º e art. 7º, IX (legítimo interesse) | Vercel Inc. | **3 requerimentos com dados sensíveis de saúde omitidos em `src/lib/content/omissoes.ts`** (`ACH-01`); `/privacidade` explicita ausência de perfilamento (art. 20) e proteção a menores (art. 14) `[OBSERVADO]` |
| Logs técnicos de acesso HTTP | Endereço IP, data/hora, URL pedida, User-Agent | Visitantes do portal | Segurança, prevenção a abuso e disponibilidade | Legítimo interesse / segurança (art. 7º, IX) e Marco Civil (art. 15) | Vercel Inc. (transferência internacional, art. 33) | `/privacidade` atualizada em `18/11/2026` refletindo hospedagem única na Vercel (cópia VPS removida via ADR 0005) `[OBSERVADO]` |
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

- **Neutralidade técnica verificada:** ordem estritamente alfabética pelo nome parlamentar; zero cores de partido; fotos todas em escala de cinza com mesmo tratamento; ausência total de ranking, nota, selo ou destaque; termos de uso (`/termos` §6) agora citam explicitamente a Lei nº 9.504/1997 e proíbem patrocínio, anúncios, impulsionamento pago e uso eleitoral da marca do Observatório. `[OBSERVADO]`
- **Cuidado humano em ano eleitoral (para revisão jurídica):** embora o portal em si não faça propaganda nem peça votos, em período eleitoral (pré-campanha e campanha municipal), impulsionamento pago de links do portal, recortes fora de contexto por candidatos ou republicação de dados derivados (bairros/temas) podem gerar questionamento na Justiça Eleitoral se vinculados a pedido de voto ou ataque pessoal. Manter a regra de o portal **não aceitar patrocínio nem impulsionamento pago**.
- **Risco de difamação / erro sobre pessoa pública:** mitigado pela exibição fiel da ementa oficial com link direto para a fonte, rotulação explícita de dados derivados ("Classificação automática pelo texto") — agora também presente em `/comparar` —, esclarecimento em `/privacidade` de que não há decisão automatizada ou perfilamento de pessoa natural (LGPD, art. 20) e prazo claro de **15 dias** em `/correcoes` (`ACH-09`).

---

## 3. Propriedade Intelectual e Termos da Fonte Oficial

- **Código-fonte:** licença MIT (`LICENSE`), `© Observatório Social do Brasil – Pindamonhangaba`. `[OBSERVADO]`
- **Tipografia e ícones:** fontes nativas do sistema operacional; ícones SVG próprios minimalistas em `src/components/Icon.tsx`; sem dependência de bibliotecas de ícones pagas ou fontes baixadas. `[OBSERVADO]`
- **Fotos oficiais dos vereadores (atenção jurídica):** hoje `scripts/collect.ts` **copia** os retratos publicados pela Câmara para `/public/fotos/` no build (para evitar hotlinking lento/bloqueado por anti-robô no navegador do cidadão e permitir otimização `next/image` com crédito explícito *"Fotos oficiais da Câmara Municipal"*). Embora sejam retratos institucionais de agentes públicos no exercício do mandato publicados em API oficial de dados abertos e `/termos` §5 agora faculte explicitamente a qualquer gabinete solicitar atualização ou substituição por iniciais, **recomenda-se revisão jurídica humana** confirmando a conformidade da cópia local em escala de cinza para finalidade cívica. `[DECLARADO]`
- **API de Dados Abertos da Câmara (`/dadosabertos`):** os termos declarados pela fonte autorizam *"acesso livre para qualquer finalidade, respeitada a legislação"*, exigindo respeito à proteção anti-robô (`Bot Verification`), o que o coletor respeita integralmente (token de cidadão legítimo, `User-Agent` honesto, ≥ 1 s entre requisições, parada imediata diante de desafio). `[OBSERVADO]`

---

## 4. Termos da Hospedagem (Vercel Hobby) e Zona Cinzenta

- **Constatado (`[OBSERVADO]`):** a documentação oficial da Vercel restringe o plano **Hobby** a uso *"personal, non-commercial use"* (embora esclareça que pedir doações não configura uso comercial, exige que **nenhum colaborador/desenvolvedor seja remunerado** e veda uso institucional/organizacional fora do uso pessoal). O portal pertence a uma associação civil sem fins lucrativos (OSB Pindamonhangaba), configurando **zona cinzenta contratual** nos termos da Vercel Hobby.
- **Decisão registrada em 18/11/2026 ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)):** o dono optou por **hospedagem única exclusivamente na Vercel**, descomissionando a cópia espelhada em VPS.
- **Caminho recomendado para revisão humana:** consultar formalmente o suporte da Vercel sobre elegibilidade sem fins lucrativos / open-source (código MIT público, voluntariado não remunerado) ou validar se o projeto permanece hospedado na conta pessoal voluntária do mantenedor enquanto não há remuneração envolvida.

---

## 5. Missão C — Análise de Endereço Definitivo (Decisão Registrada em 18/11/2026)

Verificação direta em `rdap.registro.br` e HTTPS na data de `18/11/2026` (`[OBSERVADO]`):

| Opção | Custo | Prazo | Risco de perda | Credibilidade cívica | Situação observada em 18/11/2026 |
|---|---|---|---|---|---|
| **A. Subdomínio oficial do Observatório** (ex.: `vereadores.pindamonhangaba.osbrasil.org.br` ou `vereadores-pinda.sistemaosb.com.br`) | **R$ 0** | Dias a semanas (CNAME pelo OSB Nacional) | Baixo enquanto durar a parceria | **Máxima** | Domínios-raiz ativos; **não adotado agora por decisão do dono**. `[OBSERVADO]` |
| **B. Manter `acompanhe-seu-vereador.vercel.app`** (removendo imediatamente `camara-a-vista.vercel.app`) — **OPÇÃO ESCOLHIDA** | **R$ 0** | **Imediato** | Baixo técnico; sujeito aos termos Hobby da Vercel | Média (URL de plataforma técnica, porém limpa e consolidada) | No ar, indexado, único domínio canônico definido pelo dono em 18/11/2026 ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)). `[OBSERVADO]` |
| **E. Domínio `.org.br` próprio do OSB Pindamonhangaba** (`acompanheseuvereador.org.br`, `vereadorespinda.org.br`, `osbpinda.org.br`) | **~R$ 40/ano** (fora da regra R$ 0) | 1 dia (requer CNPJ do OSB) | Mínimo | **Máxima** | Todos retornaram `HTTP 404` no RDAP do `registro.br` em 18/11/2026 (disponíveis). Descartado pela regra R$ 0. `[OBSERVADO]` |

*(Decisão executada em 18/11/2026: `camara-a-vista.vercel.app` foi removido do projeto e `osb-pinda-camara-1s2026` foi deletado via Vercel CLI, ambos comprovados com `HTTP 404`; permanece apenas `https://acompanhe-seu-vereador.vercel.app`).*

---

## 6. Lista Consolidada para Decisão e Revisão Humana (Dono / Jurídico / OSB)

1. **Limpeza Vercel (✅ Executado em 18/11/2026):** `camara-a-vista.vercel.app` removido e `osb-pinda-camara-1s2026` deletado (`HTTP 404`); resta apenas desligar o contêiner antigo `vereador` na VPS externa fora do repositório, se não for mais usado.
2. **Uso formal de marca, CNPJ, endereço e caixa de e-mail (🔑 OSB):** confirmar por escrito que o OSB Pindamonhangaba autoriza a exibição de nome, logotipo, CNPJ `30.197.903/0001-75`, endereço e que a caixa `pindamonhangaba@osbrasil.org.br` é monitorada para responder em até **15 dias** pedidos LGPD e avisos de correção.
3. **Revisão jurídica de `/termos`, `/privacidade` e fotos oficiais (⚖️ Advogado/DPO):** validar o prazo de 15 dias, as omissões preventivas (`omissoes.ts`), a declaração de ausência de perfilamento/decisão automatizada (LGPD, art. 20), a proteção a menores (art. 14), a referência à Lei Eleitoral (Lei 9.504/1997), a hospedagem única na Vercel e a política de fotos em `/termos` §5 (guia completo em [docs/GUIA-DO-OBSERVATORIO.md](../../GUIA-DO-OBSERVATORIO.md) §6.1).
4. **Elegibilidade Vercel Hobby × VPS para ONG (🔑 Dono / Vercel):** confirmar enquadramento não comercial / voluntário / MIT junto à Vercel ou avaliar migração futura para VPS simples de baixo custo (~R$ 30/mês) ou hospedagem estática gratuita, conforme comparativo em [docs/GUIA-DO-OBSERVATORIO.md](../../GUIA-DO-OBSERVATORIO.md) §6.3.
5. **Deploy hook opcional (`VERCEL_DEPLOY_HOOK_URL`):** criar na Vercel para eliminar os 2 commits automáticos diários (`chore(data): scheduled refresh`) na `main`.
6. **Teste físico e leitor de tela:** testar instalação PWA e navegação em aparelho Android/iPhone real com TalkBack/VoiceOver.
7. **Vocabulário de bairros ambíguos:** confirmar com morador/equipe local se `"Andrade"` = `"Residencial Andrade"` e `"Ipê"` = `"Ipê I"` antes de unir em `src/lib/content/bairros.ts`.
