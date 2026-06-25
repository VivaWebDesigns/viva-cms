# Viva CMS

Reusable CMS starter for Railway-hosted projects. It includes login/setup, an admin dashboard, content tools, design settings, system docs/backups, and a generic public CMS runtime.

## Local Development

```bash
npm install
npm run check
npm run test
npm run dev
```

The local server defaults to `http://127.0.0.1:5000`. Set `PORT=5001` if port 5000 is unavailable.

## Railway

Railway uses `railway.toml`:

- Build: `npm run build`
- Start: `npm start`
- Healthcheck: `/api/health`

Required production variables:

- `DATABASE_URL`
- `SESSION_SECRET`
- `APP_URL`

Recommended for durable hosted uploads and backups:

- Railway Postgres for `DATABASE_URL`
- Railway Bucket or another S3-compatible object store for media and backups

See [docs/runbooks/deployment.md](docs/runbooks/deployment.md) for the full deployment checklist.

