# Relatório de Migração — Backend / Frontend

## 1. Visão Geral da Arquitetura Atual

O projeto é um **SPA React (Vite)** que acessa o **Supabase diretamente do browser** via `supabaseClient.js`. Não existe camada de servidor própria — toda a lógica de negócio, validação, acesso a banco e notificações está espalhada em `src/services/`, `src/lib/` e `src/utils/`.

O Supabase já possui duas **Edge Functions** invocadas pelo frontend:
- `send-email` — disparo de e-mails transacionais
- `send-whatsapp` — envio de mensagens WhatsApp

---

## 2. Módulos e Funções que Devem Migrar para o Backend

### 2.1 Autenticação — `authService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `login` | Autentica via Supabase Auth, busca perfil na tabela `users` | Credenciais e sessão não devem ser gerenciadas no cliente |
| `register` | Cria usuário no Supabase Auth + insere perfil em `users` com retry | Criação de conta com validações de segurança |
| `getCurrentUser` | Busca sessão ativa + perfil completo | Verificação de sessão deve ser server-side |
| `updateUserProfile` | Atualiza dados do usuário, bloqueia alteração de `role` | Proteção de campos sensíveis (role) |
| `uploadProfilePhoto` | Faz upload para bucket `user_avatars`, atualiza URL no perfil | Acesso direto ao Storage deve ser mediado |
| `sendPasswordRecoveryEmail` | Dispara e-mail de recuperação via Supabase Auth | Operação sensível de autenticação |
| `resetPassword` | Redefine senha via `supabase.auth.updateUser` | Operação sensível de autenticação |
| `logout` | Encerra sessão | Invalidação de sessão server-side |

**Regras de negócio embutidas:**
- Senha deve ter mínimo 8 caracteres, letra maiúscula, minúscula, número e caractere especial (`validatePasswordStrength`)
- E-mail deve passar por regex de validação antes de qualquer operação
- Campo `role` nunca pode ser alterado via `updateUserProfile`
- Upload de foto aceita apenas `jpeg`, `png`, `webp`, `gif` com limite de 5MB

---

### 2.2 Reservas — `reservaService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `createReserva` | Cria reserva na tabela `reservas` com status inicial `pendente_documentos` | Criação de registro com regras de status e campos obrigatórios |
| `getUserReservas` | Lista reservas de um usuário com join em `cars` e `users` | Query com dados relacionais sensíveis |
| `getReservaById` | Busca reserva por ID com join em documentos | Acesso a dados completos da reserva |
| `updateReservaStatus` | Atualiza status da reserva | Mudança de status deve ser controlada |
| `cancelReserva` | Cancela reserva com motivo fixo "Cancelado pelo usuário" | Operação de escrita com regra de negócio |
| `listReservas` | Lista todas as reservas (admin) | Endpoint admin protegido |
| `calcularDataDevolucao` | Calcula data de devolução baseada no plano | Lógica de negócio pura |
| `calcularDuracao` | Calcula duração em dias por plano ou por datas | Lógica de negócio pura |
| `validarDatas` | Valida se datas são coerentes com o plano | Validação de entrada |

**Regras de negócio embutidas:**
- Status inicial de toda reserva criada pelo site é sempre `pendente_documentos`
- Planos fixos têm duração pré-definida: `semanal=7`, `trimestral=90`, `semestral=180`, `anual=365`
- Data de devolução deve ser posterior à data de retirada
- Para planos fixos, a data de devolução é calculada automaticamente (não informada pelo usuário)
- Campo `origem_frota` é sempre `'site'` para reservas criadas pelo frontend

---

### 2.3 Status de Reserva — `reservaStatusService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `confirmReserva` | Confirma reserva, grava histórico, dispara e-mail de confirmação | Fluxo transacional com múltiplas tabelas + notificação |
| `rejectReserva` | Cancela/recusa reserva, grava histórico, dispara e-mail de rejeição | Fluxo transacional com múltiplas tabelas + notificação |
| `deleteReserva` | Exclui reserva permanentemente | Operação destrutiva — deve ser exclusivamente admin |
| `getReservaHistorico` | Busca histórico de status de uma reserva | Dados de auditoria |

**Regras de negócio embutidas:**
- Motivo de cancelamento é obrigatório para rejeitar uma reserva
- Toda mudança de status grava um registro em `reserva_historico` com `status_anterior`, `status_novo`, `criado_por` e `tipo_acao`
- Ao confirmar, dispara `sendConfirmationEmail`
- Ao rejeitar, dispara `sendRejectionEmail`

---

### 2.4 Cálculo de Preço — `calculoPrecoService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `calcularPrecoReserva` | Busca preço do carro no banco e calcula total, diário, semanal e mensal | Lógica de precificação não deve ser exposta no cliente |
| `calculateWeeklyPrice` | Converte preço total em valor semanal por plano | Lógica de negócio pura |
| `calculateMonthlyPrice` | Converte preço total em valor mensal por plano | Lógica de negócio pura |

**Regras de negócio embutidas:**
- O nome da coluna de preço é determinado dinamicamente por `tipo_locacao` + `tipo_plano` + `km` (via `getColumnName`)
- Plano `diario`: `total = preco_diario * dias`
- Planos fixos (`semanal`, `trimestral`, `semestral`, `anual`, `franquia`): o preço total já está na coluna, sem multiplicação por dias
- Se o preço for R$ 0,00 ou a coluna não existir, retorna erro de "plano indisponível"

---

### 2.5 Precificação de Carros — `carPricingService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getColumnName` | Determina o nome da coluna de preço baseado em tipo, plano e km | Lógica de mapeamento de colunas dinâmicas |
| `getCarPricing` | Busca todos os preços de um carro e estrutura em objeto aninhado | Leitura de dados de precificação |
| `updateCarPricing` | Atualiza coluna de preço específica na tabela `cars` | Escrita de dados sensíveis (preços) |
| `getAllCarsPricing` | Busca todos os carros com estrutura de preços completa | Leitura admin |
| `deleteCarPricing` | Zera o preço de um plano específico | Operação de escrita admin |
| `createCarPricing` | Alias para `updateCarPricing` | Operação de escrita admin |

**Regras de negócio embutidas:**
- Estrutura de colunas de preço segue padrão: `{tipo}_{plano}_{km}` (ex: `particular_diario_60km`, `motorista_anual_6000`)
- Tipos de locação: `particular`, `motorista`, `corporativo`
- Planos particular: `diario` (60/100/120km), `semanal` (1500/2000/3000km), `franquia` (1500/2000/3000km), `trimestral`, `semestral`
- Planos motorista: `semanal` (1250/1500km), `trimestral` (2500/5000/6000km), `semestral` (2500/5000/6000km), `anual` (2500/5000/6000km), `franquia` (2500/5000/6000km)

---

### 2.6 Veículos — `carService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `fetchAllCars` | Lista carros disponíveis ou todos | Leitura pública (pode ser cache) |
| `fetchFeaturedCars` | Lista carros em destaque e disponíveis | Leitura pública |
| `fetchCarById` | Busca carro por ID | Leitura pública |
| `createCar` | Cria novo veículo na tabela `cars` | Operação admin — escrita |
| `updateCar` | Atualiza dados do veículo | Operação admin — escrita |
| `deleteCar` | Remove veículo | Operação admin — destrutiva |
| `updateCarAvailability` | Atualiza disponibilidade por tipo (`particular`/`motorista`) | Operação admin |
| `updateGeneralAvailability` | Atualiza disponibilidade geral | Operação admin |
| `fetchPriceHistory` | Busca histórico de preços com join em `cars` | Leitura admin |
| `updateCarPrice` | Atualiza `preco_diaria` e grava em `price_history` | Escrita com log de auditoria |

**Regras de negócio embutidas:**
- Campo `planos_km` sempre inicializado como array vazio se não informado
- Toda alteração de preço grava registro em `price_history` com `preco_anterior`, `preco_novo` e `data_alteracao`

---

### 2.7 Documentos — `documentoService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `uploadDocumento` | Faz upload de PDF para bucket `reserva-documentos` e retorna metadados | Upload de arquivo com validação |
| `salvarTodosDocumentos` | Salva/mescla array de documentos no campo JSONB `documentos` da tabela `reserva_documentos` | Escrita com lógica de merge |
| `getDocumentosReserva` | Busca documentos de uma reserva | Leitura de dados sensíveis |
| `deleteDocumento` | Remove documento do array JSONB por tipo | Escrita com lógica de filtro |

**Regras de negócio embutidas:**
- Apenas arquivos PDF são aceitos (validação por extensão + MIME type)
- Tamanho máximo: 10MB por arquivo
- Path no Storage: `reservas/{reservaId}/{tipoDocumento}/{timestamp}_{nomeArquivo}`
- Ao salvar múltiplos documentos, documentos do mesmo tipo são substituídos (merge por `tipo`)
- Tipos aceitos: `cnh`, `cpf`, `rg`, `comprovante_residencia`, `historico_criminal`

---

### 2.8 Usuários — `usuarioService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `carregarDadosUsuario` | Busca dados pessoais do usuário | Leitura de dados pessoais (PII) |
| `salvarDadosUsuario` | Atualiza dados pessoais, remove campos proibidos antes de salvar | Escrita com proteção de campos |
| `getUsuario` | Busca todos os dados do usuário | Leitura de dados sensíveis |

**Regras de negócio embutidas:**
- Campos `id`, `created_at`, `updated_at`, `is_sso_user`, `deleted_at` e `role` são removidos antes de qualquer update
- Valores `undefined` são removidos para não sobrescrever dados existentes com NULL

---

### 2.9 E-mail — `emailService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `sendReservationEmailToRental` | Envia alerta de nova reserva para a locadora | Notificação transacional |
| `sendConfirmationEmailToUser` | Envia confirmação de recebimento para o usuário | Notificação transacional com validação de e-mail |
| `sendConfirmationEmail` | Envia e-mail de confirmação de reserva aprovada | Notificação transacional |
| `sendRejectionEmail` | Envia e-mail de cancelamento/rejeição | Notificação transacional |
| `testEmail` | Envia e-mail de teste | Utilitário admin |

**Regras de negócio embutidas:**
- Todos os envios são delegados para a Edge Function `send-email` via `supabase.functions.invoke`
- E-mail é validado antes do envio (`isValidEmail`)
- Tipos de e-mail: `reservation_admin_alert`, `reservation_received`, `confirmation`, `rejection`, `test`

---

### 2.10 WhatsApp — `whatsappService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getWhatsAppNumber` | Busca número configurado em `admin_configs` | Leitura de configuração |
| `setWhatsAppNumber` | Salva número em `admin_configs` | Escrita de configuração admin |
| `validateWhatsAppNumber` | Valida formato do número (10-15 dígitos) | Validação de entrada |
| `sendConfirmationToUserWhatsApp` | Envia mensagem via Edge Function `send-whatsapp` | Notificação transacional |

---

### 2.11 Avaliações — `avaliacoesService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getAvaliacoes` | Lista avaliações ativas ordenadas | Leitura pública |
| `getAllAvaliacoesAdmin` | Lista todas as avaliações (admin) | Leitura admin |
| `createAvaliacao` | Cria nova avaliação | Escrita admin |
| `updateAvaliacao` | Atualiza avaliação | Escrita admin |
| `deleteAvaliacao` | Remove avaliação | Escrita admin destrutiva |
| `toggleAvaliacao` | Ativa/desativa avaliação | Escrita admin |
| `reorderAvaliacoes` | Reordena avaliações atualizando campo `ordem` | Escrita admin em loop |

---

### 2.12 Avaliação de Clientes — `clienteAvaliacaoService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getClienteAvaliacao` | Busca avaliação interna de um cliente | Leitura admin |
| `updateClienteAvaliacao` | Cria ou atualiza nota/observações do cliente, grava histórico | Escrita com log de auditoria |
| `getClienteAvaliacaoHistorico` | Busca histórico de avaliações do cliente | Leitura admin |
| `getClienteReservas` | Busca reservas do cliente com join em carros e documentos | Leitura admin com dados sensíveis |

**Regras de negócio embutidas:**
- Toda alteração de nota grava registro em `cliente_avaliacoes_historico` com valores anterior e novo
- Histórico registra `atualizado_por` (ID do admin)

---

### 2.13 Configurações — `configService.js` e `adminService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getConfig` | Busca configuração por chave em `configuracoes` ou fallback em `admin_configs` | Leitura com fallback duplo |
| `updateConfig` | Atualiza configuração via upsert | Escrita admin |
| `getWhatsAppNumber`, `getEmailSuporte`, etc. | Atalhos para configs específicas | Leitura de configurações |
| `getDashboardStats` | Conta totais de carros, usuários e reservas + últimas 5 reservas | Agregação de dados admin |
| `getAdminConfigs` | Busca todas as configs e transforma em mapa chave/valor | Leitura admin |
| `updateAdminConfig` | Atualiza ou insere config em `admin_configs` | Escrita admin |

---

### 2.14 Upload de Imagens — `imageService.js` e `fotosService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `uploadImage` | Valida, redimensiona (16:9) e faz upload para Storage | Upload com processamento de imagem |
| `resizeImage` | Redimensiona imagem para 1280x720 via Canvas API | Processamento de imagem (pode ser server-side) |
| `validateImage` | Valida tipo e tamanho do arquivo | Validação de entrada |
| `deleteImage` | Remove arquivo do Storage | Operação destrutiva no Storage |
| `uploadFoto` | Upload de foto de carro para bucket `cars` | Upload admin |
| `updateFotoPrincipal` | Atualiza `foto_principal` e `imagem_url` do carro | Escrita admin com sync de campo legado |
| `updateFotosGaleria` | Atualiza array `fotos_galeria` do carro | Escrita admin |
| `deleteFoto` | Remove foto do Storage extraindo path da URL | Operação destrutiva |

**Regras de negócio embutidas:**
- Imagens de carro são redimensionadas para 1280x720 (16:9) com crop centralizado
- Qualidade JPEG: 90%
- Tamanho máximo: 5MB para imagens de carro, 10MB para documentos
- Tipos aceitos para carro: `jpeg`, `png`, `webp`

---

### 2.15 Conteúdo e Seções — `conteudoService.js` e `secoesService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getAllConteudo` / `getConteudo` | Busca páginas de conteúdo por slug | Leitura de CMS |
| `updateConteudo` | Cria ou atualiza conteúdo de página | Escrita admin de CMS |
| `getSecao` / `getAllSecoes` | Busca seções da home | Leitura de CMS |
| `updateSecao` | Atualiza dados de uma seção | Escrita admin de CMS |
| `addCard` / `updateCard` / `deleteCard` | Gerencia cards dentro de uma seção (array JSONB) | Escrita admin com lógica de array |
| `reorderCards` | Reordena cards atualizando campo `ordem` | Escrita admin |

---

### 2.16 Templates de E-mail — `emailTemplateService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getTemplates` / `getTemplate` | Busca templates de e-mail | Leitura admin |
| `updateTemplate` | Atualiza assunto e corpo do template | Escrita admin |
| `renderTemplate` | Substitui variáveis `{{variavel}}` no corpo do template | Lógica de renderização — deve ser server-side |

---

### 2.17 Carros em Destaque — `carrosDestaqueService.js`

| Função | O que faz | Por que vai pro backend |
|---|---|---|
| `getCarrosDestaque` | Lista carros em destaque ativos com join em `cars` | Leitura pública |
| `getCarrosDisponiveis` | Lista carros disponíveis que não estão em destaque | Leitura admin |
| `addCarroDestaque` | Adiciona carro ao destaque com posição automática | Escrita admin com lógica de posição |
| `removeCarroDestaque` | Remove carro do destaque | Escrita admin |
| `reorderCarrosDestaque` | Reordena carros em destaque | Escrita admin em loop |

**Regras de negócio embutidas:**
- Não é possível adicionar um carro que já está em destaque
- Posição é calculada automaticamente como `max(posicao) + 1`

---

## 3. O que Pode Permanecer no Frontend

| Arquivo | Motivo |
|---|---|
| `validationUtils.js` (formatadores) | `formatCPF`, `formatPhone`, `formatCEP` são apenas máscaras de UI |
| `reservaValidation.js` | Validação de formulário local antes de submeter |
| `ReservaContext.jsx` | Estado de navegação multi-step do fluxo de reserva |
| `AuthContext.jsx` | Gerenciamento de estado de sessão no cliente (leitura do token JWT) |
| `dateUtils.js` | Formatação de datas para exibição |
| `imageService.js` → `resizeImage` | Pode ficar no frontend para preview antes do upload, mas o upload final deve passar pelo backend |

> **Atenção:** As funções de validação (`validateCPF`, `validatePhone`, `validateCEP`, `validatePDFFile`) devem existir **tanto no frontend** (UX) **quanto no backend** (segurança). Nunca confiar apenas na validação do cliente.

---

## 4. Tabelas do Banco de Dados Identificadas

| Tabela | Usada por |
|---|---|
| `users` | authService, usuarioService |
| `cars` | carService, carPricingService, calculoPrecoService, fotosService |
| `reservas` | reservaService, reservaStatusService, clienteAvaliacaoService |
| `reserva_documentos` | documentoService |
| `reserva_historico` | reservaStatusService |
| `car_prices` | precosService, precosCarroService |
| `price_history` | carService |
| `avaliacoes` | avaliacoesService |
| `cliente_avaliacoes` | clienteAvaliacaoService |
| `cliente_avaliacoes_historico` | clienteAvaliacaoService |
| `admin_configs` | adminService, whatsappService, configService |
| `configuracoes` | configService |
| `email_templates` | emailTemplateService |
| `paginas_conteudo` | conteudoService |
| `secoes_home` | secoesService |
| `carros_destaque` | carrosDestaqueService |
| `planos` | configService |

**Buckets do Storage:**
| Bucket | Usado por |
|---|---|
| `reserva-documentos` | documentoService |
| `user_avatars` | authService |
| `cars` | fotosService |
| `avaliacoes_fotos` | uploadService |

---

## 5. Edge Functions Existentes no Supabase

| Função | Invocada por | Tipos de payload |
|---|---|---|
| `send-email` | emailService | `reservation_admin_alert`, `reservation_received`, `confirmation`, `rejection`, `test` |
| `send-whatsapp` | whatsappService | `confirmation` |

---

## 6. Problemas e Riscos Identificados para a Migração

| # | Problema | Impacto | Recomendação |
|---|---|---|---|
| 1 | **Chave anon do Supabase exposta no frontend** | Alto — qualquer pessoa pode inspecionar e fazer queries diretas ao banco | Criar API própria (Node/Express ou Next.js API Routes) como proxy; nunca expor a service key |
| 2 | **Lógica de role/admin no cliente** | Alto — `isAdmin` é derivado do objeto de usuário no contexto React, facilmente manipulável | Validar role sempre no backend via JWT claims ou RLS policies |
| 3 | **`precosService.js` e `precosCarroService.js` duplicados** | Médio — dois serviços acessam a mesma tabela `car_prices` com lógicas ligeiramente diferentes | Unificar em um único módulo no backend |
| 4 | **`configService.js` com fallback duplo** (`configuracoes` → `admin_configs`) | Médio — duas tabelas com o mesmo propósito | Consolidar em uma única tabela no backend |
| 5 | **`reorderAvaliacoes` e `reorderCarrosDestaque` usam loop sequencial** | Baixo — N queries para N itens | Substituir por batch update ou stored procedure no backend |
| 6 | **`renderTemplate` no frontend** | Médio — templates de e-mail com variáveis sensíveis expostos | Mover renderização para o backend, junto ao envio |
| 7 | **`calcularPrecoReserva` faz query ao banco direto do browser** | Alto — lógica de precificação exposta e manipulável | Mover para endpoint de backend; frontend só recebe o preço calculado |
| 8 | **Dados PII (CPF, CNH, endereço) trafegam sem camada de proteção** | Alto — sem criptografia em trânsito adicional além do HTTPS do Supabase | Garantir que toda leitura/escrita de PII passe por endpoints autenticados no backend |

---

## 7. Sugestão de Estrutura do Backend

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js          # login, register, logout, resetPassword
│   │   ├── reservas.js      # CRUD de reservas + status
│   │   ├── cars.js          # CRUD de veículos + preços
│   │   ├── documentos.js    # upload e gestão de documentos
│   │   ├── usuarios.js      # perfil e dados pessoais
│   │   ├── admin/
│   │   │   ├── dashboard.js
│   │   │   ├── avaliacoes.js
│   │   │   ├── configuracoes.js
│   │   │   ├── conteudo.js
│   │   │   └── emails.js
│   ├── services/            # lógica de negócio (migrada de src/services)
│   ├── middlewares/
│   │   ├── auth.js          # verificação de JWT
│   │   └── adminOnly.js     # verificação de role admin
│   └── lib/
│       ├── supabaseAdmin.js # client com service_role key (nunca exposta)
│       └── validations.js   # validações server-side (CPF, e-mail, etc.)
```

---

## 8. Ordem Sugerida de Migração

1. **Autenticação** — base para tudo; criar endpoints de login/register/logout com JWT
2. **Usuários** — dados pessoais e perfil
3. **Veículos** — leitura pública de carros e precificação
4. **Cálculo de Preço** — mover para endpoint protegido
5. **Reservas** — criação e listagem
6. **Documentos** — upload mediado pelo backend
7. **Status de Reserva** — confirmação/rejeição com disparo de notificações
8. **Módulos Admin** — dashboard, avaliações, configurações, conteúdo, templates
9. **Notificações** — centralizar e-mail e WhatsApp no backend (remover dependência das Edge Functions diretas)
