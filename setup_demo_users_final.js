const https = require('https');

const projectId = 'igxqxrqdvfjrhssagize';
const accessToken = 'sbp_0d12a2d51d83e66fa9cd89d8c9c04f51edf6dc25';

async function getApiKeys() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.supabase.com',
            path: `/v1/projects/${projectId}/api-keys`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });

        req.on('error', reject);
        req.end();
    });
}

async function createUser(apiUrl, serviceRoleKey, email, password, fullName) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: 'admin' }
        });

        const options = {
            hostname: new URL(apiUrl).hostname,
            path: '/auth/v1/admin/users',
            method: 'POST',
            headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleRoleKey}`,
                'Content-Type': 'application/json'
            }
        };

        // Note: The above is for Admin API. Correct method is via supabase-js or direct auth/v1/admin/users
        // Wait, I'll just use the supabase-js library if possible, but for a standalone script, fetch is easier.
        // Actually, let's just use the URL provided in the API keys.
    });
}

// Simplified version using the tool if possible, but I'll stick to a clean script.
async function run() {
    try {
        console.log('Fetching API keys...');
        const keys = await getApiKeys();
        console.log('Keys Response:', JSON.stringify(keys, null, 2));

        // The response might be an array or an object with an array
        const keyList = Array.isArray(keys) ? keys : (keys.data || []);

        const serviceRoleKeyObj = keyList.find(k => k.name === 'service_role' || k.tags?.includes('service_role'));
        if (!serviceRoleKeyObj) throw new Error('Could not find service_role key');

        const serviceRoleKey = serviceRoleKeyObj.api_key;
        const apiUrl = `https://${projectId}.supabase.co`;

        console.log('API URL:', apiUrl);
        console.log('Creating users...');

        for (let i = 1; i <= 5; i++) {
            const email = `test${i}@sergensaf.com`;
            const fullName = `Directivo ${i}`;
            const password = 'Test1234!';

            const body = JSON.stringify({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName, role: 'admin' }
            });

            const res = await new Promise((resolve) => {
                const req = https.request({
                    hostname: new URL(apiUrl).hostname,
                    path: '/auth/v1/admin/users',
                    method: 'POST',
                    headers: {
                        'apikey': serviceRoleKey,
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json'
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, data }));
                });
                req.on('error', (e) => resolve({ status: 500, error: e.message }));
                req.write(body);
                req.end();
            });

            console.log(`User ${email}:`, res.status, res.data);

            // Also ensure profile exists (optional if trigger exists, but let's be safe)
            // But we don't have the user ID yet without parsing res.data
            if (res.status === 201) {
                const userData = JSON.parse(res.data);
                const profileBody = JSON.stringify({
                    id: userData.id,
                    email: email,
                    full_name: fullName,
                    role: 'admin'
                });

                await new Promise((resolve) => {
                    const req = https.request({
                        hostname: new URL(apiUrl).hostname,
                        path: '/rest/v1/profiles',
                        method: 'POST',
                        headers: {
                            'apikey': serviceRoleKey,
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'resolution=merge-duplicates'
                        }
                    }, (res) => resolve());
                    req.write(profileBody);
                    req.end();
                });
            }
        }
        console.log('Done!');
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
