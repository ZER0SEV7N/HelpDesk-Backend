const BASE = 'http://localhost:3000';

const TOKENS = {
  ADMIN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTklTVFJBRE9SIiwiY2xpZW50ZUlkIjpudWxsLCJzdWN1cnNhbElkIjpudWxsLCJpYXQiOjE3ODcwOTUyMDEsImV4cCI6MTc4NzE4MTYwMX0.T9LLsnKWU7BC67JnUh8kcSrsMZRfsBqACwJl25qLlos',
  SOPORTE_TECNICO: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInJvbGUiOiJTT1BPUlRFX1RFQ05JQ08iLCJjbGllbnRlSWQiOm51bGwsInN1Y3Vyc2FsSWQiOm51bGwsImlhdCI6MTc4NzA5NTIyMSwiZXhwIjoxNzg3MTgxNjIxfQ.MPPl81MkZMcQIlinnPWJUOCMqXy8bNjgLEBHl06R-5M',
  SOPORTE_INSITU: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInJvbGUiOiJTT1BPUlRFX0lOU0lUVSIsImNsaWVudGVJZCI6bnVsbCwic3VjdXJzYWxJZCI6bnVsbCwiaWF0IjoxNzg3MDk1MjIyLCJleHAiOjE3ODcxODE2MjJ9.UldGoAal3VVYp1upoR7t-EYN5DJz0RA3bTdEvnyH2Is',
  CLIENTE_EMPRESA: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInJvbGUiOiJDTElFTlRFX0VNUFJFU0EiLCJjbGllbnRlSWQiOjEsInN1Y3Vyc2FsSWQiOjEsImlhdCI6MTc4NzA5NTIyMywiZXhwIjoxNzg3MTgxNjIzfQ.cLr5xRupzSTo16_irBKPpqNLIcNZXjYC21thG3u85xA',
  CLIENTE_SUCURSAL: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsInJvbGUiOiJDTElFTlRFX1NVQ1VSU0FMIiwiY2xpZW50ZUlkIjoxLCJzdWN1cnNhbElkIjoyLCJpYXQiOjE3ODcwOTUyMjQsImV4cCI6MTc4NzE4MTYyNH0.pFykPAgqFy8VevuY6ihZ-v_MTZ2Lr0lSaFdhy6F4CAk',
  CLIENTE_TRABAJADOR: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInJvbGUiOiJDTElFTlRFX1RSQUJBSkFET1IiLCJjbGllbnRlSWQiOjEsInN1Y3Vyc2FsSWQiOjEsImlhdCI6MTc4NzA5NTIyNCwiZXhwIjoxNzg3MTgxNjI0fQ.DIdNjkuV14lPwNdjb5dQqnxyfS2IMTshmmnR4UFYo6Q',
};

function req(method, path, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  return fetch(BASE + path, opts).then(r => r.text()).then(t => {
    try { return JSON.parse(t); } catch { return t; }
  });
}

const results = [];

async function test(name, fn, expectError = false) {
  try {
    const data = await fn();
    const isErrorObj = data && typeof data === 'object' && data.statusCode && data.statusCode >= 400;
    const isErrorStr = typeof data === 'string' && data.includes('"statusCode"');
    const ok = expectError ? (isErrorObj || isErrorStr) : !(isErrorObj || isErrorStr);
    results.push({ name, ok, data });
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
  }
}

async function run() {
  const ts = Date.now();

  // PUBLIC ENDPOINTS
  await test('GET /planes', () => req('GET', '/planes'));
  await test('GET /planes/1', () => req('GET', '/planes/1'));
  await test('GET /planes/admin/list (sin token)', () => req('GET', '/planes/admin/list'), true);
  await test('GET /', () => req('GET', '/'));

  // AUTH
  await test('POST /auth/login (admin)', () => req('POST', '/auth/login', null, { correo: 'admin@zaint.com', password: '123456' }));
  await test('POST /auth/login (credenciales malas)', () => req('POST', '/auth/login', null, { correo: 'admin@zaint.com', password: 'wrong' }), true);
  await test('POST /auth/register (sin token - admin requerido)', () => req('POST', '/auth/register', null, { nombre: 'Test', apellido: 'User', correo: 'test' + ts + '@test.com', telefono: '123456789', password: '123456' }), true);
  await test('POST /auth/register (admin)', () => req('POST', '/auth/register', TOKENS.ADMIN, { nombre: 'Test', apellido: 'User', correo: 'test' + ts + '@test.com', telefono: '123456789', password: '123456' }));
  await test('POST /auth/logout (admin)', () => req('POST', '/auth/logout', TOKENS.ADMIN));
  await test('POST /auth/verify-token (sin token)', () => req('POST', '/auth/verify-token', null, { token: TOKENS.ADMIN }));
  await test('POST /auth/recover-password (admin)', () => req('POST', '/auth/recover-password', null, { correo: 'admin@zaint.com' }));
  await test('POST /auth/reset-password (token invalido)', () => req('POST', '/auth/reset-password', null, { token: 'invalid', nuevaContraseña: 'newpass' }), true);

  // USUARIOS PERFIL
  await test('PATCH /usuario/perfil (admin - sin currentPassword)', () => req('PATCH', '/usuario/perfil', TOKENS.ADMIN, { nombre: 'Daniel' }), true);
  await test('PATCH /usuario/perfil (admin - con currentPassword)', () => req('PATCH', '/usuario/perfil', TOKENS.ADMIN, { currentPassword: '123456', nombre: 'Daniel Updated' }));
  await test('GET /usuario/perfil (admin)', () => req('GET', '/usuario/perfil', TOKENS.ADMIN));
  await test('GET /usuario/confirmar-correo (token invalido)', () => req('GET', '/usuario/confirmar-correo?correo=admin@zaint.com&token=test'), true);

  // USUARIOS ADMIN
  await test('GET /usuario/list (admin)', () => req('GET', '/usuario/list', TOKENS.ADMIN));
  await test('GET /usuario/list (soporte)', () => req('GET', '/usuario/list', TOKENS.SOPORTE_TECNICO));
  await test('POST /usuario/registrar-empleado (admin)', () => req('POST', '/usuario/registrar-empleado', TOKENS.ADMIN, {
    nombre: 'Nuevo', apellido: 'Empleado', correo: 'nuevo' + ts + '@test.com', telefono: '123456789', password: '123456', rolNombre: 'CLIENTE_TRABAJADOR', id_cliente: 1, id_sucursal: 1
  }));
  await test('POST /usuario/registrar-masivo (admin - sin archivo)', () => req('POST', '/usuario/registrar-masivo', TOKENS.ADMIN), true);
  await test('PATCH /usuario/2/rol (admin - cambiar rol de soporte)', () => req('PATCH', '/usuario/2/rol', TOKENS.ADMIN, { rolNombre: 'SOPORTE_TECNICO' }));
  await test('PATCH /usuario/2/desactivar (admin)', () => req('PATCH', '/usuario/2/desactivar', TOKENS.ADMIN));
  await test('PATCH /usuario/2/activar (admin)', () => req('PATCH', '/usuario/2/activar', TOKENS.ADMIN));
  await test('PATCH /usuario/4/reasignar (admin - cliente empresa)', () => req('PATCH', '/usuario/4/reasignar', TOKENS.ADMIN, { id_sucursal: 2 }));

  // CLIENTES
  await test('GET /clientes (admin)', () => req('GET', '/clientes', TOKENS.ADMIN));
  await test('GET /clientes/1 (admin)', () => req('GET', '/clientes/1', TOKENS.ADMIN));
  await test('POST /clientes (admin)', () => req('POST', '/clientes', TOKENS.ADMIN, {
    cliente: { tipo_cliente: 'JURIDICA', numero_documento: 'DOC' + ts, nombre_principal: 'Test Corp ' + ts, direccion: 'Test', telefono: '123', correo: 'test' + ts + '@test.com' },
    sucursal: { nombre_sucursal: 'Suc Test ' + ts, encargado: 'Test', telefono: '123', direccion: 'Test', correo: 'test' + ts + '@test.com' }
  }));
  await test('PATCH /clientes/1 (admin)', () => req('PATCH', '/clientes/1', TOKENS.ADMIN, { nombre_principal: 'Updated ' + ts }));
  await test('PATCH /clientes/contract/1 (admin)', () => req('PATCH', '/clientes/contract/1', TOKENS.ADMIN, { id_plan: 1, nuevaFechaInicio: '2026-01-01', nuevaFechaFin: '2027-01-01' }));
  await test('PATCH /clientes/1/desactivar (admin)', () => req('PATCH', '/clientes/1/desactivar', TOKENS.ADMIN));
  await test('PATCH /clientes/1/activar (admin)', () => req('PATCH', '/clientes/1/activar', TOKENS.ADMIN));

  // SUCURSALES
  await test('GET /sucursales (admin)', () => req('GET', '/sucursales', TOKENS.ADMIN));
  await test('GET /sucursales/1 (admin)', () => req('GET', '/sucursales/1', TOKENS.ADMIN));
  await test('GET /sucursales/cliente/1 (admin)', () => req('GET', '/sucursales/cliente/1', TOKENS.ADMIN));
  await test('POST /sucursales (admin)', () => req('POST', '/sucursales', TOKENS.ADMIN, { nombre_sucursal: 'Suc Test ' + ts, encargado: 'Test', telefono: '123', direccion: 'Test', correo: 'test' + ts + '@test.com', id_cliente: 1 }));
  await test('PATCH /sucursales/1 (admin)', () => req('PATCH', '/sucursales/1', TOKENS.ADMIN, { nombre_sucursal: 'Updated ' + ts }));
  await test('PATCH /sucursales/1/desactivar (admin)', () => req('PATCH', '/sucursales/1/desactivar', TOKENS.ADMIN));
  await test('PATCH /sucursales/1/activar (admin)', () => req('PATCH', '/sucursales/1/activar', TOKENS.ADMIN));

  // AREAS
  await test('GET /areas (admin)', () => req('GET', '/areas', TOKENS.ADMIN));
  await test('GET /areas/999 (admin - no existe)', () => req('GET', '/areas/999', TOKENS.ADMIN), true);
  await test('GET /areas/sucursal/1 (admin)', () => req('GET', '/areas/sucursal/1', TOKENS.ADMIN));
  await test('POST /areas (admin)', () => req('POST', '/areas', TOKENS.ADMIN, { nombre_area: 'Test Area ' + ts, contacto: 'Test', telefono: '123', correo: 'test' + ts + '@test.com', id_sucursal: 1 }));
  await test('PATCH /areas/1 (admin)', () => req('PATCH', '/areas/1', TOKENS.ADMIN, { nombre_area: 'Updated ' + ts }));
  await test('PATCH /areas/1/desactivar (admin)', () => req('PATCH', '/areas/1/desactivar', TOKENS.ADMIN));
  await test('PATCH /areas/1/activar (admin)', () => req('PATCH', '/areas/1/activar', TOKENS.ADMIN));

  // EQUIPOS
  await test('GET /equipos (admin)', () => req('GET', '/equipos', TOKENS.ADMIN));
  await test('GET /equipos/1 (admin)', () => req('GET', '/equipos/1', TOKENS.ADMIN));
  await test('POST /equipos (admin)', () => req('POST', '/equipos', TOKENS.ADMIN, { tipo: 'Desktop', marca: 'Test', numero_serie: 'SERIE-' + ts, id_cliente: 1, id_sucursal: 1 }));
  await test('PATCH /equipos/1 (admin)', () => req('PATCH', '/equipos/1', TOKENS.ADMIN, { tipo: 'Laptop' }));
  await test('DELETE /equipos/1 (admin)', () => req('DELETE', '/equipos/1', TOKENS.ADMIN));
  await test('PATCH /equipos/1/asignar (admin - eliminado)', () => req('PATCH', '/equipos/1/asignar', TOKENS.ADMIN, { id_trabajador: 6, area: 'Test' }), true);
  await test('PATCH /equipos/1/liberar (admin - eliminado)', () => req('PATCH', '/equipos/1/liberar', TOKENS.ADMIN), true);

  // HARDWARE
  await test('GET /hardware (soporte)', () => req('GET', '/hardware', TOKENS.SOPORTE_TECNICO));
  await test('GET /hardware/1 (soporte)', () => req('GET', '/hardware/1', TOKENS.SOPORTE_TECNICO));
  await test('POST /hardware (soporte)', () => req('POST', '/hardware', TOKENS.SOPORTE_TECNICO, { tipo_equipo: 'Test', numero_serie: 'HW-' + ts, fecha_compra: '2026-01-01', marca: 'Test', proveedor: 'Test', descripcion: 'Test' }));
  await test('PATCH /hardware/1 (soporte)', () => req('PATCH', '/hardware/1', TOKENS.SOPORTE_TECNICO, { tipo_equipo: 'Updated' }));
  await test('DELETE /hardware/1 (admin - ya inactivo)', () => req('DELETE', '/hardware/1', TOKENS.ADMIN), true);
  await test('POST /hardware/1/instalar (soporte - inactivo)', () => req('POST', '/hardware/1/instalar', TOKENS.SOPORTE_TECNICO, { id_equipo: 1, descripcion: 'Test', serie: 'TEST', proveedor: 'Test' }), true);

  // SOFTWARE
  await test('GET /software (soporte)', () => req('GET', '/software', TOKENS.SOPORTE_TECNICO));
  await test('GET /software/1 (soporte)', () => req('GET', '/software/1', TOKENS.SOPORTE_TECNICO));
  await test('POST /software (soporte)', () => req('POST', '/software', TOKENS.SOPORTE_TECNICO, { nombre_software: 'Test SW ' + ts, licencia: 'Test', correo: 'test' + ts + '@test.com', contraseña: 'test123', fecha_instalacion: '2026-01-01', fecha_caducidad: '2027-01-01', proveedor: 'Test' }));
  await test('PATCH /software/1 (soporte)', () => req('PATCH', '/software/1', TOKENS.SOPORTE_TECNICO, { nombre_software: 'Updated ' + ts }));
  await test('DELETE /software/1 (admin - ya inactivo)', () => req('DELETE', '/software/1', TOKENS.ADMIN), true);
  await test('POST /software/1/instalar (soporte - inactivo)', () => req('POST', '/software/1/instalar', TOKENS.SOPORTE_TECNICO, { id_equipo: 1, licencia_asignada: 'LIC-TEST', observaciones: 'Test' }), true);

  // PLANES
  await test('GET /planes/admin/list (admin)', () => req('GET', '/planes/admin/list', TOKENS.ADMIN));
  await test('POST /planes (admin)', () => req('POST', '/planes', TOKENS.ADMIN, { numero_plan: 99, tipo: 'Test ' + ts, servicios: ['Test'], precio: 9.99, limite_equipos: 10 }));
  await test('PATCH /planes/1 (admin)', () => req('PATCH', '/planes/1', TOKENS.ADMIN, { precio: 99.99 }));
  await test('PATCH /planes/1/desactivar (admin - ya inactivo)', () => req('PATCH', '/planes/1/desactivar', TOKENS.ADMIN), true);
  await test('PATCH /planes/1/activar (admin)', () => req('PATCH', '/planes/1/activar', TOKENS.ADMIN));
  await test('DELETE /planes/1 (admin)', () => req('DELETE', '/planes/1', TOKENS.ADMIN));

  // TICKETS
  await test('GET /tickets/metrics (trabajador)', () => req('GET', '/tickets/metrics', TOKENS.CLIENTE_TRABAJADOR));
  await test('POST /tickets (trabajador)', () => req('POST', '/tickets', TOKENS.CLIENTE_TRABAJADOR, { asunto: 'Test ' + ts, detalle: 'Test', id_equipo: 1, es_software: false }));
  await test('GET /tickets/mis-tickets (trabajador)', () => req('GET', '/tickets/mis-tickets', TOKENS.CLIENTE_TRABAJADOR));
  await test('GET /tickets (admin)', () => req('GET', '/tickets', TOKENS.ADMIN));
  await test('GET /tickets/1 (admin)', () => req('GET', '/tickets/1', TOKENS.ADMIN));
  
  // Create fresh ticket for state machine test and capture its ID
  const createdTicket = await req('POST', '/tickets', TOKENS.CLIENTE_TRABAJADOR, { asunto: 'Estado Test ' + ts, detalle: 'Test', id_equipo: 1, es_software: false });
  const ticketObj = createdTicket && createdTicket.ticket ? createdTicket.ticket : createdTicket;
  const ticketId = ticketObj && ticketObj.id_ticket ? ticketObj.id_ticket : (ticketObj && ticketObj.id ? ticketObj.id : 2);
  await test('PATCH /tickets/' + ticketId + '/asignar (soporte)', () => req('PATCH', '/tickets/' + ticketId + '/asignar', TOKENS.SOPORTE_TECNICO, { soporteId: 2 }));
  await test('PATCH /tickets/' + ticketId + '/iniciar (soporte)', () => req('PATCH', '/tickets/' + ticketId + '/iniciar', TOKENS.SOPORTE_TECNICO));
  await test('PATCH /tickets/' + ticketId + '/resolver (soporte)', () => req('PATCH', '/tickets/' + ticketId + '/resolver', TOKENS.SOPORTE_TECNICO));
  await test('PATCH /tickets/' + ticketId + '/reabrir (trabajador)', () => req('PATCH', '/tickets/' + ticketId + '/reabrir', TOKENS.CLIENTE_TRABAJADOR));

  // CHAT
  await test('GET /chat/historial/1 (admin)', () => req('GET', '/chat/historial/1', TOKENS.ADMIN));

  // DASHBOARDS
  await test('GET /dashboards/admin (admin)', () => req('GET', '/dashboards/admin', TOKENS.ADMIN));

  // FILES
  await test('POST /files/upload (sin archivo)', () => req('POST', '/files/upload', TOKENS.ADMIN), true);

  // Print results
  let pass = 0, fail = 0;
  results.forEach(r => {
    if (r.ok) pass++;
    else { fail++; console.log('FAIL:', r.name, r.error || JSON.stringify(r.data)); }
  });
  console.log(`\nRESULTS: ${pass} passed, ${fail} failed out of ${results.length} tests`);
}

run();
