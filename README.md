# Controle de Corridas

Aplicativo de controle de ganhos por hora para motoristas de aplicativo, com controle de ponto (turno de trabalho) e geração de QR Code Pix para cobrança.

Este projeto foi refatorado a partir de um único arquivo `index.html` (HTML + CSS + JS inline) para uma estrutura organizada em múltiplos arquivos, **sem nenhuma alteração de funcionalidade, lógica, nomes de função, IDs, classes ou textos exibidos ao usuário**.

## Estrutura do projeto

```
MeuProjeto/
│
├── index.html          → Estrutura HTML, importações de CSS/JS
├── css/
│   └── style.css       → Todo o CSS do aplicativo
│
├── js/
│   ├── utils.js         → Funções utilitárias (abas, tema, atualizar app, responsividade, CRC16/EMV)
│   ├── corridas.js       → Ganhos por hora, corridas, meta, controle de ponto, relatório
│   ├── pix.js            → Chaves Pix, taxa de 20%, geração do QR Code, confirmação e avaliação
│   └── app.js             → Inicialização (DOMContentLoaded)
│
└── README.md
```

### Ordem de carregamento dos scripts

O `index.html` carrega os scripts nesta ordem, que deve ser respeitada:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="js/utils.js"></script>
<script src="js/corridas.js"></script>
<script src="js/pix.js"></script>
<script src="js/app.js"></script>
```

A biblioteca `qrcode.min.js` precisa ser carregada antes de `pix.js`, pois ele usa a classe `QRCode`. Os demais arquivos JS dependem de funções e variáveis globais definidas nos arquivos anteriores (por exemplo, `app.js` usa funções de `utils.js`, `corridas.js` e `pix.js`).

## Como abrir localmente

1. Baixe ou clone a pasta `MeuProjeto` para o seu computador.
2. Dê duplo clique no arquivo `index.html`, ou abra-o pelo navegador (Chrome, Firefox, Edge etc.).
3. Como o projeto não usa APIs que exigem servidor (todos os dados ficam salvos no `localStorage` do navegador), ele funciona normalmente até mesmo abrindo o arquivo direto do disco (`file://`).

Caso o navegador bloqueie o carregamento dos arquivos `css/style.css` ou dos scripts em `js/` ao abrir via `file://`, você pode rodar um servidor local simples. Com Python instalado, dentro da pasta `MeuProjeto`, execute:

```bash
python3 -m http.server 8000
```

E acesse `http://localhost:8000` no navegador.

## Como publicar no GitHub

1. Crie um repositório novo no GitHub (por exemplo, `controle-de-corridas`).
2. Dentro da pasta `MeuProjeto`, inicialize o Git e envie os arquivos:

```bash
git init
git add .
git commit -m "Refatoração em múltiplos arquivos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/controle-de-corridas.git
git push -u origin main
```

3. Confirme que a estrutura de pastas (`css/`, `js/`, `index.html`, `README.md`) foi enviada corretamente no repositório.

## Como ativar o GitHub Pages

1. No repositório no GitHub, acesse **Settings** (Configurações).
2. No menu lateral, clique em **Pages**.
3. Em **Source** (Fonte), selecione a branch `main` e a pasta `/ (root)`.
4. Clique em **Save** (Salvar).
5. Aguarde alguns instantes. O GitHub vai gerar uma URL pública no formato:

```
https://SEU_USUARIO.github.io/controle-de-corridas/
```

6. Acesse essa URL para confirmar que o aplicativo está funcionando normalmente, com o mesmo comportamento de antes da refatoração.

## Como utilizar o link no Kodular

1. Com o GitHub Pages ativo, copie a URL pública gerada (ex.: `https://SEU_USUARIO.github.io/controle-de-corridas/`).
2. No Kodular, adicione um componente **WebViewer** à tela do seu projeto.
3. Selecione o componente **WebViewer** e, na propriedade **HomeUrl**, cole a URL do GitHub Pages.
4. Nos **Blocks** (blocos), no evento `Screen.Initialize`, adicione o bloco `WebViewer.GoToUrl` apontando para a mesma URL, caso queira garantir o carregamento manual.
5. Habilite a propriedade **UsesLocation** apenas se o app precisar de geolocalização (não é o caso deste projeto).
6. Compile o app (Build) normalmente. O WebViewer vai carregar o `index.html` publicado no GitHub Pages, preservando todo o funcionamento (tema, corridas, ponto, Pix e QR Code), pois os dados continuam sendo salvos no `localStorage` do WebView do dispositivo.

> Observação: como o app usa `localStorage`, os dados salvos (corridas, meta, ponto, chaves Pix, tema) ficam armazenados localmente em cada dispositivo/navegador. Se o usuário limpar os dados do app ou trocar de aparelho, o histórico salvo anteriormente não é migrado automaticamente.
