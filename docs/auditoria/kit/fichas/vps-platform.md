# Ficha do projeto — vps-platform (a base de todos os outros)

> Cole **depois** do `PROMPT-MESTRE.md`. Pistas conferidas em 17/11/2026, commit `defc8c5`.

## Missão

Auditar a plataforma que hospeda os sites: se ela cai, vaza ou perde backup, todos caem juntos. Aqui o "produto" é o comando `site` e o servidor; o "usuário" é o dono (não técnico) e os workflows de deploy dos outros repositórios.

## Decisões do dono

- VPS pequena (o README fala em Ubuntu 24.04, 2 vCPU, 2 GB). Custo zero além dela.
- **Invioláveis no servidor:** não mexer em `sshd_config` nem na porta 22322; nada de `ufw`/`iptables` sem confirmar a 22322 liberada; `df -h` antes de baixar imagem; nunca parar nem limpar contêiner de outro site; nada de `docker system prune -a`; `sudo` só onde precisa; backup da configuração antes de mudar.
- Primeiro acesso em **modo leitura**. Qualquer mudança no servidor: um pedido objetivo ao dono, com rollback.

## O que o código mostra (verificar)

- Bash: `bin/site`, `bin/gh-deploy`, `install.sh`, `bootstrap.sh`, `lib/`, `systemd/`, `maintenance/`. Caddy (`caddy/Caddyfile`, `caddy/sites`), `compose.yml`, Postgres compartilhado, restic, Beszel e Gatus.
- Único workflow: `lint.yml`. 59 arquivos rastreados: **leia todos, linha a linha**.
- O `Caddyfile` tem um bloco de TLS sob demanda com lista de nomes permitidos, incluindo sites que **não estão** na lista de repositórios desta auditoria (`virada`, `evolution`).
- Transição de nome do host em andamento (`zewithane` → `zehonorato`): a plataforma já cita os dois; os outros repositórios reverteram para o antigo.

## Divergências e perguntas que a auditoria precisa responder com prova

1. **Inventário real do servidor × repositórios:** o que roda lá (contêineres, portas, bancos, volumes, cron, usuários, chaves autorizadas) e de onde veio cada coisa? Há serviço sem dono, sem backup ou sem atualização? O que é `evolution` (se for API de WhatsApp: superfície de ataque e risco legal altos) e `virada`?
2. **A versão no servidor é a do `main`?** `/srv/platform` é um clone, uma cópia por `tar`? Há alteração manual não versionada?
3. **2 GB aguentam?** Memória, swap, disco e inodes medidos com todos os sites no ar; limites por contêiner; o que morre primeiro; o que acontece num build ou num backup simultâneo.
4. **Backup:** o restic sai da máquina ou fica no mesmo disco? Criptografado? Onde está a senha? **Restaure um site inteiro (banco + mídia) num ambiente descartável** e cronometre. O teste semanal de restauração roda mesmo e alguém lê o resultado?
5. **TLS sob demanda:** o endpoint de autorização impede emissão para nomes arbitrários? Limites da autoridade certificadora? O que acontece com o nome novo sem DNS?
6. **Isolamento entre sites:** um app comprometido alcança o Postgres dos outros, o socket do Docker, os arquivos `.env` vizinhos, a rede interna? Cada app tem usuário e banco próprios com privilégio mínimo?
7. **Caminho de deploy:** a chave de deploy do GitHub tem comando forçado? O que exatamente um workflow comprometido consegue executar no servidor? Imagens no GHCR: públicas ou privadas, e isso é intencional?
8. **`site` como produto:** cada subcomando testado (inclusive erros, argumentos faltando, nome inválido, disco cheio, deploy de imagem que não sobe, rollback, `remover`, `restaurar`). Injeção por argumento? `set -euo pipefail`? Idempotência? Mensagens que um leigo entende?
9. **Sistema:** atualizações de segurança automáticas, reinício pendente, usuários, sudoers, SSH só por chave, fail2ban ou equivalente, relógio, logs com rotação, painéis realmente só em 127.0.0.1.
10. **Monitoramento:** o Gatus avisa alguém de fora quando o próprio servidor cai? Há monitor externo? Alerta de disco e de certificado?
11. **Recuperação total:** se a VPS sumir agora, `install.sh` + backup reconstroem tudo? Quanto tempo? Ensaie num ambiente descartável se houver como; senão `[BLOQUEADO]` com o risco escrito.

## Módulos

Aplicam: M4 (shell: shellcheck, testes de `ci/` e `tools/`), M5 (Postgres compartilhado e backup), M6 inteiro, M7 (onde ficam os dados pessoais dos sites, país do servidor, contrato com o provedor), M12, M13, M15. N/A com justificativa: M2, M3, M8, M9, M10 (salvo a página de manutenção e a página raiz, que são telas e devem ser vistas).

## Momentos do dono 🔑

1. Liberar acesso SSH de leitura para o agente (ou rodar um script de coleta de diagnóstico que o agente escreve e ele cola a saída, sem segredos).
2. Dizer o que são e se ainda servem os serviços sem repositório.
3. Aprovar cada mudança no servidor.
4. Decidir o nome definitivo do host e a data da virada.

## Pronto quando

Gates do prompt mestre + inventário do servidor fechado + restauração completa provada + isolamento entre sites testado + runbook reescrito conforme o que existe + plano de capacidade com números.
