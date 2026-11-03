# Meu Assistente

Chat de IA feito com **Next.js + TypeScript**, com respostas em streaming, personalidades (system prompts) e motor de IA trocável: **Ollama** (local) ou **Groq** (API com plano gratuito).

> 🔗 Demo: _adicione aqui o link da Vercel depois do deploy_

<!-- Dica: coloque um print da tela em /public/screenshot.png e descomente a linha abaixo -->
<!-- ![Screenshot](public/screenshot.png) -->

## Funcionalidades

- Chat com resposta em **streaming** (o texto aparece aos poucos, como no ChatGPT)
- **Personalidades** selecionáveis: assistente geral e especialista em WoW PvP
- **Histórico salvo** no navegador (`localStorage`), que sobrevive ao recarregar a página
- **Motor trocável** por variável de ambiente, sem mexer no resto do código
- System prompt controlado no servidor (o navegador só envia o id da persona)

## Stack

- [Next.js](https://nextjs.org/) (App Router) e React
- TypeScript
- [Ollama](https://ollama.com/) para rodar modelos localmente
- [Groq](https://groq.com/) como API de nuvem

## Como funciona

```
Tela (React)  ->  /api/chat/stream  ->  generateStream()  ->  Ollama ou Groq
```

A função `generateStream()` em `lib/llm.ts` é a única que conhece o provedor de IA. A rota e a tela só recebem um stream de texto. Trocar de motor é mudar uma variável de ambiente.

## Estrutura

```
app/
  page.tsx                  # interface do chat
  api/chat/stream/route.ts  # rota de streaming
lib/
  llm.ts                    # comunicação com Ollama / Groq
  personas.ts               # system prompts de cada persona
```

## Como rodar

### 1. Instalar

```bash
git clone <url-do-repositorio>
cd meu-assistente
npm install
```

### 2. Escolher o motor

**Opção A: Ollama (local, sem conta)**

```bash
ollama pull llama3.2
```

Não precisa criar `.env.local`. Sem `LLM_PROVIDER`, o app usa o Ollama.

**Opção B: Groq (nuvem, plano gratuito)**

Crie uma chave em [console.groq.com](https://console.groq.com) e copie o `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha os valores:

```
LLM_PROVIDER=groq
GROQ_API_KEY=sua-chave-aqui
GROQ_MODEL=openai/gpt-oss-120b
```

> A lista de modelos da Groq muda com o tempo. Confira os disponíveis no console e ajuste `GROQ_MODEL` se precisar.

### 3. Rodar

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

| Variável       | Descrição                                                             |
| -------------- | --------------------------------------------------------------------- |
| `LLM_PROVIDER` | `groq` para usar a Groq. Qualquer outro valor (ou vazio) usa o Ollama |
| `GROQ_API_KEY` | Chave da API da Groq                                                  |
| `GROQ_MODEL`   | Nome do modelo na Groq                                                |

## Limitações

- O plano gratuito da Groq tem limite de requisições e tokens por minuto e por dia (erro 429 ao estourar)
- O Ollama só funciona na máquina de quem o instalou, então a versão publicada usa a Groq
- Modelos de linguagem podem inventar fatos, principalmente sobre temas específicos como WoW. Não há busca de dados atualizados

## Próximos passos

- RAG para o modo WoW (buscar dados reais e injetar no prompt)
- Salvar conversas em banco de dados
- Múltiplas conversas na barra lateral
- Limite de uso por usuário na versão publicada
