const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all alerts from a group
router.get('/alerts/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const query = `
      SELECT 
        a.id, 
        a.titulo, 
        a.descripcion, 
        a.fecha_hora, 
        a.grupo_id,
        a.estado,
        a.created_at,
        u.nombre || ' ' || u.apellido as creado_por_nombre,
        COUNT(ad.id) as total_destinatarios,
        COUNT(CASE WHEN ad.enviado = true THEN 1 END) as enviados
      FROM alertas a
      LEFT JOIN usuarios u ON a.creado_por = u.id
      LEFT JOIN alerta_destinatarios ad ON a.id = ad.alerta_id
      WHERE a.grupo_id = $1
      GROUP BY a.id, u.nombre, u.apellido
      ORDER BY a.fecha_hora DESC
    `;

    const result = await pool.query(query, [groupId]);

    res.json({
      success: true,
      alerts: result.rows
    });

  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las alertas' 
    });
  }
});

// Get alerts for a specific user
router.get('/alerts/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        a.id, 
        a.titulo, 
        a.descripcion, 
        a.fecha_hora, 
        a.grupo_id,
        g.nombre as grupo_nombre,
        a.estado,
        ad.enviado,
        ad.fecha_envio,
        u.nombre || ' ' || u.apellido as creado_por_nombre
      FROM alerta_destinatarios ad
      INNER JOIN alertas a ON ad.alerta_id = a.id
      INNER JOIN grupos g ON a.grupo_id = g.id
      LEFT JOIN usuarios u ON a.creado_por = u.id
      WHERE ad.usuario_id = $1
      ORDER BY a.fecha_hora DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      alerts: result.rows
    });

  } catch (error) {
    console.error('Error getting user alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las alertas' 
    });
  }
});

// Get group users to select recipients
router.get('/alerts/group-users/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const query = `
      SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.email,
        u.telefono,
        r.nombre as rol
      FROM usuarios u
      INNER JOIN grupo_usuario gu ON u.id = gu.usuario_id
      INNER JOIN roles r ON u.role_id = r.id
      WHERE gu.grupo_id = $1
      ORDER BY u.nombre, u.apellido
    `;

    const result = await pool.query(query, [groupId]);

    res.json({
      success: true,
      users: result.rows
    });

  } catch (error) {
    console.error('Error getting group users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los usuarios' 
    });
  }
});

// Create new alert
router.post('/alerts', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { titulo, descripcion, fechaHora, grupoId, creadoPor, destinatarios } = req.body;

    if (!titulo || !descripcion || !fechaHora || !grupoId || !destinatarios || destinatarios.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos y debe haber al menos un destinatario' 
      });
    }

    await client.query('BEGIN');

    // Insert alert
    const insertAlert = `
      INSERT INTO alertas (titulo, descripcion, fecha_hora, grupo_id, creado_por, estado)
      VALUES ($1, $2, $3, $4, $5, 'pendiente')
      RETURNING id
    `;

    const alertResult = await client.query(insertAlert, [
      titulo, 
      descripcion, 
      fechaHora, 
      grupoId, 
      creadoPor
    ]);

    const alertId = alertResult.rows[0].id;

    // Insert recipients
    const insertRecipients = `
      INSERT INTO alerta_destinatarios (alerta_id, usuario_id, enviado)
      VALUES ($1, $2, false)
    `;

    for (const usuarioId of destinatarios) {
      await client.query(insertRecipients, [alertId, usuarioId]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Alerta creada correctamente',
      alertId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear la alerta' 
    });
  } finally {
    client.release();
  }
});

// Update alert status
router.put('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ 
        success: false, 
        message: 'El estado es requerido' 
      });
    }

    const query = 'UPDATE alertas SET estado = $1 WHERE id = $2';
    await pool.query(query, [estado, alertId]);

    res.json({
      success: true,
      message: 'Estado actualizado correctamente'
    });

  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar la alerta' 
    });
  }
});

// Mark alert as sent to a user
router.put('/alerts/:alertId/sent/:userId', async (req, res) => {
  try {
    const { alertId, userId } = req.params;

    const query = `
      UPDATE alerta_destinatarios 
      SET enviado = true, fecha_envio = CURRENT_TIMESTAMP
      WHERE alerta_id = $1 AND usuario_id = $2
    `;
    
    await pool.query(query, [alertId, userId]);

    res.json({
      success: true,
      message: 'Marcado como enviado'
    });

  } catch (error) {
    console.error('Error marking as sent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el estado' 
    });
  }
});

// Delete an alert
router.delete('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    const query = 'DELETE FROM alertas WHERE id = $1';
    await pool.query(query, [alertId]);

    res.json({
      success: true,
      message: 'Alerta eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar la alerta' 
    });
  }
});

// Get full alert details
router.get('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    const alertQuery = `
      SELECT 
        a.id, 
        a.titulo, 
        a.descripcion, 
        a.fecha_hora, 
        a.grupo_id,
        g.nombre as grupo_nombre,
        a.estado,
        a.created_at,
        u.nombre || ' ' || u.apellido as creado_por_nombre
      FROM alertas a
      INNER JOIN grupos g ON a.grupo_id = g.id
      LEFT JOIN usuarios u ON a.creado_por = u.id
      WHERE a.id = $1
    `;

    const recipientsQuery = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.telefono,
        ad.enviado,
        ad.fecha_envio
      FROM alerta_destinatarios ad
      INNER JOIN usuarios u ON ad.usuario_id = u.id
      WHERE ad.alerta_id = $1
      ORDER BY u.nombre, u.apellido
    `;

    const alertResult = await pool.query(alertQuery, [alertId]);
    const recipientsResult = await pool.query(recipientsQuery, [alertId]);

    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    res.json({
      success: true,
      alert: {
        ...alertResult.rows[0],
        recipients: recipientsResult.rows
      }
    });

  } catch (error) {
    console.error('Error getting alert details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener la alerta' 
    });
  }
});

module.exports = router;
