# Indomito Pay

Frontend Angular publico para consultar y pagar cuotas de pasajeros en Giras Indomito.

## Desarrollo local

```bash
npm ci
npm start
```

La aplicacion queda disponible en `http://localhost:4400` y consume la API compartida.

## Validacion

```bash
npm test -- --watch=false
npm run build:dev
```

## Despliegue DEV

```bash
npm run build:deploy:dev
```

El despliegue publica exclusivamente el artefacto de este repositorio en la distribucion de `pagos.dev.girasindomito.cl`.
