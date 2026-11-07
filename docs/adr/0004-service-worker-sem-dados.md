# ADR 0004 — Service worker só para arquivos estáticos, nunca para páginas ou dados

- Data: 07/11/2026
- Estado: aceita (substitui a parte "sem service worker" da [ADR 0002](0002-instalavel-sem-service-worker.md); a decisão sobre notificações continua valendo)

## Contexto

O dono pediu uma rodada de PWA. A ADR 0002 recusou service worker porque uma cópia offline poderia mostrar uma coleta antiga como se fosse atual. Esse risco vem de guardar **páginas e dados**, não de guardar **arquivos estáticos**.

## Decisão

`public/sw.js`, registrado só em produção (`src/components/RegistrarSW.tsx`):

- **Guarda (cache-first):** JS/CSS com hash em `/_next/static/`, ícones e a página `/offline`. O conteúdo desses arquivos não muda sob a mesma URL, então o cache não pode ficar errado; o ganho é abrir mais rápido a partir da segunda visita.
- **Nunca guarda:** páginas (navegação), `/dados/*`, `/api/*`, imagens otimizadas e fotos (a Câmara pode trocar um retrato mantendo o nome).
- **Sem conexão:** a navegação mostra `/offline`, que diz isso com clareza e não mostra nenhum número.
- `sw.js` é servido com `Cache-Control: no-cache` para que uma correção chegue na visita seguinte; versões antigas do cache são apagadas na ativação.
- Manifesto com `id`, `short_name` curto ("Vereadores"), atalhos (Vereadores, O seu bairro, Buscar) e ícone maskable.

## Consequências

- Continua verdade que toda página e todo número mostrados vêm da coleta publicada no momento da visita.
- Teste: `e2e/pwa.spec.ts` (registro, página offline em vez de cópia antiga, dado nunca servido do cache, manifesto).
- Sem offline de verdade (consultar a lista sem internet). Se o Observatório quiser isso no futuro, cada tela offline precisaria exibir a data da coleta guardada em destaque.
