# Análisis de Código — HelpDesk Backend

## Resumen Ejecutivo

Revisión completa del backend NestJS (130+ archivos). Se identificaron **27 inconvenientes** clasificados por severidad: **6 críticos**, **8 altos**, **8 medios**, **5 bajos**. Incluye vulnerabilidades de seguridad, bugs funcionales, código muerto, inconsistencias arquitectónicas y problemas de configuración.

---

## 🔴 Problemas Críticos (Seguridad / Datos)

### 1. JWT Token expuesto en el response body (XSS bypass)
**Archivo:** `src/modules/auth/auth.controller.ts:61`

El endpoint `POST /auth/login` establece el token JWT como cookie HttpOnly **pero también lo retorna en el cuerpo de la respuesta**:
```typescript
return {
    message: 'Login exitoso',
    token: token,  // ← EXPUËS EL TOKEN AL CLIENTE JS
    user: { ... },
};
```
**Impacto:** Cualquier script malicioso (XSS) puede leer `response.token` del cuerpo JSON, anulando completamente la protección HttpOnly. El token debe solo enviarse por cookie.

### 2. Chat sin autorización por roles (IDOR)
**Archivo:** `src/common/chat/chat.controller.ts:11`

```typescript
@Get('historial/:ticketId')
async obtenerHistorial(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return await this.chatService.obtenerHistorialCompleto(ticketId);
}
```
Solo requiere `@UseGuards(JwtAuthGuard)` — **cualquier usuario autenticado puede leer el historial de chat de cualquier ticket** sin verificar que el ticket le pertenezca. No hay `RoleGuard` ni validación de pertenencia.

### 3. JWT_RESET_SECRET no definido → fallback a secreto débil
**Archivo:** `src/modules/auth/auth.service.ts:108-111, 126-128`

`JWT_RESET_SECRET` no está en `.env`. El código usa:
```typescript
secret: this.configService.get<string>('JWT_RESET_SECRET') || 'resetKeyDefault',
```
**Impacto:** Todos los tokens de recuperación de contraseña usan el secreto hardcodeado `'resetKeyDefault'`, permitiendo a un atacante forjar tokens de reseteo.

### 4. Variable de entorno CORS con nombre incorrecto
**Archivo:** `src/main.ts:16`

```typescript
origin: process.env.FRONTEND_URL || 'http://localhost:7012',
```
El `.env` define `HTTP_ORIGIN`, no `FRONTEND_URL`. El CORS nunca usa la variable configurada y siempre cae al fallback. **CORS mal configurado** → puede bloquear solicitudes legítimas del frontend o, peor, si se cambia el fallback, permitir orígenes no autorizados.

### 5. Credenciales reales expuestas en `.env`
**Archivo:** `.env:4-5, 13, 22-24`

El archivo `.env` (aunque está en `.gitignore`) contiene:
- `MAIL_PASSWORD=iglpwsngnvfxbhoy` (app password de Gmail real)
- `DB_PASSWORD=root`
- `JWT_SECRET=ClaveSeguraAyudaDeRespaldoHelpdesk123!`

**Impacto:** Si se commitea accidentalmente, las credenciales entran en el repositorio. Además, la contraseña de Gmail es una app password real que podría revokearse.

### 6. Contraseñas de software almacenadas en texto plano
**Archivo:** `src/software/software.service.ts:48-50`, `src/entities/Software.entity.ts:33`

```typescript
const software = this.softwareRepo.create(dtoWithDates);
return this.softwareRepo.save(software);  // ← contraseña sin hash
```
El `Software` entity almacena `contraseña` como texto plano. Si la DB es comprometida, todas las credenciales de software corporativo se exponen.

---

## 🟠 Problemas Altos (Bugs funcionales / Arquitectura)

### 7. Bug `user.sub` undefined en ChatGateway (WebSocket)
**Archivo:** `src/common/chat/chat.gateway.ts:127-130, 160-161`

`JwtStrategy.validate()` retorna `{ userId, role, ... }` — **no incluye `sub`**. Pero el gateway usa `user.sub` en múltiples lugares:
```typescript
const authUser = {
    sub: user.sub,        // ← undefined
    userId: user.sub,     // ← undefined
    role: 'ADMINISTRADOR' as const,
};
await this.ticketService.assignTicket(data.ticketId, bestAgent.id, authUser);
```
**Impacto:** La asignación de tickets vía WebSocket **siempre falla** en silencio porque `authUser.sub` es `undefined`. También `handleJoinTicket` compara `ticket.id_trabajador === user.sub` (undefined) → **nunca coincide** → el creador del ticket es tratado como si no tuviera permisos.

### 8. `DashboardsModule` no importado en `AppModule` (endpoint inaccesible)
**Archivo:** `src/app.module.ts:22-42`

`DashboardsModule` no está en los imports de `AppModule`:
```typescript
imports: [ConfigModule, DatabaseModule, ClientesModule, AuthModule,
    HardwareModule, TicketModule, ...  // ← NO DashboardsModule
]
```
**Impacto:** El endpoint `GET /dashboards/admin` **nunca está disponible**. El módulo y servicio existen pero son código muerto.

### 9. `handlerMarkAsRead` no registrado como handler de Socket.IO
**Archivo:** `src/common/chat/chat.gateway.ts:241`

```typescript
handleMarkAsRead(data: ReadData) {  // Sin @SubscribeMessage
```
Falta el decorador `@SubscribeMessage('mark_as_read')`. Clientes que envíen `mark_as_read` **nunca son atendidos**.

### 10. Use cases de equipos = código muerto con bug de compilación
**Archivo:** `src/equipos/equipos.module.ts:11-12`

```typescript
providers: [EquiposService],  // ← NO registra los use cases
```
Los 7 archivos en `src/equipos/application/*.use-case.ts` **nunca se registran ni usan**. El controlador usa `EquiposService` directamente. Peor aún: `find-all-equipos.use-case.ts:51` y `assign-equipo.use-case.ts:46` referencian `equipo.id_trabajador`, que **no existe** en la entidad `Equipos` (que usa `nombre_usuario: string`). Estos use cases tendrían errores de compilación/TS si se activaran.

### 11. `EquiposService.create` sin autorización de cliente
**Archivo:** `src/equipos/equipos.service.ts:26-29`, `src/equipos/equipos.controller.ts:27-30`

```typescript
create(@Body() createEquipoDTO: CreateEquipoDTO) {
    return this.equiposService.create(createEquipoDTO);  // ← sin userToken
}
```
El método `create` **no recibe el JWT** y no valida que el `id_cliente` del DTO pertenezca al usuario autenticado. Un `SOPORTE_TECNICO` puede crear equipos bajo **cualquier empresa**.

### 12. Filtrado de equipos CLIENTE_TRABAJADOR por nombre (rompido)
**Archivo:** `src/equipos/equipos.service.ts:66-69`

```typescript
case 'CLIENTE_TRABAJADOR':
    query.andWhere('equipo.nombre_usuario = :nombre', {
        nombre: usuarioReal.nombre,  // solo nombre (ej: "Juan")
    });
```
Filtra por `nombre_usuario` (string) comparado con el **nombre de pila** del usuario. Si el equipo fue asignado con el nombre completo ("Juan Pérez"), **nunca coincidirá**. Un trabajador nunca verá sus equipos.

### 13. `EquiposService.assignToWorker` sin validación de sucursal
**Archivo:** `src/equipos/equipos.service.ts:123-142`

El método permite cambiar `id_sucursal` a **cualquier valor** sin validar que pertenezca al mismo `id_cliente`. Un usuario podría mover equipos entre empresas. La versión use-case `AssignEquipoUseCase` valida esto, pero **nunca se usa**.

### 14. Inconsistencia de rutas en README
**Archivo:** `README.md:195, 235, 241-244`

El README documenta rutas como `POST /ticket`, `GET /ticket/mis-tickets` y `GET /ticket/:id`, pero el controlador usa `@Controller('tickets')` (plural). **Todas las rutas del README son incorrectas.**

---

## 🟡 Problemas Medios (Calidad / Mantenibilidad)

### 15. `bcrypt` y `bcryptjs` duplicados
**Archivo:** `package.json:39-40`

Ambos paquetes están instalados. Solo se usa `import * as bcrypt from 'bcrypt'` en todo el código. `bcryptjs` es **completamente innecesario** y añade ~500KB al bundle.

### 16. `main.ts` usa `useGlobalPipes` en lugar de `APP_PIPE`
**Archivo:** `src/main.ts:24-30`

```typescript
app.useGlobalPipes(new ValidationPipe({ ... }));
```
Este enfoque **no pasa por el contenedor de DI**, imposibilitando inyectar servicios en el pipe. La convención NestJS es usar `APP_PIPE` en providers.

### 17. Nombre de variable de entorno inconsistente (CORS vs Email)
**Archivo:** `src/main.ts:16` vs `src/common/email/email.service.ts:28`, `src/common/websockets/notification.gateway.ts:19`

- `main.ts`: `process.env.FRONTEND_URL`
- Email/WebSocket: `configService.get('HTTP_ORIGIN')` / `env.HTTP_ORIGIN`

El `.env` solo define `HTTP_ORIGIN`. La variable `FRONTEND_URL` es un error tipográfico.

### 18. PIN de ticket generado con `Math.random()` (no criptográficamente seguro)
**Archivo:** `src/ticket/ticket.service.ts:107`

```typescript
pin = Math.floor(100000 + Math.random() * 900000).toString();
```
`Math.random()` no es criptográficamente seguro. Un atacante podría predecir PINs. Debería usar `crypto.randomInt()`.

### 19. `RegisterEmployeeUseCase` no persiste usuario directamente
**Archivo:** `src/modules/usuario/application/register-employee.use-case.ts:44`

El flujo de registro requiere confirmación de email vía Redis → `ConfirmEmailUseCase`. Pero `RegisterEmployeeUseCase` delega al `EmployeeRegistrationManager` que **no persiste el usuario**. Si Redis falla o se reinicia antes de la confirmación, **los datos se pierden**. No hay mecanismo de recovery.

### 20. DTO `InstallSoftwareDto` y `AsignarEquipoDto` sin usar
**Archivo:** `src/software/dto/install-software.dto.ts`, `src/equipos/dto/asignar-equipo.dto.ts`

Ambos DTOs están definidos pero **nunca se importan ni usan** en sus respectivos controladores. El `instalarSoftware` del controlador usa parámetros individuales de `@Body()`.

### 21. `create-cliente.dto.ts` — README menciona campos que no existen
**Archivo:** `README.md:121-125`

El README documenta que `POST /planes` recibe `{ numero_plan, nombre, descripcion, precio }`, pero el DTO `CreatePlanDto` define `{ numero_plan, tipo, servicios, precio, ... }` — **no tiene `nombre` ni `descripcion`**.

### 22. `EquiposController` no valida `nombre_usuario` contra trabajador real
**Archivo:** `src/equipos/equipos.service.ts:123-142`

Al asignar equipo, se usa `nombre_usuario` (string libre) en lugar de un `id_trabajador` (FK a Usuario). Esto **rompe la integridad referencial** — no hay garantía de que el nombre corresponda a un usuario real.

### 23. `handleConnection` en websockets no valida `payload.sub`
**Archivo:** `src/common/chat/chat.gateway.ts:71-76`

```typescript
const payload = (await this.authService.verifyToken(token)) as JwtPayload;
if (payload.clienteId) client.join(`empresa_${payload.clienteId}`);
```
Si el token es válido pero `payload.clienteId` es undefined, el usuario se conecta sin join a ninguna sala de empresa. No hay validación adicional.

---

## 🟢 Problemas Bajos (Estilo / Mejora)

### 24. `Software_equipos` usa snake_case en nombre de clase
**Archivo:** `src/entities/SoftwareEquipos.entity.ts:17`

La convención TypeScript es PascalCase. `Software_equipos` debería ser `SoftwareEquipos`. Genera confusión en imports.

### 25. `bcrypt` salt rounds = 10
**Archivo:** `src/modules/auth/auth.service.ts:54`, `src/modules/usuario/application/update-profile.use-case.ts:21`, `src/modules/usuario/application/confirm-email.use-case.ts:24`

10 rounds es el estándar mínimo. 12 es recomendado para mayor seguridad. No crítico pero mejorable.

### 26. `main.ts` no usa `useStaticAssets` para uploads
**Archivo:** `src/main.ts`

`ServeStaticModule` está configurado, pero no hay validación de que la carpeta `uploads/` exista. Si no existe, el servidor podría lanzar errores al arrancar en producción.

### 27. `EquiposService` y use cases duplicados
**Archivo:** `src/equipos/equipos.service.ts` vs `src/equipos/application/*.ts`

Existen **dos implementaciones paralelas** para la misma funcionalidad (servicio directo vs use cases). La arquitectura está a medio migrar — hay que decidir un patrón y consolidar.

---

## Prioridad de Corrección Recomendada

| Prioridad | Ítems |
|-----------|-------|
| **P0 (inmediato)** | 1, 2, 3, 4 (seguridad) |
| **P1 (esta semana)** | 5, 6, 7, 8, 9, 10, 11, 12 (bugs bloqueantes) |
| **P2 (próxima sprint)** | 13, 14, 15, 16, 17, 18, 19, 20 (calidad) |
| **P3 (tech debt)** | 21, 22, 23, 24, 25, 26, 27 (refactor) |
