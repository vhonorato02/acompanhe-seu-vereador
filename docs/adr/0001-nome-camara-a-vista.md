# ADR 0001 — Nome do projeto: Câmara à Vista

- Data: 07/11/2026
- Status: aceita (pedido do dono do projeto: "mude e adeque o nome do projeto")

## Contexto

O portal se chamava "Acompanhe seu Vereador", o repositório `obs-vereador` e o pacote `acompanhe-seu-vereador`: três nomes para a mesma coisa. Desde a v2 o portal mostra a Câmara inteira (panorama, bairros, leis, comparação), não só perfis de vereadores.

## Decisão

- Nome: **Câmara à Vista** — "à vista" no sentido de visível, com o documento oficial ao lado de cada número. Curto, em português, sem tom de denúncia, ranking ou partido.
- Sempre acompanhado de "Pindamonhangaba · projeto independente" e do nome do Observatório Social do Brasil – Pindamonhangaba, para não parecer site oficial da Câmara.
- Endereço: `https://camara-a-vista.vercel.app` (subdomínio gratuito da Vercel; nenhum domínio comprado). O endereço antigo redireciona com 308.
- Repositório: `vhonorato02/camara-a-vista` (o GitHub redireciona o nome antigo). Pacote: `camara-a-vista`.
- Identidade centralizada em `src/lib/site.ts`; trocar o nome de novo é editar um arquivo.
- Mantidos de propósito: a pasta de cache `.next/cache/acompanhe` (trocar faria a próxima coleta ser completa sem necessidade) e o id do projeto na Vercel.

## Consequências

- Links antigos continuam funcionando pelo redirecionamento.
- A pasta local `Z:\Dev\projetos\obs-vereador` e a pasta do Google Drive mantêm o nome antigo até o dono decidir renomear (mudança fora do repositório).
