# Finanças Pessoais Desktop

Uma aplicação moderna de gerenciamento financeiro pessoal construída com React, TypeScript e Supabase. Permite o controle completo de suas finanças com recursos avançados de organização, rastreamento e análise.

## 🚀 Funcionalidades

### 📊 Dashboard Principal
- **Resumo Mensal**: Visualização rápida do saldo total
- **Navegação por Mês**: Fácil navegação entre períodos
- **Filtros Avançados**: Filtragem por contas e categorias
- **Busca Rápida**: Pesquisa instantânea de transações

### 💰 Gerenciamento de Transações
- **Tipos de Transações**: Despesas, Receitas e Transferências
- **Marcar como Consolidadas**: Controle de reconciliação bancária
- **Edição e Exclusão**: Gerencie suas transações facilmente
- **Exportação CSV**: Exporte seus dados para análise externa

### 🏦 Contas Bancárias
- **Múltiplas Contas**: Suporte para várias contas (carteira, corrente, poupança)
- **Saldo Atualizado**: Cálculo automático do saldo
- **Criação e Edição**: Gerencie suas contas com facilidade

### 📋 Categorias Organizadas
- **Hierarquia de Categorias**: Categorias com subcategorias
- **Tipos de Transação**: Controle de tipos (despesa, receita, ambos)
- **Personalização**: Crie suas próprias categorias

### 🔐 Autenticação Segura
- **Login com Supabase**: Acesso seguro aos seus dados
- **Dados Privados**: Cada usuário tem seus próprios dados

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (Banco de Dados + Autenticação)
- **State Management**: React Query
- **Styling**: Tailwind CSS
- **Formulários**: React Hook Form
- **Roteamento**: React Router DOM

## 📦 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta Supabase (opcional para desenvolvimento local)

## ⚙️ Configuração do Projeto

### 1. Clone o repositório
```bash
git clone <seu-repositorio-aqui>
cd financas-desktop
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=seu-supabase-url
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis da UI
├── features/           # Lógica de negócio (API, hooks)
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
└── App.tsx             # Componente principal
```

## 📈 Banco de Dados

A aplicação utiliza o Supabase com as seguintes tabelas:

- **accounts**: Contas bancárias do usuário
- **categories**: Categorias de transações com hierarquia
- **transactions**: Registros de todas as transações

### Seed de Dados
O projeto inclui um script de seed (`supabase/seeds.sql`) com dados de exemplo para testes.

## 🎨 Personalização

### Estilização
A aplicação utiliza Tailwind CSS para estilização. As cores e estilos podem ser ajustados no arquivo `tailwind.config.cjs`.

### Componentes UI
Componentes reutilizáveis estão na pasta `src/components/ui/` e podem ser customizados conforme necessário.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Add nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas, abra uma issue no repositório do projeto.

## 🌟 Features Futuras

- Relatórios financeiros
- Orçamento mensal
- Gráficos de visualização
- Importação de transações
- Notificações
- Suporte para múltiplos usuários