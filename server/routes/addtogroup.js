const express = require('express');
const router = express.Router();
const { getSock } = require('./session');

// Limpia un número de teléfono dejando solo dígitos
function cleanPhoneNumber(phone) {
  let cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  return cleaned;
}

/**
 * Interpreta el valor de la columna "admin" del CSV.
 * Acepta: true / "true" / "1" / "yes" / "si" / "sí"  → true
 * Todo lo demás (false, "false", "0", "", "no", undefined, null) → false
 */
function parseAdminFlag(value) {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'si' || v === 'sí';
  }
  return false;
}

// ─── GET /api/groups ──────────────────────────────────────────────────────────
router.get('/groups', async (req, res) => {
  const sock = getSock();
  if (!sock) return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });

  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupList = Object.entries(groups).map(([id, meta]) => ({
      id,
      name: meta.subject || id,
      participantsCount: meta.participants?.length || 0,
    }));
    groupList.sort((a, b) => a.name.localeCompare(b.name));
    res.json(groupList);
  } catch (err) {
    console.error('Error obteniendo grupos:', err);
    res.status(500).json({ error: 'Error al obtener grupos', details: err.message });
  }
});

// ─── POST /api/add-to-group ───────────────────────────────────────────────────
/**
 * Body: {
 *   groupId  : string,
 *   phones   : Array<{ telefono: string, makeAdmin?: boolean }>,
 *   waitTime : number  (segundos, mínimo 25)
 * }
 *
 * Flujo por participante:
 *  1. groupParticipantsUpdate → 'add'
 *  2. Si éxito Y makeAdmin === true → groupParticipantsUpdate → 'promote'
 *  3. Reporta resultado con campo adminStatus
 */
router.post('/add-to-group', async (req, res) => {
  const { groupId, phones, waitTime } = req.body;

  if (!groupId || !Array.isArray(phones) || phones.length === 0) {
    return res.status(400).json({ error: 'Faltan parámetros: groupId y phones son requeridos' });
  }

  const sock = getSock();
  if (!sock) return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });

  const delay   = Math.max(Number(waitTime) || 25, 25) * 1000;
  const results = [];

  try {
    for (let i = 0; i < phones.length; i++) {
      const raw       = phones[i].telefono;
      const makeAdmin = parseAdminFlag(phones[i].makeAdmin);
      const cleaned   = cleanPhoneNumber(raw);
      const jid       = `${cleaned}@s.whatsapp.net`;

      console.log(`👥 [${i + 1}/${phones.length}] ${raw} | admin: ${makeAdmin ? 'SÍ' : 'no'}`);

      let status      = 'error';
      let reason      = '';
      let adminStatus = null; // null = columna no presente / no aplica

      try {
        // ── Paso 1: Agregar ────────────────────────────────────────────────
        const response = await sock.groupParticipantsUpdate(groupId, [jid], 'add');
        const result   = response?.[0];
        const code     = String(result?.status ?? '');

        if (code === '200') {
          status = 'agregado';
        } else if (code === '403') {
          status = 'error'; reason = 'Privacidad del usuario no permite ser agregado';
        } else if (code === '408') {
          status = 'error'; reason = 'Número no existe en WhatsApp';
        } else if (code === '409') {
          status = 'error'; reason = 'Ya es miembro del grupo';
        } else if (code === '401') {
          status = 'error'; reason = 'Sin permisos de admin para agregar';
        } else {
          status = 'error'; reason = `Código: ${code}`;
        }

        console.log(`  → agregar: ${status}${reason ? ' (' + reason + ')' : ''}`);

        // ── Paso 2: Promover a admin si aplica ─────────────────────────────
        if (makeAdmin) {
          if (status === 'agregado') {
            try {
              await sock.groupParticipantsUpdate(groupId, [jid], 'promote');
              adminStatus = 'promovido';
              console.log(`  → promovido a admin ✅`);
            } catch (promErr) {
              adminStatus = 'error_al_promover';
              console.warn(`  → fallo al promover: ${promErr.message}`);
            }
          } else {
            // No se pudo agregar → tampoco se puede promover
            adminStatus = 'no_agregado';
          }
        }

      } catch (addErr) {
        console.error(`  ❌ Excepción en ${raw}:`, addErr.message);
        status = 'error';
        reason = addErr.message;
        if (makeAdmin) adminStatus = 'no_agregado';
      }

      results.push({ telefono: raw, status, reason, makeAdmin, adminStatus });

      // ── Esperar entre participantes (menos el último) ────────────────────
      if (i < phones.length - 1) {
        console.log(`  ⏳ Esperando ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const added    = results.filter(r => r.status === 'agregado').length;
    const promoted = results.filter(r => r.adminStatus === 'promovido').length;
    const failed   = results.filter(r => r.status === 'error').length;

    console.log(`✅ Finalizado: ${added} agregados (${promoted} admins), ${failed} errores`);
    res.json({ success: true, results, totalAdded: added, totalPromoted: promoted, totalFailed: failed });

  } catch (err) {
    console.error('Error general en add-to-group:', err);
    res.status(500).json({ error: 'Error agregando participantes', details: err.message, results });
  }
});

module.exports = router;