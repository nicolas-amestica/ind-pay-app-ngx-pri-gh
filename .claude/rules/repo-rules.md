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
- TSDoc en español para funciones públicas e interfaces.
- Validar modo claro/oscuro y anchos de 320 px, 390 px, tablet y escritorio.

## Scopes de commits

`core`, `shared`, `payment`, `receipt`, `configuration`, `tools`
