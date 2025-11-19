# VPS Deployment Guide - TarotFR

## Overview

This guide covers deploying TarotFR on your VPS with proper Supabase integration using service role key for server-side operations.

## Architecture

- **Frontend**: Deployed on Netlify at https://www.tarotfr.com
- **Next.js Server**: Running on VPS via PM2 (API routes + SSR)
- **WebSocket Server**: Running on VPS via PM2 at wss://ws.tarotfr.com
- **Database**: Supabase PostgreSQL with Row Level Security

## Key Changes Made

### 1. Server-Side Supabase Client

Created `lib/supabaseAdmin.ts` that uses `SUPABASE_SERVICE_ROLE_KEY`:
- Used by all API routes in `app/api/**`
- Used by WebSocket server in `server/websocket.ts`
- Bypasses Row Level Security for legitimate server operations
- Never exposed to browser/client

### 2. Client-Side Supabase Client

Existing `lib/supabase.ts` continues to use `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
- Used only in browser/React components
- Respects Row Level Security policies
- Public operations only (SELECT)

### 3. PM2 Configuration

Created `ecosystem.config.js` for centralized process management with proper environment variables.

## Deployment Steps

### Step 1: Update Code on VPS

```bash
cd /var/www/tarotfr
git pull origin main
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Compile WebSocket Server

```bash
npx tsc server/websocket.ts --module commonjs --target es2019 --outDir server-dist
```

### Step 4: Build Next.js

```bash
npm run build
```

### Step 5: Configure Environment Variables

Edit `ecosystem.config.js` and replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual Supabase service role key:

```bash
nano ecosystem.config.js
```

Find these lines in BOTH apps (tarotfr-web and tarotfr-ws):
```javascript
SUPABASE_SERVICE_ROLE_KEY: 'YOUR_SERVICE_ROLE_KEY_HERE',
```

Replace with your actual service role key from Supabase Dashboard > Settings > API.

**CRITICAL**: Never commit the service role key to git!

### Step 6: Create Logs Directory

```bash
mkdir -p logs
```

### Step 7: Stop Existing PM2 Processes

```bash
pm2 delete all
```

Or specifically:
```bash
pm2 delete tarotfr-web
pm2 delete tarotfr-ws
```

### Step 8: Start with PM2 Ecosystem Config

```bash
pm2 start ecosystem.config.js
pm2 save
```

### Step 9: Verify Processes

```bash
pm2 list
pm2 logs
```

You should see:
- `tarotfr-web` - status: online
- `tarotfr-ws` - status: online

### Step 10: Test Endpoints

Test API routes:
```bash
# Test guest creation
curl -X POST http://localhost:3000/api/auth/guest

# Test table creation
curl -X POST http://localhost:3000/api/tables/create

# Test table listing
curl http://localhost:3000/api/tables/list
```

Test WebSocket:
```bash
# Check WebSocket is listening
ss -ltnp | grep 3001
```

### Step 11: Verify Nginx

Restart Nginx to ensure all configs are loaded:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Variables Summary

### Required on VPS

**For Next.js Server (tarotfr-web):**
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://amwwthdjnsnociqbodtz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_WS_URL=wss://ws.tarotfr.com
SUPABASE_URL=https://amwwthdjnsnociqbodtz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**For WebSocket Server (tarotfr-ws):**
```bash
NODE_ENV=production
WS_PORT=3001
SUPABASE_URL=https://amwwthdjnsnociqbodtz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Required on Netlify (Frontend)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://amwwthdjnsnociqbodtz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_WS_URL=wss://ws.tarotfr.com
```

## Row Level Security (RLS) Policies

The migration `optimize_rls_for_service_role` has been applied with these principles:

### Service Role (Server-Side)
- Bypasses ALL RLS policies
- Used for INSERT, UPDATE, DELETE operations
- Never exposed to client

### Anon Key (Client-Side)
- Respects RLS policies
- Allowed: SELECT on all tables for read-only access
- Blocked: INSERT, UPDATE, DELETE (must go through API routes)

### Security Notes

1. **Service role key**: NEVER expose to browser or commit to git
2. **Anon key**: Safe to expose in browser (public read-only access)
3. **Write operations**: Always go through API routes using service role
4. **Read operations**: Can be done from browser using anon key

## Troubleshooting

### 401 Unauthorized Errors

**Cause**: API route trying to use anon key for write operations

**Solution**: Verify the route imports `supabaseAdmin` from `@/lib/supabaseAdmin`, not `supabase` from `@/lib/supabase`

### WebSocket Connection Failed

**Check if WebSocket server is running:**
```bash
pm2 logs tarotfr-ws
ss -ltnp | grep 3001
```

**Check Nginx proxy:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database Operation Failed

**Check service role key is set:**
```bash
pm2 describe tarotfr-web | grep SUPABASE_SERVICE_ROLE_KEY
pm2 describe tarotfr-ws | grep SUPABASE_SERVICE_ROLE_KEY
```

**Check logs:**
```bash
pm2 logs tarotfr-web --lines 50
pm2 logs tarotfr-ws --lines 50
```

### Build Warnings About Service Role Key

During `npm run build`, you may see:
```
SUPABASE_SERVICE_ROLE_KEY is not configured. Using placeholder for build.
```

This is **expected and safe**. The service role key is only needed at runtime, not build time.

## PM2 Commands Reference

```bash
# Start processes
pm2 start ecosystem.config.js

# Restart all
pm2 restart all

# Restart specific app
pm2 restart tarotfr-web
pm2 restart tarotfr-ws

# Stop all
pm2 stop all

# View logs
pm2 logs
pm2 logs tarotfr-web
pm2 logs tarotfr-ws

# Monitor
pm2 monit

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

## File Structure

```
/var/www/tarotfr/
├── app/                          # Next.js app directory
│   └── api/                      # API routes (use supabaseAdmin)
├── lib/
│   ├── supabase.ts              # Client-side (anon key)
│   └── supabaseAdmin.ts         # Server-side (service role key)
├── server/
│   └── websocket.ts             # WebSocket source (TypeScript)
├── server-dist/
│   └── server/
│       └── websocket.js         # Compiled WebSocket server
├── ecosystem.config.js          # PM2 configuration
├── logs/                        # PM2 logs directory
│   ├── web-error.log
│   ├── web-out.log
│   ├── ws-error.log
│   └── ws-out.log
└── .next/                       # Next.js build output
```

## Security Checklist

- [ ] Service role key is set in `ecosystem.config.js`
- [ ] Service role key is NOT committed to git
- [ ] Service role key is NOT in any public files
- [ ] `.env` file (if used) is in `.gitignore`
- [ ] All API routes use `supabaseAdmin`
- [ ] WebSocket server uses `supabaseAdmin`
- [ ] Client components use `supabase` (anon key)
- [ ] RLS policies are enabled on all tables
- [ ] PM2 is configured to auto-restart on failure
- [ ] Nginx is configured correctly for WebSocket
- [ ] SSL certificates are valid

## Next Steps

After successful deployment:

1. Test guest user creation from frontend
2. Test table creation and joining
3. Test WebSocket connection and game flow
4. Monitor PM2 logs for any errors
5. Check database for proper data insertion

## Support

If issues persist:

1. Check PM2 logs: `pm2 logs --lines 100`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify Supabase connection in Supabase Dashboard > Logs
4. Ensure all environment variables are set correctly
