# Módulo de Clientes (Gestión de Empresas) — HelpDesk Backend

Documentación del módulo **Clientes** del backend HelpDesk: qué hace, para qué sirve y en qué parte del código está implementado.

---

## ¿Para qué sirve?

El módulo **Clientes** gestiona las **empresas** que son clientes del sistema HelpDesk. Permite:

- **Crear** nuevas empresas (registro de clientes).
- **Listar** todas las empresas registradas.

Cada empresa tiene: nombre, RUC (11 dígitos), dirección, teléfono y correo. La entidad se relaciona con **Sucursales** y **Equipos** (una empresa puede tener muchas sucursales y muchos equipos).

---

## ¿Qué está implementado?

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Crear empresa | ✅ Implementado | `POST /clientes` con body validado |
| Listar empresas | ✅ Implementado | `GET /clientes` devuelve todas las empresas |
| Eliminar empresa | ⏳ Pendiente | Método `Delete()` en el servicio está vacío |

---

## Ubicación en el código

### 1. Módulo (`clientes.module.ts`)

**Ruta:** `src/clientes/clientes.module.ts`

- Registra el módulo de clientes en NestJS.
- Importa `TypeOrmModule.forFeature([Empresa])` para usar la entidad en BD.
- Declara `ClientesController` y `ClientesService`.

---

### 2. Controlador (`clientes.controller.ts`)

**Ruta:** `src/clientes/clientes.controller.ts`

- Base de rutas: **`/clientes`**.
- **Endpoints:**
  - `POST /clientes` → Crear empresa (body: `CreateEmpresaDto`).
  - `GET /clientes` → Obtener todas las empresas.

Ejemplo de uso (con servidor en `localhost:3000`):

- Crear: `POST http://localhost:3000/clientes`
- Listar: `GET http://localhost:3000/clientes`

---

### 3. Servicio (`clientes.service.ts`)

**Ruta:** `src/clientes/clientes.service.ts`

- **`create(createEmpresaDto)`**: Crea una entidad `Empresa` y la guarda en la base de datos.
- **`findAll()`**: Devuelve todas las empresas.
- **`Delete()`**: Declarado pero **sin implementación** (pendiente completar).

El servicio usa el repositorio de TypeORM para la entidad `Empresa`.

---

### 4. DTO de creación (`create-empresa.dto.ts`)

**Ruta:** `src/clientes/dto/create-empresa.dto.ts`

Define y valida el body para crear una empresa:

| Campo | Tipo | Validación |
|-------|------|------------|
| `nombre_cliente` | string | Requerido, entre 3 y 50 caracteres |
| `ruc` | string | Requerido, exactamente 11 caracteres |
| `direccion` | string | Requerido |
| `telefono` | string | Requerido |
| `correo` | string | Requerido, formato email |

Usa `class-validator`: `@IsString`, `@IsNotEmpty`, `@Length`, `@IsEmail`.

---

### 5. Entidad (`Empresa`)

**Ruta:** `src/entities/empresa.entity.ts` (o `Empresa.entity.ts` según convención del proyecto)

Tabla en BD: **`empresa`**.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_empresa` | number (PK, auto) | Identificador único |
| `nombre_cliente` | string | Nombre de la empresa |
| `ruc` | string (length 11) | RUC |
| `direccion` | string | Dirección |
| `telefono` | string | Teléfono |
| `correo` | string | Correo electrónico |

Relaciones:

- **Una empresa → muchas sucursales** (`OneToMany` con `Sucursales`).
- **Una empresa → muchos equipos** (`OneToMany` con `Equipos`).

---

## Registro en la aplicación

El módulo se importa en el módulo principal:

**Archivo:** `src/app.module.ts`

```ts
import { ClientesModule } from './clientes/clientes.module';

@Module({
  imports: [
    // ...
    ClientesModule,
    // ...
  ],
  // ...
})
export class AppModule {}
```

---

## Resumen de archivos

| Archivo | Ruta | Rol |
|---------|------|-----|
| Módulo | `src/clientes/clientes.module.ts` | Configuración del módulo Clientes |
| Controlador | `src/clientes/clientes.controller.ts` | Rutas `POST/GET /clientes` |
| Servicio | `src/clientes/clientes.service.ts` | Lógica crear/listar (Delete pendiente) |
| DTO | `src/clientes/dto/create-empresa.dto.ts` | Validación al crear empresa |
| Entidad | `src/entities/empresa.entity.ts` | Modelo y tabla `empresa` |
| App | `src/app.module.ts` | Importa `ClientesModule` |

---

## Próximos pasos sugeridos

1. Implementar **`Delete()`** en `clientes.service.ts` (por ejemplo por `id_empresa`) y exponer `DELETE /clientes/:id` en el controlador.
2. Añadir **findOne** (por id) y **update** si se necesitan editar empresas.
3. Asegurar que la ruta de la entidad sea coherente en todo el proyecto (`empresa.entity.ts` vs `Empresa.entity.ts`).
