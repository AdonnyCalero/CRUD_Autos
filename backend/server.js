const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'autos_db',
    port: 3306
});

const provinciasValidas = ['A', 'B', 'C', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function validarPlaca(placa) {
    const letraInicial = placa.charAt(0).toUpperCase();
    if (!provinciasValidas.includes(letraInicial)) {
        return false;
    }
    const formatoAntiguo = /^[A-Z]{3}-\d{3}$/;
    const formatoNuevo = /^[A-Z]{3}-\d{4}$/;
    const formatoMoto = /^[A-Z]{2}-\d{4}[A-Z]$/;
    return formatoAntiguo.test(placa) || formatoNuevo.test(placa) || formatoMoto.test(placa);
}

function validarCorreo(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

app.get('/api/autos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM autos ORDER BY placa');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener autos' });
    }
});

app.get('/api/autos/:placa', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM autos WHERE placa = ?', [req.params.placa]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Auto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener auto' });
    }
});

app.post('/api/autos', async (req, res) => {
    const { placa, modelo, color, correo } = req.body;

    if (!placa || !modelo || !color || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!validarPlaca(placa)) {
        return res.status(400).json({ error: 'Placa inválida. La primera letra debe corresponder a una provincia válida de Ecuador. Formatos: ABC-123 (antiguo), AAA-1234 (nuevo), AA-1234A (moto)' });
    }

    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: 'Correo inválido' });
    }

    if (modelo.length > 50 || color.length > 30 || correo.length > 100) {
        return res.status(400).json({ error: 'Longitud de campos excedida' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO autos (placa, modelo, color, correo) VALUES (?, ?, ?, ?)',
            [placa.toUpperCase(), modelo, color, correo.toLowerCase()]
        );
        res.status(201).json({ id: result.insertId, placa, modelo, color, correo });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La placa ya existe' });
        }
        res.status(500).json({ error: 'Error al guardar auto' });
    }
});

app.put('/api/autos/:placa', async (req, res) => {
    const placaOriginal = req.params.placa;
    const { placa, modelo, color, correo } = req.body;

    if (!modelo || !color || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: 'Correo inválido' });
    }

    if (modelo.length > 50 || color.length > 30 || correo.length > 100) {
        return res.status(400).json({ error: 'Longitud de campos excedida' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE autos SET placa = ?, modelo = ?, color = ?, correo = ? WHERE placa = ?',
            [placa.toUpperCase(), modelo, color, correo.toLowerCase(), placaOriginal]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Auto no encontrado' });
        }

        res.json({ placa, modelo, color, correo });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar auto' });
    }
});

app.delete('/api/autos/:placa', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM autos WHERE placa = ?', [req.params.placa]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Auto no encontrado' });
        }

        res.json({ message: 'Auto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar auto' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
