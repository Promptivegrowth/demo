const https = require('https');

const PROJECT_REF = 'igxqxrqdvfjrhssagize';
const ACCESS_TOKEN = 'sbp_8ba5503dae0a9435e5d53621cbc5eff806dcb083';

const sql = `
-- 1. Limpiar datos previos de RRHH y Contabilidad para evitar duplicados
TRUNCATE saf_asistencia, saf_planilla_detalle, saf_planilla, saf_gastos_operativos RESTART IDENTITY CASCADE;

-- 2. Actualizar empleados existentes para que tengan fecha_ingreso real
UPDATE saf_empleados SET fecha_ingreso = '2022-01-15' WHERE nombres = 'Ximena';
UPDATE saf_empleados SET fecha_ingreso = '2023-06-20' WHERE nombres = 'Luis Alberto';
UPDATE saf_empleados SET fecha_ingreso = '2024-03-01' WHERE fecha_ingreso IS NULL;

-- 3. Inyectar Gastos Operativos (Marzo 2026 para el Dashboard)
INSERT INTO saf_gastos_operativos (fecha, categoria, descripcion, ruc_proveedor, proveedor, numero_comprobante, base_imponible, igv, importe_total, estado)
VALUES 
('2026-03-10', 'Combustible', 'Abastecimiento de flota - Grifo Primax', '20100010001', 'PRIMAX S.A.', 'F001-000543', 1200.00, 216.00, 1416.00, 'pagado'),
('2026-03-15', 'Mantenimiento', 'Cambio de aceite y filtros X3C-890', '20556677889', 'SOLUCIONES MECANICAS SAC', 'F002-000876', 450.00, 81.00, 531.00, 'pagado'),
('2026-03-20', 'Seguros', 'Pago SOAT renovación P5V-112', '20123456789', 'RIMAC SEGUROS', 'F005-000112', 280.00, 50.40, 330.40, 'pagado');

-- 4. Inyectar algunas ventas si faltan (para el Dashboard)
INSERT INTO saf_registro_ventas (fecha, cliente, ruc_cliente, tipo_comprobante, serie_comprobante, numero_comprobante, base_imponible, igv, importe_total, estado)
VALUES
('2026-03-05', 'CONSTRUCTORA ALPHA SAC', '20600000001', 'FACTURA', 'F001', '000123', 2500.00, 450.00, 2950.00, 'pagado'),
('2026-03-18', 'PROYECTOS LIMA EIRL', '20600000002', 'FACTURA', 'F001', '000124', 1800.00, 324.00, 2124.00, 'pendiente');

-- 5. Asegurar conductores
UPDATE saf_conductores SET nombres = 'Luis Alberto', apellidos = 'Perez' WHERE dni = '11223344';
`;

const postData = JSON.stringify({ query: sql });

const options = {
    hostname: 'api.supabase.com', port: 443,
    path: '/v1/projects/' + PROJECT_REF + '/database/query',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let rawData = ''; res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try { console.log(JSON.stringify(JSON.parse(rawData), null, 2)); } catch (e) { console.error(rawData); }
    });
});

req.on('error', (e) => { console.error(e.message); });
req.write(postData); req.end();
