# CarPlanos - Documentação Completa

## Visão Geral

O módulo _CarPlanos_ implementa um sistema de precificação dinâmica para carros de locação, substituindo os campos de preço hardcoded do modelo cars por uma estrutura flexível e escalável.

## Conceitos Principais

### Tipos de Locação

- _particular_: Para pessoa física
- _motorista_: Para motoristas de aplicativo (Uber, 99, etc)
- _corporativo_: Para empresas e frotas corporativas

### Categorias de Plano

- _diario_: Plano diário (24 horas)
- _semanal_: Plano semanal (7 dias)
- _trimestral_: Plano trimestral (3 meses)
- _semestral_: Plano semestral (6 meses)
- _anual_: Plano anual (12 meses)

### Franquias de KM

- 0: KM livre (sem limite)
- 1000: Franquia de 1000 KM
- 2000: Franquia de 2000 KM
- 2500: Franquia de 2500 KM
- 5000: Franquia de 5000 KM
- Personalizável conforme necessidade

## Estrutura do Banco de Dados

### Tabela CarPlanos

| Campo       | Tipo     | Descrição                |
| ----------- | -------- | ------------------------ |
| id          | UUID     | Identificador único      |
| carro_id    | UUID     | FK para cars             |
| tipo        | String   | Tipo de locação          |
| categoria   | String   | Categoria do plano       |
| km_franquia | Int      | KM incluídos (0 = livre) |
| preco       | Decimal  | Preço do plano           |
| ativo       | Boolean  | Status do plano          |
| created_at  | DateTime | Data de criação          |
| updated_at  | DateTime | Data de atualização      |
| created_by  | String   | Usuário criador          |
| updated_by  | String   | Usuário atualizador      |

## Rotas da API

### Endpoints Públicos

#### GET /car-planos

Lista todos os planos com filtros opcionais.

_Query Parameters:_

- tipo (enum): particular, motorista, corporativo
- categoria (enum): diario, semanal, trimestral, semestral, anual
- carro_id (UUID): ID do carro
- km_franquia (int): Franquia de KM
- precoMin (number): Preço mínimo
- precoMax (number): Preço máximo
- ativo (boolean): Status ativo/inativo

_Exemplo de Resposta:_
json
{
"data": [
{
"id": "550e8400-e29b-41d4-a716-446655440001",
"carro_id": "550e8400-e29b-41d4-a716-446655440000",
"tipo": "particular",
"categoria": "diario",
"km_franquia": 1000,
"preco": 149.9,
"ativo": true,
"created_at": "2026-03-19T10:00:00.000Z",
"updated_at": "2026-03-19T10:00:00.000Z",
"created_by": "admin@email.com",
"updated_by": null,
"cars": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"nome": "Fiat Argo Drive 1.0",
"marca": "Fiat",
"modelo": "Argo",
"ano": 2024,
"foto_principal": "https://supabase.storage/fiat-argo.jpg",
"disponivel": true
}
}
],
"total": 1
}

#### GET /car-planos/estatisticas

Retorna métricas agregadas dos planos.

_Resposta:_
json
{
"data": {
"total": 150,
"ativos": 120,
"inativos": 30,
"por_tipo": {
"particular": 80,
"motorista": 50,
"corporativo": 20
},
"por_categoria": {
"diario": 60,
"semanal": 30,
"trimestral": 40,
"semestral": 20
},
"faixa_preco": {
"minimo": 89.9,
"maximo": 4999.9,
"media": 899.5
}
}
}

#### GET /car-planos/carro/:carroId

Lista planos de um carro específico, agrupados por tipo.

#### GET /car-planos/filter

Filtra planos por tipo e categoria (endpoint simplificado).

#### GET /car-planos/preco/:min/:max

Busca planos por faixa de preço.

_Exemplo:_ GET /car-planos/preco/100/500

#### GET /car-planos/:id

Busca um plano específico por ID.

### Endpoints Protegidos (Admin)

#### POST /car-planos

Cria um novo plano.

_Body:_
json
{
"carro_id": "550e8400-e29b-41d4-a716-446655440000",
"tipo": "particular",
"categoria": "diario",
"km_franquia": 1000,
"preco": 149.9,
"ativo": true
}

#### PATCH /car-planos/:id

Atualiza um plano existente.

_Body:_ (todos os campos opcionais)
json
{
"tipo": "motorista",
"preco": 199.9,
"ativo": true
}

#### PATCH /car-planos/:id/toggle

Ativa/desativa um plano.

_Body:_
json
{
"currentStatus": true
}

#### DELETE /car-planos/:id

Remove um plano permanentemente.

_Validação:_ Não permite remoção se houver reservas ativas para o carro.

## Autenticação e Autorização

Todos os endpoints de escrita (POST, PATCH, DELETE) requerem:

- _Autenticação_: JWT Bearer Token
- _Autorização_: Role Admin

## Implementação

### Passo 1: Aplicar Migration

bash

# Executar migration no banco de dados

npx prisma db execute --file=prisma/migrations/20250319200000_create_carplanos/migration.sql

# Marcar como aplicada

npx prisma migrate resolve --applied 20250319200000_create_carplanos

### Passo 2: Gerar Prisma Client

bash
npx prisma generate

### Passo 3: Remover Colunas Antigas (Opcional)

Após migrar os dados dos campos hardcoded para a nova tabela, aplique a migration de remoção:

bash
npx prisma db execute --file=prisma/migrations/20250319201000_remove_car_price_columns/migration.sql
npx prisma migrate resolve --applied 20250319201000_remove_car_price_columns

### Passo 4: Iniciar o Servidor

bash
npm run start:dev

## Exemplos de Uso

### Criar Múltiplos Planos para um Carro

typescript
// Diário Particular - KM Livre
POST /car-planos
{
"carro_id": "uuid-do-carro",
"tipo": "particular",
"categoria": "diario",
"km_franquia": 0,
"preco": 129.9
}

// Diário Particular - 1000km
POST /car-planos
{
"carro_id": "uuid-do-carro",
"tipo": "particular",
"categoria": "diario",
"km_franquia": 1000,
"preco": 99.9
}

// Mensal Motorista - 2500km
POST /car-planos
{
"carro_id": "uuid-do-carro",
"tipo": "motorista",
"categoria": "trimestral",
"km_franquia": 2500,
"preco": 1899.0
}

// Anual Corporativo - 5000km
POST /car-planos
{
"carro_id": "uuid-do-carro",
"tipo": "corporativo",
"categoria": "anual",
"km_franquia": 5000,
"preco": 4500.0
}

### Buscar Planos com Filtros

typescript
// Todos os planos diários
GET /car-planos?categoria=diario

// Planos motorista ativos entre R$ 100 e R$ 300
GET /car-planos?tipo=motorista&ativo=true&precoMin=100&precoMax=300

// Planos de um carro específico
GET /car-planos?carro_id=uuid-do-carro

// Planos com KM livre
GET /car-planos?km_franquia=0

## Auditoria

Todas as operações de escrita (create, update, remove, toggle) são automaticamente logadas na tabela alteracoes_log com:

- Nome da tabela
- Dados antes da alteração
- Dados após a alteração
- Timestamp
- Usuário que realizou a ação

## Arquitetura - #ignore to frontend

src/car-planos/
├── car-planos.controller.ts # Rotas e documentação Swagger
├── car-planos.service.ts # Lógica de negócios
├── car-planos.module.ts # Configuração do módulo
└── dto/
├── create-car-planos.dto.ts # Validações de criação
└── update-car-planos.dto.ts # Validações de atualização

## Vantagens do Novo Sistema

1. _Flexibilidade_: Crie quantos planos quiser por carro
2. _Manutenção_: Um único lugar para gerenciar preços
3. _Consultas_: Filtros avançados por tipo, categoria, KM, preço
4. _Estatísticas_: Métricas em tempo real
5. _Auditoria_: Rastreamento completo de alterações
6. _Validação_: Regras de negócio no serviço
7. _Performance_: Índices otimizados no banco de dados

## Troubleshooting

### Erro: "Property 'carPlanos' does not exist on type 'PrismaService'"

_Solução:_ Gerar o Prisma Client novamente
bash
npx prisma generate

### Erro: "Tabela CarPlanos não existe"

_Solução:_ Executar a migration
bash
npx prisma db execute --file=prisma/migrations/20250319200000_create_carplanos/migration.sql
npx prisma migrate resolve --applied 20250319200000_create_carplanos

### Erro: "Plano duplicado"

O sistema valida que não pode existir mais de um plano com o mesmo tipo, categoria e km_franquia para o mesmo carro.

## Próximos Passos

1. _Integração com Reservas_: Vincular reservas aos planos
2. _Histórico de Preços_: Registrar alterações de preço ao longo do tempo
3. _Promoções_: Adicionar campo de preço promocional
4. _Temporada_: Criar preços diferenciados por período do ano
