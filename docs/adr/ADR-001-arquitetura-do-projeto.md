# ADR-001: Arquitetura do Projeto

- **Status:** Aceito
- **Data:** 2026-05-15

## Contexto

O sistema de gerenciamento hoteleiro precisava de uma estrutura backend que fosse organizada, testável e com separação clara de responsabilidades. As principais questões a resolver eram:

- Como organizar o código para que domínios diferentes (usuário, quarto, reserva, autenticação) não se misturassem?
- Como proteger todos os endpoints de forma consistente sem repetir código em cada controller?
- Como desacoplar a lógica de negócio do ORM para facilitar testes e eventuais trocas de tecnologia?

## Decisão

### 1. NestJS com arquitetura modular por domínio

Cada domínio do sistema é um módulo NestJS independente:

```
src/
├── auth/         → autenticação e guardas de acesso
├── user/         → cadastro e gerenciamento de usuários
├── room/         → quartos do hotel
├── reservation/  → reservas
├── common/       → DTOs e interfaces compartilhadas
├── config/       → validação de variáveis de ambiente
├── database/     → conexão e migrações
└── health/       → endpoint de health check
```

Cada módulo encapsula seu próprio controller, service, entidade e repositório. Um módulo só expõe o que outros módulos precisam via `exports`.

### 2. Repository Pattern com interface de abstração

Os services nunca dependem diretamente do TypeORM. Em vez disso, dependem de uma interface (`IRoomRepository`, `IReservationRepository`) injetada via token string:

```typescript
// No módulo:
{ provide: 'IRoomRepository', useClass: RoomRepository }

// No service:
@Inject('IRoomRepository')
private readonly repository: IRoomRepository
```

Isso garante que os unit tests possam substituir a implementação real por um mock sem nenhuma alteração no service.

### 3. Guards globais registrados no AppModule

`JwtAuthGuard`, `RolesGuard` e `ThrottlerGuard` são registrados globalmente via `APP_GUARD`. Todos os endpoints são protegidos por padrão. Para tornar um endpoint público, usa-se o decorator `@Public()`.

O controle de papéis usa match exato: `requiredRoles.includes(user.role)`. Um usuário `Admin` não acessa rotas marcadas como `@Roles(UserRole.Guest)` e vice-versa.

### 4. MySQL + TypeORM

- Banco relacional escolhido pela natureza dos dados (reservas com FK para usuário e quarto)
- TypeORM como ORM pela integração nativa com NestJS e suporte a migrations
- `synchronize: true` apenas fora de produção; em produção as migrations controlam o schema

### 5. Infraestrutura transversal

- **Pino** para logging estruturado com redação automática do header `Authorization`
- **Throttler** com dois perfis: `default` (10 req/min) e `strict` (5 req/min), desabilitados em ambiente de teste
- **Helmet** e **CORS** configurados no bootstrap
- **ValidationPipe** global com `whitelist: true` e `forbidNonWhitelisted: true`
- **ConfigModule** com validação de schema de variáveis de ambiente no boot

## Consequências

**Positivas:**
- Cada domínio pode crescer de forma independente sem afetar os outros
- A injeção de interface torna os unit tests triviais — basta passar um mock
- Guards globais eliminam a possibilidade de esquecer de proteger um endpoint
- Logging e throttling funcionam automaticamente para qualquer nova rota

**Negativas:**
- O match exato de role significa que qualquer novo papel (`Manager`, por exemplo) exige revisar todos os decorators `@Roles` existentes
- `synchronize: true` em desenvolvimento pode mascarar problemas de migration que só aparecem em produção
