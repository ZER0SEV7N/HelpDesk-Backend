# Documentación de Correcciones — Flujo de Creación de Usuarios

## Resumen

Se identificaron y corrigieron 3 bugs críticos que impedían la creación de usuarios a través de la API. El flujo completo (`POST /usuario/registrar-empleado` → Redis → `GET /usuario/confirmar-correo`) fue reparado y verificado con 6 usuarios (uno por rol).

---

## Bug 1: Configuración de Conexión (`.env`)

### Archivo: `.env`

### Problema
En Windows, `localhost` se resuelve vía **named pipes** en lugar de TCP/IP. Esto causaba que la aplicación se conectara a instancias de MySQL/Redis/MongoDB equivocadas:
- **MySQL**: Conectaba al contenedor Docker (base de datos vacía) o al MySQL de XAMPP (sin tablas)
- **Redis**: La conexión no se establecía correctamente aunque ioredis no lanzara errores visibles

### Diagnóstico
```
# Con localhost → ERROR (toma named pipe / contenedor equivocado)
mysql -h localhost -P 3306 -u helpdesk helpdesk_db → ERROR 1146: Table doesn't exist

# Con 127.0.0.1 → ✅ (fuerza TCP/IP al host correcto)
mysql -h 127.0.0.1 -P 3306 -u helpdesk helpdesk_db → 12 tablas visibles
```

### Solución
```diff
- DB_HOST=localhost
- REDIS_URL=redis://localhost:6379
- MONGODB_URI=mongodb://localhost:27017/helpdesk_chat
+ DB_HOST=127.0.0.1
+ REDIS_URL=redis://127.0.0.1:6379
+ MONGODB_URI=mongodb://127.0.0.1:27017/helpdesk_chat
```

### Líneas modificadas
- `.env:5` — `DB_HOST=127.0.0.1`
- `.env:11` — `MONGODB_URI=mongodb://127.0.0.1:27017/helpdesk_chat`
- `.env:12` — `REDIS_URL=redis://127.0.0.1:6379`

---

## Bug 2: Usuario No Se Persistía (`auth.service.ts`)

### Archivo: `src/modules/auth/auth.service.ts`

### Problema
El método `register()` (línea 35) en `AuthService` creaba el objeto `Usuario` usando `this.usuariosRepo.create()` pero **nunca llamaba `this.usuariosRepo.save()`**. La entidad existía en memoria pero nunca se escribía en la base de datos.

### Código antes (líneas 54-65)
```typescript
const newUser = this.usuariosRepo.create({
  nombre: dto.nombre,
  apellido: dto.apellido,
  correo: dto.correo,
  password: hashedPassword,
  telefono: dto.telefono,
  rol: defaultRole,
  is_active: true,
});

return "Usuario registrado exitosamente";
```

### Código después (líneas 54-67)
```typescript
const newUser = this.usuariosRepo.create({
  nombre: dto.nombre,
  apellido: dto.apellido,
  correo: dto.correo,
  password: hashedPassword,
  telefono: dto.telefono,
  rol: defaultRole,
  is_active: true,
});

await this.usuariosRepo.save(newUser);  // ← LÍNEA AÑADIDA

return 'Usuario registrado exitosamente';
```

### Línea modificada
- `src/modules/auth/auth.service.ts:65` — Añadido `await this.usuariosRepo.save(newUser);`

---

## Bug 3: Email Bloqueante Rompe Flujo (`employee-registration.manager.ts`)

### Archivo: `src/modules/usuario/managers/employee-registration.manager.ts`

### Problema
El método `initiateVerification()` llamaba a `this.emailService.sendEmployeeVerification()` **sin try/catch**. Sin configuración SMTP, este método lanzaba `InternalServerErrorException("No se pudo enviar el correo de notificación del sistema.")` que:
1. Abortaba el flujo de registro
2. Impedía la respuesta al cliente (retornaba 500)
3. Aunque los datos ya estaban almacenados en Redis, el cliente nunca recibía el token de verificación

### Código antes (línea 50)
```typescript
await this.emailService.sendEmployeeVerification(dto.correo, token);
```

### Código después (líneas 50-58)
```typescript
try {
  await this.emailService.sendEmployeeVerification(dto.correo, token);
} catch {
  this.notificationGateway.emitEmailVerificationStatus(userPayload.sub, {
    correo: dto.correo,
    verificado: false,
    status: 'EMAIL_FALLIDO',
  });
}
```

### Líneas modificadas
- `src/modules/usuario/managers/employee-registration.manager.ts:50-58` — Envoltura try/catch

---

## Flujo de Creación de Usuarios

### Arquitectura de dos pasos

```
Paso 1: POST /usuario/registrar-empleado (admin autenticado)
    ↓
RegisterEmployeeUseCase.execute()
    ├── Valida email único
    ├── Valida rol existe
    ├── Valida jerarquía (cliente/sucursal)
    ↓
EmployeeRegistrationManager.initiateVerification()
    ├── Genera token (crypto.randomBytes(32))
    ├── Guarda en Redis (pending_emp_reg:<correo> → JSON, TTL 15min)
    ├── Envía email de verificación (try/catch - no bloqueante)
    └── Retorna mensaje de éxito

Paso 2: GET /usuario/confirmar-correo?correo=X&token=Y (público)
    ↓
EmployeeRegistrationManager.confirmEmail()
    ├── Lee datos de Redis
    ├── Valida token
    └── Retorna DTO
    ↓
ConfirmEmailUseCase.execute()
    ├── Busca rol en BD
    ├── Llama AuthService.register()
    │     └── Hash password + USUARIOS_REPO.SAVE() ← Bug 2 fix
    └── Persiste usuario en BD
```

### Rutas involucradas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | ❌ | Login (retorna JWT) |
| POST | `/usuario/registrar-empleado` | Admin (JWT + RoleGuard) | Inicia registro → Redis |
| GET | `/usuario/confirmar-correo` | ❌ | Completa verificación → crea usuario |
| GET | `/usuario/list` | Admin | Lista usuarios |

### Guard (autorización)
- `JwtAuthGuard` — valida token JWT en headers `Authorization: Bearer <token>`
- `RoleGuard` — verifica rol en payload JWT (`role` claim)
- `Roles()` decorator — define roles permitidos en cada endpoint

---

## Usuarios Creados (Verificación)

### Datos en base de datos

| ID | Nombre | Apellido | Correo | Rol | ID Cliente | ID Sucursal |
|---|---|---|---|---|---|---|
| 7 | Admin | Role | admin_role@test.com | ADMINISTRADOR | null | null |
| 8 | Soporte | Tecnico | soporte_tecnico@test.com | SOPORTE_TECNICO | null | null |
| 9 | Soporte | Insitu | soporte_insitu@test.com | SOPORTE_INSITU | null | null |
| 10 | Cliente | Empresa | cliente_empresa@test.com | CLIENTE_EMPRESA | null | null |
| 11 | Cliente | Sucursal | cliente_sucursal@test.com | CLIENTE_SUCURSAL | 1 | null |
| 12 | Cliente | Trabajador | cliente_trabajador@test.com | CLIENTE_TRABAJADOR | 1 | 1 |

### Login verificado
Todos los 6 usuarios pueden autenticarse con `password123` y recibir JWT válido.

---

## Entorno de Desarrollo

### Servicios requeridos (Docker)
```bash
docker-compose up -d
# mysql:8.0 → 127.0.0.1:3306 (helpdesk/helpdesk/helpdesk_db)
# redis:alpine → 127.0.0.1:6379
# mongo:latest → 127.0.0.1:27017
```

### Iniciar aplicación
```bash
npx nest build
node dist/src/main.js  # o: PORT=3005 npm run start:dev
```

### Nota sobre MySQL en Windows
Hay **dos instancias de MySQL**:
1. **Host MySQL** en `127.0.0.1:3306` — usa esta para Workbench
2. **Docker MySQL** — contenedor separado (no usar para desarrollo local)

MySQL Workbench debe configurarse con `Hostname: 127.0.0.1` (no `localhost`) para evitar el problema de named pipes.

---

## Lint & Typecheck

```
npx eslint src/modules/auth/auth.service.ts src/modules/usuario/managers/employee-registration.manager.ts src/database/database.module.ts
→ 0 errors ✅

npx tsc --noEmit
→ 0 errors in src/ ✅
```
