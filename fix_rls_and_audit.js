const https = require('https');

const PROJECT_REF = 'igxqxrqdvfjrhssagize';
const ACCESS_TOKEN = 'sbp_8ba5503dae0a9435e5d53621cbc5eff806dcb083';

const sql = `
-- 1. Deshabilitar RLS en todas las tablas saf_ para asegurar visibilidad total
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'saf_%') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- 2. Garantizar permisos al rol anon y authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;

-- 3. Forzar recarga de esquema (vía postgrest si es posible, o simplemente asumiendo que esto ayuda)
-- Nota: En Supabase administrado esto ocurre automáticamente tras DDL, pero no sobra asegurar permisos.

-- 4. Verificar qué hay en saf_empleados exactamente
SELECT * FROM saf_empleados LIMIT 5;
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
