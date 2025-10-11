# Deployment Guide - HH Process Map

This guide covers deploying the Process Map application to Railway (recommended) or other platforms.

## 🚂 Railway Deployment (Recommended)

Railway provides easy deployment with PostgreSQL database included.

### Step 1: Prepare Your Repository

1. Ensure your code is in a Git repository
2. Push all changes to GitHub/GitLab/Bitbucket

### Step 2: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign up or log in
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision a database

### Step 4: Configure Environment Variables

In Railway project settings, add these environment variables:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-populated by Railway
NEXTAUTH_URL=https://your-project.railway.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

### Step 5: Configure Build Settings

Railway should auto-detect Next.js. Verify these settings:

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Install Command:** `npm install`

### Step 6: Deploy Database Schema

After first deploy, run migrations:

1. Open Railway project → "Settings" → "Deployments"
2. Select latest deployment → "View Logs"
3. Or use Railway CLI:

```bash
railway login
railway link
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### Step 7: Access Your Application

1. Railway will provide a public URL (e.g., `https://your-project.railway.app`)
2. Update `NEXTAUTH_URL` environment variable with this URL
3. Redeploy if needed

## 🔐 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Generate new `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Update `DATABASE_URL` to use production database
- [ ] Enable SSL for database connection (`?sslmode=require`)
- [ ] Review and update user roles
- [ ] Test authentication flow
- [ ] Verify API route permissions
- [ ] Check CORS settings if needed
- [ ] Enable database backups

## 📊 Post-Deployment Setup

### 1. Create Admin User

If you didn't seed the database, create an admin user:

```typescript
// Use Prisma Studio: railway run npx prisma studio
// Or create via API/script
```

### 2. Load Initial Data

Run the seed script to populate:
- Default users (David, Kristie, Cody)
- Business sections
- Sample components with metrics
- Example todos, issues, ideas

```bash
railway run npx prisma db seed
```

### 3. Create First Snapshot

Create a baseline snapshot for future comparison:

```bash
curl -X POST https://your-app.railway.app/api/snapshots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"name": "Initial Production Snapshot"}'
```

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your main branch.

### Automated Migrations

Add a custom deploy script in `package.json`:

```json
{
  "scripts": {
    "deploy": "prisma migrate deploy && npm run build"
  }
}
```

Update Railway build command to: `npm run deploy`

## 📦 Alternative: Docker Deployment

If deploying to a platform that supports Docker:

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/hh_process_map
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-here
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=hh_process_map
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Deploy with: `docker-compose up -d`

## ☁️ Alternative: Vercel Deployment

Vercel works great for Next.js, but you'll need an external database.

### Step 1: Set Up Database

Use a hosted PostgreSQL service:
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Serverless Postgres)
- [PlanetScale](https://planetscale.com) (MySQL alternative)
- [Railway](https://railway.app) (Just the database)

### Step 2: Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Or connect your GitHub repo in the Vercel dashboard.

### Step 3: Configure Environment Variables

In Vercel project settings, add:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-new-secret
```

### Step 4: Run Migrations

Migrations need to run before deployment. Add to `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## 🔧 Environment Variables Reference

### Required

```bash
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="<random-32-character-string>"
```

### Optional (Future Integrations)

```bash
TWENTY_API_KEY="your-twenty-crm-api-key"
TWENTY_API_URL="https://api.twenty.com"
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"
```

## 📈 Monitoring & Maintenance

### Database Backups

**Railway:** Automatic backups included in paid plans

**Manual Backup:**
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

**Restore:**
```bash
railway run psql $DATABASE_URL < backup.sql
```

### Performance Monitoring

Monitor these metrics:
- Response times (API routes)
- Database query performance
- Error rates
- User activity

Tools:
- Railway built-in monitoring
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [New Relic](https://newrelic.com) for APM

### Database Maintenance

Run these periodically:

```sql
-- Analyze tables for query optimization
ANALYZE;

-- Clean up old activity logs (older than 90 days)
DELETE FROM activity_logs WHERE "createdAt" < NOW() - INTERVAL '90 days';

-- Vacuum to reclaim storage
VACUUM;
```

## 🚨 Troubleshooting

### "Module not found: Can't resolve 'prisma'"

Run: `npm run prisma:generate`

### Database connection errors

- Verify `DATABASE_URL` is correct
- Check if database allows connections from your IP
- Ensure `?sslmode=require` is in connection string for production

### Authentication not working

- Verify `NEXTAUTH_URL` matches your actual URL
- Check `NEXTAUTH_SECRET` is set
- Clear cookies and try again

### Migration errors

```bash
# Reset database (WARNING: Deletes all data)
railway run npx prisma migrate reset

# Or push schema without migration
railway run npx prisma db push
```

## 📞 Support

For deployment issues:
1. Check Railway/Vercel logs
2. Review Prisma migration history
3. Verify environment variables
4. Contact platform support

For application issues:
- Check application logs
- Review recent database changes
- Test API endpoints directly
- Check browser console for errors

## 🔄 Rollback Strategy

If a deployment fails:

1. **Railway:** Use "Deployments" tab to rollback to previous version
2. **Database:** Restore from backup if schema changed
3. **Code:** Revert Git commit and redeploy

Always test migrations in a staging environment first!

---

**Ready to deploy?** Start with Railway for the easiest experience, or choose the platform that fits your infrastructure.
