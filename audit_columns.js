const https = require('https');

const PROJECT_REF = 'igxqxrqdvfjrhssagize';
const ACCESS_TOKEN = 'sbp_8ba5503dae0a9435e5d53621cbc5eff806dcb083';

const sql = `
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name LIKE 'saf_%'
ORDER BY table_name, ordinal_position;
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
