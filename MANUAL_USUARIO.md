# Manual do Usuário - Sistema de Controle Financeiro

Bem-vindo ao Sistema de Controle Financeiro! Este manual foi criado para ajudá-lo a gerenciar suas finanças de forma simples e eficiente, mesmo sem conhecimentos técnicos.

---

## Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Primeiros Passos](#primeiros-passos)
3. [Gerenciando Contas](#gerenciando-contas)
4. [Gerenciando Categorias](#gerenciando-categorias)
5. [Tipos de Transações](#tipos-de-transações)
6. [Adicionando Transações](#adicionando-transações)
7. [Recorrências e Parcelamentos](#recorrências-e-parcelamentos)
8. [Navegando pelo Sistema](#navegando-pelo-sistema)
9. [Filtros e Buscas](#filtros-e-buscas)
10. [Consolidação de Transações](#consolidação-de-transações)
11. [Edição em Massa](#edição-em-massa)
12. [Exportando Dados](#exportando-dados)
13. [Dicas para Melhor Gestão Financeira](#dicas-para-melhor-gestão-financeira)

---

## Visão Geral do Sistema

Este sistema foi desenvolvido para ajudar você a controlar suas finanças pessoais de forma organizada. Com ele, você pode:

- Cadastrar suas contas bancárias e carteiras
- Organizar suas despesas e receitas por categorias
- Registrar transações únicas, parceladas ou recorrentes
- Acompanhar o saldo de cada conta
- Filtrar e buscar transações facilmente
- Exportar seus dados para análise

---

## Primeiros Passos

Para começar a usar o sistema, siga estes passos:

1. **Cadastre suas Contas** - Registre todas as contas que você possui (conta corrente, poupança, carteira, etc.)
2. **Crie suas Categorias** - Defina categorias para organizar suas despesas e receitas
3. **Registre suas Transações** - Comece a lançar seus gastos e ganhos

---

## Gerenciando Contas

As contas representam os locais onde você guarda seu dinheiro. Exemplos: conta corrente do banco X, poupança, carteira, etc.

### Como acessar a tela de contas

No menu lateral, clique em **"Contas"** ou no botão **"Nova conta"** na barra lateral do painel principal.

### Criando uma conta

1. Clique no botão **"Nova conta"**
2. Preencha os campos:
   - **Nome**: Ex: "Conta Corrente Itaú", "Poupança", "Carteira"
   - **Saldo inicial**: O valor que você já possui nesta conta (ex: 1.000,00)
   - **Incluir no resumo do mês**: Marque esta opção se deseja que o saldo desta conta seja somado no resumo mensal exibido no painel principal

### Editando uma conta

1. Na lista de contas, clique no botão **"Editar"** ao lado da conta desejada
2. Modifique os campos necessários
3. Clique em **"Salvar"**

### Removendo uma conta

1. Na lista de contas, clique no botão **"Remover"** ao lado da conta desejada
2. Confirme a exclusão

**⚠️ Atenção**: Ao remover uma conta, todas as transações associadas a ela também serão afetadas.

### Visualizando saldos

No painel principal, você verá uma lista de contas na barra lateral com seus respectivos saldos atualizados, calculados automaticamente com base nas transações registradas.

---

## Gerenciando Categorias

As categorias ajudam a organizar suas transações por tipo de gasto ou fonte de renda.

### Como acessar a tela de categorias

No menu lateral, clique em **"Categorias"** ou no botão **"Nova categoria"** na barra lateral do painel principal.

### Criando uma categoria

1. Clique no botão **"Nova categoria"**
2. Preencha os campos:
   - **Nome**: Ex: "Alimentação", "Transporte", "Salário"
   - **Categoria pai**: Se desejar, selecione uma categoria principal para criar uma subcategoria (ex: "Alimentação" pode ter "Mercado" como subcategoria)
   - **Tipo permitido**: Escolha entre:
     - **Despesa**: Para categorias de gastos
     - **Receita**: Para categorias de ganhos
     - **Ambos**: Para categorias que podem ser usadas tanto para despesas quanto para receitas

### Criando subcategorias

Subcategorias ajudam a organizar ainda mais seus gastos. Por exemplo:

- **Alimentação** (categoria principal)
  - Mercado
  - Restaurante
  - Lanches

Para criar uma subcategoria, basta selecionar a categoria principal no campo **"Categoria pai"**.

### Editando uma categoria

1. Na lista de categorias, clique no botão **"Editar"** ao lado da categoria desejada
2. Modifique os campos necessários
3. Clique em **"Salvar"**

### Removendo uma categoria

1. Na lista de categorias, clique no botão **"Remover"** ao lado da categoria desejada
2. Se houver transações nesta categoria, você poderá optar por movê-las para outra categoria
3. Confirme a exclusão

**⚠️ Atenção**: Não é possível remover uma categoria que possui subcategorias. Remova as subcategorias primeiro.

### Sugestões de categorias

#### Categorias de Despesa
- Moradia (Aluguel, Condomínio, Luz, Água, Internet)
- Alimentação (Mercado, Restaurante, Lanches)
- Transporte (Combustível, Uber/99, Ônibus/Metrô)
- Saúde (Remédios, Plano de saúde, Consultas)
- Educação (Cursos, Livros, Material escolar)
- Lazer (Cinema, Viagens, Hobbies)
- Vestuário (Roupas, Sapatos, Acessórios)
- Outros (Presentes, Doações, Impostos)

#### Categorias de Receita
- Salário
- Freelance
- Investimentos
- Vendas
- Presentes
- Outros

---

## Tipos de Transações

O sistema suporta três tipos de transações:

### 1. Despesa (Expense)

Representa dinheiro que sai da sua conta. Exemplos:

- Compras no supermercado
- Pagamento de contas
- Combustível
- Alimentação fora de casa

### 2. Receita (Income)

Representa dinheiro que entra na sua conta. Exemplos:

- Salário
- Vendas de produtos
- Rendimentos de investimentos
- Presentes recebidos

### 3. Transferência (Transfer)

Representa movimentação de dinheiro entre suas próprias contas, sem afetar seu patrimônio total. Exemplos:

- Transferir da conta corrente para poupança
- Pagar cartão de crédito a partir da conta corrente
- Sacar dinheiro da conta para carteira

---

## Adicionando Transações

### Como adicionar uma transação

1. No painel principal, clique no botão **"Adicionar transação"**
2. Preencha os campos conforme o tipo de transação:

#### Campos comuns (para todos os tipos)

| Campo | Descrição |
|-------|-----------|
| **Data** | A data em que a transação ocorreu ou vai ocorrer |
| **Descrição** | Um breve texto para identificar a transação (ex: "Compra no Mercado Extra") |
| **Tipo** | Escolha entre Despesa, Receita ou Transferência |
| **Valor (R$)** | O valor da transação (use vírgula para decimais, ex: 150,50) |
| **Nota** | (Opcional) Detalhes adicionais sobre a transação |
| **Consolidado** | Marque se a transação já foi confirmada/paga |
| **Lembrete por e-mail** | (Opcional) Configure um lembrete por e-mail |

#### Campos específicos para Despesa/Receita

| Campo | Descrição |
|-------|-----------|
| **Categoria** | Selecione a categoria que melhor descreve a transação |
| **Conta** | Selecione a conta de onde o dinheiro saiu (despesa) ou entrou (receita) |

#### Campos específicos para Transferência

| Campo | Descrição |
|-------|-----------|
| **Conta de origem** | A conta de onde o dinheiro sairá |
| **Conta de destino** | A conta para onde o dinheiro irá |

### Criando uma nova categoria durante o cadastro

Ao adicionar uma transação, você pode criar uma nova categoria rapidamente:

1. No campo **"Categoria"**, selecione a opção **"Nova categoria..."**
2. Preencha os dados da nova categoria:
   - **Nova categoria**: O nome da categoria
   - **Categoria pai**: (Opcional) Se for uma subcategoria
   - **Tipo**: Despesa, Receita ou Ambos
3. A categoria será criada automaticamente e associada à transação

---

## Recorrências e Parcelamentos

O sistema oferece recursos avançados para lidar com transações que se repetem ou são parceladas.

### 1. Parcelamento (Installments)

Use quando uma compra foi dividida em várias parcelas. Por exemplo: uma TV de R$ 3.000 em 10 parcelas de R$ 300.

#### Como criar uma transação parcelada

1. Ao adicionar uma transação, na seção **"Repetir transação"**, clique em **"Parcelamento"**
2. Preencha os campos:
   - **Iniciar na parcela**: Geralmente 1 (primeira parcela)
   - **Total de parcelas**: O número total de parcelas (ex: 10)
3. O sistema criará automaticamente todas as parcelas, uma para cada mês

**Exemplo prático**: Você comprou um celular em 12x de R$ 200. Configure:
- Iniciar na parcela: 1
- Total de parcelas: 12

O sistema criará 12 transações, uma para cada mês, com valor de R$ 200 cada.

#### Editando parcelamentos

Ao editar uma transação parcelada, você pode:
- Alterar o total de parcelas
- O sistema ajustará automaticamente as parcelas restantes

### 2. Recorrência Avançada (Advanced)

Use para transações que se repetem com frequência regular. Por exemplo: aluguel mensal, conta de luz, salário.

#### Como criar uma transação recorrente

1. Ao adicionar uma transação, na seção **"Repetir transação"**, clique em **"Avançado"**
2. Preencha os campos:
   - **Repetir a cada**: O intervalo de repetição
     - Digite um número (ex: 1)
     - Selecione a unidade: Mês, Semana ou Dia
   - **Nr. de ocorrências**: Quantas vezes a transação deve se repetir
   - **Repetir indefinidamente**: Marque esta opção para criar 12 ocorrências iniciais, que você pode gerenciar depois

#### Exemplos de recorrências

| Transação | Repetir a cada | Ocorrências | Quando usar |
|-----------|----------------|--------------|-------------|
| Aluguel | 1 Mês | 12 | Pagamento mensal por 1 ano |
| Salário | 1 Mês | 12 | Recebimento mensal por 1 ano |
| Conta de luz | 1 Mês | 12 | Conta que chega todo mês |
| Academia | 1 Mês | 12 | Mensalidade |
| Diária de estacionamento | 1 Dia | 20 | 20 dias úteis |
| Semanal | 1 Semana | 4 | 4 semanas |

#### Recorrência indefinida

Quando você marca **"Repetir indefinidamente"**, o sistema cria 12 ocorrências iniciais. Depois, você pode gerenciar as ocorrências futuras conforme necessário. Isso é útil para contas fixas como aluguel, que você sabe que continuará pagando indefinidamente.

### 3. Editando transações com recorrência

Ao editar uma transação que possui recorrência ou parcelamento, o sistema perguntará qual ação deseja executar:

| Opção | Descrição |
|-------|-----------|
| **Alterar apenas esta** | Modifica apenas a transação selecionada, sem afetar as outras |
| **Alterar a partir desta** | Modifica esta transação e todas as futuras |
| **Alterar a partir da primeira** | Modifica todas as transações do grupo, desde a primeira até a última |

---

## Navegando pelo Sistema

### Painel Principal (Dashboard)

O painel principal é onde você visualiza e gerencia suas transações. Ele é dividido em:

#### Barra Lateral Esquerda

- **Resumo do mês**: Mostra o saldo total das contas incluídas no resumo mensal
- **Contas**: Lista de todas as suas contas com saldos atualizados. Você pode filtrar transações por conta
- **Busca rápida**: Campo para buscar transações por texto
- **Categorias**: Árvore de categorias para filtrar transações

#### Área Principal

- **Navegador de mês**: Botões para navegar entre os meses (◀ Mês Atual ▶)
- **Filtros**: Seletor para mostrar todas as transações ou apenas as não consolidadas
- **Botões de ação**: Adicionar transação, Consolidar, Tirar consolidação, Excluir, Exportar
- **Tabela de transações**: Lista detalhada de todas as transações do mês selecionado

### Navegação por Mês

Use o navegador de mês para visualizar transações de diferentes períodos:

- Clique em **◀** para ir ao mês anterior
- Clique em **▶** para ir ao próximo mês
- O nome do mês atual é exibido no centro (ex: "dezembro 2024")

---

## Filtros e Buscas

O sistema oferece várias formas de filtrar suas transações:

### Filtrar por Conta

1. Na barra lateral, na seção **"Contas"**
2. Marque as caixas das contas que deseja visualizar
3. A tabela de transações mostrará apenas as transações das contas selecionadas
4. Clique em **"Limpar"** para remover o filtro

### Filtrar por Categoria

1. Na barra lateral, na seção **"Categorias"**
2. Marque as caixas das categorias que deseja visualizar
3. Ao selecionar uma categoria principal, todas as suas subcategorias também serão incluídas
4. Clique em **"Limpar"** para remover o filtro

### Busca Rápida

1. Na barra lateral, na seção **"Busca rápida"**
2. Digite o texto que deseja buscar (ex: "Mercado", "Shell", "Salário")
3. Clique no botão **"Buscar"**
4. A tabela mostrará todas as transações que contêm o texto buscado

**Dica**: A busca procura na descrição da transação.

### Filtrar Transações Não Consolidadas

1. No seletor acima da tabela de transações
2. Escolha **"Transações não consolidadas"** para ver apenas transações que ainda não foram confirmadas/pagas
3. Escolha **"Todas transações"** para ver todas as transações

---

## Consolidação de Transações

O campo **"Consolidado"** indica se uma transação já foi confirmada ou paga.

### O que significa "Consolidado"?

- **Consolidado (✓)**: A transação já foi confirmada/paga. O valor já saiu/entrou na conta
- **Não consolidado (✗)**: A transação ainda está pendente. Pode ser uma conta a pagar, um cheque que ainda compensou, etc.

### Quando marcar como consolidado?

Marque uma transação como consolidada quando:
- A conta foi paga
- O dinheiro entrou na conta
- O cheque foi compensado
- A transação foi confirmada pelo banco

### Como marcar/desmarcar consolidação

#### Transação individual

1. Na tabela de transações, clique na caixa de seleção na coluna **"Consolidado"**
2. A transação será marcada/desmarcada imediatamente

#### Múltiplas transações

1. Selecione as transações desejadas marcando as caixas na primeira coluna
2. Clique no botão **"Consolidar"** para marcar todas como consolidadas
3. Clique no botão **"Tirar consolidação"** para desmarcar todas

---

## Edição em Massa

Você pode executar ações em múltiplas transações de uma só vez.

### Selecionando transações

1. Na tabela de transações, marque as caixas na primeira coluna das transações desejadas
2. Para selecionar todas, marque a caixa no cabeçalho da tabela

### Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Consolidar** | Marca todas as transações selecionadas como consolidadas |
| **Tirar consolidação** | Desmarca todas as transações selecionadas como consolidadas |
| **Excluir** | Remove todas as transações selecionadas (requer confirmação) |

### Editando uma transação individual

Para editar os detalhes de uma transação:

1. Clique em qualquer lugar na linha da transação (exceto nas caixas de seleção)
2. O modal de edição será aberto
3. Faça as alterações desejadas
4. Clique em **"Salvar alterações"**

---

## Exportando Dados

Você pode exportar suas transações para um arquivo CSV para análise em planilhas (Excel, Google Sheets, etc.).

### Como exportar

1. No painel principal, clique no botão **"Exportar"**
2. O arquivo CSV será baixado automaticamente com o nome `transacoes-AAAA-MM.csv` (ex: `transacoes-2024-12.csv`)
3. O arquivo contém todas as transações do mês atualmente selecionado

### Formato do arquivo CSV

O arquivo exportado contém as seguintes colunas:

| Coluna | Descrição |
|--------|-----------|
| date | Data da transação |
| description | Descrição |
| category | Categoria |
| account | Conta |
| amount | Valor |
| type | Tipo (expense, income ou transfer) |
| cleared | Se está consolidado (true/false) |
| note | Nota (se houver) |

### Usando o arquivo exportado

1. Abra o arquivo CSV no Excel, Google Sheets ou outro programa de planilhas
2. Você pode criar gráficos, relatórios personalizados e análises detalhadas
3. O arquivo usa vírgula como separador e aspas para campos de texto

---

## Dicas para Melhor Gestão Financeira

### 1. Mantenha suas contas atualizadas

- Sempre cadastre todas as suas contas (bancárias, carteiras, investimentos)
- Defina o saldo inicial correto para cada conta
- Atualize as transações regularmente

### 2. Use categorias consistentes

- Crie categorias que façam sentido para você
- Use subcategorias para organizar melhor
- Mantenha consistência ao categorizar transações

### 3. Acompanhe regularmente

- Verifique suas transações diariamente ou semanalmente
- Use o filtro de "transações não consolidadas" para acompanhar contas pendentes
- Navegue entre os meses para comparar seus gastos ao longo do tempo

### 4. Use parcelamentos e recorrências

- Cadastre contas fixas como recorrências (aluguel, internet, etc.)
- Use parcelamentos para compras divididas
- Isso ajuda a prever gastos futuros

### 5. Consolide suas transações

- Marque as transações como consolidadas quando forem confirmadas
- Isso ajuda a identificar o que ainda está pendente
- Use a consolidação em massa para economizar tempo

### 6. Faça backups exportando dados

- Exporte seus dados regularmente para CSV
- Mantenha cópias dos arquivos exportados
- Isso garante que você não perca seus registros

### 7. Analise seus gastos

- Use os filtros para analisar gastos por categoria
- Compare gastos entre meses diferentes
- Identifique onde pode economizar

### 8. Planeje com antecedência

- Cadastre contas futuras como transações com data futura
- Use recorrências para contas fixas
- Isso ajuda a visualizar compromissos futuros

### 9. Revise periodicamente

- Revise suas categorias e contas periodicamente
- Arquive contas que não usa mais (se disponível)
- Ajuste sua organização conforme necessário

### 10. Use o resumo mensal

- Acompanhe o resumo do mês exibido no painel principal
- Configure quais contas devem ser incluídas no resumo
- Isso dá uma visão rápida da sua situação financeira

---

## Glossário

| Termo | Significado |
|-------|-------------|
| **Conta** | Local onde você guarda dinheiro (banco, carteira, etc.) |
| **Categoria** | Classificação para organizar transações (ex: Alimentação, Transporte) |
| **Subcategoria** | Categoria dentro de outra categoria (ex: Mercado dentro de Alimentação) |
| **Despesa** | Dinheiro que sai da sua conta |
| **Receita** | Dinheiro que entra na sua conta |
| **Transferência** | Movimentação entre suas próprias contas |
| **Parcelamento** | Transação dividida em várias partes mensais |
| **Recorrência** | Transação que se repite regularmente |
| **Consolidado** | Transação confirmada/paga |
| **Resumo do mês** | Soma dos saldos das contas selecionadas |

---

## Perguntas Frequentes (FAQ)

### Posso alterar uma transação parcelada depois de criá-la?

Sim. Ao editar uma transação parcelada, você pode escolher alterar apenas a parcela atual, a partir da parcela atual, ou todas as parcelas.

### O que acontece se eu excluir uma conta?

Todas as transações associadas a essa conta serão afetadas. É recomendável mover as transações para outra conta antes de excluir.

### Posso criar uma categoria durante o cadastro de uma transação?

Sim! No campo "Categoria", selecione "Nova categoria..." e preencha os dados. A categoria será criada automaticamente.

### Como faço para ver apenas as contas que ainda não paguei?

Use o filtro "Transações não consolidadas" no seletor acima da tabela de transações.

### Posso exportar todos os meses de uma vez?

Não, o sistema exporta apenas o mês atualmente selecionado. Para exportar todos, navegue mês a mês e exporte cada um.

### O que significa "Incluir no resumo do mês" em uma conta?

Quando marcado, o saldo dessa conta é somado no resumo mensal exibido no painel principal. Útil para contas que fazem parte do seu patrimônio principal.

### Posso ter categorias que servem tanto para despesas quanto para receitas?

Sim, ao criar uma categoria, selecione a opção "Ambos" no campo "Tipo permitido".

---

## Suporte

Se você tiver dúvidas ou encontrar problemas ao usar o sistema, entre em contato com o suporte técnico.

---

**Versão do Manual**: 1.0  
**Última atualização**: Dezembro de 2025
