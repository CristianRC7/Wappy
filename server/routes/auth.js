const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const crypto = require('crypto');

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    // Hash MD5 de la contraseña
    const hashedPassword = crypto.createHash('md5').update(contrasena).digest('hex');

    // Buscar usuario en la base de datos con su grupo
    const query = `
      SELECT u.id, u.nombre, u.apellido, u.email, u.usuario, u.telefono, u.role_id, r.nombre as rol,
             g.id as grupo_id, g.nombre as grupo_nombre, g.descripcion as grupo_descripcion
      FROM usuarios u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN grupo_usuario gu ON u.id = gu.usuario_id
      LEFT JOIN grupos g ON gu.grupo_id = g.id
      WHERE u.usuario = $1 AND u.contrasena = $2
    `;

    const result = await pool.query(query, [usuario, hashedPassword]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    const user = result.rows[0];

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        usuario: user.usuario,
        telefono: user.telefono,
        roleId: user.role_id,
        rol: user.rol,
        grupoId: user.grupo_id,
        grupoNombre: user.grupo_nombre,
        grupoDescripcion: user.grupo_descripcion
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

module.exports = router;
