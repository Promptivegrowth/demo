const https = require('https');

const PROJECT_REF = 'igxqxrqdvfjrhssagize';
const ACCESS_TOKEN = 'sbp_8ba5503dae0a9435e5d53621cbc5eff806dcb083';

const sql = `
-- 1. Tabla de log de asistencia
CREATE TABLE IF NOT EXISTS saf_asistencia_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID REFERENCES saf_empleados(id),
    fecha DATE DEFAULT CURRENT_DATE,
    hora_entrada TIME,
    hora_salida TIME,
    tardanza_minutos INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'presente',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Campo de documentos para Legajo
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saf_empleados' AND column_name='documentos') THEN
        ALTER TABLE saf_empleados ADD COLUMN documentos JSONB DEFAULT '[]';
    END IF;
END $$;

-- 3. Permisos
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
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
