<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API REST **HelpDesk** (mesa de ayuda) con NestJS: autenticación JWT, clientes, hardware, tickets y planes/precios.

## Base de datos

La API usa **MySQL**. La conexión se configura en `src/database/database.module.ts` (host: localhost, puerto: 3306, usuario: root, base: helpdesk_db). Crea la base de datos `helpdesk_db` en tu servidor MySQL antes de ejecutar.

---

## Paso a paso: Cómo ejecutar la API

### 1. Instalar dependencias

En la raíz del proyecto:

```bash
npm install
```

### 2. Configurar entorno (opcional)

- Si quieres cambiar el puerto o el secreto JWT, copia el ejemplo y edita:
  ```bash
  copy .env.example .env
  ```
- En `.env` puedes definir por ejemplo:
  - `PORT=3000` (o el puerto que quieras)
  - `JWT_SECRET=tu_clave_secreta`

### 3. Ejecutar la API

**Modo desarrollo (recomendado):**

```bash
npm run start:dev
```

- La API quedará disponible en **http://localhost:3000** (o en el `PORT` que tengas en `.env`).
- Si ves el error *"address already in use"*, ese puerto está ocupado: cambia `PORT` en `.env` (por ejemplo `PORT=3002`) y vuelve a ejecutar.

**Otros comandos:**

```bash
# Una sola ejecución (sin recarga al cambiar código)
npm run start

# Producción (después de compilar)
npm run build
npm run start:prod
```

### 4. Comprobar que está corriendo

- Abre en el navegador o con Postman/Insomnia: **http://localhost:3000/**  
  Deberías recibir la respuesta de la raíz de la API.

---

## Paso a paso: Crear planes

Los **planes** son las ofertas/precios de tu HelpDesk (ej: Básico, Premium).

### 1. Listar planes existentes (público)

No requiere login.

```http
GET http://localhost:3000/planes
```

### 2. Crear un nuevo plan (requiere login)

Necesitas estar autenticado (token JWT).

**2.1. Iniciar sesión** (si aún no tienes usuario, regístrate antes con `POST /auth/register`):

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "correo": "tu@email.com",
  "contrasena": "tu_contraseña"
}
```

Copia el `token` de la respuesta.

**2.2. Crear el plan** enviando el token en el header:

```http
POST http://localhost:3000/planes
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "numero_plan": 1,
  "nombre": "Básico",
  "descripcion": "Soporte por correo, 5 tickets al mes.",
  "precio": 29.99
}
```

**Campos del body:**

| Campo        | Tipo   | Obligatorio | Descripción                          |
|-------------|--------|-------------|--------------------------------------|
| `numero_plan` | number | Sí          | Número o código del plan (ej: 1, 2) |
| `nombre`     | string | Sí          | Nombre del plan (ej: Básico)        |
| `descripcion`| string | Sí          | Qué incluye el plan                  |
| `precio`     | number | Sí          | Precio (ej: 29.99)                   |

### 3. Ver un plan por ID (público)

```http
GET http://localhost:3000/planes/1
```

### 4. Actualizar o eliminar un plan

- **Actualizar:** `PATCH http://localhost:3000/planes/:id` con body parcial y header `Authorization: Bearer <token>`.
- **Eliminar:** `DELETE http://localhost:3000/planes/:id` con header `Authorization: Bearer <token>`.

---

## Paso a paso: Crear tickets

Los **tickets** son los reportes de incidencias que abre un trabajador.

### Requisitos previos

- Usuario con rol **TRABAJADOR** (el que se asigna por defecto al registrarse).
- Al menos un **equipo** existente en la base de datos (necesitas su `id_equipo`). Si la base está vacía, tendrás que crear/insertar equipos por otro medio o usar un ID de equipo existente.

### 1. Registrar un usuario (si no tienes uno)

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@empresa.com",
  "contrasena": "MiClave123",
  "telefono": "999888777"
}
```

Ese usuario quedará con rol **TRABAJADOR** y podrá crear tickets.

### 2. Iniciar sesión y obtener el token

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "correo": "juan@empresa.com",
  "contrasena": "MiClave123"
}
```

Guarda el `token` de la respuesta; lo usarás en el siguiente paso.

### 3. Crear un ticket

Envía el token en el header `Authorization`:

```http
POST http://localhost:3000/ticket
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "asunto": "No enciende el monitor",
  "detalle": "El monitor de la estación 5 no da imagen desde hoy en la mañana.",
  "id_equipo": 1,
  "es_software": false
}
```

**Si el problema es de software**, pon `es_software: true` y opcionalmente `id_software` (ID del software relacionado):

```json
{
  "asunto": "Error al abrir el sistema",
  "detalle": "La aplicación se cierra al iniciar sesión.",
  "id_equipo": 1,
  "es_software": true,
  "id_software": 1
}
```

**Campos del body:**

| Campo        | Tipo    | Obligatorio | Descripción                                    |
|-------------|---------|-------------|------------------------------------------------|
| `asunto`    | string  | Sí          | Resumen del problema                          |
| `detalle`   | string  | Sí          | Descripción detallada del incidente            |
| `id_equipo` | number  | Sí          | ID del equipo afectado (debe existir en BD)   |
| `es_software` | boolean | Sí        | `true` si es incidencia de software           |
| `id_software` | number  | No (sí si es software) | ID del software relacionado          |
| `imagen_url`  | string  | No          | URL o evidencia en base64 (opcional)          |

### 4. Ver mis tickets

Solo el usuario autenticado (TRABAJADOR) ve sus propios tickets:

```http
GET http://localhost:3000/ticket/mis-tickets
Authorization: Bearer <tu_token>
```

### 5. Otras rutas de tickets (con token)

- **Listar todos:** `GET http://localhost:3000/ticket`
- **Ver uno:** `GET http://localhost:3000/ticket/:id`
- **Actualizar:** `PATCH http://localhost:3000/ticket/:id`
- **Eliminar:** `DELETE http://localhost:3000/ticket/:id`

---

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
