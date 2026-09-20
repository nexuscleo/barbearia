/**
 * Script de Teste Automatizado de Concorrência e Trava Atômica (Anti Double-Booking)
 * Simula 2 clientes disparando requisições simultâneas para o mesmo barbeiro, data e horário.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTest() {
  console.log('===============================================================');
  console.log('🔥 INICIANDO TESTE DE CONCORRÊNCIA ATÔMICA - BARBEARIA PREMIUM');
  console.log(`📡 Alvo: ${BASE_URL}/api/simulate-concurrency`);
  console.log('===============================================================\n');

  try {
    const response = await fetch(`${BASE_URL}/api/simulate-concurrency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-09-25',
        horario: '15:15',
        barbeiroId: 'barber-1',
        servicoId: 'srv-1',
      }),
    });

    if (!response.ok) {
      throw new Error(`Servidor respondeu com status ${response.status}`);
    }

    const data = await response.json();

    console.log(`⏱️ Tempo total da transação atômica: ${data.simulationTimeMs}ms`);
    console.log(`🎯 Slot disputado: ${data.targetSlot}\n`);

    console.log('--- Resumo das Requisições Paralelas ---');
    console.log(`[Cliente 1]: Status = ${data.cliente1.status} (HTTP ${data.cliente1.httpCode})`);
    console.log(`             Mensagem: ${data.cliente1.message}`);

    console.log(`[Cliente 2]: Status = ${data.cliente2.status} (HTTP ${data.cliente2.httpCode})`);
    console.log(`             Mensagem: ${data.cliente2.message}\n`);

    console.log('--- Veredito da Trava Atômica ---');
    if (data.lockStrictlyEnforced) {
      console.log('✅ SUCESSO ABSOLUTO: Trava atômica operou com perfeição!');
      console.log(`   ${data.verdict}`);
      process.exit(0);
    } else {
      console.error('❌ FALHA CRÍTICA: Houve colisão de horário ou ambos falharam.');
      console.error(`   ${data.verdict}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Erro durante a execução do teste:', err.message);
    process.exit(1);
  }
}

runTest();
