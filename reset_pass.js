const https = require('https');

const project_ref = 'igxqxrqdvfjrhssagize';
const sbp_token = 'sbp_0d12a2d51d83e66fa9cd89d8c9c04f51edf6dc25';
const new_password = 'SergensafAdmin2026!';

const data = JSON.stringify({ password: new_password });

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${project_ref}/database/password`,
    method: 'PUT',
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
        if (res.statusCode === 201 || res.statusCode === 200 || res.statusCode === 204) {
            console.log('PASSWORD_RESET_SUCCESSFUL');
            console.log('NEW_PASS:', new_password);
        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(data);
req.end();
