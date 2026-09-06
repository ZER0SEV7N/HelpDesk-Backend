# Documentación del Módulo Citas Soporte

## Información General

- **Ruta base:** `/citas`
- **Controlador:** `src/citas_soporte/citas.controller.ts`
- **Guards:** `JwtAuthGuard`, `RoleGuard`
- **Roles soportados:** `ADMINISTRADOR`, `SOPORTE_INSITU`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`, `CLIENTE_TRABAJADOR`

---

## 1. Listar todas las citas

**Método:** `GET`  
**Ruta:** `/citas`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request
No requiere body. El token JWT se extrae automáticamente del header.

### Validaciones
- **Rol:** Solo usuarios con rol `ADMINISTRADOR` o `SOPORTE_INSITU` pueden acceder.
- **Soporte in situ:** Si el usuario es `SOPORTE_INSITU`, solo ve las citas vinculadas a su `id_usuario`.

### Response
```json
[
  {
    "id_cita": 1,
    "fecha_programada": "2026-08-25T00:00:00.000Z",
    "estado": "Pendiente",
    "observaciones": null,
    "created_at": "2026-08-25T00:00:00.000Z",
    "updated_at": "2026-08-25T00:00:00.000Z",
    "sucursal": {
      "id_sucursal": 1,
      "nombre_sucursal": "Sucursal Central",
      "direccion": "Calle 123"
    },
    "area": {
      "id_area": 1,
      "nombre_area": "Sistemas"
    },
    "soporte_insitu": {
      "id_usuario": 1,
      "nombre_completo": "Juan Pérez",
      "correo": "juan@empresa.com",
      "telefono": "1234567890"
    },
    "tickets": [
      {
        "id_ticket": 1,
        "pin": "ABC123",
        "asunto": "Falla en red",
        "detalle": "Sin conexión",
        "estado": "Abierto",
        "created_at": "2026-08-25T00:00:00.000Z"
      }
    ]
  }
]
```

---

## 2. Obtener cronograma de citas

**Método:** `GET`  
**Ruta:** `/citas/cronograma`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`, `CLIENTE_TRABAJADOR`

### Request
No requiere body. El token JWT se extrae automáticamente del header.

### Validaciones
- **Rol:** Cualquier rol autenticado puede acceder.

### Response
```json
[
  {
    "id_cita": 1,
    "fecha_programada": "2026-08-25T00:00:00.000Z",
    "estado": "Pendiente",
    "id_cliente": 1,
    "nombre_cliente": "Empresa ABC",
    "id_sucursal": 1,
    "nombre_sucursal": "Sucursal Central"
  }
]
```

---

## 3. Obtener una cita por ID

**Método:** `GET`  
**Ruta:** `/citas/:id`  
**Roles:** `SOPORTE_INSITU`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`, `CLIENTE_TRABAJADOR`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la cita |

### Validaciones
- **Rol:** Cualquier rol autenticado (excepto `ADMINISTRADOR`) puede acceder.

### Response
```json
{
  "id_cita": 1,
  "fecha_programada": "2026-08-25T00:00:00.000Z",
  "estado": "Pendiente",
  "observaciones": null,
  "created_at": "2026-08-25T00:00:00.000Z",
  "updated_at": "2026-08-25T00:00:00.000Z",
  "sucursal": {
    "id_sucursal": 1,
    "nombre_sucursal": "Sucursal Central",
    "encargado": "Carlos Ruiz",
    "telefono": "0987654321",
    "correo": "sucursal@empresa.com",
    "direccion": "Calle 123",
    "id_cliente": 1,
    "is_active": true,
    "created_at": "2026-08-25T00:00:00.000Z",
    "updated_at": "2026-08-25T00:00:00.000Z"
  },
  "soporte_insitu": {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "nombre_completo": "Juan Pérez",
    "correo": "juan@empresa.com",
    "telefono": "1234567890",
    "is_active": true,
    "created_at": "2026-08-25T00:00:00.000Z",
    "updated_at": "2026-08-25T00:00:00.000Z"
  },
  "tickets": [
    {
      "id_ticket": 1,
      "pin": "ABC123",
      "asunto": "Falla en red",
      "detalle": "Sin conexión",
      "estado": "Abierto",
      "es_software": false,
      "imagen_url": null,
      "id_software": null,
      "id_equipo": null,
      "id_cliente": 1,
      "id_trabajador": null,
      "id_soporte": null,
      "created_at": "2026-08-25T00:00:00.000Z",
      "updated_at": "2026-08-25T00:00:00.000Z",
      "cliente": { "id_cliente": 1 },
      "equipo": null,
      "trabajador": null,
      "soporte": null,
      "area": null
    }
  ]
}
```

---

## 4. Crear cita

**Método:** `POST`  
**Ruta:** `/citas/`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request Body
```json
{
  "ticket_ids": [1, 2],
  "id_sucursal": 1,
  "fecha_programada": "2026-08-26T10:00:00.000Z",
  "id_soporte": 1
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `ticket_ids` | `Set<number>` o `Array<number>` | Sí | Debe contener al menos 1 ticket |
| `id_sucursal` | `number` | Sí | Debe ser un número entero |
| `fecha_programada` | `string` (ISO 8601) | Sí | Debe ser una fecha válida |
| `id_soporte` | `number` | Sí | Debe ser un número entero |

### Validaciones de Negocio
- **Fecha no pasada:** `fecha_programada` no puede ser anterior a la fecha actual.
- **Soporte válido:** El `id_soporte` debe corresponder a un usuario existente con rol `SOPORTE_INSITU` (id_rol = 3).
- **Sin solapamiento:** No puede existir otra cita activa (`Pendiente` o `En Camino`) para la misma sucursal en la misma fecha.
- **Tickets existentes:** Todos los `ticket_ids` deben existir en la base de datos.
- **Sin tickets cerrados:** Ningún ticket asociado puede tener estado `Cerrado`.
- **Sin citas activas:** Ningún ticket puede estar asociado a otra cita activa (`Pendiente`, `En Camino` o `Reprogramada`).

### Response
```json
{
  "mensaje": "Cita creada exitosamente"
}
```

---

## 5. Reprogramar cita (relocate)

**Método:** `POST`  
**Ruta:** `/citas/relocate/:id`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la cita actual a reprogramar |

### Request Body
```json
{
  "nueva_fecha_programada": "2026-08-27T10:00:00.000Z",
  "motivo_reprogramacion": "El cliente solicitó cambio de fecha"
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `nueva_fecha_programada` | `string` (ISO 8601) | Sí | Fecha válida en formato ISO 8601 |
| `motivo_reprogramacion` | `string` | Sí | Cadena de texto no vacía |

### Validaciones de Negocio
- **Cita existe:** La cita con `id_cita` debe existir.
- **Estado válido:** Solo se pueden reprogramar citas que NO estén en estado `Completada`, `Cancelada` o `Reprogramada`.
- **Transacción:** La operación se ejecuta en transacción:
  1. La cita original se marca como `REPROGRAMADA` y se guarda en historial.
  2. Se crea una nueva cita con estado `Pendiente` y la nueva fecha.

### Response
```json
{
  "mensaje": "Cita reprogramada exitosamente. Se generó un nuevo agendamiento.",
  "cita_historica_id": 1,
  "nueva_cita": {
    "id_cita": 2,
    "fecha_programada": "2026-08-27T10:00:00.000Z",
    "estado": "Pendiente",
    "observaciones": null,
    "created_at": "2026-08-25T00:00:00.000Z",
    "updated_at": "2026-08-25T00:00:00.000Z",
    "sucursal": { ... },
    "area": { ... },
    "soporte_insitu": { ... },
    "tickets": [ ... ]
  }
}
```

---

## 6. Actualizar cita

**Método:** `PATCH`  
**Ruta:** `/citas/:id`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la cita a actualizar |

### Request Body
```json
{
  "observaciones": "Nueva observación administrativa",
  "id_soporte_insitu": 2
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `observaciones` | `string` | No | Texto libre |
| `id_soporte_insitu` | `number` | No | Entero positivo |

### Validaciones de Negocio
- **Cita existe:** La cita con `id_cita` debe existir.
- **Estado Pendiente:** Solo se pueden modificar citas en estado `Pendiente`.
- **Soporte válido:** Si se envía `id_soporte_insitu`, debe corresponder a un usuario existente con rol `SOPORTE_INSITU` (id_rol = 3).

### Response
```json
{
  "mensaje": "La cita con ID #1 ha sido actualizada exitosamente."
}
```

---

## 7. Agregar tickets a cita

**Método:** `POST`  
**Ruta:** `/citas/add-tickets/:id`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la cita |

### Request Body
```json
{
  "ticket_ids": [3, 4]
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `ticket_ids` | `Array<number>` | Sí | Array con al menos 1 elemento, cada elemento entero |

### Validaciones de Negocio
- **Cita existe:** La cita con `id_cita` debe existir.
- **Estado Pendiente:** Solo se pueden agregar tickets a citas en estado `Pendiente`.
- **Tickets existentes:** Todos los `ticket_ids` deben existir en la base de datos.
- **Sin tickets cerrados:** Ningún ticket puede tener estado `Cerrado`.
- **Sin duplicados:** Ningún ticket puede estar asociado a otra cita activa (`Pendiente` o `En Camino`).
- **Sin duplicados en misma cita:** No se agregan tickets que ya estén en la cita.

### Response
```json
{
  "mensaje": "Tickets asociados exitosamente a la cita."
}
```

---

## 8. Iniciar cita (En Camino)

**Método:** `POST`  
**Ruta:** `/citas/start/:id/:userId`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la cita |
| `userId` | `number` | Path | ID del usuario que inicia la cita |

### Validaciones
- **Cita existe:** La cita con `id_cita` debe existir.
- **Estado Pendiente:** Solo se pueden iniciar citas en estado `Pendiente`.
- **Usuario existe:** El `userId` debe corresponder a un usuario existente.
- **Permisos:** El usuario debe ser:
  - El soporte in situ asignado a la cita, o
  - Un administrador.

### Response
```json
{
  "mensaje": "Cita actualizada a estado En Camino."
}
```

---

## 9. Completar cita

**Método:** `POST`  
**Ruta:** `/citas/complete/:id/:userId`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la cita |
| `userId` | `number` | Path | ID del usuario que completa la cita |

### Request Body
```json
{
  "observaciones_cierre": "Trabajo finalizado correctamente"
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `observaciones_cierre` | `string` | No | Texto libre |

### Validaciones de Negocio
- **Cita existe:** La cita con `id_cita` debe existir.
- **Estado válido:** Solo se pueden completar citas en estado `Pendiente` o `En Camino`.
- **Usuario existe:** El `userId` debe corresponder a un usuario existente.
- **Permisos:** El usuario debe ser:
  - El soporte in situ asignado a la cita, o
  - Un administrador.
- **Cierre de tickets:** Al completar la cita, todos los tickets asociados se cierran automáticamente (estado = `Cerrado`).
- **Observaciones:** Si se envían `observaciones_cierre`, se concatenan a las observaciones existentes con el prefijo `[CIERRE]:`.

### Response
```json
{
  "mensaje": "Cita completada y tickets asociados cerrados exitosamente."
}
```

---

## 10. Cancelar cita

**Método:** `POST`  
**Ruta:** `/citas/cancel/:id/:userId`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_INSITU`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la cita |
| `userId` | `number` | Path | ID del usuario que cancela la cita |

### Request Body
```json
{
  "motivo_cancelacion": "Cliente no asistió y no responde"
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `motivo_cancelacion` | `string` | Sí | Mínimo 5 caracteres |

### Validaciones de Negocio
- **Cita existe:** La cita con `id_cita` debe existir.
- **Estado Pendiente:** Solo se pueden cancelar citas en estado `Pendiente`.
- **Usuario existe:** El `userId` debe corresponder a un usuario existente.
- **Permisos:** El usuario debe ser:
  - El soporte in situ asignado a la cita, o
  - Un administrador.
- **Limpieza de tickets:** Al cancelar, se eliminan los tickets asociados de la cita (se desvinculan).
- **Observaciones:** El motivo de cancelación se agrega a las observaciones con el prefijo `[CANCELADA]:`.

### Response
```json
{
  "mensaje": "Cita cancelada exitosamente"
}
```

---

## Estados de Cita

| Estado | Descripción |
|--------|-------------|
| `Pendiente` | Cita agendada, pendiente de inicio |
| `En Camino` | Soporte in situ se dirige a la sucursal |
| `Completada` | Cita finalizada exitosamente |
| `Cancelada` | Cita cancelada |
| `Reprogramada` | Cita original reemplazada por una nueva fecha |

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `400 Bad Request` | Datos de entrada inválidos o reglas de negocio no cumplidas |
| `401 Unauthorized` | Token JWT ausente o inválido |
| `403 Forbidden` | El usuario no tiene permisos para la operación |
| `404 Not Found` | Recurso no encontrado (cita, usuario, ticket) |
| `409 Conflict` | Conflicto de estado (solapamiento de citas, tickets duplicados) |
