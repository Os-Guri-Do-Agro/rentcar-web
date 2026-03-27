# Integração WhatsApp — JL Rent Car

## Visão Geral

A integração WhatsApp usa a **Evolution API v2** (self-hosted no Railway) conectada via Baileys (WhatsApp Web).
A API da locadora (`rentcar-api`) se comunica com a Evolution API via HTTP para enviar/receber mensagens.

```
Cliente WhatsApp ←→ Evolution API (Railway) ←→ rentcar-api (NestJS)
                                                    ↓
                                              Supabase (logs)
```

---

## Configuração

### Variáveis de ambiente (`.env`)

```env
EVOLUTION_API_URL=https://evolution-rentcar-api-production.up.railway.app
EVOLUTION_API_KEY=sua-chave-aqui
EVOLUTION_INSTANCE=rentcar
WHATSAPP_ADMIN_NUMERO=5567991336868
```

### Evolution API (Railway)

```env
AUTHENTICATION_API_KEY=sua-chave-aqui
AUTHENTICATION_TYPE=apikey
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=sua-connection-string
SERVER_URL=https://evolution-rentcar-api-production.up.railway.app
CONFIG_SESSION_PHONE_CLIENT=JL Rent Car
CONFIG_SESSION_PHONE_NAME=Chrome
CONFIG_SESSION_PHONE_VERSION=versao-atual-do-whatsapp-web
REDIS_ENABLED=false
CACHE_REDIS_ENABLED=false
QRCODE_LIMIT=30
```

> **IMPORTANTE**: O `CONFIG_SESSION_PHONE_VERSION` deve ser a versão atual do WhatsApp Web.
> Para descobrir: abra o WhatsApp Web no navegador → F12 → Console → digite `window.Debug.VERSION`.

---

## Rotas Implementadas (`/whatsapp`)

### Admin (requer JWT + role admin)

| Método | Rota                             | Descrição                             |
| ------ | -------------------------------- | ------------------------------------- |
| `POST` | `/whatsapp/enviar`               | Enviar mensagem de texto              |
| `POST` | `/whatsapp/enviar-imagem`        | Enviar imagem com legenda             |
| `POST` | `/whatsapp/enviar-documento`     | Enviar PDF/documento                  |
| `POST` | `/whatsapp/enviar-localizacao`   | Enviar localização no mapa            |
| `POST` | `/whatsapp/verificar-numero`     | Verificar se número tem WhatsApp      |
| `GET`  | `/whatsapp/status`               | Status da conexão WhatsApp            |
| `GET`  | `/whatsapp/chats`                | Listar todos os chats                 |
| `GET`  | `/whatsapp/mensagens/:remoteJid` | Mensagens de um chat (paginado)       |
| `GET`  | `/whatsapp/logs`                 | Logs de mensagens enviadas (paginado) |

### Público

| Método | Rota                           | Descrição                                   |
| ------ | ------------------------------ | ------------------------------------------- |
| `GET`  | `/whatsapp/eventos`            | **SSE** — Stream de mensagens em tempo real |
| `POST` | `/whatsapp/webhook`            | Recebe eventos da Evolution API             |
| `POST` | `/whatsapp/configurar-webhook` | Configura webhook na Evolution API (admin)  |

---

## Como Usar Cada Rota

### Enviar mensagem de texto

```http
POST /whatsapp/enviar
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "number": "5567991336868",
  "text": "Olá! Sua reserva foi confirmada.",
  "reservaId": "uuid-da-reserva"
}
```

**Campos:**

- `number` (obrigatório) — número com DDI+DDD, sem +, sem espaços
- `text` (obrigatório) — texto da mensagem (suporta _negrito_, _itálico_, ~tachado~)
- `reservaId` (opcional) — vincula ao log da reserva

---

### Enviar imagem

```http
POST /whatsapp/enviar-imagem
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "number": "5567991336868",
  "imageUrl": "https://url-publica-da-imagem.jpg",
  "caption": "🚗 Fiat Argo 2024 — Disponível para locação!",
  "reservaId": "uuid-da-reserva"
}
```

**Campos:**

- `number` (obrigatório) — número do destinatário
- `imageUrl` (obrigatório) — URL pública da imagem (JPEG, PNG, WEBP)
- `caption` (opcional) — legenda da imagem
- `reservaId` (opcional) — vincula ao log

**Uso ideal:**

- Enviar foto do veículo reservado
- Promoções com imagem
- Comprovantes visuais

---

### Enviar documento/PDF

```http
POST /whatsapp/enviar-documento
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "number": "5567991336868",
  "documentUrl": "https://url-do-contrato.pdf",
  "fileName": "Contrato_Locacao_JLRentCar.pdf",
  "caption": "Segue o contrato de locação para sua análise.",
  "reservaId": "uuid-da-reserva"
}
```

**Campos:**

- `number` (obrigatório) — número do destinatário
- `documentUrl` (obrigatório) — URL pública do PDF
- `fileName` (obrigatório) — nome do arquivo que aparece no WhatsApp
- `caption` (opcional) — mensagem junto ao documento
- `reservaId` (opcional) — vincula ao log

**Uso ideal:**

- Enviar contrato de locação
- Termos de uso
- Comprovante de pagamento
- Checklist de vistoria

---

### Enviar localização

```http
POST /whatsapp/enviar-localizacao
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "number": "5567991336868",
  "latitude": -20.4697,
  "longitude": -54.6201,
  "name": "JL Rent Car — Matriz",
  "address": "Rua Exemplo, 123 — Campo Grande/MS",
  "reservaId": "uuid-da-reserva"
}
```

**Campos:**

- `number` (obrigatório) — número do destinatário
- `latitude` / `longitude` (obrigatório) — coordenadas do local
- `name` (obrigatório) — nome do ponto
- `address` (obrigatório) — endereço legível
- `reservaId` (opcional) — vincula ao log

**Uso ideal:**

- Ponto de retirada do veículo
- Ponto de devolução
- Localização da loja

---

### Verificar se número tem WhatsApp

```http
POST /whatsapp/verificar-numero
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "number": "5567991336868"
}
```

**Retorno:**

```json
{
  "success": true,
  "data": {
    "existe": true,
    "jid": "5567991336868@s.whatsapp.net"
  }
}
```

---

### Verificar status da conexão

```http
GET /whatsapp/status
Authorization: Bearer <token-admin>
```

**Retorno:**

```json
{
  "success": true,
  "data": {
    "conectado": true,
    "estado": "open"
  }
}
```

**Estados possíveis:** `open` (conectado), `close` (desconectado), `connecting` (conectando)

---

### Listar chats (conversas)

```http
GET /whatsapp/chats
Authorization: Bearer <token-admin>
```

Retorna todas as conversas do WhatsApp com nome, último contato e mensagens não lidas.

---

### Buscar mensagens de um chat

```http
GET /whatsapp/mensagens/5567991336868@s.whatsapp.net?page=1&limit=50
Authorization: Bearer <token-admin>
```

**Parâmetros:**

- `remoteJid` (na URL) — identificador do chat (número + `@s.whatsapp.net`)
- `page` (opcional) — página, padrão 1
- `limit` (opcional) — itens por página, padrão 50

---

### Logs de mensagens enviadas

```http
GET /whatsapp/logs?page=1&limit=50
Authorization: Bearer <token-admin>
```

Retorna todas as mensagens enviadas pela API com status, erros e vínculo com reservas.

---

## Chat em Tempo Real (SSE)

O frontend recebe mensagens ao vivo sem precisar dar refresh. Usa **Server-Sent Events (SSE)**.

### Como conectar no frontend

```typescript
// Conecta no stream — sem autenticação necessária
const eventSource = new EventSource(
  "https://rentcar-api-production.up.railway.app/whatsapp/eventos",
);

// Recebe mensagens em tempo real
eventSource.onmessage = (event) => {
  const dados = JSON.parse(event.data);

  // dados = {
  //   tipo: "mensagem_recebida" | "mensagem_enviada" | "conexao",
  //   dados: {
  //     remoteJid: "5567991336868@s.whatsapp.net",
  //     numero: "5567991336868",
  //     fromMe: false,
  //     pushName: "João Silva",
  //     texto: "Olá, gostaria de reservar um carro",
  //     messageType: "text",  // text, image, video, audio, document, sticker, location, contact
  //     timestamp: "2026-03-24T00:35:00.000Z"
  //   },
  //   timestamp: "2026-03-24T00:35:00.000Z"
  // }

  switch (dados.tipo) {
    case "mensagem_recebida":
      // Adiciona mensagem na lista do chat
      adicionarMensagem(dados.dados);
      // Toca som de notificação
      playNotificationSound();
      break;

    case "mensagem_enviada":
      // Atualiza status da mensagem enviada
      atualizarMensagemEnviada(dados.dados);
      break;

    case "conexao":
      // Atualiza indicador de conexão (online/offline)
      atualizarStatusConexao(dados.dados);
      break;
  }
};

// Tratamento de erro (reconexão automática)
eventSource.onerror = () => {
  console.log("Conexão SSE perdida, reconectando...");
  // EventSource reconecta automaticamente
};
```

### Exemplo React (hook)

```tsx
import { useEffect, useState } from "react";

interface MensagemWhatsapp {
  remoteJid: string;
  numero: string;
  fromMe: boolean;
  pushName: string;
  texto: string;
  messageType: string;
  timestamp: string;
}

export function useWhatsappChat() {
  const [mensagens, setMensagens] = useState<MensagemWhatsapp[]>([]);

  useEffect(() => {
    const es = new EventSource(
      `${import.meta.env.VITE_API_URL}/whatsapp/eventos`,
    );

    es.onmessage = (event) => {
      const { tipo, dados } = JSON.parse(event.data);
      if (tipo === "mensagem_recebida" || tipo === "mensagem_enviada") {
        setMensagens((prev) => [...prev, dados]);
      }
    };

    return () => es.close();
  }, []);

  return mensagens;
}
```

### Fluxo completo

```
1. Alguém manda mensagem no WhatsApp
2. Evolution API recebe → chama POST /whatsapp/webhook
3. Webhook salva no whatsapp_logs + emite evento SSE
4. Frontend conectado no GET /whatsapp/eventos recebe instantaneamente
5. Chat atualiza ao vivo na tela
```

### Carregar histórico ao abrir o chat

O SSE só entrega mensagens **novas** (após conectar). Para carregar o histórico:

```http
GET /whatsapp/chats
Authorization: Bearer <token-admin>
```

Depois, para cada chat:

```http
GET /whatsapp/mensagens/5567991336868@s.whatsapp.net?page=1&limit=50
Authorization: Bearer <token-admin>
```

### Configurar webhook (uma vez só)

Precisa ser feito **uma única vez** para que a Evolution API envie eventos para o backend:

```http
POST /whatsapp/configurar-webhook
Authorization: Bearer <token-admin>
Content-Type: application/json

{
  "url": "https://rentcar-api-production.up.railway.app/whatsapp/webhook"
}
```

Ou diretamente na Evolution API:

```http
POST https://evolution-rentcar-api-production.up.railway.app/webhook/set/rentcar
apikey: sua-chave
Content-Type: application/json

{
  "webhook": {
    "enabled": true,
    "url": "https://rentcar-api-production.up.railway.app/whatsapp/webhook",
    "webhookByEvents": false,
    "webhookBase64": false,
    "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE"]
  }
}
```

---

## Notificações Automáticas de Reserva

Disparadas automaticamente sem bloquear o fluxo. Se falhar, não impede a operação.

### Quando uma reserva é CRIADA (status: pendente)

**Para o CLIENTE:**

```
━━━━━━━━━━━━━━━━━━━━
  🚗 JL RENT CAR
  Reserva Recebida
━━━━━━━━━━━━━━━━━━━━

Olá, João! 👋

Sua reserva foi registrada e está aguardando análise.

📋 Detalhes da Reserva:
├ Veículo: Fiat Argo 2024
├ Plano: Mensal
├ Retirada: 25/03/2026
├ Devolução: 25/04/2026
├ Período: 31 dia(s)
├ Diária: R$ 89,90
└ Total: R$ 2.786,90

⏳ Status: PENDENTE

+ [Foto do veículo reservado]
```

**Para o ADMIN:**

```
🔔 NOVA RESERVA RECEBIDA

Cliente: João Silva
Veículo: Fiat Argo 2024
Período: 25/03/2026 → 25/04/2026 (31 dias)
Valor: R$ 2.786,90

Acesse o painel para aprovar ou recusar.
```

---

### Quando uma reserva é CONFIRMADA

**Para o CLIENTE:**

```
━━━━━━━━━━━━━━━━━━━━
  ✅ JL RENT CAR
  Reserva Confirmada
━━━━━━━━━━━━━━━━━━━━

Ótima notícia, João! 🎉

Sua reserva foi CONFIRMADA pela nossa equipe.

📋 Resumo:
├ Veículo: Fiat Argo 2024
├ Retirada: 25/03/2026
├ Devolução: 25/04/2026
└ Total: R$ 2.786,90

📄 Documentos necessários na retirada:
├ CNH (original e dentro da validade)
├ CPF ou RG
└ Comprovante de residência

⚠️ Importante:
• Apresente-se no horário combinado
• Leve todos os documentos originais
• O veículo será entregue com tanque cheio
```

---

### Quando uma reserva é REJEITADA

**Para o CLIENTE:**

```
━━━━━━━━━━━━━━━━━━━━
  ❌ JL RENT CAR
  Reserva Não Aprovada
━━━━━━━━━━━━━━━━━━━━

Olá, João.

Infelizmente não foi possível aprovar sua reserva do Fiat Argo 2024.

📌 Motivo: Documentação incompleta

Você pode tentar novamente ou entrar em contato conosco.
```

---

### Quando o CLIENTE cancela

**Para o ADMIN:**

```
⚠️ RESERVA CANCELADA PELO CLIENTE

Cliente: João Silva
Veículo: Fiat Argo 2024
Período: 25/03/2026 → 25/04/2026
Valor: R$ 2.786,90

O veículo está disponível novamente.
```

**Para o CLIENTE:**

```
━━━━━━━━━━━━━━━━━━━━
  🔄 JL RENT CAR
  Reserva Cancelada
━━━━━━━━━━━━━━━━━━━━

Sua reserva do Fiat Argo 2024 foi cancelada conforme solicitado.

Esperamos te ver em breve!
```

---

## Lembretes Automáticos (Cron)

Rodam todo dia às **09:00** automaticamente.

### Lembrete de Retirada (D-1)

Busca reservas confirmadas com retirada no dia seguinte:

```
JL RENT CAR — Lembrete de Retirada

Olá, João!

Amanhã é o dia da retirada do seu Fiat Argo 2024.

Não esqueça de levar seus documentos (CNH, CPF e comprovante de residência).
```

### Lembrete de Devolução (D-1)

Busca reservas confirmadas com devolução no dia seguinte:

```
JL RENT CAR — Lembrete de Devolução

Olá, João!

Amanhã é o dia da devolução do Fiat Argo 2024.

Lembre-se de devolver com tanque cheio e nas mesmas condições da retirada.

Horário de funcionamento: 08h às 18h.
```

---

## Funcionalidades Disponíveis

### Implementado

- [x] Enviar texto
- [x] Enviar imagem com legenda
- [x] Enviar documento/PDF
- [x] Enviar localização
- [x] Verificar número WhatsApp
- [x] Listar chats (conversas)
- [x] Buscar mensagens de um chat
- [x] Status de conexão
- [x] Log de mensagens enviadas/recebidas (`whatsapp_logs`)
- [x] Notificação: reserva criada (cliente + admin)
- [x] Notificação: reserva confirmada (cliente)
- [x] Notificação: reserva rejeitada (cliente)
- [x] Notificação: reserva cancelada pelo cliente (admin + cliente)
- [x] Foto do veículo enviada junto na criação da reserva
- [x] Lembrete D-1 retirada (cron 09:00)
- [x] Lembrete D-1 devolução (cron 09:00)
- [x] Webhook para receber mensagens da Evolution API
- [x] Chat em tempo real via SSE (Server-Sent Events)
- [x] Configurar webhook via rota admin

### Sugestões futuras

- [ ] **Enviar enquete de satisfação** pós-devolução (`sendPoll`)
- [ ] **Enviar contato da locadora** (`sendContact`)
- [ ] **Enviar reação** em mensagens recebidas (`sendReaction`)
- [ ] **Atendimento automatizado** com menu de opções (`sendList`)
- [ ] **Notificação de promoções** para clientes antigos
- [ ] **Perfil comercial** da locadora no WhatsApp

---

## Banco de Dados

### Tabela `whatsapp_logs` (nossa)

| Campo           | Tipo      | Descrição                                              |
| --------------- | --------- | ------------------------------------------------------ |
| id              | UUID      | PK                                                     |
| reserva_id      | UUID      | FK para reservas (opcional)                            |
| numero_telefone | String    | Número do destinatário                                 |
| mensagem        | String    | Conteúdo (prefixo [IMAGEM], [DOC], [LOCAL] para mídia) |
| status          | String    | enviado, erro                                          |
| erro_mensagem   | String    | Detalhes do erro                                       |
| created_at      | Timestamp | Data/hora                                              |

### Tabelas da Evolution API (gerenciadas automaticamente)

- `Instance` — instâncias WhatsApp
- `Chat` — conversas
- `Message` — mensagens enviadas/recebidas
- `Contact` — contatos

> Ficam no mesmo Supabase mas são gerenciadas pela Evolution API.

---

## Arquitetura

```
src/whatsapp/
├── whatsapp.module.ts              # Módulo NestJS
├── whatsapp.service.ts             # Enviar texto/imagem/doc/local, notificar, buscar chats
├── whatsapp-lembretes.service.ts   # Cron: lembretes D-1 retirada e devolução
├── whatsapp.controller.ts          # Rotas HTTP (admin + webhook)
└── dto/
    └── send-message.dto.ts         # Validação de envio de texto
```

**Integração com reservas:**

- `src/reservas/reservas.service.ts` — chama `WhatsappService` nos eventos de status
- `src/reservas/reservas.module.ts` — importa `WhatsappModule`

---

## Troubleshooting

### WhatsApp desconectou

1. Chame `GET /whatsapp/status` — verifica estado
2. Acesse o manager: `https://evolution-rentcar-api-production.up.railway.app/manager`
3. Reconecte a instância

### Mensagem não chegou

1. `GET /whatsapp/logs` — veja se status é `erro` e leia `erro_mensagem`
2. `POST /whatsapp/verificar-numero` — confirme que o número tem WhatsApp
3. `GET /whatsapp/status` — confirme que está conectado

### Versão do WhatsApp bloqueada (Baileys em loop nos logs)

1. Abra WhatsApp Web no navegador
2. F12 → Console → `window.Debug.VERSION`
3. Atualize `CONFIG_SESSION_PHONE_VERSION` no Railway
4. Faça redeploy

### Lembrete não disparou

1. Verifique se `ScheduleModule.forRoot()` está no `app.module.ts`
2. Verifique se a reserva tem status `confirmada`
3. Verifique se o usuário tem `telefone` preenchido
4. O cron roda às 09:00 UTC — ajuste se necessário no `whatsapp-lembretes.service.ts`
