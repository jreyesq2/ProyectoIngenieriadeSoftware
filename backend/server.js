const express = require('express');
const cors = require('cors');
const app = express();
// Disable the X-Powered-By header to avoid disclosing Express version
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

// Configuración de CORS actualizada: Se agregaron los puertos 5500 de Live Server
const allowedOrigins = new Set(
    (process.env.ALLOWED_ORIGINS || 'http://localhost:4200,http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)
);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: Origin not allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

let marbetes = [
    { placa: "P123ABC", tipo: "Estudiante", estado: "Activo", fechaEmision: "2026-05-01", fechaCaducidad: "2026-11-01" },
    { placa: "P456XYZ", tipo: "Catedrático", estado: "Inactivo", fechaEmision: "2025-05-01", fechaCaducidad: "2025-11-01" }
];

// REQUERIMIENTO: Consulta de Marbete por Placa
app.get('/api/marbetes/:placa', (req, res) => {
    // .trim() borra los espacios fantasma al inicio o al final
    const placaBuscar = req.params.placa.trim().toUpperCase(); 
    const marbete = marbetes.find(m => m.placa === placaBuscar);

    if (marbete) {
        return res.json({ success: true, data: marbete });
    } else {
        return res.status(404).json({ success: false, message: "Marbete no encontrado para la placa ingresada." });
    }
});

app.post('/api/marbetes/pago', (req, res) => {
    const { placa, tipo } = req.body;
    
    if (!placa || !tipo) {
        return res.status(400).json({ success: false, message: "Datos incompletos." });
    }

    const nuevoMarbete = {
        placa: placa.toUpperCase(),
        tipo: tipo,
        estado: "Activo",
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaCaducidad: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0] // 6 meses de vigencia
    };

    marbetes.push(nuevoMarbete);
    res.status(201).json({ success: true, message: "Pago procesado y marbete generado.", data: nuevoMarbete });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});