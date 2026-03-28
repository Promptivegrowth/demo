const project_ref = 'igxqxrqdvfjrhssagize';
const sbp_token = 'sbp_0d12a2d51d83e66fa9cd89d8c9c04f51edf6dc25';

const sql = `
-- 1. Tabla de Empleados (Asegurar campo documentos)
ALTER TABLE saf_empleados ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '[]';

-- 2. Tabla de Conductores
CREATE TABLE IF NOT EXISTS saf_conductores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    dni TEXT UNIQUE,
    licencia TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Asistencia
CREATE TABLE IF NOT EXISTS saf_asistencia_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID REFERENCES saf_empleados(id),
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    estado TEXT, -- presente | tardanza | falta
    tardanza_minutos INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar columna tardanza_minutos
DO $$ BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saf_asistencia_log' AND column_name='tardanza_minutos') THEN
    ALTER TABLE saf_asistencia_log ADD COLUMN tardanza_minutos INT DEFAULT 0;
  END IF;
END $$;

-- 4. Tabla de Mantenimientos
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

-- Asegurar columnas costo_soles y estado
ALTER TABLE saf_mantenimientos ADD COLUMN IF NOT EXISTS costo_soles NUMERIC DEFAULT 0;
ALTER TABLE saf_mantenimientos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'en_proceso';

-- 5. Tabla de Viajes / Despachos
CREATE TABLE IF NOT EXISTS saf_viajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehiculo_id UUID REFERENCES saf_flota(id),
    conductor_id UUID REFERENCES saf_conductores(id),
    destino TEXT,
    cliente TEXT,
    estado TEXT DEFAULT 'en_curso', -- en_curso | completado | cancelado
    fecha_inicio TIMESTAMPTZ DEFAULT now(),
    fecha_fin TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de GPS
CREATE TABLE IF NOT EXISTS saf_gps_ubicaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viaje_id UUID REFERENCES saf_viajes(id),
    latitud NUMERIC NOT NULL,
    longitud NUMERIC NOT NULL,
    velocidad_kmh NUMERIC DEFAULT 0,
    fecha_gps TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. RLS - Acceso público para demo
ALTER TABLE saf_asistencia_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE saf_viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saf_mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saf_gps_ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE saf_conductores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_access_policy" ON saf_asistencia_log;
CREATE POLICY "public_access_policy" ON saf_asistencia_log FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_access_policy" ON saf_viajes;
CREATE POLICY "public_access_policy" ON saf_viajes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_access_policy" ON saf_mantenimientos;
CREATE POLICY "public_access_policy" ON saf_mantenimientos FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_access_policy" ON saf_gps_ubicaciones;
CREATE POLICY "public_access_policy" ON saf_gps_ubicaciones FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_access_policy" ON saf_conductores;
CREATE POLICY "public_access_policy" ON saf_conductores FOR ALL USING (true) WITH CHECK (true);

-- 8. Insertar conductor de prueba
INSERT INTO saf_conductores (nombres, apellidos, dni, licencia)
VALUES ('Carlos Admin', 'Prueba', '00000000', 'PRO')
ON CONFLICT (dni) DO NOTHING;
`;

async function run() {
    console.log('Iniciando migración SQL...');
    const response = await fetch(`https://api.supabase.com/v1/projects/${project_ref}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sbp_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    const data = await response.json();
    console.log('Resultado:', JSON.stringify(data, null, 2));
}

run();
