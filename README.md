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

- `DATABASE_URL`: SQLite local por defecto. El esquema Prisma está preparado para migrarse a PostgreSQL cambiando el provider y la URL.
- `APP_URL`: URL pública usada en los enlaces directos de los correos.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: credenciales del servidor SMTP.

Sin SMTP, los tickets se crean normalmente y el contenido del correo queda registrado en la consola del servidor para diagnóstico. El email principal se administra desde Configuración.

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

La base local se inicializa con el administrador `maycolljaramillo01@gmail.com` y un usuario colaborador de ejemplo para poder asignar trabajo desde el primer arranque.
