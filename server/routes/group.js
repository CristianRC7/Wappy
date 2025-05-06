const express = require('express');
const router = express.Router();
const { getSock } = require('./session');

// POST /create-groups
router.post('/create-groups', async (req, res) => {
  const { groupTitle, groupDesc, descEnabled, addAdmin, adminNumber, waitTime, csvFields, csvRows } = req.body;
  const sock = getSock();
  if (!sock) {
    return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });
  }
  const delay = Math.max(Number(waitTime) || 25, 25) * 1000;
  const results = [];
  try {
    for (const row of csvRows) {
      // Reemplazar etiquetas en el nombre y descripción
      let title = groupTitle;
      let desc = groupDesc;
      for (const field of csvFields) {
        const regex = new RegExp(`@${field}`, 'g');
        title = title.replace(regex, row[field] || '');
        if (descEnabled && desc) desc = desc.replace(regex, row[field] || '');
      }
      // Obtener los números de teléfono de la fila (asumimos que hay una columna 'telefono' o similar)
      let participants = [];
      for (const field of csvFields) {
        if (/tel|num|fono|cel/i.test(field)) {
          if (row[field]) participants.push(`${row[field]}@s.whatsapp.net`);
        }
      }
      // Agregar admin si corresponde
      if (addAdmin && adminNumber) {
        participants.push(`${adminNumber}@s.whatsapp.net`);
      }
      // Crear el grupo
      const group = await sock.groupCreate(title, participants);
      // Obtener el código de invitación
      let inviteCode = null;
      try {
        inviteCode = await sock.groupInviteCode(group.id);
      } catch (e) {
        inviteCode = null;
      }
      // Agregar descripción si corresponde
      if (descEnabled && desc) {
        await sock.groupUpdateDescription(group.id, desc);
      }
      // Hacer admin al número si corresponde
      if (addAdmin && adminNumber) {
        await sock.groupParticipantsUpdate(group.id, [`${adminNumber}@s.whatsapp.net`], 'promote');
      }
      results.push({ groupId: group.id, title, inviteCode });
      await new Promise(res => setTimeout(res, delay));
    }
    res.json({ success: true, groups: results });
  } catch (err) {
    res.status(500).json({ error: 'Error creando grupos', details: err.message });
  }
});

module.exports = router; 