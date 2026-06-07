# Grand Venue Hotel System — API

Backend de gestão hoteleira construído em NestJS com foco em arquitetura limpa, segurança e observabilidade. O projeto cobre o ciclo completo: visitante consultando disponibilidade, hóspede fazendo reserva, pagamento, check-in/check-out e painel administrativo com KPIs e relatórios.

Mais do que um CRUD, é um exercício de aplicar boas práticas de engenharia: separação por domínio, repository pattern, guards globais, JWT com revogação, validação no boundary, migrations versionadas, testes em duas camadas e configuração por ambiente.

---

## Stack

- **Runtime:** Node.js 20 + TypeScript 5.7
- **Framework:** NestJS 11
- **Persistência:** MySQL 8 + TypeORM 0.3 (migrations)
- **Autenticação:** Passport + JWT (access + refresh com `jti` e blacklist)
- **Validação:** class-validator + class-transformer
- **Segurança:** Helmet, CORS, Throttler, bcrypt
- **Observabilidade:** Pino (structured logging) + Terminus (health check)
- **Documentação:** Swagger / OpenAPI em `/docs`
- **Testes:** Jest (unit) + Supertest (e2e)
- **Infra local:** Docker Compose

---

## Domínios e endpoints

A API expõe **27 rotas** distribuídas em 7 controllers. Todas as rotas autenticadas exigem `Authorization: Bearer <token>`; rotas marcadas como **Public** são acessíveis sem token.

### Auth — `/auth`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/login` | Public | Retorna `access_token` + `refresh_token` |
| POST | `/auth/refresh` | Public | Renova access via refresh token |
| POST | `/auth/logout` | JWT | Revoga ambos os tokens (blacklist por `jti`) |
| GET | `/auth/me` | JWT | Dados do usuário autenticado |
| POST | `/auth/forgot-password` | Public | Gera token de reset (15min) |
| POST | `/auth/reset-password` | Public | Aplica nova senha a partir do token |

### Users — `/user`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/user/cadastro` | Public | Cadastro de novo usuário |
| GET | `/user` | Admin | Lista usuários (paginado) |
| PATCH | `/user/:id` | JWT | Atualiza dados (admin ou próprio usuário) |

### Rooms — `/room`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/room` | Public | Lista quartos (paginado) |
| GET | `/room/available` | Public | Disponíveis por período (`checkIn`, `checkOut`, `guests`) |
| GET | `/room/:id` | Public | Detalhe do quarto |
| POST | `/room/create` | Admin | Cria quarto |
| PATCH | `/room/:id` | Admin | Atualiza quarto |
| PATCH | `/room/:id/status` | Admin | Altera status (`available`, `occupied`, `cleaning`, `maintenance`) |
| DELETE | `/room/:id` | Admin | Remove quarto |

### Reservations — `/reservation`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/reservation` | JWT | Cria reserva |
| GET | `/reservation` | Admin | Lista todas as reservas |
| GET | `/reservation/my` | JWT | Reservas do usuário autenticado |
| GET | `/reservation/stats/today` | Admin | KPIs do dia (check-ins, check-outs, pagamentos pendentes, ocupação) |
| GET | `/reservation/:id` | JWT | Detalhe (admin vê qualquer; guest só a própria) |
| PATCH | `/reservation/:id` | Admin | Edita reserva |
| DELETE | `/reservation/:id` | JWT | Cancela reserva (soft-delete: `status = cancelled`) |
| POST | `/reservation/:id/checkin` | Admin | Realiza check-in (quarto vira `occupied`) |
| POST | `/reservation/:id/checkout` | Admin | Realiza check-out (quarto vira `cleaning`) |

### Payments — `/payment`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/payment` | JWT | Processa pagamento (cartão aprovado mock; PIX/boleto pending) |
| GET | `/payment` | Admin | Lista todos os pagamentos |
| GET | `/payment/:bookingId` | JWT | Pagamento de uma reserva (admin ou owner) |
| PATCH | `/payment/:id/refund` | Admin | Estorna pagamento, cancela reserva e libera o quarto |
| GET | `/payment/pix/generate?bookingId=` | JWT | Gera código PIX EMV mock (válido por 30min) |

### Reports — `/reports`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/reports/dashboard` | Admin | KPIs + receita semanal + mapa de quartos + ações pendentes |
| GET | `/reports/revenue?from&to&groupBy` | Admin | Receita agregada por dia/semana/mês |
| GET | `/reports/occupancy?from&to` | Admin | Taxa de ocupação histórica |
| GET | `/reports/rooms/top?limit` | Admin | Top quartos por receita e reservas |

### Health — `/health`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/health` | Public | Health check (DB + memória) via Terminus |

A especificação completa com bodies e respostas está disponível em **Swagger** após subir a aplicação: <http://localhost:3000/docs>.

---

## Arquitetura

### Modularização por domínio

Cada domínio (`auth`, `user`, `room`, `reservation`, `payment`, `reports`) é um módulo NestJS independente com seu próprio controller, service, entidade, DTOs e repositório. Um módulo só expõe o que outros precisam consumir via `exports`.

```
src/
├── auth/         autenticação, JWT, blacklist, reset
├── user/         cadastro e gerenciamento de usuários
├── room/         quartos e disponibilidade
├── reservation/  reservas, check-in, KPIs
├── payment/      pagamentos, refund, PIX
├── reports/      relatórios e dashboard
├── common/       DTOs e interfaces compartilhadas
├── config/       validação de variáveis de ambiente
├── database/     conexão e migrations
└── health/       health check
```

### Repository pattern com interface injetada

Services nunca dependem do TypeORM diretamente. Em vez disso, dependem de uma interface registrada via token string:

```typescript
// No módulo
{ provide: 'IRoomRepository', useClass: RoomRepository }

// No service
@Inject('IRoomRepository')
private readonly repository: IRoomRepository
```

Resultado: unit tests substituem o repositório real por um mock sem nenhuma alteração no service. A interface também serve como contrato — trocar TypeORM por outro ORM exige apenas implementar a interface.

### Guards globais — seguro por padrão

`JwtAuthGuard`, `RolesGuard` e `ThrottlerGuard` são registrados globalmente via `APP_GUARD`. Toda rota é autenticada por padrão; para liberar, basta o decorator `@Public()`. Isso elimina a classe de bug em que se esquece de proteger um endpoint novo.

O controle de papéis é via decorator `@Roles(UserRole.Admin, UserRole.Guest)` com match exato e ownership check no service quando aplicável (ex.: admin acessa qualquer reserva; guest só a própria).

### JWT com blacklist por `jti`

Cada token (access e refresh) carrega um `jti` único (UUID v4). No logout, o `jti` é gravado na tabela `revoked_token` com o `expires_at` real do JWT. Ambas as strategies (`jwt` e `jwt-refresh`) consultam a blacklist antes de autorizar a requisição.

O endpoint de reset de senha usa um secret JWT dedicado (`JWT_RESET_SECRET`) e payload com `purpose: 'pwd_reset'` para evitar reuso cruzado de tokens.

`POST /auth/forgot-password` sempre responde `{ ok: true }` independente do email existir — anti-enumeração.

### Validação no boundary

`ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true`. Qualquer campo extra no body resulta em 400 e nenhum DTO vaza propriedade não declarada. `class-validator` é a única camada de validação de input — services confiam que o DTO já está saneado.

### Migrations versionadas

O projeto deixou de usar `synchronize: true`. Toda mudança de schema passa por migration TypeORM gerada via CLI e versionada no Git (`src/database/migrations/`). O comando `npm run migration:generate` faz o diff entre as entidades e o banco; `migration:run` aplica em ordem.

### Logging e throttling

- **Pino** com `pino-pretty` em dev e JSON estruturado em produção. O header `Authorization` é redigido automaticamente dos logs.
- **Throttler** com dois perfis: `default` (10 req/min) e `strict` (5 req/min). `/auth/login`, `/auth/refresh` e `/auth/reset-password` usam o perfil strict; `/auth/forgot-password` usa 3 req/min. Desabilitado quando `NODE_ENV=test`.

### Configuração validada no boot

`ConfigModule` global com validação por `class-validator` (`src/config/env.validation.ts`). Variáveis ausentes ou mal formatadas impedem a aplicação de subir — falha rápida, antes de qualquer requisição.

ADRs com o racional completo das decisões estão em [`docs/adr/`](./docs/adr/).

---

## Como rodar

### 1. Pré-requisitos

- Node.js 20+
- MySQL 8 acessível (local ou via Docker Compose)
- npm 10+

### 2. Instalação

```bash
git clone https://github.com/RafaeldAngeles/HOTEL-SYSTEM.git
cd HOTEL-SYSTEM
npm install
```

### 3. Variáveis de ambiente

Copie o `.env.example` e preencha:

```bash
cp .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=secret
DB_DATABASE=hotel_system

JWT_SECRET=<string aleatória forte>
JWT_REFRESH_SECRET=<outra string aleatória>
JWT_RESET_SECRET=<outra string aleatória>
JWT_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
JWT_RESET_EXPIRES=15m

PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

### 4. Banco de dados

Subir MySQL via Docker:

```bash
docker compose up -d db
```

Aplicar migrations:

```bash
npm run migration:run
```

### 5. Iniciar a API

```bash
npm run start:dev   # modo watch
# ou
npm run start       # modo padrão
```

A API sobe em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/docs`.

---

## Testes

A estratégia de testes usa duas camadas com propósitos distintos (detalhado no [ADR-002](./docs/adr/ADR-002-estrategia-de-testes.md)):

| Camada | Localização | Foco |
|---|---|---|
| **Unit** | `src/**/*.spec.ts` | Lógica do service com repositório mockado |
| **E2E** | `test/**/*.e2e-spec.ts` | Comportamento HTTP completo com banco real (`hotel_system_test`) |

```bash
npm run test          # unit
npm run test:cov      # unit com cobertura
npm run test:e2e      # integração end-to-end
```

Os e2e tests sobem o `AppModule` real, usam Supertest, e isolam cada teste via `clearDatabase` antes de cada `it`.

---

## Estrutura de pastas

```
.
├── docs/
│   └── adr/                         Architecture Decision Records
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── entities/                RevokedToken
│   │   ├── repositories/
│   │   ├── strategies/              RefreshTokenStrategy
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── user/
│   ├── room/
│   ├── reservation/
│   ├── payment/
│   ├── reports/
│   ├── common/
│   │   ├── dto/                     PaginationDto
│   │   ├── filters/                 AllExceptionsFilter
│   │   └── interfaces/              PaginatedResult
│   ├── config/                      env.validation
│   ├── database/
│   │   ├── migrations/
│   │   ├── data-source.ts
│   │   ├── database.module.ts
│   │   └── run-migrations.ts
│   ├── health/
│   ├── app.module.ts
│   └── main.ts
├── test/                            e2e tests
├── docker-compose.yml
├── dockerfile
├── .env.example
└── package.json
```

---

## Decisões intencionais

Algumas escolhas merecem destaque por divergirem do "padrão" de tutoriais:

- **Rotas em singular** (`/room`, `/reservation`, `/payment`) em vez do REST plural — mantida consistência com a base existente do projeto. Trade-off documentado e consciente.
- **Bodies em snake_case** (`room_id`, `start_date`, `guest_name`) — alinhado com o schema do banco, evita uma camada de mapeamento sem ganho real.
- **Repository pattern obrigatório** mesmo onde TypeORM bastaria — o custo de uma interface a mais é baixo; o ganho em testabilidade e flexibilidade compensa.
- **Forgot-password retorna sempre `{ ok: true }`** — anti-enumeração de emails. Em dev o token também volta no payload (configurável por `NODE_ENV`).

---

## Roadmap

- [x] Fase 1 — Hardening de infraestrutura (Helmet, throttler, logging, validation, migrations)
- [x] Fase 2 — Domínios completos (room, reservation, payment, reports) + JWT com blacklist
- [ ] Fase 3 — Frontend Next.js consumindo a API
- [ ] Provider de email real para reset de senha
- [ ] Webhook de gateway de pagamento substituindo o mock
- [ ] Cobertura de testes acima de 80% nos serviços críticos

---

## Licença

UNLICENSED — projeto de portfólio.
