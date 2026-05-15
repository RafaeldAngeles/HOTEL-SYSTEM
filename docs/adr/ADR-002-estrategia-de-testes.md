# ADR-002: Estratégia de Testes

- **Status:** Aceito
- **Data:** 2026-05-15

## Contexto

O projeto precisava de uma estratégia de testes que garantisse confiança no código sem se tornar frágil ou difícil de manter. As questões centrais eram:

- Como testar a lógica de negócio isoladamente do banco de dados?
- Como garantir que os endpoints HTTP se comportam corretamente de ponta a ponta, incluindo guards, validação e regras de acesso?
- Como evitar que testes passem em ambiente local mas falhem em produção por divergência entre mock e banco real?

## Decisão

A estratégia adota duas camadas de teste com propósitos distintos, usando configurações e ferramentas separadas.

### Camada 1 — Unit Tests (`.spec.ts`)

**Onde ficam:** ao lado dos arquivos de produção (`src/**/*.spec.ts`)

**O que testam:** a lógica interna de cada service isoladamente

**Como funcionam:** o repositório é substituído por um mock com `jest.fn()`. O NestJS cria um módulo mínimo de teste que injeta o mock no lugar da implementação real:

```typescript
const mockRoomRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAllPaginated: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    RoomService,
    { provide: 'IRoomRepository', useValue: mockRoomRepository },
  ],
}).compile();
```

**O que cada teste verifica:** se o service chama o repositório com os argumentos corretos e retorna o valor esperado. Não há banco de dados, não há HTTP.

**Padrão adotado:** Arrange / Act / Assert explícito dentro de cada `it`.

---

### Camada 2 — Integration/E2E Tests (`.e2e-spec.ts`)

**Onde ficam:** `test/<módulo>/<módulo>.e2e-spec.ts`

**O que testam:** o comportamento real dos endpoints HTTP — validação do body, guards de autenticação, regras de autorização, lógica de negócio com banco de dados real

**Como funcionam:** sobem a aplicação NestJS completa (`AppModule`) com o banco de teste (`hotel_system_test`). As requisições são feitas via `supertest` diretamente contra o servidor:

```typescript
const res = await request(app.getHttpServer())
  .post('/reservation/reservation-create')
  .set('Authorization', `Bearer ${token}`)
  .send({ room_id: 1, start_date: '2026-06-01', end_date: '2026-06-05' })
  .expect(201);
```

**Isolamento entre testes:** antes de cada `it`, o `clearDatabase` limpa todas as tabelas usando `FOREIGN_KEY_CHECKS = 0` para contornar constraints de FK. Cada teste parte de um banco vazio e cria apenas os dados que precisa.

**Banco de dados de teste:** definido em `test/setup.ts` via variável de ambiente:
```typescript
process.env.DB_DATABASE = 'hotel_system_test';
```
O throttler é desabilitado automaticamente quando `NODE_ENV === 'test'`.

**Configuração separada:** `test/jest-e2e.json` define timeout de 30s e o regex `test/.*\.e2e-spec\.ts$` para não misturar com os unit tests.

---

### O que cada camada cobre

| Aspecto                        | Unit Test | E2E Test |
|-------------------------------|-----------|----------|
| Lógica interna do service      | ✅        | ✅ (indireto) |
| Validação de DTOs (class-validator) | ❌   | ✅        |
| JWT e autenticação             | ❌        | ✅        |
| Controle de roles (403/401)    | ❌        | ✅        |
| Regras de negócio (conflito de datas, etc.) | ✅ | ✅ |
| Queries reais no banco         | ❌        | ✅        |
| Isolamento de dados por usuário | ❌       | ✅        |

### Comandos

```bash
npm run test          # unit tests
npm run test:cov      # unit tests com cobertura
npm run test:e2e      # integration tests
```

## Consequências

**Positivas:**
- Unit tests são rápidos e cobrem a lógica de negócio sem depender de infraestrutura
- E2E tests com banco real eliminam a possibilidade de mocks mascararem bugs de query ou constraint
- O isolamento por `clearDatabase` garante que a ordem de execução dos testes não importa
- A separação de banco (`hotel_system_test`) protege dados de desenvolvimento

**Negativas:**
- E2E tests são mais lentos (sobem a app + fazem queries reais)
- É necessário ter o banco de teste criado e acessível antes de rodar os e2e
- O `clearDatabase` com `FOREIGN_KEY_CHECKS = 0` é uma abordagem agressiva — num banco com muitas entidades pode ser lento; preferível a truncar tabela a tabela na ordem certa das FKs
