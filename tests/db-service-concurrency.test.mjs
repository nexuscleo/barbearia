import test from 'node:test';
import assert from 'node:assert/strict';

// Teste de lógica atômica em memória isolada
class IsolatedDatabaseStore {
  constructor() {
    this.slotLocks = new Set();
    this.appointments = [];
    this.transactionMutex = Promise.resolve();
  }

  async bookAppointmentAtomic(req) {
    return new Promise((resolve, reject) => {
      this.transactionMutex = this.transactionMutex.then(async () => {
        try {
          const lockKey = `${req.barbeiroId}_${req.data}_${req.horario}`;
          const isSlotLocked = this.slotLocks.has(lockKey);

          if (isSlotLocked) {
            const err = new Error(`CONFLITO DE CONCORRÊNCIA: Horário já reservado.`);
            err.statusCode = 409;
            err.code = 'SLOT_ALREADY_BOOKED';
            throw err;
          }

          this.slotLocks.add(lockKey);
          const apt = {
            id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ...req,
            slotLock: lockKey,
          };
          this.appointments.push(apt);
          resolve(apt);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

test('Transação Atômica: deve aceitar um agendamento com slot livre', async () => {
  const store = new IsolatedDatabaseStore();
  const req = {
    clienteId: 'cli-1',
    clienteNome: 'João Silva',
    barbeiroId: 'barber-1',
    servicoId: 'srv-1',
    data: '2026-10-01',
    horario: '10:00',
  };

  const apt = await store.bookAppointmentAtomic(req);
  assert.ok(apt.id);
  assert.equal(apt.slotLock, 'barber-1_2026-10-01_10:00');
});

test('Anti Double-Booking: duas requisições simultâneas devem resultar em exatamente 1 sucesso e 1 erro 409', async () => {
  const store = new IsolatedDatabaseStore();
  const reqA = {
    clienteId: 'cli-1',
    clienteNome: 'Cliente A',
    barbeiroId: 'barber-1',
    servicoId: 'srv-1',
    data: '2026-10-01',
    horario: '14:00',
  };
  const reqB = {
    clienteId: 'cli-2',
    clienteNome: 'Cliente B',
    barbeiroId: 'barber-1',
    servicoId: 'srv-1',
    data: '2026-10-01',
    horario: '14:00',
  };

  // Disparo simultâneo
  const [resA, resB] = await Promise.allSettled([
    store.bookAppointmentAtomic(reqA),
    store.bookAppointmentAtomic(reqB),
  ]);

  const fulfilled = [resA, resB].filter((r) => r.status === 'fulfilled');
  const rejected = [resA, resB].filter((r) => r.status === 'rejected');

  assert.equal(fulfilled.length, 1, 'Deve haver exatamente 1 agendamento aceito com sucesso');
  assert.equal(rejected.length, 1, 'Deve haver exatamente 1 agendamento rejeitado por conflito');

  const rejectedError = rejected[0].reason;
  assert.equal(rejectedError.statusCode, 409, 'Erro deve ter status HTTP 409');
  assert.equal(rejectedError.code, 'SLOT_ALREADY_BOOKED', 'Código deve ser SLOT_ALREADY_BOOKED');
});
