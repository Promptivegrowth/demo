const https = require('https');

const project_ref = 'igxqxrqdvfjrhssagize';
const sbp_token = 'sbp_0d12a2d51d83e66fa9cd89d8c9c04f51edf6dc25';

const sql = `
-- USAR ESTO PARA RESETEAR Y REPARAR TODO EL ESQUEMA SERGENSAF
ALTER TABLE IF EXISTS saf_empleados ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '[]';

CREATE TABLE IF NOT EXISTS saf_conductores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    dni TEXT UNIQUE,
    licencia TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar tabla de asistencia y columnas
CREATE TABLE IF NOT EXISTS saf_asistencia_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID REFERENCES saf_empleados(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_entrada TIME,
    hora_salida TIME,
    estado TEXT,
    tardanza_minutos INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saf_asistencia_log' AND column_name='tardanza_minutos') THEN
    ALTER TABLE saf_asistencia_log ADD COLUMN tardanza_minutos INT DEFAULT 0;
  END IF;
END $$;

-- Asegurar tabla de mantenimientos
CREATE TABLE IF NOT EXISTS saf_mantenimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehiculo_id UUID REFERENCES saf_flota(id),
    fecha DATE DEFAULT CURRENT_DATE,
    tipo TEXT,
    descripcion TEXT,
    costo NUMERIC DEFAULT 0,
    estado TEXT DEFAULT 'en_proceso',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saf_mantenimientos ADD COLUMN IF NOT EXISTS costo_soles NUMERIC DEFAULT 0;
ALTER TABLE saf_mantenimientos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'en_proceso';

-- Asegurar tabla de viajes
CREATE TABLE IF NOT EXISTS saf_viajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehiculo_id UUID REFERENCES saf_flota(id),
    conductor_id UUID REFERENCES saf_conductores(id),
    destino TEXT,
    cliente TEXT,
    estado TEXT DEFAULT 'en_curso',
    fecha_inicio TIMESTAMPTZ DEFAULT now(),
    fecha_fin TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar tabla de GPS
CREATE TABLE IF NOT EXISTS saf_gps_ubicaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viaje_id UUID REFERENCES saf_viajes(id),
    latitud NUMERIC NOT NULL,
    longitud NUMERIC NOT NULL,
    velocidad_kmh NUMERIC DEFAULT 0,
    fecha_gps TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- POLIZAS RLS (LIBERAR PARA DEMO)
ALTER TABLE saf_empleados DISABLE ROW LEVEL SECURITY;
ALTER TABLE saf_asistencia_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE saf_viajes DISABLE ROW LEVEL SECURITY;
ALTER TABLE saf_mantenimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE saf_gps_ubicaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE saf_conductores DISABLE ROW LEVEL SECURITY;
ALTER TABLE saf_flota DISABLE ROW LEVEL SECURITY;
`;

const data = JSON.stringify({ query: sql });

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${project_ref}/database/query`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${sbp_token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
        console.log('Response:', body);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(data);
req.end();
