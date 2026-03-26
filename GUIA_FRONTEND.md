# Guia de Integração Frontend — JL Rent Car API

> Documento atualizado em 2026-03-26 com todas as alterações do backend.
> Use este guia como referência ao implementar/atualizar o frontend.

---

## 1. Fluxo de Status das Reservas (MUDOU)

O backend agora valida transições de estado. O front precisa respeitar esse fluxo:

```
pendente  ──→  aceita  ──→  confirmada
   │              │              │
   └──→ cancelada ←──────────────┘
```

### Transições permitidas:

| Status Atual | Pode ir para              |
| ------------ | ------------------------- |
| `pendente`   | `aceita`, `cancelada`     |
| `aceita`     | `confirmada`, `cancelada` |
| `confirmada` | `cancelada`               |
| `cancelada`  | (nenhum — estado final)   |

> **IMPORTANTE:** Se tentar uma transição inválida, a API retorna `400 Bad Request` com mensagem explicando as transições permitidas. O front deve tratar esse erro.

### Significado de cada status (para labels/badges no front):

| Status       | Label sugerido        | Cor sugerida | Descrição                                |
| ------------ | --------------------- | ------------ | ---------------------------------------- |
| `pendente`   | Pendente / Aguardando | Amarelo      | Cliente fez a reserva, aguarda análise   |
| `aceita`     | Aprovada              | Azul         | Admin aprovou, aguarda confirmação final |
| `confirmada` | Confirmada            | Verde        | Tudo certo, pronta pra retirada          |
| `cancelada`  | Cancelada             | Vermelho     | Cancelada por cliente, admin ou rejeição |

---

## 2. Rotas da API — Reservas

Base: `/reservas`
Auth: JWT Bearer Token (exceto `POST /reservas/guest`)

### Criar Reserva

| Rota                          | Método    | Auth       | Descrição                              |
| ----------------------------- | --------- | ---------- | -------------------------------------- |
| `POST /reservas`              | JSON      | User/Admin | Criar reserva (usuário logado)         |
| `POST /reservas/guest`        | JSON      | Nenhuma    | Criar reserva sem conta (visitante)    |
| `POST /reservas/com-arquivos` | Multipart | User/Admin | Criar reserva com upload de documentos |

**Body JSON (criar):**

```json
{
  "carro_id": "uuid",
  "data_retirada": "2026-04-01",
  "data_devolucao": "2026-04-05",
  "valor_total": 1500.0,
  "hora_retirada_solicitada": "14:00", // HH:mm — opcional
  "hora_devolucao": "10:00", // HH:mm — opcional
  "tipo_reserva": "diaria", // opcional
  "plano": "basico", // opcional
  "franquia_km": "100km/dia", // opcional
  "valor_diario": 300.0, // opcional
  "km_contratado": 500, // opcional (int)
  "km_excedente_valor": 0.5, // opcional (decimal)
  "km_adicional_valor": 0.5, // opcional (decimal)
  "origem_frota": "propria", // opcional
  "aceitou_termos": true, // NOVO: agora é salvo no banco
  "usuario": {
    // opcional — atualiza perfil do user
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999",
    "data_nascimento": "2002-10-10",
    "cpf": "12345678901",
    "cnpj": "12345678000199", // MUDOU: agora é opcional
    "cnh": "01234567890", // opcional
    "endereco_cep": "01310100",
    "endereco_rua": "Av. Paulista",
    "endereco_numero": "1000",
    "endereco_complemento": "Apto 1", // opcional
    "endereco_cidade": "São Paulo",
    "endereco_estado": "SP"
  },
  // Para reserva de visitante (POST /guest):
  "cliente_nome": "João", // obrigatório no /guest
  "cliente_email": "joao@email.com", // obrigatório no /guest
  "cliente_telefone": "(11) 88888-8888", // opcional
  "cliente_cnh": "01234567890" // opcional
}
```

### Consultar Reservas

| Rota                         | Método | Auth       | Descrição                         |
| ---------------------------- | ------ | ---------- | --------------------------------- |
| `GET /reservas/my`           | GET    | User       | Minhas reservas                   |
| `GET /reservas/user/:userId` | GET    | Admin/User | Reservas de um usuário específico |
| `GET /reservas`              | GET    | Admin      | Todas as reservas                 |
| `GET /reservas/:id`          | GET    | User/Admin | Detalhe de uma reserva            |
| `GET /reservas/:id/history`  | GET    | User/Admin | Histórico de mudanças de status   |
| `GET /reservas/:id/fotos`    | GET    | User/Admin | Fotos de retirada/devolução       |

### Ações do Admin

| Rota                                     | Método | Auth       | Descrição                                     |
| ---------------------------------------- | ------ | ---------- | --------------------------------------------- |
| `PATCH /reservas/:id/status`             | PATCH  | User/Admin | Mudar status (body: `{ "status": "aceita" }`) |
| `POST /reservas/:id/confirm`             | POST   | Admin      | Confirmar reserva (com horários opcionais)    |
| `POST /reservas/:id/reject`              | POST   | Admin      | Rejeitar reserva (com motivo)                 |
| `PATCH /reservas/:id/cancel`             | PATCH  | User/Admin | Cancelar reserva                              |
| `POST /reservas/:id/fotos?tipo=retirada` | POST   | User/Admin | Upload fotos (multipart)                      |
| `POST /reservas/:id/confirmar-envio`     | POST   | Admin      | Enviar documentos por email ao cliente        |
| `DELETE /reservas/:id`                   | DELETE | Admin      | Excluir reserva (hard delete)                 |

### Confirmar Reserva (Admin) — Aceitar horários

```
POST /reservas/:id/confirm
```

```json
{
  "hora_retirada": "10:00", // HH:mm — opcional, define/altera horário aprovado
  "hora_devolucao": "18:00" // HH:mm — opcional
}
```

> Validação: formato obrigatório `HH:mm`. Qualquer valor fora disso retorna 400.

### Rejeitar Reserva (Admin)

```
POST /reservas/:id/reject
```

```json
{
  "motivo": "Documentação incompleta"
}
```

---

## 3. Rotas da API — WhatsApp

Base: `/whatsapp`
Auth: JWT Bearer Token + Role Admin (exceto webhook)

### Conexão e Status

| Rota                           | Método | Auth  | Descrição             |
| ------------------------------ | ------ | ----- | --------------------- |
| `GET /whatsapp/qrcode`         | GET    | Admin | QR Code para conectar |
| `GET /whatsapp/status`         | GET    | Admin | Status da conexão     |
| `DELETE /whatsapp/desconectar` | DELETE | Admin | Desconectar instância |

**Resposta do QR Code:**

```json
{
  "qrcode": "string",      // código em texto
  "pairingCode": "string",  // código de pareamento
  "base64": "string",       // QR como imagem base64
  "estado": "conectado" | "aguardando" | "erro",
  "mensagem": "WhatsApp já está conectado..."  // se já conectado
}
```

### Envio de Mensagens

| Rota                                | Método | Auth  | Descrição                     |
| ----------------------------------- | ------ | ----- | ----------------------------- |
| `POST /whatsapp/enviar`             | POST   | Admin | Enviar texto                  |
| `POST /whatsapp/enviar-imagem`      | POST   | Admin | Enviar imagem (URL)           |
| `POST /whatsapp/enviar-documento`   | POST   | Admin | Enviar PDF (URL)              |
| `POST /whatsapp/enviar-localizacao` | POST   | Admin | Enviar localização            |
| `POST /whatsapp/verificar-numero`   | POST   | Admin | Checar se número tem WhatsApp |

**Body enviar texto:**

```json
{
  "number": "5511999999999",
  "text": "Mensagem aqui",
  "reservaId": "uuid" // opcional — vincula ao log
}
```

### Chat e Histórico

| Rota                                                 | Método | Auth  | Descrição                       |
| ---------------------------------------------------- | ------ | ----- | ------------------------------- |
| `GET /whatsapp/chats`                                | GET    | Admin | Listar todos os chats           |
| `GET /whatsapp/mensagens/:remoteJid?page=1&limit=50` | GET    | Admin | Mensagens de um chat            |
| `GET /whatsapp/logs?page=1&limit=50`                 | GET    | Admin | Logs de mensagens enviadas      |
| `SSE /whatsapp/eventos`                              | SSE    | -     | Stream de eventos em tempo real |

### Webhook e Config

| Rota                                | Método | Auth    | Descrição                       |
| ----------------------------------- | ------ | ------- | ------------------------------- |
| `POST /whatsapp/configurar-webhook` | POST   | Admin   | Definir URL do webhook          |
| `POST /whatsapp/webhook`            | POST   | Público | Recebe eventos da Evolution API |

---

## 4. Rotas da API — Email

### Email

| Rota               | Método | Auth | Descrição                                       |
| ------------------ | ------ | ---- | ----------------------------------------------- |
| `POST /email/test` | POST   | -    | Enviar email de teste (`{ "to": "email@..." }`) |

### Templates de Email

Base: `/email-templates` — Todas Admin only

| Rota                         | Método | Descrição                 |
| ---------------------------- | ------ | ------------------------- |
| `GET /email-templates`       | GET    | Listar todos os templates |
| `GET /email-templates/:tipo` | GET    | Buscar template por tipo  |
| `PUT /email-templates/:tipo` | PUT    | Criar/atualizar template  |

**Tipos de template existentes:**

- `reserva_criada`
- `reserva_aceita`
- `reserva_confirmada`
- `reserva_cancelada`
- `reserva_rejeitada`
- `envio_documentos`

**Variáveis disponíveis em TODOS os templates (ATUALIZADO):**

| Variável                       | Exemplo     | Descrição                            |
| ------------------------------ | ----------- | ------------------------------------ |
| `{{nome_cliente}}`             | Maria Silva | Nome do cliente                      |
| `{{nome_carro}}`               | Fiat Argo   | Nome do veículo                      |
| `{{data_retirada}}`            | 01/04/2026  | Data formatada pt-BR                 |
| `{{data_devolucao}}`           | 05/04/2026  | Data formatada pt-BR                 |
| `{{hora_retirada}}`            | 10:00       | Hora aprovada (ou "(a definir)")     |
| `{{hora_retirada_solicitada}}` | 14:00       | Hora que o cliente pediu             |
| `{{hora_devolucao}}`           | 18:00       | Hora de devolução (ou "(a definir)") |
| `{{valor_total}}`              | 1500.00     | Valor total formatado                |

> **NOVO:** As variáveis de horário e valor agora são passadas em TODOS os templates, não apenas no `reserva_aceita`.

**Body para criar/atualizar template:**

```json
{
  "assunto": "Sua Reserva foi {{status}} - JL Rent Car",
  "corpo": "<h2>Olá, {{nome_cliente}}!</h2><p>Veículo: {{nome_carro}}</p><p>Retirada: {{data_retirada}} às {{hora_retirada}}</p>",
  "variaveis": {
    "nome_cliente": "Nome do cliente",
    "nome_carro": "Nome do veículo",
    "hora_retirada": "Horário aprovado"
  }
}
```

---

## 5. Notificações Automáticas — O que acontece em cada ação

| Ação                          | WhatsApp Cliente                                    | WhatsApp Admin         | Email Cliente                 |
| ----------------------------- | --------------------------------------------------- | ---------------------- | ----------------------------- |
| Criar reserva                 | Detalhes + foto do carro                            | Aviso nova reserva     | Template `reserva_criada`     |
| Aceitar (pendente→aceita)     | **"Reserva Aprovada"** + aviso de horário diferente | -                      | Template `reserva_aceita`     |
| Confirmar (aceita→confirmada) | **"Reserva Confirmada"** + docs necessários         | -                      | Template `reserva_confirmada` |
| Cancelar (pelo usuário)       | Confirmação de cancelamento                         | Aviso carro disponível | Template `reserva_cancelada`  |
| Rejeitar (pelo admin)         | Motivo da rejeição                                  | -                      | Template `reserva_rejeitada`  |
| Enviar documentos             | -                                                   | -                      | Email com PDFs anexados       |

### Lembretes automáticos (Cron 09:00 diário):

- **D-1 Retirada:** Lembrete com horário + lista de documentos
- **D-1 Devolução:** Lembrete com horário + instruções de devolução
- Funciona para usuários logados E visitantes (usa `cliente_telefone` como fallback)

---

## 6. Sugestão de Telas para o Frontend

### 6.1 Painel Admin — Gestão de Reservas

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Reservas                                          [Filtros] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tabs: [Todas] [Pendentes] [Aprovadas] [Confirmadas] [Cancel.] │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ #R-001  Maria Silva        Fiat Argo       🟡 PENDENTE     ││
│  │ 01/04 → 05/04  14:00 (solicitado)   R$ 1.500,00           ││
│  │                                                             ││
│  │ [👍 Aprovar]  [❌ Rejeitar]  [👁 Ver Detalhes]              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ #R-002  João Santos        VW Gol          🔵 APROVADA     ││
│  │ 02/04 → 06/04  10:00 (aprovado)     R$ 1.200,00           ││
│  │                                                             ││
│  │ [✅ Confirmar]  [❌ Cancelar]  [👁 Ver Detalhes]             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Regra dos botões por status:**

- `pendente` → Aprovar, Rejeitar
- `aceita` → Confirmar (com modal de horário), Cancelar
- `confirmada` → Cancelar, Upload Fotos
- `cancelada` → Nenhum botão de ação

### 6.2 Modal de Aprovação (pendente → aceita)

```
┌──────────────────────────────────────────┐
│  👍 Aprovar Reserva                   [X]│
├──────────────────────────────────────────┤
│                                          │
│  Cliente: Maria Silva                    │
│  Veículo: Fiat Argo                      │
│  Período: 01/04 → 05/04 (4 dias)        │
│                                          │
│  Hora solicitada pelo cliente: 14:00     │
│                                          │
│  O front usa PATCH /reservas/:id/status  │
│  { "status": "aceita" }                  │
│                                          │
│           [Cancelar]  [Aprovar]          │
└──────────────────────────────────────────┘
```

### 6.3 Modal de Confirmação (aceita → confirmada)

```
┌──────────────────────────────────────────┐
│  ✅ Confirmar Reserva                 [X]│
├──────────────────────────────────────────┤
│                                          │
│  Cliente: Maria Silva                    │
│  Veículo: Fiat Argo                      │
│  Período: 01/04 → 05/04 (4 dias)        │
│                                          │
│  Hora solicitada: 14:00                  │
│                                          │
│  Hora de retirada aprovada:              │
│  ┌────────────────────────┐              │
│  │  10:00                 │  (HH:mm)     │
│  └────────────────────────┘              │
│  ⚠️ Diferente do solicitado (14:00)      │
│                                          │
│  Hora de devolução:                      │
│  ┌────────────────────────┐              │
│  │  18:00                 │  (HH:mm)     │
│  └────────────────────────┘              │
│                                          │
│  POST /reservas/:id/confirm              │
│  { "hora_retirada": "10:00",            │
│    "hora_devolucao": "18:00" }           │
│                                          │
│  O cliente será notificado via WhatsApp  │
│  e email sobre o horário diferente.      │
│                                          │
│           [Cancelar]  [Confirmar]        │
└──────────────────────────────────────────┘
```

### 6.4 Modal de Rejeição

```
┌──────────────────────────────────────────┐
│  ❌ Rejeitar Reserva                  [X]│
├──────────────────────────────────────────┤
│                                          │
│  Motivo da rejeição: *                   │
│  ┌────────────────────────────────────┐  │
│  │ Documentação incompleta            │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  POST /reservas/:id/reject               │
│  { "motivo": "..." }                     │
│                                          │
│           [Cancelar]  [Rejeitar]         │
└──────────────────────────────────────────┘
```

### 6.5 Detalhe da Reserva (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│  Reserva #R-001                              🟢 CONFIRMADA     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ Dados do Cliente ────────────────────────────────────────┐  │
│  │ Nome: Maria Silva         Email: maria@email.com          │  │
│  │ Telefone: (11) 99999-9999  CPF: 123.456.789-01           │  │
│  │ CNH: 01234567890           CNPJ: —                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Veículo ─────────────────────────────────────────────────┐  │
│  │ [📷 Foto]  Fiat Argo 2024                                 │  │
│  │ Plano: Básico | Franquia: 100km/dia                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Período e Horários ──────────────────────────────────────┐  │
│  │ Retirada: 01/04/2026 às 10:00                             │  │
│  │ ⚠️ Cliente solicitou: 14:00 (alterado pelo admin)         │  │
│  │ Devolução: 05/04/2026 às 18:00                            │  │
│  │ Dias: 4 | Diária: R$ 300,00 | Total: R$ 1.200,00         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Documentos (3/3) ────────────────────────────────────────┐  │
│  │ 📄 CNH - cnh_frente.pdf (2.1 MB)          [👁] [⬇]       │  │
│  │ 📄 CPF - cpf.pdf (1.0 MB)                 [👁] [⬇]       │  │
│  │ 📄 Comprovante - residencia.pdf (0.8 MB)  [👁] [⬇]       │  │
│  │                                                            │  │
│  │ [📧 Enviar Documentos por Email]  ← POST /:id/confirmar-envio│
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Fotos de Retirada ───────────────────────────────────────┐  │
│  │ [📷] [📷] [📷]  [+ Upload]  ← POST /:id/fotos?tipo=retirada│
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Fotos de Devolução ──────────────────────────────────────┐  │
│  │ (nenhuma foto)   [+ Upload]  ← POST /:id/fotos?tipo=devolucao│
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Histórico ───────────────────────────────────────────────┐  │
│  │ 26/03 10:00 — pendente → aceita (admin@jl.com)            │  │
│  │ 26/03 09:00 — Reserva criada                              │  │
│  │                         ← GET /reservas/:id/history       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [❌ Cancelar Reserva]  [🗑 Excluir]                            │
└─────────────────────────────────────────────────────────────────┘
```

### 6.6 Tela do Cliente — Minhas Reservas

```
┌─────────────────────────────────────────────────────────────────┐
│  🚗 Minhas Reservas                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [📷]  Fiat Argo                         🟢 CONFIRMADA      ││
│  │                                                             ││
│  │  📅 01/04 às 10:00  →  05/04 às 18:00                      ││
│  │  ⚠️ Horário alterado (você pediu 14:00, confirmado 10:00)  ││
│  │  💰 R$ 1.200,00                                            ││
│  │                                                             ││
│  │  [Ver Detalhes]  [Cancelar]                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [📷]  VW Gol                            🟡 PENDENTE        ││
│  │                                                             ││
│  │  📅 10/04 às (a definir)  →  15/04 às (a definir)          ││
│  │  💰 R$ 800,00                                              ││
│  │                                                             ││
│  │  [Ver Detalhes]  [Cancelar]                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.7 Admin — Config WhatsApp

```
┌─────────────────────────────────────────────────────────────────┐
│  📱 WhatsApp — Configurações                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Status: 🟢 Conectado                  [🔄 Atualizar] [Desconectar]│
│                                         GET /whatsapp/status    │
│                                                                 │
│  ┌─ QR Code ─────────────────────────────────────────────────┐  │
│  │  (Mostrar só se desconectado)                             │  │
│  │  [QR CODE IMAGE - base64]         GET /whatsapp/qrcode    │  │
│  │  Código de pareamento: XXXX-XXXX                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Webhook ─────────────────────────────────────────────────┐  │
│  │  URL: https://api.jlrentcar.com/whatsapp/webhook          │  │
│  │  [Configurar]              POST /whatsapp/configurar-webhook│
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Enviar Mensagem Manual ──────────────────────────────────┐  │
│  │  Número: [________________]                                │  │
│  │  Mensagem: [___________________________________]           │  │
│  │  [Verificar Número] [Enviar]    POST /whatsapp/enviar     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Logs de Mensagens ───────────────────────────────────────┐  │
│  │  Paginado com GET /whatsapp/logs?page=1&limit=50          │  │
│  │  55119999... | [ENVIADO] Reserva Confirmada | 26/03 10:00 │  │
│  │  55118888... | [RECEBIDO] João: Olá         | 26/03 09:30 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.8 Admin — Chat WhatsApp (Tempo Real)

```
┌─────────────────────────────────────────────────────────────────┐
│  💬 Chat WhatsApp                                               │
├──────────────────┬──────────────────────────────────────────────┤
│  Conversas       │  Maria Silva (5511999...)                    │
│                  │                                              │
│  🟢 Maria Silva  │  ┌──────────────────────────────────────┐   │
│  🟢 João Santos  │  │ [BOT] Reserva Confirmada!            │   │
│  ⚪ Ana Costa    │  │ Fiat Argo - 01/04 às 10:00           │   │
│                  │  └──────────────────────────────────────┘   │
│  GET /whatsapp/  │                                              │
│  chats           │  ┌──────────────────────────────────────┐   │
│                  │  │ [CLIENTE] Obrigada! Posso chegar     │   │
│                  │  │ 30 min antes?                         │   │
│                  │  └──────────────────────────────────────┘   │
│                  │                                              │
│                  │  ┌────────────────────────────────────────┐ │
│                  │  │ Digite sua mensagem...          [Enviar]│ │
│                  │  └────────────────────────────────────────┘ │
│                  │                                              │
│  GET /mensagens/ │  SSE: /whatsapp/eventos (tempo real)        │
│  :remoteJid      │                                              │
├──────────────────┴──────────────────────────────────────────────┤
│  Eventos SSE: EventSource('/whatsapp/eventos')                  │
│  Tipos: mensagem_recebida, mensagem_enviada, conexao            │
└─────────────────────────────────────────────────────────────────┘
```

### 6.9 Admin — Templates de Email

```
┌─────────────────────────────────────────────────────────────────┐
│  📧 Templates de Email                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tabs: [reserva_criada] [reserva_aceita] [reserva_confirmada]   │
│        [reserva_cancelada] [reserva_rejeitada] [envio_documentos]│
│                                                                 │
│  ┌─ reserva_confirmada ──────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Assunto:                                                  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Reserva Confirmada - {{nome_carro}} - JL Rent Car   │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Corpo (HTML):                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ <h2>Olá, {{nome_cliente}}!</h2>                     │  │  │
│  │  │ <p>Veículo: {{nome_carro}}</p>                      │  │  │
│  │  │ <p>Retirada: {{data_retirada}} às {{hora_retirada}} │  │  │
│  │  │ <p>Devolução: {{data_devolucao}} às {{hora_devolucao│  │  │
│  │  │ <p>Total: R$ {{valor_total}}</p>                    │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Variáveis disponíveis:                                    │  │
│  │  {{nome_cliente}} {{nome_carro}} {{data_retirada}}         │  │
│  │  {{data_devolucao}} {{hora_retirada}} {{hora_devolucao}}   │  │
│  │  {{hora_retirada_solicitada}} {{valor_total}}              │  │
│  │                                                            │  │
│  │  [Preview]  [Salvar]       PUT /email-templates/:tipo      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Formulário de Nova Reserva (Cliente)

```
┌─────────────────────────────────────────────────────────────────┐
│  🚗 Nova Reserva                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ Veículo Selecionado ─────────────────────────────────────┐  │
│  │ [📷 Foto Grande]                                          │  │
│  │ Fiat Argo 2024 — R$ 300,00/dia                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Período ─────────────────────────────────────────────────┐  │
│  │  Data de Retirada:  [📅 01/04/2026]                       │  │
│  │  Hora desejada:     [⏰ 14:00    ]  ← hora_retirada_solicitada│
│  │                                                            │  │
│  │  Data de Devolução: [📅 05/04/2026]                       │  │
│  │  Hora de devolução: [⏰ 18:00    ]  ← hora_devolucao      │  │
│  │                                                            │  │
│  │  Dias: 4 | Total: R$ 1.200,00                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Plano (opcional) ────────────────────────────────────────┐  │
│  │  [Básico ✓] [Intermediário] [Premium]                     │  │
│  │  Franquia: 100km/dia | KM excedente: R$ 0,50              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Seus Dados ──────────────────────────────────────────────┐  │
│  │  Nome: [________________]  Email: [________________]      │  │
│  │  Tel:  [________________]  CPF:   [________________]      │  │
│  │  CNPJ: [________________] (opcional)                      │  │
│  │  CNH:  [________________] (opcional)                      │  │
│  │  Nasc: [📅_____________]                                  │  │
│  │                                                            │  │
│  │  CEP:    [________]  Rua:   [________________________]    │  │
│  │  Número: [________]  Compl: [________________________]    │  │
│  │  Cidade: [________________]  UF: [__]                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Documentos (opcional, max 3) ────────────────────────────┐  │
│  │  [+ CNH]  [+ CPF]  [+ Comprovante]                       │  │
│  │  📄 cnh_frente.pdf (2.1 MB)  [🗑]                        │  │
│  │                                                            │  │
│  │  Formatos: PDF (todos) | JPG/PNG/WEBP (só comprovante     │  │
│  │  trabalho plataforma). Máx 10 MB cada.                    │  │
│  │                                                            │  │
│  │  Nome do arquivo: TIPO+nome.pdf ou TIPO_nome.pdf          │  │
│  │  Ex: cnh+frente.pdf, cpf+documento.pdf                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ☑ Li e aceito os termos de uso  ← aceitou_termos: true       │
│                                                                 │
│  [Solicitar Reserva]                                            │
│                                                                 │
│  Rota: POST /reservas/com-arquivos (multipart)                  │
│  ou POST /reservas (JSON sem arquivos)                          │
│  ou POST /reservas/guest (visitante sem login)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Checklist para o Frontend

### Obrigatório (bugs/mudanças):

- [ ] Atualizar badges de status: usar "Aprovada" (não "Aceita") para status `aceita`
- [ ] Mostrar botões corretos por status (ver seção 6.1)
- [ ] Modal de confirmação com campos de hora (HH:mm) no `POST /confirm`
- [ ] Tratar erro 400 de transição inválida (mostrar mensagem amigável)
- [ ] Mostrar aviso quando `hora_retirada_solicitada !== hora_retirada`
- [ ] CNPJ como campo opcional no formulário de reserva
- [ ] Garantir que `aceitou_termos` é enviado como boolean no body

### Recomendado:

- [ ] Tela de chat WhatsApp com SSE (`/whatsapp/eventos`)
- [ ] Tela de edição de templates de email com preview
- [ ] Histórico de status na reserva (`GET /:id/history`)
- [ ] Upload de fotos retirada/devolução com preview
- [ ] Seção de documentos com botão "Enviar por Email"
- [ ] Indicador visual de "horário alterado" nos cards de reserva
- [ ] Página de configuração WhatsApp (QR code, status, webhook)

---

## 9. Responses — Formato Padrão

Todas as respostas seguem o wrapper `CustomResponse`:

```json
{
  "statusCode": 200,
  "data": { ... }
}
```

Erros:

```json
{
  "statusCode": 400,
  "message": "Não é possível mudar de \"cancelada\" para \"aceita\". Transições permitidas: nenhuma",
  "error": "Bad Request"
}
```
