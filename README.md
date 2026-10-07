# Indómito Pay (`app-ngx-pay`)

Portal público de pagos de Indómito Hub. Permite a un pasajero consultar sus cuotas con su RUT y el código de viaje, iniciar el pago en Khipu, ver el resultado del intento y verificar la autenticidad de un comprobante.

Consume el mismo backend que `app-ngx-hub` (panel administrativo), pero se compila, versiona y despliega de forma independiente. No incluye sesión, guards, IAM ni features administrativas.

## Funcionalidades

- Consulta de cuotas por RUT chileno y código de viaje (6 caracteres alfanuméricos).
- Pago con Khipu en una pestaña nueva, con correo de contacto e `Idempotency-Key` (ULID) por solicitud.
- Recuperación de intentos abiertos o en revisión al volver a consultar, y refresco del estado al recuperar el foco de la pestaña.
- Reenvío del comprobante por correo para pagos confirmados.
- Verificación pública de comprobantes por código (acepta el código en el hash de la URL).
- Tema claro/oscuro, con preferencia guardada en `localStorage` y respeto de `prefers-color-scheme`.
- Laboratorio de pruebas Khipu (DemoBank) para DEV en `/pruebas-khipu`.

## Stack

| Tecnología      | Versión (`package.json`)                 |
| --------------- | ---------------------------------------- |
| Angular         | `^22.1.0` (CLI y build `^22.1.3`)        |
| PrimeNG         | `^22.1.1` con `@primeuix/themes ^3.0.0`  |
| TailwindCSS     | `^4.3.3` (`@tailwindcss/postcss`)        |
| TypeScript      | `~6.0.2`                                 |
| RxJS            | `~7.8.0`                                 |
| Vitest + jsdom  | `^4.0.8` / `^28.0.0`                     |
| Prettier        | `^3.8.1`                                 |

Iconos con `@iconify/tailwind4` y el set `@iconify-json/tabler`.

## Requisitos previos

- Node.js `v24.15.0` (definido en `.nvmrc`; `nvm use`).
- npm `11.12.1` (campo `packageManager`).

## Instalación y desarrollo local

```bash
npm ci
npm start
```

`npm start` limpia la caché de Angular y levanta el servidor en `http://localhost:4400` con `proxy.conf.json`, que redirige `/api` hacia `https://api.dev.girasindomito.cl`. Las llamadas del portal usan la URL absoluta `environment.apiUrl`, de modo que el proxy aplica solo a rutas relativas bajo `/api` (por ejemplo, el laboratorio `/pruebas-khipu`).

## Scripts disponibles

| Script                    | Descripción                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `npm start`               | Limpia la caché y sirve en `localhost:4400` con proxy a la API DEV.                          |
| `npm run clean`           | Elimina `.angular/cache`.                                                                    |
| `npm run build`           | `ng build` con la configuración por defecto (`production`).                                  |
| `npm run build:dev`       | Build con `environment.dev.ts`.                                                              |
| `npm run build:prd`       | Build con `environment.production.ts`.                                                       |
| `npm run watch`           | Build en modo observación con la configuración `development`.                                |
| `npm test`                | `ng test` (Vitest vía `@angular/build:unit-test`).                                           |
| `npm run version:dev`     | Calcula la versión de `environment.dev.ts` desde los commits. **Crea commit y tag, y hace push** (admite `--no-push` ejecutando `node tools/versioning.js dev --no-push`). |
| `npm run version:prd`     | Igual que el anterior, sobre `environment.production.ts`.                                    |
| `npm run deploy:dev`      | Publica `dist/ind-pay-app-ngx-pri-gh/browser` en DEV (`tools/deploy-spa.sh dev`).            |
| `npm run build:deploy:dev`| Encadena `version:dev`, `build:dev` y `deploy:dev`.                                          |
| `npm run ng`              | Acceso directo a la CLI de Angular.                                                          |

## Configuración de entorno

La configuración vive en `src/environments/` y se selecciona con `fileReplacements` en `angular.json`. No hay archivos `.env`.

| Archivo                  | Configuración Angular | `apiUrl`                          | `stage` |
| ------------------------ | --------------------- | --------------------------------- | ------- |
| `environment.ts`         | `development`         | `https://api.dev.girasindomito.cl` | `local` |
| `environment.dev.ts`     | `dev`                 | `https://api.dev.girasindomito.cl` | `dev`   |
| `environment.production.ts` | `production`       | `https://api.girasindomito.cl`    | `prd`   |

Estos archivos solo contienen valores públicos (URL de la API, etapa y versión). Las variables sensibles nunca se declaran en el frontend: según los estándares del proyecto se gestionan únicamente mediante AWS SSM Parameter Store tipo SecureString.

## Rutas de la aplicación

Todas las páginas se cargan de forma diferida (`loadComponent`) desde `src/app/payment-portal/payment-portal.routes.ts`.

| Path                     | Página                      | Descripción                                                                 |
| ------------------------ | --------------------------- | --------------------------------------------------------------------------- |
| `/`                      | `LookupPage`                | Consulta de cuotas, checkout con Khipu, estado del intento y reenvío de comprobante. |
| `/pago-en-proceso`       | `PaymentTransitionPage`     | Pestaña intermedia que se abre mientras se crea el intento y redirige a Khipu. |
| `/retorno`               | `PaymentReturnPage`         | Destino de retorno desde Khipu; intenta cerrar la pestaña automáticamente.  |
| `/cancelado`             | `PaymentReturnPage`         | Destino cuando el usuario cancela en Khipu (misma página que `/retorno`).   |
| `/verificar-comprobante` | `ReceiptVerificationPage`   | Verificación de autenticidad de un comprobante por código.                  |
| `/pruebas-khipu`         | `KhipuDevPage`              | Laboratorio de pagos de prueba con DemoBank (solo DEV, sin dinero real).    |
| `**`                     | —                           | Redirige a `/`.                                                             |

## Flujo de pago

1. El pasajero ingresa RUT y código de viaje en `/`. El portal llama a `POST /pagos/consultas` y recibe las cuotas, junto con una sesión breve (`accessToken`, `expiresAt`) que se conserva solo en memoria.
2. Si existe un intento abierto o en revisión, se bloquean nuevos cobros y se consulta su estado.
3. Para pagar, el pasajero indica su correo. El portal abre `/pago-en-proceso` en una pestaña nueva y llama a `POST /pagos/portal/checkout` con `Idempotency-Key` (ULID generado en el cliente, reutilizado en reintentos).
4. Si la respuesta es `PENDING_PAYMENT` con una URL válida, la pestaña se redirige a Khipu. Solo se aceptan URLs `https` de `khipu.com` o `app.khipu.com`; si el navegador bloquea la pestaña se ofrece un botón de recuperación.
5. Khipu retorna a `/retorno` o `/cancelado`. La pestaña original consulta `GET /pagos/portal/intentos/{id}` al recuperar el foco y actualiza las cuotas con `GET /pagos/portal/cuenta` cuando el intento queda `CONFIRMED`, `REVIEW_REQUIRED` o `REVERSED`.

Estados de intento que maneja la interfaz: `PENDING_PAYMENT`, `CONFIRMED`, `REVIEW_REQUIRED`, `RECONCILIATION_REQUIRED`, `UNPAID_FINAL` y `REVERSED`.

## Flujo de comprobante

- Con un pago `CONFIRMED` y `receiptReady`, el pasajero puede pedir el reenvío por correo: `POST /pagos/portal/intentos/{id}/comprobante/reenvios` (con `commandId` idempotente).
- La verificación pública está en `/verificar-comprobante`: el código (ULID de 26 caracteres) se toma del campo o del hash de la URL y se valida con `POST /pagos/comprobantes/verificaciones`. El resultado indica si es auténtico y, de serlo, monto, fecha, concepto y estado.

## Integración con la API

Servicio: `src/app/payment-portal/services/public-payments.ts`. La base es `environment.apiUrl`. Las respuestas llegan envueltas en `{ data }`.

| Método y endpoint                                         | Uso                                        | Autorización             |
| --------------------------------------------------------- | ------------------------------------------ | ------------------------ |
| `POST /pagos/consultas`                                   | Consulta de cuotas por RUT y código de viaje | Pública                |
| `GET /pagos/portal/cuenta`                                | Refresco de cuotas                         | `Bearer` de la sesión del portal |
| `POST /pagos/portal/checkout`                             | Crear intento de pago                      | `Bearer` + `Idempotency-Key` |
| `GET /pagos/portal/intentos/{id}`                         | Estado del intento                         | `Bearer`                 |
| `POST /pagos/portal/intentos/{id}/comprobante/reenvios`   | Reenvío del comprobante                    | `Bearer`                 |
| `POST /pagos/comprobantes/verificaciones`                 | Verificar comprobante                      | Pública                  |

`KhipuDev` (`services/khipu-dev.ts`) usa rutas relativas `/api/khipu-dev/...` para el laboratorio de pruebas. Los datos del pasajero viajan en el cuerpo de las peticiones, nunca en la URL ni en almacenamiento web. No se usa ningún token administrativo. No hay interceptores HTTP: `provideHttpClient()` se registra sin ellos.

## Estructura del proyecto

```text
src/
├── environments/            # environment.ts / .dev.ts / .production.ts
├── styles.css               # Tailwind v4, tokens de marca (@theme) y variables del modo oscuro
└── app/
    ├── app.ts / app.html    # Armazón: <p-toast> + <router-outlet>
    ├── app.config.ts        # Providers: router, HttpClient, PrimeNG (preset, es-CL), locale es-CL
    ├── app.routes.ts        # Reexporta PAYMENT_PORTAL_ROUTES
    ├── core/
    │   ├── i18n/            # Traducciones de PrimeNG (es-CL)
    │   └── theme/           # Preset Indómito, ThemeService (claro/oscuro)
    ├── shared/
    │   ├── fn/              # newUlid (ULID criptográfico)
    │   └── validators/      # Validador de documento de identidad (RUT, DNI, CPF)
    └── payment-portal/      # Feature única y módulo de referencia
        ├── fn/              # Helpers de intentos y URL segura de Khipu
        ├── interfaces/      # Cuenta pública, intento, sesión, comprobante, Khipu DEV
        ├── pages/           # lookup, payment-transition, payment-return, receipt-verification, khipu-dev
        ├── services/        # PublicPayments, KhipuDev
        ├── validators/      # RUT y código de viaje del pasajero
        └── payment-portal.routes.ts
public/                      # Favicon y logo de marca
tools/                       # deploy-spa.sh, versioning.js
```

## Convenciones

- Componentes standalone con `ChangeDetectionStrategy.OnPush`, `inject()` y Signals para el estado.
- Plantillas con `@if`, `@for` y `@switch`.
- PrimeNG para controles y Tailwind CSS solo para layout y composición; sin CSS/SCSS propio ni otras librerías de componentes.
- Colores mediante tokens semánticos o variantes `dark:`; la selección de texto y los fondos de marca amarillos usan primer plano oscuro estable (`night`).
- Mobile-first: validar a 320 px, 390 px, tablet y escritorio, en modo claro y oscuro.
- Identificadores y archivos en inglés; TSDoc en español; textos de interfaz en español con tildes.
- No agregar rutas, guards, sesión ni features administrativas: pertenecen a `app-ngx-hub`.

## Pruebas

```bash
npm test -- --watch=false
```

Se ejecutan con Vitest (entorno `jsdom`, configurado en `vitest-base.config.ts` y `src/setup-vitest.ts`). Hay specs para las rutas del portal, `PublicPayments`, `LookupPage`, `KhipuDevPage`, los helpers de Khipu y el validador de documento. Antes de entregar cambios conviene ejecutar también `npm run build:dev`, que aplica los presupuestos de tamaño (500 kB de advertencia y 1 MB de error en el bundle inicial).

## Build y despliegue

| Ambiente | Dominio                      | Build               | Despliegue                                              |
| -------- | ---------------------------- | ------------------- | ------------------------------------------------------- |
| dev      | `pagos.dev.girasindomito.cl` | `npm run build:dev` | `npm run build:deploy:dev`                              |
| prd      | pendiente                    | `npm run build:prd` | No disponible: `tools/deploy-spa.sh` solo acepta `dev`. |

El despliegue DEV usa el perfil AWS `pa-dev` en `us-east-1`: valida la cuenta, obtiene el bucket y la distribución CloudFront desde el stack `indomito-hub-infra-payments-cdn-dev`, sincroniza los assets con caché larga, sube `index.html` sin caché e invalida `/index.html`. Publica exclusivamente el artefacto de este repositorio, sin tocar el panel administrativo.

Atención: `build:deploy:dev` ejecuta primero `version:dev`, que modifica la versión, crea un commit y un tag, y los sube al remoto. Para evitar el push, ejecuta los pasos por separado y usa `node tools/versioning.js dev --no-push`. No hay pipelines de CI/CD en este repositorio.

## Commits

Formato: `tipo(scope): descripcion breve en espanol sin tildes` (máximo 50 caracteres, límite duro 72). Sin Issue-ID.

- Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Scopes de este repo: `core`, `shared`, `payment`, `receipt`, `configuration`, `tools`.

## Documentación relacionada

- [AGENTS.md](AGENTS.md): contexto consolidado para agentes de IA (generado desde el orquestador; no editar a mano).
- Estándares en el repositorio orquestador (`ind-hub-orc-aws-sls-pri-gh`, carpeta hermana de este repo):
  - [Arquitectura Angular](../ind-hub-orc-aws-sls-pri-gh/docs/standards/frontend/angular-architecture.md)
  - [Uso del sistema de diseño](../ind-hub-orc-aws-sls-pri-gh/docs/standards/frontend/design-system-usage.md)
  - [Patrones de UI](../ind-hub-orc-aws-sls-pri-gh/docs/standards/frontend/ui-patterns.md)
  - [Reglas del dominio de órdenes](../ind-hub-orc-aws-sls-pri-gh/docs/standards/domains/orders-domain-rules.md)
  - [Mapa de repositorios](../ind-hub-orc-aws-sls-pri-gh/docs/standards/architecture/repo-map.md)
  - [Definición de ambientes](../ind-hub-orc-aws-sls-pri-gh/docs/standards/architecture/environment-definitions.md)
