# Quick Start - VPS Deployment

## TL;DR

5 commands to deploy everything:

```bash
# 1. Pull latest code
cd /var/www/tarotfr && git pull

# 2. Install and build
npm install && npm run build

# 3. Compile WebSocket
npx tsc server/websocket.ts --module commonjs --target es2019 --outDir server-dist

# 4. Edit ecosystem.config.js with your service role key
nano ecosystem.config.js
# Replace: YOUR_SERVICE_ROLE_KEY_HERE

# 5. Start with PM2
mkdir -p logs && pm2 delete all && pm2 start ecosystem.config.js && pm2 save
```

## Verify Everything Works

```bash
# Check processes are running
pm2 list

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/guest
curl -X POST http://localhost:3000/api/tables/create
curl http://localhost:3000/api/tables/list

# Check WebSocket is listening
ss -ltnp | grep 3001

# View logs
pm2 logs --lines 20
```

## What Changed?

1. **Server-side operations** now use `SUPABASE_SERVICE_ROLE_KEY` instead of anon key
2. **All API routes** updated to use new admin client
3. **WebSocket server** updated to use admin client
4. **PM2 config** centralizes all environment variables
5. **RLS policies** simplified for service role approach

## Important

- Replace `YOUR_SERVICE_ROLE_KEY_HERE` in `ecosystem.config.js` with your real key
- Never commit the service role key to git
- Keep the anon key public (it's already in `NEXT_PUBLIC_*` vars)

## If Something Breaks

```bash
# Check logs
pm2 logs tarotfr-web --lines 50
pm2 logs tarotfr-ws --lines 50

# Restart
pm2 restart all

# Full restart
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

## Files to Check

- ✅ `ecosystem.config.js` - Has your service role key?
- ✅ `logs/` directory exists?
- ✅ `server-dist/server/websocket.js` compiled?
- ✅ `.next/` directory has build output?

## More Details

See `VPS_DEPLOYMENT.md` for complete guide with troubleshooting.
