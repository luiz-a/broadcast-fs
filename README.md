# Broadcast

Aplicação simplificada de **broadcast multi-tenant**: cada cliente gerencia suas conexões, os contatos de cada conexão e o envio (imediato ou agendado) de mensagens. O envio é uma **simulação**, sem integração real.

**Aplicação publicada:** https://broadcast-fs.web.app

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend (`/web`) | React, TypeScript, Vite, Material UI, Tailwind CSS, React Router |
| Backend | Firebase Authentication, Firestore, Cloud Functions, Hosting |

## Funcionalidades

- **Autenticação:** login e cadastro com e-mail e senha. Cada usuário é um cliente isolado.
- **Conexões:** CRUD completo (nome). A exclusão remove também os contatos e mensagens da conexão.
- **Contatos:** CRUD completo (nome e telefone), separado por conexão.
- **Broadcast:**
  - seleção de um ou mais contatos;
  - envio imediato ou agendado para data e horário futuros;
  - listagem em tempo real com filtro *Todas / Agendadas / Enviadas*;
  - edição e exclusão de mensagens.
- **Agendamento:** uma Cloud Function muda mensagens de *Agendada* para *Enviada* no backend, sem depender da aplicação aberta (ver [Agendamento](#agendamento)).

## Estrutura do projeto

```
.
├─ firebase.json
├─ firestore.rules            # regras de segurança (isolamento entre clientes)
├─ firestore.indexes.json     # índice usado pela Cloud Function
├─ functions/
│  └─ src/index.ts            # dispatchScheduledMessages
└─ web/
   └─ src/
      ├─ lib/                 # firebase, helpers de Firestore, hook de coleção, datas
      ├─ components/          # AppLayout, EmptyState
      ├─ features/
      │  ├─ auth/             # AuthProvider, ProtectedRoute, AuthPage
      │  ├─ connections/
      │  ├─ contacts/
      │  └─ messages/
      ├─ theme.ts
      └─ types.ts
```

O frontend é organizado **por feature**: cada pasta reúne telas, diálogos e regras de negócio do seu domínio.

## Modelagem de dados

Três coleções na raiz, **sem subcoleções**. O relacionamento é feito por campos de referência.

```
connections/{id}
  ownerId    string      uid do cliente dono
  name       string
  createdAt  timestamp

contacts/{id}
  ownerId       string
  connectionId  string   referência para connections
  name          string
  phone         string
  createdAt     timestamp

messages/{id}
  ownerId       string
  connectionId  string   referência para connections
  contactIds    string[] destinatários (ids de contacts)
  text          string
  status        'scheduled' | 'sent'
  scheduledAt   timestamp | null
  sentAt        timestamp | null
  createdAt     timestamp
```

**Decisões de modelagem**

- **`ownerId` em todos os documentos (desnormalizado):** permite que a regra de segurança valide o dono olhando só para o próprio documento, sem leituras extras, e que toda query filtre por cliente.
- **`connectionId` em contatos e mensagens:** substitui as subcoleções; listar os contatos de uma conexão é um `where('connectionId', '==', id)`.
- **`contactIds` na mensagem:** guarda apenas referências; se um contato for removido, a mensagem continua existindo e a interface exibe "Contatos removidos" quando nenhum destinatário resta.
- **`status` + `scheduledAt`:** o par permite a Cloud Function localizar mensagens vencidas com uma única query indexada.

## Isolamento entre clientes

A estratégia combina **regras de segurança no servidor** e **queries filtradas no cliente**:

1. **Firestore Rules** (`firestore.rules`), por coleção:
   - leitura, edição e exclusão só se `resource.data.ownerId == request.auth.uid`;
   - na criação, `ownerId` precisa ser o uid autenticado;
   - em updates, `ownerId` e `connectionId` não podem ser alterados;
   - contatos e mensagens só podem ser criados em uma conexão que pertence ao usuário (`get()` na conexão);
   - validação de dados: nome não vazio, telefone preenchido, texto de 1 a 1000 caracteres, ao menos um destinatário e `status` restrito a `scheduled` ou `sent`;
   - qualquer coleção sem regra é negada por padrão.
2. **Queries:** todas as consultas do frontend filtram por `ownerId == uid`, requisito do Firestore para que a query seja compatível com as regras.
3. **Rotas protegidas:** `ProtectedRoute` impede acesso ao app sem sessão.

O isolamento não depende do frontend: mesmo chamando o Firestore diretamente, um cliente não lê nem altera dados de outro.

## Tempo real

Todas as listas (conexões, contatos e mensagens) usam `onSnapshot`, encapsulado no hook `useOwnedCollection`. Qualquer alteração, inclusive a mudança de status feita pelo backend, aparece sem recarregar a página.

## Agendamento

`dispatchScheduledMessages` (`functions/src/index.ts`) é uma função agendada (Cloud Scheduler) que roda a cada minuto, busca mensagens com `status == 'scheduled'` e `scheduledAt <= agora` e as atualiza para `sent` em batch, preenchendo `sentAt`. Roda no backend, sem depender do usuário estar com a aplicação aberta.

> **Observação:** por orientação do teste, as Cloud Functions estão **implementadas, mas não publicadas** (a publicação exige o plano Blaze). No app publicado, mensagens agendadas permanecem como *Agendada*. Para ativar: upgrade para o plano Blaze e `firebase deploy --only functions`.

## Decisões de implementação

- **Paradigma funcional:** apenas funções, hooks e componentes funcionais; nenhum uso de classes. Acesso a dados em funções puras (`lib/firestore.ts`).
- **Edição de mensagens:** agendadas podem ser editadas por completo (texto, destinatários, data, ou convertidas em envio imediato); enviadas permitem editar texto e destinatários, mantendo o status.
- **Exclusão em cascata:** como não há subcoleções, `deleteConnectionCascade` remove a conexão e os contatos e mensagens que apontam para ela, em batches de até 500 operações.
- **MUI + Tailwind:** MUI para componentes, Tailwind para layout e espaçamento. As camadas CSS (`@layer`) são ordenadas para o Tailwind sobrescrever o MUI sem conflitos.
- **Validação:** no cliente (UX) e nas regras (garantia).

## Limitações conhecidas

- Cloud Functions não publicadas (ver [Agendamento](#agendamento)); quando ativas, a granularidade do agendamento é de 1 minuto.
- Batches limitados a 500 operações (cascade e disparo).
- Envio simulado, sem integração real.
- Sem recuperação de senha nem verificação de e-mail.

## Como rodar localmente

**Pré-requisitos:** Node.js 20+ e Firebase CLI (`npm i -g firebase-tools`).

```bash
# 1. Frontend
cd web
npm install
cp .env.example .env
npm run dev

# 2. Functions (apenas compilar)
cd ../functions
npm install
npm run build
```

Variáveis do `web/.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Deploy

```bash
cd web && npm run build && cd ..
firebase deploy --only hosting,firestore
```

Para publicar também as functions (requer plano Blaze): `firebase deploy --only functions`.

## Autor

Luiz Antônio Maia Santos