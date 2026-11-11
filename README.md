# Meu Assistente

Aplicação de chat com inteligência artificial desenvolvida com Next.js e TypeScript, com suporte a diferentes provedores de modelos de linguagem (LLMs), como Ollama e Groq.

**[Acessar demonstração](https://meu-assistente-tau.vercel.app/)**

## Sobre o projeto

O Meu Assistente é um projeto desenvolvido para explorar a integração de modelos de inteligência artificial em aplicações web, utilizando uma arquitetura que permite alternar entre provedores locais e serviços em nuvem.

A aplicação oferece uma interface de conversação, respostas em streaming e diferentes personalidades de IA.

## Funcionalidades

- Chat interativo com inteligência artificial.
- Respostas em tempo real utilizando streaming.
- Suporte aos provedores Ollama e Groq.
- Personalidades de IA personalizáveis.
- Histórico de conversas armazenado no navegador.
- Configuração do provedor por variáveis de ambiente.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Ollama
- Groq API

## Arquitetura

A aplicação utiliza uma rota de API para processar as mensagens e encaminhá-las ao provedor de inteligência artificial configurado.

```text
Interface (Next.js)
       |
       v
API de Chat (Streaming)
       |
       v
Gerenciador de LLM
       |
       +------ Ollama
       |
       +------ Groq
```

## Como executar o projeto

### Pré-requisitos

- Node.js
- npm
- Ollama (opcional, caso utilize modelos locais)

### 1. Clone o repositório

```bash
git clone https://github.com/pedrofigueiredojsx/meu-assistente.git
```

### 2. Acesse o diretório

```bash
cd meu-assistente
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Para utilizar a Groq, crie um arquivo `.env.local` na raiz do projeto:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=sua-chave-de-api
GROQ_MODEL=openai/gpt-oss-120b
```

Para utilizar o Ollama, configure e execute o serviço localmente.

### 5. Inicie a aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

## Scripts disponíveis

| Comando         | Descrição                            |
| --------------- | ------------------------------------ |
| `npm run dev`   | Inicia o ambiente de desenvolvimento |
| `npm run build` | Gera a versão de produção            |
| `npm run start` | Inicia a aplicação em produção       |
| `npm run lint`  | Executa a análise de código          |

## Melhorias futuras

- Implementação de autenticação de usuários.
- Persistência de conversas em banco de dados.
- Gerenciamento de múltiplas conversas.
- Integração com RAG.
- Aprimoramento do tratamento de erros.

## Autor

**Pedro Henrique Figueiredo**

- GitHub: [pedrofigueiredojsx](https://github.com/pedrofigueiredojsx)
- LinkedIn: [Perfil profissional](https://www.linkedin.com/)

---

Desenvolvido como projeto de estudo e prática em desenvolvimento Full Stack e integração com inteligência artificial.
