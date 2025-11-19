# Changes Summary - VPS Production Fix

## Overview

Fixed the production environment to properly separate client-side and server-side Supabase operations, resolving 401 and 500 errors.

## Files Created

### 1. `lib/supabaseAdmin.ts`
**Purpose**: Server-side Supabase client using service role key

**Key Features**:
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Only used server-side (API routes + WebSocket)
- Never exposed to browser
- Handles missing key gracefully during build

**Usage**:
```typescript
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Use for all server-side database operations
const { data, error } = await supabaseAdmin.from('users').insert({...});
```

### 2. `ecosystem.config.js`
**Purpose**: PM2 process configuration with environment variables

**Defines Two Apps**:
- `tarotfr-web`: Next.js server (port 3000)
- `tarotfr-ws`: WebSocket server (port 3001)

**Environment Variables**:
- Both apps get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Web app also gets `NEXT_PUBLIC_*` variables for SSR

**Start Command**:
```bash
pm2 start ecosystem.config.js
pm2 save
```

### 3. `VPS_DEPLOYMENT.md`
**Purpose**: Complete deployment guide for VPS

**Includes**:
- Step-by-step deployment instructions
- Environment variables reference
- Troubleshooting guide
- Security checklist
- PM2 commands reference

## Files Modified

### 1. `server/websocket.ts`
**Before**:
```typescript
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
```

**After**:
```typescript
import { supabaseAdmin } from '../lib/supabaseAdmin';
const supabase = supabaseAdmin;
```

**Why**: WebSocket server needs service role key to perform database operations without RLS restrictions.

### 2. API Routes (All files in `app/api/**/*.ts`)

Updated files:
- `app/api/auth/guest/route.ts`
- `app/api/tables/create/route.ts`
- `app/api/tables/list/route.ts`
- `app/api/tables/[id]/route.ts`
- `app/api/tables/[id]/join/route.ts`
- `app/api/distributions/validate/route.ts`
- `app/api/distributions/[hashCode]/route.ts`

**Before**:
```typescript
import { supabase } from '@/lib/supabase';
// or
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, anonKey);
```

**After**:
```typescript
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const supabase = supabaseAdmin; // or use supabaseAdmin directly
```

**Why**: API routes need service role key to create/update database records, which requires bypassing RLS.

### 3. `app/api/auth/guest/route.ts`
**Special Change**: Moved guest creation logic from `lib/auth.ts` directly into the route handler to use `supabaseAdmin`.

**Why**: Guest user creation requires INSERT permission which is only available with service role key.

## Database Migration Applied

### Migration: `optimize_rls_for_service_role`

**Purpose**: Simplify RLS policies now that server-side operations use service role

**Key Changes**:
- Service role bypasses ALL policies (used server-side only)
- Anon key can SELECT from all tables (read-only from browser)
- INSERT/UPDATE/DELETE require service role (API routes only)

**Tables Updated**:
- users
- guest_sessions
- tables
- table_players
- card_distributions
- games

## Architecture Summary

### Client Side (Browser)
```
Browser → lib/supabase.ts (anon key) → Supabase
         ↓
         SELECT queries only (read-only)
```

### Server Side (API Routes)
```
Browser → API Route → lib/supabaseAdmin.ts (service role) → Supabase
                      ↓
                      Full access (bypasses RLS)
```

### Server Side (WebSocket)
```
Browser → WebSocket → server/websocket.ts → lib/supabaseAdmin.ts → Supabase
                                           ↓
                                           Full access (bypasses RLS)
```

## Security Principles

### Service Role Key
- ✅ Used only server-side
- ✅ Never in browser/client code
- ✅ Never committed to git
- ✅ Set in `ecosystem.config.js` (with placeholder in repo)
- ✅ Bypasses RLS for trusted operations

### Anon Key
- ✅ Can be public (already in NEXT_PUBLIC_* vars)
- ✅ Used in browser for read-only operations
- ✅ Respects RLS policies
- ✅ Cannot write to database directly

## Testing Checklist

After deploying these changes:

### 1. Guest User Creation
```bash
curl -X POST http://localhost:3000/api/auth/guest
```
Expected: 200 with user object

### 2. Table Creation
```bash
curl -X POST http://localhost:3000/api/tables/create
```
Expected: 200 with table and distribution

### 3. Table Listing
```bash
curl http://localhost:3000/api/tables/list
```
Expected: 200 with tables array

### 4. WebSocket Connection
From browser console:
```javascript
const ws = new WebSocket('wss://ws.tarotfr.com');
ws.onopen = () => console.log('Connected');
```
Expected: "Connected" message

### 5. PM2 Status
```bash
pm2 list
```
Expected: Both apps online with 0 restarts

## Rollback Plan

If issues occur, rollback steps:

1. Stop PM2 processes:
   ```bash
   pm2 delete all
   ```

2. Checkout previous version:
   ```bash
   git checkout HEAD~1
   ```

3. Rebuild:
   ```bash
   npm install
   npm run build
   npx tsc server/websocket.ts --module commonjs --target es2019 --outDir server-dist
   ```

4. Start with old method:
   ```bash
   SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." pm2 start ...
   ```

## Performance Notes

### Build Time
- Build succeeds with placeholder service role key
- Warning messages are expected and safe
- Actual key only needed at runtime

### Runtime
- No performance impact from using service role
- Service role client created once at module load
- No additional latency vs anon key

## Next Steps

1. Deploy to VPS following `VPS_DEPLOYMENT.md`
2. Replace `YOUR_SERVICE_ROLE_KEY_HERE` in `ecosystem.config.js`
3. Test all endpoints
4. Monitor logs for first 24 hours
5. Update Netlify to trigger frontend rebuild (no code changes needed)

## Questions?

Refer to `VPS_DEPLOYMENT.md` for detailed deployment steps and troubleshooting.
