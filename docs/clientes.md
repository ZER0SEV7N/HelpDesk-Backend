# Documentación del Módulo Clientes

## Información General

- **Rutas base:**
  - `/clientes` — Controlador de Clientes (Empresas)
  - `/sucursales` — Controlador de Sucursales
  - `/areas` — Controlador de Áreas
- **Guards:** `JwtAuthGuard`, `RoleGuard`
- **Roles soportados:** `ADMINISTRADOR`, `SOPORTE_TECNICO`, `SOPORTE_INSITU`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`

---

## Jerarquía del Modelo

```
Cliente (Empresa)
  └── Sucursal (1:N)
        └── Área (1:N)
```

---

# Módulo Clientes (Empresas)

**Ruta base:** `/clientes`

## 1. Crear cliente (empresa) con sucursal principal

**Método:** `POST`  
**Ruta:** `/clientes`  
**Roles:** `ADMINISTRADOR`

### Request Body
```json
{
  "cliente": {
    "tipo_cliente": "JURIDICA",
    "numero_documento": "12345678901",
    "nombre_principal": "Empresa ABC",
    "direccion": "Calle 123",
    "telefono": "0987654321",
    "correo": "contacto@empresa.com",
    "rubro": "Tecnología",
    "id_plan": 1,
    "fecha_finalizacion_plan": "2026-12-31",
    "fecha_inicio_plan": "2026-01-01",
    "costo_negociado": 500,
    "limite_equipos_contratado": 50
  },
  "sucursal": {
    "nombre_sucursal": "Sucursal Central",
    "encargado": "Carlos Ruiz",
    "telefono": "0999888777",
    "correo": "sucursal@empresa.com",
    "direccion": "Av. Principal 456",
    "id_cliente": 1
  }
}
```

### Validaciones de Request (CreateClienteDto)
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `tipo_cliente` | `enum` (`JURIDICA`, `NATURAL`) | Sí | Valor válido del enum |
| `numero_documento` | `string` | Sí | Máximo 20 caracteres, único en BD |
| `nombre_principal` | `string` | Sí | Máximo 150 caracteres |
| `direccion` | `string` | Sí | Máximo 200 caracteres |
| `telefono` | `string` | Sí | Máximo 20 caracteres |
| `correo` | `string` | Sí | Formato email válido, máximo 100 caracteres |
| `rubro` | `string` | No | Máximo 100 caracteres |
| `id_plan` | `number` | No | Debe existir en tabla `planes` |
| `fecha_finalizacion_plan` | `string` (ISO 8601) | No | Fecha válida |
| `fecha_inicio_plan` | `string` (ISO 8601) | No | Fecha válida |
| `costo_negociado` | `number` | No | Valor numérico |
| `limite_equipos_contratado` | `number` | No | Valor numérico |

### Validaciones de Request (CreateSucursalDto)
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `nombre_sucursal` | `string` | Sí | Texto no vacío |
| `encargado` | `string` | Sí | Texto no vacío |
| `telefono` | `string` | Sí | Máximo 20 caracteres |
| `correo` | `string` | Sí | Email válido |
| `direccion` | `string` | Sí | Texto no vacío |
| `id_cliente` | `number` | Sí | Entero >= 1 |

### Validaciones de Negocio
- **Documento único:** No puede existir otro cliente con el mismo `numero_documento`.
- **Plan válido:** Si se envía `id_plan`, debe existir en la tabla `planes`.
- **Fechas de plan:**
  - Si no se envía `fecha_inicio_plan`, se usa la fecha actual.
  - Si no se envía `fecha_finalizacion_plan`, se calcula como `fecha_inicio_plan + 1 año`.
- **Valores por defecto de sucursal:**
  - Si no se envía `nombre_sucursal`, se asigna `"Sucursal Principal"`.
  - Si no se envía `encargado`, se asigna `"Por Asignar"`.
  - Si no se envía `telefono`, se asigna `"sin especificar"`.
  - Si no se envía `correo`, se asigna `"sin especificar@example.com"`.
  - Si no se envía `direccion`, se asigna `"sin especificar"`.
- **ID consistente:** El `id_cliente` en el DTO de sucursal debe coincidir con el cliente recién creado.
- **Costo y límite:** Si no se envían `costo_negociado` ni `limite_equipos_contratado`, se heredan del plan seleccionado.

### Response
```json
{
  "id_cliente": 1,
  "tipo_cliente": "JURIDICA",
  "numero_documento": "12345678901",
  "nombre_principal": "Empresa ABC",
  "direccion": "Calle 123",
  "telefono": "0987654321",
  "correo": "contacto@empresa.com",
  "rubro": "Tecnología",
  "id_plan": 1,
  "fecha_finalizacion_plan": "2027-01-01",
  "fecha_inicio_plan": "2026-01-01",
  "costo_negociado": 500,
  "limite_equipos_contratado": 50,
  "is_active": true,
  "plan": {
    "id_plan": 1,
    "tipo": "Premium",
    "precio": 500,
    "descripcion": "..."
  },
  "sucursales": [
    {
      "id_sucursal": 1,
      "nombre_sucursal": "Sucursal Central",
      "encargado": "Carlos Ruiz",
      "telefono": "0999888777",
      "correo": "sucursal@empresa.com",
      "direccion": "Av. Principal 456",
      "id_cliente": 1,
      "is_active": true
    }
  ]
}
```

---

## 2. Obtener todos los clientes

**Método:** `GET`  
**Ruta:** `/clientes`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_TECNICO`, `SOPORTE_INSITU`, `CLIENTE_EMPRESA`

### Request
No requiere body ni parámetros.

### Validaciones
- **Rol:** Solo usuarios autenticados con roles permitidos pueden acceder.

### Response
```json
[
  {
    "id_cliente": 1,
    "tipo_cliente": "JURIDICA",
    "numero_documento": "12345678901",
    "nombre_principal": "Empresa ABC",
    "direccion": "Calle 123",
    "telefono": "0987654321",
    "correo": "contacto@empresa.com",
    "rubro": "Tecnología",
    "id_plan": 1,
    "fecha_finalizacion_plan": "2027-01-01",
    "fecha_inicio_plan": "2026-01-01",
    "costo_negociado": 500,
    "limite_equipos_contratado": 50,
    "is_active": true,
    "plan": { ... },
    "sucursales": [ ... ]
  }
]
```

> **Nota:** La respuesta limpia elimina campos sensibles como `contraseña`, `created_at`, `updated_at`, `fecha_registro` del plan y relaciones.

---

## 3. Obtener un cliente por ID

**Método:** `GET`  
**Ruta:** `/clientes/:id`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del cliente (empresa) |

### Validaciones
- **Cliente existe:** Debe existir un cliente con el ID proporcionado.
- **Rol:** Solo roles autorizados pueden acceder.

### Response
```json
{
  "id_cliente": 1,
  "tipo_cliente": "JURIDICA",
  "numero_documento": "12345678901",
  "nombre_principal": "Empresa ABC",
  "direccion": "Calle 123",
  "telefono": "0987654321",
  "correo": "contacto@empresa.com",
  "rubro": "Tecnología",
  "id_plan": 1,
  "fecha_finalizacion_plan": "2027-01-01",
  "fecha_inicio_plan": "2026-01-01",
  "costo_negociado": 500,
  "limite_equipos_contratado": 50,
  "is_active": true,
  "plan": { ... },
  "sucursales": [ ... ],
  "equipos": [ ... ]
}
```

> **Nota:** A diferencia del listado, `findOne` incluye también la relación `equipos`.

---

## 4. Actualizar datos básicos de un cliente

**Método:** `PATCH`  
**Ruta:** `/clientes/:id`  
**Roles:** `ADMINISTRADOR`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del cliente a actualizar |

### Request Body
```json
{
  "nombre_principal": "Empresa XYZ",
  "telefono": "0999111222",
  "correo": "nuevo@empresa.com",
  "rubro": "Consultoría"
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `tipo_cliente` | `enum` | No | `JURIDICA` o `NATURAL` |
| `numero_documento` | `string` | No | Máximo 20 caracteres |
| `nombre_principal` | `string` | No | Máximo 150 caracteres |
| `direccion` | `string` | No | Máximo 200 caracteres |
| `telefono` | `string` | No | Máximo 20 caracteres |
| `correo` | `string` | No | Email válido, máximo 100 caracteres |
| `rubro` | `string` | No | Máximo 100 caracteres |
| `id_plan` | `number` | No | Entero |
| `fecha_finalizacion_plan` | `string` | No | Fecha válida |
| `fecha_inicio_plan` | `string` | No | Fecha válida |
| `costo_negociado` | `number` | No | Numérico |
| `limite_equipos_contratado` | `number` | No | Numérico |

### Validaciones de Negocio
- **Cliente existe:** El cliente con `id_cliente` debe existir.
- **Documento único:** Si se cambia `numero_documento`, no puede coincidir con el de otro cliente existente.

### Response
```json
{
  "id_cliente": 1,
  "tipo_cliente": "JURIDICA",
  "nombre_principal": "Empresa XYZ",
  ...
}
```

---

## 5. Actualizar / Renovar contrato de un cliente

**Método:** `PATCH`  
**Ruta:** `/clientes/contract/:id`  
**Roles:** `ADMINISTRADOR`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del cliente |

### Request Body
```json
{
  "id_plan": 2,
  "nuevaFechaInicio": "2026-01-01",
  "nuevaFechaFin": "2027-01-01",
  "nuevoCosto": 750,
  "nuevoLimite": 100
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `id_plan` | `number` | Sí | Entero, debe existir en tabla `planes` |
| `nuevaFechaInicio` | `string` (ISO 8601) | Sí | Fecha válida |
| `nuevaFechaFin` | `string` (ISO 8601) | Sí | Fecha válida |
| `nuevoCosto` | `number` | No | Numérico |
| `nuevoLimite` | `number` | No | Numérico |

### Validaciones de Negocio
- **Cliente existe:** El cliente con `id_cliente` debe existir.
- **Plan existe:** El `id_plan` debe corresponder a un plan válido en el sistema.
- **Actualización:** Se actualiza el plan, la fecha de finalización del plan y opcionalmente el costo negociado y límite de equipos.

### Response
```json
{
  "message": "Plan del cliente Empresa ABC actualizado a Premium con fecha de finalización 2027-01-01.",
  "cliente": {
    "id_cliente": 1,
    "id_plan": 2,
    "fecha_finalizacion_plan": "2027-01-01",
    "fecha_inicio_plan": "2026-01-01",
    "costo_negociado": 750,
    "limite_equipos_contratado": 100,
    ...
  }
}
```

---

## 6. Desactivar cliente (cascada)

**Método:** `PATCH`  
**Ruta:** `/clientes/:id/desactivar`  
**Roles:** `ADMINISTRADOR`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del cliente |

### Validaciones
- **Cliente existe:** Debe existir un cliente con el ID proporcionado.
- **No duplicado:** El cliente debe estar actualmente activo (`is_active = true`).

### Efecto en cascada
Al desactivar un cliente, se desactivan también:
- Todas sus sucursales
- Todas sus áreas
- Todos sus usuarios
- Todos sus equipos

### Response
```json
{
  "message": "Cliente Empresa ABC y sus sucursales han sido desactivados"
}
```

---

## 7. Reactivar cliente (cascada)

**Método:** `PATCH`  
**Ruta:** `/clientes/:id/activar`  
**Roles:** `ADMINISTRADOR`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del cliente |

### Validaciones
- **Cliente existe:** Debe existir un cliente con el ID proporcionado.
- **No duplicado:** El cliente debe estar actualmente inactivo (`is_active = false`).

### Efecto en cascada
Al reactivar un cliente, se reactivan también:
- Todas sus sucursales
- Todas sus áreas
- Todos sus usuarios
- Todos sus equipos

### Response
```json
{
  "message": "Cliente Empresa ABC y sus sucursales han sido reactivados"
}
```

---

# Módulo Sucursales

**Ruta base:** `/sucursales`

## 8. Crear sucursal

**Método:** `POST`  
**Ruta:** `/sucursales`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request Body
```json
{
  "nombre_sucursal": "Sucursal Norte",
  "encargado": "María López",
  "telefono": "0999111222",
  "correo": "norte@empresa.com",
  "direccion": "Av. Norte 789",
  "id_cliente": 1
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `nombre_sucursal` | `string` | Sí | Texto no vacío |
| `encargado` | `string` | Sí | Texto no vacío |
| `telefono` | `string` | Sí | Máximo 20 caracteres |
| `correo` | `string` | Sí | Email válido |
| `direccion` | `string` | Sí | Texto no vacío |
| `id_cliente` | `number` | Sí | Entero >= 1 |

### Validaciones de Negocio
- **Cliente existe:** El `id_cliente` debe corresponder a un cliente existente en el sistema.

### Response
```json
{
  "id_sucursal": 2,
  "nombre_sucursal": "Sucursal Norte",
  "encargado": "María López",
  "telefono": "0999111222",
  "correo": "norte@empresa.com",
  "direccion": "Av. Norte 789",
  "id_cliente": 1,
  "is_active": true,
  "cliente": {
    "id_cliente": 1,
    "tipo_cliente": "JURIDICA",
    "numero_documento": "12345678901",
    "nombre_principal": "Empresa ABC",
    ...
  }
}
```

> **Nota:** La respuesta incluye datos limpios del cliente asociado (sin `created_at`, `updated_at`, `fecha_registro`).

---

## 9. Obtener todas las sucursales

**Método:** `GET`  
**Ruta:** `/sucursales`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_TECNICO`, `SOPORTE_INSITU`, `CLIENTE_EMPRESA`

### Request
No requiere body ni parámetros.

### Validaciones
- **Rol:** Solo usuarios autenticados con roles permitidos pueden acceder.

### Response
```json
[
  {
    "id_sucursal": 1,
    "nombre_sucursal": "Sucursal Central",
    "encargado": "Carlos Ruiz",
    "telefono": "0999888777",
    "correo": "sucursal@empresa.com",
    "direccion": "Av. Principal 456",
    "id_cliente": 1,
    "is_active": true,
    "cliente": { ... },
    "areas": [ ... ]
  }
]
```

---

## 10. Obtener una sucursal por ID

**Método:** `GET`  
**Ruta:** `/sucursales/:id`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la sucursal |

### Validaciones
- **Sucursal existe:** Debe existir una sucursal con el ID proporcionado.
- **Rol:** Solo roles autorizados pueden acceder.

### Response
```json
{
  "id_sucursal": 1,
  "nombre_sucursal": "Sucursal Central",
  "encargado": "Carlos Ruiz",
  "telefono": "0999888777",
  "correo": "sucursal@empresa.com",
  "direccion": "Av. Principal 456",
  "id_cliente": 1,
  "is_active": true,
  "cliente": { ... },
  "areas": [ ... ],
  "equipos": [ ... ],
  "usuarios": [ ... ]
}
```

> **Nota:** Incluye relaciones completas: `cliente`, `areas`, `equipos` y `usuarios` (sin contraseñas).

---

## 11. Obtener sucursales por cliente

**Método:** `GET`  
**Ruta:** `/sucursales/cliente/:id_cliente`  
**Roles:** `ADMINISTRADOR`, `SOPORTE_TECNICO`, `SOPORTE_INSITU`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id_cliente` | `number` | Path | ID del cliente (empresa) |

### Validaciones
- **Cliente existe:** Debe existir un cliente con el `id_cliente` proporcionado.

### Response
```json
[
  {
    "id_sucursal": 1,
    "nombre_sucursal": "Sucursal Central",
    "encargado": "Carlos Ruiz",
    "telefono": "0999888777",
    "correo": "sucursal@empresa.com",
    "direccion": "Av. Principal 456",
    "id_cliente": 1,
    "is_active": true,
    "areas": [ ... ]
  }
]
```

---

## 12. Actualizar sucursal

**Método:** `PATCH`  
**Ruta:** `/sucursales/:id`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la sucursal |

### Request Body
```json
{
  "nombre_sucursal": "Sucursal Central Actualizada",
  "encargado": "Pedro Gómez",
  "telefono": "0999333444",
  "correo": "central@empresa.com",
  "direccion": "Calle Nueva 123"
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `nombre_sucursal` | `string` | No | Texto |
| `encargado` | `string` | No | Texto |
| `telefono` | `string` | No | Máximo 20 caracteres |
| `correo` | `string` | No | Email válido |
| `direccion` | `string` | No | Texto |
| `id_cliente` | `number` | No | Entero |

### Validaciones de Negocio
- **Sucursal existe:** La sucursal con `id_sucursal` debe existir.
- **No transferencia:** No se permite cambiar `id_cliente` (no se puede transferir una sucursal a otra empresa).

### Response
```json
{
  "id_sucursal": 1,
  "nombre_sucursal": "Sucursal Central Actualizada",
  "encargado": "Pedro Gómez",
  "telefono": "0999333444",
  "correo": "central@empresa.com",
  "direccion": "Calle Nueva 123",
  "id_cliente": 1,
  "is_active": true,
  ...
}
```

---

## 13. Desactivar sucursal

**Método:** `PATCH`  
**Ruta:** `/sucursales/:id/desactivar`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la sucursal |

### Validaciones
- **Sucursal existe:** Debe existir una sucursal con el ID proporcionado.
- **No duplicado:** La sucursal debe estar actualmente activa (`is_active = true`).

### Response
```json
{
  "message": "La sucursal Sucursal Central ha sido desactivada."
}
```

---

## 14. Reactivar sucursal

**Método:** `PATCH`  
**Ruta:** `/sucursales/:id/activar`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID de la sucursal |

### Validaciones
- **Sucursal existe:** Debe existir una sucursal con el ID proporcionado.
- **No duplicado:** La sucursal debe estar actualmente inactiva (`is_active = false`).

### Response
```json
{
  "message": "La sucursal Sucursal Central ha sido reactivada."
}
```

---

# Módulo Áreas

**Ruta base:** `/areas`

## 15. Crear área

**Método:** `POST`  
**Ruta:** `/areas`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request Body
```json
{
  "nombre_area": "Sistemas",
  "contacto": "Ana Torres",
  "telefono": "0999555666",
  "correo": "sistemas@empresa.com",
  "id_sucursal": 1
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `nombre_area` | `string` | Sí | Máximo 100 caracteres, no vacío |
| `contacto` | `string` | Sí | Máximo 100 caracteres, no vacío |
| `telefono` | `string` | Sí | Máximo 20 caracteres, no vacío |
| `correo` | `string` | Sí | Email válido, máximo 100 caracteres, no vacío |
| `id_sucursal` | `number` | Sí | Entero >= 1 |

### Validaciones de Negocio
- **Sucursal existe:** El `id_sucursal` debe corresponder a una sucursal existente en el sistema.

### Response
```json
{
  "id_area": 1,
  "nombre_area": "Sistemas",
  "contacto": "Ana Torres",
  "telefono": "0999555666",
  "correo": "sistemas@empresa.com",
  "id_sucursal": 1,
  "is_active": true,
  "sucursal": {
    "id_sucursal": 1,
    "nombre_sucursal": "Sucursal Central",
    "encargado": "Carlos Ruiz",
    "telefono": "0999888777",
    "correo": "sucursal@empresa.com",
    "direccion": "Av. Principal 456",
    "id_cliente": 1,
    "is_active": true,
    "cliente": {
      "id_cliente": 1,
      "tipo_cliente": "JURIDICA",
      "nombre_principal": "Empresa ABC",
      ...
    }
  }
}
```

---

## 16. Obtener todas las áreas

**Método:** `GET`  
**Ruta:** `/areas`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`

### Request
No requiere body ni parámetros.

### Validaciones
- **Rol:** Solo usuarios autenticados con roles permitidos pueden acceder.

### Response
```json
[
  {
    "id_area": 1,
    "nombre_area": "Sistemas",
    "contacto": "Ana Torres",
    "telefono": "0999555666",
    "correo": "sistemas@empresa.com",
    "id_sucursal": 1,
    "is_active": true,
    "sucursal": { ... }
  }
]
```

---

## 17. Obtener áreas por sucursal

**Método:** `GET`  
**Ruta:** `/areas/sucursal/:id_sucursal`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id_sucursal` | `number` | Path | ID de la sucursal |

### Validaciones
- **Sucursal existe:** Debe existir una sucursal con el `id_sucursal` proporcionado.

### Response
```json
[
  {
    "id_area": 1,
    "nombre_area": "Sistemas",
    "contacto": "Ana Torres",
    "telefono": "0999555666",
    "correo": "sistemas@empresa.com",
    "id_sucursal": 1,
    "is_active": true
  }
]
```

---

## 18. Obtener un área por ID

**Método:** `GET`  
**Ruta:** `/areas/:id`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`, `CLIENTE_SUCURSAL`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del área |

### Validaciones
- **Área existe:** Debe existir un área con el ID proporcionado.

### Response
```json
{
  "id_area": 1,
  "nombre_area": "Sistemas",
  "contacto": "Ana Torres",
  "telefono": "0999555666",
  "correo": "sistemas@empresa.com",
  "id_sucursal": 1,
  "is_active": true,
  "sucursal": {
    "id_sucursal": 1,
    "nombre_sucursal": "Sucursal Central",
    "encargado": "Carlos Ruiz",
    "telefono": "0999888777",
    "correo": "sucursal@empresa.com",
    "direccion": "Av. Principal 456",
    "id_cliente": 1,
    "is_active": true,
    "cliente": {
      "id_cliente": 1,
      "tipo_cliente": "JURIDICA",
      "nombre_principal": "Empresa ABC",
      ...
    }
  }
}
```

---

## 19. Actualizar área

**Método:** `PATCH`  
**Ruta:** `/areas/:id`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del área |

### Request Body
```json
{
  "nombre_area": "Infraestructura",
  "contacto": "Luis Mendez",
  "telefono": "0999777666",
  "correo": "infra@empresa.com"
}
```

### Validaciones de Request
| Campo | Tipo | Requerido | Regla |
|-------|------|-----------|-------|
| `nombre_area` | `string` | No | Máximo 100 caracteres |
| `contacto` | `string` | No | Máximo 100 caracteres |
| `telefono` | `string` | No | Máximo 20 caracteres |
| `correo` | `string` | No | Email válido, máximo 100 caracteres |
| `id_sucursal` | `number` | No | Entero >= 1 |

### Validaciones de Negocio
- **Área existe:** El área con `id_area` debe existir.
- **No transferencia:** No se permite cambiar `id_sucursal` (no se puede transferir un área a otra sucursal).

### Response
```json
{
  "id_area": 1,
  "nombre_area": "Infraestructura",
  "contacto": "Luis Mendez",
  "telefono": "0999777666",
  "correo": "infra@empresa.com",
  "id_sucursal": 1,
  "is_active": true,
  ...
}
```

---

## 20. Desactivar área

**Método:** `PATCH`  
**Ruta:** `/areas/:id/desactivar`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del área |

### Validaciones
- **Área existe:** Debe existir un área con el ID proporcionado.
- **No duplicado:** El área debe estar actualmente activa (`is_active = true`).

### Response
```json
{
  "message": "El área Sistemas ha sido desactivada."
}
```

---

## 21. Reactivar área

**Método:** `PATCH`  
**Ruta:** `/areas/:id/activar`  
**Roles:** `ADMINISTRADOR`, `CLIENTE_EMPRESA`

### Request
| Parámetro | Tipo | Ubicación | Descripción |
|-----------|------|-----------|-------------|
| `id` | `number` | Path | ID del área |

### Validaciones
- **Área existe:** Debe existir un área con el ID proporcionado.
- **No duplicado:** El área debe estar actualmente inactiva (`is_active = false`).

### Response
```json
{
  "message": "El área Sistemas ha sido activada."
}
```

---

## Relación de Entidades

| Entidad | Tabla | Campos principales |
|---------|-------|-------------------|
| `Clientes` | `clientes` | `id_cliente`, `tipo_cliente`, `numero_documento`, `nombre_principal`, `is_active` |
| `Sucursales` | `sucursales` | `id_sucursal`, `nombre_sucursal`, `encargado`, `id_cliente`, `is_active` |
| `Area` | `area` | `id_area`, `nombre_area`, `contacto`, `id_sucursal`, `is_active` |
| `Planes` | `planes` | `id_plan`, `tipo`, `precio`, `limite_equipos`, `descripcion` |

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `400 Bad Request` | Datos de entrada inválidos o reglas de negocio no cumplidas |
| `401 Unauthorized` | Token JWT ausente o inválido |
| `403 Forbidden` | El usuario no tiene permisos para la operación |
| `404 Not Found` | Recurso no encontrado (cliente, sucursal, área, plan) |
| `409 Conflict` | Conflicto de datos (documento duplicado) |

---

## Notas Adicionales

- **Soft delete:** Todos los módulos usan el campo `is_active` para desactivar lógicamente registros en lugar de eliminarlos físicamente.
- **Cascada de desactivación:** Solo el módulo `Clientes` aplica desactivación en cascada (sucursales, áreas, usuarios, equipos). Las sucursales y áreas se desactivan individualmente.
- **Helpers de respuesta:** Cada módulo usa un helper (`ClienteResponseHelper`, `SucursalResponseHelper`, `AreaResponseHelper`) que limpia la respuesta eliminando campos sensibles como contraseñas y fechas internas.
- **Enums:** `TipoCliente` solo acepta `JURIDICA` o `NATURAL`.
- **Plan por defecto:** Si no se especifica `id_plan` al crear un cliente, se asigna el plan con ID = 1.
