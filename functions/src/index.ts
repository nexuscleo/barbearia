import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface NovoAgendamentoInput {
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  barbeiroId: string;
  barbeiroNome: string;
  servicoId: string;
  servicoNome: string;
  preco: number;
  duracaoMinutos: number;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
}

/**
 * Cloud Function HTTPS Callable para validação estrita e criação atômica de agendamento.
 * Utiliza runTransaction no Firestore para garantir isolamento ACID.
 * Rejeita qualquer tentativa simultânea ou duplicada com erro HttpsError 'already-exists'.
 */
export const validarECriarAgendamento = functions.https.onCall(
  async (data: NovoAgendamentoInput, context) => {
    // 1. Verificação básica de autenticação (opcional dependendo de regras)
    const uid = context.auth?.uid || data.clienteId;
    if (!uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'O usuário deve estar autenticado para agendar um serviço.'
      );
    }

    const { barbeiroId, data: dataAgendamento, horario } = data;

    if (!barbeiroId || !dataAgendamento || !horario) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Dados incompletos: barbeiroId, data e horario são obrigatórios.'
      );
    }

    // Identificador único do slot de horário
    const slotLockId = `${barbeiroId}_${dataAgendamento}_${horario}`;
    const slotDocRef = db.collection('slots_ocupados').doc(slotLockId);
    const agendamentoDocRef = db.collection('agendamentos').doc();

    try {
      const resultado = await db.runTransaction(async (transaction) => {
        // Leitura obrigatória dentro da transação antes de qualquer escrita
        const slotSnapshot = await transaction.get(slotDocRef);

        if (slotSnapshot.exists) {
          throw new functions.https.HttpsError(
            'already-exists',
            `O barbeiro já possui um agendamento confirmado no dia ${dataAgendamento} às ${horario}.`
          );
        }

        const agora = admin.firestore.FieldValue.serverTimestamp();

        // 1. Bloqueia o slot de horário atomicamente
        transaction.set(slotDocRef, {
          barbeiroId,
          data: dataAgendamento,
          horario,
          clienteId: uid,
          agendamentoId: agendamentoDocRef.id,
          criadoEm: agora,
        });

        // 2. Cria o registro na coleção principal de agendamentos
        const novoAgendamento = {
          id: agendamentoDocRef.id,
          ...data,
          clienteId: uid,
          status: 'confirmado',
          slotLock: slotLockId,
          criadoEm: agora,
        };

        transaction.set(agendamentoDocRef, novoAgendamento);

        return novoAgendamento;
      });

      return {
        sucesso: true,
        mensagem: 'Agendamento confirmado com sucesso!',
        agendamento: resultado,
      };
    } catch (error: any) {
      console.error('Erro na transação de agendamento:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        'internal',
        'Não foi possível concluir o agendamento devido a uma falha na transação.'
      );
    }
  }
);
