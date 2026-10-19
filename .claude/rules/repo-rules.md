<!-- AUTO-GENERATED — DO NOT EDIT MANUALLY -->
<!-- Managed-By: indomito-context-compiler -->
<!-- Artifact-Format: 1 -->
<!-- Engine-Version: 1.0.0 -->
<!-- Source: ai/source/repo-overrides/app-ngx-pay.md -->
# Repo Rules — app-ngx-pay

# Repo Override — app-ngx-pay

> Contexto específico del frontend público Angular de pagos.

## Descripción

SPA Angular 22 pública para consultar cuotas por RUT y código de viaje, iniciar pagos con Khipu, procesar retornos y verificar comprobantes. Consume el mismo backend que `app-ngx-hub`, pero se compila y despliega de forma independiente.

## Stack

- Angular 22 con componentes standalone, signals e `inject()`
- PrimeNG v22 y TailwindCSS v4.3
- TypeScript 6 y Vitest

## Reglas

- No incorporar rutas, guards, sesión, IAM ni features administrativas de `app-ngx-hub`.
- No exponer datos administrativos ni secretos; toda autorización pública se resuelve mediante los endpoints diseñados para el portal.
- Standalone components y `ChangeDetectionStrategy.OnPush`.
- PrimeNG para controles y Tailwind para composición, respetando los estándares visuales.
- El sistema de iconos de este repo es Iconify/Tabler, con clases `icon-[tabler--nombre]` más un tamaño explícito (`size-4` en botones con etiqueta, `size-5` en icon-only). PrimeIcons está prohibido aquí: el paquete no está instalado, el CSS compilado no contiene ninguna regla `.pi-*` y toda clase `pi pi-*` es inerte — el síntoma típico es un botón icon-only completamente en blanco. No usar `pi` ni en plantillas, ni en el input `icon` de un componente, ni en constantes, mapas de menú o datos.
- Al agregar un icono, verificar que el nombre existe de verdad en el set instalado (`file-pdf` no existe: el correcto es `file-type-pdf`; `check-circle` tampoco: es `circle-check`) y comprobar en el CSS emitido que la clase se generó, no solo que está escrita en la plantilla. Los botones icon-only requieren `ariaLabel`/`aria-label` y los iconos decorativos dentro de un botón con etiqueta van con `aria-hidden="true"`; no usar `pButtonIcon` sin un `pButtonLabel` hermano, porque la directiva infiere icon-only y colapsa el ancho del botón. Mecánica detallada en `docs/standards/frontend/design-system-usage.md`.
- TSDoc en español para funciones públicas e interfaces.
- Validar modo claro/oscuro y anchos de 320 px, 390 px, tablet y escritorio.

## Scopes de commits

`core`, `shared`, `payment`, `receipt`, `configuration`, `tools`
