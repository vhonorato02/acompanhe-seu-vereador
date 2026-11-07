# ADR 0002 — Instalável, sem service worker e sem notificações

- Data: 07/11/2026
- Status: aceita; a parte "sem service worker" foi substituída pela [ADR 0004](0004-service-worker-sem-dados.md) em 07/11/2026

## Contexto

A auditoria pedia avaliar PWA e notificações. O portal é estático por coleta; não tem banco, login nem evento cívico em tempo real (a atualização é automática, duas vezes por dia).

## Decisão

- **Manifest e ícones, sem service worker.** O portal pode ser adicionado à tela inicial (nome, ícone maskable, `standalone`), mas toda visita lê o snapshot publicado. Um cache offline poderia mostrar uma coleta antiga como se fosse atual, o que contraria o princípio de proveniência.
- **Sem notificações push.** Exigiriam guardar inscrições (banco), chaves VAPID, opção de cancelar e política de privacidade própria, para avisar algo que não é evento em tempo real. Custo e risco maiores que o benefício. Registrado como N/A, não como pendência.

## Quando rever

Se a Câmara publicar votações ou pautas em tempo real e o Observatório quiser avisar cidadãos, reabrir com uma solução gratuita para inscrições e consentimento explícito.
