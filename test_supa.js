const url = "https://igxqxrqdvfjrhssagize.supabase.co/rest/v1/saf_productos?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHF4cnFkdmZqcmhzc2FnaXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODQ5MTIsImV4cCI6MjA4ODA2MDkxMn0.h2A-45__Hq30AFrNIriawRk24MD1p71yvqn6tMlGOGY";

fetch(url, {
    method: 'GET',
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
}).then(r => r.json()).then(console.log).catch(console.error);
