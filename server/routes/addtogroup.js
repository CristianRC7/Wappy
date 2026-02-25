const express = require('express');
const router = express.Router();
const { getSock } = require('./session');

// Función para limpiar y validar números de teléfono (igual que en message.js)
function cleanPhoneNumber(phone) {
  let cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

// GET /api/groups - Retorna todos los grupos en los que participa el usuario
router.get('/groups', async (req, res) => {
  const sock = getSock();
  if (!sock) {
    return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });
  }
  try {
    const groups = await sock.groupFetchAllParticipating();
    // groups es un objeto { groupId: groupMetadata, ... }
    const groupList = Object.entries(groups).map(([id, meta]) => ({
      id,
      name: meta.subject || id,
      participantsCount: meta.participants?.length || 0,
    }));
    // Ordenar alfabéticamente por nombre
    groupList.sort((a, b) => a.name.localeCompare(b.name));
    res.json(groupList);
  } catch (err) {
    console.error('Error obteniendo grupos:', err);
    res.status(500).json({ error: 'Error al obtener grupos', details: err.message });
  }
});

// POST /api/add-to-group - Agrega participantes de a uno con delay
// Body: { groupId, phones: [{ telefono }], waitTime }
router.post('/add-to-group', async (req, res) => {
  const { groupId, phones, waitTime } = req.body;

  if (!groupId || !Array.isArray(phones) || phones.length === 0) {
    return res.status(400).json({ error: 'Faltan parámetros: groupId y phones son requeridos' });
  }

  const sock = getSock();
  if (!sock) {
    return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });
  }

  const delay = Math.max(Number(waitTime) || 25, 25) * 1000;
  const results = [];

  try {
    for (let i = 0; i < phones.length; i++) {
      const raw = phones[i].telefono;
      const cleaned = cleanPhoneNumber(raw);
      const jid = `${cleaned}@s.whatsapp.net`;

      console.log(`👥 Agregando ${i + 1}/${phones.length}: ${raw} (limpio: ${cleaned}) al grupo ${groupId}`);

      try {
        const response = await sock.groupParticipantsUpdate(groupId, [jid], 'add');
        // response es un array con { status, jid }
        // status '200' = éxito, '403' = privacidad, '408' = no en wssp, '409' = ya en el grupo, etc.
        const participantResult = response?.[0];
        const statusCode = String(participantResult?.status || '');

        let status = 'error';
        let reason = '';

        if (statusCode === '200') {
          status = 'agregado';
        } else if (statusCode === '403') {
          status = 'error';
          reason = 'Privacidad del usuario no permite ser agregado';
        } else if (statusCode === '408') {
          status = 'error';
          reason = 'Número no existe en WhatsApp';
        } else if (statusCode === '409') {
          status = 'error';
          reason = 'Ya es miembro del grupo';
        } else if (statusCode === '401') {
          status = 'error';
          reason = 'Sin permisos para agregar (no eres admin)';
        } else {
          status = 'error';
          reason = `Código: ${statusCode}`;
        }

        console.log(`  → Status ${statusCode}: ${status} ${reason ? '(' + reason + ')' : ''}`);
        results.push({ telefono: raw, status, reason });

      } catch (addErr) {
        console.error(`  ❌ Excepción agregando ${raw}:`, addErr.message);
        results.push({ telefono: raw, status: 'error', reason: addErr.message });
      }

      // Esperar entre participantes (excepto el último)
      if (i < phones.length - 1) {
        console.log(`  ⏳ Esperando ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const added = results.filter(r => r.status === 'agregado').length;
    const failed = results.filter(r => r.status === 'error').length;
    console.log(`✅ Finalizado: ${added} agregados, ${failed} errores`);

    res.json({ success: true, results, totalAdded: added, totalFailed: failed });

  } catch (err) {
    console.error('Error general en add-to-group:', err);
    res.status(500).json({ error: 'Error agregando participantes', details: err.message, results });
  }
});

module.exports = router;
