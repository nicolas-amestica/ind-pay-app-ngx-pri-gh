# Preparación normativa y de privacidad de Indómito Pay

**Versión técnica:** 2026-11-17  
**Alcance:** consulta de cuotas, pago Khipu, comprobantes internos y boletas electrónicas.  
**Estado:** antecedentes empresariales incorporados y controles técnicos implementados. Persisten validaciones jurídicas y tributarias expresamente señaladas; este documento no declara cumplimiento legal completo.

## Fuentes verificadas

- [Ley 19.628, texto oficial de LeyChile](https://www.bcn.cl/leychile/navegar?idNorma=141599).
- [Ley 21.719, texto oficial de LeyChile](https://www.bcn.cl/leychile/navegar?i=1209272), con vigencia general prevista para el 1 de diciembre de 2026.
- [Ley 19.496, texto oficial de LeyChile](https://www.bcn.cl/leychile/navegar?idNorma=61438&idParte=0&idVersion=).
- [Decreto 6 de 2021, Reglamento de Comercio Electrónico](https://www.bcn.cl/leychile/navegar?idNorma=1165504).
- [Portal oficial del SII sobre boleta electrónica](https://www.sii.cl/destacados/boletas_electronicas/).
- [SII: un reparo corresponde a un documento válido aceptado y almacenado](https://www.sii.cl/preguntas_frecuentes/factura_electronica/001_003_6422.htm).
- [Ley 21.663, Marco de Ciberseguridad](https://www.bcn.cl/leychile/navegar?idNorma=1202434&idParte=10496171).
- [Términos de Khipu](https://www.khipu.com/page/terminos-condiciones).
- [Política de privacidad de Khipu](https://www.khipu.com/page/politicas-privacidad).
- [Portal de SolucionHost](https://panel.solucionhost.host/).

El contenido de las fuentes externas se resume y reformula.

## Responsable y contacto confirmados

| Dato                   | Valor informado por la empresa                                                    |
| ---------------------- | --------------------------------------------------------------------------------- |
| Razón social           | Giras Indómito Limitada                                                           |
| RUT                    | 77.654.796-4                                                                      |
| Domicilio              | Las Coles 2450, sector Cam Cato, Cam Cato km 1, Chillán, Región de Ñuble, Chile   |
| Representantes legales | Susana Wendolyne Guevara Sotomayor y Nicolás Eduardo Améstica Vidal               |
| Contacto de pagos      | pagos@girasindomito.cl · +56 9 6366 2893                                          |
| Contacto de privacidad | soporte@girasindomito.cl                                                          |
| Horario                | Lunes a viernes 09:00–22:00; sábado 09:00–14:00; domingos y festivos sin atención |
| Primera respuesta      | Dentro de 3 horas del horario de atención; no garantiza resolución definitiva     |

La empresa informó que la misma entidad firma los contratos, cobra y emite las boletas.

## Alcance contractual

Indómito Pay ejecuta pagos de cuotas de una gira contratada previamente. No celebra por sí solo un nuevo contrato ni debe modificar importes, vencimientos, asignación de pagos o condiciones pactadas.

Khipu actúa sobre cobros convenidos previamente entre cobrador y pagador. Sus términos indican que las controversias del negocio subyacente se resuelven entre esas partes y que, una vez autorizada la transferencia, la restitución se solicita al cobrador.

## Titulares, datos y finalidades

| Titular                           | Datos                                                         | Origen                        | Finalidad                                                             |
| --------------------------------- | ------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| Pasajero                          | Nombre, RUT, gira, cuotas y pagos                             | Contrato, nómina y operación  | Administrar participación, identificar cuenta, cobrar y asignar pagos |
| Padre, madre, tutor o apoderado   | Identidad, contacto y representación                          | Contrato y canales operativos | Representar al menor dentro de facultades acreditadas                 |
| Representante del grupo           | Identidad, contacto y alcance contractual                     | Contrato grupal               | Coordinar la gira y solicitudes dentro del alcance documentado        |
| Pagador                           | Correo, intento, importe y resultado                          | Portal y Khipu                | Procesar el pago y entregar comprobante y boleta                      |
| Solicitante de soporte o derechos | Identidad, canal, solicitud y evidencia                       | Correo, WhatsApp u otro canal | Verificar, responder y dejar trazabilidad                             |
| Usuario técnico                   | IP o prefijo de red, agente de usuario y evaluación reCAPTCHA | Solicitud HTTP                | Seguridad, limitación de abuso y prevención de fraude                 |

Pasajero, representante y pagador pueden ser personas distintas. El código conserva el correo asociado al intento, comprobante y entrega documental; por tanto, no corresponde afirmar que nunca se almacena.

## Menores y representación

La empresa informó que los representantes del grupo pueden consultar y solicitar modificaciones de pasajeros y comprobantes dentro de su operación actual. Esta práctica requiere validación jurídica específica, porque ser representante del curso no acredita automáticamente facultades legales sobre cada menor.

Decisión técnica y procedimental aplicada:

- Solicitud normal: canal conocido más antecedentes del contrato o gira.
- Solicitud sensible, disputa de representación o cambio de destinatario: revisión manual y antecedentes adicionales proporcionales.
- Ante una controversia no resuelta: suspender la entrega o modificación hasta acreditar facultades suficientes.
- No bloquear la consulta o el pago legítimo por una disputa documental que pueda tratarse de manera separada.

## Proveedores y destinatarios

| Tercero                               | Uso acreditado                                                           | Información relevante                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Khipu SpA                             | Aplicación Terminal de Pago Khipu; checkout, confirmación y conciliación | Sus políticas informan tratamiento de datos de pagos y uso de IBM Cloud, Amazon, Zendesk y Google Analytics |
| Google reCAPTCHA Enterprise           | Protección antifraude del checkout                                       | Recibe token, acción, IP y agente de usuario; puede implicar infraestructura internacional                  |
| Amazon Web Services                   | Lambda, DynamoDB, S3 y SSM                                               | Indómito Pay usa us-east-1, Estados Unidos; la empresa informó que no replica en otras regiones             |
| SolucionHost SpA                      | Hosting y webmail para SMTP                                              | La empresa informó operación en Chile, conservación de correos y registros de entrega o rebote              |
| SII                                   | Recepción y seguimiento de boletas electrónicas                          | Recibe los datos tributarios exigidos y devuelve estado de procesamiento                                    |
| Bancos y proveedores propios de Khipu | Ejecución de la transferencia                                            | Se rigen por el flujo y políticas de Khipu                                                                  |

La afirmación empresarial de que Khipu procesa exclusivamente en Chile no puede acreditarse con su política pública, que menciona proveedores internacionales. Debe prevalecer esa advertencia hasta revisar el contrato y sus anexos.

## Transferencias internacionales

AWS procesa los datos de Pay en us-east-1, Estados Unidos. Google reCAPTCHA puede procesar señales fuera de Chile. La política de Khipu informa proveedores tecnológicos internacionales. La empresa debe conservar los contratos y garantías aplicables, incluidos los acuerdos de tratamiento de datos cuando correspondan.

Pagar desde otro país no determina dónde se almacenan o procesan los datos.

## Conservación, eliminación y bloqueo

La empresa informó que actualmente conserva indefinidamente contratos, datos de pasajeros, cuotas, pagos, intentos, comprobantes, boletas, XML, correos, reversas, devoluciones y solicitudes; utiliza eliminación lógica y mantiene visibilidad administrativa. No existe eliminación física automática.

Esta práctica no debe presentarse como cumplimiento definitivo. La conservación debe limitarse por finalidad y considerar:

- Contrato y defensa de derechos.
- Conciliación, reversas y devoluciones.
- Obligaciones tributarias y trazabilidad de folios.
- Seguridad y prevención de cobros duplicados.
- Solicitudes e incidentes.

Controles con plazo acreditado en código:

- Sesión de pasajero: 10 minutos.
- Logs de Lambda y API: 14 días.

Pendiente antes de la entrada en vigencia general de la Ley 21.719: aprobar una tabla de conservación por categoría y un procedimiento de bloqueo o eliminación física al terminar el fundamento. Nunca se eliminan pagos confirmados, reutilizan folios o borran evidencias tributarias sin analizar las obligaciones aplicables.

## Derechos

Canal: soporte@girasindomito.cl. El equipo de soporte recibe las solicitudes y los representantes legales deciden. La búsqueda operativa corresponde al encargado de Operaciones y Ventas.

Procedimiento inicial documentado:

1. Registrar la solicitud con fecha y canal.
2. Verificar el canal conocido y antecedentes del contrato o gira.
3. Aplicar revisión manual en solicitudes sensibles o disputadas.
4. Localizar información en contratos, pagos, documentos y correo.
5. Consultar al contador cuando exista evidencia tributaria.
6. Corregir, bloquear o eliminar cuando corresponda.
7. Informar si una obligación impide eliminar y restringir usos incompatibles.
8. Conservar evidencia de la respuesta.

La empresa aún no dispone de un sistema formal de registro ni un plazo aprobado. La práctica de atención inmediata no debe publicarse como garantía de resolución.

## Incidentes

Canales internos actuales: WhatsApp, correo y Jira para problemas técnicos. Responsables informados: equipo de soporte en lo técnico y Susana Wendolyne Guevara Sotomayor en coordinación administrativa y comunicaciones.

Clasificación inicial:

- Crítico: posible doble cobro, credenciales comprometidas o exposición masiva.
- Alto: documento enviado a una persona incorrecta o acceso indebido a un pasajero.
- Medio: correo fallido, boleta pendiente o error recuperable.
- Bajo: consulta o problema visual sin afectación financiera.

Flujo: registrar, contener, preservar evidencia, identificar afectados, corregir sin borrar evidencia financiera o tributaria, evaluar comunicaciones, recuperar y documentar mejoras. La empresa confirmó que aún no existe plan formal ni simulacros.

## Reversas y devoluciones

La empresa informó un plazo contractual máximo de 30 días hábiles desde la confirmación de la solicitud por el cliente. La autorización final corresponde a Susana Wendolyne Guevara Sotomayor como encargada de Operaciones y Ventas. El tiempo bancario posterior puede depender de Khipu o del banco.

Un rechazo SII se trata así: pago confirmado, registro del rechazo, revisión con Contabilidad Leupin, corrección o reemisión según corresponda, conservación del folio original y ausencia de un cobro nuevo.

## Cookies, navegador y terceros

- `localStorage` conserva la preferencia de tema.
- La pantalla Khipu de desarrollo usa `localStorage`, pero no se publica en producción.
- La sesión de pasajero permanece en memoria.
- reCAPTCHA se carga al iniciar checkout.
- No se encontró publicidad ni analítica propia en Indómito Pay.
- Khipu aplica sus tecnologías y políticas después de la redirección.

No se agrega un banner genérico mientras no exista un tratamiento opcional que requiera elección. La protección antifraude se mantiene.

## Acceso maestro

La empresa eligió mantenerlo temporalmente. Lo usa Nicolás Eduardo Améstica Vidal para verificar pagos. No existe trazabilidad individual porque es un secreto compartido. La remediación enmascara nombres y conserva límites, rotación y revocación administrativa.

Riesgo pendiente: definir una frecuencia de rotación y una fecha de retiro. La opción recomendada sigue siendo identidad administrativa individual cuando se autorice ampliar el alcance al authorizer o Hub.

## Ley 21.663

La empresa presta servicios turísticos y subcontrata transporte y otros servicios. Usa Khipu para cobrar servicios propios, no opera infraestructura de pagos para terceros y no ha recibido calificación como servicio esencial u operador de importancia vital. No se afirma aplicabilidad especial sin una calificación o análisis jurídico de la actividad real.

## Evidencias pendientes

- Contrato y anexos vigentes de Khipu.
- Condiciones y acuerdo de tratamiento aplicables a Google Cloud.
- AWS Data Processing Addendum aplicable a la cuenta.
- Contrato, retención y subproveedores de SolucionHost.
- Tabla de conservación y eliminación aprobada.
- Validación jurídica del alcance de representantes del grupo sobre menores.
- Procedimiento formal y registro de derechos e incidentes.
- Validación tributaria de devoluciones y correcciones por Contabilidad Leupin.
- Evidencia productiva de entrega SMTP y estados SII, sin confundirla con pruebas locales.
