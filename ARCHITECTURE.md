# Decisões Arquiteturais e Estrutura Técnica (ADRs)

Este documento descreve as decisões de arquitetura e engenharia adotadas na **Barbearia Navalha D'Ouro**, em conformidade estrita com a **Diretriz Mestra de Desenvolvimento Web (auditoria.md)**.

---

## 1. Separação de Preocupações e Camadas

A aplicação adota separação estrita de responsabilidades:

$$\text{Domínio / Tipos} \quad \times \quad \text{Infraestrutura / Persistência} \quad \times \quad \text{Serviços HTTP} \quad \times \quad \text{Apresentação (UI)}$$

- **`src/types/`**: Contratos e entidades de domínio (`Appointment`, `Barber`, `ServiceItem`, `BookingRequest`).
- **`src/lib/`**: Motor de persistência e transações atômicas (`db-service.ts`), validações de esquema Zod (`validations/booking.ts`), erros tipados (`errors.ts`) e controle de taxa (`rate-limiter.ts`).
- **`src/services/`**: Camada cliente de API (`booking-api.ts`), desacoplando a interface visual de chamadas HTTP brutas.
- **`src/components/`**: Componentes atômicos e modulares, todos estritamente abaixo do limite de ~200 linhas (princípio da responsabilidade única - SRP).

---

## 2. Controle Estrito de Concorrência (Anti Double-Booking)

### Desafio de Negócio
Dois clientes clicando para reservar o mesmo profissional, data e horário no exato mesmo milissegundo.

### Solução Arquitetural
1. **Trava em Chave Única Composta (`slotLock`)**: 
   Chave derivada: `${barbeiroId}_${data}_${horario}`.
2. **Serialização por Mutex de Transação**: 
   No runtime Node.js, `dbService.bookAppointmentAtomic` enfileira a verificação e escrita em uma cadeia de promises atômica.
3. **Resolução de Conflito com HTTP 409**:
   Se a chave já existir em `slotLocks` ou na lista de agendamentos confirmados, a requisição concorrente é rejeitada imediatamente com `BookingConflictError` (`code: SLOT_ALREADY_BOOKED`), garantindo isolamento total sem sobrescrita.

---

## 3. Catálogo de Endpoints da API

### `GET /api/services`
- **Descrição:** Retorna a lista de serviços ativos da barbearia.
- **Resposta (200):** `{ success: true, services: ServiceItem[] }`

### `POST /api/services`
- **Descrição:** Cria um novo serviço no catálogo.
- **Body:** Validado via `serviceItemInputSchema` (Zod).
- **Resposta (201):** `{ success: true, service: ServiceItem }`

### `GET /api/barbers`
- **Query Params:** `barberId?`, `date?`
- **Descrição:** Retorna os barbeiros cadastrados e, caso informado `barberId` e `date`, computa os slots ocupados e livres.
- **Resposta (200):** `{ success: true, barbers: Barber[], allSlots?: string[], occupiedSlots?: string[] }`

### `GET /api/agendamentos`
- **Query Params:** `date?`, `barberId?`, `clientId?`
- **Resposta (200):** `{ success: true, appointments: Appointment[] }`

### `POST /api/agendamentos`
- **Rate Limit:** 20 requisições / minuto por IP.
- **Body:** `{ clienteId, clienteNome, clienteTelefone, clienteEmail, barbeiroId, servicoId, data, horario }`
- **Validação:** `bookingRequestSchema` com sanitização anti-XSS.
- **Resposta de Sucesso (201):** `{ success: true, appointment: Appointment }`
- **Resposta de Conflito (409):** `{ success: false, error: string, code: 'SLOT_ALREADY_BOOKED' }`

### `POST /api/simulate-concurrency`
- **Descrição:** Dispara 2 requisições paralelas exatas com `Promise.allSettled` contra a trava atômica.
- **Resposta (200):** Resumo comparativo detalhado comprovando 1 aceitação (201) e 1 rejeição (409).

---

## 4. Filosofia de Design e UI Anti-IA

- **Eliminação de AI Slop:** Sem fundos pretos genéricos saturados com bordas cinzas translúcidas ou gradientes flutuantes de roxo/azul.
- **Paleta Humanizada:** Tons profundos e quentes de carvão (`#0c0e12`), com toques sóbrios de âmbar nobre (`#d97706`).
- **Geometria Disciplinada:** Cantos moderados (`rounded-md` e `rounded-lg`) e tipografia com hierarquia editorial e forte contraste.
