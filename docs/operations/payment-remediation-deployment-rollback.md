# Despliegue y reversión de la remediación de Indómito Pay

Este documento prepara la operación. No autoriza ni ejecuta despliegues, pagos, correos o emisiones tributarias.

## Compatibilidad

Los cambios de respuesta son aditivos. `receiptReady` se conserva para clientes anteriores y los estados nuevos se agregan como campos opcionales. Los documentos y registros existentes no se reescriben de forma masiva.

- Comprobantes v1, v2 y v3 siguen siendo válidos. Los nuevos comprobantes y copias usan v4 con identidad minimizada.
- Una proyección tributaria anterior sin `siiStatus` se presenta como `PENDING` si solo acredita `SUBMITTED`, o `UNKNOWN` si no existe evidencia suficiente. No se infiere aceptación.
- Reemisiones nuevas vinculan folio original y folio de reemplazo sin publicar identificadores administrativos.
- La deshabilitación de checkout solo impide crear reservas nuevas. La consulta, confirmación, conciliación y documentación de intentos existentes continúa.

## Configuración previa

1. Confirmar por ambiente el valor efectivo de `PAYMENTS_CHECKOUT_ENABLED`.
2. El código fuente actual de `api-payment/serverless.ts` declara explícitamente `true` para `dev` y `prd`. Esta observación no acredita el valor de funciones ya desplegadas.
3. La variable queda declarada como requerida en `service.config.json`; un valor ausente o distinto de `true`/`false` hace fallar cerrado la creación de un cobro.
4. Confirmar SSM de Khipu, reCAPTCHA, SII y SMTP sin imprimir secretos.
5. Confirmar tabla, bucket, Stream y colas/DLQ del ambiente.
6. Validar el template resuelto y el perfil AWS correcto antes de cualquier autorización de despliegue.

## Orden propuesto

1. **Backend `services/api-payment`**: despliega la comprobación autoritativa, el contrato aditivo y la actualización de proyecciones tributarias.
2. **Backend `services/payment-receipts`**: despliega comprobantes v4 y estados independientes de entrega de comprobantes y boletas.
3. Esperar o recuperar trabajos pendientes y comprobar que no existen errores permanentes en Stream/DLQ.
4. **Frontend `ind-pay-app-ngx-pri-gh`**: despliega mensajes que consumen los campos aditivos.

El frontend anterior tolera campos extra. El frontend nuevo tolera respuestas anteriores porque los campos agregados son opcionales.

## Verificación previa en entorno de prueba

- Consulta válida e inválida, límites por IP y RUT/código normalizado.
- Checkout habilitado y deshabilitado mediante llamada directa al API.
- Repetición de la misma clave de idempotencia y concurrencia.
- Retorno/webhook ausente con conciliación automática.
- Pago confirmado con correo o SII fallidos.
- Comprobante disponible, SMTP aceptado, fallo y recuperación.
- Boleta `SUBMITTED`, aceptada, aceptada con reparos, rechazada y reemitida.
- Consulta pública exacta por folio, fecha y monto.
- Verificación de cabeceras `no-store`, aislamiento de cuenta/gira/intento y ausencia de datos personales completos en comprobantes v4.
- Frontend claro/oscuro, teclado y anchos 320, 390, tablet y escritorio.

No usar pagos, destinatarios ni folios productivos.

## Verificación posterior

1. Consultar cuotas sin iniciar un pago.
2. Verificar que la bandera efectiva coincide con la decisión del ambiente.
3. Completar un caso autorizado de prueba con Khipu de desarrollo.
4. Confirmar una sola referencia de proveedor, un solo movimiento y actualización de la cuota correcta.
5. Confirmar creación de comprobante v4 y estado de SMTP sin afirmar recepción.
6. Confirmar emisión tributaria de certificación, consulta de estado y entrega separada.
7. Revisar trabajos pendientes, reintentos y DLQ sin eliminar evidencia.
8. Revisar logs redactados y correlación, sin tokens, RUT, correos ni secretos completos.

## Reversión segura

1. Detener primero la publicación del frontend nuevo si el problema es solo visual.
2. Mantener el contrato backend aditivo; los clientes anteriores ignoran los campos extra.
3. No revertir `payment-receipts` a una versión que desconozca documentos v4 mientras existan trabajos v4 pendientes. Recuperar esos trabajos con la versión nueva o aplicar una corrección hacia adelante.
4. Si se debe deshabilitar el cobro, establecer explícitamente `PAYMENTS_CHECKOUT_ENABLED=false`. Esto no cancela intentos existentes.
5. Continuar ejecutando conciliación, comprobantes, emisión tributaria y entregas para pagos ya iniciados.
6. Restaurar código o configuración sin borrar pagos, intentos, referencias, folios, XML, PDF, colas tributarias ni auditoría.
7. No reutilizar folios ni recrear una boleta para resolver exclusivamente un fallo de correo.
8. Después de la reversión, comprobar intentos abiertos, trabajos de comprobantes, cola SII, estados pendientes y DLQ.

## Recuperación de trabajos

- Los intentos Khipu existentes se consultan y concilian por su identificador original.
- Los comprobantes fallidos conservan documento, estado e intentos; la recuperación administrativa debe reutilizar el recibo, no el pago.
- Las boletas rechazadas conservan el folio original y crean una solicitud de reemisión vinculada.
- Un trabajo tributario sin destinatario queda `DOCUMENT_READY_NO_RECIPIENT`, no `SENT`.
- Un SMTP aceptado solo acredita aceptación del servidor, no recepción del destinatario.
