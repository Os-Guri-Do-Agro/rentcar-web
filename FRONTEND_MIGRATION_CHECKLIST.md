# Checklist de Migração — Frontend

> Para cada etapa, o frontend deve **parar de chamar o Supabase diretamente** e passar a consumir os endpoints do backend via `fetch`/`axios`.

---

## Etapa 1 — Autenticação

**Arquivos afetados:** `authService.js`, `AuthContext.jsx`

- [ ] Substituir `supabase.auth.signInWithPassword` → `POST /auth/login`
- [ ] Substituir `supabase.auth.signUp` → `POST /auth/register`
- [ ] Substituir `supabase.auth.signOut` → `POST /auth/logout`
- [ ] Substituir `supabase.auth.resetPasswordForEmail` → `POST /auth/forgot-password`
- [ ] Substituir `supabase.auth.updateUser` (reset senha) → `POST /auth/reset-password`
- [ ] `AuthContext.jsx`: armazenar o JWT retornado pelo backend (não mais a sessão do Supabase)
- [ ] Remover lógica de `isAdmin` derivada do objeto React — ler do JWT ou de resposta do backend
- [ ] `uploadProfilePhoto` → `POST /usuarios/avatar` (enviar multipart/form-data)

---

## Etapa 2 — Usuários

**Arquivos afetados:** `usuarioService.js`

- [ ] `carregarDadosUsuario` / `getUsuario` → `GET /usuarios/me`
- [ ] `salvarDadosUsuario` → `PATCH /usuarios/me`
- [ ] Remover filtragem manual de campos proibidos (`id`, `role`, etc.) — o backend faz isso

---

## Etapa 3 — Veículos

**Arquivos afetados:** `carService.js`, `carPricingService.js`, `fotosService.js`, `imageService.js`

- [ ] `fetchAllCars` → `GET /cars`
- [ ] `fetchFeaturedCars` → `GET /cars/featured`
- [ ] `fetchCarById` → `GET /cars/:id`
- [ ] `createCar` / `updateCar` / `deleteCar` → `POST/PUT/DELETE /cars/:id`
- [ ] `updateCarAvailability` / `updateGeneralAvailability` → `PATCH /cars/:id/availability`
- [ ] `getCarPricing` / `getAllCarsPricing` → `GET /cars/:id/pricing`
- [ ] `updateCarPricing` / `deleteCarPricing` → `PUT/DELETE /cars/:id/pricing`
- [ ] `uploadFoto` / `updateFotoPrincipal` / `updateFotosGaleria` / `deleteFoto` → endpoints de `/cars/:id/fotos`
- [ ] `resizeImage` pode continuar no frontend **apenas para preview**; o upload final vai para o backend
- [ ] Remover acesso direto ao bucket `cars` do Storage

---

## Etapa 4 — Cálculo de Preço

**Arquivos afetados:** `calculoPrecoService.js`

- [ ] `calcularPrecoReserva` → `POST /cars/:id/calcular-preco` (enviar `tipo_locacao`, `tipo_plano`, `km`, `datas`)
- [ ] Frontend **não calcula mais preço** — apenas exibe o valor retornado pelo backend
- [ ] Remover `getColumnName`, `calculateWeeklyPrice`, `calculateMonthlyPrice` do bundle do cliente

---

## Etapa 5 — Reservas

**Arquivos afetados:** `reservaService.js`, `ReservaContext.jsx`

- [ ] `createReserva` → `POST /reservas`
- [ ] `getUserReservas` → `GET /reservas` (com token do usuário)
- [ ] `getReservaById` → `GET /reservas/:id`
- [ ] `cancelReserva` → `PATCH /reservas/:id/cancelar`
- [ ] `listReservas` (admin) → `GET /admin/reservas`
- [ ] Remover campos `status` e `origem_frota` do payload — o backend define esses valores
- [ ] `calcularDataDevolucao` / `calcularDuracao` / `validarDatas` → manter no frontend **só para UX** (feedback imediato no form), mas a validação final é do backend

---

## Etapa 6 — Documentos

**Arquivos afetados:** `documentoService.js`

- [ ] `uploadDocumento` → `POST /documentos/upload` (multipart/form-data com `reservaId` e `tipoDocumento`)
- [ ] `salvarTodosDocumentos` → `POST /documentos/reserva/:id`
- [ ] `getDocumentosReserva` → `GET /documentos/reserva/:id`
- [ ] `deleteDocumento` → `DELETE /documentos/reserva/:id/:tipo`
- [ ] Remover acesso direto ao bucket `reserva-documentos`
- [ ] Manter validação de PDF e 10MB no frontend para UX, mas não confiar nela como única barreira

---

## Etapa 7 — Status de Reserva

**Arquivos afetados:** `reservaStatusService.js`

- [ ] `confirmReserva` → `POST /admin/reservas/:id/confirmar`
- [ ] `rejectReserva` → `POST /admin/reservas/:id/rejeitar` (enviar `motivo`)
- [ ] `deleteReserva` → `DELETE /admin/reservas/:id`
- [ ] `getReservaHistorico` → `GET /reservas/:id/historico`
- [ ] Remover chamadas diretas a `sendConfirmationEmail` / `sendRejectionEmail` — o backend dispara as notificações

---

## Etapa 8 — Módulos Admin

**Arquivos afetados:** `avaliacoesService.js`, `clienteAvaliacaoService.js`, `configService.js`, `adminService.js`, `conteudoService.js`, `secoesService.js`, `emailTemplateService.js`, `carrosDestaqueService.js`

- [ ] Avaliações: CRUD → `/admin/avaliacoes`
- [ ] Avaliação de clientes: leitura/update/histórico → `/admin/clientes/:id/avaliacao`
- [ ] Dashboard stats → `GET /admin/dashboard`
- [ ] Configurações → `GET/PUT /admin/configuracoes`
- [ ] Conteúdo/Seções → `/admin/conteudo` e `/admin/secoes`
- [ ] Templates de e-mail → `GET/PUT /admin/email-templates`
- [ ] Carros em destaque → `/admin/carros-destaque`
- [ ] Remover `renderTemplate` do frontend — o backend renderiza e envia o e-mail

---

## Etapa 9 — Notificações

**Arquivos afetados:** `emailService.js`, `whatsappService.js`

- [ ] Remover todas as chamadas diretas às Edge Functions `send-email` e `send-whatsapp`
- [ ] O frontend **não dispara mais notificações** — elas são efeitos colaterais das ações no backend
- [ ] `getWhatsAppNumber` / `setWhatsAppNumber` → `GET/PUT /admin/configuracoes/whatsapp`

---

## O que NÃO muda no frontend

| Arquivo                           | Motivo                                               |
| --------------------------------- | ---------------------------------------------------- |
| `validationUtils.js` (máscaras)   | `formatCPF`, `formatPhone`, `formatCEP` são só UI    |
| `reservaValidation.js`            | Validação local de formulário para feedback imediato |
| `ReservaContext.jsx`              | Estado de navegação multi-step                       |
| `AuthContext.jsx`                 | Leitura do JWT e estado de sessão no cliente         |
| `dateUtils.js`                    | Formatação de datas para exibição                    |
| `imageService.js` → `resizeImage` | Preview antes do upload                              |

> Validações como `validateCPF`, `validatePhone`, `validatePDFFile` devem existir **nos dois lados** — frontend para UX, backend para segurança.

---

## Padrão de chamada sugerido

Criar um `apiClient.js` centralizado que:

1. Adiciona o header `Authorization: Bearer <token>` em toda requisição
2. Trata erros 401 (redireciona para login)
3. É o único ponto de contato com a URL do backend

```js
// src/lib/apiClient.js
const BASE_URL = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    /* redirecionar para login */
  }
  return res.json();
}
```
