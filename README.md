## Aromalife Frontend - Personalización de Velas

Bienvenido al frontend de **Aromalife**, una aplicación web diseñada para ofrecer una experiencia única e inmersiva en la personalización de velas. Este repositorio contiene la interfaz de usuario y la experiencia de cliente.

## Tecnologías Utilizadas

- [Next.js](https://nextjs.org) - Framework para aplicaciones web modernas y rápidas
- React - Biblioteca para construir interfaces de usuario
- [Docker](https://www.docker.com) - Contenedores para facilitar el despliegue
- pnpm - Gestor de paquetes rápido y eficiente

## Requisitos Previos

- [Node.js](https://nodejs.org) (versión 16 o superior)
- [pnpm](https://pnpm.io) (instalación global recomendada)
- [Docker](https://www.docker.com) (opcional)

## Configuración del Proyecto

### Instalación

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Ejecutar el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

3. Para producción:

   ```bash
   pnpm build && pnpm start
   ```

### Acceder a la aplicación:
   - [http://localhost:3000](http://localhost:3000)

## Funcionalidades Clave del Frontend

- **Personalización de velas**:
  - Decorar espacios con test sensorial
  - Sentir emociones con test emocional
  - Opciones para regalar

- **Opciones avanzadas**:
  - Subir/generar imágenes, textos y audios
  - Visualización en realidad virtual
  - Generación de códigos QR

- **Sistema de suscripciones**
- **Carrito de compras y checkout**

## Pruebas

Ejecutar pruebas:

```bash
pnpm test
```

## Despliegue

### Despliegue con Vercel (recomendado)

1. Conectar tu repositorio a Vercel
2. Configurar las variables de entorno
3. El despliegue se activará automáticamente con cada push a la rama principal

### Despliegue Manual

1. Construir la aplicación:

   ```bash
   pnpm build
   ```

2. Los archivos estáticos se generan en la carpeta `.next/static`
3. Desplegar en tu servidor preferido

## Documentación

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [pnpm Documentation](https://pnpm.io/es/documentation)
- [Vercel Deployment](https://vercel.com/docs)


---

¡Gracias por elegir Aromalife! 