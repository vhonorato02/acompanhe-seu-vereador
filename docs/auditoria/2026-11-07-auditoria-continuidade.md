# Auditoria de continuidade — ciclo 2 (06–07/11/2026, Brasília)

Soma-se ao [ciclo 1](2026-11-04-ciclo-1.md). Este ciclo releu o código inteiro da `main`, auditou os **dados reais publicados** (snapshot de produção de 05/11/2026: 17.196 proposições, 403 normas, 11 vereadores, baixado de `/dados/` do próprio portal, sem consultar a API da Câmara), corrigiu o que foi encontrado com testes e trocou o nome do projeto.

Status: **release candidata 0.2.0, sem tag `stable`** (motivos em “Gates”).

## Baseline verificado

| Item | Estado em 06/11/2026 |
|---|---|
| `main` | `703c11c` = deployment de produção `dpl_ALemJf7XU5NhA4wq34WZURUQheCo` (READY) |
| Manifesto público | coleta completa de 05/11/2026 00h02, 384 consultas, sem avisos, 17.196 / 403 / 11 |
| Branch padrão do GitHub | era `ccr-7efe4374-h0pmz6` → **corrigida para `main`** (`gh repo edit`), sem mexer em histórico |
| Node em produção | `engines >=22.12` fazia a Vercel escolher **Node 26** apesar do projeto em 24.x (registrado no commit `d4bc942` do branch de auditoria) |
| Baseline local | `npm ci` ok, `typecheck` ok, 70 testes ok, build com amostra ok |

## Achados e correções

Prioridade pela chance de induzir o cidadão ao erro. P1 = muda o significado de um número publicado.

| ID | Sev. | Causa | Arquivo | Correção | Teste | Evidência | Status |
|---|---|---|---|---|---|---|---|
| B01 | P1 | O extrator de bairros só reconhecia “bairro” minúsculo. **3.147 ementas** com “Bairro X” (maiúsculo), “Bairro do X”, nomes em minúsculas e listas (“nos bairros A, B e C”) eram ignoradas | `src/lib/data/extrair.ts` | Novo leitor de nomes: maiúsculas/minúsculas, artigo, listas, fim do nome por pontuação ou palavras como “localizado”; descarta “Pindamonhangaba”, “município”, “zona leste” | `tests/bairros.test.ts` (frases reais do corpus) | Registros com bairro: **5.484 → 9.426**. Alto do Cardoso 79 → 175; Distrito de Moreira César 81 → 519; Araretama 562 → 850 | corrigido |
| B02 | P1 | Grafias diferentes do mesmo bairro viravam páginas e contagens separadas (Shangrilá ×4 grafias, Bom Sucesso/Bonsucesso, Eloyna/Eloina…) | `src/lib/content/bairros.ts` | Vocabulário versionado de variantes, publicado na metodologia; nome exibido = grafia mais usada | `tests/bairros.test.ts` | Shangrilá 66 → 144; Bom Sucesso 69 → 148 | corrigido |
| B03 | P1 | Números sem lista (viola “número = lista”): destinatários (“A quem se pede”), funil “do projeto à lei”, “% assinadas junto” no perfil | `query.ts`, `analise.ts`, `page.tsx`, perfil | Filtros `destino`, `conjunto`, `origem`, `lei` (com contexto do dataset); todo número desses blocos agora é link para a lista | `tests/numero-lista.test.ts`, E2E “destinatário e funil”, “coautoria” | Produção: 180 de 503 projetos de lei de vereadores citados como origem de lei | corrigido |
| B04 | P2 | Falsos positivos de assunto: “posteriormente”→iluminação, “aguardar”→água, sobrenome Matos→mato, Petrobras/“garrafa pet”→animais, “medição”→saúde, igreja Quadrangular→esporte, “consulta pública”→saúde | `src/lib/data/temas.ts` | Regras ajustadas | `tests/temas.test.ts` | 90 atribuições falsas removidas nos 15.197 pedidos | corrigido |
| B05 | P2 | 209 registros com `&quot;`/`&#39;` exibidos crus no site e no CSV | `src/lib/data/derive.ts` | Decodificação só das entidades conhecidas, documentada como transformação | `tests/derive.test.ts`, E2E | — | corrigido |
| B06 | P2 | Cache incremental lido sem validação (`as Cache`); cache corrompido podia quebrar ou contaminar a coleta | `src/lib/coleta/coletar.ts` | Validação Zod; inválido → coleta completa com aviso | `tests/coleta.test.ts` (com teste de mutação) | — | corrigido |
| B07 | P2 | Escrita não atômica: falha no meio deixava dataset e dados abertos de versões diferentes; cache gravado antes das validações finais | `coletar.ts` | Escrita em área temporária e promoção só no fim; descarte em falha | `tests/coleta.test.ts` (“falhas nunca viram snapshot novo”) | — | corrigido |
| B08 | P2 | Sem cache (despejado pela Vercel), uma coleta completa truncada não tinha base de comparação | `coletar.ts`, `scripts/collect.ts` | Compara com o manifesto publicado; queda > 10% falha o build | `tests/coleta.test.ts` | — | corrigido |
| B09 | P2 | Paginação em loop só parava no limite de 1.500 páginas (1.500 consultas à Câmara) | `coletar.ts` | Página que só repete registros interrompe a coleta | `tests/coleta.test.ts` | 2 consultas em vez de 1.500 | corrigido |
| B10 | P2 | HTTP 429 não respeitava `Retry-After` | `src/lib/camara/client.ts` | Espera o `Retry-After` (teto 60 s) e tenta de novo | `tests/client.test.ts` | — | corrigido |
| B11 | P2 | Node sem pin (Vercel usava 26) | `package.json`, `.nvmrc`, CI | `engines: 24.x`, `.nvmrc`, CI lê `.nvmrc` | CI | — | corrigido |
| B12 | P2 | Buscar dentro de uma lista filtrada descartava bairro, assunto, grupo, mês, coautor | `PaginaLista.tsx` | Campos ocultos gerados do próprio filtro | `numero-lista.test.ts`, E2E “filtros” | — | corrigido |
| B13 | P2 | “11 vereadores” fixo no código | `page.tsx`, `vereadores/page.tsx` | Contagem do dataset | E2E | — | corrigido |
| B14 | P2 | Metodologia e página de leis diziam que a lei entra no perfil pela frase “de autoria do Vereador”; o código liga pelo número do projeto | `metodologia`, `normas` | Texto descreve o método real | revisão | — | corrigido |
| B15 | P2 | Sem `metadataBase`, canonical, robots, sitemap, imagem de compartilhamento | `src/app/` | `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, canonical por rota | E2E “SEO” | — | corrigido |
| B16 | P2 | Sem CSP | `next.config.ts` | CSP restrita à própria origem (`unsafe-inline` necessário para a hidratação estática), `frame-ancestors 'none'`, COOP | E2E “cabeçalhos” | — | corrigido |
| B17 | P2 | Acessibilidade (axe, achados reais): tabelas roláveis sem foco de teclado; contraste do aviso de amostra no tema escuro; foco do campo de busca só por cor de borda; título da marca divergente do texto visível; salto h1→h3 no Comparar; cabeçalho transbordando com texto a 200% | CSS e componentes | Corrigidos um a um | `e2e/qualidade.spec.ts` | 0 violações axe WCAG 2.2 A/AA em 13 rotas × claro/escuro × 5 perfis | corrigido |
| B18 | P2 | Texto digitado antes da hidratação (celular lento) não disparava a busca ao vivo | `Busca.tsx` | Sincroniza o valor do campo ao hidratar | E2E WebKit | — | corrigido |
| B19 | P3 | Perfil sem foto mostrava um bloco vazio enorme | perfil | Monograma com iniciais e aviso “foto indisponível” | captura | — | corrigido |
| B20 | P2 | Reportar erro exigia conta no GitHub, sem orientação | `/correcoes`, `.github/ISSUE_TEMPLATE` | Página de correções, formulário de aviso e rótulo `correção` | E2E | Contato sem GitHub **pendente**: o e-mail achado (relatório OSB 2021) não foi confirmado | parcial |
| B21 | P3 | Sem página de privacidade nem créditos de fotos/fontes | `/sobre` | Seção de privacidade e créditos | revisão | — | corrigido |
| B22 | P3 | Apelido antigo de vereador podia aparecer duplicado na autoria | `Item.tsx` | Compara nome normalizado e apelidos | revisão | 0 casos no snapshot atual | corrigido |

## Troca de nome: “Acompanhe seu Vereador” → **Câmara à Vista**

O portal mostra a Câmara inteira (pedidos, projetos, leis, bairros), não só vereadores, e o repositório (`obs-vereador`), o pacote e o site tinham nomes diferentes. Decisão e detalhes em [ADR 0001](../adr/0001-nome-camara-a-vista.md). Identidade centralizada em `src/lib/site.ts`.

## Testes executados (exit codes)

| Comando | Resultado |
|---|---|
| `npm ci` | 0 |
| `npm audit --audit-level=high` | 0 (0 vulnerabilidades) |
| `npm run typecheck` | 0 |
| `npm test` | 0 — **119 testes** em 12 arquivos (eram 70), incluindo 18 de integração do coletor |
| `npm run build` (amostra rotulada) | 0 |
| `npx playwright test` (5 perfis) | 0 — **222 testes**: Chromium 1440, Android 412 (Pixel 7), Samsung 360, Firefox desktop, WebKit iPhone 15 |
| Varredura de segredos (árvore e histórico) | nenhum token |

Nível de evidência: navegadores **emulados** no Windows; nenhum aparelho físico. Leitor de tela real não foi usado (só árvore de acessibilidade e axe). Capturas por rota/viewport/tema ficam em `e2e-artifacts/capturas/` (local) e como artefato do CI.

## Gates

| Gate | Status | Justificativa |
|---|---|---|
| Dados | PASS | Contagens = listas (testes unitários e E2E); classificações rotuladas como derivadas; data e fonte em todas as páginas |
| Build | PASS | comandos acima |
| Coleta | PASS (simulada) | falhas simuladas rejeitadas; coleta real só é provada no build da Vercel com token — ver HANDOFF |
| Funcional | PASS (emulação) | 222 E2E |
| Segurança | PASS | sem token exposto; CSP, HSTS, nosniff, COOP; links oficiais validados; CSV neutraliza fórmulas |
| Acessibilidade | PASS com ressalva | axe sem violações + teclado/zoom; sem leitor de tela real nem certificação |
| Visual/responsivo | PASS (emulação) | capturas 360/412/1440, claro/escuro |
| PWA | N/A justificado | manifest e ícones (instalável), **sem service worker**: cópia offline mostraria coleta antiga como atual. ADR 0002 |
| Notificações | N/A justificado | sem evento cívico, sem banco para inscrições; não implementar teatro |
| SEO/legal | PASS com pendência | metadados, robots, sitemap, privacidade, créditos; contato institucional e parecer jurídico ficam com o Observatório |
| Operação | PASS | `main` `f31b3be` → `dpl_GL98fDVSwhskN26Qzd4mrKDzQvGF` READY; coleta real completa de 07/11 00h33 (17.205 / 407 / 11, sem avisos); smoke E2E de 30 testes contra produção verde; rollback por “Promote” do deployment anterior (`dpl_ALemJf7XU5NhA4wq34WZURUQheCo`); só recursos gratuitos |
| Handoff | PASS | HANDOFF, README, CLAUDE.md e ADRs atualizados |

**Por que não `stable`:** contato institucional sem GitHub ainda não confirmado; nenhum teste em aparelho físico ou leitor de tela; a reconciliação com a API foi feita sobre o snapshot publicado, não com nova coleta.

## Riscos remanescentes

1. Heurísticas (assuntos, bairros, destinatários) continuam heurísticas: erram em casos raros. Revisar a cada trimestre com `npm run auditar:heuristicas` (lê os dados abertos do próprio portal) e pelos avisos de cidadãos.
2. Registros retirados pela Câmara só somem na coleta completa mensal.
3. Bairros com nomes parecidos não unificados (“Andrade” × “Residencial Andrade”, “Ipê” × “Ipê I”) esperam confirmação de quem conhece a cidade.
