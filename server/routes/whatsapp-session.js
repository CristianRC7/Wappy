const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { isSessionActive, sessionExistsInMemory } = require('./session');

// Eliminar sesión de WhatsApp (base de datos y archivos)
router.delete('/whatsapp-session/:grupoId', async (req, res) => {
  try {
    const { grupoId } = req.params;

    if (!grupoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Grupo ID es requerido' 
      });
    }

    // Eliminar de la base de datos
    const deleteQuery = 'DELETE FROM whatsapp_sesion WHERE grupo_id = $1';
    await pool.query(deleteQuery, [grupoId]);

    // Eliminar carpeta de autenticación
    const authDir = path.join(__dirname, '../auth_info', grupoId.toString());
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
    }

    res.json({
      success: true,
      message: 'Sesión de WhatsApp eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar la sesión' 
    });
  }
});

// Verificar estado de sesión
router.get('/whatsapp-session/status/:grupoId', async (req, res) => {
  try {
    const { grupoId } = req.params;

    if (!grupoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Grupo ID es requerido' 
      });
    }

    // Verificar el estado real de la sesión en memoria
    const activeInMemory = isSessionActive(grupoId);
    const existsInMemory = sessionExistsInMemory(grupoId);

    // Verificar si existe la carpeta de autenticación
    const authDir = path.join(__dirname, '../auth_info', grupoId.toString());
    const folderExists = fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0;

    // Verificar si existe en la base de datos
    const query = 'SELECT * FROM whatsapp_sesion WHERE grupo_id = $1';
    const result = await pool.query(query, [grupoId]);

    // La sesión está activa si está activa en memoria O si existen los archivos de autenticación
    const hasSession = activeInMemory || (existsInMemory && folderExists) || folderExists;

    res.json({
      success: true,
      hasSession: hasSession,
      isActive: activeInMemory,
      sessionData: result.rows.length > 0 ? result.rows[0] : null
    });

  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar la sesión' 
    });
  }
});

module.exports = router;
