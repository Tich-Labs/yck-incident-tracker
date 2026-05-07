# YCK Incident Tracker - Local Setup Summary

## Current Status ✅
- **Running locally**: http://localhost:5174/ (Vite dev server)
- **Node.js**: v22.22.2 (required for Vite 7)
- **Database**: Supabase (free tier) - needs configuration
- **Frontend**: Runs locally, ready for Supabase connection

## What Was Done
1. **Extracted** code from Hercules export (tar.gz + database snapshot)
2. **Replaced** Convex/ Hercules packages with Supabase
3. **Created** Supabase client (`src/lib/supabase.ts`)
4. **Created** Supabase hooks (`src/hooks/use-supabase-query.ts`)
5. **Created** Auth components (`src/components/auth-components.tsx`)
6. **Updated** Vite config (removed Hercules plugin)
7. **Fixed** all Convex imports in 15+ files
8. **Server running** on Node 22 + Vite 7

## Next Steps (Free Tier)
1. **Sign up** at [supabase.com](https://supabase.com) (no credit card)
2. **Create project** "yck-incident-tracker"
3. **Copy credentials** from Project Settings → API:
   - `Project URL` (e.g., `https://xyz.supabase.co`)
   - `anon/public` key
4. **Update** `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. **Import data** from `/db_export/` folder to Supabase tables
6. **Push to GitHub** and deploy frontend to Vercel/Netlify (free)

## Database Tables Needed
- `incidents` (from `db_export/incidents/`)
- `users` (from `db_export/users/`)
- `referralServices` (from `db_export/referralServices/`)
- `auditLog` (from `db_export/auditLog/`)
- `offlineSubmissions` (from `db_export/offlineSubmissions/`)

## For Hackathon (Agents Assemble)
- Add FHIR schema mapping (incidents → `Observation`, services → `Location`)
- Build AI referral matching (Supabase Edge Functions + OpenAI)
- Demo: Offline PWA → Localhost → Supabase → AI referral

## Files Modified/Created
- `src/lib/supabase.ts` (new)
- `src/hooks/use-supabase-query.ts` (new)
- `src/components/auth-components.tsx` (new)
- `src/components/providers/supabase.tsx` (new)
- `vite.config.ts` (updated)
- `package.json` (updated)
- `.env.local` (created, needs real credentials)
