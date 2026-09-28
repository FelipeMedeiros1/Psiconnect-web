# Plano de testes E2E — PsiConnect Web

## Objetivo

Validar a jornada completa de operação: preparar cadastros, agendar uma consulta, concluí-la com evolução, consultar o histórico e administrar o ciclo de vida do paciente. Os testes devem ser automatizados preferencialmente com Playwright e executados contra uma API de teste com dados isolados.

## Dados e condições de execução

- Aplicação web disponível e API de teste acessível.
- Executar cada cenário com dados exclusivos (por exemplo, sufixo de data/hora no nome, CPF, CRP e e-mail) e removê-los pela API ao final, quando possível.
- Criar previamente um local, um psicólogo ativo e um paciente ativo para os cenários de agendamento; ou executar os casos de cadastro abaixo na mesma ordem.
- Usar data futura e horário entre 07:00 e 22:00 para o agendamento válido.
- Registrar evidências de falha: screenshot, URL, console e resposta de rede relevante.

## Massa sugerida

| Entidade | Exemplo |
| --- | --- |
| Local | Clínica E2E — Centro; CEP válido; endereço preenchido |
| Psicólogo | Psicóloga E2E; CRP válido; especialidade cadastrada; telefone e e-mail válidos |
| Paciente adulto | Paciente E2E; nascimento há mais de 18 anos; CPF, contato e endereço válidos |
| Paciente menor | Menor E2E; nascimento há menos de 18 anos; nome e CPF do responsável válidos |
| Consulta | Data futura, 10:00, valor R$ 150,00 |

## Casos de teste

| ID | Jornada / cenário | Passos principais | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | Acesso inicial e navegação | Abrir `/`; navegar por Agendamentos, Pacientes, Psicólogos, Locais e Histórico. | `/` redireciona para `/appointment`; cada tela carrega sem erro e apresenta seu conteúdo principal. |
| E2E-02 | Cadastrar local de atendimento | Em Locais, clicar em adicionar; preencher nome, CEP válido e endereço; salvar. | Mensagem/retorno de sucesso e local visível na lista como **Ativo**. |
| E2E-03 | Validar local obrigatório e CEP inválido | Tentar salvar sem nome; informar CEP em formato inválido e CEP inexistente. | Cadastro não é concluído; validações apropriadas são exibidas, sem criar registro parcial. |
| E2E-04 | Editar e inativar local | Editar o local criado; salvar alteração; inativá-lo. | Alteração persiste na lista; local passa a inativo e não deve ser oferecido para novos vínculos ativos. |
| E2E-05 | Cadastrar psicólogo | Em Psicólogos, adicionar; preencher nome, CRP, especialidade, telefone, e-mail e endereço; salvar. | Psicólogo aparece na lista como ativo, com nome e CRP corretos. |
| E2E-06 | Validar psicólogo | Tentar salvar com nome/CRP/especialidade ausentes, CRP fora de 4–7 dígitos, telefone ou e-mail inválido. | Formulário bloqueia o envio inválido e mostra as mensagens de validação. |
| E2E-07 | Consultar, editar, inativar e reativar psicólogo | Abrir detalhes; editar um campo; inativar; trocar filtro para inativos; reativar. | Detalhes e edição refletem os dados salvos; edição fica indisponível enquanto inativo; reativação devolve o registro aos ativos. |
| E2E-08 | Cadastrar paciente adulto | Em Pacientes, adicionar; informar data de nascimento adulta, identificação, contato, CEP/endereço e local; salvar. | Paciente recebe/mostra nº de prontuário, aparece ativo e é elegível para agendamento. |
| E2E-09 | Cadastrar paciente menor | Informar nascimento de menor de 18 anos e preencher responsável (nome e CPF); concluir cadastro. | Campos de responsável surgem para menor e o cadastro é persistido com esses dados. |
| E2E-10 | Validar paciente e consulta de CEP | Testar campos obrigatórios, e-mail/CPF inválidos e CEP inexistente; acionar busca com CEP válido. | Erros impedem salvamento inválido; CEP válido preenche ou permite completar endereço; CEP inexistente mostra erro. |
| E2E-11 | Visualizar e editar paciente ativo | Abrir detalhes; editar dado de contato; salvar; conferir na lista/detalhes. | Dados exibidos são coerentes e alteração persiste após recarregar a página. |
| E2E-12 | Filtrar pacientes por situação | Alternar filtros Ativos, Inativos e Todos. | Cada filtro mostra somente os registros correspondentes, sem duplicação. |
| E2E-13 | Dar alta e reativar paciente | Dar alta de paciente ativo, informar motivo; consultar inativos; tentar editar/agendar; reativar. | Alta exige motivo e torna o paciente inativo; edição e repetição/agendamento ficam indisponíveis; reativação restaura a elegibilidade. |
| E2E-14 | Criar consulta com psicólogo escolhido | Em Agendamentos, criar consulta para paciente e psicólogo ativos; selecionar data futura, horário permitido e valor positivo; confirmar. | Consulta aparece com paciente, psicólogo, nº de prontuário, data/hora e status pendente. |
| E2E-15 | Seleção automática por especialidade | Criar consulta sem selecionar psicólogo; selecionar especialidade, data, horário e valor; confirmar. | Sistema cria a consulta com profissional disponível e compatível; se não houver disponibilidade, informa o impedimento sem gravar. |
| E2E-16 | Validar regras de agendamento | Testar data passada, hora passada no dia atual, horário fora de 07:00–22:00, paciente ausente e valor zero/negativo. | Envio não ocorre; cada regra apresenta erro claro e nenhum agendamento é criado. |
| E2E-17 | Editar e excluir consulta pendente | Editar data/horário/valor de uma consulta pendente; salvar; excluir outra consulta e confirmar no diálogo nativo. | Alteração é refletida na lista; consulta excluída deixa de aparecer. |
| E2E-18 | Concluir atendimento com evolução | Na consulta pendente, selecionar concluir; tentar salvar sem evolução; informar evolução válida de até 500 caracteres e salvar. | Evolução vazia é bloqueada; atendimento passa a concluído e exibe ações de concluído/editar evolução. |
| E2E-19 | Editar evolução | Abrir edição da evolução concluída, mudar o texto e salvar. | Texto atualizado persiste e é recuperado ao abrir novamente ou no histórico. |
| E2E-20 | Limites e cancelamento da evolução | Inserir texto com mais de 500 caracteres; cancelar o diálogo; tentar concluir sem salvar. | Limite é validado; cancelar não muda status nem conteúdo da evolução. |
| E2E-21 | Histórico e prontuário | Abrir Histórico após concluir consulta; localizar paciente; abrir visualização de evolução. | Registro mostra data/hora, paciente, psicólogo e prontuário; modal exibe evolução salva. |
| E2E-22 | Filtros, resumo e paginação do histórico | Filtrar por psicólogo, paciente e período; limpar filtros; criar/usar mais de 10 registros para paginar. | Lista, quantidade de atendimentos e valor total respeitam filtros; paginação retorna os registros corretos. |
| E2E-23 | Repetir atendimento | No histórico de paciente ativo, clicar em Repetir atendimento. | Formulário de agendamento abre com paciente, psicólogo e valor pré-preenchidos; novo agendamento pode ser concluído normalmente. |
| E2E-24 | Relatório impresso | Aplicar filtros no Histórico e clicar em Histórico de consultas; interceptar `window.print`. | A impressão é solicitada e a prévia contém filtros, linhas de consulta, quantidade e valor total consistentes. |
| E2E-25 | Busca global e resiliência visual | Pesquisar nome, psicólogo, prontuário e status onde aplicável; testar viewport mobile e desktop. | Busca reduz os resultados corretamente; nenhuma ação essencial fica inacessível, truncada ou sobreposta. |

## Fluxo crítico de regressão

Executar em toda entrega:

1. Criar local ativo, psicólogo ativo e paciente adulto ativo.
2. Agendar consulta futura para o paciente.
3. Confirmar atendimento e salvar evolução válida.
4. Verificar o registro, evolução, resumo e valor no Histórico.
5. Repetir o atendimento a partir do Histórico e confirmar que os dados são pré-preenchidos.
6. Dar alta ao paciente e confirmar que ele não pode ser usado em novo agendamento.
7. Reativar o paciente e confirmar que volta a ficar elegível.

## Critérios de aprovação

- Todos os cenários críticos (E2E-01, 02, 05, 08, 14, 16, 18, 21, 23 e 24) aprovados.
- Nenhum erro de console não tratado, falha de rede silenciosa ou regressão visual bloqueadora.
- Nenhum registro inválido ou duplicado criado após cenários negativos/cancelados.
- Dados exibidos em listas, detalhes, histórico e relatório permanecem consistentes após recarregar a página.

## Registro de execução manual — caminho feliz

**Data:** 28/09/2026  
**Ambiente:** `http://localhost:4200/` (desenvolvimento local)  
**Método:** execução manual assistida por navegador; nenhuma automação criada.

| Etapa | Resultado | Evidência observada |
| --- | --- | --- |
| Acesso e cadastros de apoio | Aprovado | Aplicação abriu em `/appointment`; existiam locais, psicólogos e pacientes ativos disponíveis. |
| Criar agendamento | Aprovado com ressalva | Consulta criada para **Thomas Gordon** (PR005), com **Burrhus Frederic Skinner**, em **29/09/2026 às 10:00**, valor **R$ 150,00**. A consulta apareceu na Agenda como pendente. |
| Concluir atendimento | Aprovado | Evolução preenchida e salva; a Agenda atualizou a consulta para concluída. |
| Consultar histórico | Aprovado | Histórico exibiu o registro de 29/09/2026 10:00, paciente, psicólogo e PR005. A visualização de evolução mostrou o texto salvo. |
| Console do navegador | Aprovado | 0 erros e 0 avisos durante a execução; somente mensagens informativas de desenvolvimento. |


### Reexecução — 28/09/2026

Jornada refeita manualmente, sem automação: agendamento criado para **Bärbel Inhelder** (PR004) com **Carl Gustav Jung**, em **30/09/2026 às 11:00**, no valor de **R$ 180,00**; atendimento concluído com evolução e registro confirmado no Histórico. O total exibido passou a **3 atendimentos realizados**. Resultado: **aprovado**, mantendo a ressalva da Agenda vazia.
