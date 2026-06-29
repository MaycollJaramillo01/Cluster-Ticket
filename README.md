# TaskFlow Agency

Sistema interno de tickets para soporte, Google Ads y sitios web. Incluye CRUD, tabla filtrable, Kanban, calendario, comentarios, historial, archivos, recordatorios, notificaciones del navegador y correo SMTP.

## Inicio local

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Abre `http://localhost:3000` (Next.js elegirá otro puerto si está ocupado).

## Variables de entorno

Copia `.env.example` a `.env` y configura:

- `DATABASE_URL`: conexión agrupada de Neon PostgreSQL usada por la aplicación.
- `DATABASE_URL_UNPOOLED`: conexión directa de Neon usada por Prisma para cambios de esquema.
- `APP_URL`: URL pública usada en los enlaces directos de los correos.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: credenciales SMTP de Brevo. Usa `smtp-relay.brevo.com`, puerto `587` y una clave SMTP (no una API key).

Brevo ofrece un plan gratuito de 300 emails diarios. Debes crear la cuenta, verificar `maycolljaramillo01@gmail.com` como remitente y copiar el usuario y la clave de la sección SMTP. Sin esas credenciales, los tickets se crean normalmente y el contenido del correo queda registrado en la consola del servidor para diagnóstico.

## Recordatorios

Las notificaciones de escritorio usan la Notification API y abren directamente el ticket. Mientras la aplicación está abierta, el cliente revisa vencimientos cada minuto.

Para procesar emails de recordatorio en producción aun sin usuarios conectados, programa un cron que ejecute:

```http
POST /api/reminders/process
```

## Archivos

En desarrollo se guardan en `public/uploads/<ticket-id>`. Se validan extensión y un máximo de 15 MB por archivo. Para producción distribuida se recomienda reemplazar esta capa por S3 o Supabase Storage.

## Verificación

```bash
npm run build
npm audit --omit=dev
```

La base de Neon se inicializa con `maycolljaramillo01@gmail.com`. Todas las tareas se asignan a este usuario desde el servidor y los correos se envían a esa dirección.
