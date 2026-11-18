# Sugestão CIAP-2 no SOAP

Extensão (Manifest V3, Chrome/Firefox) que sugere códigos CIAP-2 a partir do texto do campo **Subjetivo** no SOAP do e-SUS PEC. Escrita em React + TypeScript + Vite, a partir do esqueleto [react-browser-extension](https://github.com/herodrigues/react-browser-extension).

A extensão **só lê** o campo escolhido e permite **copiar o código**. Ela não preenche o "Motivo da consulta" nem altera o prontuário. O processamento é 100% local: nenhum texto clínico é enviado ou armazenado (só as preferências, como ligar/desligar e o máximo de sugestões).

## Estrutura

```
src/
├── data/ciap-dictionary.json   # Dicionário de códigos e termos (edite aqui)
├── core/                       # Motor de sugestão, TS puro, sem DOM
│   ├── engine.ts               #   createEngine(dictionary).suggest(text)
│   ├── normalize.ts
│   └── engine.test.ts
├── content/                    # Painel injetado no PEC
│   ├── index.tsx               #   monta o Shadow DOM e o React
│   ├── components/Panel.tsx
│   ├── hooks/                  #   estado, seleção do campo, URL, atividade do DOM
│   ├── dom/                    #   detecção/leitura de campos e posicionamento
│   └── panel.css
├── popup/                      # Popup da extensão (liga/desliga e testa o dicionário)
├── options/                    # Página de configurações
└── shared/                     # settings, componentes e tema compartilhados
```

O painel roda dentro de um **Shadow DOM**: o CSS do PEC não afeta o painel e vice-versa (por isso não há mais `!important`).

## Editando o dicionário

Cada entrada de `src/data/ciap-dictionary.json` tem o formato:

```json
{ "code": "N01", "label": "Cefaleia", "terms": ["cefaleia", "dor de cabeça"] }
```

Os termos são comparados sem acentos e sem diferenciar maiúsculas. Os códigos vêm do [CodeSystem BRCIAP2](https://fhir.saude.go.gov.br/r4/reds-go/CodeSystem-BRCIAP2.html); os termos coloquiais são heurísticas e precisam de revisão clínica institucional. O teste `npm test` valida que os códigos são únicos e bem formados.

## Desenvolvimento

Requisitos: Node.js 20+.

```bash
npm install
npm test          # testes do motor
npm run typecheck # tsc
npm run build     # gera ./dist
npm run dev       # build em modo watch
```

O build roda duas vezes de propósito: `vite.config.ts` gera popup e opções; `vite.content.config.ts` gera o content script como um único IIFE (`dist/content/index.js`), pois content scripts não podem importar chunks.

### Carregar no navegador

- **Chrome:** `chrome://extensions` → Modo do desenvolvedor → *Carregar sem compactação* → pasta `dist`.
- **Firefox:** `about:debugging#addons` → *Carregar extensão temporária* → `dist/manifest.json`.

### Outro endereço do PEC

Edite `content_scripts[0].matches` em `public/manifest.json`, rode `npm run build` e recarregue a extensão. O painel aparece em caminhos com `/soap` como segmento da URL (`SOAP_PATH` em `src/content/components/Panel.tsx`).

## Como usar

1. Abra a tela SOAP no PEC.
2. No painel, clique em **Selecionar Subjetivo** e depois dentro da caixa onde você digita.
3. As sugestões são atualizadas conforme você digita. Clique em **Copiar** e use o código manualmente.

Quando a estrutura da página permite, o painel fica compacto, logo antes de "Motivo da consulta"; caso contrário, flutua no canto da tela. Se o PEC recriar o campo ou a navegação mudar, selecione o Subjetivo de novo.

## Limites

As sugestões dependem de um dicionário limitado e de regras textuais (incluindo negação/hipótese próximas ao termo) e podem omitir termos ou errar o contexto. A ferramenta não faz diagnóstico e exige revisão do profissional e validação institucional. Use apenas dados fictícios nos testes.
