const BASE = 'http://localhost:3000';
const PASSWORD = '123456';

const USERS = [
  { id: 1, correo: 'admin@zaint.com', rol: 'ADMINISTRADOR' },
  { id: 2, correo: 'ana.soporte@zaint.com', rol: 'SOPORTE_TECNICO' },
  { id: 3, correo: 'luis.insitu@zaint.com', rol: 'SOPORTE_INSITU' },
  { id: 4, correo: 'example@gmail.com', rol: 'CLIENTE_EMPRESA' },
  { id: 5, correo: 'maria.sucursal2@empresa1.com', rol: 'CLIENTE_SUCURSAL' },
  { id: 6, correo: 'jorge.sede1@empresa1.com', rol: 'CLIENTE_TRABAJADOR' },
];

const results = [];
let cookieJar = '';

async function req(method, path, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (cookieJar) headers['Cookie'] = cookieJar;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  const response = await fetch(BASE + path, opts);
  
  // Update cookie jar
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookieJar = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
  }
  
  const text = await response.text();
  try { return { status: response.status, data: JSON.parse(text) }; } 
  catch { return { status: response.status, data: text }; }
}

async function test(name, fn, expectError = false) {
  try {
    const res = await fn();
    const isError = res.status >= 400;
    const ok = expectError ? isError : !isError;
    results.push({ name, ok, status: res.status, data: res.data });
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
  }
}

async function login(user) {
  cookieJar = '';
  const res = await req('POST', '/auth/login', null, { correo: user.correo, password: PASSWORD });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${user.correo}: ${JSON.stringify(res.data)}`);
  }
  
  // Extract JWT from cookie
  const match = cookieJar.match(/jwt=([^;]+)/);
  if (!match) {
    throw new Error(`No JWT cookie found for ${user.correo}`);
  }
  return match[1];
}

async function runUserTests(user) {
  console.log(`\n===== Testing user: ${user.correo} (${user.rol}) =====`);
  const token = await login(user);
  
  // Public endpoints
  await test('GET /planes', () => req('GET', '/planes'));
  await test('GET /planes/1', () => req('GET', '/planes/1'));
  
  // Auth endpoints
  await test('POST /auth/logout', () => req('POST', '/auth/logout', token));
  
  // Profile
  await test('GET /usuario/perfil', () => req('GET', '/usuario/perfil', token));
  
  // Admin-only endpoints
  if (user.rol === 'ADMINISTRADOR') {
    await test('GET /usuario/list', () => req('GET', '/usuario/list', token));
    await test('GET /clientes', () => req('GET', '/clientes', token));
    await test('GET /sucursales', () => req('GET', '/sucursales', token));
    await test('GET /areas', () => req('GET', '/areas', token));
    await test('GET /equipos', () => req('GET', '/equipos', token));
    await test('GET /tickets', () => req('GET', '/tickets', token));
    await test('GET /hardware', () => req('GET', '/hardware', token));
    await test('GET /software', () => req('GET', '/software', token));
    await test('GET /planes/admin/list', () => req('GET', '/planes/admin/list', token));
    await test('GET /dashboards/admin', () => req('GET', '/dashboards/admin', token));
    await test('GET /chat/historial/1', () => req('GET', '/chat/historial/1', token));
  }
  
  // Support endpoints
  if (['SOPORTE_TECNICO', 'SOPORTE_INSITU', 'ADMINISTRADOR'].includes(user.rol)) {
    await test('GET /tickets', () => req('GET', '/tickets', token));
    await test('GET /hardware', () => req('GET', '/hardware', token));
    await test('GET /software', () => req('GET', '/software', token));
  }
  
  // Client endpoints
  if (user.rol.startsWith('CLIENTE')) {
    await test('GET /tickets/metrics', () => req('GET', '/tickets/metrics', token));
    await test('GET /tickets/mis-tickets', () => req('GET', '/tickets/mis-tickets', token));
    await test('POST /tickets', () => req('POST', '/tickets', token, { asunto: 'Test ' + Date.now(), detalle: 'Test', id_equipo: 1, es_software: false }));
  }
  
  // Verify token structure if available
  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const tokenFields = ['sub', 'role', 'iat', 'exp'];
      const missingFields = tokenFields.filter(f => !(f in decoded));
      if (missingFields.length > 0) {
        results.push({ name: 'JWT token fields', ok: false, error: `Missing fields: ${missingFields.join(', ')}` });
      } else {
        results.push({ name: 'JWT token fields', ok: true, data: { sub: decoded.sub, role: decoded.role } });
      }
    } catch (e) {
      results.push({ name: 'JWT token decode', ok: false, error: e.message });
    }
  }
}

async function run() {
  for (const user of USERS) {
    await runUserTests(user);
  }
  
  let pass = 0, fail = 0;
  results.forEach(r => {
    if (r.ok) pass++;
    else { fail++; console.log('FAIL:', r.name, r.error || JSON.stringify(r.data)); }
  });
  console.log(`\n===== FINAL RESULTS: ${pass} passed, ${fail} failed out of ${results.length} tests =====`);
  
  if (fail > 0) {
    process.exit(1);
  }
}

run();
