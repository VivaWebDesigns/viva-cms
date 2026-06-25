# Deployment Runbook

## Required Environment

- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_SECRET`: strong random JWT signing secret. Do not use the development default in production.
- `APP_URL`: recommended canonical public URL.

## Railway

- Deploy with `railway.toml`; Railway will run `npm run build` and `npm start`.
- The app binds to `0.0.0.0` in production by default. You can still set `HOST=0.0.0.0` explicitly.
- Add a Railway Postgres database or provide another PostgreSQL `DATABASE_URL`.
- Add a Railway Bucket for durable media/backups when the project needs hosted uploads.

## Object Storage

The CMS supports Railway Buckets, Cloudflare R2, and other S3-compatible storage. Railway Bucket credentials map directly to the generic variables below:

- `OBJECT_STORAGE_ENDPOINT` or Railway `ENDPOINT`
- `OBJECT_STORAGE_ACCESS_KEY_ID` or Railway `ACCESS_KEY_ID`
- `OBJECT_STORAGE_SECRET_ACCESS_KEY` or Railway `SECRET_ACCESS_KEY`
- `OBJECT_STORAGE_BUCKET` or Railway `BUCKET`
- `OBJECT_STORAGE_REGION` or Railway `REGION`; defaults to `auto`
- `OBJECT_STORAGE_PUBLIC_URL`; optional. When omitted, files are served through `/object-storage/...`.

Cloudflare R2 remains supported with these optional compatibility variables:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

Backups use the same object storage variables by default. Override only when backups should use a different bucket:

- `BACKUP_OBJECT_STORAGE_ENDPOINT`
- `BACKUP_OBJECT_STORAGE_ACCESS_KEY_ID`
- `BACKUP_OBJECT_STORAGE_SECRET_ACCESS_KEY`
- `BACKUP_OBJECT_STORAGE_BUCKET`
- `BACKUP_OBJECT_STORAGE_REGION`
- `BACKUP_OBJECT_STORAGE_PREFIX`; defaults to `system-backups`

## Commands

- `npm install`
- `npm run check`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm start`

Production startup runs the Drizzle migrations from `migrations/`.
