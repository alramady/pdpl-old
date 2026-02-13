# Railway Deployment Guide — NDMO Leak Monitor

## Quick Deploy Steps

### 1. Create Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub Repo**
3. Select the repository: `alramady/pdpl-old`

### 2. Add MySQL Database
1. In your Railway project, click **+ New** → **Database** → **MySQL**
2. Railway will automatically create a MySQL instance
3. Copy the `DATABASE_URL` from the MySQL service variables

### 3. Set Environment Variables
In the web service settings, add these environment variables:

| Variable | Value | Description |
|---|---|---|
| `DATABASE_URL` | *(from MySQL service)* | MySQL connection string |
| `JWT_SECRET` | *(generate a random 64-char string)* | Session cookie signing |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `3000` | Server port (Railway sets this automatically) |

**Optional (for AI features):**

| Variable | Value | Description |
|---|---|---|
| `OPENAI_API_KEY` | *(your key)* | For AI analysis features |
| `BUILT_IN_FORGE_API_URL` | *(API URL)* | For LLM integration |
| `BUILT_IN_FORGE_API_KEY` | *(API key)* | For LLM integration |

### 4. Deploy
Railway will automatically build and deploy using the Dockerfile.

### 5. Initialize Database
After the first deployment, run the database migration and seed:

```bash
# Connect to Railway shell
railway run pnpm db:push
railway run node seed-users.mjs
```

Or use the Railway CLI:
```bash
railway link
railway run pnpm db:push
railway run node seed-users.mjs
```

### 6. Login Credentials

| User ID | Password | Role | Name |
|---|---|---|---|
| `MRUHAILY` | `15001500` | Root Admin | Muhammed ALRuhaily |
| `aalrebdi` | `15001500` | Director | Alrebdi Fahad Alrebdi |
| `msarhan` | `15001500` | Vice President | Mashal Abdullah Alsarhan |
| `malmoutaz` | `15001500` | Manager | Manal Mohammed Almoutaz |

### 7. Custom Domain (Optional)
1. Go to your Railway service → **Settings** → **Networking**
2. Click **Generate Domain** for a Railway subdomain
3. Or add a custom domain and update your DNS records

## Architecture

```
Railway Project
├── Web Service (Node.js)
│   ├── Frontend (React + Vite)
│   └── Backend (Express + tRPC)
└── MySQL Database
    └── All tables (leaks, users, evidence, etc.)
```

## Troubleshooting

- **Build fails**: Ensure `pnpm-lock.yaml` is committed
- **DB connection error**: Verify `DATABASE_URL` includes `?ssl={"rejectUnauthorized":true}`
- **Login not working**: Run `node seed-users.mjs` to create users
- **Port issues**: Railway sets `PORT` automatically, the app reads it from env
