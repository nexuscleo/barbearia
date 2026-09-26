import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

function sanitizeString(val) {
  return val.replace(/[<>]/g, '').trim();
}

const bookingRequestSchema = z.object({
  clienteId: z.string().min(1),
  clienteNome: z.string().min(2).max(100).transform(sanitizeString),
  clienteTelefone: z.string().min(8).max(20).transform(sanitizeString),
  clienteEmail: z.string().email().transform(sanitizeString),
  barbeiroId: z.string().min(1),
  servicoId: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horario: z.string().regex(/^\d{2}:\d{2}$/),
});

test('Validação de Esquema: aceita payload válido e higieniza tags script', () => {
  const payload = {
    clienteId: 'usr-123',
    clienteNome: 'Lucas <script>alert(1)</script>Silva',
    clienteTelefone: '(11) 98765-4321',
    clienteEmail: 'lucas@exemplo.com',
    barbeiroId: 'barber-1',
    servicoId: 'srv-1',
    data: '2026-10-10',
    horario: '15:00',
  };

  const result = bookingRequestSchema.safeParse(payload);
  assert.equal(result.success, true);
  assert.ok(!result.data.clienteNome.includes('<script>'));
  assert.ok(!result.data.clienteNome.includes('</script>'));
});

test('Validação de Esquema: rejeita e-mail inválido e data em formato incorreto', () => {
  const payloadInvalido = {
    clienteId: 'usr-123',
    clienteNome: 'Lucas',
    clienteTelefone: '(11) 98765-4321',
    clienteEmail: 'email-invalido-sem-arroba',
    barbeiroId: 'barber-1',
    servicoId: 'srv-1',
    data: '10/10/2026', // Formato incorreto (esperado YYYY-MM-DD)
    horario: '15:00',
  };

  const result = bookingRequestSchema.safeParse(payloadInvalido);
  assert.equal(result.success, false);
  const issues = result.error.issues.map((i) => i.path[0]);
  assert.ok(issues.includes('clienteEmail'));
  assert.ok(issues.includes('data'));
});
