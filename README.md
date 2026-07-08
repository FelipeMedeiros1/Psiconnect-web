# Psiconnect Web

Interface web do Psiconnect, desenvolvida com Angular 16 e Angular Material.

O projeto possui telas e fluxos para consultas, pacientes, psicologos e relatorios, consumindo o backend do Psiconnect por HTTP.

## Sumario

- [Requisitos](#requisitos)
- [Configuracao completa em outra maquina](#configuracao-completa-em-outra-maquina)
- [Backend e proxy](#backend-e-proxy)
- [APIs externas usadas pelo frontend](#apis-externas-usadas-pelo-frontend)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Comandos disponiveis](#comandos-disponiveis)
- [Build de producao](#build-de-producao)
- [Executar pelo VS Code](#executar-pelo-vs-code)
- [Estrutura principal](#estrutura-principal)
- [Solucao de problemas](#solucao-de-problemas)

## Requisitos

Instale antes de rodar o projeto:

- Git
- Node.js 18 LTS
- npm, instalado junto com o Node.js
- Backend do Psiconnect rodando localmente, por padrao em `http://localhost:8080`
- Navegador moderno, preferencialmente Chrome ou Edge
- Acesso a internet para instalar dependencias npm e consultar APIs publicas de endereco/localidade

O Angular CLI ja e dependencia do projeto. Nao precisa instalar `@angular/cli` globalmente.

Confira as versoes:

```bash
node --version
npm --version
git --version
```

Recomendado:

```text
Node.js: 18.x LTS
npm: 9.x ou superior
```

## Configuracao completa em outra maquina

1. Clone o repositorio:

```bash
git clone https://github.com/FelipeMedeiros1/Psiconnect-web.git
cd Psiconnect-web
```

2. Instale as dependencias exatamente a partir do `package-lock.json`:

```bash
npm ci
```

Se estiver preparando o projeto sem `package-lock.json`, use:

```bash
npm install
```

3. Suba o backend do Psiconnect em `http://localhost:8080`.

4. Inicie o frontend:

```bash
npm start
```

5. Acesse a aplicacao:

```text
http://localhost:4200
```

Enquanto `npm start` estiver rodando, o Angular recarrega a pagina automaticamente quando arquivos do projeto forem alterados.

## Backend e proxy

Em desenvolvimento, o frontend usa caminhos relativos para a API. O arquivo `proxyconfig.js` encaminha estas rotas para o backend local:

```text
/pacientes
/psicologos
/auth
/oauth2
/login
/logout
```

Configuracao atual do proxy:

```js
target: "http://localhost:8080"
```

Isso significa que uma chamada do frontend para `/pacientes` sera enviada para:

```text
http://localhost:8080/pacientes
```

Se o backend estiver em outra porta ou host, altere o `target` em `proxyconfig.js`:

```js
target: "http://localhost:8081"
```

Depois reinicie:

```bash
npm start
```

Sem o backend, a interface ainda abre, mas funcionalidades que listam, salvam ou editam pacientes e psicologos podem falhar.

## APIs externas usadas pelo frontend

O frontend tambem consulta servicos publicos diretamente pelo navegador:

- ViaCEP: busca endereco pelo CEP
- IBGE Localidades: lista municipios do Brasil

Essas consultas exigem internet disponivel na maquina e podem falhar se a rede corporativa bloquear os dominios externos.

## Variaveis de ambiente

Os arquivos de ambiente ficam em:

```text
src/environments/environment.ts
src/environments/environment.prod.ts
```

Configuracao padrao de desenvolvimento:

```ts
export const environment = {
  production: false,
  apiUrl: '',
};
```

Com `apiUrl` vazio, os servicos usam rotas relativas, como `/pacientes` e `/psicologos`, permitindo o uso do `proxyconfig.js`.

Para producao, configure `apiUrl` em `src/environments/environment.prod.ts` com o endereco real da API:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.seu-dominio.com',
};
```

Nesse caso, o frontend chamara:

```text
https://api.seu-dominio.com/pacientes
https://api.seu-dominio.com/psicologos
```

Importante: em producao, o backend precisa permitir CORS para o dominio onde o frontend estiver publicado.

## Comandos disponiveis

| Comando | Descricao |
| --- | --- |
| `npm start` | Inicia o servidor Angular em desenvolvimento usando `proxyconfig.js` |
| `npm run build` | Gera build de producao em `dist/psiconnect` |
| `npm run watch` | Recompila em modo desenvolvimento sempre que houver alteracao |
| `npm test` | Executa testes unitarios com Karma e Chrome |
| `npm run ng -- <comando>` | Executa comandos do Angular CLI local do projeto |

Exemplos:

```bash
npm run ng -- version
npm run ng -- generate component pages/exemplo
```

## Build de producao

Para gerar os arquivos finais:

```bash
npm run build
```

A saida fica em:

```text
dist/psiconnect
```

O build usa a configuracao `production` do Angular por padrao.

Atencao: a configuracao atual possui budget de bundle inicial com erro em `1mb`. Se o comando falhar com mensagem parecida com esta:

```text
Error: bundle initial exceeded maximum budget
```

o codigo compilou, mas o tamanho do bundle passou do limite configurado em `angular.json`. Para resolver, reduza dependencias/tamanho do bundle ou ajuste conscientemente os budgets em:

```text
angular.json -> projects.psiconnect.architect.build.configurations.production.budgets
```

## Executar pelo VS Code

1. Abra a pasta `Psiconnect-web` no VS Code.
2. Instale as dependencias com `npm ci`.
3. Abra a aba "Run and Debug" ou use `Ctrl+Shift+D`.
4. Execute a configuracao `ng serve`, se ela existir no workspace.
5. Acesse `http://localhost:4200`.

Tambem e possivel usar diretamente o terminal integrado:

```bash
npm start
```

## Estrutura principal

```text
src/app/pages/patient              Lista e detalhes de pacientes
src/app/pages/patient-form         Cadastro e edicao de pacientes
src/app/pages/psychologist         Lista e detalhes de psicologos
src/app/pages/psychologist-form    Cadastro de psicologos
src/app/services                   Servicos HTTP da aplicacao
src/app/model                      Interfaces e tipos de dados
src/environments                   Configuracoes por ambiente
proxyconfig.js                     Proxy local para o backend
```

## Solucao de problemas

### Node.js incompativel

Angular 16 funciona melhor com Node.js 18 LTS. Confira:

```bash
node --version
```

Se usa NVM for Windows:

```bash
nvm install 18
nvm use 18
npm ci
```

### Porta 4200 em uso

Rode em outra porta:

```bash
npm start -- --port 4300
```

Acesse:

```text
http://localhost:4300
```

### Erro ao carregar ou salvar pacientes/psicologos

Confira se o backend esta rodando:

```text
http://localhost:8080
```

Se o backend estiver em outra porta, atualize `proxyconfig.js` e reinicie o frontend.

### CEP ou municipios nao carregam

Verifique se a maquina tem acesso a internet e se a rede permite chamadas para:

```text
https://viacep.com.br
https://servicodados.ibge.gov.br
```

### `npm ci` falha

Tente limpar a instalacao local e instalar novamente:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```

No PowerShell, se aparecer erro de politica de execucao ao rodar scripts, abra o terminal como usuario normal e execute:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Build falha por budget

Se `npm run build` falhar por tamanho de bundle, confira a secao [Build de producao](#build-de-producao). Esse erro vem da regra de tamanho em `angular.json`, nao necessariamente de erro de TypeScript.

## Checklist rapido para outra maquina

```bash
git clone https://github.com/FelipeMedeiros1/Psiconnect-web.git
cd Psiconnect-web
npm ci
npm start
```

Com o backend rodando em `http://localhost:8080`, abra:

```text
http://localhost:4200
```
