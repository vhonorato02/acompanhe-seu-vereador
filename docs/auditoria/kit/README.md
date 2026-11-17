# Kit de auditoria profunda

Prompts para **qualquer IA** com acesso ao repositório, ao terminal e a um navegador executar uma auditoria hostil, corrigir, testar e publicar. Quem escreveu este kit **não** auditou os projetos: só leu o suficiente para apontar onde a documentação já se contradiz.

## O que tem aqui

| Arquivo | Para quê |
|---|---|
| `PROMPT-MESTRE.md` | o método, genérico, vale para qualquer sistema |
| `fichas/acompanhe-seu-vereador.md` | **urgente**: finalizar, endereço gratuito, espelho na VPS |
| `fichas/vps-platform.md` | o servidor que hospeda os outros |
| `fichas/cmdca.md` | conselho da criança e do adolescente |
| `fichas/clinica-dias.md` | clínica (publicidade médica) |
| `fichas/englishtalklab.md` | escola: dois repositórios, portal e cobrança |
| `fichas/quarau.md` | consultoria, em homologação |

## Como usar

1. Abra o agente **dentro do repositório** do projeto, numa conversa nova.
2. Cole o `PROMPT-MESTRE.md` inteiro e, logo abaixo, a ficha do projeto.
3. Acrescente uma linha: `Ramo de trabalho: <nome>` (ou "direto no main", se for a regra do projeto).
4. Toda vez que voltar (contexto novo, outro dia, outra IA), cole só:

   ```text
   Continue a auditoria profunda. Leia docs/auditoria/<data>-profunda/ESTADO.md e siga dali,
   pelas regras do PROMPT-MESTRE (docs/auditoria/kit/ ou o texto colado antes).
   Não confie em nenhum outro documento de estado.
   ```

5. Para um sistema novo, sem ficha: cole só o prompt mestre. Se quiser, peça antes "escreva a ficha deste projeto no formato das outras, só com o que você provar no código".

## Ordem recomendada

1. **Acompanhe seu Vereador** — urgente.
2. **vps-platform** — todos dependem dela; backup e isolamento precisam estar provados antes de confiar nos demais.
3. **CMDCA** — órgão público, crianças: maior risco legal entre os que estão no ar.
4. **Clínica Dias** — saúde, publicidade regulada.
5. **English TalkLab** — o maior; tem dinheiro e dados de alunos; exige a decisão sobre a virada.
6. **Quarau** — ainda em homologação; a auditoria prepara o aceite.

Uma auditoria por vez. Cada uma leva várias sessões.

## Como cobrar o agente

Desconfie dele também. Em qualquer momento, pergunte:

- "Rode o script de cobertura e me mostre a saída." (arquivos e telas sem veredito têm de ser zero)
- "Quantos itens estão `[DECLARADO]` ou `[BLOQUEADO]`? Liste."
- "Mostre três achados P1 com a evidência e o teste que falhava antes da correção."
- "Qual SHA está no ar agora e como você provou?"
- "O que você **não** conseguiu testar?"

Se a resposta vier sem prova, a fase não terminou.

## O que só você pode fazer 🔑

Cada ficha lista os momentos do dono. Os que valem para todos: liberar acesso de leitura ao servidor, escolher domínios, confirmar autorizações de imagem/marca/conteúdo, levar a lista legal a um advogado quando o agente indicar, e o aceite final no seu celular.

## Validade

As fichas foram conferidas em 17/11/2026 nos commits citados em cada uma. Envelhecem rápido: o prompt mestre manda o agente conferir tudo de novo, inclusive a ficha.
