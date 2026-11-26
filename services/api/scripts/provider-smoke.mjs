const timeout = AbortSignal.timeout(10_000);
const checks = [
  ['Open-Meteo', 'https://api.open-meteo.com/v1/forecast?latitude=31.6295&longitude=-7.9811&current=temperature_2m&forecast_days=1', (body) => Boolean(body.current?.temperature_2m !== undefined)],
  ['Nominatim', 'https://nominatim.openstreetmap.org/search?q=Marrakech%2C%20Morocco&format=jsonv2&limit=1', (body) => Array.isArray(body) && body.length > 0],
];
let failed = false;
for (const [name, url, validate] of checks) {
  try {
    const headers = { Accept: 'application/json' };
    if (name === 'Nominatim') headers['User-Agent'] = 'IRIFE-provider-smoke/0.1 (contact: support@irife.ma)';
    const response = await fetch(url, { headers, signal: timeout });
    const body = await response.json();
    const valid = response.ok && validate(body);
    process.stdout.write(`${valid ? 'PASS' : 'FAIL'} ${name} (HTTP ${response.status})\\n`);
    if (!valid) failed = true;
  } catch (error) {
    process.stdout.write(`FAIL ${name}: ${error instanceof Error ? error.message : 'unknown error'}\\n`);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
