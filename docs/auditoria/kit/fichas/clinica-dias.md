# Ficha do projeto — Clínica Dias

> Cole **depois** do `PROMPT-MESTRE.md`. Pistas conferidas em 17/11/2026, commit `3917c2a`.

## Missão

Auditar e estabilizar o site da clínica. É **saúde**: publicidade médica regulada, dado sensível, e reputação de profissionais com nome e registro expostos.

## Decisões do dono

- O site mostra CRM/UF (e RQE, se houver) ao lado do nome. O conteúdo é decisão da clínica: não criar validação que impeça publicar nem esconda profissional ou especialidade.
- Conteúdo editorial no CMS; configuração em variável de ambiente validada.
- Migrações só aditivas; redirecionamentos do site antigo sempre 301; nada exclusivo de uma hospedagem.
- Português em tudo, inclusive commits. `main` protegido, uma branch por tarefa, PR.

## O que o código mostra (verificar)

- Next.js + Payload CMS 3, Postgres, S3 para mídia, plugins de SEO e de redirecionamentos, pré-visualização ao vivo, Tailwind. pnpm 12, Node ≥ 24.
- Coleções: `Media`, `Pages`, `Professionals`, `Simple`, `Specialties`, `Users`.
- Workflows: `ci`, `deploy` (todo push no `main` publica na VPS), `docker`.
- `vercel.json` transforma o projeto da Vercel num redirecionador para o endereço da VPS, com redirecionamento **temporário** e host fixo no arquivo.
- `package.json` está em versão `0.0.0` embora exista `CHANGELOG.md` e a regra de tags semver.

## Perguntas que a auditoria precisa responder com prova

1. **Qual é o endereço oficial hoje?** Domínio próprio, Vercel, VPS? Para onde aponta o DNS? O site antigo (WordPress) ainda existe? Os 301 legados cobrem **todas** as URLs antigas com tráfego (teste a lista real, inclusive `wp-content/uploads`)?
2. O redirecionamento da Vercel é temporário e aponta para um nome de host que está mudando: o que acontece quando o nome antigo parar de responder?
3. **Versão:** qual a tag no ar? `0.0.0` × changelog × imagem publicada.
4. **Migrações:** o CI realmente barra operação destrutiva e coleção alterada sem migração? Tente passar uma de propósito num PR de teste.
5. **Leitura pública com `overrideAccess: false`:** procure toda chamada à API local do Payload e prove que nenhuma rota pública vaza rascunho, usuário ou campo interno. Teste também REST e GraphQL anônimos.
6. **Mídia em S3:** bucket público? Listagem aberta? Arquivos apagados continuam acessíveis? Custo (é free tier mesmo?).
7. **Formulários e contato:** há agendamento, formulário, WhatsApp? Qualquer campo livre pode receber dado de saúde: para onde vai, quem lê, por quanto tempo fica, está em log?
8. **O build consulta o banco:** o que acontece com o deploy se o banco estiver fora? E o "aquecimento" das páginas no fim?

## Ênfases por módulo

- **M7 (máxima):**
  - Publicidade médica do CFM (Resolução 2.336/2023 — confirme a vigente): identificação do responsável técnico com CRM, RQE para anunciar especialidade, vedação de promessa de resultado e sensacionalismo, regras para imagens de antes e depois, depoimentos, preços e promoções. Varra **cada página e cada texto do CMS** contra essas regras e entregue a lista ao dono.
  - LGPD: dado de saúde é sensível. Minimização em formulários, base legal, operadores, retenção.
  - Outras profissões da clínica (se houver psicologia, nutrição, fisioterapia, odontologia): conselhos próprios, regras próprias.
  - Direito de imagem de profissionais e pacientes nas fotos.
- **M8:** a secretária consegue trocar um horário, um profissional e uma foto sem ajuda? E sem quebrar o site?
- **M9:** SEO local é o negócio: páginas de especialidade e de profissional respondem à busca real? Dados estruturados de clínica e de médico **verdadeiros**; consistência de nome, endereço e telefone com o perfil no Google.
- **M2:** saúde pede confiança e calma: sem banco de imagem genérico, sem estética de template.
- **M10:** provavelmente N/A.

## VPS

Plataforma `vps-platform`, site `clinica`. Regras na ficha `vps-platform.md`. Backup de banco e mídia restaurado como prova.

## Momentos do dono 🔑

1. Domínio oficial e DNS.
2. Revisão, pela clínica, da lista de conformidade de publicidade médica.
3. Quem tem acesso ao painel.
4. Aceite no celular.

## Pronto quando

Gates do prompt mestre + endereço oficial resolvido com 301 completos + varredura de publicidade médica entregue e itens técnicos corrigidos + API anônima sem vazamento + ciclo editorial provado.
