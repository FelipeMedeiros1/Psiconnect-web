# Psiconnect Web

Interface web do Psiconnect, desenvolvida com Angular 16 e Angular Material. A aplicação possui telas de consultas, pacientes, psicólogos e relatórios.

## Pré-requisitos

- [Node.js 18 LTS](https://nodejs.org/)
- npm (instalado junto com o Node.js)
- Backend do Psiconnect rodando em `http://localhost:8080` para usar a listagem e o cadastro de pacientes

> O Angular CLI é uma dependência do projeto. Não é necessário instalá-lo globalmente.

## Como executar

No terminal, dentro da pasta do projeto, instale as dependências:

```bash
npm ci
```

Depois, inicie o servidor de desenvolvimento:

```bash
npm start
```

Acesse [http://localhost:4200](http://localhost:4200). O servidor recarrega a página automaticamente quando o código é alterado.

### Executar pelo VS Code

Também é possível abrir a área **Executar e Depurar** (`Ctrl+Shift+D`) e iniciar a configuração **ng serve**. Ela executa `npm start` e abre a aplicação no Chrome.

## Integração com o backend

Durante o desenvolvimento, as chamadas abaixo são encaminhadas pelo arquivo `proxyconfig.js` para `http://localhost:8080`:

- `/pacientes`
- `/auth`
- `/oauth2`
- `/login`
- `/logout`

Por isso, execute o backend antes do front-end caso precise das funcionalidades que consomem a API. Sem o backend, a interface ainda abre, mas essas requisições falham.

Para usar outro endereço de backend durante o desenvolvimento, altere a propriedade `target` em `proxyconfig.js` e reinicie `npm start`.

Em produção, configure `apiUrl` em `src/environments/environment.prod.ts`, por exemplo:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.exemplo.com',
};
```

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o front-end em modo de desenvolvimento com o proxy da API |
| `npm run build` | Gera o build de produção em `dist/psiconnect` |
| `npm run watch` | Recompila o projeto em modo de desenvolvimento a cada alteração |
| `npm test` | Executa os testes unitários com Karma e Chrome |

## Solução de problemas

### A versão do Node.js é incompatível

Este projeto foi criado com Angular 16. Prefira o Node.js 18 LTS. Confira a versão instalada com:

```bash
node --version
```

Se utiliza NVM for Windows, selecione uma versão 18 instalada:

```bash
nvm use 18
npm ci
```

### A porta 4200 já está em uso

Inicie a aplicação em outra porta:

```bash
npm start -- --port 4300
```

Depois acesse `http://localhost:4300`.

### Erro ao carregar ou salvar pacientes

Confirme se o backend está ativo na porta `8080`. Se ele estiver em outro endereço, ajuste o `target` de `proxyconfig.js` e reinicie o front-end.
